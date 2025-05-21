/**
 * API Key Tester for Indian Stock API
 * Tests each API key with a simple request to verify it's working
 */

const axios = require('axios');

// API configuration
const API_BASE_URL = 'https://stock.indianapi.in';

// List of API keys to test
const API_KEYS = [
  'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67',
  'sk-live-kQSxsVhWZyIk8sGy2gzXGBvi97RETSP88OOG2qt3',
  'sk-live-QtygcAU1VLXuNtIHRAVNWnLrtoTpL0yctd2DEko5',
  'sk-live-bi47a6KsAGkHsFAguG0sKBNzCf8VbTVFweOy1eFE',
  'sk-live-uZup2KEHVqDo2zyAunRH0zp9aaRNpyGgxKU7GApI',
  'sk-live-rB1W61qZPLlzufRlnRfS937jYQBEmM8D4TUPdpFh',
  'sk-live-1jzFVqgbxWnQCwRgG9NynigeR72HtkbioKch1VaD',
  'sk-live-2SrhjLseRYGxjv8JzfGFZ3D4ZyGOqZatL8ADODKL',
  'sk-live-2cEMmBrNbaIP1v3OjVNwNMbRnO49hvCeOayo5jAA',
  'sk-live-jtOlHh18hooTAJQmcLUz4mngn9gxSvY4uRyVUpGJ'
];

// Function to test a single API key
async function testApiKey(apiKey) {
  const maskedKey = `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`\nTesting API key: ${maskedKey}`);

  try {
    // Make a simple request to the stock endpoint
    const response = await axios.get(`${API_BASE_URL}/stock`, {
      params: { name: 'RELIANCE' },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.status === 200) {
      console.log(`✅ SUCCESS - API key is valid (Status: ${response.status})`);
      console.log(`  Company Name: ${response.data.companyName || 'Not available'}`);
      return true;
    } else {
      console.log(`❓ UNEXPECTED - Received status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status;
      
      if (statusCode === 429) {
        console.log(`⚠️ RATE LIMITED - API key has hit rate limit (Status: ${statusCode})`);
      } else if (statusCode === 401 || statusCode === 403) {
        console.log(`❌ UNAUTHORIZED - API key is invalid or expired (Status: ${statusCode})`);
      } else {
        console.log(`❌ ERROR - Received status code: ${statusCode}`);
      }
      
      if (error.response.data) {
        console.log(`  Error message: ${JSON.stringify(error.response.data)}`);
      }
    } else if (error.request) {
      console.log('❌ NO RESPONSE - The request was made but no response was received');
    } else {
      console.log(`❌ REQUEST FAILED - ${error.message}`);
    }
    
    return false;
  }
}

// Function to test all API keys
async function testAllApiKeys() {
  console.log(`Testing ${API_KEYS.length} API keys against ${API_BASE_URL}`);
  console.log("=".repeat(50));
  
  let successful = 0;
  
  // Test each key with a delay between requests
  for (const apiKey of API_KEYS) {
    const isSuccess = await testApiKey(apiKey);
    if (isSuccess) successful++;
    
    // Delay for 2 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("\n" + "=".repeat(50));
  console.log(`Test results: ${successful} out of ${API_KEYS.length} keys are working`);
}

// Run the tests
testAllApiKeys().catch(error => {
  console.error('Error running tests:', error.message);
}); 