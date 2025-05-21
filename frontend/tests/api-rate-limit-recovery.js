/**
 * API Rate Limit Recovery Checker
 * 
 * This script makes multiple requests with increasing backoff delays
 * to estimate when the API rate limit will reset.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://stock.indianapi.in',
  API_KEY: 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq'
};

// Backoff configuration
const BACKOFF_CONFIG = {
  INITIAL_DELAY: 10000, // 10 seconds
  MAX_ATTEMPTS: 3,
  DELAY_MULTIPLIER: 2
};

console.log('API Rate Limit Recovery Analysis');
console.log('================================\n');
console.log('This script will check:');
console.log('1. If the rate limit has a visible reset time');
console.log('2. If there are any alternative API keys in the config');
console.log('3. If mock data is available as a fallback\n');

// Create API client
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'X-Api-Key': API_CONFIG.API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 5000,
  validateStatus: function (status) {
    // Accept all status codes
    return true;
  }
});

// Function to check for alternative API keys
async function checkApiKeyOptions() {
  console.log('\nChecking for API key alternatives...');
  
  try {
    // Read the config file
    const configPath = path.join(__dirname, '..', 'services', 'config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for API_KEYS array with more than one key
    const keysMatch = configContent.match(/API_KEYS:\s*\[([\s\S]*?)\]/);
    if (keysMatch && keysMatch[1]) {
      const keyLines = keysMatch[1].split('\n')
        .filter(line => line.includes('sk-') && !line.includes('//'))
        .map(line => line.trim());
      
      console.log(`Found ${keyLines.length} API keys in the rotation pool:`);
      keyLines.forEach((line, index) => {
        const key = line.match(/'([^']+)'/) || line.match(/"([^"]+)"/);
        if (key) {
          const apiKey = key[1];
          const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
          console.log(`  ${index + 1}. ${maskedKey}${apiKey === API_CONFIG.API_KEY ? ' (current)' : ''}`);
        }
      });
      
      if (keyLines.length <= 1) {
        console.log('\n⚠️ Only one API key found in the rotation pool.');
        console.log('   Consider adding more API keys to avoid rate limit issues.');
      }
    } else {
      console.log('⚠️ Could not find API_KEYS array in config.');
    }
    
    // Check if mock data is enabled
    const mockMatch = configContent.match(/SHOW_MOCK_DATA_WHEN_API_FAILS:\s*(true|false)/);
    if (mockMatch) {
      const mockEnabled = mockMatch[1] === 'true';
      console.log(`\nMock data fallback is ${mockEnabled ? 'ENABLED' : 'DISABLED'}`);
      
      if (!mockEnabled) {
        console.log('⚠️ Consider enabling mock data temporarily while the API key is rate-limited:');
        console.log('   Set SHOW_MOCK_DATA_WHEN_API_FAILS: true in services/config.js');
      }
    }
  } catch (error) {
    console.log('Error reading config:', error.message);
  }
}

// Function to check rate limit headers
async function checkRateLimitReset() {
  console.log('\nChecking rate limit reset information...');
  
  try {
    const response = await apiClient.head('/ipo');
    
    // Check response status
    console.log(`Response status: ${response.status}`);
    
    // Look for rate limit reset headers
    const headers = response.headers;
    const rateLimitReset = headers['x-ratelimit-reset'] || 
                           headers['x-rate-limit-reset'] ||
                           headers['retry-after'];
    
    if (rateLimitReset) {
      // Try to parse as Unix timestamp
      let resetTime;
      if (Number.isInteger(parseInt(rateLimitReset)) && rateLimitReset.length > 4) {
        resetTime = new Date(rateLimitReset * 1000);
      } else {
        // Try to parse as seconds from now
        resetTime = new Date(Date.now() + (parseInt(rateLimitReset) * 1000));
      }
      
      console.log(`\n✅ Rate limit will reset at: ${resetTime.toLocaleString()}`);
      
      // Calculate time until reset
      const secondsUntilReset = Math.round((resetTime - Date.now()) / 1000);
      const minutesUntilReset = Math.round(secondsUntilReset / 60);
      
      if (secondsUntilReset > 0) {
        if (minutesUntilReset > 0) {
          console.log(`   (approximately ${minutesUntilReset} minutes from now)`);
        } else {
          console.log(`   (approximately ${secondsUntilReset} seconds from now)`);
        }
      }
    } else if (response.status === 429) {
      console.log('\n⚠️ No explicit reset time provided in headers.');
      console.log('   API is currently rate-limited (429 Too Many Requests).');
      
      // Some APIs include the reset info in the response body
      if (response.data && typeof response.data === 'object') {
        console.log('\nChecking response body for reset information:');
        console.log(response.data);
      }
      
      // If no reset time is available, try to estimate based on common limits
      console.log('\n⏱️ Common rate limit reset periods:');
      console.log('   - Hourly limits typically reset at the top of the hour');
      console.log('   - Daily limits typically reset at midnight UTC');
      console.log('   - Some APIs use sliding windows (e.g., 1000 requests per hour, rolling)');
      
      // Calculate approximate reset times
      const now = new Date();
      
      // Next hour
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1);
      nextHour.setMinutes(0, 0, 0);
      
      // Midnight UTC
      const midnightUTC = new Date();
      midnightUTC.setUTCHours(24, 0, 0, 0);
      
      console.log('\nPossible reset times:');
      console.log(`   - Next hour: ${nextHour.toLocaleString()}`);
      console.log(`   - Midnight UTC: ${midnightUTC.toLocaleString()}`);
    } else {
      console.log(`\n⚠️ Unexpected status code: ${response.status}`);
      console.log('   Cannot determine rate limit status.');
    }
  } catch (error) {
    console.log('Error checking rate limit reset:', error.message);
  }
}

// Recommend actions
function recommendActions() {
  console.log('\n🛠️ Recommended actions:');
  console.log('1. Register for additional API keys at indianapi.in');
  console.log('2. Add the new keys to the rotation pool in services/config.js');
  console.log('3. Temporarily enable mock data by setting SHOW_MOCK_DATA_WHEN_API_FAILS: true');
  console.log('4. Implement caching of API responses to reduce API usage');
  console.log('5. Consider implementing smarter retry logic with exponential backoff');
}

// Execute all checks
async function runChecks() {
  // Check for rate limit reset information
  await checkRateLimitReset();
  
  // Check for alternative API keys
  await checkApiKeyOptions();
  
  // Provide recommendations
  recommendActions();
}

// Run the checks
runChecks()
  .catch(error => {
    console.error('Error during checks:', error);
  })
  .finally(() => {
    console.log('\nCheck completed.');
  }); 