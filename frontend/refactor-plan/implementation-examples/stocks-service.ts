/**
 * Stocks Service
 * Provides functions for interacting with stock data
 */
import { ApiClient } from '../client';
import { getApiClient, getIndianApiClient } from '../index';
import { API_CONFIG } from '../config';
import { 
  StockDetails, 
  SearchResult, 
  HistoricalDataPoint 
} from '../types';
import { normalizeStockDetails, normalizeHistoricalData } from '../utils/normalizers';
import { getEndpointPattern, storeEndpointPattern } from '../utils/endpoint-discovery';
import { getMockFeaturedStocks } from '../../mockHomeData';

/**
 * Search stocks by query string
 * @param query Search query
 * @returns Search results
 */
export async function searchStocks(query: string): Promise<{ results: SearchResult[] }> {
  if (!query || query.length < 2) {
    return { results: [] };
  }
  
  try {
    // First try the standard API
    const standardClient = getApiClient();
    try {
      const results = await standardClient.get<{ results: SearchResult[] }>(
        API_CONFIG.ENDPOINTS.STANDARD.SEARCH, 
        { query },
        {},
        API_CONFIG.CACHE.TTL_OVERRIDES.SEARCH
      );
      
      // If we got results, return them
      if (results?.results?.length > 0) {
        return results;
      }
    } catch (error) {
      console.error('Error searching standard API:', error);
      // Fall through to try Indian API
    }
    
    // If no results from standard API, try Indian API
    const indianClient = getIndianApiClient();
    const indianResults = await indianClient.get<{ results: StockDetails[] }>(
      API_CONFIG.ENDPOINTS.INDIAN.SEARCH, 
      { query },
      {},
      API_CONFIG.CACHE.TTL_OVERRIDES.SEARCH
    );
    
    // Format Indian API results to match expected format
    if (indianResults?.results) {
      return {
        results: indianResults.results.map(stock => ({
          symbol: stock.symbol,
          companyName: stock.company_name || stock.name || stock.symbol,
          latestPrice: stock.current_price || stock.price || stock.last_price || stock.lastPrice,
          change: stock.change,
          changePercent: stock.percent_change,
          sector: stock.sector,
          industry: stock.industry,
          tickerId: stock.tickerId
        }))
      };
    }
    
    // If no results from either API
    return { results: [] };
  } catch (error) {
    console.error(`Error searching stocks for "${query}":`, error);
    return { results: [] };
  }
}

/**
 * Get stock details by symbol
 * @param symbol Stock symbol
 * @returns Stock details
 */
