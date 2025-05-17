/**
 * Simple IPO API JSON Check
 */

const axios = require('axios');

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://stock.indianapi.in',
  API_KEY: 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq'
};

console.log('Starting IPO API JSON data check...');

// Create API client
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'X-Api-Key': API_CONFIG.API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Make the request
console.log(`Sending request to ${API_CONFIG.BASE_URL}/ipo`);

apiClient.get('/ipo')
  .then(response => {
    console.log(`Received response with status: ${response.status}`);
    
    // Check response data
    if (response.data) {
      console.log('Response contains data');
      
      // Is it JSON?
      if (typeof response.data === 'object') {
        console.log('Data is a valid JSON object/array');
        
        // Determine the structure
        if (Array.isArray(response.data)) {
          console.log(`Data is an array with ${response.data.length} items`);
          if (response.data.length > 0) {
            console.log(`First item fields: ${Object.keys(response.data[0]).join(', ')}`);
          }
        } else {
          console.log(`Data is an object with keys: ${Object.keys(response.data).join(', ')}`);
          
          // Check common array patterns
          if (response.data.data && Array.isArray(response.data.data)) {
            console.log(`Object contains 'data' array with ${response.data.data.length} items`);
          } else if (response.data.ipoData && Array.isArray(response.data.ipoData)) {
            console.log(`Object contains 'ipoData' array with ${response.data.ipoData.length} items`);
          } else if (response.data.results && Array.isArray(response.data.results)) {
            console.log(`Object contains 'results' array with ${response.data.results.length} items`);
          }
        }
        
        // Print sample of the data
        console.log('Sample of response data:');
        console.log(JSON.stringify(response.data, null, 2).substring(0, 1000) + '...');
        
        console.log('API returns valid JSON data');
      } else {
        console.log(`Response data is not a JSON object (type: ${typeof response.data})`);
      }
    } else {
      console.log('Response contains no data');
    }
  })
  .catch(error => {
    console.log('Error encountered:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(`Server responded with status: ${error.response.status}`);
      console.log('Response data:', error.response.data);
      
      if (error.response.status === 429) {
        console.log('This is a rate limit error - API key requests limit exceeded');
        console.log('Rate limit response:', error.response.data);
        console.log('This confirms the API returns JSON data for error responses');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received');
      console.log('Request error:', error.message);
    } else {
      // Something happened in setting up the request
      console.log('Error setting up request:', error.message);
    }
  }); 