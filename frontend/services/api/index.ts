import { ApiClient } from './client';
export { ApiClient } from './client';
export * from './types';

// API instances for different API endpoints
let standardApiClient: ApiClient | null = null;
let indianApiClient: ApiClient | null = null;

// Cache to store successful endpoint patterns
const apiEndpointPatterns: Record<string, string> = {};

/**
 * Get the primary API client instance (lazy loading)
 */
export function getApiClient(): ApiClient {
  if (!standardApiClient) {
    // Get API URL from environment variables or localStorage
    let apiUrl = '';
    
    if (typeof window !== 'undefined') {
      apiUrl = localStorage.getItem('api_url') || 
              process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
    } else {
      apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
    }

    standardApiClient = new ApiClient({
      baseURL: apiUrl,
      timeout: 10000,
      cacheTTL: 5 * 60 * 1000 // 5 minutes
    });
  }
  
  return standardApiClient;
}

/**
 * Get the Indian API client instance (lazy loading)
 */
export function getIndianApiClient(): ApiClient {
  if (!indianApiClient) {
    const API_KEY = process.env.NEXT_PUBLIC_INDIAN_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
    const BASE_URL = process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in';
    
    indianApiClient = new ApiClient({
      baseURL: BASE_URL,
      apiKey: API_KEY,
      timeout: 10000,
      cacheTTL: 5 * 60 * 1000 // 5 minutes
    });
  }
  
  return indianApiClient;
}

/**
 * Store a successful endpoint pattern for future use
 */
export function storeEndpointPattern(key: string, pattern: string): void {
  apiEndpointPatterns[key] = pattern;
}

/**
 * Get a stored endpoint pattern if it exists
 */
export function getEndpointPattern(key: string): string | null {
  return apiEndpointPatterns[key] || null;
}

// Note: Individual modules are imported directly by consumers to avoid circular dependencies 