export async function getStockDetails(symbol: string): Promise<StockDetails> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STANDARD.STOCK_DETAILS.replace('{symbol}', symbol);
      return await standardClient.get<StockDetails>(
        endpoint,
        {},
        {},
        API_CONFIG.CACHE.TTL_OVERRIDES.STOCK_DETAILS
      );
    } catch (error) {
      console.error(`Error fetching stock details from standard API for ${symbol}:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const formattedSymbol = symbol.replace(/[^\w.-]/g, '').toUpperCase();
    
    // Check if we already know the correct endpoint pattern
    const detailsEndpointKey = 'stock_details_endpoint';
    const knownEndpoint = getEndpointPattern(detailsEndpointKey);
    
    if (knownEndpoint) {
      try {
        const endpoint = knownEndpoint.replace('{symbol}', formattedSymbol);
        console.log(`Using cached stock details endpoint: ${endpoint}`);
        const result = await indianClient.get<StockDetails>(
          endpoint,
          {},
          {},
          API_CONFIG.CACHE.TTL_OVERRIDES.STOCK_DETAILS
        );
        return normalizeStockDetails(result);
      } catch (error) {
        console.error(`Failed using cached endpoint pattern for ${symbol} details:`, error);
        // Fall through to try all endpoints
      }
    }
    
    // Try different endpoint patterns from config
    const endpointPatterns = API_CONFIG.ENDPOINTS.PATTERNS.STOCK_DETAILS;
    
    for (let i = 0; i < endpointPatterns.length; i++) {
      const endpoint = endpointPatterns[i].replace('{symbol}', formattedSymbol);
      try {
        console.log(`Trying stock details endpoint: ${endpoint}`);
        const result = await indianClient.get<StockDetails>(
          endpoint,
          {},
          {},
          API_CONFIG.CACHE.TTL_OVERRIDES.STOCK_DETAILS
        );
        if (result) {
          storeEndpointPattern(detailsEndpointKey, endpointPatterns[i]);
          console.log(`Found working endpoint pattern: ${endpoint}`);
          return normalizeStockDetails(result);
        }
      } catch (error) {
        console.error(`Attempt ${i+1} failed for endpoint ${endpoint}:`, error);
        // Continue to next endpoint
      }
    }
    
    // If all attempts failed
    throw new Error(`Failed to fetch stock details for ${symbol}`);
  } catch (error) {
    console.error(`Error fetching stock details for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get historical price data for a stock
 * @param symbol Stock symbol
 * @param period Time period (e.g., '1d', '1w', '1m', '3m', '1yr')
 * @param filter Data filter (e.g., 'price', 'volume')
 * @returns Historical data points
 */
export async function getHistoricalData(
  symbol: string,
  period: string = '1yr',
  filter: string = 'price'
): Promise<HistoricalDataPoint[]> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      const endpoint = API_CONFIG.ENDPOINTS.STANDARD.HISTORICAL_DATA.replace('{symbol}', symbol);
      const data = await standardClient.get<HistoricalDataPoint[]>(
        endpoint,
        { period, filter },
        {},
        API_CONFIG.CACHE.TTL_OVERRIDES.HISTORICAL_DATA
      );
      
      if (data && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error(`Error fetching historical data from standard API for ${symbol}:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const formattedSymbol = symbol.replace(/[^\w.-]/g, '').toUpperCase();
    const indianPeriod = convertPeriodFormat(period);
    
    const endpoint = API_CONFIG.ENDPOINTS.INDIAN.HISTORICAL_DATA.replace('{symbol}', formattedSymbol);
    const data = await indianClient.get<any>(
      endpoint,
      { period: indianPeriod, type: filter },
      {},
      API_CONFIG.CACHE.TTL_OVERRIDES.HISTORICAL_DATA
    );
    
    return normalizeHistoricalData(data);
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get featured stocks for homepage
 * @returns List of featured stocks
 */
export async function getFeaturedStocks(): Promise<StockDetails[]> {
  try {
    // Try standard API first
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails[]>('/featured-stocks');
    } catch (error) {
      console.error('Error fetching featured stocks from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    try {
      // Try to get trending stocks from Indian API
      const trendingStocks = await getTrendingStocks();
      if (trendingStocks && trendingStocks.length > 0) {
        return trendingStocks;
      }
    } catch (error) {
      console.error('Error fetching trending stocks from Indian API:', error);
      // Fall through to use mock data
    }
    
    // If all APIs fail, use mock data
    return getMockFeaturedStocks();
  } catch (error) {
    console.error('Error fetching featured stocks:', error);
    return getMockFeaturedStocks();
  }
}

/**
 * Get trending stocks
 * @returns List of trending stocks
 */
export async function getTrendingStocks(): Promise<StockDetails[]> {
  try {
    const indianClient = getIndianApiClient();
    const data = await indianClient.get<StockDetails[]>('/trending');
    
    if (!data || data.length === 0) {
      // If no trending stocks, fall back to top gainers
      return getTopGainers();
    }
    
    return data.map(normalizeStockDetails);
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    // Fall back to top gainers
    return getTopGainers();
  }
}

/**
 * Get top gaining stocks
 * @param exchange Optional exchange (BSE/NSE)
 * @returns List of top gaining stocks
 */
export async function getTopGainers(exchange?: string): Promise<StockDetails[]> {
  try {
    const indianClient = getIndianApiClient();
    const endpoint = API_CONFIG.ENDPOINTS.INDIAN.MARKET_GAINERS;
    const params = exchange ? { exchange } : {};
    
    const data = await indianClient.get<StockDetails[]>(endpoint, params);
    return data.map(normalizeStockDetails);
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    throw error;
  }
}

/**
 * Get top losing stocks
 * @param exchange Optional exchange (BSE/NSE)
 * @returns List of top losing stocks
 */
export async function getTopLosers(exchange?: string): Promise<StockDetails[]> {
  try {
    const indianClient = getIndianApiClient();
    const endpoint = API_CONFIG.ENDPOINTS.INDIAN.MARKET_LOSERS;
    const params = exchange ? { exchange } : {};
    
    const data = await indianClient.get<StockDetails[]>(endpoint, params);
    return data.map(normalizeStockDetails);
  } catch (error) {
    console.error('Error fetching top losers:', error);
    throw error;
  }
}

/**
 * Get company logo URL
 * @param symbol Stock symbol
 * @returns Logo URL
 */
export async function getCompanyLogo(symbol: string): Promise<string> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  
  try {
    // Try standard API first
    const standardClient = getApiClient();
    try {
      const data = await standardClient.get<{ url: string }>(`/stocks/${symbol}/logo`);
      if (data && data.url) {
        return data.url;
      }
    } catch (error) {
      console.error(`Error fetching logo from standard API for ${symbol}:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const formattedSymbol = symbol.replace(/[^\w.-]/g, '').toUpperCase();
    
    try {
      const data = await indianClient.get<{ logo_url: string }>(`/stock/${formattedSymbol}/logo`);
      if (data && data.logo_url) {
        return data.logo_url;
      }
    } catch (error) {
      console.error(`Error fetching logo from Indian API for ${symbol}:`, error);
      // Fall through to default logo
    }
    
    // If all APIs fail, return default logo
    return `/images/default-stock-logo.png`;
  } catch (error) {
    console.error(`Error fetching company logo for ${symbol}:`, error);
    return `/images/default-stock-logo.png`;
  }
}

/**
 * Get target price for a stock
 * @param symbol Stock symbol
 * @returns Target price data
 */
export async function getTargetPrice(symbol: string): Promise<any> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  
  try {
    const indianClient = getIndianApiClient();
    const formattedSymbol = symbol.replace(/[^\w.-]/g, '').toUpperCase();
    
    return await indianClient.get<any>(`/stock/${formattedSymbol}/target-price`);
  } catch (error) {
    console.error(`Error fetching target price for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Convert period format between APIs
 * @param period Period string (e.g., '1d', '1w', '1m', '3m', '1yr')
 * @returns Converted period string
 */
function convertPeriodFormat(period: string): string {
  const periodMap: Record<string, string> = {
    '1d': '1day',
    '5d': '5day',
    '1w': '1week',
    '1m': '1month',
    '3m': '3month',
    '6m': '6month',
    '1yr': '1year',
    '2yr': '2year',
    '5yr': '5year',
    'max': 'max'
  };
  
  return periodMap[period] || '1year';
} 