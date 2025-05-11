const stockApiService = require('../../services/stockApiService');
const pool = require('../config/database');

/**
 * Stock controller handling stock-related API endpoints
 */
class StockController {
  /**
   * Search for stocks by query
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchStocks(req, res) {
    try {
      const { query } = req.query;
      const data = await stockApiService.searchStocks(query);
      res.json(data);
    } catch (error) {
      console.error('Stock search error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get stock details by symbol
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStockBySymbol(req, res) {
    try {
      const { symbol } = req.params;
      const data = await stockApiService.searchStocks(symbol);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching stock ${req.params.symbol}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get 52-week high/low stocks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async get52WeekHighLow(req, res) {
    try {
      const data = await stockApiService.get52WeekHighLow();
      res.json(data);
    } catch (error) {
      console.error('Error fetching 52-week high/low:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get historical stock data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getHistoricalData(req, res) {
    try {
      const { symbol } = req.params;
      const data = await stockApiService.getHistoricalData(symbol);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching historical data for ${req.params.symbol}:`, error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieve cached stock data from database
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCachedData(req, res) {
    try {
      const { query } = req.query;
      
      let dbQuery;
      let params = [];
      
      if (query) {
        dbQuery = 'SELECT query, data, fetched_at FROM stock_data WHERE query = $1';
        params = [query];
      } else {
        dbQuery = 'SELECT query, data, fetched_at FROM stock_data ORDER BY fetched_at DESC LIMIT 50';
      }
      
      const result = await pool.query(dbQuery, params);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No cached data found' });
      }
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error retrieving cached stock data:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new StockController();
