import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from './types';

// Import API config for key rotation
import { API_CONFIG } from '../config';

// API Key rotation state
let currentKeyIndex = 0;
let consecutiveFailures = 0;
let lastKeyRotation = Date.now();

// Get current API key from the rotation pool
const getCurrentApiKey = (): string => {
  if (!API_CONFIG.API_KEYS || API_CONFIG.API_KEYS.length === 0) {
    return API_CONFIG.API_KEY; // Fallback to single key if no pool
  }
  return API_CONFIG.API_KEYS[currentKeyIndex];
};

// Rotate to the next API key in the pool
const rotateApiKey = (reason = 'manual'): boolean => {
  if (!API_CONFIG.API_KEYS || API_CONFIG.API_KEYS.length <= 1) {
    console.warn('API key rotation not possible: Insufficient keys in pool');
    return false;
  }
  
  const oldIndex = currentKeyIndex;
  
  // Move to next key in rotation
  currentKeyIndex = (currentKeyIndex + 1) % API_CONFIG.API_KEYS.length;
  
  // Reset consecutive failures counter
  consecutiveFailures = 0;
  lastKeyRotation = Date.now();
  
  console.log(`API key rotated (reason: ${reason}). Key index changed from ${oldIndex} to ${currentKeyIndex}`);
  return true;
};

/**
 * Cache item interface
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * API Client options
 */
interface ApiClientOptions {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  cacheTTL?: number; // Cache time-to-live in milliseconds
}

/**
 * ApiClient class providing a unified interface for making API requests
 * with consistent error handling, caching, and authentication
 */
export class ApiClient {
  private api: AxiosInstance;
  private cacheData: Map<string, CacheItem<any>> = new Map();
  private cacheTTL: number;
  private isIndianApi: boolean;

  /**
   * Creates a new ApiClient instance
   * @param options API client configuration options
   */
  constructor(options: ApiClientOptions) {
    // Set cache TTL (default: 5 minutes)
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000;
    
    // Determine if this is an Indian API client based on the URL
    this.isIndianApi = options.baseURL.includes('indianapi');
    
    // Create axios instance with provided options
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key to headers if provided
    if (options.apiKey) {
      if (this.isIndianApi) {
        // Use key rotation system for Indian API
        headers['X-Api-Key'] = getCurrentApiKey();
      } else {
        headers['Authorization'] = `Bearer ${options.apiKey}`;
      }
    }
    
    // For GitHub Pages deployment, ensure we use HTTPS and the correct API URL
    let baseURL = options.baseURL;
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      // Force HTTPS for GitHub Pages
      baseURL = baseURL.replace('http://', 'https://');
      
      // Use the deployed API URL if we're on GitHub Pages
      if (!baseURL.includes('vercel.app') && !baseURL.includes('indianapi')) {
        baseURL = 'https://stock-sense-api.vercel.app/api';
      }
    }
    
    this.api = axios.create({
      baseURL,
      headers,
      timeout: options.timeout || 10000, // Default 10 second timeout
    });
    
