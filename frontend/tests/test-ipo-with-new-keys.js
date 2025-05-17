/**
 * Test IPO API with New Keys
 * 
 * This script tests the IPO API with the updated key rotation pool
 * to verify that we can now access the API successfully.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load the actual config (simulating how the app uses it)
const configPath = path.join(__dirname, '..', 'services', 'config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract API config variables
const extractConfig = () => {
  const baseUrlMatch = configContent.match(/BASE_URL:\s*['"]([^'"]+)['"]/);
  const apiKeyMatch = configContent.match(/API_KEY:\s*['"]([^'"]+)['"]/);
  const keysMatch = configContent.match(/API_KEYS:\s*\[([\s\S]*?)\]/);
  
  const baseUrl = baseUrlMatch ? baseUrlMatch[1] : 'https://stock.indianapi.in';
  const apiKey = apiKeyMatch ? apiKeyMatch[1] : '';
  
  // Extract all keys from the pool
  const apiKeys = [];
  if (keysMatch && keysMatch[1]) {
    const keyLines = keysMatch[1].split('\n')
      .filter(line => line.includes('sk-') && !line.includes('//'))
      .map(line => line.trim());
    
    keyLines.forEach(line => {
      const key = line.match(/'([^']+)'/) || line.match(/"([^"]+)"/);
      if (key) {
        apiKeys.push(key[1].replace(/,\s*$/, ''));
      }
    });
  }
  
  return { baseUrl, apiKey, apiKeys };
};

// Get config from file
const config = extractConfig();

console.log('IPO API Test with New Key Rotation Pool');
console.log('=======================================');
console.log(`Base URL: ${config.baseUrl}`);
console.log(`Primary API Key: ${config.apiKey.substring(0, 8)}...`);
console.log(`API Keys in Rotation Pool: ${config.apiKeys.length}`);

// Test the API with a specific key
async function testWithKey(apiKey, keyIndex) {
  console.log(`\nTesting with Key ${keyIndex + 1}/${config.apiKeys.length}: ${apiKey.substring(0, 8)}...`);
  
  const apiClient = axios.create({
    baseURL: config.baseUrl,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    timeout: 10000,
    validateStatus: function (status) {
      return true; // Accept all status codes
    }
  });
  
  try {
    console.log('Sending request to /ipo endpoint...');
    const startTime = Date.now();
    const response = await apiClient.get('/ipo');
    const requestTime = Date.now() - startTime;
    
    console.log(`Response received in ${requestTime}ms with status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('Response is successful (200 OK)');
      
      // Analyze the data structure
      if (response.data) {
        console.log('Response contains data:');
        
        // Detect data structure
        if (Array.isArray(response.data)) {
          console.log(`  - Data is an array with ${response.data.length} items`);
          if (response.data.length > 0) {
            console.log(`  - First item has fields: ${Object.keys(response.data[0]).join(', ')}`);
          }
        } else if (typeof response.data === 'object') {
          console.log(`  - Data is an object with keys: ${Object.keys(response.data).join(', ')}`);
          
          // Check for nested data arrays
          ['data', 'ipoData', 'results'].forEach(arrayField => {
            if (response.data[arrayField] && Array.isArray(response.data[arrayField])) {
              console.log(`  - Contains ${arrayField} array with ${response.data[arrayField].length} items`);
              if (response.data[arrayField].length > 0) {
                console.log(`  - First item in ${arrayField} has fields: ${Object.keys(response.data[arrayField][0]).join(', ')}`);
              }
            }
          });
        }
        
        console.log('\n✅ API TEST SUCCESSFUL!');
        return true;
      } else {
        console.log('⚠️ Response has no data');
        return false;
      }
    } else if (response.status === 429) {
      console.log('⚠️ Rate limit exceeded (429 Too Many Requests)');
      console.log('This key is currently rate-limited');
      return false;
    } else {
      console.log(`❌ Unexpected status code: ${response.status}`);
      console.log('API test failed');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error calling API: ${error.message}`);
    return false;
  }
}

// Test the first few keys to verify
async function runTests() {
  // Test with the primary key first
  await testWithKey(config.apiKey, -1);
  
  // Test with the first 3 keys from the rotation pool
  const keysToTest = Math.min(3, config.apiKeys.length);
  console.log(`\nTesting first ${keysToTest} keys from the rotation pool...`);
  
  let successCount = 0;
  
  for (let i = 0; i < keysToTest; i++) {
    const success = await testWithKey(config.apiKeys[i], i);
    if (success) successCount++;
    
    // If we've already found 2 working keys, we can stop
    if (successCount >= 2) break;
  }
  
  // Final results
  console.log('\n=== Test Results ===');
  if (successCount > 0) {
    console.log(`✅ ${successCount} keys successfully accessed the API!`);
    console.log('The API key rotation system should work correctly now.');
    console.log('You can set SHOW_MOCK_DATA_WHEN_API_FAILS to false again if desired.');
  } else {
    console.log('❌ None of the tested keys worked successfully.');
    console.log('Please check the API endpoint status or try again later.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`Script error: ${error.message}`);
}); 