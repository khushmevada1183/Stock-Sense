const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stockApiService = require('./services/stockApi');
const indianApiRoutes = require('./routes/indianApiRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const apiKeyManager = require('./services/apiKeyManager');

// Load environment variables if .env exists
try {
  require('dotenv').config();
} catch (err) {
  console.log('No .env file found, using default values');
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 5005; // Changed default to 5005

// Log port value for debugging
console.log(`Server configured to use port: ${PORT}`);

// API key from environment variable only
const STOCK_API_KEY = process.env.STOCK_API_KEY || '';

// Apply security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development - enable in production
  crossOriginEmbedderPolicy: false // Allow embedding in iframes for development
}));

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 60000), // 1 minute by default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // 100 requests per minute by default
  standardHeaders: true,
  legacyHeaders: false,
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

// Register API routes
app.use('/api/keys', apiKeyRoutes);

// Create an API client function that uses request-specific headers
// instead of a global Axios instance
function createApiClient() {
  return {
    get: async (url, options = {}) => {
      try {
        const response = await axios.get(`https://stock.indianapi.in${url}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': STOCK_API_KEY,
            ...(options.headers || {})
          },
          timeout: 10000 // 10 second timeout
        });
        return response;
      } catch (error) {
        console.error(`API request failed: ${url}`, error.message);
        throw error;
      }
    }
  };
}

// Function to validate API connection
async function validateApiConnection() {
  try {
    // Create a test client with the correct header configuration
    const apiClient = createApiClient();

    // Try the /stock endpoint with a sample name
    try {
      const stockResponse = await apiClient.get('/stock', {
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
    }

    // Try the /trending endpoint
    try {
      const trendingResponse = await apiClient.get('/trending');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json(createApiResponse('success', {
    status: 'UP',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  }));
});

// Config endpoint - returns masked API key for display purposes
app.get('/api/config', (req, res) => {
  // Only expose masked version of the API key for security
  const apiKey = STOCK_API_KEY;
  const maskedKey = `sk-live-${'*'.repeat(apiKey.length - 15)}${apiKey.substring(apiKey.length - 4)}`;
  
  res.status(200).json(createApiResponse('success', {
    apiKey: maskedKey,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }));
});

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
    } catch (apiError) {
      console.error(`Error calling external API for ${cleanSymbol}:`, apiError.message);
      
      // Fall back to our service if direct API call fails
      try {
        const stock = await stockApiService.getStockBySymbol(cleanSymbol);
    
    if (!stock) {
          console.log(`No stock data found for ${cleanSymbol}`);
          return res.status(404).json(createApiResponse('error', null, `Stock ${cleanSymbol} not found`));
    }
    
        // Log successful response
        console.log(`Successfully retrieved data for ${cleanSymbol} from service`);
        
        // Ensure we return data in a consistent format
    res.json(createApiResponse('success', stock));
      } catch (serviceError) {
        console.error(`Service fallback also failed for ${cleanSymbol}:`, serviceError.message);
        return res.status(500).json(createApiResponse('error', null, `Failed to fetch stock data for ${cleanSymbol}`));
      }
    }
  } catch (error) {
    console.error(`Error fetching stock data for ${req.params.symbol}:`, error.message);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json(createApiResponse('error', null, 'Internal server error'));
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