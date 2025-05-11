const axios = require('axios');

// API configuration
const API_CONFIG = {
  baseURL: 'https://stock.indianapi.in',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'sk-live-K4wtBGXesvkus7wdkmT3uQ1g9qnlaLuN8TqQoXht'
  }
};

// Create API client
const apiClient = axios.create(API_CONFIG);

// Test various endpoints
async function testEndpoints() {
  try {
    // Basic endpoints without parameters
    const basicEndpoints = [
      { name: 'trending', endpoint: '/trending' },
      { name: 'ipo', endpoint: '/ipo' },
      { name: 'news', endpoint: '/news' },
      { name: 'commodities', endpoint: '/commodities' },
      { name: 'mutual_funds', endpoint: '/mutual_funds' },
      { name: 'price_shockers', endpoint: '/price_shockers' },
      { name: 'BSE_most_active', endpoint: '/BSE_most_active' },
      { name: 'NSE_most_active', endpoint: '/NSE_most_active' },
      { name: '52_week_high_low', endpoint: '/fetch_52_week_high_low_data' }
    ];

    // Test each basic endpoint
    for (const endpoint of basicEndpoints) {
      try {
        console.log(`\nTesting ${endpoint.name} endpoint...`);
        const response = await apiClient.get(endpoint.endpoint);
        console.log(`${endpoint.name} response:`, JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      } catch (error) {
        console.error(`Error fetching ${endpoint.name}:`, error.message);
      }
    }

    // Endpoints requiring stock_name parameter
    const stockNameEndpoints = [
      { name: 'stock details', endpoint: '/stock', params: { name: 'TATA' } },
      { name: 'corporate actions', endpoint: '/corporate_actions', params: { stock_name: 'TATA' } },
      { name: 'recent announcements', endpoint: '/recent_announcements', params: { stock_name: 'TATA' } },
      { name: 'mutual funds details', endpoint: '/mutual_funds_details', params: { stock_name: 'HDFC' } }
    ];

    // Test each stock_name endpoint
    for (const endpoint of stockNameEndpoints) {
      try {
        console.log(`\nTesting ${endpoint.name} endpoint...`);
        const response = await apiClient.get(endpoint.endpoint, { params: endpoint.params });
        console.log(`${endpoint.name} response:`, JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      } catch (error) {
        console.error(`Error fetching ${endpoint.name}:`, error.message);
      }
    }

    // Search endpoints
    const searchEndpoints = [
      { name: 'industry search', endpoint: '/industry_search', params: { query: 'banking' } },
      { name: 'mutual fund search', endpoint: '/mutual_fund_search', params: { query: 'hdfc' } }
    ];

    // Test each search endpoint
    for (const endpoint of searchEndpoints) {
      try {
        console.log(`\nTesting ${endpoint.name} endpoint...`);
        const response = await apiClient.get(endpoint.endpoint, { params: endpoint.params });
        console.log(`${endpoint.name} response:`, JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      } catch (error) {
        console.error(`Error fetching ${endpoint.name}:`, error.message);
      }
    }

    // Historical data with different filter options
    const historicalParams = [
      { period: '1m', filter: 'price', stock_name: 'TATA' },
      { period: '1yr', filter: 'pe', stock_name: 'TATA' },
      { period: '1yr', filter: 'ptb', stock_name: 'TATA' },
      { period: '1yr', filter: 'evebitda', stock_name: 'TATA' }
    ];

    // Test historical data with different parameters
    for (const params of historicalParams) {
      try {
        console.log(`\nTesting historical data with ${params.filter} filter and ${params.period} period...`);
        const response = await apiClient.get('/historical_data', { params });
        console.log(`Historical ${params.filter} data response:`, JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      } catch (error) {
        console.error(`Error fetching historical ${params.filter} data:`, error.message);
      }
    }

    // Statement endpoint - Updated with correct parameters
    const statementTypes = ['cashflow', 'yoy_results', 'quarter_results', 'balancesheet', 'all'];
    
    for (const statType of statementTypes) {
      try {
        console.log(`\nTesting statement endpoint with ${statType}...`);
        const statementResponse = await apiClient.get('/statement', {
          params: { 
            stock_name: 'TATA',
            stats: statType
          }
        });
        console.log(`Statement (${statType}) response:`, JSON.stringify(statementResponse.data, null, 2).substring(0, 500) + '...');
      } catch (error) {
        console.error(`Error fetching statement (${statType}) data:`, error.message);
      }
    }

    // Historical stats endpoint - Corrected parameter values
    try {
      console.log('\nTesting historical_stats with all stats...');
      const statsResponse = await apiClient.get('/historical_stats', { 
        params: { 
          stock_name: 'TATA',
          stats: 'all'  // Valid values: cashflow, yoy_results, quarter_results, balancesheet, all
        } 
      });
      console.log('Historical stats response:', JSON.stringify(statsResponse.data, null, 2).substring(0, 500) + '...');
    } catch (error) {
      console.error('Error fetching historical stats:', error.message);
    }

    // Stock forecasts endpoint - Try with different parameters
    try {
      console.log('\nTesting stock forecasts endpoint with updated parameters...');
      const forecastResponse = await apiClient.get('/stock_forecasts', {
        params: {
          stock_id: 'TATAMOTORS.NS',  // Try different stock ID format
          measure_code: 'EPS',
          period_type: 'Annual',
          data_type: 'Estimates',
          age: 'Current'
        }
      });
      console.log('Stock forecast response:', JSON.stringify(forecastResponse.data, null, 2).substring(0, 500) + '...');
    } catch (error) {
      console.error('Error fetching stock forecast data:', error.message);
    }

    // Stock target price - Try with different parameters
    try {
      console.log('\nTesting stock target price endpoint with updated parameters...');
      const targetPriceResponse = await apiClient.get('/stock_target_price', {
        params: { stock_id: 'TATAMOTORS.NS' }  // Try different stock ID format
      });
      console.log('Stock target price response:', JSON.stringify(targetPriceResponse.data, null, 2).substring(0, 500) + '...');
    } catch (error) {
      console.error('Error fetching stock target price data:', error.message);
    }

  } catch (error) {
    console.error('Error in test:', error.message);
  }
}

// Run tests
testEndpoints(); 