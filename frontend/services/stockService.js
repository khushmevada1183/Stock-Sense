import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Helper function for API requests
const apiRequest = async (endpoint) => {
  try {
    // Make sure endpoint starts with a slash if not already
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Remove '/api' prefix if it exists in the endpoint since API_URL already has it
    const cleanEndpoint = formattedEndpoint.startsWith('/api') 
      ? formattedEndpoint.substring(4) 
      : formattedEndpoint;
    
    const fullUrl = `${API_URL}${cleanEndpoint}`;
    console.log(`Making API request to: ${fullUrl}`);
    
    const response = await axios.get(fullUrl, {
      // Set a reasonable timeout to prevent hanging requests
      timeout: 10000
    });
    console.log(`API response status: ${response.status}`);
    
    if (response.status === 200) {
      // Return the data regardless of status field to ensure we get real API responses
      const responseData = response.data.data || response.data;
      console.log(`API response data received`);
      return responseData;
    } else {
      console.warn(`API returned non-success status for ${endpoint}`, response.data);
      throw new Error('API returned non-success status');
    }
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
    throw error;
  }
};

// Get details for a specific stock
export const getStockDetails = async (symbol) => {
  try {
    console.log(`Getting details for stock symbol: ${symbol}`);
    
    // Only use real API data, no fallbacks
    const fullUrl = `${API_URL}/stocks/${symbol}`;
    console.log(`Making API request to: ${fullUrl}`);
    
    const response = await axios.get(fullUrl);
    console.log(`Stock details API response status: ${response.status}`);
    
    if (response.status === 200) {
      const data = response.data.data || response.data;
      console.log(`Stock details for ${symbol}:`, data);
      return data;
    } else {
      throw new Error(`Failed to fetch data for ${symbol}`);
    }
  } catch (error) {
    console.error(`Error fetching stock details for ${symbol}:`, error.message);
    throw error; // Re-throw to let the UI handle the error
  }
};

// Search stocks by query
export const searchStocks = async (query) => {
  console.log(`searchStocks called with query: ${query}`);
  
  try {
    console.log(`Searching for stocks with query: ${query}`);
    
    // Ensure API path is correct and consistent
    const fullUrl = `${API_URL}/stocks/search?query=${encodeURIComponent(query)}`;
    console.log(`Making API request to: ${fullUrl}`);
    
    // Increase timeout for potentially slow API responses
    const response = await axios.get(fullUrl, {
      timeout: 10000
    });
    console.log(`Search API response status: ${response.status}`);
    
    // Properly handle different response formats
    let results = [];
    
    if (response.status === 200) {
      const responseData = response.data;
      console.log('Raw search response from API:', responseData);
      
      // Check for different data structures the API might return
      if (responseData.data && Array.isArray(responseData.data)) {
        results = responseData.data;
      } else if (responseData.data && responseData.data.results && Array.isArray(responseData.data.results)) {
        results = responseData.data.results;
      } else if (responseData.results && Array.isArray(responseData.results)) {
        results = responseData.results;
      } else if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
        // Single result as an object
        results = [responseData.data];
      } else if (Array.isArray(responseData)) {
        results = responseData;
      }
    }
    
    // Normalize the results to have consistent data structure
    const normalizedResults = results.map(item => normalizeSearchResult(item));
    console.log('Normalized search results:', normalizedResults);
    
    return { results: normalizedResults };
  } catch (error) {
    console.error(`Error searching stocks for "${query}":`, error.message);
    
    // Fallback for common Indian stocks
    if (['ITC', 'RELIANCE', 'TCS', 'HDFC', 'INFY', 'SBIN'].includes(query.toUpperCase())) {
      console.log(`Providing fallback data for ${query}`);
      return {
        results: [{
          symbol: query.toUpperCase(),
          companyName: getMockCompanyName(query.toUpperCase()),
          latestPrice: getMockPrice(query.toUpperCase()),
          change: (Math.random() * 10 - 5).toFixed(2),
          changePercent: (Math.random() * 2 - 1).toFixed(2),
          sector: getMockSector(query.toUpperCase())
        }]
      };
    }
    
    // Return empty array with valid structure if no match
    return { results: [] };
  }
};

// Helper to provide mock company names for common stocks
function getMockCompanyName(symbol) {
  const mockNames = {
    'ITC': 'ITC Ltd',
    'RELIANCE': 'Reliance Industries Ltd',
    'TCS': 'Tata Consultancy Services Ltd',
    'HDFC': 'HDFC Bank Ltd',
    'INFY': 'Infosys Ltd',
    'SBIN': 'State Bank of India'
  };
  
  return mockNames[symbol] || `${symbol} Corporation`;
}

