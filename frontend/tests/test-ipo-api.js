/**
 * Simple IPO API Test Script
 * 
 * Tests the IPO API endpoint with a valid API key to verify it returns data.
 */

const axios = require('axios');

// Configuration
const API_KEY = 'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67'; // First key from the rotation pool
const API_URL = 'https://stock.indianapi.in/ipo';

// Create API client
const apiClient = axios.create({
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 second timeout
});

// Test function
async function testIpoApi() {
  console.log('Testing IPO API...');
  console.log(`URL: ${API_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  
  try {
    console.log('Sending request...');
    const response = await apiClient.get(API_URL);
    
    console.log('\n✅ API request successful');
    console.log(`Status: ${response.status}`);
    
    // Log data structure
    if (response.data) {
      console.log('\nData structure:');
      if (Array.isArray(response.data)) {
        console.log(`Array with ${response.data.length} items`);
        if (response.data.length > 0) {
          console.log('First item keys:', Object.keys(response.data[0]));
        }
      } else {
        console.log('Object with keys:', Object.keys(response.data));
        
        // If data has upcoming/active/listed structure
        if (response.data.upcoming) {
          console.log(`- upcoming: ${Array.isArray(response.data.upcoming) ? response.data.upcoming.length : 'not an array'}`);
        }
        if (response.data.active) {
          console.log(`- active: ${Array.isArray(response.data.active) ? response.data.active.length : 'not an array'}`);
        }
        if (response.data.listed || response.data.closed) {
          const listedArray = response.data.listed || response.data.closed;
          console.log(`- listed/closed: ${Array.isArray(listedArray) ? listedArray.length : 'not an array'}`);
        }
      }
    } else {
      console.log('Empty response data');
    }
    
    return true;
  } catch (error) {
    console.log('\n❌ API request failed');
    
    if (error.response) {
      // Server responded with an error status
      console.log(`Status: ${error.response.status}`);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.log('No response received from server');
      console.log('Request:', error.request);
    } else {
      // Error setting up the request
      console.log('Error:', error.message);
    }
    
    return false;
  }
}

// Run the test
testIpoApi()
  .then(success => {
    console.log('\nTest completed.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 