/**
 * Test script to check IREDA search query results
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');

// API base URLs from the services
const INDIAN_API_URL = 'https://stock.indianapi.in';
const STOCK_API_URL = 'https://stock.indianapi.in';

// Get API key
const API_KEY = apiKeyManager.getCurrentKey();

// Log the API key being used (partial for security)
console.log(`Using API key: ${API_KEY.substring(0, 10)}...`);

async function searchStocks(query) {
  try {
    // Test Indian API stock search endpoint
    console.log(`\nTesting Indian API stock search endpoint for '${query}'...`);
    const indianApiResponse = await axios.get(`${INDIAN_API_URL}/stock_search`, {
      params: { query },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    console.log(`Indian API stock_search response for '${query}':`);
    console.log(JSON.stringify(indianApiResponse.data, null, 2));
  } catch (error) {
    console.error(`Error with Indian API stock_search for '${query}':`, error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }

  try {
    // Test regular stock API endpoint
    console.log(`\nTesting regular stock API endpoint for '${query}'...`);
    const stockApiResponse = await axios.get(`${STOCK_API_URL}/stock`, {
      params: { name: query },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    console.log(`Regular stock API response for '${query}':`);
    console.log(JSON.stringify(stockApiResponse.data, null, 2));
  } catch (error) {
    console.error(`Error with regular stock API for '${query}':`, error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

// Execute the search
searchStocks('ireda'); 