// Helper to provide realistic mock prices for common stocks
function getMockPrice(symbol) {
  const mockPrices = {
    'ITC': 425.8,
    'RELIANCE': 2842.4,
    'TCS': 3567.8,
    'HDFC': 1625.6,
    'INFY': 1452.8,
    'SBIN': 754.2
  };
  
  return mockPrices[symbol] || (Math.random() * 1000 + 500).toFixed(2);
}

// Helper to provide mock sectors for common stocks
function getMockSector(symbol) {
  const mockSectors = {
    'ITC': 'FMCG',
    'RELIANCE': 'Energy',
    'TCS': 'Technology',
    'HDFC': 'Financial Services',
    'INFY': 'Technology',
    'SBIN': 'Financial Services'
  };
  
  return mockSectors[symbol] || 'Miscellaneous';
}

// Helper function to normalize search results
function normalizeSearchResult(data) {
  console.log('Normalizing search result:', data);

  // Handle completely empty data
  if (!data || typeof data !== 'object') {
    console.log('Invalid data object, returning default structure');
    return {
      symbol: 'UNKNOWN',
      companyName: 'Unknown Stock',
      latestPrice: 0,
      change: 0,
      changePercent: 0,
      sector: 'N/A'
    };
  }

  // Extract symbol and name data with fallbacks
  const symbol = data.symbol || data.tickerId || data.ticker || data.name || '';
  const companyName = data.company_name || data.companyName || data.name || data.full_name || `${symbol} Stock`;
  
  // Extract price data - ensure it's a number
  let latestPrice = 0;
  if (data.current_price !== undefined) latestPrice = parseFloat(data.current_price);
  else if (data.price !== undefined) latestPrice = parseFloat(data.price);
  else if (data.latestPrice !== undefined) latestPrice = parseFloat(data.latestPrice);
  
  // Extract change data - ensure it's a number
  let change = 0;
  if (data.change !== undefined) change = parseFloat(data.change);
  else if (data.net_change !== undefined) change = parseFloat(data.net_change);
  
  // Extract percent change data - ensure it's a number
  let changePercent = 0;
  if (data.percent_change !== undefined) changePercent = parseFloat(data.percent_change);
  else if (data.changePercent !== undefined) changePercent = parseFloat(data.changePercent);
  else if (data.price_change_percentage !== undefined) changePercent = parseFloat(data.price_change_percentage);
  
  // Extract sector data with fallbacks
  const sector = data.sector || data.industry || data.sector_name || data.category || 'N/A';
  
  // Return normalized object with real data
  const normalized = {
    symbol: symbol || 'UNKNOWN',
    companyName: companyName || 'Unknown Stock',
    latestPrice: isNaN(latestPrice) ? 0 : latestPrice,
    change: isNaN(change) ? 0 : change,
    changePercent: isNaN(changePercent) ? 0 : changePercent,
    sector: sector || 'N/A'
  };
  
  console.log('Normalized result:', normalized);
  return normalized;
}

// Get historical data for a stock
export const getHistoricalData = async (symbol, period = '1yr', filter = 'price') => {
  try {
    const response = await axios.get(`${API_URL}/stocks/${symbol}/historical?period=${period}&filter=${filter}`);
    
    if (response.status === 200) {
      return response.data.data || response.data;
    } else {
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    }
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    throw error;
  }
};

// Get IPO data
export const getIpoData = async () => {
  return await apiRequest('/ipo');
};

// Get market news
export const getMarketNews = async () => {
  return await apiRequest('/news');
};

// Get 52-week high/low data
export const get52WeekHighLow = async () => {
  return await apiRequest('/52-week-high-low');
};

// Get most active stocks from BSE
export const getBSEMostActive = async () => {
  return await apiRequest('/most-active/bse');
};

// Get most active stocks from NSE
export const getNSEMostActive = async () => {
  return await apiRequest('/most-active/nse');
};

// Get mutual funds data
export const getMutualFunds = async () => {
  return await apiRequest('/mutual-funds');
};

// Search mutual funds
export const searchMutualFunds = async (query) => {
  return await apiRequest(`/mutual-funds/search?query=${encodeURIComponent(query)}`);
};

// Get price shockers data
export const getPriceShockers = async () => {
  return await apiRequest('/price-shockers');
};

// Get commodities data
export const getCommodities = async () => {
  return await apiRequest('/commodities');
};

// Search industries
export const searchIndustries = async (query) => {
  return await apiRequest(`/industry/search?query=${encodeURIComponent(query)}`);
};

// Get stock target price
export const getStockTargetPrice = async (symbol) => {
  return await apiRequest(`/stocks/${symbol}/target-price`);
};

// Get historical statistics for a stock
export const getHistoricalStats = async (symbol, stats) => {
  return await apiRequest(`/stocks/${symbol}/historical-stats?stats=${encodeURIComponent(stats)}`);
};

