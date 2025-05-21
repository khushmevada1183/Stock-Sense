import axios from 'axios';

// API service for communicating with the backend
class StockApiService {
  constructor() {
    // Set base URL from environment or default to localhost
    // Use NEXT_PUBLIC_ prefixed environment variables for client-side access
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
    this.useMockData = process.env.NEXT_PUBLIC_ALLOW_MOCK_DATA === 'true';
    
    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent long waiting times
      timeout: 10000
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.warn('API request failed:', error.message);
        // If configured to use mock data on failure, return mock data
        if (this.useMockData) {
          return Promise.resolve({ data: this.getMockDataForEndpoint(error.config.url) });
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Search for stocks by query
   * @param {string} query - Search query (stock name or symbol)
   * @returns {Promise<Array>} - Array of stock data
   */
  async searchStocks(query = '') {
    try {
      const response = await this.api.get(`/stocks/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      if (this.useMockData) {
        return this.getMockStocks(query);
      }
      throw new Error(error.response?.data?.error || 'Failed to search stocks');
    }
  }

  /**
   * Get stock details by symbol
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} - Stock details
   */
  async getStockBySymbol(symbol) {
    try {
      const response = await this.api.get(`/stocks/symbol/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      if (this.useMockData) {
        return this.getMockStockDetails(symbol);
      }
      throw new Error(error.response?.data?.error || `Failed to fetch stock ${symbol}`);
    }
  }

  /**
   * Get 52-week high/low stocks
   * @returns {Promise<Object>} - Object with high and low stocks
   */
  async get52WeekHighLow() {
    try {
      const response = await this.api.get('/stocks/market/52-week');
      return response.data;
    } catch (error) {
      console.error('Error fetching 52-week high/low:', error);
      if (this.useMockData) {
        return this.getMock52WeekData();
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch 52-week high/low');
    }
  }

  /**
   * Get historical stock data
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Array>} - Array of historical data points
   */
  async getHistoricalData(symbol) {
    try {
      const response = await this.api.get(`/stocks/historical/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      if (this.useMockData) {
        return this.getMockHistoricalData(symbol);
      }
      throw new Error(error.response?.data?.error || `Failed to fetch historical data for ${symbol}`);
    }
  }

  /**
   * Get cached stock data from the database
   * @param {string} query - Optional specific query to retrieve
   * @returns {Promise<Array>} - Array of cached stock data
   */
  async getCachedData(query = '') {
    try {
      const response = await this.api.get('/stocks/cached', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cached data:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch cached data');
    }
  }

  /**
   * Get mock data for a specific endpoint when API fails
   * @param {string} endpoint - API endpoint path
   * @returns {Object} - Mock data for the endpoint
   */
  getMockDataForEndpoint(endpoint) {
    if (endpoint.includes('search')) {
      const query = new URLSearchParams(endpoint.split('?')[1]).get('query') || '';
      return this.getMockStocks(query);
    } else if (endpoint.includes('symbol')) {
      const symbol = endpoint.split('/').pop();
      return this.getMockStockDetails(symbol);
    } else if (endpoint.includes('52-week')) {
      return this.getMock52WeekData();
    } else if (endpoint.includes('historical')) {
      const symbol = endpoint.split('/')[2]; // Extract symbol from endpoint
      return this.getMockHistoricalData(symbol);
    }
    return [];
  }

  /**
   * Generate mock stock data
   * @param {string} query - Search query
   * @returns {Array} - Mock stock data
   */
  getMockStocks(query = '') {
    console.log('Using mock stock data for search');
    
    const stocks = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        price: 2875.45,
        change: 1.23,
        volume: 4532167,
        _isMockData: true
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services Ltd',
        price: 3456.78,
        change: -0.45,
        volume: 1234567,
        _isMockData: true
      },
      {
        symbol: 'INFY',
        name: 'Infosys Ltd',
        price: 1543.21,
        change: 0.67,
        volume: 2345678,
        _isMockData: true
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd',
        price: 1678.90,
        change: 0.25,
        volume: 3456789,
        _isMockData: true
      },
      {
        symbol: 'ICICIBANK',
        name: 'ICICI Bank Ltd',
        price: 954.32,
        change: -0.85,
        volume: 2345678,
        _isMockData: true
      }
    ];
    
    if (!query) return stocks;
    
    // Filter by query (case-insensitive)
    const normalizedQuery = query.toLowerCase();
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(normalizedQuery) || 
      stock.name.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Generate mock stock details
   * @param {string} symbol - Stock symbol
   * @returns {Object} - Mock stock details
   */
  getMockStockDetails(symbol) {
    const stocks = this.getMockStocks();
    const stock = stocks.find(s => s.symbol === symbol.toUpperCase()) || {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Company Ltd`,
      price: Math.floor(Math.random() * 5000) + 500,
      change: (Math.random() * 4 - 2).toFixed(2),
      volume: Math.floor(Math.random() * 10000000),
      _isMockData: true
    };
    
    // Add additional details
    return {
      ...stock,
      high: stock.price * 1.02,
      low: stock.price * 0.98,
      open: stock.price * 0.99,
      previousClose: stock.price * (1 - stock.change / 100),
      marketCap: stock.price * 10000000,
      pe: (Math.random() * 30 + 10).toFixed(2),
      eps: (stock.price / (Math.random() * 20 + 5)).toFixed(2),
      dividend: (Math.random() * 3).toFixed(2),
      yearHigh: stock.price * 1.2,
      yearLow: stock.price * 0.8
    };
  }

  /**
   * Generate mock 52-week high/low data
   * @returns {Object} - Mock high/low data
   */
  getMock52WeekData() {
    return {
      high: [
        {
          symbol: 'RELIANCE',
          name: 'Reliance Industries Ltd',
          price: 2875.45,
          yearHigh: 3100.00,
          percentFromHigh: 7.24,
          _isMockData: true
        },
        {
          symbol: 'HDFCBANK',
          name: 'HDFC Bank Ltd',
          price: 1678.90,
          yearHigh: 1700.00,
          percentFromHigh: 1.24,
          _isMockData: true
        }
      ],
      low: [
        {
          symbol: 'TATASTEEL',
          name: 'Tata Steel Ltd',
          price: 543.21,
          yearLow: 500.00,
          percentFromLow: 8.64,
          _isMockData: true
        },
        {
          symbol: 'COALINDIA',
          name: 'Coal India Ltd',
          price: 234.56,
          yearLow: 220.00,
          percentFromLow: 6.62,
          _isMockData: true
        }
      ],
      _isMockData: true
    };
  }

  /**
   * Generate mock historical data
   * @param {string} symbol - Stock symbol
   * @returns {Array} - Mock historical data
   */
  getMockHistoricalData(symbol) {
    const stockDetails = this.getMockStockDetails(symbol);
    const currentPrice = stockDetails.price;
    const days = 30;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add random variation to price
      const randomChange = currentPrice * 0.02 * (Math.random() * 2 - 1);
      const dayPrice = currentPrice + randomChange;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: (dayPrice * 0.99).toFixed(2),
        high: (dayPrice * 1.01).toFixed(2),
        low: (dayPrice * 0.98).toFixed(2),
        close: dayPrice.toFixed(2),
        volume: Math.floor(Math.random() * 10000000),
        _isMockData: true
      });
    }
    
    return data;
  }
}

// Create a singleton instance
const stockApiService = new StockApiService();

export default stockApiService;
