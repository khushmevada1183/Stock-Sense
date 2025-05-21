/**
 * Test script to verify the search fix
 */

const stockApiService = require('./services/stockApi');

async function testSearch() {
  try {
    // Test searching for IREDA
    console.log('Testing search for "ireda":');
    const iredaResult = await stockApiService.searchStocks('ireda');
    console.log(JSON.stringify(iredaResult, null, 2));
    
    // Check if the price is included
    if (iredaResult.results && iredaResult.results.length > 0) {
      const price = iredaResult.results[0].latestPrice;
      console.log(`\nIREDA price: ${price || 'not found'}`);
      
      // Check for full data
      if (iredaResult.results[0].fullData && iredaResult.results[0].fullData.currentPrice) {
        console.log('Full price data available:');
        console.log(JSON.stringify(iredaResult.results[0].fullData.currentPrice, null, 2));
      }
    }
    
    // Test another stock
    console.log('\n\nTesting search for "tata steel":');
    const tataResult = await stockApiService.searchStocks('tata steel');
    
    // Display only the important parts
    if (tataResult.results && tataResult.results.length > 0) {
      const tataStock = tataResult.results[0];
      console.log({
        symbol: tataStock.symbol,
        companyName: tataStock.companyName,
        latestPrice: tataStock.latestPrice,
        change: tataStock.change,
        changePercent: tataStock.changePercent,
        sector: tataStock.sector
      });
      
      // Show that we have the full data
      if (tataStock.fullData) {
        console.log('\nFull data available with fields:', Object.keys(tataStock.fullData));
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testSearch(); 