import { ApiClient } from './client';
import { MarketIndex, StockDetails } from './types';

// Get the standard API client
function getApiClient(): ApiClient {
  // Get API URL from environment variables or localStorage
  let apiUrl = '';
  
  if (typeof window !== 'undefined') {
    apiUrl = localStorage.getItem('api_url') || 
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
  } else {
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
  }

  return new ApiClient({
    baseURL: apiUrl,
    timeout: 10000,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });
}

// Get the Indian API client
function getIndianApiClient(): ApiClient {
  const API_KEY = process.env.NEXT_PUBLIC_INDIAN_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
  const BASE_URL = process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in';
  
  return new ApiClient({
    baseURL: BASE_URL,
    apiKey: API_KEY,
    timeout: 10000,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Market API service functions
 */

/**
 * Get market overview including major indices
 * @returns Market indices data
 */
export async function getMarketOverview(): Promise<{ indices: MarketIndex[] }> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<{ indices: MarketIndex[] }>('/market/overview');
    } catch (error) {
      console.error('Error fetching market overview from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>('/market/indices');
    
    // Normalize data
    if (Array.isArray(result)) {
      return {
        indices: result.map(normalizeMarketIndex)
      };
    }
    
    // Default Indian market indices as fallback
    return {
      indices: [
        { name: 'SENSEX', value: 0, percent_change: 0 },
        { name: 'NIFTY 50', value: 0, percent_change: 0 },
        { name: 'NIFTY BANK', value: 0, percent_change: 0 },
        { name: 'NIFTY IT', value: 0, percent_change: 0 }
      ]
    };
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return { indices: [] };
  }
}

/**
 * Get market indices (SENSEX, NIFTY, etc.)
 * @returns Market indices data
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<MarketIndex[]>('/market/indices');
    } catch (error) {
      console.error('Error fetching market indices from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>('/market/indices');
    
    // Normalize data
    if (Array.isArray(result)) {
      return result.map(normalizeMarketIndex);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return [];
  }
}

/**
 * Get commodities data (gold, silver, crude oil, etc.)
 * @returns Commodities data
 */
export async function getCommoditiesData(): Promise<any> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<any>('/market/commodities');
    } catch (error) {
      console.error('Error fetching commodities from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    return await indianClient.get<any>('/commodities');
  } catch (error) {
    console.error('Error fetching commodities data:', error);
    return [];
  }
}

/**
 * Get stocks with highest trading volume on BSE
 * @returns List of active stocks
 */
export async function getBSEMostActiveStocks(): Promise<StockDetails[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails[]>('/market/bse/most-active');
    } catch (error) {
      console.error('Error fetching BSE most active stocks from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<StockDetails[]>('/market/bse/most-active');
    
    return result.map(stock => ({
      symbol: stock.symbol,
      company_name: stock.company_name || stock.companyName || stock.name || '',
      current_price: stock.current_price || stock.price || 0,
      change: stock.change || 0,
      percent_change: stock.percent_change || 0,
      volume: stock.volume || 0
    }));
  } catch (error) {
    console.error('Error fetching BSE most active stocks:', error);
    return [];
  }
}

/**
 * Get stocks with highest trading volume on NSE
 * @returns List of active stocks
 */
export async function getNSEMostActiveStocks(): Promise<StockDetails[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails[]>('/market/nse/most-active');
    } catch (error) {
      console.error('Error fetching NSE most active stocks from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<StockDetails[]>('/market/nse/most-active');
    
    return result.map(stock => ({
      symbol: stock.symbol,
      company_name: stock.company_name || stock.companyName || stock.name || '',
      current_price: stock.current_price || stock.price || 0,
      change: stock.change || 0,
      percent_change: stock.percent_change || 0,
      volume: stock.volume || 0
    }));
  } catch (error) {
    console.error('Error fetching NSE most active stocks:', error);
    return [];
  }
}

/**
 * Get stocks with significant price movement (shockers)
 * @returns List of stocks with significant price movement
 */
export async function getPriceShockersData(): Promise<StockDetails[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails[]>('/market/price-shockers');
    } catch (error) {
      console.error('Error fetching price shockers from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<StockDetails[]>('/market/price-shockers');
    
    return result.map(stock => ({
      symbol: stock.symbol,
      company_name: stock.company_name || stock.companyName || stock.name || '',
      current_price: stock.current_price || stock.price || 0,
      change: stock.change || 0,
      percent_change: stock.percent_change || 0
    }));
  } catch (error) {
    console.error('Error fetching price shockers data:', error);
    return [];
  }
}

/**
 * Search for industry data
 * @param query Industry search query
 * @returns Industry data
 */
export async function searchIndustryData(query: string): Promise<any> {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<any>('/market/industry/search', { query });
    } catch (error) {
      console.error(`Error searching industries for "${query}" from standard API:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    return await indianClient.get<any>('/industry/search', { query });
  } catch (error) {
    console.error(`Error searching industries for "${query}":`, error);
    return [];
  }
}

// Helper function to normalize market index
function normalizeMarketIndex(index: any): MarketIndex {
  if (!index) return {} as MarketIndex;
  
  return {
    name: index.name || index.symbol || '',
    value: parseFloat(index.value || index.last || index.price || '0'),
    change: parseFloat(index.change || '0'),
    percent_change: parseFloat(index.percent_change || index.changePercent || '0')
  };
} 