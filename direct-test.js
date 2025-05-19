const axios = require('axios');
const apiKeyManager = require('./backend/services/apiKeyManager');

async function testDirectSearch() {
  try {
    // Get the current API key from our fixed API key manager
    const API_KEY = apiKeyManager.getCurrentKey();
    console.log(`Using API key: ${API_KEY.substring(0, 10)}...`);
    
    // API base URL
    const API_BASE_URL = 'https://stock.indianapi.in';
    
    // Test query
    const query = 'ITC';
    console.log(`Searching for: "${query}"`);
    
    // Make the request
    const response = await axios.get(`${API_BASE_URL}/stock`, {
      params: { name: query },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      },
      timeout: 10000
    });
    
    console.log(`Status: ${response.status}`);
    
    // Check if we got data
    if (response.data) {
      console.log(`Response data:`, JSON.stringify(response.data, null, 2));
      
      // Format the data like the API endpoint would
      const formattedResults = {
        results: [{
          symbol: response.data.symbol || 'ITC',
          companyName: response.data.companyName || 'ITC Ltd',
          latestPrice: response.data.currentPrice?.BSE || response.data.currentPrice?.NSE || 0,
          change: response.data.percentChange?.change || 0,
          changePercent: response.data.percentChange?.percent_change || 0,
          sector: response.data.industry || response.data.sector || ''
        }]
      };
      
      console.log(`\nFormatted results:`, JSON.stringify(formattedResults, null, 2));
    } else {
      console.log(`No data returned`);
    }
  } catch (error) {
    console.error(`Error:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
  }
}

// Run the test
testDirectSearch(); 