/**
 * API Service Compatibility Layer
 * 
 * This file provides backward compatibility with the old apiService.ts interface.
 * It maps old function calls to the new API implementation.
 * 
 * @deprecated Use the new API services from '@/services/api' instead.
 */

import { stocksService, newsService, ipoService, marketService } from '../../api';
import type { 
  SearchResult, 
  StockDetails, 
  HistoricalDataPoint,
  NewsItem,
  IpoItem
} from '../../api/types';

/**
 * @deprecated Use stocksService.searchStocks instead
 */
async function searchStocks(query: string): Promise<{ results: SearchResult[] }> {
  console.warn('Warning: apiService.searchStocks is deprecated. Use stocksService.searchStocks instead.');
  return stocksService.searchStocks(query);
}

/**
 * @deprecated Use stocksService.getStockDetails instead
 */
async function getStockDetails(symbol: string): Promise<StockDetails> {
  console.warn('Warning: apiService.getStockDetails is deprecated. Use stocksService.getStockDetails instead.');
  return stocksService.getStockDetails(symbol);
}

/**
 * @deprecated Use stocksService.getHistoricalData instead
 */
async function getHistoricalData(
  symbol: string,
  period: string = '1yr',
  filter: string = 'price'
): Promise<HistoricalDataPoint[]> {
  console.warn('Warning: apiService.getHistoricalData is deprecated. Use stocksService.getHistoricalData instead.');
  return stocksService.getHistoricalData(symbol, period, filter);
}

/**
 * @deprecated Use ipoService.getUpcomingIpos instead
 */
async function getIpoData(): Promise<IpoItem[]> {
  console.warn('Warning: apiService.getIpoData is deprecated. Use ipoService.getUpcomingIpos instead.');
  return ipoService.getUpcomingIpos();
}

/**
 * @deprecated Use newsService.getLatestNews instead
 */
async function getMarketNews(): Promise<NewsItem[]> {
  console.warn('Warning: apiService.getMarketNews is deprecated. Use newsService.getLatestNews instead.');
  return newsService.getLatestNews();
}

/**
 * @deprecated Use marketService.getTopGainers instead
 */
async function getTopGainers(): Promise<StockDetails[]> {
  console.warn('Warning: apiService.getTopGainers is deprecated. Use marketService.getTopGainers instead.');
  return marketService.getTopGainers();
}

/**
 * @deprecated Use marketService.getTopLosers instead
 */
async function getTopLosers(): Promise<StockDetails[]> {
  console.warn('Warning: apiService.getTopLosers is deprecated. Use marketService.getTopLosers instead.');
  return marketService.getTopLosers();
}

/**
 * @deprecated Use stocksService.getFeaturedStocks instead
 */
async function getFeaturedStocks(): Promise<StockDetails[]> {
  console.warn('Warning: apiService.getFeaturedStocks is deprecated. Use stocksService.getFeaturedStocks instead.');
  return stocksService.getFeaturedStocks();
}

/**
 * @deprecated Use marketService.getMarketIndices instead
 */
async function getMarketIndices(): Promise<any> {
  console.warn('Warning: apiService.getMarketIndices is deprecated. Use marketService.getMarketIndices instead.');
  return marketService.getMarketIndices();
}

// Create compatibility layer that matches the original interface
const apiService = {
  searchStocks,
  getStockDetails,
  getHistoricalData,
  getIpoData,
  getMarketNews,
  getTopGainers,
  getTopLosers,
  getFeaturedStocks,
  getMarketIndices
};

export default apiService;
export type { SearchResult, StockDetails, HistoricalDataPoint, NewsItem, IpoItem }; 