    // Add request interceptor for dynamic configuration
    this.api.interceptors.request.use(
      (config) => {
        // If in browser environment, check for temporary API URL or auth token
        if (typeof window !== 'undefined') {
          const tempApiUrl = sessionStorage.getItem('temp_api_url');
          if (tempApiUrl && !this.isIndianApi) {
            config.baseURL = tempApiUrl;
          }
          
          // Add authentication token if available and not using API key
          if (!options.apiKey) {
            const token = localStorage.getItem('token');
            if (token) {
              config.headers['Authorization'] = `Bearer ${token}`;
            }
          }
          
          // Add CORS headers for GitHub Pages
          if (window.location.hostname.includes('github.io')) {
            config.headers['Access-Control-Allow-Origin'] = '*';
          }
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling and key rotation
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleApiError(error);
        
        // Handle rate limiting with automatic key rotation
        if (error.response && error.response.status === 429 && this.isIndianApi) {
          // Try to rotate to the next API key
          const rotated = rotateApiKey('rate_limit');
          if (rotated) {
            console.log('Rotating API key due to rate limit (429)');
            
            // Update the API key in the headers
            this.api.defaults.headers['X-Api-Key'] = getCurrentApiKey();
            
            // Clone the original request with the new API key
            const originalRequest = error.config;
            originalRequest.headers['X-Api-Key'] = getCurrentApiKey();
            
            // Return a new promise to retry the request
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(this.api(originalRequest));
              }, 1000); // 1 second delay before retry
            });
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Handles API errors with detailed logging
   * @param error Axios error object
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error status code
      console.error('API Error:', error.response.status, error.response.data);
      
      // Log specific error types
      switch (error.response.status) {
        case 401:
          console.error('Authentication Error: Invalid or expired API key/token');
          break;
        case 403:
          console.error('Access Denied: Insufficient permissions');
          break;
        case 404:
          console.error('Resource Not Found: The requested resource does not exist');
          break;
        case 429:
          console.error('Rate Limit Exceeded: Too many requests');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server Error: The API server encountered an error');
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
    } else {
      // Error in setting up the request
      console.error('API Request Error:', error.message);
    }
  }
  
  /**
   * Gets data from cache or makes API request if not cached
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param config Additional Axios request config
   * @param ttl Optional custom cache TTL in milliseconds
   * @returns Parsed API response
   */
  public async get<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    config: AxiosRequestConfig = {},
    ttl?: number
  ): Promise<T> {
    // Generate cache key from endpoint and params
    const paramString = Object.entries(params)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const cacheKey = `${endpoint}${paramString ? '?' + paramString : ''}`;
    const now = Date.now();
    const cachedItem = this.cacheData.get(cacheKey);
    
    // Return cached data if still valid
    if (cachedItem && now - cachedItem.timestamp < (ttl || this.cacheTTL)) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedItem.data as T;
    }
    
    // Otherwise fetch fresh data
    console.log(`Fetching fresh data for ${cacheKey}`);
    
    try {
      const response = await this.api.get<ApiResponse<T> | T>(
        endpoint, 
        { ...config, params }
      );
      
      const data = this.extractData<T>(response);
      
      // Cache the result
      this.cacheData.set(cacheKey, { 
        data, 
        timestamp: now 
      });
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Makes a POST request to the API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param config Additional Axios request config
   * @returns Parsed API response
   */
  public async post<T>(
    endpoint: string, 
    data: any, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await this.api.post<ApiResponse<T> | T>(
        endpoint, 
        data, 
        config
      );
      
      return this.extractData<T>(response);
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Makes a PUT request to the API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param config Additional Axios request config
   * @returns Parsed API response
   */
  public async put<T>(
    endpoint: string, 
    data: any, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await this.api.put<ApiResponse<T> | T>(
        endpoint, 
        data, 
        config
      );
      
      return this.extractData<T>(response);
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Makes a DELETE request to the API
   * @param endpoint API endpoint
   * @param config Additional Axios request config
   * @returns Parsed API response
   */
  public async delete<T>(
    endpoint: string, 
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await this.api.delete<ApiResponse<T> | T>(
        endpoint, 
        config
      );
      
      return this.extractData<T>(response);
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Extracts data from API response handling different formats
   * @param response Axios response object
   * @returns Extracted data
   */
  private extractData<T>(response: AxiosResponse): T {
    // Check for common API response formats
    const responseData = response.data;
    
    if (responseData.data !== undefined) {
      return responseData.data as T;
    }
    
    return responseData as T;
  }
  
  /**
   * Clears the entire cache
   */
  public clearCache(): void {
    this.cacheData.clear();
  }
  
  /**
   * Clears a specific cache entry
   * @param endpoint API endpoint
   * @param params Query parameters
   */
  public clearCacheItem(endpoint: string, params: Record<string, any> = {}): void {
    const paramString = Object.entries(params)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const cacheKey = `${endpoint}${paramString ? '?' + paramString : ''}`;
    this.cacheData.delete(cacheKey);
  }
} 