const axios = require('axios');

// API configuration for backend server
const API_CONFIG = {
  baseURL: 'http://localhost:5000/api',  // Make sure the server is running on this port
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to avoid hanging on failed requests
  timeout: 5000
};

// Create API client
const apiClient = axios.create(API_CONFIG);

// Test backend API endpoints
async function testEndpoints() {
  try {
    console.log('Testing backend API endpoints...\n');

    // Test basic endpoints
    const basicEndpoints = [
      { name: 'health check', endpoint: '/health' },
      { name: 'featured stocks', endpoint: '/stocks/featured' },
      { name: 'market overview', endpoint: '/stocks/market-overview' },
      { name: 'market news', endpoint: '/stocks/news/latest' },
      { name: 'IPO data', endpoint: '/stocks/ipo/upcoming' },
      { name: '52-week high/low', endpoint: '/stocks/market/52-week' }
    ];

    // Test each basic endpoint
    for (const endpoint of basicEndpoints) {
      try {
        console.log(`Testing ${endpoint.name} endpoint...`);
        const response = await apiClient.get(endpoint.endpoint);
        console.log(`${endpoint.name} response status:`, response.status);
        console.log(`${endpoint.name} response data:`, JSON.stringify(response.data, null, 2).substring(0, 300) + '...\n');
      } catch (error) {
        console.error(`Error fetching ${endpoint.name}:`, error.message);
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', JSON.stringify(error.response.data));
        }
        console.log('\n');
      }
    }

    console.log('Basic endpoint tests completed.');

    // Test stock-specific endpoints for a test symbol (TATA)
    const testSymbol = 'TATA';
    const stockEndpoints = [
      { name: 'stock details', endpoint: `/stocks/${testSymbol}` },
      { name: 'stock prices', endpoint: `/stocks/${testSymbol}/prices` },
      { name: 'financial ratios', endpoint: `/stocks/${testSymbol}/ratios` },
      { name: 'corporate actions', endpoint: `/stocks/${testSymbol}/corporate-actions` },
      { name: 'announcements', endpoint: `/stocks/${testSymbol}/announcements` }
    ];

    // Test each stock-specific endpoint
    for (const endpoint of stockEndpoints) {
      try {
        console.log(`Testing ${endpoint.name} endpoint...`);
        const response = await apiClient.get(endpoint.endpoint);
        console.log(`${endpoint.name} response:`, JSON.stringify(response.data, null, 2).substring(0, 300) + '...\n');
      } catch (error) {
        console.error(`Error fetching ${endpoint.name}:`, error.message);
        if (error.response) {
          console.error('Error response:', JSON.stringify(error.response.data));
        }
        console.log('\n');
      }
    }

    // Test financial statement endpoints with different statement types
    const statementTypes = ['cashflow', 'yoy_results', 'quarter_results', 'balancesheet'];
    
    for (const statementType of statementTypes) {
      try {
        console.log(`Testing financial statement endpoint with ${statementType}...`);
        const response = await apiClient.get(`/stocks/${testSymbol}/financials/${statementType}`);
        console.log(`${statementType} statement response:`, JSON.stringify(response.data, null, 2).substring(0, 300) + '...\n');
      } catch (error) {
        console.error(`Error fetching ${statementType} statement:`, error.message);
        if (error.response) {
          console.error('Error response:', JSON.stringify(error.response.data));
        }
        console.log('\n');
      }
    }

    // Test stock search
    try {
      const searchQuery = 'HDFC';
      console.log(`Testing stock search with query "${searchQuery}"...`);
      const response = await apiClient.get(`/stocks/search?query=${searchQuery}`);
      console.log(`Search response:`, JSON.stringify(response.data, null, 2).substring(0, 300) + '...\n');
    } catch (error) {
      console.error('Error searching stocks:', error.message);
      if (error.response) {
        console.error('Error response:', JSON.stringify(error.response.data));
      }
      console.log('\n');
    }

    console.log('Completed testing all endpoints!');
  } catch (error) {
    console.error('Fatal error during testing:', error.message);
  }
}

// Run the tests
console.log('Starting API endpoint tests. Make sure the server is running on http://localhost:5000');
testEndpoints(); 