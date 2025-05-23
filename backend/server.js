const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const stockApiService = require('./services/stockApi');
const indianApiRoutes = require('./routes/indianApiRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const apiKeyManager = require('./services/apiKeyManager');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Configure trust proxy properly for Render and other cloud environments
// Specify trusted proxies rather than trusting all proxies
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Log port value for debugging
console.log(`Server configured to use port: ${PORT}`);

// Get API key information from apiKeyManager
const availableKeys = apiKeyManager.getAllKeys();
const availableKeyCount = availableKeys.filter(k => k.isAvailable && k.monthlyUsage < 500).length;

// Log API key status
if (availableKeyCount > 0) {
  console.log(`✅ Using API key manager with ${availableKeyCount} available keys out of ${availableKeys.length} total keys`);
} else {
  console.log(`⚠️ No available API keys in apiKeyManager. API endpoints may not function correctly.`);
}

// Apply security middleware with CSP adjusted for Render
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'https:', 'wss:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configure CORS with more flexible options for cloud
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Apply rate limiting with proper configuration for proxy environments
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 60000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
  // Use a configuration that works with proxies
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available, otherwise use IP
    return req.headers['x-forwarded-for'] || req.ip;
  },
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes should be registered before the frontend proxy
app.use('/api/keys', apiKeyRoutes);
app.use('/api/indian', indianApiRoutes);

// Proxy to Next.js frontend (must be after API routes)
const FRONTEND_URL = `http://localhost:${process.env.FRONTEND_PORT || 10001}`;
app.use('/', createProxyMiddleware({
  target: FRONTEND_URL,
  changeOrigin: true,
  ws: true, // for Next.js HMR in dev, but good to have
  logLevel: 'debug', // Optional: for more detailed proxy logs
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    if (!res.headersSent) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
    }
    res.end('Proxy Error: Could not connect to the frontend service.');
  }
}));

