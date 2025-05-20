// Re-export all services from the new API structure
// This file is maintained for backward compatibility

import * as StocksAPI from './api/stocks';
import * as IpoAPI from './api/ipo';
import * as NewsAPI from './api/news';
import * as MarketAPI from './api/market';
import * as PortfolioAPI from './api/portfolio';
import { ApiClient } from './api/client';

// Get primary API client (for backward compatibility)
function getApiClient(): ApiClient {  // Get API URL from environment variables or localStorage
  let apiUrl = '';
  
  if (typeof window !== 'undefined') {
    apiUrl = localStorage.getItem('api_url') || 
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
  } else {
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
  }

  return new ApiClient({
    baseURL: apiUrl,
    timeout: 10000,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });
}
import { StockDetails, SearchResult, HistoricalDataPoint, NewsItem, IpoItem, MarketIndex } from './api/types';

// Export types for backward compatibility
export type { StockDetails, SearchResult, HistoricalDataPoint, NewsItem, IpoItem, MarketIndex };

// Maintain backward compatibility for existing code
const api = {
  get: async (url: string, config?: any) => {
    const client = getApiClient();
    return { data: await client.get(url, config?.params) };
  },
  post: async (url: string, data: any, config?: any) => {
    const client = getApiClient();
    return { data: await client.post(url, data, config) };
  },
  put: async (url: string, data: any, config?: any) => {
    const client = getApiClient();
    return { data: await client.put(url, data, config) };
  },
  delete: async (url: string, config?: any) => {
    const client = getApiClient();
    return { data: await client.delete(url, config) };
  }
};

// Stock service
export const stockService = {
  // Get featured stocks
  getFeaturedStocks: async () => {
    try {
      const stocks = await StocksAPI.getFeaturedStocks();
      return {
        stocks: stocks.map((stock, index) => ({
          id: index + 1, // Generate a unique ID
          symbol: stock.symbol || `STOCK${index}`,
          company_name: stock.company_name || stock.companyName || 'Unknown Company',
          sector_name: stock.sector || 'Various',
          current_price: stock.current_price || stock.price || 0,
          price_change_percentage: stock.percent_change || stock.changePercent || 0
        }))
      };
    } catch (error) {
      console.error('Error fetching featured stocks:', error);
      // Return empty array on error so the UI can handle it gracefully
      return { stocks: [] };
    }
  },
  
  // Get market overview
  getMarketOverview: async () => {
    try {
      const { indices } = await MarketAPI.getMarketOverview();
      return {
        indices
      };
    } catch (error) {
      console.error('Error fetching market overview:', error);
      throw error;
    }
  },
  
  // Get stock details
  getStockDetails: async (symbol: string) => {
    try {
      const stock = await StocksAPI.getStockDetails(symbol);
      return {
        stock
      };
    } catch (error) {
      console.error(`Error fetching stock details for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Get stock price history
  getStockPriceHistory: async (symbol: string, timeRange: string) => {
    try {
      // Map frontend timeRange to backend period parameter
      let period = '1m'; // Default
      switch (timeRange) {
        case '1W':
          period = '1w';
          break;
        case '3M':
          period = '3m';
          break;
        case '1Y':
          period = '1yr';
          break;
        default:
          period = '1m';
      }
      
      const priceHistory = await StocksAPI.getHistoricalData(symbol, period);
      
      return {
        symbol,
        timeRange,
        priceHistory
      };
    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error);
      throw error;
    }
  },
  
  // Get user watchlist
  getWatchlist: async () => {
    try {
      const client = getApiClient();
      const watchlist = await client.get('/watchlist');
      return {
        watchlist
      };
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },
  
  // Add stock to watchlist
  addToWatchlist: async (stockId: number) => {
    try {
      const client = getApiClient();
      return await client.post('/watchlist', { stockId });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },
  
  // Remove stock from watchlist
  removeFromWatchlist: async (stockId: number) => {
    try {
      const client = getApiClient();
      return await client.delete(`/watchlist/${stockId}`);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },
  
  // Search stocks
  searchStocks: async (query: string) => {
    try {
      return await StocksAPI.searchStocks(query);
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  },
  
  // Get IPO data
  getIpoData: async () => {
    try {
      const ipoData = await IpoAPI.getIpoData();
      return {
        ipoData
      };
    } catch (error) {
      console.error('Error fetching IPO data:', error);
      throw error;
    }
  },
  
  // Get market news
  getMarketNews: async () => {
    try {
      const news = await NewsAPI.getMarketNews();
      return {
        news
      };
    } catch (error) {
      console.error('Error fetching market news:', error);
      throw error;
    }
  }
};

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const client = getApiClient();
    return await client.post('/auth/login', { email, password });
  },
  
  register: async (userData: any) => {
    const client = getApiClient();
    return await client.post('/auth/register', userData);
  },
  
  getCurrentUser: async () => {
    const client = getApiClient();
    return await client.get('/auth/me');
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
};

// Export individual functions for direct imports
export const searchStocks = StocksAPI.searchStocks;
export const getStockDetails = StocksAPI.getStockDetails;
export const getHistoricalData = StocksAPI.getHistoricalData;
export const getCompanyLogo = StocksAPI.getCompanyLogo;
export const getTopGainers = StocksAPI.getTopGainers;
export const getTopLosers = StocksAPI.getTopLosers;
export const get52WeekHighLow = StocksAPI.get52WeekHighLow;
export const getStockTargetPrice = StocksAPI.getStockTargetPrice;
export const getIpoData = IpoAPI.getIpoData;
export const getUpcomingIpos = IpoAPI.getUpcomingIpos;
export const getRecentIpos = IpoAPI.getRecentIpos;
export const getMarketNews = NewsAPI.getMarketNews;
export const getStockNews = NewsAPI.getStockNews;
export const getSentimentNews = NewsAPI.getSentimentNews;
export const getMarketOverview = MarketAPI.getMarketOverview;
export const getMarketIndices = MarketAPI.getMarketIndices;
export const getCommoditiesData = MarketAPI.getCommoditiesData;
export const getBSEMostActiveStocks = MarketAPI.getBSEMostActiveStocks;
export const getNSEMostActiveStocks = MarketAPI.getNSEMostActiveStocks;
export const getPriceShockersData = MarketAPI.getPriceShockersData;
export const searchIndustryData = MarketAPI.searchIndustryData;
export const getUserPortfolios = PortfolioAPI.getUserPortfolios;
export const createPortfolio = PortfolioAPI.createPortfolio;
export const updatePortfolio = PortfolioAPI.updatePortfolio;
export const deletePortfolio = PortfolioAPI.deletePortfolio;

// Export default API client
export default getApiClient; 