# Indian API Integration Guide

This document provides comprehensive instructions and code examples for integrating the Indian API Marketplace services into your website using Axios in JavaScript/TypeScript.

## Table of Contents

- [Setup](#setup)
- [Stock Market APIs](#stock-market-apis)
  - [IPO Data](#ipo-data)
  - [News Data](#news-data)
  - [Stock Details](#stock-details)
  - [Trending Stocks](#trending-stocks)
  - [Statement Data](#statement-data)
  - [Commodities Data](#commodities-data)
  - [Mutual Funds Data](#mutual-funds-data)
  - [Price Shockers Data](#price-shockers-data)
  - [BSE Most Active Stocks](#bse-most-active-stocks)
  - [NSE Most Active Stocks](#nse-most-active-stocks)
  - [Historical Data](#historical-data)
  - [Industry Search](#industry-search)
  - [Stock Forecasts](#stock-forecasts)
  - [Historical Stats](#historical-stats)
  - [Corporate Actions](#corporate-actions)
  - [Mutual Fund Search](#mutual-fund-search)
  - [Stock Target Price](#stock-target-price)
  - [Mutual Funds Details](#mutual-funds-details)
  - [Recent Announcements](#recent-announcements)
  - [52 Week High/Low Data](#52-week-highlow-data)
- [Utility Functions](#utility-functions)
- [Real-time Data Integration](#real-time-data-integration)
- [Error Handling](#error-handling)

## Setup

First, set up Axios and your API configuration:

```javascript
import axios from 'axios';

// API Configuration
const API_KEY = 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
const BASE_URL = 'https://stock.indianapi.in';

// Create Axios instance with default config
const indianAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

// Global error handler
indianAPI.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    // You can implement global error handling here
    return Promise.reject(error);
  }
);
```

## Stock Market APIs

### IPO Data

Fetch the latest IPO data:

```javascript
/**
 * Fetches the latest IPO data
 * @returns {Promise<Object>} IPO data
 */
export const getIPOData = async () => {
  try {
    const { data } = await indianAPI.get('/ipo');
    return data;
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    throw error;
  }
};

// Usage example:
const displayIPOData = async () => {
  try {
    const ipoData = await getIPOData();
    console.log('IPO Data:', ipoData);
    // Process and display the data in your UI
    // For example:
    // document.getElementById('ipo-container').innerHTML = renderIPOTable(ipoData);
  } catch (error) {
    // Handle error in UI
  }
};
```

### News Data

Fetch the latest market news:

```javascript
/**
 * Fetches the latest market news
 * @returns {Promise<Object>} News data
 */
export const getNewsData = async () => {
  try {
    const { data } = await indianAPI.get('/news');
    return data;
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw error;
  }
};

// Usage example:
const displayNewsData = async () => {
  try {
    const newsData = await getNewsData();
    console.log('News Data:', newsData);
    // Process and display the news in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Stock Details

Fetch details for a specific stock:

```javascript
/**
 * Fetches details for a specific stock
 * @param {string} stockName - Name of the stock (e.g., "Tata Steel")
 * @returns {Promise<Object>} Stock details
 */
export const getStockDetails = async (stockName) => {
  try {
    const { data } = await indianAPI.get('/stock', {
      params: {
        name: stockName
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching stock details for ${stockName}:`, error);
    throw error;
  }
};

// Usage example:
const displayStockDetails = async (stockName) => {
  try {
    const stockDetails = await getStockDetails(stockName);
    console.log(`Details for ${stockName}:`, stockDetails);
    // Process and display the stock details in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Trending Stocks

Fetch trending stocks:

```javascript
/**
 * Fetches trending stocks
 * @returns {Promise<Object>} Trending stocks data
 */
export const getTrendingStocks = async () => {
  try {
    const { data } = await indianAPI.get('/trending');
    return data;
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    throw error;
  }
};

// Usage example:
const displayTrendingStocks = async () => {
  try {
    const trendingStocks = await getTrendingStocks();
    console.log('Trending Stocks:', trendingStocks);
    // Process and display trending stocks in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Statement Data

Fetch statement data for a stock:

```javascript
/**
 * Fetches statement data for a stock
 * @param {string} stockName - Name of the stock
 * @param {string} stats - Type of statement statistics
 * @returns {Promise<Object>} Statement data
 */
export const getStatementData = async (stockName, stats) => {
  try {
    const { data } = await indianAPI.get('/statement', {
      params: {
        stock_name: stockName,
        stats: stats
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching statement data for ${stockName}:`, error);
    throw error;
  }
};

// Usage example:
const displayStatementData = async (stockName, stats) => {
  try {
    const statementData = await getStatementData(stockName, stats);
    console.log(`Statement data for ${stockName}:`, statementData);
    // Process and display the statement data in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Commodities Data

Fetch commodities data:

```javascript
/**
 * Fetches commodities data
 * @returns {Promise<Object>} Commodities data
 */
export const getCommoditiesData = async () => {
  try {
    const { data } = await indianAPI.get('/commodities');
    return data;
  } catch (error) {
    console.error('Error fetching commodities data:', error);
    throw error;
  }
};

// Usage example:
const displayCommoditiesData = async () => {
  try {
    const commoditiesData = await getCommoditiesData();
    console.log('Commodities Data:', commoditiesData);
    // Process and display the commodities data in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Mutual Funds Data

Fetch mutual funds data:

```javascript
/**
 * Fetches mutual funds data
 * @returns {Promise<Object>} Mutual funds data
 */
export const getMutualFundsData = async () => {
  try {
    const { data } = await indianAPI.get('/mutual_funds');
    return data;
  } catch (error) {
    console.error('Error fetching mutual funds data:', error);
    throw error;
  }
};

// Usage example:
const displayMutualFundsData = async () => {
  try {
    const mutualFundsData = await getMutualFundsData();
    console.log('Mutual Funds Data:', mutualFundsData);
    // Process and display the mutual funds data in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Price Shockers Data

Fetch price shockers data:

```javascript
/**
 * Fetches price shockers data
 * @returns {Promise<Object>} Price shockers data
 */
export const getPriceShockersData = async () => {
  try {
    const { data } = await indianAPI.get('/price_shockers');
    return data;
  } catch (error) {
    console.error('Error fetching price shockers data:', error);
    throw error;
  }
};

// Usage example:
const displayPriceShockersData = async () => {
  try {
    const priceShockersData = await getPriceShockersData();
    console.log('Price Shockers Data:', priceShockersData);
    // Process and display the price shockers data in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### BSE Most Active Stocks

Fetch BSE most active stocks:

```javascript
/**
 * Fetches BSE most active stocks
 * @returns {Promise<Object>} BSE most active stocks data
 */
export const getBSEMostActiveStocks = async () => {
  try {
    const { data } = await indianAPI.get('/BSE_most_active');
    return data;
  } catch (error) {
    console.error('Error fetching BSE most active stocks:', error);
    throw error;
  }
};

// Usage example:
const displayBSEMostActiveStocks = async () => {
  try {
    const bseMostActiveStocks = await getBSEMostActiveStocks();
    console.log('BSE Most Active Stocks:', bseMostActiveStocks);
    // Process and display BSE most active stocks in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### NSE Most Active Stocks

Fetch NSE most active stocks:

```javascript
/**
 * Fetches NSE most active stocks
 * @returns {Promise<Object>} NSE most active stocks data
 */
export const getNSEMostActiveStocks = async () => {
  try {
    const { data } = await indianAPI.get('/NSE_most_active');
    return data;
  } catch (error) {
    console.error('Error fetching NSE most active stocks:', error);
    throw error;
  }
};

// Usage example:
const displayNSEMostActiveStocks = async () => {
  try {
    const nseMostActiveStocks = await getNSEMostActiveStocks();
    console.log('NSE Most Active Stocks:', nseMostActiveStocks);
    // Process and display NSE most active stocks in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Historical Data

Fetch historical data for a stock:

```javascript
/**
 * Fetches historical data for a stock
 * @param {string} stockName - Name of the stock
 * @param {string} period - Time period (1m, 6m, 1yr, 3yr, 5yr, 10yr, max)
 * @param {string} filter - Filter type (default, price, pe, sm, evebitda, ptb, mcs)
 * @returns {Promise<Object>} Historical data
 */
export const getHistoricalData = async (stockName, period = '1m', filter = 'default') => {
  try {
    const { data } = await indianAPI.get('/historical_data', {
      params: {
        stock_name: stockName,
        period: period,
        filter: filter
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching historical data for ${stockName}:`, error);
    throw error;
  }
};

// Usage example:
const displayHistoricalData = async (stockName, period, filter) => {
  try {
    const historicalData = await getHistoricalData(stockName, period, filter);
    console.log(`Historical data for ${stockName}:`, historicalData);
    // Process and display the historical data in your UI
    // This could be used for creating charts
  } catch (error) {
    // Handle error in UI
  }
};
```

### Industry Search

Search for industry data:

```javascript
/**
 * Searches for industry data
 * @param {string} query - Search query
 * @returns {Promise<Object>} Industry search results
 */
export const searchIndustryData = async (query) => {
  try {
    const { data } = await indianAPI.get('/industry_search', {
      params: {
        query: query
      }
    });
    return data;
  } catch (error) {
    console.error(`Error searching industry data for "${query}":`, error);
    throw error;
  }
};

// Usage example:
const displayIndustrySearchResults = async (query) => {
  try {
    const industrySearchResults = await searchIndustryData(query);
    console.log(`Industry search results for "${query}":`, industrySearchResults);
    // Process and display the industry search results in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Stock Forecasts

Fetch stock forecasts:

```javascript
/**
 * Fetches stock forecasts
 * @param {string} stockId - Stock ID
 * @param {string} measureCode - Measure code (EPS, CPS, CPX, DPS, etc.)
 * @param {string} periodType - Period type (Annual, Interim)
 * @param {string} dataType - Data type (Actuals, Estimates)
 * @param {string} age - Data age (OneWeekAgo, ThirtyDaysAgo, etc.)
 * @returns {Promise<Object>} Stock forecasts
 */
export const getStockForecasts = async (
  stockId, 
  measureCode = 'EPS', 
  periodType = 'Annual', 
  dataType = 'Actuals', 
  age = 'Current'
) => {
  try {
    const { data } = await indianAPI.get('/stock_forecasts', {
      params: {
        stock_id: stockId,
        measure_code: measureCode,
        period_type: periodType,
        data_type: dataType,
        age: age
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching stock forecasts for ${stockId}:`, error);
    throw error;
  }
};

// Usage example:
const displayStockForecasts = async (stockId, measureCode, periodType, dataType, age) => {
  try {
    const stockForecasts = await getStockForecasts(stockId, measureCode, periodType, dataType, age);
    console.log(`Stock forecasts for ${stockId}:`, stockForecasts);
    // Process and display the stock forecasts in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Historical Stats

Fetch historical statistics for a stock:

```javascript
/**
 * Fetches historical statistics for a stock
 * @param {string} stockName - Name of the stock
 * @param {string} stats - Type of statistics
 * @returns {Promise<Object>} Historical statistics
 */
export const getHistoricalStats = async (stockName, stats) => {
  try {
    const { data } = await indianAPI.get('/historical_stats', {
      params: {
        stock_name: stockName,
        stats: stats
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching historical stats for ${stockName}:`, error);
    throw error;
  }
};

// Usage example:
const displayHistoricalStats = async (stockName, stats) => {
  try {
    const historicalStats = await getHistoricalStats(stockName, stats);
    console.log(`Historical stats for ${stockName}:`, historicalStats);
    // Process and display the historical stats in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Corporate Actions

Fetch corporate actions for a stock:

```javascript
/**
 * Fetches corporate actions for a stock
 * @param {string} stockName - Name of the stock
 * @returns {Promise<Object>} Corporate actions
 */
export const getCorporateActions = async (stockName) => {
  try {
    const { data } = await indianAPI.get('/corporate_actions', {
      params: {
        stock_name: stockName
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching corporate actions for ${stockName}:`, error);
    throw error;
  }
};

// Usage example:
const displayCorporateActions = async (stockName) => {
  try {
    const corporateActions = await getCorporateActions(stockName);
    console.log(`Corporate actions for ${stockName}:`, corporateActions);
    // Process and display the corporate actions in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Mutual Fund Search

Search for mutual funds:

```javascript
/**
 * Searches for mutual funds
 * @param {string} query - Search query
 * @returns {Promise<Object>} Mutual fund search results
 */
export const searchMutualFunds = async (query) => {
  try {
    const { data } = await indianAPI.get('/mutual_fund_search', {
      params: {
        query: query
      }
    });
    return data;
  } catch (error) {
    console.error(`Error searching mutual funds for "${query}":`, error);
    throw error;
  }
};

// Usage example:
const displayMutualFundSearchResults = async (query) => {
  try {
    const mutualFundSearchResults = await searchMutualFunds(query);
    console.log(`Mutual fund search results for "${query}":`, mutualFundSearchResults);
    // Process and display the mutual fund search results in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Stock Target Price

Fetch target price for a stock:

```javascript
/**
 * Fetches target price for a stock
 * @param {string} stockId - Stock ID
 * @returns {Promise<Object>} Stock target price
 */
export const getStockTargetPrice = async (stockId) => {
  try {
    const { data } = await indianAPI.get('/stock_target_price', {
      params: {
        stock_id: stockId
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching target price for ${stockId}:`, error);
    throw error;
  }
};

// Usage example:
const displayStockTargetPrice = async (stockId) => {
  try {
    const stockTargetPrice = await getStockTargetPrice(stockId);
    console.log(`Target price for ${stockId}:`, stockTargetPrice);
    // Process and display the stock target price in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Mutual Funds Details

Fetch details for a mutual fund:

```javascript
/**
 * Fetches details for a mutual fund
 * @param {string} stockName - Name of the mutual fund
 * @returns {Promise<Object>} Mutual fund details
 */
export const getMutualFundDetails = async (stockName) => {
  try {
    const { data } = await indianAPI.get('/mutual_funds_details', {
      params: {
        stock_name: stockName
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching mutual fund details for ${stockName}:`, error);
    throw error;
  }
};

// Usage example:
const displayMutualFundDetails = async (stockName) => {
  try {
    const mutualFundDetails = await getMutualFundDetails(stockName);
    console.log(`Mutual fund details for ${stockName}:`, mutualFundDetails);
    // Process and display the mutual fund details in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### Recent Announcements

Fetch recent announcements for a stock:

```javascript
/**
 * Fetches recent announcements for a stock
 * @param {string} stockName - Name of the stock
 * @returns {Promise<Object>} Recent announcements
 */
export const getRecentAnnouncements = async (stockName) => {
  try {
    const { data } = await indianAPI.get('/recent_announcements', {
      params: {
        stock_name: stockName
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching recent announcements for ${stockName}:`, error);
    throw error;
  }
};

// Usage example:
const displayRecentAnnouncements = async (stockName) => {
  try {
    const recentAnnouncements = await getRecentAnnouncements(stockName);
    console.log(`Recent announcements for ${stockName}:`, recentAnnouncements);
    // Process and display the recent announcements in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

### 52 Week High/Low Data

Fetch 52-week high/low data:

```javascript
/**
 * Fetches 52-week high/low data
 * @returns {Promise<Object>} 52-week high/low data
 */
export const get52WeekHighLowData = async () => {
  try {
    const { data } = await indianAPI.get('/fetch_52_week_high_low_data');
    return data;
  } catch (error) {
    console.error('Error fetching 52-week high/low data:', error);
    throw error;
  }
};

// Usage example:
const display52WeekHighLowData = async () => {
  try {
    const highLowData = await get52WeekHighLowData();
    console.log('52-week high/low data:', highLowData);
    // Process and display the 52-week high/low data in your UI
  } catch (error) {
    // Handle error in UI
  }
};
```

## Utility Functions

Here are some utility functions to help with common tasks:

```javascript
/**
 * Formats a number as currency (INR)
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);
};

/**
 * Formats a date string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

/**
 * Calculates percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  return ((newValue - oldValue) / oldValue) * 100;
};
```

## Real-time Data Integration

For integrating real-time data into your website:

```javascript
/**
 * Updates data on the specified interval
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Function} updateUIFunction - Function to update UI with new data
 * @param {number} intervalMs - Interval in milliseconds
 * @returns {number} Interval ID (for clearing the interval)
 */
export const setupRealTimeUpdates = (fetchFunction, updateUIFunction, intervalMs = 60000) => {
  // Fetch immediately
  fetchFunction()
    .then(data => updateUIFunction(data))
    .catch(error => console.error('Error in initial data fetch:', error));
  
  // Then set up interval
  return setInterval(async () => {
    try {
      const data = await fetchFunction();
      updateUIFunction(data);
    } catch (error) {
      console.error('Error in interval data fetch:', error);
    }
  }, intervalMs);
};

// Usage example:
// For a dashboard showing trending stocks with auto-refresh every minute
const updateTrendingStocksUI = (data) => {
  // Update your UI with the new data
  const container = document.getElementById('trending-stocks-container');
  
  // Simple example - in practice you might use a framework or more complex rendering logic
  if (container && data && data.length > 0) {
    container.innerHTML = `
      <h2>Trending Stocks</h2>
      <div class="stocks-grid">
        ${data.map(stock => `
          <div class="stock-card">
            <h3>${stock.name}</h3>
            <p class="price">${formatCurrency(stock.currentPrice)}</p>
            <p class="change ${stock.change >= 0 ? 'positive' : 'negative'}">
              ${stock.change >= 0 ? '↑' : '↓'} ${Math.abs(stock.change).toFixed(2)}%
            </p>
          </div>
        `).join('')}
      </div>
      <p class="last-updated">Last updated: ${new Date().toLocaleTimeString()}</p>
    `;
  }
};

// Start real-time updates
const trendingStocksInterval = setupRealTimeUpdates(
  getTrendingStocks,
  updateTrendingStocksUI,
  60000 // Update every minute
);

// Stop updates when needed (e.g., when component unmounts)
// clearInterval(trendingStocksInterval);
```

## Error Handling

Implement robust error handling:

```javascript
/**
 * Global error handling function
 * @param {Error} error - Error object
 * @param {string} context - Context where the error occurred
 */
export const handleApiError = (error, context) => {
  // Log error details
  console.error(`API Error in ${context}:`, error);
  
  // Check for specific error types
  if (error.response) {
    // Server responded with a status code outside of 2xx range
    const statusCode = error.response.status;
    const errorMessage = error.response.data?.message || 'Unknown error';
    
    switch (statusCode) {
      case 401:
        // Unauthorized - API key issue
        showErrorNotification('Authentication Error', 'Your API key appears to be invalid or expired.');
        break;
      case 403:
        // Forbidden
        showErrorNotification('Access Denied', 'You do not have permission to access this resource.');
        break;
      case 404:
        // Not found
        showErrorNotification('Resource Not Found', `The requested ${context} could not be found.`);
        break;
      case 429:
        // Rate limit exceeded
        showErrorNotification('Rate Limit Exceeded', 'You have exceeded the API rate limit. Please try again later.');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        showErrorNotification('Server Error', 'The server encountered an error. Please try again later.');
        break;
      default:
        // Other errors
        showErrorNotification('API Error', `Error in ${context}: ${errorMessage}`);
    }
  } else if (error.request) {
    // Request was made but no response received
    showErrorNotification('Network Error', 'No response received from the server. Please check your internet connection.');
  } else {
    // Error in setting up the request
    showErrorNotification('Request Error', `Error setting up the request: ${error.message}`);
  }
  
  // Return a rejected promise to propagate the error
  return Promise.reject(error);
};

/**
 * Display an error notification to the user
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
const showErrorNotification = (title, message) => {
  // Implement according to your UI library/framework
  // Example with a simple alert (you might want to use a proper notification system)
  console.error(`${title}: ${message}`);
  
  // Example with a custom notification element
  const notificationContainer = document.getElementById('notification-container');
  if (notificationContainer) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <h4>${title}</h4>
      <p>${message}</p>
      <button class="close-btn">&times;</button>
    `;
    
    // Add close button functionality
    notification.querySelector('.close-btn').addEventListener('click', () => {
      notification.remove();
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
    
    notificationContainer.appendChild(notification);
  }
};
```

Using these functions and examples, you can easily integrate the Indian API Marketplace services into your website and provide real-time financial data to your users.
