import { ApiClient } from './client';
import { Portfolio, PortfolioHolding } from './types';

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

/**
 * Portfolio API service functions
 */

/**
 * Get all portfolios for a user
 * @param userId User ID (optional, uses authenticated user if not provided)
 * @returns List of portfolios
 */
export async function getUserPortfolios(userId?: string): Promise<Portfolio[]> {
  try {
    const client = getApiClient();
    
    // If userId provided, include it in request
    const params: Record<string, any> = {};
    if (userId) {
      params.userId = userId;
    }
    
    return await client.get<Portfolio[]>('/portfolios', params);
  } catch (error) {
    console.error('Error fetching user portfolios:', error);
    return [];
  }
}

/**
 * Get a specific portfolio by ID
 * @param portfolioId Portfolio ID
 * @returns Portfolio details
 */
export async function getPortfolioById(portfolioId: string): Promise<Portfolio | null> {
  if (!portfolioId) {
    return null;
  }
  
  try {
    const client = getApiClient();
    return await client.get<Portfolio>(`/portfolios/${portfolioId}`);
  } catch (error) {
    console.error(`Error fetching portfolio ${portfolioId}:`, error);
    return null;
  }
}

/**
 * Create a new portfolio
 * @param portfolioData Portfolio data
 * @returns Created portfolio
 */
export async function createPortfolio(portfolioData: Omit<Portfolio, 'id'>): Promise<Portfolio | null> {
  try {
    const client = getApiClient();
    return await client.post<Portfolio>('/portfolios', portfolioData);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return null;
  }
}

/**
 * Update an existing portfolio
 * @param portfolioId Portfolio ID
 * @param portfolioData Updated portfolio data
 * @returns Updated portfolio
 */
export async function updatePortfolio(
  portfolioId: string, 
  portfolioData: Partial<Portfolio>
): Promise<Portfolio | null> {
  if (!portfolioId) {
    return null;
  }
  
  try {
    const client = getApiClient();
    return await client.put<Portfolio>(`/portfolios/${portfolioId}`, portfolioData);
  } catch (error) {
    console.error(`Error updating portfolio ${portfolioId}:`, error);
    return null;
  }
}

/**
 * Delete a portfolio
 * @param portfolioId Portfolio ID
 * @returns Success status
 */
export async function deletePortfolio(portfolioId: string): Promise<boolean> {
  if (!portfolioId) {
    return false;
  }
  
  try {
    const client = getApiClient();
    await client.delete(`/portfolios/${portfolioId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting portfolio ${portfolioId}:`, error);
    return false;
  }
}

/**
 * Add a holding to a portfolio
 * @param portfolioId Portfolio ID
 * @param holding Holding data
 * @returns Updated portfolio
 */
export async function addHolding(
  portfolioId: string, 
  holding: PortfolioHolding
): Promise<Portfolio | null> {
  if (!portfolioId || !holding.symbol) {
    return null;
  }
  
  try {
    const client = getApiClient();
    return await client.post<Portfolio>(`/portfolios/${portfolioId}/holdings`, holding);
  } catch (error) {
    console.error(`Error adding holding to portfolio ${portfolioId}:`, error);
    return null;
  }
}

/**
 * Update a holding in a portfolio
 * @param portfolioId Portfolio ID
 * @param symbol Stock symbol
 * @param holdingData Updated holding data
 * @returns Updated portfolio
 */
export async function updateHolding(
  portfolioId: string,
  symbol: string,
  holdingData: Partial<PortfolioHolding>
): Promise<Portfolio | null> {
  if (!portfolioId || !symbol) {
    return null;
  }
  
  try {
    const client = getApiClient();
    return await client.put<Portfolio>(
      `/portfolios/${portfolioId}/holdings/${symbol}`,
      holdingData
    );
  } catch (error) {
    console.error(`Error updating holding ${symbol} in portfolio ${portfolioId}:`, error);
    return null;
  }
}

/**
 * Remove a holding from a portfolio
 * @param portfolioId Portfolio ID
 * @param symbol Stock symbol
 * @returns Updated portfolio
 */
export async function removeHolding(
  portfolioId: string,
  symbol: string
): Promise<Portfolio | null> {
  if (!portfolioId || !symbol) {
    return null;
  }
  
  try {
    const client = getApiClient();
    return await client.delete<Portfolio>(`/portfolios/${portfolioId}/holdings/${symbol}`);
  } catch (error) {
    console.error(`Error removing holding ${symbol} from portfolio ${portfolioId}:`, error);
    return null;
  }
}

/**
 * Get portfolio performance over time
 * @param portfolioId Portfolio ID
 * @param period Time period (e.g., '1w', '1m', '3m', '1yr')
 * @returns Portfolio performance data
 */
export async function getPortfolioPerformance(
  portfolioId: string,
  period: string = '1m'
): Promise<any> {
  if (!portfolioId) {
    return null;
  }
  
  try {
    const client = getApiClient();
    return await client.get<any>(
      `/portfolios/${portfolioId}/performance`,
      { period }
    );
  } catch (error) {
    console.error(`Error fetching performance for portfolio ${portfolioId}:`, error);
    return null;
  }
} 