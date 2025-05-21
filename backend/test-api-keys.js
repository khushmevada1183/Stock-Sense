/**
 * API Key Rotation Test Script
 * 
 * This script tests the API key rotation functionality by making repeated API calls
 * to verify that keys are rotated properly when rate limits are hit.
 */

const apiKeyManager = require('./services/apiKeyManager');
const axios = require('axios');

const API_BASE_URL = process.env.STOCK_API_BASE_URL || 'https://stock.indianapi.in';

// Number of consecutive API calls to make
const NUM_CALLS = 20;

// Delay between calls (in ms)
const DELAY = 500;

// Test endpoints to use
const TEST_ENDPOINTS = [
  '/trending',
  '/stock?name=Reliance',
  '/stock?name=TCS'
];

// Function to make an API call with the current key
async function makeApiCall(endpoint) {
  try {
    const API_KEY = apiKeyManager.getCurrentKey();
    
    console.log(`Using API key: ${API_KEY.substring(0, 10)}... for request to ${endpoint}`);
    
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      },
      timeout: 10000
    });
    
    console.log(`✅ SUCCESS: ${endpoint} returned status ${response.status}`);
    
    // Record successful use
    apiKeyManager.recordSuccessfulUse();
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error(`❌ ERROR: ${endpoint} failed:`, error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      
      // Handle rate limit error (HTTP 429)
      if (error.response.status === 429) {
        console.warn('Rate limit exceeded. Marking current key as rate limited.');
        apiKeyManager.markCurrentKeyRateLimited(1); // 1 second cooldown
      }
      
      // Handle 400 or 401 errors that might be related to invalid API keys
      if (error.response.status === 400 || error.response.status === 401) {
        const errorData = error.response.data;
        
        // Check if it's a "Missing API key" error
        if (errorData === "Missing API key" || 
            (typeof errorData === 'string' && errorData.includes('API key')) ||
            (errorData && errorData.message && errorData.message.includes('API key'))) {
          
          console.warn('API key error detected. Marking current key as unavailable.');
          apiKeyManager.markCurrentKeyRateLimited(60); // 60 second cooldown
        }
      }
    }
    
    return { success: false, error: error.message };
  }
}

// Function to sleep for a specified time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runTest() {
  console.log(`Starting API key rotation test with ${NUM_CALLS} calls...`);
  console.log(`Available keys: ${apiKeyManager.getAllKeys().length}`);
  
  // Display initial key status
  const initialKeys = apiKeyManager.getAllKeys();
  console.log('Initial key status:');
  initialKeys.forEach((key, index) => {
    console.log(`Key ${index}: ${key.key.substring(0, 10)}..., Available: ${key.isAvailable}, MonthlyUsage: ${key.monthlyUsage}`);
  });
  
  // Make consecutive API calls
  for (let i = 0; i < NUM_CALLS; i++) {
    console.log(`\n=== API Call ${i+1}/${NUM_CALLS} ===`);
    
    // Choose a random endpoint
    const randomEndpoint = TEST_ENDPOINTS[Math.floor(Math.random() * TEST_ENDPOINTS.length)];
    
    // Make the API call
    await makeApiCall(randomEndpoint);
    
    // Wait between calls
    if (i < NUM_CALLS - 1) {
      console.log(`Waiting ${DELAY}ms before next call...`);
      await sleep(DELAY);
    }
  }
  
  // Display final key status
  const finalKeys = apiKeyManager.getAllKeys();
  console.log('\nFinal key status:');
  finalKeys.forEach((key, index) => {
    console.log(`Key ${index}: ${key.key.substring(0, 10)}..., Available: ${key.isAvailable}, MonthlyUsage: ${key.monthlyUsage}`);
  });
  
  console.log('\nAPI key rotation test completed.');
}

// Run the test
runTest().catch(error => {
  console.error('Test failed:', error);
}); 