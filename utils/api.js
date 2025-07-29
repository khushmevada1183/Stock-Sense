import * as api from '../api/clientApi';

// Re-export all API functions with consistent naming
export const {
  // Health check
  getHealthStatus,
  
  // Market data - Updated to match available APIs
  getFeaturedStocks,
  getMarketOverview,
  getLatestNews,
  getUpcomingIPOs,
  searchStocks,
  getMarketMovers,
  
  // Stock-specific data - Updated to match available APIs
  getStockDetails,
  getHistoricalPrices,
  getFinancialStatements,
  getCompanyProfile,
  
  // IPO data
  getIPODetails,
  
  // Additional functions from documented API
  getStockTargetPrice,
  
  // Portfolio functions - Mock versions returning empty data
  getUserPortfolios,
  getPortfolioHoldings,
  getPortfolioSummary,
  deletePortfolio,
  createPortfolio,
  updatePortfolio,
  
  // Market data
  getCommodities,
  getNSEMostActive,
  getBSEMostActive,
  getPriceShockers
} = api;

// Alias functions with alternative names for backward compatibility
export const fetchStockDetails = getStockDetails;
export const fetchHistoricalData = getHistoricalPrices;

// Use getPriceShockers for both gainers and losers
export const fetchTopGainers = async () => {
  const data = await getPriceShockers();
  return data.filter((stock) => stock.change_percent && parseFloat(stock.change_percent) > 0);
};

export const fetchTopLosers = async () => {
  const data = await getPriceShockers();
  return data.filter((stock) => stock.change_percent && parseFloat(stock.change_percent) < 0);
};

// Use getLatestNews instead of fetchMarketNews
export const fetchMarketNews = async () => {
  const response = await getLatestNews();
  // The API returns { success: true, data: [...] }
  // And clientApi returns the data property directly.
  return response.data || [];
};

// Helper object for consistent API usage
export const apiHelpers = {
  // Stock data - updated to match available APIs
  getStockDetails,
  searchStocks,
  getHistoricalPrices,
  getFinancialStatements,
  getCompanyProfile,
  getStockTargetPrice,
  
  // Market data - updated to match available APIs
  getFeaturedStocks,
  getMarketOverview,
  getLatestNews,
  getUpcomingIPOs,
  getMarketMovers,
  
  // IPO data
  getIPODetails,
  
  // Portfolio - mock functions
  getUserPortfolios,
  getPortfolioHoldings,
  getPortfolioSummary,
  
  // Additional documented APIs
  getCommodities,
  getNSEMostActive,
  getBSEMostActive,
  getPriceShockers
};

// Default export
export default api;
