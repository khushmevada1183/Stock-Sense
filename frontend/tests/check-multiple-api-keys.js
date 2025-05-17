/**
 * Multiple API Key Tester
 * 
 * This script tests multiple API keys to find which ones are valid
 * and not rate-limited.
 * 
 * IMPORTANT: The Indian Stock API only supports GET requests.
 * HEAD, POST, PUT and other methods will return 405 Method Not Allowed.
 */

const axios = require('axios');

// List of API keys to test
const API_KEYS = [
  'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq', // Current key (known to be rate-limited)
  'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67',
  'sk-live-kQSxsVhWZyIk8sGy2gzXGBvi97RETSP88OOG2qt3',
  'sk-live-QtygcAU1VLXuNtIHRAVNWnLrtoTpL0yctd2DEko5',
  'sk-live-bi47a6KsAGkHsFAguG0sKBNzCf8VbTVFweOy1eFE',
  'sk-live-uZup2KEHVqDo2zyAunRH0zp9aaRNpyGgxKU7GApI',
  'sk-live-rB1W61qZPLlzufRlnRfS937jYQBEmM8D4TUPdpFh',
  'sk-live-1jzFVqgbxWnQCwRgG9NynigeR72HtkbioKch1VaD',
  'sk-live-2SrhjLseRYGxjv8JzfGFZ3D4ZyGOqZatL8ADODKL',
  'sk-live-2cEMmBrNbaIP1v3OjVNwNMbRnO49hvCeOayo5jAA',
  'sk-live-jtOlHh18hooTAJQmcLUz4mngn9gxSvY4uRyVUpGJ',
  'sk-live-K4wtBGXesvkus7wdkmT3uQ1g9qnlaLuN8TqQoXht'
];

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://stock.indianapi.in',
  ENDPOINT: '/ipo', // Test the IPO endpoint
  TIMEOUT: 8000, // Longer timeout for full GET requests
  SUPPORTED_METHODS: ['GET'] // Only GET is supported by the API
};

// ANSI colors for console output
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m'
};

// Results tracking
const results = {
  valid: [],
  rateLimited: [],
  invalid: [],
  error: []
};

// Track the recommended keys for config
let recommendedKeys = [];

// Helper to mask API key for display
const maskApiKey = (key) => {
  if (!key) return 'undefined';
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
};

// Create a delay function for sequential testing
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test a single API key
async function testApiKey(apiKey, index) {
  console.log(`\n${COLORS.CYAN}Testing API Key ${index + 1}/${API_KEYS.length}: ${maskApiKey(apiKey)}${COLORS.RESET}`);
  
  // Create API client for this key
  const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: API_CONFIG.TIMEOUT,
    validateStatus: function (status) {
      // Accept all status codes for analysis
      return true;
    }
  });
  
  try {
    // Use GET request (only method supported by the API)
    console.log(`${COLORS.DIM}Sending GET request to ${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT}${COLORS.RESET}`);
    const response = await apiClient.get(API_CONFIG.ENDPOINT);
    
    // Check response status
    console.log(`${COLORS.DIM}Response status: ${response.status}${COLORS.RESET}`);
    
    // Analyze the response
    if (response.status >= 200 && response.status < 300) {
      console.log(`${COLORS.GREEN}✓ Key is VALID (status: ${response.status})${COLORS.RESET}`);
      
      // Check if response has data
      if (response.data) {
        let dataCount = 'unknown';
        
        // Try to determine number of items in response
        if (Array.isArray(response.data)) {
          dataCount = response.data.length;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          dataCount = response.data.data.length;
        } else if (response.data.ipoData && Array.isArray(response.data.ipoData)) {
          dataCount = response.data.ipoData.length;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          dataCount = response.data.results.length;
        }
        
        console.log(`${COLORS.GREEN}✓ Response contains data (${dataCount} items)${COLORS.RESET}`);
      }
      
      results.valid.push(apiKey);
      recommendedKeys.push(apiKey);
      return true;
    } else if (response.status === 429) {
      console.log(`${COLORS.YELLOW}⚠ Key is RATE LIMITED (status: 429)${COLORS.RESET}`);
      results.rateLimited.push(apiKey);
      return false;
    } else if (response.status === 401 || response.status === 403) {
      console.log(`${COLORS.RED}✗ Key is INVALID (status: ${response.status})${COLORS.RESET}`);
      results.invalid.push(apiKey);
      return false;
    } else if (response.status === 405) {
      console.log(`${COLORS.RED}✗ Method Not Allowed (status: 405)${COLORS.RESET}`);
      console.log(`${COLORS.RED}The API only supports GET requests${COLORS.RESET}`);
      results.error.push(apiKey);
      return false;
    } else {
      console.log(`${COLORS.YELLOW}? Unexpected status: ${response.status}${COLORS.RESET}`);
      results.error.push(apiKey);
      return false;
    }
  } catch (error) {
    console.log(`${COLORS.RED}✗ Error testing key: ${error.message}${COLORS.RESET}`);
    results.error.push(apiKey);
    return false;
  }
}

