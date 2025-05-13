/**
 * Test script to verify API key rotation functionality
 */

const stockApiService = require('./services/stockApi');

async function testAPIKeyRotation() {
  console.log('Testing API key rotation with multiple rapid requests...');
  
  // Test stocks to search for
  const stocks = [
    'ireda', 
    'tata steel', 
    'infosys', 
    'reliance', 
    'hdfc bank',
    'icici bank',
    'axis bank',
    'sbi',
    'bajaj finance',
    'adani ports'
  ];
  
  // Make 10 rapid requests which should trigger rate limits and key rotation
  const results = [];
  
  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    console.log(`\nRequest ${i+1}: Searching for "${stock}"...`);
    
    try {
      const result = await stockApiService.searchStocks(stock);
      
      // Check if we got valid data
      if (result.results && result.results.length > 0 && result.results[0].latestPrice) {
        console.log(`✅ Success! Found price data for ${stock}: ${result.results[0].latestPrice}`);
        results.push({
          stock,
          success: true,
          price: result.results[0].latestPrice
        });
      } else {
        console.log(`❌ No price data found for ${stock}`);
        results.push({
          stock,
          success: false,
          error: 'No price data found'
        });
      }
    } catch (error) {
      console.log(`❌ Error searching for ${stock}: ${error.message}`);
      results.push({
        stock,
        success: false,
        error: error.message
      });
    }
    
    // Brief pause to let logs catch up
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Print summary of results
  console.log('\n\n===== TEST SUMMARY =====');
  console.log(`Total requests: ${stocks.length}`);
  console.log(`Successful requests: ${results.filter(r => r.success).length}`);
  console.log(`Failed requests: ${results.filter(r => !r.success).length}`);
  
  // If we have at least 8 successful requests, the rotation is working well
  if (results.filter(r => r.success).length >= 8) {
    console.log('\n✅ API KEY ROTATION IS WORKING CORRECTLY!');
  } else {
    console.log('\n❌ API KEY ROTATION IS NOT WORKING OPTIMALLY');
  }
}

// Run the test
testAPIKeyRotation(); 