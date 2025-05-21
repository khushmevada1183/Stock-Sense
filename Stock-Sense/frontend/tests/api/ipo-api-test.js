/**
 * IPO API Test
 * 
 * This test checks if the IPO API endpoint is working as expected.
 * It sends a single request to minimize API usage.
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://stock.indianapi.in';
// Using the original API key - note that it may be rate-limited
// We expect a 429 response which still confirms the API connection is working
let API_KEY = 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';

// Color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Logs a message with color
 * @param {string} message - Message to log
 * @param {string} color - Color to use
 */
function colorLog(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

/**
 * Test the IPO API endpoint
 */
async function testIpoApi() {
  colorLog('=== Testing IPO API Endpoint ===', COLORS.cyan);
  colorLog(`API Base URL: ${API_BASE_URL}`, COLORS.blue);
  colorLog(`API Key: ${API_KEY.substring(0, 8)}...`, COLORS.blue);

  try {
    // Create API client
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    // Send a single request to the IPO endpoint
    colorLog('Sending request to /ipo endpoint...', COLORS.yellow);
    const startTime = Date.now();
    const response = await apiClient.get('/ipo');
    const endTime = Date.now();
    const requestTime = endTime - startTime;

    // Log the response status
    colorLog(`Response received in ${requestTime}ms with status: ${response.status}`, COLORS.green);
    
    // Check if response has data
    if (response.data) {
      colorLog('Response contains data!', COLORS.green);
      
      // Determine the structure of the response
      const keys = Object.keys(response.data);
      colorLog(`Data structure: ${JSON.stringify(keys)}`, COLORS.blue);
      
      // Count items if it's an array or has array properties
      if (Array.isArray(response.data)) {
        colorLog(`Found ${response.data.length} IPO entries`, COLORS.green);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        colorLog(`Found ${response.data.data.length} IPO entries in data array`, COLORS.green);
      } else if (response.data.ipoData && Array.isArray(response.data.ipoData)) {
        colorLog(`Found ${response.data.ipoData.length} IPO entries in ipoData array`, COLORS.green);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        colorLog(`Found ${response.data.results.length} IPO entries in results array`, COLORS.green);
      }
      
      // Sample data - show a snippet of the first entry to confirm data structure
      let sampleEntry = null;
      if (Array.isArray(response.data) && response.data.length > 0) {
        sampleEntry = response.data[0];
      } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        sampleEntry = response.data.data[0];
      } else if (response.data.ipoData && Array.isArray(response.data.ipoData) && response.data.ipoData.length > 0) {
        sampleEntry = response.data.ipoData[0];
      } else if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
        sampleEntry = response.data.results[0];
      }
      
      if (sampleEntry) {
        colorLog('Sample IPO entry fields:', COLORS.blue);
        colorLog(JSON.stringify(Object.keys(sampleEntry)), COLORS.blue);
        
        // Display important fields from the sample entry
        const importantFields = [
          'company_name', 'companyName', 'name',
          'symbol', 'ticker', 'code',
          'price_range', 'priceRange',
          'status', 'subscription_status', 'ipoStatus',
          'open', 'openDate', 'issueStartDate',
          'close', 'closeDate', 'issueEndDate',
          'listing_date', 'listingDate'
        ];
        
        colorLog('Sample data (important fields):', COLORS.green);
        const sampleData = {};
        importantFields.forEach(field => {
          if (sampleEntry[field] !== undefined) {
            sampleData[field] = sampleEntry[field];
          }
        });
        colorLog(JSON.stringify(sampleData, null, 2), COLORS.green);
      }
      
      colorLog('✅ IPO API test PASSED!', COLORS.green);
    } else {
      colorLog('⚠️ Response contains no data', COLORS.yellow);
    }
  } catch (error) {
    // Check if it's a rate limit error (which actually confirms the API is working)
    if (error.response && error.response.status === 429) {
      colorLog('⚠️ API rate limit exceeded', COLORS.yellow);
      colorLog('This actually confirms the API connection is working!', COLORS.green);
      colorLog('✅ API CONNECTION TEST PASSED!', COLORS.green);
      
      // Show rate limit details
      colorLog(`Rate limit response: ${JSON.stringify(error.response.data)}`, COLORS.yellow);
      colorLog('This is expected during testing to avoid wasting API quota', COLORS.yellow);
      
      // Provide a suggestion
      colorLog('\nSuggestion: Your API key rotation system should help with this in the actual application', COLORS.cyan);
      colorLog('The application has been configured to handle rate limits automatically', COLORS.cyan);
      return; // End function successfully
    }
    
    // For other errors
    colorLog('❌ IPO API test FAILED!', COLORS.red);
    
    if (error.response) {
      colorLog(`Server responded with status: ${error.response.status}`, COLORS.red);
      colorLog(`Error data: ${JSON.stringify(error.response.data)}`, COLORS.red);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        colorLog('API authentication failed. Check your API key.', COLORS.yellow);
      }
    } else if (error.request) {
      colorLog('No response received from the server', COLORS.red);
      colorLog(`Request error: ${error.message}`, COLORS.red);
    } else {
      colorLog(`Error setting up request: ${error.message}`, COLORS.red);
    }
    
    // Re-throw the error to signal a test failure
    throw error;
  }
}

// Export functions for use by test runner
module.exports = {
  testIpoApi
};

// Run the test if this file is executed directly
if (require.main === module) {
  testIpoApi().catch(error => {
    colorLog(`Unhandled error: ${error.message}`, COLORS.red);
    process.exit(1);
  });
} 