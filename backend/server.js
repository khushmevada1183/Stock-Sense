const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const stockApiService = require('./services/stockApi');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to validate API connection
async function validateApiConnection() {
  try {
    // Create a test client with the correct header configuration
    const testClient = axios.create({
      baseURL: 'https://stock.indianapi.in',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'sk-live-K4wtBGXesvkus7wdkmT3uQ1g9qnlaLuN8TqQoXht'
      }
    });

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Config endpoint - returns masked API key for display purposes
app.get('/api/config', (req, res) => {
  // Only expose masked version of the API key for security
  const apiKey = 'sk-live-K4wtBGXesvkus7wdkmT3uQ1g9qnlaLuN8TqQoXht';
  const maskedKey = `sk-live-${'*'.repeat(apiKey.length - 15)}${apiKey.substring(apiKey.length - 4)}`;
  
  res.status(200).json({
    apiKey: maskedKey,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes for stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const stocksData = await stockApiService.getAllStocks();
    res.json({
      status: 'success',
      data: stocksData
    });
  } catch (error) {
    console.error('Error in /api/stocks:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stocks data',
      error: error.message
    });
  }
});

// Stock search endpoint
app.get('/api/stocks/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json({
        status: 'success',
        data: { results: [] }
      });
    }
    
    const searchResults = await stockApiService.searchStocks(query);
    
    // Ensure we always return a consistent format with a results array
    res.json({
      status: 'success',
      data: searchResults && searchResults.results ? 
        { results: searchResults.results } : 
        { results: [] }
    });
  } catch (error) {
    console.error(`Error in /api/stocks/search:`, error.message);
    
    // For popular stocks, provide fallback results even when API fails
    if (['ITC', 'RELIANCE', 'TCS', 'HDFC', 'HDFCBANK', 'INFY', 'SBIN'].includes(query.toUpperCase())) {
      const fallbackResult = {
        symbol: query.toUpperCase(),
        companyName: getMockCompanyName(query.toUpperCase()),
        latestPrice: getMockPrice(query.toUpperCase()),
        change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        changePercent: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        sector: getMockSector(query.toUpperCase())
      };
      
      return res.json({
        status: 'success',
        data: { results: [fallbackResult] },
        source: 'fallback'
      });
    }
    
    // Provide empty results as fallback
    res.json({
      status: 'success',
      data: { results: [] },
      source: 'fallback'
    });
  }
});

// Helper functions for mock data
function getMockCompanyName(symbol) {
  const mockNames = {
    'ITC': 'ITC Ltd',
    'RELIANCE': 'Reliance Industries Ltd',
    'TCS': 'Tata Consultancy Services Ltd',
    'HDFC': 'HDFC Bank Ltd',
    'HDFCBANK': 'HDFC Bank Ltd',
    'INFY': 'Infosys Ltd',
    'SBIN': 'State Bank of India'
  };
  
  return mockNames[symbol] || `${symbol} Corporation`;
}

function getMockPrice(symbol) {
  const mockPrices = {
    'ITC': 425.8,
    'RELIANCE': 2842.4,
    'TCS': 3567.8,
    'HDFC': 1625.6,
    'HDFCBANK': 1625.6,
    'INFY': 1452.8,
    'SBIN': 754.2
  };
  
  return mockPrices[symbol] || parseFloat((Math.random() * 1000 + 500).toFixed(2));
}

function getMockSector(symbol) {
  const mockSectors = {
    'ITC': 'FMCG',
    'RELIANCE': 'Energy',
    'TCS': 'Technology',
    'HDFC': 'Financial Services',
    'HDFCBANK': 'Financial Services',
    'INFY': 'Technology',
    'SBIN': 'Financial Services'
  };
  
  return mockSectors[symbol] || 'Miscellaneous';
}

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await stockApiService.getStockBySymbol(symbol);
    
    res.json({
      status: 'success',
      data: stock
    });
  } catch (error) {
    console.error(`Error in /api/stocks/${req.params.symbol}:`, error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Stock not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stock data',
      error: error.message
    });
  }
});

// Historical data endpoint
app.get('/api/stocks/:symbol/historical', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1yr', filter = 'price' } = req.query;
    
    const historicalData = await stockApiService.getHistoricalData(symbol, period, filter);
    
    res.json({
      status: 'success',
      data: historicalData
    });
  } catch (error) {
    console.error(`Error in /api/stocks/${req.params.symbol}/historical:`, error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Stock not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch historical data',
      error: error.message
    });
  }
});

// IPO data endpoint
app.get('/api/ipo', async (req, res) => {
  try {
    const ipoData = await stockApiService.getIpoData();
    
    res.json({
      status: 'success',
      data: ipoData
    });
  } catch (error) {
    console.error('Error in /api/ipo:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch IPO data',
      error: error.message
    });
  }
});

// News endpoint
app.get('/api/news', async (req, res) => {
  try {
    const newsData = await stockApiService.getMarketNews();
    
    res.json({
      status: 'success',
      data: newsData
    });
  } catch (error) {
    console.error('Error in /api/news:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news data',
      error: error.message
    });
  }
});

