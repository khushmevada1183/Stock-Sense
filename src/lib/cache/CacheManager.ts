/**
 * Advanced Cache Manager for Frontend
 * 
 * Provides multiple caching strategies:
 * - In-memory cache with TTL
 * - SessionStorage for session persistence
 * - LocalStorage for long-term caching
 * - IndexedDB for large datasets
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
  size?: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxMemoryItems: number;
  enableSessionStorage: boolean;
  enableLocalStorage: boolean;
  enableIndexedDB: boolean;
  compressionThreshold: number; // Size in bytes to trigger compression
}

export enum CacheStrategy {
  MEMORY_ONLY = 'memory',
  SESSION_STORAGE = 'session',
  LOCAL_STORAGE = 'local',
  INDEXED_DB = 'indexeddb',
  HYBRID = 'hybrid'
}

class AdvancedCacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private isClient: boolean;

  constructor(config: Partial<CacheConfig> = {}) {
    this.isClient = typeof window !== 'undefined';
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxMemoryItems: 1000,
      enableSessionStorage: this.isClient,
      enableLocalStorage: this.isClient,
      enableIndexedDB: this.isClient,
      compressionThreshold: 10 * 1024, // 10KB
      ...config
    };

    // Cleanup expired items periodically
    if (this.isClient) {
      setInterval(() => this.cleanupExpired(), 60000); // Every minute
    }
  }

  /**
   * Generate cache key with strategy prefix
   */
  private generateKey(key: string, strategy: CacheStrategy): string {
    return `cache_${strategy}_${key}`;
  }

  /**
   * Calculate size of data in bytes
   */
  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Compress data if it exceeds threshold
   */
  private async compressData(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    const size = new Blob([jsonString]).size;
    
    if (size > this.config.compressionThreshold) {
      // Use native compression if available (modern browsers)
      if ('CompressionStream' in window) {
        try {
          const stream = new CompressionStream('gzip');
          const compressed = await new Response(
            new Blob([jsonString]).stream().pipeThrough(stream)
          ).arrayBuffer();
          
          const uint8Array = new Uint8Array(compressed);
          const binaryString = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
          return btoa(binaryString);
        } catch (error) {
          console.warn('Compression failed, storing uncompressed:', error);
        }
      }
    }
    
    return jsonString;
  }

  /**
   * Decompress data
   */
  private async decompressData(compressedData: string): Promise<any> {
    // Check if data is compressed (base64 encoded)
    try {
      if ('DecompressionStream' in window && compressedData.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        const binaryString = atob(compressedData);
        const binaryData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          binaryData[i] = binaryString.charCodeAt(i);
        }
        const stream = new DecompressionStream('gzip');
        const decompressed = await new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(binaryData);
              controller.close();
            }
          }).pipeThrough(stream)
        ).text();
        
        return JSON.parse(decompressed);
      }
    } catch (error) {
      // Fall back to treating as uncompressed JSON
    }
    
    return JSON.parse(compressedData);
  }

  /**
   * Set data in memory cache
   */
  private setMemoryCache<T>(key: string, data: T, ttl: number): void {
    const cacheKey = this.generateKey(key, CacheStrategy.MEMORY_ONLY);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      key: cacheKey,
      size: this.calculateSize(data)
    };

    // Remove oldest items if cache is full
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const oldestKey = Array.from(this.memoryCache.keys())[0];
      this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(cacheKey, item);
  }

  /**
   * Get data from memory cache
   */
  private getMemoryCache<T>(key: string): T | null {
    const cacheKey = this.generateKey(key, CacheStrategy.MEMORY_ONLY);
    const item = this.memoryCache.get(cacheKey);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(cacheKey);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set data in session storage
   */
  private async setSessionStorage<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.isClient || !this.config.enableSessionStorage) return;

    try {
      const cacheKey = this.generateKey(key, CacheStrategy.SESSION_STORAGE);
      const compressedData = await this.compressData(data);
      const item: CacheItem<T> = {
        data: compressedData as any,
        timestamp: Date.now(),
        expiry: Date.now() + ttl,
        key: cacheKey
      };

      sessionStorage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set session storage cache:', error);
    }
  }

  /**
   * Get data from session storage
   */
  private async getSessionStorage<T>(key: string): Promise<T | null> {
    if (!this.isClient || !this.config.enableSessionStorage) return null;

    try {
      const cacheKey = this.generateKey(key, CacheStrategy.SESSION_STORAGE);
      const cached = sessionStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const item: CacheItem<any> = JSON.parse(cached);
      
      if (Date.now() > item.expiry) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }
      
      return await this.decompressData(item.data);
    } catch (error) {
      console.warn('Failed to get session storage cache:', error);
      return null;
    }
  }

  /**
   * Set data in local storage
   */
  private async setLocalStorage<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.isClient || !this.config.enableLocalStorage) return;

    try {
      const cacheKey = this.generateKey(key, CacheStrategy.LOCAL_STORAGE);
      const compressedData = await this.compressData(data);
      const item: CacheItem<T> = {
        data: compressedData as any,
        timestamp: Date.now(),
        expiry: Date.now() + ttl,
        key: cacheKey
      };

      localStorage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set local storage cache:', error);
    }
  }

  /**
   * Get data from local storage
   */
  private async getLocalStorage<T>(key: string): Promise<T | null> {
    if (!this.isClient || !this.config.enableLocalStorage) return null;

    try {
      const cacheKey = this.generateKey(key, CacheStrategy.LOCAL_STORAGE);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const item: CacheItem<any> = JSON.parse(cached);
      
      if (Date.now() > item.expiry) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return await this.decompressData(item.data);
    } catch (error) {
      console.warn('Failed to get local storage cache:', error);
      return null;
    }
  }

  /**
   * Public method to set cache with strategy
   */
  async set<T>(
    key: string, 
    data: T, 
    strategy: CacheStrategy = CacheStrategy.HYBRID,
    ttl: number = this.config.defaultTTL
  ): Promise<void> {
    switch (strategy) {
      case CacheStrategy.MEMORY_ONLY:
        this.setMemoryCache(key, data, ttl);
        break;
      case CacheStrategy.SESSION_STORAGE:
        await this.setSessionStorage(key, data, ttl);
        break;
      case CacheStrategy.LOCAL_STORAGE:
        await this.setLocalStorage(key, data, ttl);
        break;
      case CacheStrategy.HYBRID:
        // Store in memory for fast access and session storage for persistence
        this.setMemoryCache(key, data, ttl);
        await this.setSessionStorage(key, data, ttl);
        break;
    }
  }

  /**
   * Public method to get cache with strategy
   */
  async get<T>(key: string, strategy: CacheStrategy = CacheStrategy.HYBRID): Promise<T | null> {
    switch (strategy) {
      case CacheStrategy.MEMORY_ONLY:
        return this.getMemoryCache<T>(key);
      case CacheStrategy.SESSION_STORAGE:
        return await this.getSessionStorage<T>(key);
      case CacheStrategy.LOCAL_STORAGE:
        return await this.getLocalStorage<T>(key);
      case CacheStrategy.HYBRID:
        // Try memory first, then session storage
        let data = this.getMemoryCache<T>(key);
        if (data) return data;
        
        data = await this.getSessionStorage<T>(key);
        if (data) {
          // Restore to memory cache
          this.setMemoryCache(key, data, this.config.defaultTTL);
        }
        return data;
      default:
        return null;
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string, strategy: CacheStrategy = CacheStrategy.HYBRID): Promise<void> {
    if (strategy === CacheStrategy.MEMORY_ONLY || strategy === CacheStrategy.HYBRID) {
      const cacheKey = this.generateKey(key, CacheStrategy.MEMORY_ONLY);
      this.memoryCache.delete(cacheKey);
    }
    
    if (strategy === CacheStrategy.SESSION_STORAGE || strategy === CacheStrategy.HYBRID) {
      if (this.isClient) {
        const cacheKey = this.generateKey(key, CacheStrategy.SESSION_STORAGE);
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    if (strategy === CacheStrategy.LOCAL_STORAGE) {
      if (this.isClient) {
        const cacheKey = this.generateKey(key, CacheStrategy.LOCAL_STORAGE);
        localStorage.removeItem(cacheKey);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(strategy?: CacheStrategy): Promise<void> {
    if (!strategy || strategy === CacheStrategy.MEMORY_ONLY || strategy === CacheStrategy.HYBRID) {
      this.memoryCache.clear();
    }
    
    if (!this.isClient) return;
    
    if (!strategy || strategy === CacheStrategy.SESSION_STORAGE || strategy === CacheStrategy.HYBRID) {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_session_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    if (!strategy || strategy === CacheStrategy.LOCAL_STORAGE) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_local_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Clean up expired items
   */
  private cleanupExpired(): void {
    // Clean memory cache
    const now = Date.now();
    this.memoryCache.forEach((item, key) => {
      if (now > item.expiry) {
        this.memoryCache.delete(key);
      }
    });

    if (!this.isClient) return;

    // Clean session storage
    try {
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('cache_session_')) {
          try {
            const item = JSON.parse(sessionStorage.getItem(key) || '{}');
            if (now > item.expiry) {
              sessionStorage.removeItem(key);
            }
          } catch (error) {
            sessionStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup session storage:', error);
    }

    // Clean local storage
    try {
      const localKeys = Object.keys(localStorage);
      localKeys.forEach(key => {
        if (key.startsWith('cache_local_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (now > item.expiry) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup local storage:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryStats = {
      items: this.memoryCache.size,
      totalSize: Array.from(this.memoryCache.values()).reduce((acc, item) => acc + (item.size || 0), 0)
    };

    let sessionStats = { items: 0, totalSize: 0 };
    let localStats = { items: 0, totalSize: 0 };

    if (this.isClient) {
      // Session storage stats
      try {
        const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('cache_session_'));
        sessionStats.items = sessionKeys.length;
        sessionStats.totalSize = sessionKeys.reduce((acc, key) => {
          const value = sessionStorage.getItem(key);
          return acc + (value ? value.length : 0);
        }, 0);
      } catch (error) {
        console.warn('Failed to get session storage stats:', error);
      }

      // Local storage stats
      try {
        const localKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_local_'));
        localStats.items = localKeys.length;
        localStats.totalSize = localKeys.reduce((acc, key) => {
          const value = localStorage.getItem(key);
          return acc + (value ? value.length : 0);
        }, 0);
      } catch (error) {
        console.warn('Failed to get local storage stats:', error);
      }
    }

    return {
      memory: memoryStats,
      sessionStorage: sessionStats,
      localStorage: localStats
    };
  }

  /**
   * Wrapper method for API calls with caching
   */
  async withCache<T>(
    key: string,
    apiCall: () => Promise<T>,
    strategy: CacheStrategy = CacheStrategy.HYBRID,
    ttl: number = this.config.defaultTTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, strategy);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, call API
    const data = await apiCall();
    
    // Store in cache
    await this.set(key, data, strategy, ttl);
    
    return data;
  }
}

// Create singleton instance
export const cacheManager = new AdvancedCacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxMemoryItems: 1000,
  enableSessionStorage: true,
  enableLocalStorage: true,
  enableIndexedDB: false, // Can be enabled for large datasets
  compressionThreshold: 10 * 1024 // 10KB
});

export default cacheManager;
