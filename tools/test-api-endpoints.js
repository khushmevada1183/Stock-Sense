/**
 * Test script to verify API endpoints for the Indian Stock API
 * This script tests various endpoint formats to determine which ones work
 */

const axios = require('axios');

// Base URL
const BASE_URL = 'https://stock.indianapi.in';

// API Key for authentication
const API_KEY = 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';

// Stocks to test with
const TEST_STOCKS = [
  'ITC',
  'RELIANCE',
  'TCS',
  'HDFC',
  'IREDA'
];

// Log results
const logResult = (endpoint, result) => {
  console.log(`\n📌 Testing: ${endpoint}`);
  console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }
  if (result.data) {
    console.log(`Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
  }
};

// Test a specific endpoint
const testEndpoint = async (endpoint, params = null) => {
  try {
    const config = {
      timeout: 10000,
      headers: {
        'X-Api-Key': API_KEY
      }
    };
    
    if (params) {
      config.params = params;
    }
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.message
    };
  }
};

// Run tests on all formats for a single stock
const testStockEndpoints = async (stock) => {
  console.log(`\n===== Testing Stock: ${stock} =====`);
  
  // Test query parameter format
  const queryParamResult = await testEndpoint('/stock', { name: stock });
  logResult(`/stock?name=${stock}`, queryParamResult);
  
  // Test query parameter format uppercase
  const queryParamUpperResult = await testEndpoint('/stock', { name: stock.toUpperCase() });
  logResult(`/stock?name=${stock.toUpperCase()}`, queryParamUpperResult);
  
  // Test path parameter format
  const pathParamResult = await testEndpoint(`/stock/${encodeURIComponent(stock)}`);
  logResult(`/stock/${stock}`, pathParamResult);
  
  // Test path parameter format uppercase
  const pathParamUpperResult = await testEndpoint(`/stock/${encodeURIComponent(stock.toUpperCase())}`);
  logResult(`/stock/${stock.toUpperCase()}`, pathParamUpperResult);
  
  // Test symbol endpoint
  const symbolResult = await testEndpoint(`/symbol/${encodeURIComponent(stock.toUpperCase())}`);
  logResult(`/symbol/${stock.toUpperCase()}`, symbolResult);
  
  // Test search endpoint
  const searchResult = await testEndpoint('/stock-search', { query: stock });
  logResult(`/stock-search?query=${stock}`, searchResult);
};

// Run all tests
const runTests = async () => {
  console.log('🧪 TESTING INDIAN STOCK API ENDPOINTS');
  console.log('====================================');
  console.log(`Using API Key: ${API_KEY.substring(0, 8)}...`);
  
  for (const stock of TEST_STOCKS) {
    await testStockEndpoints(stock);
  }
  
  console.log('\n📊 TEST SUMMARY');
  console.log('====================================');
  console.log('Tests completed. Review results above to determine working endpoints.');
};

// Execute tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
}); 