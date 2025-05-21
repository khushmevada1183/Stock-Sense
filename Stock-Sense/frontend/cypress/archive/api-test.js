const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Function to test API endpoints
async function testApiEndpoints() {
  console.log('=== API ENDPOINT TEST ===');
  console.log(`Testing API URL: ${API_URL}`);
  console.log('========================\n');

  // List of endpoints to test
  const endpoints = [
    { name: 'Health', path: '/health' },
    { name: 'Stocks', path: '/stocks' },
    { name: 'Market News', path: '/news' },
    { name: 'IPO Data', path: '/ipo' },
    { name: 'Config', path: '/config' }
  ];

  // Test each endpoint
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name} endpoint: ${API_URL}${endpoint.path}`);
      const startTime = Date.now();
      const response = await axios.get(`${API_URL}${endpoint.path}`);
      const endTime = Date.now();
      
      console.log(`✅ SUCCESS: ${endpoint.name} (${response.status}) - ${endTime - startTime}ms`);
      
      // Display a sample of the response data
      const data = response.data;
      if (typeof data === 'object') {
        console.log('Sample response data:');
        
        // Get keys in the response
        const keys = Object.keys(data);
        console.log(`Keys: ${keys.join(', ')}`);
        
        // Show status if available
        if (data.status) {
          console.log(`Status: ${data.status}`);
        }
        
        // Show first few items of array data if available
        if (data.data) {
          if (Array.isArray(data.data)) {
            console.log(`Data: Array with ${data.data.length} items`);
            if (data.data.length > 0) {
              console.log('First item sample:', JSON.stringify(data.data[0]).substring(0, 150) + '...');
            }
          } else if (typeof data.data === 'object') {
            console.log('Data structure:', Object.keys(data.data).join(', '));
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${endpoint.name} failed`);
      
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Message: ${error.message}`);
      } else {
        console.log(`Message: ${error.message}`);
      }
    }
    
    console.log('------------------------\n');
  }
  
  console.log('API testing completed!');
}

// Run the tests
testApiEndpoints(); 