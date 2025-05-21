/**
 * API Rate Limit Check
 * 
 * This script checks the current status of our API key
 * by examining the rate limit headers from a minimal request.
 */

const axios = require('axios');

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://stock.indianapi.in',
  API_KEY: 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq'
};

console.log('Checking API key status...');

// Create API client with complete header information
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'X-Api-Key': API_CONFIG.API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 5000,
  validateStatus: function (status) {
    // Accept all status codes to check headers even on error responses
    return true;
  }
});

// Make a minimal HEAD request to check status without consuming data
apiClient.head('/ipo')
  .then(response => {
    console.log(`\nResponse status: ${response.status} (${response.statusText})`);
    
    // Log all headers to look for rate limit information
    console.log('\nResponse headers:');
    const headers = response.headers;
    Object.keys(headers).forEach(key => {
      console.log(`${key}: ${headers[key]}`);
    });
    
    // Check for common rate limit headers
    const rateLimitTotal = headers['x-ratelimit-limit'] || headers['x-rate-limit-limit'];
    const rateLimitRemaining = headers['x-ratelimit-remaining'] || headers['x-rate-limit-remaining'];
    const rateLimitReset = headers['x-ratelimit-reset'] || headers['x-rate-limit-reset'];
    
    if (rateLimitTotal && rateLimitRemaining) {
      console.log('\nAPI Rate Limit Status:');
      console.log(`Total limit: ${rateLimitTotal}`);
      console.log(`Remaining: ${rateLimitRemaining}`);
      
      if (rateLimitReset) {
        const resetTime = new Date(rateLimitReset * 1000).toLocaleTimeString();
        console.log(`Reset time: ${resetTime}`);
      }
      
      // Determine if exhausted
      if (parseInt(rateLimitRemaining) <= 0) {
        console.log('\n⛔ API KEY IS EXHAUSTED - Rate limit reached');
      } else {
        console.log(`\n✅ API KEY IS VALID - ${rateLimitRemaining}/${rateLimitTotal} requests remaining`);
      }
    } else if (response.status === 429) {
      console.log('\n⛔ API KEY IS EXHAUSTED - Received 429 Too Many Requests status');
      
      // Try to get reset information from response body
      if (response.data) {
        console.log('\nRate limit response:');
        console.log(response.data);
      }
    } else if (response.status === 401) {
      console.log('\n❌ API KEY IS INVALID - Authentication failed');
    } else if (response.status === 403) {
      console.log('\n❌ API KEY IS INVALID - Access forbidden');
    } else if (response.status >= 200 && response.status < 300) {
      console.log('\n✅ API KEY IS VALID - Request successful');
    } else {
      console.log(`\n⚠️ Unexpected status code: ${response.status}`);
    }
  })
  .catch(error => {
    console.log('\nError checking API status:');
    
    if (error.response) {
      console.log(`Server responded with status: ${error.response.status}`);
      if (error.response.data) {
        console.log('Response data:', error.response.data);
      }
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('Error setting up request:', error.message);
    }
  }); 