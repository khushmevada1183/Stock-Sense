const axios = require('axios');
const { cacheService, DEFAULT_TTL } = require('./cacheService');

// Get API key from environment variable with fallback
const API_KEY = process.env.STOCK_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
const API_BASE_URL = process.env.STOCK_API_BASE_URL || 'https://stock.indianapi.in';

// Helper function to generate cache keys
const generateCacheKey = (prefix, params = {}) => {
  const paramString = Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  return `${prefix}${paramString ? ':' + paramString : ''}`;
};

// Create API client for a specific request
const createApiClient = (customHeaders = {}) => {
  return {
    get: async (endpoint, options = {}) => {
      try {
        console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
        
        // Set up request headers with API key
        const headers = {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          ...customHeaders
        };
        
        // Make the request with timeout
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          timeout: 10000 // 10 second timeout
        });
        
        return response;
      } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error.message);
        throw error;
      }
    }
  };
};

// Stock API service
const stockApiService = {
  // Get stock details by name (using the /stock endpoint)
  async getStockBySymbol(symbol) {
    // Generate cache key
    const cacheKey = generateCacheKey('stock', { symbol });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get(`/stock`, {
        params: { name: symbol }
      });
      
      // Process the API response
      let stockData = response.data;
      
      // Cache the result if we have data
      if (stockData && stockData.data) {
        await cacheService.set(cacheKey, stockData.data, DEFAULT_TTL.STOCK_DATA);
        return stockData.data;
      } else {
        throw new Error(`No data found for stock ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      
      throw error;
    }
  },

  // Search stocks functionality with the API directly
  async searchStocks(query) {
    // Generate cache key
    const cacheKey = generateCacheKey('search', { query });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get(`/stock`, {
          params: { name: query }
        });
        
      // Process API response
      const stockData = response.data;
      
      // Format response to match the expected schema
      let results = [];
      
      if (stockData && stockData.data && Array.isArray(stockData.data)) {
        results = stockData.data.map(item => ({
          symbol: item.symbol || item.name,
          companyName: item.company_name || item.name,
          latestPrice: item.current_price,
          change: item.change,
          changePercent: item.percent_change,
          sector: item.sector
        }));
      }
      
      const formattedResponse = { results };
        
      // Cache the formatted results
      await cacheService.set(cacheKey, formattedResponse, DEFAULT_TTL.SEARCH_RESULTS);
        
        return formattedResponse;
    } catch (error) {
      console.error(`Error searching for stocks with query "${query}":`, error.message);
      throw error;
    }
  },

  // Get trending stocks
  async getAllStocks() {
    // Generate cache key
    const cacheKey = 'trending_stocks';
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/trending');
      const result = response.data?.trending_stocks || { top_gainers: [], top_losers: [] };
      
      // Cache the result for 15 minutes (market data changes frequently)
      await cacheService.set(cacheKey, result, DEFAULT_TTL.MARKET_DATA);
      
      return result;
    } catch (error) {
      console.error('Error fetching trending stocks:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get historical data for a stock
  async getHistoricalData(symbol, period = '1yr', filter = 'price') {
    const cacheKey = generateCacheKey('historical', { symbol, period, filter });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      console.log(`Fetching historical data for ${symbol}, period: ${period}`);
      const apiClient = createApiClient();
      
      // First try with specific historical endpoint
      try {
        const response = await apiClient.get(`/historical-data`, {
          params: { symbol, period }
      });
      
        if (response.data && response.data.length > 0) {
          // Cache the result
      await cacheService.set(cacheKey, response.data, DEFAULT_TTL.HISTORICAL_DATA);
          return response.data;
        }
      } catch (firstError) {
        console.error(`First historical data attempt failed for ${symbol}:`, firstError.message);
        // Continue to next attempt
      }
      
      // Second attempt with a different endpoint format
      try {
        const response = await apiClient.get(`/history`, {
          params: { stock: symbol, range: this.convertPeriodToRange(period) }
        });
        
        if (response.data && response.data.length > 0) {
          // Cache the result
          await cacheService.set(cacheKey, response.data, DEFAULT_TTL.HISTORICAL_DATA);
      return response.data;
        }
      } catch (secondError) {
        console.error(`Second historical data attempt failed for ${symbol}:`, secondError.message);
        // Continue to next attempt
      }
      
      // If we reach here, all API attempts failed
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    } catch (error) {
      console.error(`All attempts to fetch historical data failed for ${symbol}:`, error.message);
      throw error;
    }
  },

  // Helper method to convert period to range format
  convertPeriodToRange(period) {
    const periodMap = {
      '1d': '1D',
      '5d': '5D',
      '1mo': '1M',
      '3mo': '3M',
      '6mo': '6M',
      '1yr': '1Y',
      '2yr': '2Y',
      '5yr': '5Y',
      'ytd': 'YTD',
      'max': 'MAX'
    };
    
    return periodMap[period] || '1Y';
  },

  // Get stock price history (using historical_data endpoint with price filter)
  async getStockPriceHistory(symbol, range = '1M') {
    // Generate cache key
    const cacheKey = generateCacheKey('price_history', { symbol, range });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      // Convert range to the format expected by the API
      let period;
      switch (range.toUpperCase()) {
        case '1D':
        case '1W':
          period = '1m'; // Use 1 month data and filter for shorter timeframes
          break;
        case '1M':
          period = '1m';
          break;
        case '3M':
          period = '6m'; // API doesn't have 3m, so use 6m and filter
          break;
        case '6M':
          period = '6m';
          break;
        case '1Y':
          period = '1yr';
          break;
        case '5Y':
          period = '5yr';
          break;
        case 'MAX':
        default:
          period = 'max';
      }

      // Get historical price data
      const response = await this.getHistoricalData(symbol, period, 'price');
      
      // Extract price dataset
      let priceData = [];
      if (response && response.datasets) {
        const priceDataset = response.datasets.find(d => d.metric === 'Price');
        if (priceDataset && priceDataset.values) {
          // Format price data as expected by the frontend
          priceData = priceDataset.values.map(([date, price]) => ({
            date,
            close: parseFloat(price)
          }));
          
          // For 1D or 1W range, filter to the appropriate timeframe
          if (range.toUpperCase() === '1D') {
            // Get only the last day's data
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            priceData = priceData.filter(item => item.date === todayStr);
          } else if (range.toUpperCase() === '1W') {
            // Get only the last 7 days of data
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const lastWeekStr = lastWeek.toISOString().split('T')[0];
            priceData = priceData.filter(item => new Date(item.date) >= new Date(lastWeekStr));
          } else if (range.toUpperCase() === '3M') {
            // Get only the last 3 months of data from the 6m dataset
            const last3Months = new Date();
            last3Months.setMonth(last3Months.getMonth() - 3);
            const last3MonthsStr = last3Months.toISOString().split('T')[0];
            priceData = priceData.filter(item => new Date(item.date) >= new Date(last3MonthsStr));
          }
        }
      }
      
      // Cache the processed price data
      await cacheService.set(cacheKey, priceData, DEFAULT_TTL.HISTORICAL_DATA);
      
      return priceData;
    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get IPO data
  async getIpoData() {
    // Generate cache key
    const cacheKey = 'ipo_data';
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/ipo');
      
      // Cache the result - IPO data changes infrequently
      await cacheService.set(cacheKey, response.data, DEFAULT_TTL.MARKET_DATA);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching IPO data:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get market news
  async getMarketNews() {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/news');
      return response.data;
    } catch (error) {
      console.error('Error fetching market news:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      // Fall back to trending data if news endpoint fails
      try {
        const trendingData = await this.getAllStocks();
        return {
          topGainers: trendingData.top_gainers || [],
          topLosers: trendingData.top_losers || []
        };
      } catch (fallbackError) {
        console.error('Fallback to trending data also failed:', fallbackError.message);
        throw error; // Throw the original error
      }
    }
  },

  // Get 52-week high/low data
  async get52WeekHighLow() {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/fetch_52_week_high_low_data');
      return response.data;
    } catch (error) {
      console.error('Error fetching 52-week high/low data:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get most active stocks from BSE
  async getBSEMostActive() {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/BSE_most_active');
      return response.data;
    } catch (error) {
      console.error('Error fetching BSE most active stocks:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get most active stocks from NSE
  async getNSEMostActive() {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/NSE_most_active');
      return response.data;
    } catch (error) {
      console.error('Error fetching NSE most active stocks:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get mutual funds data
  async getMutualFunds() {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/mutual_funds');
      return response.data;
    } catch (error) {
      console.error('Error fetching mutual funds:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Search for mutual funds
  async searchMutualFunds(query) {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/mutual_fund_search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching mutual funds for "${query}":`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get price shockers data
  async getPriceShockers() {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/price_shockers');
      return response.data;
    } catch (error) {
      console.error('Error fetching price shockers:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get commodity futures data
  async getCommodities() {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/commodities');
      return response.data;
    } catch (error) {
      console.error('Error fetching commodities:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get industry search results
  async industrySearch(query) {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.get('/industry_search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching industry for "${query}":`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get featured stocks
  async getFeaturedStocks() {
    try {
      // Try to use trending stocks as featured stocks
      const trendingData = await this.getAllStocks();
      
      // Format the response to match the expected structure
      const featuredStocks = [];
      
      // Add top gainers
      if (trendingData.top_gainers && trendingData.top_gainers.length > 0) {
        featuredStocks.push(...trendingData.top_gainers.slice(0, 5).map(stock => ({
          symbol: stock.symbol || stock.name,
          companyName: stock.company_name || stock.name,
          latestPrice: stock.current_price || 0,
          change: stock.change || 0,
          changePercent: stock.percent_change || 0,
          volume: stock.volume || 0
        })));
      }
      
      // Add top losers if we need more stocks
      if (trendingData.top_losers && trendingData.top_losers.length > 0 && featuredStocks.length < 10) {
        featuredStocks.push(...trendingData.top_losers.slice(0, 10 - featuredStocks.length).map(stock => ({
          symbol: stock.symbol || stock.name,
          companyName: stock.company_name || stock.name,
          latestPrice: stock.current_price || 0,
          change: stock.change || 0,
          changePercent: stock.percent_change || 0,
          volume: stock.volume || 0
        })));
      }
      
      return featuredStocks;
    } catch (error) {
      console.error('Error fetching featured stocks:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get market indices with caching
  async getMarketIndices() {
    // Generate cache key
    const cacheKey = 'market_indices';
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      // Try to get indices data from the market_indices endpoint
      const apiClient = createApiClient();
      const response = await apiClient.get('/market_indices');
      
      // Cache the result for 15 minutes (market indices change frequently)
      await cacheService.set(cacheKey, response.data, DEFAULT_TTL.MARKET_DATA);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching market indices:', error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      
      // If the API call fails, use multiple endpoints to create a comprehensive market overview
      try {
        console.log('Using fallback method to construct market overview...');
        
        // Get trending data as primary fallback
        const trendingData = await this.getAllStocks();
        
        // Get BSE and NSE most active stocks
        const bseMostActive = await this.getBSEMostActive();
        const nseMostActive = await this.getNSEMostActive();
        
        // Construct a market overview object
        const marketOverview = {
          indices: {
            // Hardcoded major indices as placeholders since we can't get real-time data
            'NIFTY 50': {
              name: 'NIFTY 50',
              value: '19,200.00',
              change: '37.80',
              percentChange: '0.20%',
              isUp: true
            },
            'BSE SENSEX': {
              name: 'BSE SENSEX',
              value: '63,450.00',
              change: '125.30',
              percentChange: '0.18%',
              isUp: true
            },
            'NIFTY BANK': {
              name: 'NIFTY BANK',
              value: '44,120.00',
              change: '-12.50',
              percentChange: '-0.03%',
              isUp: false
            }
          },
          topGainers: trendingData.top_gainers || [],
          topLosers: trendingData.top_losers || [],
          bseMostActive: bseMostActive || [],
          nseMostActive: nseMostActive || []
        };
        
        // Cache the fallback data for a shorter period
        await cacheService.set(cacheKey, marketOverview, DEFAULT_TTL.MARKET_DATA / 2);
        
        return marketOverview;
      } catch (fallbackError) {
        console.error('Fallback for market indices also failed:', fallbackError.message);
        throw error; // Throw the original error
      }
    }
  },

  // Get user watchlist
  async getUserWatchlist(userId) {
    try {
      // Call the API endpoint to get the user's watchlist
      const response = await apiClient.get('/user_watchlist', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching watchlist for user ${userId}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Add stock to user's watchlist
  async addToWatchlist(userId, stockId) {
    try {
      // Call the API endpoint to add a stock to the watchlist
      const response = await apiClient.post('/watchlist', {
        user_id: userId,
        stock_id: stockId
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding stock ${stockId} to watchlist for user ${userId}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Remove stock from user's watchlist
  async removeFromWatchlist(userId, stockId) {
    try {
      // Call the API endpoint to remove a stock from the watchlist
      const response = await apiClient.delete('/watchlist', {
        data: {
          user_id: userId,
          stock_id: stockId
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error removing stock ${stockId} from watchlist for user ${userId}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get analyst recommendations and target price for a stock
  async getStockTargetPrice(stockId) {
    try {
      const response = await apiClient.get('/stock_target_price', {
        params: { stock_id: stockId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock target price for "${stockId}":`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get historical statistics for a stock
  async getHistoricalStats(stockName, stats) {
    try {
      const response = await apiClient.get('/historical_stats', {
        params: { 
          stock_name: stockName,
          stats: stats 
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical stats for ${stockName}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get company logo
  async getCompanyLogo(symbol) {
    try {
      // First try to get logo from stock details
      const stockData = await this.getStockBySymbol(symbol);
      
      if (stockData && stockData.logo_url) {
        return {
          symbol: symbol,
          url: stockData.logo_url,
          source: 'api'
        };
      }
      
      // If no logo in stock data, try to construct a company domain and use clearbit
      let companyDomain;
      
      if (stockData && stockData.company_name) {
        // Try to extract a domain-friendly name from the company name
        const name = stockData.company_name.toLowerCase()
          .replace(/\s+limited$|\s+ltd\.?$|\s+inc\.?$|\s+corporation$|\s+corp\.?$/i, '')
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '');
        
        companyDomain = `${name}.com`;
      } else {
        // Fallback to using the symbol
        companyDomain = `${symbol.toLowerCase()}.com`;
      }
      
      return {
        symbol: symbol,
        url: `https://logo.clearbit.com/${companyDomain}`,
        source: 'clearbit',
        fallbackUrl: `https://ui-avatars.com/api/?name=${symbol}&background=random&size=128`
      };
    } catch (error) {
      console.error(`Error fetching company logo for ${symbol}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      
      // Provide a fallback avatar based on the symbol
      return {
        symbol: symbol,
        url: `https://ui-avatars.com/api/?name=${symbol}&background=random&size=128`,
        source: 'fallback'
      };
    }
  },

  // Get financial statements for a stock
  async getFinancialStatement(stockName, statementType) {
    try {
      // Valid statementType values: 'cashflow', 'yoy_results', 'quarter_results', 'balancesheet'
      if (!['cashflow', 'yoy_results', 'quarter_results', 'balancesheet'].includes(statementType)) {
        throw new Error('Invalid statement type. Use: cashflow, yoy_results, quarter_results, or balancesheet');
      }

      const response = await apiClient.get('/statement', {
        params: { 
          stock_name: stockName,
          stats: statementType
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${statementType} statement for ${stockName}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get corporate actions for a stock (dividends, rights issues, etc.)
  async getCorporateActions(stockName) {
    try {
      const response = await apiClient.get('/corporate_actions', {
        params: { stock_name: stockName }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching corporate actions for ${stockName}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get recent company announcements
  async getRecentAnnouncements(stockName) {
    try {
      const response = await apiClient.get('/recent_announcements', {
        params: { stock_name: stockName }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching recent announcements for ${stockName}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get stock forecast data with various measures (EPS, ROE, etc.)
  async getStockForecasts(stockId, measureCode = 'EPS', periodType = 'Annual', dataType = 'Estimates', age = 'Current') {
    try {
      const response = await apiClient.get('/stock_forecasts', {
        params: {
          stock_id: stockId,
          measure_code: measureCode, // Valid: EPS, CPS, CPX, DPS, EBI, EBT, GPS, GRM, NAV, NDT, NET, PRE, ROA, ROE, SAL
          period_type: periodType,   // Valid: Annual, Interim
          data_type: dataType,       // Valid: Actuals, Estimates
          age: age                   // Valid: OneWeekAgo, ThirtyDaysAgo, SixtyDaysAgo, NinetyDaysAgo, Current
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${measureCode} forecasts for ${stockId}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get detailed mutual fund information
  async getMutualFundDetails(fundName) {
    try {
      const response = await apiClient.get('/mutual_funds_details', {
        params: { stock_name: fundName }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for mutual fund ${fundName}:`, error.message);
      if (error.response) {
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Get all financial ratios for a stock with caching
  async getFinancialRatios(stockName) {
    // Generate cache key
    const cacheKey = generateCacheKey('financial_ratios', { stockName });
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
    
    try {
      // Create an empty result object with null values
      const result = {
        pe_ratio: null,
        pb_ratio: null,
        ev_ebitda: null,
        roe: null,
        net_profit_margin: null,
        gross_profit_margin: null
      };
      
      // Get basic stock details first to extract any available ratios
      try {
        const stockDetails = await this.getStockBySymbol(stockName);
        if (stockDetails) {
          // Extract any financial ratios from stock details if available
          if (stockDetails.pe_ratio) result.pe_ratio = stockDetails.pe_ratio;
          if (stockDetails.pb_ratio) result.pb_ratio = stockDetails.pb_ratio;
          if (stockDetails.ev_ebitda) result.ev_ebitda = stockDetails.ev_ebitda;
          if (stockDetails.roe) result.roe = stockDetails.roe;
        }
      } catch (error) {
        console.error(`Error fetching stock details for ratios: ${error.message}`);
      }
      
      // Use Promise.allSettled to handle multiple API calls efficiently
      // This allows us to proceed even if some of the API calls fail
      const [peRatioPromise, pbRatioPromise, evEbitdaPromise, quarterResultsPromise] = await Promise.allSettled([
        // Try to get P/E ratio from historical data
        this.getHistoricalData(stockName, '1yr', 'pe').catch(err => {
          console.error(`PE ratio fetch error: ${err.message}`);
          return null;
        }),
        
        // Try to get P/B ratio from historical data
        this.getHistoricalData(stockName, '1yr', 'ptb').catch(err => {
          console.error(`PB ratio fetch error: ${err.message}`);
          return null;
        }),
        
        // Try to get EV/EBITDA ratio from historical data
        this.getHistoricalData(stockName, '1yr', 'evebitda').catch(err => {
          console.error(`EV/EBITDA fetch error: ${err.message}`);
          return null;
        }),
        
        // Try to get quarterly results for margin calculations
        this.getFinancialStatement(stockName, 'quarter_results').catch(err => {
          console.error(`Quarter results fetch error: ${err.message}`);
          return null;
        })
      ]);
      
      // Extract P/E ratio if available
      if (peRatioPromise.status === 'fulfilled' && peRatioPromise.value?.datasets) {
        const peDataset = peRatioPromise.value.datasets.find(d => d.metric === 'Price to Earning');
        if (peDataset?.values?.length > 0) {
          result.pe_ratio = peDataset.values[peDataset.values.length - 1][1];
        }
      }
      
      // Extract P/B ratio if available
      if (pbRatioPromise.status === 'fulfilled' && pbRatioPromise.value?.datasets) {
        const pbDataset = pbRatioPromise.value.datasets.find(d => d.metric === 'Price to book value');
        if (pbDataset?.values?.length > 0) {
          result.pb_ratio = pbDataset.values[pbDataset.values.length - 1][1];
        }
      }
      
      // Extract EV/EBITDA ratio if available
      if (evEbitdaPromise.status === 'fulfilled' && evEbitdaPromise.value?.datasets) {
        const evEbitdaDataset = evEbitdaPromise.value.datasets.find(d => d.metric === 'EV Multiple');
        if (evEbitdaDataset?.values?.length > 0) {
          result.ev_ebitda = evEbitdaDataset.values[evEbitdaDataset.values.length - 1][1];
        }
      }
      
      // Calculate profit margins if quarterly results are available
      if (quarterResultsPromise.status === 'fulfilled' && quarterResultsPromise.value) {
        const quarterResults = quarterResultsPromise.value;
        
        // Calculate net profit margin
        if (quarterResults.sales && quarterResults.net_profit) {
          const sales = parseFloat(quarterResults.sales.replace(/,/g, ''));
          const netProfit = parseFloat(quarterResults.net_profit.replace(/,/g, ''));
          if (!isNaN(sales) && !isNaN(netProfit) && sales > 0) {
            result.net_profit_margin = (netProfit / sales) * 100;
          }
        }
        
        // Calculate gross profit margin
        if (quarterResults.sales && quarterResults.operating_profit) {
          const sales = parseFloat(quarterResults.sales.replace(/,/g, ''));
          const operatingProfit = parseFloat(quarterResults.operating_profit.replace(/,/g, ''));
          if (!isNaN(sales) && !isNaN(operatingProfit) && sales > 0) {
            result.gross_profit_margin = (operatingProfit / sales) * 100;
          }
        }
      }
      
      // Cache the financial ratios - these change less frequently
      await cacheService.set(cacheKey, result, DEFAULT_TTL.FINANCIAL_DATA);
      
      return result;
    } catch (error) {
      console.error(`Error fetching financial ratios for ${stockName}:`, error.message);
      // Return partial data if we have any, otherwise rethrow
      if (result && Object.values(result).some(v => v !== null)) {
        return result;
      }
      throw error;
    }
  }
};

module.exports = stockApiService; 