// Import all existing services from stockService
import * as stockServiceImports from './stockService';

// Create a more structured API service module
export const stockService = {
  // Market overview functions
  getMarketOverview: async () => {
    try {
      const marketIndices = await stockServiceImports.getMarketIndices();
      return marketIndices;
    } catch (error) {
      console.error('Error in getMarketOverview:', error);
      throw error; // Re-throw to propagate to UI
    }
  },

  // Featured stocks
  getFeaturedStocks: async () => {
    try {
      return await stockServiceImports.getFeaturedStocks();
    } catch (error) {
      console.error('Error in getFeaturedStocks:', error);
      throw error; // Re-throw to propagate to UI
    }
  },

  // Stock price history
  getStockPriceHistory: async (symbol, range) => {
    try {
      return await stockServiceImports.getHistoricalData(symbol, range, 'price');
    } catch (error) {
      console.error(`Error getting price history for ${symbol}:`, error);
      throw error; // Re-throw to propagate to UI
    }
  },

  // IPO data
  getIpoData: async () => {
    try {
      return await stockServiceImports.getIpoData();
    } catch (error) {
      console.error('Error getting IPO data:', error);
      throw error; // Re-throw to propagate to UI
    }
  },

  // Market news
  getMarketNews: async () => {
    try {
      return await stockServiceImports.getMarketNews();
    } catch (error) {
      console.error('Error getting market news:', error);
      throw error; // Re-throw to propagate to UI
    }
  }
};

// Re-export individual functions for direct imports
export const {
  searchStocks,
  getStockDetails,
  getAllStocks,
  getHistoricalData,
  getCompanyLogo,
  getTopGainers,
  getTopLosers
} = stockServiceImports; 