/**
 * Quick debug script to identify the critical issue with stock search
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');
const stockApiService = require('./services/stockApi');

// Get the API key
const API_KEY = apiKeyManager.getCurrentKey();
console.log(`Using API key: ${API_KEY.substring(0, 8)}...`);

// Test query
const QUERY = 'ireda';

async function quickDebug() {
  try {
    console.log(`\nDEBUGGING SEARCH FOR: "${QUERY}"\n`);
    
    // Test direct API call
    console.log("1. Testing direct API call...");
    const directResponse = await axios.get('https://stock.indianapi.in/stock', {
      params: { name: QUERY },
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
    
    // Test our service
    console.log("\n2. Testing stockApiService.searchStocks...");
    const serviceResponse = await stockApiService.searchStocks(QUERY);
    
    console.log(`   - Has results: ${!!serviceResponse?.results}`);
    console.log(`   - Results count: ${serviceResponse?.results?.length || 0}`);
    
    if (serviceResponse?.results?.length > 0) {
      const result = serviceResponse.results[0];
      console.log(`   - Symbol: ${result.symbol || 'Missing'}`);
      console.log(`   - Company name: ${result.companyName || 'Missing'}`);
      console.log(`   - Latest price: ${result.latestPrice || 'Missing'}`);
      console.log(`   - Has full data: ${!!result.fullData}`);
    }
    
    // Check the frontend API endpoint
    console.log("\n3. Testing the backend API endpoint...");
    const express = require('express');
    const app = express();
    
    // Mock the request and response objects
    const mockReq = { query: { query: QUERY } };
    const mockRes = {
      json: (data) => {
        console.log(`   - API endpoint response:`, JSON.stringify(data, null, 2));
        return mockRes;
      },
      status: (code) => {
        console.log(`   - Status code: ${code}`);
        return mockRes;
      }
    };
    
    // Import the server.js functions
    const createApiResponse = (status, data, message) => {
      return {
        status,
        data,
        message: message || (status === 'success' ? 'Request successful' : 'Request failed')
      };
    };
    
    // Simulate the API endpoint handler
    console.log("   - Simulating /api/stocks/search endpoint...");
    
    try {
      const searchResults = await stockApiService.searchStocks(QUERY);
      
      // Process results like the server does
      let results = [];
      
      if (searchResults && searchResults.results && Array.isArray(searchResults.results)) {
        results = searchResults.results.map(stock => {
          // Normalize price field
          let latestPrice = null;
          
          if (stock.latestPrice) {
            latestPrice = stock.latestPrice;
          } else if (stock.price) {
            latestPrice = stock.price;
          } else if (stock.fullData && stock.fullData.currentPrice) {
            latestPrice = stock.fullData.currentPrice.BSE || stock.fullData.currentPrice.NSE;
          }
          
          return {
            ...stock,
            latestPrice,
            symbol: stock.symbol || stock.ticker || '',
            companyName: stock.companyName || stock.name || '',
            changePercent: stock.changePercent || stock.percent_change || 0
          };
        });
      }
      
      // Log the final result that would be sent to frontend
      console.log(`   - Final processed results count: ${results.length}`);
      if (results.length > 0) {
        console.log(`   - Final result first item:`, JSON.stringify(results[0], null, 2));
      }
      
      console.log("\n4. Checking frontend URL handling...");
      console.log(`   - Frontend would call: /api/stocks/search?query=${QUERY}`);
      console.log(`   - Expected URL: http://localhost:5002/api/stocks/search?query=${QUERY}`);
      
      console.log("\n5. Checking stock details page URL...");
      console.log(`   - Stock details URL would be: /stocks/${results.length > 0 ? results[0].symbol : 'ireda'}`);
      
    } catch (error) {
      console.error(`   - Error in endpoint simulation: ${error.message}`);
    }
    
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the debug
quickDebug(); 