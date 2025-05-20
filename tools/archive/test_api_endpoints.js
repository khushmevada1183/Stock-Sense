/**
 * Test script to verify all API endpoints are working correctly
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');

// Get API key
const API_KEY = apiKeyManager.getCurrentKey();
console.log(`Using API key: ${API_KEY.substring(0, 8)}...`);

// Test symbol
const TEST_SYMBOL = 'ireda';

async function testApiEndpoints() {
  try {
    console.log(`\n=== TESTING API ENDPOINTS FOR SYMBOL: ${TEST_SYMBOL} ===\n`);

    // Initialize response variables
    let directResponse = null;
    let stockResponse = null;
    let searchResponse = null;
    
    // Test direct API call to external API
    console.log("1. Testing direct external API call...");
    directResponse = await axios.get('https://stock.indianapi.in/stock', {
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

    // Test our backend /api/stock/:symbol endpoint
    console.log("\n2. Testing our backend /api/stock/:symbol endpoint...");
    console.log(`   - Making request to: http://localhost:5002/api/stock/${TEST_SYMBOL}`);
    
    try {
      stockResponse = await axios.get(`http://localhost:5002/api/stock/${TEST_SYMBOL}`);
      
      console.log(`   - Status: ${stockResponse.status}`);
      console.log(`   - Response structure: ${stockResponse.data ? 'Valid JSON' : 'Invalid'}`);
      
      if (stockResponse.data && stockResponse.data.data) {
        const stockData = stockResponse.data.data;
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
    } catch (stockError) {
      console.error(`   - Error calling /api/stock/:symbol endpoint: ${stockError.message}`);
      if (stockError.response) {
        console.error(`   - Status: ${stockError.response.status}`);
        console.error(`   - Response: ${JSON.stringify(stockError.response.data)}`);
        }
    }
    
    // Test our backend /api/stocks/search endpoint
    console.log("\n3. Testing our backend /api/stocks/search endpoint...");
    console.log(`   - Making request to: http://localhost:5002/api/stocks/search?query=${TEST_SYMBOL}`);
    
    try {
      searchResponse = await axios.get(`http://localhost:5002/api/stocks/search`, {
        params: { query: TEST_SYMBOL }
      });
      
      console.log(`   - Status: ${searchResponse.status}`);
      console.log(`   - Response structure: ${searchResponse.data ? 'Valid JSON' : 'Invalid'}`);
      
      if (searchResponse.data && searchResponse.data.data && searchResponse.data.data.results) {
        const results = searchResponse.data.data.results;
        console.log(`   - Results count: ${results.length}`);
        
        if (results.length > 0) {
          const firstResult = results[0];
          console.log(`   - First result company name: ${firstResult.companyName || 'Not found'}`);
          console.log(`   - First result symbol: ${firstResult.symbol || 'Not found'}`);
          console.log(`   - First result latest price: ${firstResult.latestPrice || 'Not found'}`);
        }
      } else {
        console.log(`   - No search results in response`);
      }
    } catch (searchError) {
      console.error(`   - Error calling /api/stocks/search endpoint: ${searchError.message}`);
      if (searchError.response) {
        console.error(`   - Status: ${searchError.response.status}`);
        console.error(`   - Response: ${JSON.stringify(searchError.response.data)}`);
        }
    }
    
    console.log("\n=== TEST SUMMARY ===");
    console.log("1. External API: Working correctly");
    console.log("2. Backend /api/stock/:symbol endpoint: " + 
      (stockResponse && stockResponse.status === 200 ? "Working correctly" : "Not working - check server logs"));
    console.log("3. Backend /api/stocks/search endpoint: " + 
      (searchResponse && searchResponse.status === 200 ? "Working correctly" : "Not working - check server logs"));
    
    console.log("\nIf any endpoint is not working, make sure the backend server is running with:");
    console.log("cd stock-analyzer/backend && npm start");
    
  } catch (error) {
    console.error("\nERROR:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testApiEndpoints(); 