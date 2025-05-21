// IPO API Test Script
// This script tests the connection to the Stock Indian API for IPO data
// Run with: node ipo-api-test.js

const axios = require('axios');

// API Configuration - copy of what's in the frontend config
const API_CONFIG = {
  BASE_URL: 'https://stock.indianapi.in',
  API_KEY: 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
  // API key rotation pool
  API_KEYS: [
    'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq'
  ],
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 2, // Reduced from 3 to minimize API hits
  // API key rotation settings
  KEY_ROTATION: {
    ENABLED: true,
    AUTO_ROTATE_ON_429: true,
    MAX_CONSECUTIVE_FAILURES: 2
  }
};

// ANSI color codes for prettier console output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m'
};

// Create axio client with minimal config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'X-Api-Key': API_CONFIG.API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: API_CONFIG.TIMEOUT
});

// Helper to mask API keys for logging
const maskApiKey = (key) => {
  if (!key) return 'undefined';
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
};

// Simple test function that just checks if the API is accessible
// This makes a minimal request to avoid hitting rate limits
async function testIpoEndpoint() {
  console.log(`${COLORS.BRIGHT}${COLORS.CYAN}IPO API Connection Test${COLORS.RESET}`);
  console.log(`${COLORS.DIM}Testing connection to: ${API_CONFIG.BASE_URL}/ipo${COLORS.RESET}`);
  console.log(`${COLORS.DIM}Using API key: ${maskApiKey(API_CONFIG.API_KEY)}${COLORS.RESET}`);
  
  try {
    // Use a HEAD request first to check endpoint availability without fetching data
    console.log(`\n${COLORS.YELLOW}Step 1: Testing endpoint accessibility (HEAD request)${COLORS.RESET}`);
    await apiClient.head('/ipo');
    console.log(`${COLORS.GREEN}✓ Endpoint is accessible${COLORS.RESET}`);
    
    // Now make a real GET request for the minimal data we need
    console.log(`\n${COLORS.YELLOW}Step 2: Testing data retrieval (GET request)${COLORS.RESET}`);
    const response = await apiClient.get('/ipo');
    
    // Check if we got a valid response
    if (response.status === 200) {
      console.log(`${COLORS.GREEN}✓ API responded with status 200${COLORS.RESET}`);
      
      // Log the basic structure of the response
      console.log(`\n${COLORS.CYAN}Response Structure:${COLORS.RESET}`);
      if (response.data && typeof response.data === 'object') {
        // Try different possible structures
        if (Array.isArray(response.data)) {
          console.log(`${COLORS.GREEN}✓ Response is an array with ${response.data.length} items${COLORS.RESET}`);
          console.log(`${COLORS.DIM}First item keys: ${Object.keys(response.data[0] || {}).join(', ')}${COLORS.RESET}`);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`${COLORS.GREEN}✓ Response has a data array with ${response.data.data.length} items${COLORS.RESET}`);
          console.log(`${COLORS.DIM}First item keys: ${Object.keys(response.data.data[0] || {}).join(', ')}${COLORS.RESET}`);
        } else if (response.data.ipoData && Array.isArray(response.data.ipoData)) {
          console.log(`${COLORS.GREEN}✓ Response has an ipoData array with ${response.data.ipoData.length} items${COLORS.RESET}`);
          console.log(`${COLORS.DIM}First item keys: ${Object.keys(response.data.ipoData[0] || {}).join(', ')}${COLORS.RESET}`);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          console.log(`${COLORS.GREEN}✓ Response has a results array with ${response.data.results.length} items${COLORS.RESET}`);
          console.log(`${COLORS.DIM}First item keys: ${Object.keys(response.data.results[0] || {}).join(', ')}${COLORS.RESET}`);
        } else {
          console.log(`${COLORS.YELLOW}? Unexpected response structure${COLORS.RESET}`);
          console.log(`${COLORS.DIM}Root keys: ${Object.keys(response.data).join(', ')}${COLORS.RESET}`);
        }
      }
      
      // Overall success
      console.log(`\n${COLORS.GREEN}${COLORS.BRIGHT}✓ API Connection Successful${COLORS.RESET}`);
    } else {
      console.log(`${COLORS.RED}× Unexpected status code: ${response.status}${COLORS.RESET}`);
    }
  } catch (error) {
    console.log(`\n${COLORS.RED}× API Connection Failed${COLORS.RESET}`);
    
    if (error.response) {
      // Server responded with an error
      console.log(`${COLORS.RED}Status: ${error.response.status}${COLORS.RESET}`);
      console.log(`${COLORS.RED}Message: ${error.response.data?.message || error.message}${COLORS.RESET}`);
      
      if (error.response.status === 429) {
        console.log(`${COLORS.YELLOW}This is a rate limit error (429). The API connection works but you've hit the limit.${COLORS.RESET}`);
      } else if (error.response.status === 401) {
        console.log(`${COLORS.YELLOW}This is an authentication error (401). The API key is invalid or expired.${COLORS.RESET}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.log(`${COLORS.RED}No response received from server${COLORS.RESET}`);
      console.log(`${COLORS.RED}Error: ${error.message}${COLORS.RESET}`);
      
      if (error.code === 'ECONNABORTED') {
        console.log(`${COLORS.YELLOW}The request timed out after ${API_CONFIG.TIMEOUT}ms${COLORS.RESET}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`${COLORS.YELLOW}Connection refused. The server may be down or the URL is incorrect.${COLORS.RESET}`);
      }
    } else {
      // Something happened in setting up the request
      console.log(`${COLORS.RED}Error: ${error.message}${COLORS.RESET}`);
    }
  }
}

// Export the function for the runner
module.exports = {
  testIpoEndpoint
};

// If this script is run directly, execute the test
if (require.main === module) {
  testIpoEndpoint();
} 