// Create an API client function that uses request-specific headers
// instead of a global Axios instance
function createApiClient() {
  return {
    get: async (url, options = {}) => {
      try {
        // Get API key from apiKeyManager
        const API_KEY = apiKeyManager.getCurrentKey();
        
        console.log(`Using API key from manager: ${API_KEY.substring(0, 10)}... for request to ${url}`);
        
        const response = await axios.get(`https://stock.indianapi.in${url}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': API_KEY,
            ...(options.headers || {})
          },
          timeout: 10000 // 10 second timeout
        });
        
        // Record successful use
        apiKeyManager.recordSuccessfulUse();
        
        return response;
      } catch (error) {
        console.error(`API request failed: ${url}`, error.message);
        
        // Handle rate limit errors (429) automatically
        if (error.response && error.response.status === 429) {
          console.warn(`Rate limit hit. Marking key as limited.`);
          apiKeyManager.markCurrentKeyRateLimited(1); // 1 second cooldown
        }
        
        // Handle missing API key errors (400)
        if (error.response && error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData === "Missing API key" || 
              (typeof errorData === 'string' && errorData.includes('API key'))) {
            console.warn(`API reported "Missing API key" error. Marking key as invalid.`);
            apiKeyManager.markCurrentKeyRateLimited(60); // 60 second cooldown
          }
        }
        
        // Handle invalid API key (401)
        if (error.response && error.response.status === 401) {
          console.warn(`Invalid API key detected. Marking key as invalid.`);
          apiKeyManager.markCurrentKeyRateLimited(3600); // 1 hour cooldown
        }
        
        throw error;
      }
    }
  };
}

// Function to validate API connection
async function validateApiConnection() {
  try {
    // Use apiKeyManager to get the current API key instead of relying on environment variable
    const API_KEY = apiKeyManager.getCurrentKey();
    
    if (!API_KEY) {
      console.error('No API key available from apiKeyManager');
      return false;
    }
    
    console.log(`Using API key from manager: ${API_KEY.substring(0, 10)}...`);
    
    // Create a test client with API key from apiKeyManager
    const testClient = {
      get: async (url, options = {}) => {
        try {
          const response = await axios.get(`https://stock.indianapi.in${url}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': API_KEY,
              ...(options.headers || {})
            },
            timeout: 10000 // 10 second timeout
          });
          
          // Record successful use of the API key
          apiKeyManager.recordSuccessfulUse();
          
          return response;
        } catch (error) {
          console.error(`API request failed: ${url}`, error.message);
          
          // Handle rate limit errors (429) automatically
          if (error.response && error.response.status === 429) {
            console.warn(`Rate limit hit during validation. Marking key as limited.`);
            apiKeyManager.markCurrentKeyRateLimited(1); // 1 second cooldown
          }
          
          // Handle missing API key errors (400)
          if (error.response && error.response.status === 400) {
            const errorData = error.response.data;
            if (errorData === "Missing API key" || 
                (typeof errorData === 'string' && errorData.includes('API key'))) {
              console.warn(`API reported "Missing API key" error. Marking key as invalid.`);
              apiKeyManager.markCurrentKeyRateLimited(60); // 60 second cooldown
            }
          }
          
          // Handle invalid API key (401)
          if (error.response && error.response.status === 401) {
            console.warn(`Invalid API key detected. Marking key as invalid.`);
            apiKeyManager.markCurrentKeyRateLimited(3600); // 1 hour cooldown
          }
          
          throw error;
        }
      }
    };

    // Try the /stock endpoint with a sample name
    try {
      const stockResponse = await testClient.get('/stock', {
        params: { name: 'Reliance' }
      });
      console.log(`✅ SUCCESS for /stock endpoint: ${stockResponse.status}`);
      return true;
    } catch (stockError) {
      console.log(`❌ FAILED for /stock endpoint: ${stockError.message}`);
      if (stockError.response) {
        console.log(`  Status: ${stockError.response.status}`);
        console.log(`  Data: ${JSON.stringify(stockError.response.data)}`);
      }
      
      // Try with another key if available
      if (apiKeyManager.rotateToNextAvailableKey()) {
        console.log(`Rotating to next key for second validation attempt...`);
      }
    }

    // Try the /trending endpoint
    try {
      const trendingResponse = await testClient.get('/trending');
      console.log(`✅ SUCCESS for /trending endpoint: ${trendingResponse.status}`);
      return true;
    } catch (trendingError) {
      console.log(`❌ FAILED for /trending endpoint: ${trendingError.message}`);
      if (trendingError.response) {
        console.log(`  Status: ${trendingError.response.status}`);
        console.log(`  Data: ${JSON.stringify(trendingError.response.data)}`);
      }
    }

    console.log('❌ All API connection tests failed. Check API key and endpoints.');
    return false;
  } catch (error) {
    console.error('API validation failed:', error.message);
    return false;
  }
}

// Standardized API response format
function createApiResponse(status, data, message) {
  return {
    status,
    data,
    message: message || (status === 'success' ? 'Request successful' : 'Request failed')
  };
}

// Standardized error handler
function handleApiError(res, error, defaultMessage = 'An error occurred') {
  console.error('API Error:', error.message);
  
  const statusCode = error.response?.status || 500;
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  
  return res.status(statusCode).json(createApiResponse('error', null, errorMessage));
}

