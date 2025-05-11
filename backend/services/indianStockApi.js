const axios = require('axios');
const { cacheService, DEFAULT_TTL } = require('./cacheService');

// Get API key from environment variable with fallback
const API_KEY = process.env.INDIAN_API_KEY || 'sk-live-K4wtBGXesvkus7wdkmT3uQ1g9qnlaLuN8TqQoXht';
const API_BASE_URL = process.env.INDIAN_API_BASE_URL || 'https://stock.indianapi.in';

// Helper function to generate cache keys
const generateCacheKey = (prefix, params = {}) => {
  const paramString = Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  return `indian_api:${prefix}${paramString ? ':' + paramString : ''}`;
};

// Create API client for Indian API
const createApiClient = () => {
  return {
    get: async (endpoint, options = {}) => {
      try {
        console.log(`Making Indian API request to: ${API_BASE_URL}${endpoint}`);
        
        // Set up request headers with API key
        const headers = {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY
        };
        
        // Make the request with timeout
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          timeout: 10000 // 10 second timeout
        });
        
        return response;
      } catch (error) {
        console.error(`Indian API request failed for ${endpoint}:`, error.message);
        throw error;
      }
    }
  };
};

// Indian Stock API service
const indianStockApiService = {
  // Get stock details by name
  async getStockByName(stockName) {
    if (!stockName) {
      throw new Error('Stock name is required');
    }
    
    // Clean up the stock name - remove extra spaces, etc.
    const cleanStockName = stockName.trim();
    
    // Try different formats of the stock name
    const stockNameVariations = [
      cleanStockName,                     // Original (cleaned)
      cleanStockName.toUpperCase(),       // Uppercase
      cleanStockName.toLowerCase(),       // Lowercase
      this.formatStockSymbol(cleanStockName) // Formatted as stock symbol
    ];
    
    // Remove duplicates
    const uniqueVariations = [...new Set(stockNameVariations)];
    
    // Try each variation
    let lastError = null;
    
    for (const nameVariation of uniqueVariations) {
      // Generate cache key
      const cacheKey = generateCacheKey('stock', { name: nameVariation });
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      
      try {
        console.log(`Trying to fetch stock with name: ${nameVariation}`);
        const apiClient = createApiClient();
        const response = await apiClient.get('/stock', {
          params: { name: nameVariation }
        });
        
        // Process the API response
        let stockData = response.data;
        
        // Cache the result if we have data
        if (stockData && Object.keys(stockData).length > 0) {
          await cacheService.set(cacheKey, stockData, DEFAULT_TTL.STOCK_DATA);
          return stockData;
        }
      } catch (error) {
        console.error(`Error fetching stock ${nameVariation}:`, error.message);
        lastError = error;
        // Continue to next variation
      }
    }
    
    // If we've tried all variations and none worked, throw the last error
    throw lastError || new Error(`No data found for stock ${stockName}`);
  },
  
  // Helper function to format stock symbol
  formatStockSymbol(name) {
    // Remove spaces, special characters, etc.
    return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  },

  // Get trending stocks
  async getTrendingStocks() {
    // Generate cache key
    const cacheKey = generateCacheKey('trending');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/trending');
      const result = response.data;
      
      // Cache the result for 15 minutes (market data changes frequently)
      await cacheService.set(cacheKey, result, DEFAULT_TTL.MARKET_DATA);
      
      return result;
    } catch (error) {
      console.error('Error fetching trending stocks:', error.message);
      throw error;
    }
  },

  // Get historical data for a stock
  async getHistoricalData(stockName, period = '1m', filter = 'default') {
    const cacheKey = generateCacheKey('historical', { stock_name: stockName, period, filter });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/historical_data', {
        params: { 
          stock_name: stockName,
          period,
          filter
        }
      });
      
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.HISTORICAL_DATA);
      
      return data;
    } catch (error) {
      console.error(`Error fetching historical data for ${stockName}:`, error.message);
      throw error;
    }
  },

  // Get IPO data
  async getIPOData() {
    const cacheKey = generateCacheKey('ipo');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/ipo');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching IPO data:', error.message);
      throw error;
    }
  },

  // Get news data
  async getNewsData() {
    const cacheKey = generateCacheKey('news');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/news');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching news data:', error.message);
      throw error;
    }
  },

  // Get commodities data
  async getCommoditiesData() {
    const cacheKey = generateCacheKey('commodities');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/commodities');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching commodities data:', error.message);
      throw error;
    }
  },

  // Get mutual funds data
  async getMutualFundsData() {
    const cacheKey = generateCacheKey('mutual_funds');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/mutual_funds');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching mutual funds data:', error.message);
      throw error;
    }
  },

  // Get BSE most active stocks
  async getBSEMostActiveStocks() {
    const cacheKey = generateCacheKey('bse_most_active');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/BSE_most_active');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching BSE most active stocks:', error.message);
      throw error;
    }
  },

  // Get NSE most active stocks
  async getNSEMostActiveStocks() {
    const cacheKey = generateCacheKey('nse_most_active');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/NSE_most_active');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching NSE most active stocks:', error.message);
      throw error;
    }
  },

  // Get price shockers data
  async getPriceShockersData() {
    const cacheKey = generateCacheKey('price_shockers');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/price_shockers');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching price shockers data:', error.message);
      throw error;
    }
  },

  // Get 52 week high/low data
  async get52WeekHighLowData() {
    const cacheKey = generateCacheKey('52_week_high_low');
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/fetch_52_week_high_low_data');
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.MARKET_DATA);
      
      return data;
    } catch (error) {
      console.error('Error fetching 52 week high/low data:', error.message);
      throw error;
    }
  },

  // Search for industry data
  async searchIndustryData(query) {
    const cacheKey = generateCacheKey('industry_search', { query });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/industry_search', {
        params: { query }
      });
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.SEARCH_RESULTS);
      
      return data;
    } catch (error) {
      console.error(`Error searching industry data for "${query}":`, error.message);
      throw error;
    }
  },

  // Search for mutual funds
  async searchMutualFunds(query) {
    const cacheKey = generateCacheKey('mutual_fund_search', { query });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/mutual_fund_search', {
        params: { query }
      });
      const data = response.data;
      
      // Cache the result
      await cacheService.set(cacheKey, data, DEFAULT_TTL.SEARCH_RESULTS);
      
      return data;
    } catch (error) {
      console.error(`Error searching mutual funds for "${query}":`, error.message);
      throw error;
    }
  },

  // Search for stocks
  async searchStocks(query) {
    const cacheKey = generateCacheKey('stock_search', { query });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/stock_search', {
        params: { query }
      });
      
      let data = response.data;
      
      // Format the response to match the expected structure in the frontend
      const results = Array.isArray(data) ? data.map(stock => ({
        symbol: stock.symbol || stock.ticker || '',
        companyName: stock.name || stock.company_name || '',
        latestPrice: stock.current_price || stock.price || 0,
        change: stock.change || 0,
        changePercent: stock.percent_change || 0,
        sector: stock.sector || ''
      })) : [];
      
      const formattedResponse = { results };
      
      // Cache the result
      await cacheService.set(cacheKey, formattedResponse, DEFAULT_TTL.SEARCH_RESULTS);
      
      return formattedResponse;
    } catch (error) {
      console.error(`Error searching stocks for "${query}":`, error.message);
      throw error;
    }
  }
};

module.exports = indianStockApiService; 