/**
 * Debug script for recently listed IPO data
 */

// Config must be loaded first as CommonJS
const config = {
  API_CONFIG: {
    BASE_URL: 'https://stock.indianapi.in',
    API_KEY: 'sk-live-V4dyXhcHcQCFuxnLYWKmBM2jzKxDilFMl4BklW67',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    CACHE_DURATION: 5 * 60 * 1000
  }
};

// Mock the import
const axios = require('axios');

// Create a test function
async function testRecentlyListedIPOs() {
  console.log('Debugging recently listed IPO data...');
  
  try {
    console.log(`Sending request to ${config.API_CONFIG.BASE_URL}/ipo with API key ${config.API_CONFIG.API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(`${config.API_CONFIG.BASE_URL}/ipo`, {
      headers: {
        'X-Api-Key': config.API_CONFIG.API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API call successful!');
    console.log(`Status: ${response.status}`);
    
    // Print the complete API response structure
    console.log('\nAPI Response Structure:');
    console.log(JSON.stringify(Object.keys(response.data), null, 2));
    
    // Check if response data contains listed and closed IPOs
    const data = response.data;
    const listedIPOs = data.listed || [];
    const closedIPOs = data.closed || [];
    
    console.log(`\nFound ${listedIPOs.length} listed IPOs`);
    console.log(`Found ${closedIPOs.length} closed IPOs`);
    
    // Combine listed and closed IPOs
    const recentlyListedIPOs = [...listedIPOs, ...closedIPOs];
    console.log(`Total recently listed IPOs: ${recentlyListedIPOs.length}`);
    
    // Show sample IPOs with full details
    if (listedIPOs.length > 0) {
      console.log('\nFirst "listed" IPO raw data:');
      console.log(JSON.stringify(listedIPOs[0], null, 2));
      
      // Show all fields that exist in the first listed IPO
      console.log('\nAll fields in first listed IPO:');
      const fields = Object.keys(listedIPOs[0]);
      console.log(fields);
      
      // Display the value of each field
      fields.forEach(field => {
        console.log(`- ${field}: ${JSON.stringify(listedIPOs[0][field])}`);
      });
    }
    
    if (closedIPOs.length > 0) {
      console.log('\nFirst "closed" IPO raw data:');
      console.log(JSON.stringify(closedIPOs[0], null, 2));
    }
    
    // Check for additional fields by examining more IPOs
    console.log('\nChecking for additional fields in other IPOs...');
    const allFields = new Set();
    recentlyListedIPOs.slice(0, 10).forEach((ipo, index) => {
      Object.keys(ipo).forEach(field => allFields.add(field));
      
      // Log the 5th IPO for comparison
      if (index === 4) {
        console.log('\n5th IPO raw data:');
        console.log(JSON.stringify(ipo, null, 2));
      }
    });
    
    console.log('\nAll possible fields across first 10 IPOs:');
    console.log(Array.from(allFields));
    
    // Process the IPOs for display
    const processedIPOs = recentlyListedIPOs.map(ipo => {
      // This replicates the logic in IpoCard component
      return {
        // Add normalized fields that UI components expect
        company_name: ipo.name || 'Unknown Company',
        name: ipo.name,
        symbol: ipo.symbol || 'N/A',
        status: ipo.status,
        subscription_status: ipo.status || 'Listed',
        ipo_price: ipo.issue_price ? `${ipo.issue_price}` : 'N/A',
        issue_price: ipo.issue_price,
        listing_price: ipo.listing_price || 'N/A',
        listing_gain: ipo.listing_gains || 'N/A',
        listing_gains: ipo.listing_gains,
        min_price: ipo.min_price,
        max_price: ipo.max_price,
        listing_date: ipo.listing_date,
        bidding_start_date: ipo.bidding_start_date,
        bidding_end_date: ipo.bidding_end_date,
        document_url: ipo.document_url
      };
    });
    
    return processedIPOs;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    
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