// 52-week high/low data endpoint
app.get('/api/52-week-high-low', async (req, res) => {
  try {
    const highLowData = await stockApiService.get52WeekHighLow();
    
    res.json({
      status: 'success',
      data: highLowData
    });
  } catch (error) {
    console.error('Error in /api/52-week-high-low:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch 52-week high/low data',
      error: error.message
    });
  }
});

// Most active stocks BSE endpoint
app.get('/api/most-active/bse', async (req, res) => {
  try {
    const mostActiveData = await stockApiService.getBSEMostActive();
    
    res.json({
      status: 'success',
      data: mostActiveData
    });
  } catch (error) {
    console.error('Error in /api/most-active/bse:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch BSE most active stocks',
      error: error.message
    });
  }
});

// Most active stocks NSE endpoint
app.get('/api/most-active/nse', async (req, res) => {
  try {
    const mostActiveData = await stockApiService.getNSEMostActive();
    
    res.json({
      status: 'success',
      data: mostActiveData
    });
  } catch (error) {
    console.error('Error in /api/most-active/nse:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch NSE most active stocks',
      error: error.message
    });
  }
});

// Mutual funds endpoint
app.get('/api/mutual-funds', async (req, res) => {
  try {
    const mutualFundsData = await stockApiService.getMutualFunds();
    
    res.json({
      status: 'success',
      data: mutualFundsData
    });
  } catch (error) {
    console.error('Error in /api/mutual-funds:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mutual funds data',
      error: error.message
    });
  }
});

// Mutual funds search endpoint
app.get('/api/mutual-funds/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    const searchResults = await stockApiService.searchMutualFunds(query);
    
    res.json({
      status: 'success',
      data: searchResults
    });
  } catch (error) {
    console.error('Error in /api/mutual-funds/search:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to search mutual funds',
      error: error.message
    });
  }
});

// Price shockers endpoint
app.get('/api/price-shockers', async (req, res) => {
  try {
    const priceShockersData = await stockApiService.getPriceShockers();
    
    res.json({
      status: 'success',
      data: priceShockersData
    });
  } catch (error) {
    console.error('Error in /api/price-shockers:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch price shockers data',
      error: error.message
    });
  }
});

// Commodities endpoint
app.get('/api/commodities', async (req, res) => {
  try {
    const commoditiesData = await stockApiService.getCommodities();
    
    res.json({
      status: 'success',
      data: commoditiesData
    });
  } catch (error) {
    console.error('Error in /api/commodities:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch commodities data',
      error: error.message
    });
  }
});

// Industry search endpoint
app.get('/api/industry/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    const searchResults = await stockApiService.industrySearch(query);
    
    res.json({
      status: 'success',
      data: searchResults
    });
  } catch (error) {
    console.error('Error in /api/industry/search:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to search industries',
      error: error.message
    });
  }
});

// Stock target price endpoint
app.get('/api/stocks/:symbol/target-price', async (req, res) => {
  try {
    const { symbol } = req.params;
    const targetPriceData = await stockApiService.getStockTargetPrice(symbol);
    
    res.json({
      status: 'success',
      data: targetPriceData
    });
  } catch (error) {
    console.error(`Error in /api/stocks/${req.params.symbol}/target-price:`, error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Stock target price not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stock target price',
      error: error.message
    });
  }
});

// Historical stats endpoint
app.get('/api/stocks/:symbol/historical-stats', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { stats } = req.query;
    
    if (!stats) {
      return res.status(400).json({
        status: 'error',
        message: 'Stats parameter is required'
      });
    }
    
    const historicalStatsData = await stockApiService.getHistoricalStats(symbol, stats);
    
    res.json({
      status: 'success',
      data: historicalStatsData
    });
  } catch (error) {
    console.error(`Error in /api/stocks/${req.params.symbol}/historical-stats:`, error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Historical stats not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch historical stats',
      error: error.message
    });
  }
});

