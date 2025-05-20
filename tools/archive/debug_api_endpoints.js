/**
 * Debug script to diagnose issues with API endpoints and response structure
 */

const axios = require('axios');
const apiKeyManager = require('./services/apiKeyManager');

// API base URL
const API_URL = 'https://stock.indianapi.in';

// Get API key
const API_KEY = apiKeyManager.getCurrentKey();

console.log(`Using API key: ${API_KEY.substring(0, 10)}...`);

// Create an API client function
const createApiClient = () => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
    }
  });
};

// Helper function to display the structure of a response
const displayResponseStructure = (data) => {
  if (!data) return 'null or undefined response';
  
  if (typeof data !== 'object') return `Simple value: ${data}`;
  
  if (Array.isArray(data)) {
    return `Array with ${data.length} items. First item: ${
      data.length > 0 
        ? JSON.stringify(data[0], null, 2).substring(0, 200) + (JSON.stringify(data[0]).length > 200 ? '...' : '')
        : 'none'
    }`;
  }
  
  // For objects, show the keys and some sample values
  const keys = Object.keys(data);
  const structure = {};
  
  keys.forEach(key => {
    const value = data[key];
    if (value === null || value === undefined) {
      structure[key] = 'null/undefined';
    } else if (typeof value !== 'object') {
      structure[key] = `${typeof value}: ${String(value).substring(0, 30)}${String(value).length > 30 ? '...' : ''}`;
    } else if (Array.isArray(value)) {
      structure[key] = `Array[${value.length}]`;
    } else {
      structure[key] = `Object with keys: ${Object.keys(value).join(', ')}`;
    }
  });
  
  return JSON.stringify(structure, null, 2);
};

async function debugApiEndpoints() {
  const apiClient = createApiClient();

  try {
    // First, test the endpoint with a known working stock
    console.log('\n1. Testing /stock endpoint with a well-known stock (Tata Steel)...');
    const tataResponse = await apiClient.get('/stock', { 
      params: { name: 'Tata Steel' } 
    });
    console.log('→ Response status:', tataResponse.status);
    console.log('→ Response structure:', displayResponseStructure(tataResponse.data));
    console.log('→ Is response valid for frontend?', 
      (tataResponse.data && (tataResponse.data.currentPrice || tataResponse.data.stockTechnicalData)) ? 'YES' : 'NO');

    // Now test the IREDA search which is problematic
    console.log('\n2. Testing /stock endpoint with IREDA...');
    const iredaResponse = await apiClient.get('/stock', { 
      params: { name: 'ireda' } 
    });
    console.log('→ Response status:', iredaResponse.status);
    console.log('→ Response structure:', displayResponseStructure(iredaResponse.data));
    console.log('→ Is response valid for frontend?', 
      (iredaResponse.data && (iredaResponse.data.currentPrice || iredaResponse.data.stockTechnicalData)) ? 'YES' : 'NO');
    
    // Now test the broken processing in our stockApi.js
    console.log('\n3. Testing our stockApi.js processing with IREDA data...');
    
    // Simulate stockApi.js processing to find what's missing
    const stockData = iredaResponse.data;
    let results = [];
    
    if (stockData) {
      if (stockData.currentPrice || stockData.stockTechnicalData) {
        const price = stockData.currentPrice ? 
          (stockData.currentPrice.BSE || stockData.currentPrice.NSE) : 
          (stockData.stockTechnicalData && stockData.stockTechnicalData[0] ? 
            parseFloat(stockData.stockTechnicalData[0].bsePrice) : 0);
        
        results = [{
          symbol: stockData.symbol || stockData.companyName?.split(' ')[0] || 'ireda',
          companyName: stockData.companyName || 'ireda',
          latestPrice: price,
          change: stockData.percentChange?.percent_change || 0,
          changePercent: stockData.percentChange?.percent_change || 0,
          sector: stockData.industry || stockData.sector || '',
          fullData: 'FULL_DATA_OMITTED_FOR_BREVITY'
        }];
      } else if (stockData.data && Array.isArray(stockData.data)) {
        results = stockData.data.map(item => ({
          symbol: item.symbol || item.name,
          companyName: item.company_name || item.name,
          latestPrice: item.current_price,
          change: item.change,
          changePercent: item.percent_change,
          sector: item.sector
        }));
      }
    }
    
    console.log('→ Processed results:', results.length > 0 ? 
      JSON.stringify(results, null, 2) : 'Empty results');

    // Test with alternative approach
    console.log('\n4. Testing with a direct solution for IREDA...');
    
    // Attempt to extract currentPrice using a more direct approach
    let directPrice = null;
    if (stockData && typeof stockData === 'object') {
      // Look for any price-related fields at any level
      const findPriceFields = (obj, path = '') => {
        if (!obj || typeof obj !== 'object') return;
        
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          const newPath = path ? `${path}.${key}` : key;
          
          // Check if this key might be price-related
          if (/price|value|rate/i.test(key) && typeof value === 'number') {
            console.log(`→ Found potential price field: ${newPath} = ${value}`);
            if (directPrice === null) directPrice = value;
          }
          
          // Recurse for nested objects
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            findPriceFields(value, newPath);
          }
        });
      };
      
      findPriceFields(stockData);
    }
    
    console.log('→ Direct price found:', directPrice);

  } catch (error) {
    console.error('Error debugging API endpoints:', error.message);
    console.error('Full error:', error);
  }
}

// Run the debug
debugApiEndpoints(); 