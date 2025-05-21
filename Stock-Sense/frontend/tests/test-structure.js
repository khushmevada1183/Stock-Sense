/**
 * Simple API Structure Test Script
 * 
 * Tests the API response format from the IPO endpoint
 */
const axios = require('axios');

// Configuration
const API_KEY = 'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67';
const API_URL = 'https://stock.indianapi.in/ipo';

async function testApiStructure() {
  console.log('Testing API response structure...');
  
  try {
    // Make API request
    const response = await axios.get(API_URL, {
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    
    console.log('API call successful!');
    console.log(`Status: ${response.status}`);
    
    // Analyze structure
    const data = response.data;
    console.log('\nAPI Response Structure:');
    console.log('Top-level keys:', Object.keys(data));
    
    // Check for expected keys
    if (data.upcoming) {
      console.log(`upcoming: Array with ${data.upcoming.length} items`);
      if (data.upcoming.length > 0) {
        console.log('Sample upcoming IPO:', data.upcoming[0]);
      }
    }
    
    if (data.active) {
      console.log(`active: Array with ${data.active.length} items`);
      if (data.active.length > 0) {
        console.log('Sample active IPO:', data.active[0]);
      }
    }
    
    if (data.listed) {
      console.log(`listed: Array with ${data.listed.length} items`);
      if (data.listed.length > 0) {
        console.log('Sample listed IPO:', data.listed[0]);
      }
    }
    
    if (data.closed) {
      console.log(`closed: Array with ${data.closed.length} items`);
      if (data.closed.length > 0) {
        console.log('Sample closed IPO:', data.closed[0]);
      }
    }
    
    console.log('\nTest completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing API structure:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Run the test
testApiStructure(); 