// Company logo endpoint
app.get('/api/stocks/:symbol/logo', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Try to get company logo from the API
    try {
      const logoData = await stockApiService.getCompanyLogo(symbol);
      
      res.json({
        status: 'success',
        data: logoData
      });
    } catch (logoError) {
      console.error(`Error fetching logo for ${symbol}:`, logoError.message);
      
      // Fallback to using a generic logo service based on the symbol
      const fallbackLogoUrl = `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
      
      res.json({
        status: 'success',
        data: {
          symbol: symbol,
          url: fallbackLogoUrl,
          source: 'fallback'
        }
      });
    }
  } catch (error) {
    console.error(`Error in /api/stocks/${req.params.symbol}/logo:`, error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch company logo',
      error: error.message
    });
  }
});

// Simplified auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'user@example.com' && password === 'password123') {
    res.json({
      status: 'success',
      data: {
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'Regular User'
        },
        token: 'mock-jwt-token-for-development'
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }
});

// Portfolio management endpoints
app.post('/api/portfolio', (req, res) => {
  try {
    const { userId, portfolioName, stocks } = req.body;
    
    if (!userId || !portfolioName || !stocks) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, portfolioName, stocks'
      });
    }
    
    // In a real app, this would be saved to a database
    // For now, we'll just echo back the data
    res.json({
      status: 'success',
      data: {
        id: Math.floor(Math.random() * 1000), // Mock ID
        userId,
        portfolioName,
        stocks,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating portfolio:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
});

app.get('/api/portfolio/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock portfolio data for demonstration
    const mockPortfolios = [
      {
        id: 1,
        userId: userId,
        portfolioName: 'My Long Term Investments',
        stocks: [
          { symbol: 'RELIANCE', quantity: 10, buyPrice: 2500.50, buyDate: '2023-04-15' },
          { symbol: 'INFY', quantity: 20, buyPrice: 1456.75, buyDate: '2023-05-22' },
          { symbol: 'TCS', quantity: 5, buyPrice: 3450.00, buyDate: '2023-03-10' }
        ],
        createdAt: '2023-01-15T10:30:00Z'
      },
      {
        id: 2,
        userId: userId,
        portfolioName: 'High Growth Stocks',
        stocks: [
          { symbol: 'BAJFINANCE', quantity: 8, buyPrice: 6780.25, buyDate: '2023-06-05' },
          { symbol: 'HDFCBANK', quantity: 15, buyPrice: 1675.50, buyDate: '2023-07-12' }
        ],
        createdAt: '2023-02-20T14:15:00Z'
      }
    ];
    
    res.json({
      status: 'success',
      data: mockPortfolios
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
});

app.put('/api/portfolio/:portfolioId', (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { portfolioName, stocks } = req.body;
    
    if (!portfolioName || !stocks) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: portfolioName, stocks'
      });
    }
    
    // In a real app, this would update a database record
    res.json({
      status: 'success',
      data: {
        id: parseInt(portfolioId),
        portfolioName,
        stocks,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Error updating portfolio ${req.params.portfolioId}:`, error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
});

app.delete('/api/portfolio/:portfolioId', (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    // In a real app, this would delete from a database
    res.json({
      status: 'success',
      data: {
        message: `Portfolio ${portfolioId} has been deleted successfully`
      }
    });
  } catch (error) {
    console.error(`Error deleting portfolio ${req.params.portfolioId}:`, error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
});

app.get('/api/portfolio/:portfolioId/performance', (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    // Mock performance data for demonstration
    const mockPerformance = {
      portfolioId: parseInt(portfolioId),
      totalInvestment: 100000,
      currentValue: 125000,
      overallReturn: 25.0,
      dailyChange: 1.2,
      annualizedReturn: 18.5,
      sectorAllocation: [
        { sector: 'Technology', percentage: 35 },
        { sector: 'Banking', percentage: 25 },
        { sector: 'Energy', percentage: 20 },
        { sector: 'Pharmaceuticals', percentage: 15 },
        { sector: 'Others', percentage: 5 }
      ],
      historicalPerformance: [
        { date: '2023-01-01', value: 100000 },
        { date: '2023-02-01', value: 102000 },
        { date: '2023-03-01', value: 105000 },
        { date: '2023-04-01', value: 103000 },
        { date: '2023-05-01', value: 108000 },
        { date: '2023-06-01', value: 115000 },
        { date: '2023-07-01', value: 120000 },
        { date: '2023-08-01', value: 125000 }
      ]
    };
    
    res.json({
      status: 'success',
      data: mockPerformance
    });
  } catch (error) {
    console.error(`Error fetching portfolio performance for ${req.params.portfolioId}:`, error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch portfolio performance',
      error: error.message
    });
  }
});

// Add a new route that matches the API documentation format
app.get('/api/stock/:name', async (req, res) => {
  try {
    const { name } = req.params;
    // Call the stockApiService with the name parameter
    const stock = await stockApiService.getStockBySymbol(name);
    
    res.json({
      status: 'success',
      data: stock
    });
  } catch (error) {
    console.error(`Error in /api/stock/${req.params.name}:`, error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        status: 'error',
        message: 'Stock not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stock data',
      error: error.message
    });
  }
});

// Market indices endpoint
app.get('/api/market-indices', async (req, res) => {
  try {
    const indicesData = await stockApiService.getMarketIndices();
    
    res.json({
      status: 'success',
      data: indicesData
    });
  } catch (error) {
    console.error('Error in /api/market-indices:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch market indices data',
      error: error.message
    });
  }
});

// Featured stocks endpoint
app.get('/api/featured-stocks', async (req, res) => {
  try {
    const featuredStocks = await stockApiService.getFeaturedStocks();
    
    res.json({
      status: 'success',
      data: featuredStocks
    });
  } catch (error) {
    console.error('Error in /api/featured-stocks:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch featured stocks data',
      error: error.message
    });
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
      
      res.json(formattedGainers);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error in /api/stocks/top-gainers:', error.message);
    res.status(500).json([]);
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
      
      res.json(formattedLosers);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error in /api/stocks/top-losers:', error.message);
    res.status(500).json([]);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running in development mode on port ${PORT}`);
  
  // Validate API connection on startup
  const isApiValid = await validateApiConnection();
  if (isApiValid) {
    console.log('✅ API connection validated successfully');
  } else {
    console.log('⚠️ Using mock data due to API connection issues');
  }
}); 