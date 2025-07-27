/**
 * Cache Manager Utility
 * 
 * This utility provides in-memory caching for API responses to improve performance
 * and reduce the number of requests to the external API.
 */

const { API_CONFIG } = require('../config');

// In-memory cache store
const cacheStore = new Map();

/**
 * Cache Manager Class
 */
class CacheManager {
  constructor(defaultTtl = API_CONFIG.CACHE_DURATION) {
    this.defaultTtl = defaultTtl;
  }

  /**
   * Generate a cache key from the endpoint and params
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {string} Cache key
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if not found/expired
   */
  get(key) {
    if (!cacheStore.has(key)) {
      return null;
    }

    const cachedItem = cacheStore.get(key);
    const now = Date.now();

    // Check if cache has expired
    if (cachedItem.expiry < now) {
      this.delete(key);
      return null;
    }

    return cachedItem.data;
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = this.defaultTtl) {
    const expiry = Date.now() + ttl;
    
    cacheStore.set(key, {
      data,
      expiry,
      createdAt: Date.now()
    });
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    cacheStore.delete(key);
  }

  /**
   * Clear all items from cache
   */
  clear() {
    cacheStore.clear();
  }

  /**
   * Get cache stats
   * @returns {Object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let totalItems = 0;
    let expiredItems = 0;
    let validItems = 0;

    cacheStore.forEach((value) => {
      totalItems++;
      if (value.expiry < now) {
        expiredItems++;
      } else {
        validItems++;
      }
    });

    return {
      totalItems,
      expiredItems,
      validItems,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
    };
  }

  /**
   * Clean expired items from cache
   */
  cleanExpired() {
    const now = Date.now();
    
    cacheStore.forEach((value, key) => {
      if (value.expiry < now) {
        this.delete(key);
      }
    });
  }

  /**
   * Middleware to wrap API calls with caching
   * @param {Function} apiCall - The API call function to wrap
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Function} Wrapped function with caching
   */
  withCache(apiCall, ttl = this.defaultTtl) {
    return async (...args) => {
      const key = this.generateKey(apiCall.name, args);
      
      // Try to get from cache first
      const cachedData = this.get(key);
      if (cachedData) {
        return cachedData;
      }
      
      // If not in cache, call API
      const data = await apiCall(...args);
      
      // Store in cache
      this.set(key, data, ttl);
      
      return data;
    };
  }
}

// Create and export a singleton instance
const cacheManager = new CacheManager();

// Set up periodic cache cleanup
setInterval(() => {
  cacheManager.cleanExpired();
}, 60000); // Clean expired items every minute

module.exports = cacheManager; 