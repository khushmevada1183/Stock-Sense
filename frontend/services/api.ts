import axios from 'axios';

// Get API URL from localStorage if available, otherwise use default
let API_URL;

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  API_URL = localStorage.getItem('api_url') || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
} else {
  API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
}

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if API_URL has been updated in sessionStorage
    if (typeof window !== 'undefined') {
      const tempApiUrl = sessionStorage.getItem('temp_api_url');
      if (tempApiUrl) {
        config.baseURL = tempApiUrl;
      }
    }
    
    // Add authentication token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Stock service
export const stockService = {
  // Get featured stocks
  getFeaturedStocks: async () => {
    try {
      const response = await api.get('/stocks');
      
      // Extract data from the API response
      const apiData = response.data.data || response.data;
      
      // Transform the data into the format expected by the frontend
      let stocks: any[] = [];
      
      // Check if we have top_gainers or top_losers in the response
      if (apiData.top_gainers || apiData.top_losers) {
        // Combine top gainers and losers
        const allStocks = [
          ...(apiData.top_gainers || []),
          ...(apiData.top_losers || [])
        ];
        
        // Transform each stock into the expected format
        stocks = allStocks.map((stock, index) => ({
          id: index + 1, // Generate a unique ID
          symbol: stock.ticker_id || stock.ric || `STOCK${index}`,
          company_name: stock.company_name || 'Unknown Company',
          sector_name: stock.sector || stock.exchange_type || 'Various',
          current_price: parseFloat(stock.price) || 0,
          price_change_percentage: parseFloat(stock.percent_change) || 0
        }));
      } else if (Array.isArray(apiData)) {
        // If the API returns an array directly
        stocks = apiData.map((stock, index) => ({
          id: stock.id || index + 1,
          symbol: stock.symbol || stock.ticker_id || `STOCK${index}`,
          company_name: stock.company_name || stock.name || 'Unknown Company',
          sector_name: stock.sector_name || stock.sector || 'Various',
          current_price: parseFloat(stock.current_price || stock.price) || 0,
          price_change_percentage: parseFloat(stock.price_change_percentage || stock.percent_change) || 0
        }));
      }
      
      return {
        stocks
      };
    } catch (error) {
      console.error('Error fetching featured stocks:', error);
      
      // Return empty array on error so the UI can handle it gracefully
      return { stocks: [] };
    }
  },
  
  // Get market overview
  getMarketOverview: async () => {
    try {
      const response = await api.get('/market/indices');
      return {
        indices: response.data.data
      };
    } catch (error) {
      console.error('Error fetching market overview:', error);
      throw error;
    }
  },
  
  // Get stock details
  getStockDetails: async (symbol: string) => {
    try {
      const response = await api.get(`/stocks/${symbol}`);
      return {
        stock: response.data.data
      };
    } catch (error) {
      console.error(`Error fetching stock details for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Get stock price history
  getStockPriceHistory: async (symbol: string, timeRange: string) => {
    try {
      // Map frontend timeRange to backend dataAge parameter
      let dataAge = 'ThirtyDaysAgo'; // Default
      switch (timeRange) {
        case '1W':
          dataAge = 'OneWeekAgo';
          break;
        case '3M':
          dataAge = 'NinetyDaysAgo';
          break;
        case '1Y':
          dataAge = 'SixtyDaysAgo'; // Using 60 days to simulate a year since real API may not have full year data
          break;
        default:
          dataAge = 'ThirtyDaysAgo';
      }
      
      const response = await api.get(`/stocks/${symbol}/historical?dataAge=${dataAge}`);
      const apiData = response.data.data;
      
      // Transform API data to our expected format
      const priceHistory = {
        dates: apiData.dates || [],
        prices: apiData.prices || [],
        volumes: apiData.volumes || []
      };
      
      // Format into the structure our frontend expects
      const transformedData = priceHistory.dates.map((date: string, index: number) => ({
        date,
        price: priceHistory.prices[index]
      }));
      
      return {
        symbol,
        timeRange,
        priceHistory: transformedData
      };
    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Get user watchlist
  getWatchlist: async () => {
    try {
      const response = await api.get('/watchlist');
      return {
        watchlist: response.data.data
      };
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },
  
  // Add stock to watchlist
  addToWatchlist: async (stockId: number) => {
    try {
      const response = await api.post('/watchlist', { stockId });
      return response.data;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },
  
  // Remove stock from watchlist
  removeFromWatchlist: async (stockId: number) => {
    try {
      const response = await api.delete(`/watchlist/${stockId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },
  
  // Search stocks
  searchStocks: async (query: string) => {
    try {
      // Get all stocks from our API
      const response = await api.get(`/stocks/search?query=${encodeURIComponent(query)}`);
      return {
        results: response.data.data || []
      };
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  },
  
  // Get IPO data
  getIpoData: async () => {
    try {
      const response = await api.get('/ipo');
      return {
        ipoData: response.data.data
      };
    } catch (error) {
      console.error('Error fetching IPO data:', error);
      throw error;
    }
  },
  
  // Get market news
  getMarketNews: async () => {
    try {
      const response = await api.get('/news');
      return {
        news: response.data.data
      };
    } catch (error) {
      console.error('Error fetching market news:', error);
      throw error;
    }
  }
};

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Export the API_URL for use in other components
export { API_URL };
export default api; 