// API key validation middleware - Update to use apiKeyManager
const validateApiKey = (req, res, next) => {
  const apiKey = apiKeyManager.getCurrentKey();
  if (!apiKey) {
    console.warn('⚠️ No API key available from API key manager');
    return res.status(500).json({ error: 'API key not configured' });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Config endpoint - returns masked API key for display purposes
app.get('/api/config', (req, res) => {
  // Get API key information from apiKeyManager
  const availableKeys = apiKeyManager.getAllKeys();
  const currentKey = apiKeyManager.getCurrentKey();
  const maskedKeys = availableKeys.map(k => {
    return {
      key: `sk-live-${'*'.repeat(8)}${k.key.substring(k.key.length - 4)}`,
      isAvailable: k.isAvailable,
      monthlyUsage: k.monthlyUsage,
      isCurrent: k.key === currentKey
    };
  });
  
  res.status(200).json(createApiResponse('success', {
    keys: maskedKeys,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }));
});

// Apply API key validation to stock endpoints
app.use('/api/stock', validateApiKey);
app.use('/api/trending', validateApiKey);

// API routes for stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const stocksData = await stockApiService.getAllStocks();
    res.json(createApiResponse('success', stocksData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch stocks data');
  }
});

// Stock search endpoint
app.get('/api/stocks/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json(createApiResponse('success', { results: [] }));
    }
    
    const searchResults = await stockApiService.searchStocks(query);
    
    // Ensure we always return a consistent format with a results array
    let results = [];
    
    if (searchResults && searchResults.results && Array.isArray(searchResults.results)) {
      // Process each result to ensure consistent data format
      results = searchResults.results.map(stock => {
        // Normalize price field to ensure it's always accessible as latestPrice
        let latestPrice = null;
        
        if (stock.latestPrice) {
          latestPrice = stock.latestPrice;
        } else if (stock.price) {
          latestPrice = stock.price;
        } else if (stock.last_price) {
          latestPrice = stock.last_price;
        } else if (stock.current_price) {
          latestPrice = stock.current_price;
        } else if (stock.fullData && stock.fullData.currentPrice) {
          // Extract from nested structure if available
          latestPrice = stock.fullData.currentPrice.BSE || stock.fullData.currentPrice.NSE;
        }
        
        return {
          ...stock,
          latestPrice,
          // Ensure these fields are always present
          symbol: stock.symbol || stock.ticker || '',
          companyName: stock.companyName || stock.name || stock.company_name || '',
          changePercent: stock.changePercent || stock.percent_change || 0
        };
      });
    }
    
    res.json(createApiResponse('success', { results }));
  } catch (error) {
    console.error(`Error in /api/stocks/search:`, error.message);
    return res.status(500).json(createApiResponse(
      'error',
      null,
      'Failed to search for stocks. Please try again later.'
    ));
  }
});

app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`Fetching stock data for symbol: ${symbol} (from /api/stock endpoint)`);
    
    // Clean the symbol by removing any exchange prefixes
    const cleanSymbol = symbol.replace(/^(NSE:|BSE:)/, '');
    
    // Try to get stock details directly from the external API
    const API_KEY = apiKeyManager.getCurrentKey();
    
    try {
      // Make direct API call to get the most up-to-date data
      const response = await axios.get('https://stock.indianapi.in/stock', {
        params: { name: cleanSymbol },
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY
        }
      });
      
      // Record successful use
      apiKeyManager.recordSuccessfulUse();
      
      // Process the API response
      let stockData = response.data;
      
      // Add a symbol field if it doesn't exist
      if (stockData && !stockData.symbol) {
        stockData.symbol = cleanSymbol;
      }
      
      // Extract price information for easy access
      if (stockData && stockData.currentPrice) {
        const bsePrice = stockData.currentPrice.BSE;
        const nsePrice = stockData.currentPrice.NSE;
        
        // Add latestPrice field for consistency with frontend expectations
        stockData.latestPrice = bsePrice || nsePrice || 0;
        
        console.log(`Price data for ${cleanSymbol}: BSE=${bsePrice}, NSE=${nsePrice}`);
      } else if (stockData && stockData.stockTechnicalData && stockData.stockTechnicalData.length > 0) {
        const technicalPrice = stockData.stockTechnicalData[0].bsePrice || stockData.stockTechnicalData[0].nsePrice;
        stockData.latestPrice = technicalPrice;
        console.log(`Technical price data for ${cleanSymbol}: ${technicalPrice}`);
      }
      
      // Return the data
      res.json(createApiResponse('success', stockData));
    } catch (error) {
      // Handle API errors with proper key rotation
      if (error.response) {
        // Handle rate limits (429)
        if (error.response.status === 429) {
          console.warn('Rate limit exceeded for current API key');
          apiKeyManager.markCurrentKeyRateLimited(1);
        }
        
        // Handle missing API key errors (400)
        if (error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData === "Missing API key" || 
              (typeof errorData === 'string' && errorData.includes('API key'))) {
            console.warn('API key error detected. Marking as unavailable.');
            apiKeyManager.markCurrentKeyRateLimited(60);
          }
    }
    
        // Handle invalid API keys (401)
        if (error.response.status === 401) {
          console.warn('Invalid API key. Marking as unavailable.');
          apiKeyManager.markCurrentKeyRateLimited(3600);
        }
      }
      
      console.error(`Error fetching stock ${cleanSymbol} from API:`, error.message);
        
      // Try our service function as fallback (which has its own caching)
      try {
        const stockData = await stockApiService.getStockBySymbol(cleanSymbol);
        return res.json(createApiResponse('success', stockData));
      } catch (serviceError) {
        return handleApiError(res, serviceError, `Failed to fetch stock data for ${cleanSymbol}`);
      }
    }
  } catch (error) {
    handleApiError(res, error, `Failed to fetch stock data for ${req.params.symbol}`);
  }
});

