const axios = require('axios').default;
const pool = require('../src/config/database');

class StockApiService {
  constructor() {
    this.baseUrl = 'https://stock.indianapi.in/stock';
    // API key from indianapi.in - replace with your actual API key
    this.apiKey = process.env.STOCK_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
  }

  /**
   * Search for stocks by query string
   * @param {string} query - The search query (stock symbol or name)
   * @returns {Promise<Array>} - Array of stock data
   */
  async searchStocks(query) {
    try {
      // When searching, append the query to the URL
      const url = query ? `${this.baseUrl}/${query}` : this.baseUrl;
      const { data } = await axios.request({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });
      
      // Attempt to store the received JSON in PostgreSQL
      try {
        await this.storeStockData(data, query);
      } catch (dbError) {
        console.warn('Could not store data in database:', dbError.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching stock data:', error.message);
      
      // Fall back to cached data if available
      try {
        const cachedData = await this.getCachedData(query);
        if (cachedData) {
          console.log(`Using cached data for query: ${query || 'all stocks'}`);
          return cachedData;
        }
      } catch (cacheError) {
        console.warn('Cache retrieval failed:', cacheError.message);
      }
      
      // Return mock data as fallback when everything fails
      return this.getMockData(query);
    }
  }

  /**
   * Store stock data in PostgreSQL database
   * @param {Object} data - Stock data from API
   * @param {string} query - The search query used (if any)
   */
  async storeStockData(data, query = '') {
    try {
      const queryText = `
        INSERT INTO stock_data (query, data, fetched_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (query) 
        DO UPDATE SET 
          data = $2,
          fetched_at = NOW()
      `;
      
      await pool.query(queryText, [query, JSON.stringify(data)]);
      console.log(`Successfully stored stock data for query: ${query || 'all stocks'}`);
    } catch (error) {
      console.error('Error storing stock data in PostgreSQL:', error);
      // Don't throw here to prevent API call failures if DB storage fails
    }
  }

  /**
   * Get cached data from PostgreSQL
   * @param {string} query - The search query
   * @returns {Promise<Object>} - Cached data
   */
  async getCachedData(query = '') {
    try {
      const result = await pool.query(
        'SELECT data FROM stock_data WHERE query = $1 ORDER BY fetched_at DESC LIMIT 1',
        [query]
      );

      if (result.rows && result.rows.length > 0) {
        return result.rows[0].data;
      }
      return null;
    } catch (error) {
      console.warn('Error retrieving cached data:', error);
      return null;
    }
  }

  /**
   * Get stocks that are at 52-week high/low
   * @returns {Promise<Object>} - Object containing high and low stocks
   */
  async get52WeekHighLow() {
    try {
      const { data } = await axios.request({
        method: 'GET',
        url: `${this.baseUrl}/52-week`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });
      
      // Try to store the 52-week high/low data
      try {
        await this.storeStockData(data, '52-week');
      } catch (dbError) {
        console.warn('Could not store 52-week data in database:', dbError.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching 52-week high/low data:', error.message);
      
      // Try to get cached data
      try {
        const cachedData = await this.getCachedData('52-week');
        if (cachedData) {
          return cachedData;
        }
      } catch (cacheError) {
        console.warn('Cache retrieval failed for 52-week data:', cacheError.message);
      }
      
      // Return mock data
      return this.getMock52WeekData();
    }
  }

  /**
   * Get historical stock data by symbol
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Array>} - Array of historical data points
   */
  async getHistoricalData(symbol) {
    try {
      const { data } = await axios.request({
        method: 'GET',
        url: `${this.baseUrl}/${symbol}/historical`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });
      
      // Try to store the historical data
      try {
        await this.storeStockData(data, `${symbol}-historical`);
      } catch (dbError) {
        console.warn(`Could not store historical data for ${symbol} in database:`, dbError.message);
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      
      // Try to get cached data
      try {
        const cachedData = await this.getCachedData(`${symbol}-historical`);
        if (cachedData) {
          return cachedData;
        }
      } catch (cacheError) {
        console.warn(`Cache retrieval failed for ${symbol} historical data:`, cacheError.message);
      }
      
      // Return mock historical data
      return this.getMockHistoricalData(symbol);
    }
  }

  /**
   * Generate mock data for when API calls fail
   * @param {string} query - The search query
   * @returns {Array} - Mock stock data
   */
  getMockData(query = '') {
    console.log(`⚠️ Using mock data for query: ${query}`);
    
    // Generate a default stock list
    const mockStocks = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        price: 2875.45,
        change: 1.23,
        volume: 4532167,
        yearHigh: 3100.00,
        yearLow: 2400.00
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services Ltd',
        price: 3456.78,
        change: -0.45,
        volume: 1234567,
        yearHigh: 3800.00,
        yearLow: 3100.00
      },
      {
        symbol: 'INFY',
        name: 'Infosys Ltd',
        price: 1543.21,
        change: 0.67,
        volume: 2345678,
        yearHigh: 1700.00,
        yearLow: 1300.00
      }
    ];
    
    // If there's a query, filter the mock data
    if (query) {
      const upperQuery = query.toUpperCase();
      return mockStocks.filter(stock => 
        stock.symbol.includes(upperQuery) || 
        stock.name.toUpperCase().includes(upperQuery)
      );
    }
    
    return mockStocks;
  }

  /**
   * Generate mock data for 52-week high/low
   * @returns {Object} - Mock 52-week high/low data
   */
  getMock52WeekData() {
    console.log('⚠️ Using mock data for 52-week high/low');
    
    return {
      high: [
        {
          symbol: 'RELIANCE',
          name: 'Reliance Industries Ltd',
          price: 2875.45,
          yearHigh: 3100.00,
          percentFromHigh: 7.24
        },
        {
          symbol: 'HDFCBANK',
          name: 'HDFC Bank Ltd',
          price: 1678.90,
          yearHigh: 1700.00,
          percentFromHigh: 1.24
        }
      ],
      low: [
        {
          symbol: 'TATASTEEL',
          name: 'Tata Steel Ltd',
          price: 543.21,
          yearLow: 500.00,
          percentFromLow: 8.64
        },
        {
          symbol: 'COALINDIA',
          name: 'Coal India Ltd',
          price: 234.56,
          yearLow: 220.00,
          percentFromLow: 6.62
        }
      ]
    };
  }

  /**
   * Generate mock historical data
   * @param {string} symbol - Stock symbol
   * @returns {Array} - Mock historical data points
   */
  getMockHistoricalData(symbol) {
    console.log(`⚠️ Using mock historical data for ${symbol}`);
    
    const today = new Date();
    const mockData = [];
    
    // Generate 30 days of mock data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Base price with some randomness
      const basePrice = symbol === 'RELIANCE' ? 2800 : 
                        symbol === 'TCS' ? 3400 : 
                        symbol === 'INFY' ? 1500 : 1000;
      
      const randomFactor = 0.02; // 2% random variation
      const randomChange = basePrice * randomFactor * (Math.random() * 2 - 1);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        open: basePrice + randomChange,
        high: basePrice + Math.abs(randomChange) + basePrice * 0.01,
        low: basePrice - Math.abs(randomChange) - basePrice * 0.01,
        close: basePrice + randomChange * 0.7,
        volume: Math.floor(Math.random() * 5000000) + 1000000
      });
    }
    
    return mockData;
  }
}

module.exports = new StockApiService();

module.exports = new StockApiService();
