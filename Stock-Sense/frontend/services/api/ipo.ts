import { ApiClient } from './client';
import { IpoItem } from './types';
import { getMockIpoData } from '../mockHomeData';
import { API_CONFIG } from '../config';

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
  // Use the API_CONFIG instead of hardcoded values
  const API_KEY = API_CONFIG.API_KEY;
  const BASE_URL = API_CONFIG.BASE_URL || 'https://stock.indianapi.in';
  
  return new ApiClient({
    baseURL: BASE_URL,
    apiKey: API_KEY, // This will use the API key rotation system via client.ts
    timeout: API_CONFIG.TIMEOUT || 10000,
    cacheTTL: API_CONFIG.CACHE_DURATION || 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * IPO API service functions
 */

/**
 * Get upcoming and recent IPOs
 * @returns List of IPO items
 */
export async function getIpoData(): Promise<{ ipoData: IpoItem[] }> {
  try {
    // Use mock data first
    const mockData = getMockIpoData();
    if (mockData && mockData.ipoData && mockData.ipoData.length > 0) {
      console.log('Using mock IPO data');
      // Convert mock data to match the expected IpoItem type
      return { 
        ipoData: mockData.ipoData.map(item => ({
          company_name: item.company_name || '',
          symbol: item.symbol || '',
          issue_size: item.issue_size || '',
          issue_price: (item.issue_price !== undefined) ? String(item.issue_price) : '',
          listing_date: item.listing_date || '',
          listing_gain: item.listing_gain || '',
          status: item.status || ''
        }))
      };
    }
    
    // If mock data is empty, try standard API
    const standardClient = getApiClient();
    try {
      const result = await standardClient.get<IpoItem[]>('/ipo');
      return { ipoData: result };
    } catch (error) {
      console.error('Error fetching IPO data from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>('/ipo');
    
    // Normalize data structure if needed
    if (Array.isArray(result)) {
      return { ipoData: result.map(item => normalizeIpoItem(item)) };
    }
    
    return { ipoData: [] };
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    return { ipoData: [] };
  }
}

/**
 * Get details for a specific IPO
 * @param symbol IPO symbol
 * @returns IPO details
 */
export async function getIpoDetails(symbol: string): Promise<IpoItem | null> {
  if (!symbol) {
    return null;
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<IpoItem>(`/ipo/${symbol}`);
    } catch (error) {
      console.error(`Error fetching IPO details for ${symbol} from standard API:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<IpoItem>(`/ipo/${symbol}`);
    
    // Normalize data
    return normalizeIpoItem(result);
  } catch (error) {
    console.error(`Error fetching IPO details for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get upcoming IPOs only
 * @returns List of upcoming IPOs
 */
export async function getUpcomingIpos(): Promise<IpoItem[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<IpoItem[]>('/ipo/upcoming');
    } catch (error) {
      console.error('Error fetching upcoming IPOs from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>('/ipo/upcoming');
    
    // Normalize data
    if (Array.isArray(result)) {
      return result.map(item => normalizeIpoItem(item));
    }
    
    // If no specific endpoint for upcoming, filter from all IPOs
    const allIpos = await getIpoData();
    return allIpos.ipoData.filter(ipo => 
      ipo.status?.toLowerCase() === 'upcoming' || 
      (ipo.listing_date && new Date(ipo.listing_date) > new Date())
    );
  } catch (error) {
    console.error('Error fetching upcoming IPO data:', error);
    return [];
  }
}

/**
 * Get recent IPOs (listed in the last 30 days)
 * @returns List of recent IPOs
 */
export async function getRecentIpos(): Promise<IpoItem[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<IpoItem[]>('/ipo/recent');
    } catch (error) {
      console.error('Error fetching recent IPOs from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>('/ipo/recent');
    
    // Normalize data
    if (Array.isArray(result)) {
      return result.map(item => normalizeIpoItem(item));
    }
    
    // If no specific endpoint for recent, filter from all IPOs
    const allIpos = await getIpoData();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return allIpos.ipoData.filter(ipo => {
      if (!ipo.listing_date) return false;
      const listingDate = new Date(ipo.listing_date);
      return listingDate >= thirtyDaysAgo && listingDate <= new Date();
    });
  } catch (error) {
    console.error('Error fetching recent IPO data:', error);
    return [];
  }
}

// Helper function to normalize IPO item
function normalizeIpoItem(item: any): IpoItem {
  if (!item) return {} as IpoItem;
  
  return {
    company_name: item.company_name || item.name || item.companyName || '',
    symbol: item.symbol || '',
    issue_size: item.issue_size || item.issueSize || '',
    issue_price: item.issue_price || item.issuePrice || item.price || '',
    listing_date: item.listing_date || item.listingDate || '',
    listing_gain: item.listing_gain || item.listingGain || '',
    status: item.status || ''
  };
} 