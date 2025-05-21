import axios from 'axios';

// Create a reusable axios instance with the base URL
const api = axios.create({
  baseURL: 'https://stock.indianapi.in',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    // Use a fresh API key from the backend config
    'X-Api-Key': 'sk-live-kQSxsVhWZyIk8sGy2gzXGBvi97RETSP88OOG2qt3',
  }
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // You can modify request config here
    console.log(`Making request to: ${config.baseURL}${config.url}`, config.params);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  response => {
    // You can modify response data here
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    // Handle errors globally
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.response.status, error.response.data);
      console.error('Failed URL:', error.config.url);
      console.error('Params:', error.config.params);
      
      // Handle specific error status codes
      switch (error.response.status) {
        case 429:
          console.error('Rate limit exceeded. Please try again later.');
          break;
        case 404:
          console.error('Resource not found. Check if the stock symbol exists.');
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('No response received from server.');
    } else {
      // Something else happened while setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for API calls
const apiHelpers = {
  /**
   * Try multiple API endpoints to search for stocks by name or symbol
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Search results
   */
  searchStocks: async (query) => {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Format query - trim and ensure uppercase for better results
    const formattedQuery = query.trim().toUpperCase();
    console.log(`Searching for stock: ${formattedQuery}`);
    
    // Try multiple endpoints in sequence
    const endpoints = [
      // Try stock-search endpoint first
      async () => {
        try {
          const response = await api.get('/stock-search', { params: { query: formattedQuery } });
          if (response.data?.results && response.data.results.length > 0) {
            console.log(`Found results using /stock-search`);
            return response.data.results;
          }
          return null;
        } catch (err) {
          console.log('stock-search endpoint failed');
          return null;
        }
      },
      
      // Try search endpoint (alternative)
      async () => {
        try {
          const response = await api.get('/search', { params: { q: formattedQuery } });
          if (response.data?.results && response.data.results.length > 0) {
            console.log(`Found results using /search`);
            return response.data.results;
          }
          return null;
        } catch (err) {
          console.log('search endpoint failed');
          return null;
        }
      }
    ];
    
    // Try each endpoint in sequence
    for (const attempt of endpoints) {
      const result = await attempt();
      if (result) return result;
    }
    
    // If all attempts fail, return empty array
    console.log(`No search results found for ${formattedQuery}`);
    return [];
  },

  /**
   * Try multiple approaches to get stock details by name or symbol
   * @param {string} nameOrSymbol - Stock name or symbol
   * @returns {Promise<Object|null>} - Stock details or null if not found
   */
  getStockDetails: async (nameOrSymbol) => {
    if (!nameOrSymbol) {
      console.error('Stock name or symbol is required');
      return null;
    }
    
    // Clean and format the input
    const stockInput = nameOrSymbol.trim();
    console.log(`Getting stock details for: ${stockInput}`);
    
    // Try different approaches in sequence
    const attempts = [
      // 1. Try with query parameters as is
      async () => {
        try {
          const response = await api.get('/stock', { params: { name: stockInput } });
          if (response.data && Object.keys(response.data).length > 0) {
            console.log(`Found stock with /stock?name=${stockInput}`);
            return response.data;
          }
          return null;
        } catch (err) {
          console.log(`Failed with /stock?name=${stockInput}`);
          return null;
        }
      },
      
      // 2. Try with uppercase
      async () => {
        try {
          const upperStock = stockInput.toUpperCase();
          const response = await api.get('/stock', { params: { name: upperStock } });
          if (response.data && Object.keys(response.data).length > 0) {
            console.log(`Found stock with /stock?name=${upperStock}`);
            return response.data;
          }
          return null;
        } catch (err) {
          console.log(`Failed with /stock?name=${stockInput.toUpperCase()}`);
          return null;
        }
      },
      
      // 3. Try with path parameter
      async () => {
        try {
          const response = await api.get(`/stock/${encodeURIComponent(stockInput)}`);
          if (response.data && Object.keys(response.data).length > 0) {
            console.log(`Found stock with /stock/${stockInput}`);
            return response.data;
          }
          return null;
        } catch (err) {
          console.log(`Failed with /stock/${stockInput}`);
          return null;
        }
      },
      
      // 4. Try with path parameter uppercase
      async () => {
        try {
          const upperStock = stockInput.toUpperCase();
          const response = await api.get(`/stock/${encodeURIComponent(upperStock)}`);
          if (response.data && Object.keys(response.data).length > 0) {
            console.log(`Found stock with /stock/${upperStock}`);
            return response.data;
          }
          return null;
        } catch (err) {
          console.log(`Failed with /stock/${stockInput.toUpperCase()}`);
          return null;
        }
      },
      
      // 5. Try with symbol endpoint 
      async () => {
        try {
          const response = await api.get(`/symbol/${encodeURIComponent(stockInput.toUpperCase())}`);
          if (response.data && Object.keys(response.data).length > 0) {
            console.log(`Found stock with /symbol/${stockInput.toUpperCase()}`);
            return response.data;
          }
          return null;
        } catch (err) {
          console.log(`Failed with /symbol/${stockInput.toUpperCase()}`);
          return null;
        }
      }
    ];
    
    // Try each method in sequence
    for (const attempt of attempts) {
      const result = await attempt();
      if (result) return result;
    }
    
    // If all attempts fail, try to search and use first result
    try {
      const searchResults = await apiHelpers.searchStocks(stockInput);
      if (searchResults && searchResults.length > 0) {
        const firstResult = searchResults[0];
        console.log(`Found stock via search results: ${firstResult.symbol}`);
        
        // If we only have basic info, try to get full details
        if (firstResult.symbol) {
          for (const attempt of attempts) {
            const result = await attempt(firstResult.symbol);
            if (result) return result;
          }
        }
        
        return firstResult;
      }
    } catch (err) {
      console.error('Search fallback failed:', err);
    }
    
    // If everything fails, return null
    console.error(`Failed to find stock data for: ${stockInput}`);
    return null;
  },

  /**
   * Get historical stock data
   * @param {string} symbol - Stock symbol
   * @param {string} range - Time range (e.g., '1d', '1w', '1m', '1y')
   * @returns {Promise<Array>} - Historical data points
   */
  getHistoricalData: async (symbol, range = '1m') => {
    if (!symbol) {
      console.error('Symbol is required for historical data');
      return [];
    }
    
    // Format symbol to uppercase
    const formattedSymbol = symbol.trim().toUpperCase();
    console.log(`Getting historical data for ${formattedSymbol}, range: ${range}`);
    
    try {
      // Try with standard historical-data endpoint
      const response = await api.get('/historical-data', { 
        params: { symbol: formattedSymbol, range } 
      });
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }
};

// Export both the axios instance and the helper methods
export { apiHelpers };
export default api; 