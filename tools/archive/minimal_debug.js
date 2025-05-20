/**
 * Minimal debug script to check only the critical parts
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');

// Get API key
const API_KEY = apiKeyManager.getCurrentKey();
console.log(`Using API key: ${API_KEY.substring(0, 8)}...`);

// Test query
const QUERY = 'ireda';

async function minimalDebug() {
  try {
    console.log(`\nDirect API test for query: "${QUERY}"\n`);
    
    // Direct API call
    const response = await axios.get('https://stock.indianapi.in/stock', {
      params: { name: QUERY },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    // Extract critical fields
    if (response.data) {
      const data = response.data;
      console.log(`Company name: ${data.companyName || 'Not found'}`);
      
      if (data.currentPrice) {
        console.log(`Price (BSE): ${data.currentPrice.BSE || 'N/A'}`);
        console.log(`Price (NSE): ${data.currentPrice.NSE || 'N/A'}`);
      } else {
        console.log(`Price: Not found in response`);
      }
      
      console.log(`Percent change: ${data.percentChange || 'N/A'}`);
      
      if (data.stockTechnicalData && data.stockTechnicalData.length > 0) {
        console.log(`Technical data price: ${data.stockTechnicalData[0].bsePrice || 'N/A'}`);
      }
    } else {
      console.log(`No data returned from API`);
    }
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
    }
  }
}

// Run debug
minimalDebug(); 