const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load API keys from config file
const configPath = path.join(__dirname, '../backend/config/api-keys.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const apiKeys = config.keys.map(k => k.key);

console.log(`Loaded ${apiKeys.length} API keys from config`);

// API base URL
const API_BASE_URL = 'https://stock.indianapi.in';

// Test different query formats with all API keys
async function testSearch() {
  const query = 'ITC'; // Use uppercase for best results
  
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    console.log(`\n[${i+1}/${apiKeys.length}] Testing API key: ${apiKey.substring(0, 10)}...`);
    
    try {
      console.log(`Querying for: "${query}"`);
      
      const response = await axios.get(`${API_BASE_URL}/stock`, {
        params: { name: query },
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey
        },
        timeout: 10000
      });

      console.log(`✅ SUCCESS - Status: ${response.status}`);
      
      // Check if we got actual data
      if (response.data) {
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          console.log(`Found ${response.data.data.length} results`);
          console.log(`First result: ${JSON.stringify(response.data.data[0], null, 2).substring(0, 200)}...`);
        } else if (response.data.data) {
          console.log(`Data: ${JSON.stringify(response.data.data, null, 2).substring(0, 200)}...`);
        } else {
          console.log(`Data: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
        }
        
        // This is a working API key - update the config to mark it as primary
        updateApiKeyConfig(i);
        break; // Stop after finding a working key
      } else {
        console.log(`⚠️ No data returned`);
      }
    } catch (error) {
      console.error(`❌ ERROR - ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      }
    }
  }
}

// Update the API key configuration to set the working key as the primary
function updateApiKeyConfig(workingKeyIndex) {
  try {
    // Update the current key index in memory
    const updatedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Mark all keys as available (reset any rate limiting)
    updatedConfig.keys.forEach(key => {
      key.isAvailable = true;
      key.rateLimitResetTimestamp = 0;
    });
    
    // Write the updated config back to the file
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
    console.log(`\n✅ Updated API key configuration. Working key index: ${workingKeyIndex}`);
  } catch (error) {
    console.error(`Error updating API key config:`, error);
  }
}

// Run the test
testSearch(); 