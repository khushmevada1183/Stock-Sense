/**
 * Test script to verify the stock details endpoint
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');

// Get API key
const API_KEY = apiKeyManager.getCurrentKey();
console.log(`Using API key: ${API_KEY.substring(0, 8)}...`);

// Test symbol
const TEST_SYMBOL = 'ireda';

async function testStockEndpoint() {
  try {
    console.log(`\nTesting stock details endpoint for symbol: ${TEST_SYMBOL}\n`);
    
    // Test direct API call
    console.log("1. Testing direct API call...");
    const directResponse = await axios.get('https://stock.indianapi.in/stock', {
      params: { name: TEST_SYMBOL },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    console.log(`   - Status: ${directResponse.status}`);
    console.log(`   - Has data: ${!!directResponse.data}`);
    
    if (directResponse.data) {
      console.log(`   - Company name: ${directResponse.data.companyName || 'Not found'}`);
      console.log(`   - Has price data: ${!!directResponse.data.currentPrice}`);
      if (directResponse.data.currentPrice) {
        console.log(`   - BSE price: ${directResponse.data.currentPrice.BSE || 'N/A'}`);
        console.log(`   - NSE price: ${directResponse.data.currentPrice.NSE || 'N/A'}`);
      }
    }
    
    // Test our backend endpoint
    console.log("\n2. Testing our backend API endpoint...");
    // Start the server if not already running
    console.log(`   - Making request to: http://localhost:5002/api/stocks/${TEST_SYMBOL}`);
    
    try {
      const backendResponse = await axios.get(`http://localhost:5002/api/stocks/${TEST_SYMBOL}`);
      
      console.log(`   - Status: ${backendResponse.status}`);
      console.log(`   - Response structure: ${backendResponse.data ? 'Valid JSON' : 'Invalid'}`);
      
      if (backendResponse.data && backendResponse.data.data) {
        const stockData = backendResponse.data.data;
        console.log(`   - Company name: ${stockData.companyName || 'Not found'}`);
        console.log(`   - Symbol: ${stockData.symbol || 'Not found'}`);
        console.log(`   - Latest price: ${stockData.latestPrice || 'Not found'}`);
        console.log(`   - Has current price object: ${!!stockData.currentPrice}`);
        
        if (stockData.currentPrice) {
          console.log(`   - BSE price: ${stockData.currentPrice.BSE || 'N/A'}`);
          console.log(`   - NSE price: ${stockData.currentPrice.NSE || 'N/A'}`);
        }
      } else {
        console.log(`   - No stock data in response`);
      }
    } catch (backendError) {
      console.error(`   - Error calling backend: ${backendError.message}`);
      if (backendError.response) {
        console.error(`   - Status: ${backendError.response.status}`);
        console.error(`   - Response: ${JSON.stringify(backendError.response.data)}`);
      }
      
      console.log("\n   Backend server might not be running. Start it with 'npm start' or 'node server.js'");
    }
    
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testStockEndpoint(); 