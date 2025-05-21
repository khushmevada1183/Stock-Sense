import express from 'express';
import { authenticate as authMiddleware } from '../middleware/auth.middleware';
const stockApiService = require('../../services/stockApi');

const router = express.Router();

// General market endpoints
// Get featured stocks
router.get('/featured-stocks', async (req, res) => {
  try {
    const stocks = await stockApiService.getFeaturedStocks();
    res.json({
      status: 'success',
      data: stocks
    });
  } catch (error) {
    console.error('Error fetching featured stocks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch featured stocks'
    });
  }
});

// Get market overview
router.get('/market-overview', async (req, res) => {
  try {
    const indices = await stockApiService.getMarketIndices();
    res.json({
      status: 'success',
      data: indices
    });
  } catch (error) {
    console.error('Error fetching market indices:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch market data'
    });
  }
});

// Search stocks
router.get('/search', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.json({
      status: 'success',
      data: []
    });
  }
  
  try {
    const searchResults = await stockApiService.searchStocks(query as string);
    
    // Make sure we return the results in a consistent format
    const formattedResults = searchResults.results || [];
    
    res.json({
      status: 'success',
      data: formattedResults
    });
  } catch (error) {
    console.error(`Error searching stocks for "${query}":`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search stocks'
    });
  }
});

// Get IPO data
router.get('/ipo/upcoming', async (req, res) => {
  try {
    const ipoData = await stockApiService.getIpoData();
    
    res.json({
      status: 'success',
      data: ipoData
    });
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch IPO data'
    });
  }
});

// Get market news
router.get('/news/latest', async (req, res) => {
  try {
    const news = await stockApiService.getMarketNews();
    
    res.json({
      status: 'success',
      data: news
    });
  } catch (error) {
    console.error('Error fetching market news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch market news'
    });
  }
});

// Get 52-week high/low data
router.get('/market/52-week', async (req, res) => {
  try {
    const highLowData = await stockApiService.get52WeekHighLow();
    
    res.json({
      status: 'success',
      data: highLowData
    });
  } catch (error) {
    console.error('Error fetching 52-week high/low data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch 52-week high/low data'
    });
  }
});

// User's watchlist routes (protected)
router.get('/watchlist', authMiddleware, async (req, res) => {
  try {
    // @ts-ignore: In a real app, user would be attached by auth middleware
    const userId = req.user?.id;
    const watchlist = await stockApiService.getUserWatchlist(userId);
    
    res.json({
      status: 'success',
      data: watchlist
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch watchlist'
    });
  }
});

router.post('/watchlist', authMiddleware, async (req, res) => {
  const { stockId } = req.body;
  
  if (!stockId) {
    return res.status(400).json({
      status: 'error',
      message: 'Stock ID is required'
    });
  }
  
  try {
    // @ts-ignore: In a real app, user would be attached by auth middleware
    const userId = req.user?.id;
    const result = await stockApiService.addToWatchlist(userId, stockId);
    
    res.json({
      status: 'success',
      data: result,
      message: 'Stock added to watchlist'
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add stock to watchlist'
    });
  }
});

router.delete('/watchlist/:stockId', authMiddleware, async (req, res) => {
  try {
    const { stockId } = req.params;
    // @ts-ignore: In a real app, user would be attached by auth middleware
    const userId = req.user?.id;
    
    const result = await stockApiService.removeFromWatchlist(userId, stockId);
    
    res.json({
      status: 'success',
      data: result,
      message: 'Stock removed from watchlist'
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove stock from watchlist'
    });
  }
});

// Stock-specific endpoints with :symbol parameter
// Get financial ratios for a stock
router.get('/:symbol/ratios', async (req, res) => {
  try {
    const { symbol } = req.params;
    const ratios = await stockApiService.getFinancialRatios(symbol);
    
    res.json({
      status: 'success',
      data: ratios
    });
  } catch (error) {
    console.error(`Error fetching financial ratios for ${req.params.symbol}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch financial ratios'
    });
  }
});

// Get stock price history
router.get('/:symbol/prices', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1M' } = req.query;
    
    const priceHistory = await stockApiService.getStockPriceHistory(symbol, range as string);
    
    if (!priceHistory) {
      return res.status(404).json({
        status: 'error',
        message: 'Price history not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        symbol,
        timeRange: range,
        priceHistory
      }
    });
  } catch (error) {
    console.error(`Error fetching price history for ${req.params.symbol}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch price history'
    });
  }
});

// Get financial statements for a stock
router.get('/:symbol/financials/:statementType', async (req, res) => {
  try {
    const { symbol, statementType } = req.params;
    
    // Validate statement type
    const validTypes = ['cashflow', 'yoy_results', 'quarter_results', 'balancesheet'];
    if (!validTypes.includes(statementType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid statement type. Use one of: ${validTypes.join(', ')}`
      });
    }
    
    const financials = await stockApiService.getFinancialStatement(symbol, statementType);
    
    res.json({
      status: 'success',
      data: financials
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.statementType} for ${req.params.symbol}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch financial statements'
    });
  }
});

// Get corporate actions for a stock
router.get('/:symbol/corporate-actions', async (req, res) => {
  try {
    const { symbol } = req.params;
    const actions = await stockApiService.getCorporateActions(symbol);
    
    res.json({
      status: 'success',
      data: actions
    });
  } catch (error) {
    console.error(`Error fetching corporate actions for ${req.params.symbol}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch corporate actions'
    });
  }
});

// Get recent announcements for a stock
router.get('/:symbol/announcements', async (req, res) => {
  try {
    const { symbol } = req.params;
    const announcements = await stockApiService.getRecentAnnouncements(symbol);
    
    res.json({
      status: 'success',
      data: announcements
    });
  } catch (error) {
    console.error(`Error fetching announcements for ${req.params.symbol}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch announcements'
    });
  }
});

// Get stock details by symbol (must be last route with :symbol parameter)
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await stockApiService.getStockBySymbol(symbol);
    
    if (!stockData) {
      return res.status(404).json({
        status: 'error',
        message: 'Stock not found'
      });
    }
    
    res.json({
      status: 'success',
      data: stockData
    });
  } catch (error) {
    console.error(`Error fetching stock ${req.params.symbol}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stock data'
    });
  }
});

// Top gainers endpoint
router.get('/top-gainers', async (req, res) => {
  try {
    const gainers = await stockApiService.getTopGainers();
    res.json(gainers);
  } catch (error) {
    console.error('Error in /api/stocks/top-gainers:', error);
    res.status(500).json([]);
  }
});

// Top losers endpoint
router.get('/top-losers', async (req, res) => {
  try {
    const losers = await stockApiService.getTopLosers();
    res.json(losers);
  } catch (error) {
    console.error('Error in /api/stocks/top-losers:', error);
    res.status(500).json([]);
  }
});

export default router;