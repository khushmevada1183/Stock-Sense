/**
 * Test implementation for stock search using the /stock endpoint
 */

const axios = require('axios');
const apiKeyManager = require('./apiKeyManager');

// API base URL
const API_URL = 'https://stock.indianapi.in';

// Simple cache for demonstration
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Implementation of stock search
async function searchStocks(query) {
  if (!query) return { results: [] };
  
  // Clean the search query
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return { results: [] };
  
  // Check cache first
  const cacheKey = `stock_${cleanQuery.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData.expires > Date.now()) {
      console.log(`Using cached data for ${cleanQuery}`);
      return cachedData.data;
    } else {
      // Cache expired
      cache.delete(cacheKey);
    }
  }
  
  try {
    console.log(`Fetching stock data for "${cleanQuery}" from API`);
    
    // Get the API key from the rotation manager
    const API_KEY = apiKeyManager.getCurrentKey();
    
    // Make the API call to the /stock endpoint
    const response = await axios.get(`${API_URL}/stock`, {
      params: { name: cleanQuery },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    const stockData = response.data;
    
    // Record successful API use
    apiKeyManager.recordSuccessfulUse();
    
    // Format the response to match what our frontend expects
    const formattedResult = {
      results: [{
        symbol: stockData.companyName?.split(' ')[0] || cleanQuery,
        companyName: stockData.companyName || '',
        latestPrice: stockData.currentPrice?.BSE || stockData.currentPrice?.NSE || 0,
        change: stockData.percentChange?.percent_change || 0,
        changePercent: stockData.percentChange?.percent_change || 0,
        sector: stockData.industry || '',
        // Add more fields as needed
        
        // Include the full stock data for the details page
        fullData: stockData
      }]
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: formattedResult,
      expires: Date.now() + CACHE_TTL
    });
    
    return formattedResult;
  } catch (error) {
    console.error(`Error fetching stock data for "${cleanQuery}":`, error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    // Return empty result on error
    return { results: [] };
  }
}

// Export for testing
module.exports = {
  searchStocks
};

// Test the implementation if this file is run directly
if (require.main === module) {
  // Test with a few examples
  (async () => {
    const testQueries = ['ireda', 'tata steel', 'nonexistent'];
    
    for (const query of testQueries) {
      console.log(`\n\nTesting search for "${query}":`);
      const result = await searchStocks(query);
      console.log(JSON.stringify(result, null, 2));
    }
  })();
} 