// Test all API keys
async function testAllKeys() {
  console.log(`${COLORS.BRIGHT}${COLORS.BLUE}Indian Stock API - Multiple API Key Tester${COLORS.RESET}`);
  console.log(`${COLORS.BLUE}Testing ${API_KEYS.length} API keys against ${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}Note: This API only supports GET requests${COLORS.RESET}`);
  console.log('------------------------------------------------------------');
  
  // Test each key with a small delay between requests
  for (let i = 0; i < API_KEYS.length; i++) {
    await testApiKey(API_KEYS[i], i);
    
    // Add a small delay between requests to avoid overwhelming the server
    if (i < API_KEYS.length - 1) {
      await delay(1500); // Longer delay with GET requests
    }
  }
  
  // Display summary
  console.log('\n------------------------------------------------------------');
  console.log(`${COLORS.BRIGHT}${COLORS.BLUE}Results Summary:${COLORS.RESET}`);
  console.log(`${COLORS.GREEN}Valid Keys: ${results.valid.length}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}Rate Limited Keys: ${results.rateLimited.length}${COLORS.RESET}`);
  console.log(`${COLORS.RED}Invalid Keys: ${results.invalid.length}${COLORS.RESET}`);
  console.log(`${COLORS.RED}Error Keys: ${results.error.length}${COLORS.RESET}`);
  
  // Display recommended keys to add to config
  if (results.valid.length > 0) {
    console.log(`\n${COLORS.BRIGHT}${COLORS.GREEN}Recommended Valid Keys:${COLORS.RESET}`);
    recommendedKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key}`);
    });
    
    // Provide config snippet
    console.log(`\n${COLORS.BRIGHT}${COLORS.CYAN}Copy this to your config.js API_KEYS array:${COLORS.RESET}`);
    const configSnippet = recommendedKeys.map(key => `  '${key}'`).join(',\n');
    console.log(`[\n${configSnippet}\n]`);
  } else if (results.rateLimited.length > 0) {
    console.log(`\n${COLORS.BRIGHT}${COLORS.YELLOW}No Valid Keys Found, but some Rate Limited Keys available:${COLORS.RESET}`);
    results.rateLimited.forEach((key, index) => {
      console.log(`${index + 1}. ${key}`);
    });
    
    console.log(`\n${COLORS.YELLOW}These keys may work after their rate limits reset.${COLORS.RESET}`);
  } else {
    console.log(`\n${COLORS.BRIGHT}${COLORS.RED}No Valid or Rate Limited Keys Found${COLORS.RESET}`);
    console.log('Please register for new API keys at https://indianapi.in');
  }
}

// Run the tests
testAllKeys().catch(error => {
  console.error(`${COLORS.RED}Script error: ${error.message}${COLORS.RESET}`);
}); 