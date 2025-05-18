/**
 * Endpoint Discovery Utility
 * Manages the discovery and caching of API endpoint patterns
 */

// Cache to store successful endpoint patterns
const apiEndpointPatterns: Record<string, string> = {};

/**
 * Store a successful endpoint pattern for future use
 * @param key Key to identify the endpoint pattern
 * @param pattern The endpoint pattern with placeholders (e.g., '/stock/{symbol}')
 */
export function storeEndpointPattern(key: string, pattern: string): void {
  if (!key || !pattern) {
    return;
  }
  
  apiEndpointPatterns[key] = pattern;
  
  // Persist to localStorage if available
  if (typeof window !== 'undefined') {
    try {
      const storedPatterns = JSON.parse(localStorage.getItem('api_endpoint_patterns') || '{}');
      storedPatterns[key] = pattern;
      localStorage.setItem('api_endpoint_patterns', JSON.stringify(storedPatterns));
    } catch (error) {
      console.error('Error storing endpoint pattern:', error);
    }
  }
}

/**
 * Get a stored endpoint pattern if it exists
 * @param key Key to identify the endpoint pattern
 * @returns The endpoint pattern or null if not found
 */
export function getEndpointPattern(key: string): string | null {
  if (!key) {
    return null;
  }
  
  // First check in-memory cache
  if (apiEndpointPatterns[key]) {
    return apiEndpointPatterns[key];
  }
  
  // Then check localStorage if available
  if (typeof window !== 'undefined') {
    try {
      const storedPatterns = JSON.parse(localStorage.getItem('api_endpoint_patterns') || '{}');
      if (storedPatterns[key]) {
        // Update in-memory cache
        apiEndpointPatterns[key] = storedPatterns[key];
        return storedPatterns[key];
      }
    } catch (error) {
      console.error('Error retrieving endpoint pattern:', error);
    }
  }
  
  return null;
}

/**
 * Clear all stored endpoint patterns
 */
export function clearEndpointPatterns(): void {
  // Clear in-memory cache
  Object.keys(apiEndpointPatterns).forEach(key => {
    delete apiEndpointPatterns[key];
  });
  
  // Clear localStorage if available
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('api_endpoint_patterns');
    } catch (error) {
      console.error('Error clearing endpoint patterns:', error);
    }
  }
}

/**
 * Try multiple endpoint patterns until one works
 * @param client API client to use
 * @param patterns Array of endpoint patterns to try
 * @param params Parameters to replace in the patterns
 * @param options Additional options for the request
 * @returns The response from the first successful endpoint
 */
export async function tryEndpointPatterns<T>(
  client: any,
  patterns: string[],
  params: Record<string, string>,
  options: any = {}
): Promise<T> {
  if (!patterns || patterns.length === 0) {
    throw new Error('No endpoint patterns provided');
  }
  
  let lastError: Error | null = null;
  
  // Try each pattern in sequence
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    
    // Replace parameters in the pattern
    let endpoint = pattern;
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`{${key}}`, value);
    });
    
    try {
      // Try to make the request
      const result = await client.get<T>(endpoint, options.params || {}, options.config || {}, options.ttl);
      
      // If successful, store the pattern for future use
      if (options.patternKey) {
        storeEndpointPattern(options.patternKey, pattern);
      }
      
      return result;
    } catch (error) {
      console.error(`Attempt ${i+1} failed for endpoint ${endpoint}:`, error);
      lastError = error as Error;
      // Continue to next pattern
    }
  }
  
  // If all patterns failed, throw the last error
  throw lastError || new Error('All endpoint patterns failed');
} 