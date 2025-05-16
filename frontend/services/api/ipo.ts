import { ApiClient } from './client';
import { IpoItem } from './types';

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
 * IPO API service functions
 */

/**
 * Get upcoming and recent IPOs
 * @returns List of IPO items
 */
export async function getIpoData(): Promise<IpoItem[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<IpoItem[]>('/ipo');
    } catch (error) {
      console.error('Error fetching IPO data from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>('/ipo');
    
    // Normalize data structure if needed
    if (Array.isArray(result)) {
      return result.map(item => normalizeIpoItem(item));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching IPO data:', error);
    return [];
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
    return allIpos.filter(ipo => 
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
    
    return allIpos.filter(ipo => {
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