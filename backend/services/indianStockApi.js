const axios = require('axios');
const { cacheService, DEFAULT_TTL } = require('./cacheService');
const apiKeyManager = require('./apiKeyManager');

// Get API base URL from environment variable with fallback
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
      // Maximum number of retry attempts when rate limited
      const MAX_RETRIES = 3;
      let retries = 0;
      
      while (retries <= MAX_RETRIES) {
      try {
          // Get the current API key from the manager
          const API_KEY = apiKeyManager.getCurrentKey();
          
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
          
          // If successful, record the successful use
          apiKeyManager.recordSuccessfulUse();
        
        return response;
      } catch (error) {
          // Check if this is a rate limit error (HTTP 429)
          if (error.response && error.response.status === 429) {
            console.warn('Rate limit exceeded for current API key');
            
            // Set cooldown to 1 second per the API plan (1 request/second limit)
            const resetTimeInSeconds = 1;
            
            // Mark current key as rate limited
            apiKeyManager.markCurrentKeyRateLimited(resetTimeInSeconds);
            
            // Increment retry counter
            retries++;
            
            // If we've hit the max retries or there are no more available keys, throw the error
            if (retries > MAX_RETRIES) {
              console.error(`Max retries (${MAX_RETRIES}) reached. No more available API keys.`);
              throw new Error('All API keys have reached their rate limits. Please try again later.');
            }
            
            console.log(`Retrying with new API key (attempt ${retries}/${MAX_RETRIES})...`);
            
            // Slight delay before retry to avoid hammering the API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Continue to next iteration (which will use the next available key)
            continue;
          }
          
          // For other errors, log and rethrow
        console.error(`Indian API request failed for ${endpoint}:`, error.message);
        throw error;
        }
      }
    }
  };
};

// Indian Stock API service
const indianStockApiService = {
  // Get stock details by name
  async getStockByName(name) {
    const cacheKey = generateCacheKey('stock_name', { name });
      
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
      
      try {
        const apiClient = createApiClient();
        const response = await apiClient.get('/stock', {
        params: { name }
      });
      
      let stockData = response.data;
        
      // Process and enrich the stock data before caching
      if (stockData) {
        // Extract price from currentPrice if available or from other fields
        let latestPrice = null;
        
        if (stockData.currentPrice) {
          // Try BSE price first, then NSE
          latestPrice = stockData.currentPrice.BSE || stockData.currentPrice.NSE;
        } else if (stockData.stockTechnicalData && stockData.stockTechnicalData.length > 0) {
          latestPrice = stockData.stockTechnicalData[0].bsePrice || stockData.stockTechnicalData[0].nsePrice;
        }
        
        // Make sure we have a symbol
        if (!stockData.symbol && stockData.companyName) {
          stockData.symbol = stockData.companyName.split(' ')[0];
        }
        
        // Add the latestPrice field for consistency
        stockData.latestPrice = latestPrice;
      }
      
      // Cache the result
      await cacheService.set(cacheKey, stockData, DEFAULT_TTL.STOCK_DETAILS);
      
          return stockData;
      } catch (error) {
      console.error(`Error fetching stock details for "${name}": ${error.message}`);
      throw error;
    }
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