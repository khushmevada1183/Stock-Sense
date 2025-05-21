/**
 * Test script to check if recently listed IPO data is being fetched and processed correctly
 */
const axios = require('axios');

// Configuration
const API_KEY = 'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67';
const API_URL = 'https://stock.indianapi.in/ipo';

async function testRecentlyListedIPOs() {
  console.log('Testing recently listed IPO data...');
  
  try {
    // Make API request
    console.log(`Sending request to ${API_URL} with API key ${API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(API_URL, {
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API call successful!');
    console.log(`Status: ${response.status}`);
    
    // Check if response data contains listed and closed IPOs
    const data = response.data;
    
    console.log('\nListed IPOs:');
    if (data.listed && Array.isArray(data.listed) && data.listed.length > 0) {
      console.log(`Found ${data.listed.length} listed IPOs`);
      // Log fields of a sample listed IPO
      const sampleListed = data.listed[0];
      console.log('Sample listed IPO:');
      console.log('- Field names:', Object.keys(sampleListed));
      console.log('- Company name:', sampleListed.name);
      console.log('- Symbol:', sampleListed.symbol);
      console.log('- Status:', sampleListed.status);
      console.log('- Issue price:', sampleListed.issue_price);
      console.log('- Listing price:', sampleListed.listing_price);
      console.log('- Current price:', sampleListed.current_price);
      console.log('- Listing gain:', sampleListed.listing_gain);
    } else {
      console.log('No listed IPOs found in the response');
    }
    
    console.log('\nClosed IPOs:');
    if (data.closed && Array.isArray(data.closed) && data.closed.length > 0) {
      console.log(`Found ${data.closed.length} closed IPOs`);
      // Log fields of a sample closed IPO
      const sampleClosed = data.closed[0];
      console.log('Sample closed IPO:');
      console.log('- Field names:', Object.keys(sampleClosed));
      console.log('- Company name:', sampleClosed.name);
      console.log('- Symbol:', sampleClosed.symbol);
      console.log('- Status:', sampleClosed.status);
    } else {
      console.log('No closed IPOs found in the response');
    }
    
    // Log combined count (to match what our code should process)
    const listedCount = (data.listed && Array.isArray(data.listed)) ? data.listed.length : 0;
    const closedCount = (data.closed && Array.isArray(data.closed)) ? data.closed.length : 0;
    console.log(`\nTotal recently listed IPOs (listed + closed): ${listedCount + closedCount}`);
    
    return true;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
    
    return false;
  }
}

// Run the test
testRecentlyListedIPOs()
  .then(success => {
    console.log('\nTest completed.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\nUnexpected error:', error);
    process.exit(1);
  }); 