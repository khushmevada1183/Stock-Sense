/**
 * Simple in-memory caching service with TTL (time-to-live) support
 */

// Cache TTL (Time-To-Live) constants in seconds
const DEFAULT_TTL = {
  // Default cache TTL: 5 minutes
  DEFAULT: process.env.CACHE_TTL_DEFAULT || 300,
  
  // Market data (frequently changing): 15 minutes
  MARKET_DATA: process.env.CACHE_TTL_MARKET_DATA || 900,
  
  // Stock data: 30 minutes
  STOCK_DATA: process.env.CACHE_TTL_STOCK_DATA || 1800,
  
  // Search results: 1 minute (short because user might search again quickly)
  SEARCH_RESULTS: process.env.CACHE_TTL_SEARCH_RESULTS || 60,
  
  // Historical data: 1 hour (changes less frequently)
  HISTORICAL_DATA: process.env.CACHE_TTL_HISTORICAL_DATA || 3600,
  
  // Financial data: 2 hours (changes even less frequently)
  FINANCIAL_DATA: process.env.CACHE_TTL_FINANCIAL_DATA || 7200
};

// In-memory cache store
const cacheStore = new Map();

// Cache statistics for monitoring
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  cleanups: 0,
  items: () => cacheStore.size
};

// Cache cleanup interval in milliseconds (run every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
        
/**
 * Cleans up expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  let cleanedCount = 0;
  
  cacheStore.forEach((entry, key) => {
    if (entry.expiresAt && entry.expiresAt < now) {
      cacheStore.delete(key);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    cacheStats.cleanups++;
    console.log(`Cache cleanup: removed ${cleanedCount} expired items. Current cache size: ${cacheStore.size} items`);
  }
}

// Set up periodic cache cleanup
const cleanupInterval = setInterval(cleanupCache, CLEANUP_INTERVAL);

// Ensure cleanup interval is cleared if the Node process exits
process.on('exit', () => {
  clearInterval(cleanupInterval);
});

/**
 * Cache service for API responses
 */
const cacheService = {
  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - The cached value, or null if not found or expired
   */
  async get(key) {
    const entry = cacheStore.get(key);
    
    if (!entry) {
      cacheStats.misses++;
      return null;
    }
    
    // Check if entry has expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      cacheStore.delete(key);
      cacheStats.misses++;
      return null;
    }
    
    cacheStats.hits++;
    return entry.value;
  },

  /**
   * Set a value in the cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time-to-live in seconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = DEFAULT_TTL.DEFAULT) {
    const expiresAt = ttl ? Date.now() + (ttl * 1000) : null;
    
    cacheStore.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
    
    cacheStats.sets++;
  },

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async del(key) {
    const deleted = cacheStore.delete(key);
    if (deleted) {
      cacheStats.deletes++;
    }
    return deleted;
  },

  /**
   * Clear all cache entries
   * @returns {Promise<void>}
   */
  async clear() {
    cacheStore.clear();
    console.log('Cache cleared');
  },

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    return {
      ...cacheStats,
      items: cacheStats.items(),
      hitRate: cacheStats.hits + cacheStats.misses > 0 
        ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) + '%' 
        : '0%'
    };
  }
};

module.exports = {
  cacheService,
  DEFAULT_TTL
}; 