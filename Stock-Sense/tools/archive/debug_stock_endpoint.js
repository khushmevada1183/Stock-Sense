/**
 * Debug script to diagnose issues with the stock endpoint
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');

// API base URL
const API_URL = 'https://stock.indianapi.in';

// Get API key
const API_KEY = apiKeyManager.getCurrentKey();

console.log(`Using API key: ${API_KEY.substring(0, 10)}...`);

async function debugStockEndpoint() {
  // Test with exact parameters from the screenshot
  try {
    console.log(`\nTesting basic stock endpoint with Tata Steel (as shown in screenshot)...`);
    const tataResponse = await axios.get(`${API_URL}/stock`, {
      params: { name: 'Tata Steel' },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    console.log('\nTata Steel response structure:');
    const tataData = tataResponse.data;
    // Show what fields are available in the response
    console.log('Available top-level fields:', Object.keys(tataData || {}));
    
    if (tataData && tataData.currentPrice) {
      console.log('\nCurrent Price exists for Tata Steel');
    } else {
      console.log('\nNo current price found for Tata Steel');
    }
  } catch (error) {
    console.error(`\nError with Tata Steel lookup:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Try IREDA in exact format
  try {
    console.log(`\n\nTesting IREDA in exact format...`);
    const iredaResponse = await axios.get(`${API_URL}/stock`, {
      params: { name: 'ireda' },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    console.log('\nIREDA response structure:');
    const iredaData = iredaResponse.data;
    console.log('Available top-level fields:', Object.keys(iredaData || {}));
    
    if (iredaData && iredaData.currentPrice) {
      console.log('\nCurrent Price for IREDA:', iredaData.currentPrice);
    } else {
      console.log('\nNo current price found for IREDA');
    }
  } catch (error) {
    console.error(`\nError with IREDA lookup:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Try IREDA in caps
  try {
    console.log(`\n\nTesting IREDA in all caps...`);
    const iredaCapsResponse = await axios.get(`${API_URL}/stock`, {
      params: { name: 'IREDA' },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    console.log('\nIREDA (caps) response structure:');
    const iredaCapsData = iredaCapsResponse.data;
    console.log('Available top-level fields:', Object.keys(iredaCapsData || {}));
  } catch (error) {
    console.error(`\nError with IREDA (caps) lookup:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Try with full name
  try {
    console.log(`\n\nTesting with full name "Indian Renewable Energy Development Agency"...`);
    const fullNameResponse = await axios.get(`${API_URL}/stock`, {
      params: { name: 'Indian Renewable Energy Development Agency' },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    console.log('\nFull name response structure:');
    const fullNameData = fullNameResponse.data;
    console.log('Available top-level fields:', Object.keys(fullNameData || {}));
  } catch (error) {
    console.error(`\nError with full name lookup:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the debug tests
debugStockEndpoint(); 