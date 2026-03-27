// Single API file for Stock Sense - Calls deployed backend on Render
// This file imports the backend URL from .env and handles all API calls

import { logger } from '@/lib/logger';

// Import the deployed backend URL from environment variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

// Generic function for API calls
async function fetchApi(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add query parameters if any
  if (params && Object.keys(params).length > 0) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
  }
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error(`Error fetching from ${endpoint}`, error);
    throw error;
  }
}

// ===== STOCK DATA ENDPOINTS =====

export async function getStockDetails(stockName) {
  logger.debug(`API Call: /stock?name=${stockName}`);
  return fetchApi('/stock', { name: stockName });
}

export async function getTrendingStocks() {
  return fetchApi('/trending');
}

export async function getHistoricalData(stockName, period = '6m', filter = 'price') {
  return fetchApi('/historical_data', { 
    stock_name: stockName, 
    period: period, 
    filter: filter 
  });
}

export async function getFinancialStatement(stockName, stats) {
  logger.warn('DEPRECATED: getFinancialStatement called - should use /stock endpoint instead');
  return fetchApi('/statement', { 
    stock_name: stockName, 
    stats: stats 
  });
}

export async function getStockTargetPrice(stockId) {
  return fetchApi('/stock_target_price', { stock_id: stockId });
}

export async function getCorporateActions(stockName) {
  return fetchApi('/corporate_actions', { stock_name: stockName });
}

export async function getRecentAnnouncements(stockName) {
  return fetchApi('/recent_announcements', { stock_name: stockName });
}

export async function getStockForecasts(stockId, measureCode = 'EPS', periodType = 'Annual', dataType = 'Actuals', age = 'Current') {
  return fetchApi('/stock_forecasts', {
    stock_id: stockId,
    measure_code: measureCode,
    period_type: periodType,
    data_type: dataType,
    age: age
  });
}

export async function getHistoricalStats(stockName, stats) {
  return fetchApi('/historical_stats', { 
    stock_name: stockName, 
    stats: stats 
  });
}

// ===== MARKET DATA ENDPOINTS =====

export async function getBSEMostActive() {
  return fetchApi('/BSE_most_active');
}

export async function getNSEMostActive() {
  return fetchApi('/NSE_most_active');
}

export async function get52WeekHighLow() {
  return fetchApi('/fetch_52_week_high_low_data');
}

export async function getPriceShockers() {
  return fetchApi('/price_shockers');
}

export async function getCommodities() {
  return fetchApi('/commodities');
}

// ===== IPO DATA ENDPOINTS =====

export async function getIPOData() {
  const response = await fetchApi('/ipo');
  
  if (response && response.success) {
    return response;
  } else if (response && typeof response === 'object' && response.data) {
    return {
      success: true,
      data: response.data
    };
  } else if (response && response.upcoming) {
    return {
      success: true,
      data: response
    };
  }
  
  return {
    success: false,
    data: {
      upcoming: [],
      active: [],
      listed: [],
      closed: []
    }
  };
}

// ===== NEWS & MUTUAL FUNDS =====

export async function getLatestNews() {
  return fetchApi('/news');
}

export async function getMutualFunds() {
  return fetchApi('/mutual_funds');
}

export async function searchMutualFunds(query) {
  return fetchApi('/mutual_fund_search', { query: query });
}

export async function getMutualFundDetails(stockName) {
  return fetchApi('/mutual_funds_details', { stock_name: stockName });
}

export async function searchIndustry(query) {
  return fetchApi('/industry_search', { query: query });
}

// ===== COMPATIBILITY ALIASES =====

// Legacy function names for backward compatibility
export const getUpcomingIPOs = () => {
  logger.warn('getUpcomingIPOs is deprecated. Use getIPOData() instead.');
  return getIPOData();
};

export const getIPOCalendar = () => {
  logger.warn('getIPOCalendar is deprecated. Use getIPOData() instead.');
  return getIPOData();
};

export const getFeaturedStocks = () => getTrendingStocks();
export const searchStocks = (query) => getStockDetails(query);
export const getTopGainers = () => getTrendingStocks();
export const getTopLosers = () => getPriceShockers();
export const getFinancialStatements = (stockName) => getFinancialStatement(stockName, 'basic');
export const getCompanyProfile = (stockName) => getStockDetails(stockName);
export const getHistoricalPrices = (stockName, period = '6m') => getHistoricalData(stockName, period, 'price');
export const fetchStockDetails = getStockDetails;
export const fetchHistoricalData = getHistoricalData;

// Market news function for context compatibility
export const fetchMarketNews = async () => {
  const response = await getLatestNews();
  return response.data || response || [];
};

export async function getMarketOverview() {
  const trending = await getTrendingStocks();
  return { trending };
}

export async function getMarketMovers() {
  const bse = await getBSEMostActive();
  const nse = await getNSEMostActive();
  return { bse, nse };
}

// ===== PORTFOLIO FUNCTIONS (NOT AVAILABLE) =====

export async function getUserPortfolios() {
  logger.warn("Portfolio API not available in the current API version");
  return { portfolios: [] };
}

export async function getPortfolioDetails() {
  logger.warn("Portfolio API not available in the current API version");
  return { details: {} };
}

export async function createPortfolio(portfolioData) {
  logger.warn("Portfolio API not available in the current API version");
  logger.info("Would create portfolio with data:", portfolioData);
  return { success: true, portfolioId: Math.random().toString(36).substr(2, 9) };
}

export async function updatePortfolio(portfolioId, portfolioData) {
  logger.warn("Portfolio API not available in the current API version");
  logger.info("Would update portfolio", portfolioId, "with data:", portfolioData);
  return { success: true };
}

export async function deletePortfolio() {
  logger.warn("Portfolio API not available in the current API version");
  return { success: false, message: "API not available" };
}

export async function getPortfolioHoldings() {
  logger.warn("Portfolio API not available in the current API version");
  return { holdings: [] };
}

export async function getPortfolioSummary() {
  logger.warn("Portfolio API not available in the current API version");
  return { summary: {} };
}

// ===== HEALTH CHECK =====

export async function getHealthStatus() {
  try {
    const response = await fetch(BASE_URL.replace('/api', '/health'));
    return await response.json();
  } catch (error) {
    logger.error('Health check failed:', error);
    return { status: 'error', message: 'Backend unavailable' };
  }
}

// API helpers object for backward compatibility  
export const apiHelpers = {
  getStockDetails,
  getHistoricalData,
  getFinancialStatements,
  getCompanyProfile,
  getStockTargetPrice,
  getFeaturedStocks,
  getMarketOverview,
  getLatestNews,
  getIPOData,
  getMarketMovers,
  getUserPortfolios,
  getPortfolioHoldings,
  getPortfolioSummary,
  getCommodities,
  getNSEMostActive,
  getBSEMostActive,
  getPriceShockers
};
