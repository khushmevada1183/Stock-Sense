/**
 * Diagnostic script to trace the full search query flow
 * This will help debug why the search isn't working
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');
const stockApiService = require('./services/stockApi');

// Get the API key
const API_KEY = apiKeyManager.getCurrentKey();
console.log(`Using API key: ${API_KEY.substring(0, 8)}...`);

// API base URL
const API_URL = 'https://stock.indianapi.in';

// Test query
const QUERY = 'ireda';

// Trace the full flow
async function traceSearchFlow() {
  console.log(`\n=== TRACING SEARCH FLOW FOR QUERY: "${QUERY}" ===\n`);
  
  try {
    // Step 1: Direct API call (bypass our service layer)
    console.log("STEP 1: Making direct API call to external endpoint");
    console.log(`URL: ${API_URL}/stock?name=${QUERY}`);
    
    const directResponse = await axios.get(`${API_URL}/stock`, {
      params: { name: QUERY },
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY
      }
    });
    
    console.log(`Direct API call status: ${directResponse.status}`);
    console.log(`Response has data: ${!!directResponse.data}`);
    
    // Log key parts of the response structure
    if (directResponse.data) {
      const data = directResponse.data;
      console.log("\nDirect API response structure:");
      console.log(`- Company name: ${data.companyName || 'Not found'}`);
      console.log(`- Current price: ${data.currentPrice ? JSON.stringify(data.currentPrice) : 'Not found'}`);
      console.log(`- Stock technical data: ${data.stockTechnicalData ? 'Present' : 'Not found'}`);
      console.log(`- Percent change: ${data.percentChange || 'Not found'}`);
    }
    
    // Step 2: Use our stockApiService
    console.log("\n\nSTEP 2: Using stockApiService.searchStocks()");
    console.log(`Query: "${QUERY}"`);
    
    console.time('Service call duration');
    const serviceResponse = await stockApiService.searchStocks(QUERY);
    console.timeEnd('Service call duration');
    
    console.log(`Service response has results: ${!!serviceResponse?.results}`);
    console.log(`Number of results: ${serviceResponse?.results?.length || 0}`);
    
    if (serviceResponse?.results?.length > 0) {
      const firstResult = serviceResponse.results[0];
      console.log("\nFirst result from service:");
      console.log(JSON.stringify(firstResult, null, 2));
      
      // Validate the price field
      console.log("\nPrice field analysis:");
      console.log(`- latestPrice: ${firstResult.latestPrice !== undefined ? firstResult.latestPrice : 'Missing'}`);
      console.log(`- price: ${firstResult.price !== undefined ? firstResult.price : 'Missing'}`);
      console.log(`- fullData.currentPrice: ${firstResult.fullData?.currentPrice ? JSON.stringify(firstResult.fullData.currentPrice) : 'Missing'}`);
    }
    
    // Step 3: Trace frontend API call
    console.log("\n\nSTEP 3: Simulating frontend API call");
    console.log(`URL: /api/stocks/search?query=${QUERY}`);
    
    // We're mocking this since we're not in the browser environment
    console.log("FRONTEND RESPONSE FORMAT (expected):");
    const mockFrontendResponse = {
      status: "success",
      data: {
        results: serviceResponse?.results || []
      }
    };
    
    console.log(`Status: ${mockFrontendResponse.status}`);
    console.log(`Results count: ${mockFrontendResponse.data.results.length}`);
    
    // Step 4: Analyze potential rendering issues
    console.log("\n\nSTEP 4: Frontend rendering simulation");
    
    if (mockFrontendResponse.data.results.length > 0) {
      const result = mockFrontendResponse.data.results[0];
      console.log("Data available for rendering:");
      console.log(`- Symbol: ${result.symbol || 'Missing'}`);
      console.log(`- Company Name: ${result.companyName || 'Missing'}`);
      
      // Multiple price fields that could be used
      const priceToDisplay = result.latestPrice || 
                            result.price || 
                            (result.fullData?.currentPrice?.BSE || result.fullData?.currentPrice?.NSE) || 
                            'N/A';
      
      console.log(`- Price to display: ${priceToDisplay}`);
      console.log(`- Change: ${result.change !== undefined ? result.change : 'Missing'}`);
      console.log(`- Change Percent: ${result.changePercent !== undefined ? result.changePercent : 'Missing'}`);
    } else {
      console.log("NO DATA AVAILABLE FOR RENDERING");
      console.log("This explains why the frontend shows 'No results found'");
    }
    
    // Step 5: Test API key rotation
    console.log("\n\nSTEP 5: Testing API key rotation");
    
    // Make 3 rapid requests to see if rotation works
    for (let i = 0; i < 3; i++) {
      const key = apiKeyManager.getCurrentKey();
      console.log(`Request ${i+1} using key: ${key.substring(0, 8)}...`);
      
      try {
        await axios.get(`${API_URL}/stock`, {
          params: { name: `test${i}` },
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': key
          }
        });
        console.log(`Request ${i+1} successful`);
        apiKeyManager.recordSuccessfulUse();
      } catch (error) {
        console.log(`Request ${i+1} failed: ${error.message}`);
        if (error.response && error.response.status === 429) {
          console.log(`Rate limit hit, rotating key...`);
          apiKeyManager.markCurrentKeyRateLimited(1);
        }
      }
    }
    
    console.log("\n=== CONCLUSION ===");
    if (directResponse.data && directResponse.data.companyName) {
      if (serviceResponse?.results?.length > 0) {
        console.log("✅ The API works and service layer is correctly transforming the data");
        console.log("The issue might be in the frontend integration or rendering");
      } else {
        console.log("⚠️ The API works but service layer is not correctly transforming the data");
        console.log("Fix the service layer to properly format and return the data");
      }
    } else {
      console.log("❌ The external API is not returning valid data for this query");
      console.log("Try a different query or check API key status");
    }
    
  } catch (error) {
    console.error("\n❌ ERROR IN TRACE:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the trace
traceSearchFlow(); 