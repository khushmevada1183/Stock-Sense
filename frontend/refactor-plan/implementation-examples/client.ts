/**
 * API Client
 * Core HTTP client with caching, error handling, and retry logic
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from './types';
import { API_CONFIG } from './config';

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
export interface ApiClientOptions {
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
  private retryCount: number = 0;
  private currentApiKey: string | undefined;
  private apiKeyIndex: number = 0;

  /**
   * Creates a new ApiClient instance
   * @param options API client configuration options
   */
  constructor(options: ApiClientOptions) {
    // Set cache TTL (default: 5 minutes)
    this.cacheTTL = options.cacheTTL || API_CONFIG.CACHE.DEFAULT_TTL;
    
    // Determine if this is an Indian API client based on the URL
    this.isIndianApi = options.baseURL.includes('indianapi');
    
    // Store the current API key
    this.currentApiKey = options.apiKey;
    
    // Create axios instance with provided options
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key to headers if provided
    if (options.apiKey) {
      if (this.isIndianApi) {
        headers['X-Api-Key'] = options.apiKey;
      } else {
        headers['Authorization'] = `Bearer ${options.apiKey}`;
      }
    }
    
    this.api = axios.create({
      baseURL: options.baseURL,
      headers,
      timeout: options.timeout || API_CONFIG.REQUEST.TIMEOUT,
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
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const handled = this.handleApiError(error);
        return Promise.reject(handled);
      }
    );
  }
  
  /**
   * Handles API errors with detailed logging and retry logic
   * @param error Axios error object
   * @returns Handled error
   */
  private handleApiError(error: AxiosError): ApiError {
    let apiError: ApiError = {
      status: error.response?.status || 500,
      message: 'Unknown error occurred',
    };
    
    if (error.response) {
      // Server responded with error status code
      const status = error.response.status;
      const data = error.response.data as any;
      
      apiError = {
        status,
        message: data?.message || data?.error || `Error ${status}`,
        code: data?.code,
        details: data
      };
      
      console.error('API Error:', status, data);
      
      // Handle specific error types
      switch (status) {
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
          
          // If API key rotation is enabled, try rotating the key
          if (this.isIndianApi && API_CONFIG.KEY_ROTATION.ENABLED && 
              API_CONFIG.KEY_ROTATION.AUTO_ROTATE_ON_429) {
            this.rotateApiKey();
          }
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
      apiError.message = 'No response from server';
    } else {
      // Error in setting up the request
      console.error('API Request Error:', error.message);
      apiError.message = error.message;
    }
    
    return apiError;
  }
  
  /**
   * Rotates to the next API key in the pool
   */
  private rotateApiKey(): void {
    if (!this.isIndianApi || !API_CONFIG.INDIAN_API_KEYS.length) {
      return;
    }
    
    // Move to the next key in the pool
    this.apiKeyIndex = (this.apiKeyIndex + 1) % API_CONFIG.INDIAN_API_KEYS.length;
    this.currentApiKey = API_CONFIG.INDIAN_API_KEYS[this.apiKeyIndex];
    
    console.log(`Rotated to API key ${this.apiKeyIndex + 1}/${API_CONFIG.INDIAN_API_KEYS.length}`);
    
    // Update the Authorization header
    this.api.defaults.headers.common['X-Api-Key'] = this.currentApiKey;
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
    
    // Return cached data if still valid and caching is enabled
    if (API_CONFIG.CACHE.ENABLED && cachedItem && now - cachedItem.timestamp < (ttl || this.cacheTTL)) {
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
      
      // Cache the result if caching is enabled
      if (API_CONFIG.CACHE.ENABLED) {
        this.cacheData.set(cacheKey, { 
          data, 
          timestamp: now 
        });
      }
      
      // Reset retry count on success
      this.retryCount = 0;
      
      return data;
    } catch (error) {
      // Handle retry logic
      if (this.retryCount < API_CONFIG.REQUEST.RETRY_ATTEMPTS) {
        this.retryCount++;
        console.log(`Retry attempt ${this.retryCount} for ${endpoint}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.REQUEST.RETRY_DELAY));
        
        // Retry the request
        return this.get<T>(endpoint, params, config, ttl);
      }
      
      // Reset retry count for next request
      this.retryCount = 0;
      
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
      // Handle retry logic
      if (this.retryCount < API_CONFIG.REQUEST.RETRY_ATTEMPTS) {
        this.retryCount++;
        console.log(`Retry attempt ${this.retryCount} for ${endpoint}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.REQUEST.RETRY_DELAY));
        
        // Retry the request
        return this.post<T>(endpoint, data, config);
      }
      
      // Reset retry count for next request
      this.retryCount = 0;
      
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
      // Handle retry logic
      if (this.retryCount < API_CONFIG.REQUEST.RETRY_ATTEMPTS) {
        this.retryCount++;
        console.log(`Retry attempt ${this.retryCount} for ${endpoint}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.REQUEST.RETRY_DELAY));
        
        // Retry the request
        return this.put<T>(endpoint, data, config);
      }
      
      // Reset retry count for next request
      this.retryCount = 0;
      
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
      // Handle retry logic
      if (this.retryCount < API_CONFIG.REQUEST.RETRY_ATTEMPTS) {
        this.retryCount++;
        console.log(`Retry attempt ${this.retryCount} for ${endpoint}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.REQUEST.RETRY_DELAY));
        
        // Retry the request
        return this.delete<T>(endpoint, config);
      }
      
      // Reset retry count for next request
      this.retryCount = 0;
      
      throw error;
    }
  }
  
  /**
   * Extracts data from API response
   * @param response Axios response
   * @returns Extracted data
   */
  private extractData<T>(response: AxiosResponse): T {
    const responseData = response.data;
    
    // If the response is wrapped in a data property, extract it
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return responseData.data as T;
    }
    
    // Otherwise return the whole response data
    return responseData as T;
  }
  
  /**
   * Clears the entire cache
   */
  public clearCache(): void {
    this.cacheData.clear();
    console.log('API cache cleared');
  }
  
  /**
   * Clears a specific cache item
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
    console.log(`Cache cleared for ${cacheKey}`);
  }
  
  /**
   * Updates the API key
   * @param apiKey New API key
   */
  public setApiKey(apiKey: string): void {
    this.currentApiKey = apiKey;
    
    if (this.isIndianApi) {
      this.api.defaults.headers.common['X-Api-Key'] = apiKey;
    } else {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }
    
    console.log('API key updated');
  }
} 