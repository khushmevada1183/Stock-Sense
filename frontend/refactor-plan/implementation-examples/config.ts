/**
 * API Configuration
 * Centralized configuration for all API services
 */

// Environment detection
const isServer = typeof window === 'undefined';
const isDev = process.env.NODE_ENV === 'development';

// API base URLs
const API_URLS = {
  STANDARD: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  INDIAN: process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in'
};

// API keys pool - load from environment variables
const INDIAN_API_KEYS = process.env.NEXT_PUBLIC_INDIAN_API_KEYS ? 
  process.env.NEXT_PUBLIC_INDIAN_API_KEYS.split(',') : 
  [];

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URLs
  URLS: API_URLS,
  
  // Default API key (will be rotated)
  DEFAULT_INDIAN_API_KEY: INDIAN_API_KEYS[0],
  
  // API keys pool
  INDIAN_API_KEYS,
  
  // Request configuration
  REQUEST: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    MAX_CONCURRENT_REQUESTS: 5
  },
  
  // Caching configuration
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    TTL_OVERRIDES: {
      SEARCH: 60 * 1000, // 1 minute
      STOCK_DETAILS: 10 * 60 * 1000, // 10 minutes
      HISTORICAL_DATA: 30 * 60 * 1000, // 30 minutes
      NEWS: 15 * 60 * 1000, // 15 minutes
      IPO: 60 * 60 * 1000, // 1 hour
    }
  },
  
  // API key rotation
  KEY_ROTATION: {
    ENABLED: true,
    AUTO_ROTATE_ON_429: true, // Automatically rotate on rate limit error
    ROTATION_INTERVAL: 60 * 60 * 1000, // 1 hour regular rotation
    MAX_CONSECUTIVE_FAILURES: 2, // Maximum failures before forced rotation
  },
  
  // Logging
  LOGGING: {
    ENABLED: isDev,
    LEVEL: isDev ? 'debug' : 'error',
    LOG_REQUESTS: isDev,
    LOG_RESPONSES: isDev,
  },
  
  // Endpoints
  ENDPOINTS: {
    // Standard API endpoints
    STANDARD: {
      SEARCH: '/stocks/search',
      STOCK_DETAILS: '/stocks/{symbol}',
      HISTORICAL_DATA: '/stocks/{symbol}/historical',
      NEWS: '/news',
      IPO: '/ipo',
      MARKET: '/market',
    },
    
    // Indian API endpoints
    INDIAN: {
      SEARCH: '/search',
      STOCK_DETAILS: '/stock/{symbol}',
      HISTORICAL_DATA: '/stock/{symbol}/history',
      NEWS: '/news',
      IPO: '/ipo/upcoming',
      MARKET_GAINERS: '/market/gainers',
      MARKET_LOSERS: '/market/losers',
      COMMODITIES: '/commodities',
      MUTUAL_FUNDS: '/mutual-funds',
    },
    
    // Endpoint patterns to try (for dynamic endpoint discovery)
    PATTERNS: {
      STOCK_DETAILS: [
        '/stock/{symbol}',
        '/stocks/{symbol}',
        '/details/{symbol}',
        '/quote/{symbol}'
      ]
    }
  }
};

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_CACHING: API_CONFIG.CACHE.ENABLED,
  ENABLE_OFFLINE_MODE: false,
  USE_MOCK_DATA_WHEN_API_FAILS: isDev,
  USE_API_KEY_ROTATION: API_CONFIG.KEY_ROTATION.ENABLED,
};

export default {
  API_CONFIG,
  FEATURES
}; 