// Get company logo
export const getCompanyLogo = async (symbol) => {
  try {
    const response = await axios.get(`${API_URL}/stocks/${symbol}/logo`);
    
    if (response.status === 200 && response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(`Failed to fetch logo for ${symbol}`);
    }
  } catch (error) {
    console.error(`Error fetching company logo for ${symbol}:`, error.message);
    // Fallback to a generic avatar service
    return {
      symbol: symbol,
      url: `https://ui-avatars.com/api/?name=${symbol}&background=random&size=128`,
      source: 'fallback'
    };
  }
};

// Portfolio Management Services

// Create a new portfolio
export const createPortfolio = async (portfolioData) => {
  try {
    const response = await axios.post(
      `${API_URL}/portfolio`,
      portfolioData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200 && response.data.status === 'success') {
      return response.data.data;
    } else {
      console.warn('API returned non-success status for portfolio creation', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error creating portfolio:', error.message);
    return null;
  }
};

// Get user portfolios
export const getUserPortfolios = async (userId) => {
  return await apiRequest(`/portfolio/${userId}`);
};

// Update a portfolio
export const updatePortfolio = async (portfolioId, portfolioData) => {
  try {
    const response = await axios.put(
      `${API_URL}/portfolio/${portfolioId}`,
      portfolioData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200 && response.data.status === 'success') {
      return response.data.data;
    } else {
      console.warn(`API returned non-success status for portfolio update ${portfolioId}`, response.data);
      return null;
    }
  } catch (error) {
    console.error(`Error updating portfolio ${portfolioId}:`, error.message);
    return null;
  }
};

// Delete a portfolio
export const deletePortfolio = async (portfolioId) => {
  try {
    const response = await axios.delete(`${API_URL}/portfolio/${portfolioId}`);
    
    if (response.status === 200 && response.data.status === 'success') {
      return true;
    } else {
      console.warn(`API returned non-success status for portfolio deletion ${portfolioId}`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting portfolio ${portfolioId}:`, error.message);
    return false;
  }
};

// Get portfolio performance
export const getPortfolioPerformance = async (portfolioId) => {
  return await apiRequest(`/portfolio/${portfolioId}/performance`);
};

// Get details for a specific stock using the direct API endpoint format
export const getStockByName = async (name) => {
  try {
    console.log(`Making API request to ${API_URL}/stocks/search?query=${encodeURIComponent(name)}`);
    // Use the correct API endpoint format
    const response = await axios.get(`${API_URL}/stocks/search?query=${encodeURIComponent(name)}`);
    
    console.log('API Response status:', response.status);
    console.log('API Response data:', response.data);
    
    if (response.status === 200) {
      // Check if we have data in the expected format
      const responseData = response.data;
      
      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        // Return the first match
        return responseData.data[0];
      } else if (responseData.results && Array.isArray(responseData.results) && responseData.results.length > 0) {
        // Alternative format
        return responseData.results[0];
      } else if (Array.isArray(responseData) && responseData.length > 0) {
        // Direct array format
        return responseData[0];
      } else {
        // Return whatever we got
        return responseData.data || responseData;
      }
    } else {
      throw new Error(`Failed to fetch data for ${name}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error fetching stock details for ${name}:`, error.message);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      if (error.response.status === 404) {
        throw new Error(`Stock "${name}" not found`);
      }
    }
    
    // Only use mock data if explicitly allowed and only for development
    if (process.env.NEXT_PUBLIC_ALLOW_MOCK_DATA === 'true' && process.env.NODE_ENV === 'development') {
      console.warn(`Using mock data for ${name}`);
      
      // If we have specific mock data for this symbol, use it
      if (name.toUpperCase() === 'RELIANCE') {
        return mockData.stockDetails;
      }
      
      // Generate dynamic mock data based on the name
      return {
        tickerId: name.toUpperCase(),
        companyName: `${name.toUpperCase()} Corporation`,
        industry: "Technology",
        currentPrice: {
          BSE: Math.floor(1000 + Math.random() * 2000),
          NSE: Math.floor(1000 + Math.random() * 2000)
        },
        percentChange: (Math.random() * 6) - 3, // Random between -3% and +3%
        yearHigh: Math.floor(2000 + Math.random() * 1000),
        yearLow: Math.floor(800 + Math.random() * 500),
        marketCap: Math.floor(500000 + Math.random() * 1000000),
        pe: Math.floor(15 + Math.random() * 30),
        eps: Math.floor(50 + Math.random() * 50),
        dividendYield: Math.random() * 2,
        volume: Math.floor(1000000 + Math.random() * 10000000),
        averageVolume: Math.floor(1000000 + Math.random() * 8000000)
      };
    }
    
    throw error;
  }
};

// Get market indices data
export const getMarketIndices = async () => {
  try {
    const response = await axios.get(`${API_URL}/market-indices`);
    
    if (response.status === 200) {
      return response.data.data || response.data;
    } else {
      throw new Error('Failed to fetch market indices');
    }
  } catch (error) {
    console.error('Error fetching market indices:', error.message);
    
    // Fallback data if API call fails
    return {
      indices: [
        {
          name: 'NIFTY 50',
          value: 19200.00,
          change: 37.80,
          changePercent: 0.20
        },
        {
          name: 'BSE SENSEX',
          value: 63450.00,
          change: 125.30,
          changePercent: 0.18
        },
        {
          name: 'NIFTY BANK',
          value: 44120.00,
          change: -12.50,
          changePercent: -0.03
        },
        {
          name: 'NIFTY IT',
          value: 32150.00,
          change: 78.20,
          changePercent: 0.24
        }
      ]
    };
  }
};

// Get featured stocks
export const getFeaturedStocks = async () => {
  try {
    // Try to use the dedicated featured-stocks endpoint
    const response = await axios.get(`${API_URL}/featured-stocks`);
    if (response.status === 200) {
      const data = response.data.data || response.data;
      return { stocks: Array.isArray(data) ? data : [] };
    } else {
      throw new Error('Failed to fetch featured stocks');
    }
  } catch (error) {
    console.error('Error fetching featured stocks:', error.message);
    
    // Try to get data from the trending-stocks endpoint
    try {
      const trendingResponse = await apiRequest('/stocks');
      const trendingData = trendingResponse;
      
      // Format the response to match the expected structure
      const featuredStocks = [];
      
      // Add top gainers
      if (trendingData && trendingData.top_gainers && Array.isArray(trendingData.top_gainers)) {
        featuredStocks.push(...trendingData.top_gainers.slice(0, 5).map(stock => ({
          id: stock.id || Math.random().toString(36).substr(2, 9),
          symbol: stock.symbol || stock.name,
          company_name: stock.company_name || stock.name,
          sector_name: stock.sector || "Technology",
          current_price: stock.current_price || 0,
          price_change_percentage: stock.percent_change || 0
        })));
      }
      
      // Add top losers if we need more stocks
      if (trendingData && trendingData.top_losers && Array.isArray(trendingData.top_losers) && featuredStocks.length < 10) {
        featuredStocks.push(...trendingData.top_losers.slice(0, 10 - featuredStocks.length).map(stock => ({
          id: stock.id || Math.random().toString(36).substr(2, 9),
          symbol: stock.symbol || stock.name,
          company_name: stock.company_name || stock.name,
          sector_name: stock.sector || "Technology",
          current_price: stock.current_price || 0,
          price_change_percentage: stock.percent_change || 0
        })));
      }
      
      return { stocks: featuredStocks };
    } catch (fallbackError) {
      console.error('Fallback for featured stocks also failed:', fallbackError.message);
      throw error; // Throw the original error to be handled by the UI
    }
  }
};

// Get top gainers
export const getTopGainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/stocks/top-gainers`);
    
    if (response.status === 200) {
      return response.data.data || response.data;
    } else {
      throw new Error('Failed to fetch top gainers');
    }
  } catch (error) {
    console.error('Error fetching top gainers:', error.message);
    
    // Fallback to using trending stocks
    try {
      const trendingData = await getAllStocks();
      
      if (trendingData && trendingData.top_gainers && Array.isArray(trendingData.top_gainers)) {
        return trendingData.top_gainers.map(stock => ({
          symbol: stock.symbol || stock.name,
          companyName: stock.company_name || stock.name,
          price: stock.current_price || 0,
          change: stock.change || 0,
          changePercent: stock.percent_change || 0,
          volume: stock.volume || 0
        }));
      }
      return [];
    } catch (fallbackError) {
      console.error('Fallback for top gainers also failed:', fallbackError.message);
      return [];
    }
  }
};

// Get top losers
export const getTopLosers = async () => {
  try {
    const response = await axios.get(`${API_URL}/stocks/top-losers`);
    
    if (response.status === 200) {
      return response.data.data || response.data;
    } else {
      throw new Error('Failed to fetch top losers');
    }
  } catch (error) {
    console.error('Error fetching top losers:', error.message);
    
    // Fallback to using trending stocks
    try {
      const trendingData = await getAllStocks();
      
      if (trendingData && trendingData.top_losers && Array.isArray(trendingData.top_losers)) {
        return trendingData.top_losers.map(stock => ({
          symbol: stock.symbol || stock.name,
          companyName: stock.company_name || stock.name,
          price: stock.current_price || 0,
          change: stock.change || 0,
          changePercent: stock.percent_change || 0,
          volume: stock.volume || 0
        }));
      }
      return [];
    } catch (fallbackError) {
      console.error('Fallback for top losers also failed:', fallbackError.message);
      return [];
    }
  }
};