// Historical data endpoint
app.get('/api/stocks/:symbol/historical', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1yr', filter = 'price' } = req.query;
    
    const historicalData = await stockApiService.getHistoricalData(symbol, period, filter);
    
    res.json(createApiResponse('success', historicalData));
  } catch (error) {
    handleApiError(res, error, `Failed to fetch historical data for ${req.params.symbol}`);
  }
});

// IPO data endpoint
app.get('/api/ipo', async (req, res) => {
  try {
    const ipoData = await stockApiService.getIpoData();
    
    res.json(createApiResponse('success', ipoData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch IPO data');
  }
});

// News endpoint
app.get('/api/news', async (req, res) => {
  try {
    const newsData = await stockApiService.getMarketNews();
    
    res.json(createApiResponse('success', newsData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch news data');
  }
});

// 52-week high/low data endpoint
app.get('/api/52-week-high-low', async (req, res) => {
  try {
    const highLowData = await stockApiService.get52WeekHighLow();
    
    res.json(createApiResponse('success', highLowData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch 52-week high/low data');
  }
});

// Most active stocks BSE endpoint
app.get('/api/most-active/bse', async (req, res) => {
  try {
    const mostActiveData = await stockApiService.getBSEMostActive();
    
    res.json(createApiResponse('success', mostActiveData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch BSE most active stocks');
  }
});

// Most active stocks NSE endpoint
app.get('/api/most-active/nse', async (req, res) => {
  try {
    const mostActiveData = await stockApiService.getNSEMostActive();
    
    res.json(createApiResponse('success', mostActiveData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch NSE most active stocks');
  }
});

// Mutual funds endpoint
app.get('/api/mutual-funds', async (req, res) => {
  try {
    const mutualFundsData = await stockApiService.getMutualFunds();
    
    res.json(createApiResponse('success', mutualFundsData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch mutual funds data');
  }
});

// Mutual funds search endpoint
app.get('/api/mutual-funds/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json(createApiResponse('error', null, 'Search query is required'));
    }
    
    const searchResults = await stockApiService.searchMutualFunds(query);
    
    res.json(createApiResponse('success', searchResults));
  } catch (error) {
    handleApiError(res, error, 'Failed to search mutual funds');
  }
});

// Price shockers endpoint
app.get('/api/price-shockers', async (req, res) => {
  try {
    const priceShockersData = await stockApiService.getPriceShockers();
    
    res.json(createApiResponse('success', priceShockersData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch price shockers data');
  }
});

// Commodities endpoint
app.get('/api/commodities', async (req, res) => {
  try {
    const commoditiesData = await stockApiService.getCommodities();
    
    res.json(createApiResponse('success', commoditiesData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch commodities data');
  }
});

// Industry search endpoint
app.get('/api/industry/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json(createApiResponse('error', null, 'Search query is required'));
    }
    
    const searchResults = await stockApiService.industrySearch(query);
    
    res.json(createApiResponse('success', searchResults));
  } catch (error) {
    handleApiError(res, error, 'Failed to search industries');
  }
});

// Stock target price endpoint
app.get('/api/stocks/:symbol/target-price', async (req, res) => {
  try {
    const { symbol } = req.params;
    const targetPriceData = await stockApiService.getStockTargetPrice(symbol);
    
    res.json(createApiResponse('success', targetPriceData));
  } catch (error) {
    handleApiError(res, error, `Failed to fetch stock target price for ${req.params.symbol}`);
  }
});

// Historical stats endpoint
app.get('/api/stocks/:symbol/historical-stats', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { stats } = req.query;
    
    if (!stats) {
      return res.status(400).json(createApiResponse('error', null, 'Stats parameter is required'));
    }
    
    const historicalStatsData = await stockApiService.getHistoricalStats(symbol, stats);
    
    res.json(createApiResponse('success', historicalStatsData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch historical stats');
  }
});

// Company logo endpoint
app.get('/api/stocks/:symbol/logo', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Try to get company logo from the API
    try {
      const logoData = await stockApiService.getCompanyLogo(symbol);
      
      res.json(createApiResponse('success', logoData));
    } catch (logoError) {
      console.error(`Error fetching logo for ${symbol}:`, logoError.message);
      
      // Fallback to using a generic logo service based on the symbol
      const fallbackLogoUrl = `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
      
      res.json(createApiResponse('success', {
          symbol: symbol,
          url: fallbackLogoUrl,
          source: 'fallback'
      }));
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch company logo');
  }
});

// Simplified auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // TODO: Replace with real authentication service
  // This is a placeholder for demonstration purposes only
  // In production, implement proper authentication with secure password handling
  if (email && password) {
    res.status(501).json(createApiResponse('error', null, 'Authentication service not implemented yet. This is a placeholder endpoint.'));
  } else {
    res.status(400).json(createApiResponse('error', null, 'Missing required fields: email, password'));
  }
});

// Portfolio management endpoints
app.post('/api/portfolio', (req, res) => {
  try {
    const { userId, portfolioName, stocks } = req.body;
    
    if (!userId || !portfolioName || !stocks) {
      return res.status(400).json(createApiResponse('error', null, 'Missing required fields: userId, portfolioName, stocks'));
    }
    
    // TODO: Implement real database storage
    // This is a placeholder that should be replaced with actual database operations
    res.status(501).json(createApiResponse('error', null, 'Portfolio creation not implemented yet. This is a placeholder endpoint.'));
  } catch (error) {
    handleApiError(res, error, 'Failed to create portfolio');
  }
});

app.get('/api/portfolio/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // TODO: Implement real database retrieval
    // This is a placeholder that should be replaced with actual database operations
    res.status(501).json(createApiResponse('error', null, 'Portfolio retrieval not implemented yet. This is a placeholder endpoint.'));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch portfolios');
  }
});

app.put('/api/portfolio/:portfolioId', (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { portfolioName, stocks } = req.body;
    
    if (!portfolioName || !stocks) {
      return res.status(400).json(createApiResponse('error', null, 'Missing required fields: portfolioName, stocks'));
    }
    
    // TODO: Implement real database update
    // This is a placeholder that should be replaced with actual database operations
    res.status(501).json(createApiResponse('error', null, 'Portfolio update not implemented yet. This is a placeholder endpoint.'));
  } catch (error) {
    handleApiError(res, error, `Failed to update portfolio ${req.params.portfolioId}`);
  }
});

app.delete('/api/portfolio/:portfolioId', (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    // TODO: Implement real database deletion
    // This is a placeholder that should be replaced with actual database operations
    res.status(501).json(createApiResponse('error', null, 'Portfolio deletion not implemented yet. This is a placeholder endpoint.'));
  } catch (error) {
    handleApiError(res, error, `Failed to delete portfolio ${req.params.portfolioId}`);
  }
});

app.get('/api/portfolio/:portfolioId/performance', (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    // TODO: Implement real portfolio performance calculation
    // This is a placeholder that should be replaced with actual calculations based on real data
    res.status(501).json(createApiResponse('error', null, 'Portfolio performance calculation not implemented yet. This is a placeholder endpoint.'));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch portfolio performance');
  }
});

// Add a new route that matches the API documentation format
app.get('/api/stock/:name', async (req, res) => {
  try {
    const { name } = req.params;
    // Call the stockApiService with the name parameter
    const stock = await stockApiService.getStockBySymbol(name);
    
    if (!stock) {
      return res.status(404).json(createApiResponse('error', null, `Stock ${name} not found`));
    }
    
    res.json(createApiResponse('success', stock));
  } catch (error) {
    handleApiError(res, error, `Failed to fetch stock data for ${req.params.name}`);
  }
});

// Market indices endpoint
app.get('/api/market-indices', async (req, res) => {
  try {
    const indicesData = await stockApiService.getMarketIndices();
    
    res.json(createApiResponse('success', indicesData));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch market indices data');
  }
});

// Featured stocks endpoint
app.get('/api/featured-stocks', async (req, res) => {
  try {
    const featuredStocks = await stockApiService.getFeaturedStocks();
    
    res.json(createApiResponse('success', featuredStocks));
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch featured stocks data');
  }
});

// Top gainers endpoint
app.get('/api/stocks/top-gainers', async (req, res) => {
  try {
    // Get data from the trending endpoint
    const trendingData = await stockApiService.getAllStocks();
    
    if (trendingData && trendingData.top_gainers) {
      // Map the top gainers to the format expected by the frontend
      const formattedGainers = trendingData.top_gainers.map(stock => ({
        symbol: stock.symbol || stock.name,
        companyName: stock.company_name || stock.name,
        price: stock.current_price || 0,
        change: stock.change || 0,
        changePercent: stock.percent_change || 0,
        volume: stock.volume || 0
      }));
      
      res.json(createApiResponse('success', formattedGainers));
    } else {
      res.json(createApiResponse('success', []));
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch top gainers');
  }
});

// Top losers endpoint
app.get('/api/stocks/top-losers', async (req, res) => {
  try {
    // Get data from the trending endpoint
    const trendingData = await stockApiService.getAllStocks();
    
    if (trendingData && trendingData.top_losers) {
      // Map the top losers to the format expected by the frontend
      const formattedLosers = trendingData.top_losers.map(stock => ({
        symbol: stock.symbol || stock.name,
        companyName: stock.company_name || stock.name,
        price: stock.current_price || 0,
        change: stock.change || 0,
        changePercent: stock.percent_change || 0,
        volume: stock.volume || 0
      }));
      
      res.json(createApiResponse('success', formattedLosers));
    } else {
      res.json(createApiResponse('success', []));
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch top losers');
  }
});

// Indian API routes
app.use('/api/indian', indianApiRoutes);

// Simple root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Stock Sense API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      stocks: '/api/stocks',
      search: '/api/stocks/search',
      stockDetails: '/api/stock/:symbol',
      ipo: '/api/ipo',
      news: '/api/news'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
  
  // Validate API connection on startup
  validateApiConnection().then(isValid => {
    if (isValid) {
    console.log('✅ API connection validated successfully');
  } else {
      console.warn('⚠️ API connection validation failed. Some features may not work correctly.');
  }
}); 
});

// Export the app for testing
module.exports = app;