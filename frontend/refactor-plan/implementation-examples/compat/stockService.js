/**
 * Stock Service Compatibility Layer
 * 
 * This file provides backward compatibility with the old stockService.js interface.
 * It maps old function calls to the new API implementation.
 * 
 * @deprecated Use the new API services from '@/services/api' instead.
 */

import { stocksService, marketService, portfolioService } from '../../api';

/**
 * @deprecated Use stocksService.getStockDetails instead
 */
export async function getStockDetails(symbol) {
  console.warn('Warning: getStockDetails is deprecated. Use stocksService.getStockDetails instead.');
  return stocksService.getStockDetails(symbol);
}

/**
 * @deprecated Use stocksService.getHistoricalData instead
 */
export async function getHistoricalData(symbol, period = '1yr', filter = 'price') {
  console.warn('Warning: getHistoricalData is deprecated. Use stocksService.getHistoricalData instead.');
  return stocksService.getHistoricalData(symbol, period, filter);
}

/**
 * @deprecated Use portfolioService.getUserPortfolios instead
 */
export async function getUserPortfolios(userId) {
  console.warn('Warning: getUserPortfolios is deprecated. Use portfolioService.getUserPortfolios instead.');
  return portfolioService.getUserPortfolios(userId);
}

/**
 * @deprecated Use portfolioService.createPortfolio instead
 */
export async function createPortfolio(data) {
  console.warn('Warning: createPortfolio is deprecated. Use portfolioService.createPortfolio instead.');
  return portfolioService.createPortfolio(data);
}

/**
 * @deprecated Use portfolioService.updatePortfolio instead
 */
export async function updatePortfolio(id, data) {
  console.warn('Warning: updatePortfolio is deprecated. Use portfolioService.updatePortfolio instead.');
  return portfolioService.updatePortfolio(id, data);
}

/**
 * @deprecated Use portfolioService.deletePortfolio instead
 */
export async function deletePortfolio(id) {
  console.warn('Warning: deletePortfolio is deprecated. Use portfolioService.deletePortfolio instead.');
  return portfolioService.deletePortfolio(id);
}

/**
 * @deprecated Use marketService.get52WeekHighLow instead
 */
export async function get52WeekHighLow() {
  console.warn('Warning: get52WeekHighLow is deprecated. Use marketService.get52WeekHighLow instead.');
  return marketService.get52WeekHighLow();
}

/**
 * @deprecated Use stocksService.getCompanyLogo instead
 */
export async function getCompanyLogo(symbol) {
  console.warn('Warning: getCompanyLogo is deprecated. Use stocksService.getCompanyLogo instead.');
  return stocksService.getCompanyLogo(symbol);
}

/**
 * @deprecated Use stocksService.getTargetPrice instead
 */
export async function getStockTargetPrice(symbol) {
  console.warn('Warning: getStockTargetPrice is deprecated. Use stocksService.getTargetPrice instead.');
  return stocksService.getTargetPrice(symbol);
}

/**
 * @deprecated Use marketService.getTopGainers instead
 */
export async function getTopGainers() {
  console.warn('Warning: getTopGainers is deprecated. Use marketService.getTopGainers instead.');
  return marketService.getTopGainers();
}

/**
 * @deprecated Use marketService.getTopLosers instead
 */
export async function getTopLosers() {
  console.warn('Warning: getTopLosers is deprecated. Use marketService.getTopLosers instead.');
  return marketService.getTopLosers();
}

/**
 * @deprecated Use newsService.getLatestNews instead
 */
export async function getMarketNews() {
  console.warn('Warning: getMarketNews is deprecated. Use newsService.getLatestNews instead.');
  const { newsService } = await import('../../api');
  return newsService.getLatestNews();
}

/**
 * @deprecated Use marketService.getCommodities instead
 */
export async function getCommodities() {
  console.warn('Warning: getCommodities is deprecated. Use marketService.getCommodities instead.');
  return marketService.getCommodities();
}

// Export the stockService object for default import compatibility
export default {
  getStockDetails,
  getHistoricalData,
  getUserPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  get52WeekHighLow,
  getCompanyLogo,
  getStockTargetPrice,
  getTopGainers,
  getTopLosers,
  getMarketNews,
  getCommodities
}; 