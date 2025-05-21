/**
 * Debug script for recently listed IPO data - tests direct API access
 */

// Import axios for API requests
const axios = require('axios');

// API Configuration 
const API_BASE_URL = 'https://stock.indianapi.in';
const API_KEY = 'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67';

// Main function to fetch and analyze IPO data
async function testRecentlyListedIPOs() {
  console.log('========== DEBUGGING RECENTLY LISTED IPO DATA ==========');
  console.log(`Testing direct API connection to ${API_BASE_URL}/ipo`);
  
  try {
    // Make direct API request
    console.log(`Sending request with API key: ${API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(`${API_BASE_URL}/ipo`, {
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API call successful!');
    console.log(`Status: ${response.status}`);
    
    // Check API response structure
    const data = response.data;
    console.log('API Response Structure:', Object.keys(data));
    
    // Extract Recently Listed IPOs
    const listedIPOs = data.listed || [];
    const closedIPOs = data.closed || [];
    
    console.log(`Found ${listedIPOs.length} listed IPOs and ${closedIPOs.length} closed IPOs`);
    
    // Combine listed and closed IPOs
    const recentlyListedIPOs = [...listedIPOs, ...closedIPOs];
    console.log(`Total recently listed IPOs: ${recentlyListedIPOs.length}`);
    
    // Log structure and sample data
    if (recentlyListedIPOs.length > 0) {
      console.log('\nFirst Recently Listed IPO:');
      console.log(JSON.stringify(recentlyListedIPOs[0], null, 2));
      
      // Check critical fields
      const sampleIpo = recentlyListedIPOs[0];
      console.log('\nKey fields check:');
      console.log('name:', sampleIpo.name);
      console.log('symbol:', sampleIpo.symbol);
      console.log('status:', sampleIpo.status);
      console.log('issue_price:', sampleIpo.issue_price);
      console.log('listing_price:', sampleIpo.listing_price);
      console.log('listing_gains:', sampleIpo.listing_gains);
      console.log('min_price:', sampleIpo.min_price);
      console.log('max_price:', sampleIpo.max_price);
      console.log('listing_date:', sampleIpo.listing_date);
      console.log('document_url:', sampleIpo.document_url);
      
      // Show another sample for comparison
      if (recentlyListedIPOs.length > 3) {
        console.log('\nAnother Recently Listed IPO (index 3):');
        console.log(JSON.stringify(recentlyListedIPOs[3], null, 2));
      }
    } else {
      console.log('WARNING: No recently listed IPOs found in API response!');
    }
    
    return recentlyListedIPOs;
  } catch (error) {
    console.error('Error fetching IPO data:', error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
    
    return [];
  }
}

// Run the test
testRecentlyListedIPOs()
  .then(ipos => {
    console.log(`\nTest completed with ${ipos.length} IPOs processed.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\nUnexpected error:', error);
    process.exit(1);
  }); 