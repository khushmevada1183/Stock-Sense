/**
 * API Services Entry Point
 * Main export file for all API services
 */
import { API_CONFIG } from './config';
import { ApiClient } from './client';

// Import service modules
import * as stocksService from './services/stocks';
import * as newsService from './services/news';
import * as ipoService from './services/ipo';
import * as marketService from './services/market';
import * as portfolioService from './services/portfolio';

// Export service modules
export { stocksService, newsService, ipoService, marketService, portfolioService };

// Export types
export * from './types';

// API client instances
let standardApiClient: ApiClient | null = null;
let indianApiClient: ApiClient | null = null;

/**
 * Get the standard API client instance (lazy loading)
 * @returns Standard API client instance
 */
export function getApiClient(): ApiClient {
  if (!standardApiClient) {
    // Get API URL from environment variables or localStorage
    let apiUrl = API_CONFIG.URLS.STANDARD;
    
    if (typeof window !== 'undefined') {
      apiUrl = localStorage.getItem('api_url') || apiUrl;
    }

    standardApiClient = new ApiClient({
      baseURL: apiUrl,
      timeout: API_CONFIG.REQUEST.TIMEOUT,
      cacheTTL: API_CONFIG.CACHE.DEFAULT_TTL
    });
  }
  
  return standardApiClient;
}

/**
 * Get the Indian API client instance (lazy loading)
 * @returns Indian API client instance
 */
export function getIndianApiClient(): ApiClient {
  if (!indianApiClient) {
    indianApiClient = new ApiClient({
      baseURL: API_CONFIG.URLS.INDIAN,
      apiKey: API_CONFIG.DEFAULT_INDIAN_API_KEY,
      timeout: API_CONFIG.REQUEST.TIMEOUT,
      cacheTTL: API_CONFIG.CACHE.DEFAULT_TTL
    });
  }
  
  return indianApiClient;
}

/**
 * Clear all API caches
 */
export function clearApiCaches(): void {
  if (standardApiClient) {
    standardApiClient.clearCache();
  }
  
  if (indianApiClient) {
    indianApiClient.clearCache();
  }
}

/**
 * Reset API clients (useful for changing configuration)
 */
export function resetApiClients(): void {
  standardApiClient = null;
  indianApiClient = null;
}

/**
 * Set custom API URL
 * @param url Custom API URL
 */
export function setCustomApiUrl(url: string): void {
  if (typeof window !== 'undefined' && url) {
    localStorage.setItem('api_url', url);
    resetApiClients();
  }
}

/**
 * Set custom API key
 * @param key Custom API key
 */
export function setCustomApiKey(key: string): void {
  if (typeof window !== 'undefined' && key) {
    localStorage.setItem('api_key', key);
    resetApiClients();
  }
}

/**
 * Default export with all services and utilities
 */
export default {
  stocks: stocksService,
  news: newsService,
  ipo: ipoService,
  market: marketService,
  portfolio: portfolioService,
  getApiClient,
  getIndianApiClient,
  clearApiCaches,
  resetApiClients,
  setCustomApiUrl,
  setCustomApiKey
}; 