/**
 * Test script to check IREDA stock data with both endpoints to ensure we get price information
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');

// API base URL
const API_URL = 'https://stock.indianapi.in';

// Get API key
const API_KEY = apiKeyManager.getCurrentKey();

// Log the API key being used (partial for security)
console.log(`Using API key: ${API_KEY.substring(0, 10)}...`);

async function getStockDetails() {
  // Approach 1: Using /stock endpoint with name parameter (as shown in screenshot)
  try {
    console.log(`\nTesting /stock endpoint with name=ireda...`);
    const stockResponse = await axios.get(`${API_URL}/stock`, {
      params: { name: 'ireda' },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    // Extract and display just the price information
    const data = stockResponse.data;
    if (data && data.currentPrice) {
      console.log('\nCurrent Price from /stock endpoint:');
      console.log(JSON.stringify(data.currentPrice, null, 2));
      
      if (data.stockTechnicalData) {
        console.log('\nTechnical Price Data:');
        console.log(JSON.stringify(data.stockTechnicalData, null, 2));
      }
    } else {
      console.log('No price information found in the response');
      console.log('Full response structure:', Object.keys(data || {}));
    }
  } catch (error) {
    console.error(`Error with /stock endpoint:`, error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }

  // Approach 2: Using /stock_search endpoint with query parameter
  try {
    console.log(`\nTesting /stock_search endpoint with query=ireda...`);
    const searchResponse = await axios.get(`${API_URL}/stock_search`, {
      params: { query: 'ireda' },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    // Extract and log the results
    console.log('\nResults from /stock_search endpoint:');
    if (searchResponse.data && searchResponse.data.results) {
      console.log(JSON.stringify(searchResponse.data.results, null, 2));
    } else {
      console.log('No results found in search response');
      console.log('Full search response structure:', Object.keys(searchResponse.data || {}));
    }
  } catch (error) {
    console.error(`Error with /stock_search endpoint:`, error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

// Execute the search
getStockDetails(); 