/**
 * Enhanced Caching Hook for React Components
 * 
 * This hook provides intelligent caching with multiple strategies
 * and automatic cache management for React components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedAPI, cacheManager, CacheStrategy } from '../cachedAPI';

export interface UseCachedDataOptions {
  strategy?: CacheStrategy;
  ttl?: number;
  enableBackground?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  enabled?: boolean;
}

/**
 * Generic hook for cached data fetching
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions = {}
) {
  const {
    strategy = CacheStrategy.HYBRID,
    ttl = 5 * 60 * 1000, // 5 minutes
    enableBackground = false,
    refreshInterval,
    onError,
    onSuccess,
    enabled = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  
  const fetchRef = useRef(fetcher);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update fetcher ref when it changes
  useEffect(() => {
    fetchRef.current = fetcher;
  }, [fetcher]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;
    
    try {
      if (!forceRefresh) {
        setLoading(true);
      }
      setError(null);

      let result: T;
      
      if (forceRefresh) {
        // Force refresh - bypass cache
        result = await fetchRef.current();
        await cacheManager.set(key, result, strategy, ttl);
      } else {
        // Use cache if available
        result = await cacheManager.withCache(
          key,
          fetchRef.current,
          strategy,
          ttl
        );
      }

      setData(result);
      setLastFetch(Date.now());
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [key, strategy, ttl, enabled, onError, onSuccess]);

  // Background refresh functionality
  const refreshData = useCallback(() => {
    if (enableBackground && data) {
      // Background refresh - don't show loading state
      fetchData(true).catch(console.error);
    } else {
      fetchData(true);
    }
  }, [fetchData, enableBackground, data]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && enabled) {
      intervalRef.current = setInterval(refreshData, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, refreshData, enabled]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh: refreshData,
    refetch: () => fetchData(true)
  };
}

/**
 * Hook for cached stock details
 */
export function useCachedStockDetails(symbol: string, options: UseCachedDataOptions = {}) {
  return useCachedData(
    `stock_details_${symbol}`,
    () => cachedAPI.getStockDetails(symbol, false),
    {
      strategy: CacheStrategy.HYBRID,
      ttl: 5 * 60 * 1000, // 5 minutes
      ...options
    }
  );
}

/**
 * Hook for cached historical data
 */
export function useCachedHistoricalData(
  symbol: string, 
  period: string = '1Y', 
  filter: string = 'price',
  options: UseCachedDataOptions = {}
) {
  return useCachedData(
    `historical_${symbol}_${period}_${filter}`,
    () => cachedAPI.getHistoricalPrices(symbol, period, filter, false),
    {
      strategy: CacheStrategy.LOCAL_STORAGE,
      ttl: 60 * 60 * 1000, // 1 hour
      ...options
    }
  );
}

/**
 * Hook for cached market data
 */
export function useCachedMarketData(options: UseCachedDataOptions = {}) {
  return useCachedData(
    'market_overview',
    () => cachedAPI.getMarketOverview(false),
    {
      strategy: CacheStrategy.HYBRID,
      ttl: 60 * 1000, // 1 minute
      enableBackground: true,
      refreshInterval: 30 * 1000, // 30 seconds
      ...options
    }
  );
}

/**
 * Hook for cached featured stocks
 */
export function useCachedFeaturedStocks(options: UseCachedDataOptions = {}) {
  return useCachedData(
    'featured_stocks',
    () => cachedAPI.getFeaturedStocks(false),
    {
      strategy: CacheStrategy.HYBRID,
      ttl: 30 * 1000, // 30 seconds
      enableBackground: true,
      refreshInterval: 60 * 1000, // 1 minute
      ...options
    }
  );
}

/**
 * Hook for cached news
 */
export function useCachedNews(options: UseCachedDataOptions = {}) {
  return useCachedData(
    'latest_news',
    () => cachedAPI.getLatestNews(false),
    {
      strategy: CacheStrategy.HYBRID,
      ttl: 5 * 60 * 1000, // 5 minutes
      ...options
    }
  );
}

/**
 * Hook for cached IPO data
 */
export function useCachedIPOData(options: UseCachedDataOptions = {}) {
  return useCachedData(
    'upcoming_ipos',
    () => cachedAPI.getUpcomingIPOs(false),
    {
      strategy: CacheStrategy.HYBRID,
      ttl: 30 * 60 * 1000, // 30 minutes
      ...options
    }
  );
}

/**
 * Hook for cached search results
 */
export function useCachedSearch(query: string, options: UseCachedDataOptions = {}) {
  const enabled = query.length >= 2;
  
  return useCachedData(
    `search_${query.toLowerCase()}`,
    () => cachedAPI.searchStocks(query, false),
    {
      strategy: CacheStrategy.SESSION_STORAGE,
      ttl: 10 * 60 * 1000, // 10 minutes
      enabled,
      ...options
    }
  );
}

/**
 * Hook for cached company profile
 */
export function useCachedCompanyProfile(symbol: string, options: UseCachedDataOptions = {}) {
  return useCachedData(
    `company_profile_${symbol}`,
    () => cachedAPI.getCompanyProfile(symbol, false),
    {
      strategy: CacheStrategy.LOCAL_STORAGE,
      ttl: 15 * 60 * 1000, // 15 minutes
      ...options
    }
  );
}

/**
 * Hook for cached market movers
 */
export function useCachedMarketMovers(options: UseCachedDataOptions = {}) {
  return useCachedData(
    'market_movers',
    () => cachedAPI.getMarketMovers(false),
    {
      strategy: CacheStrategy.HYBRID,
      ttl: 60 * 1000, // 1 minute
      enableBackground: true,
      refreshInterval: 30 * 1000, // 30 seconds
      ...options
    }
  );
}

/**
 * Hook for cache management
 */
export function useCache() {
  const [stats, setStats] = useState(cacheManager.getStats());

  const refreshStats = useCallback(() => {
    setStats(cacheManager.getStats());
  }, []);

  const clearCache = useCallback(async (pattern?: string) => {
    await cachedAPI.clearCache(pattern);
    refreshStats();
  }, [refreshStats]);

  const prefetchData = useCallback(async () => {
    await cachedAPI.prefetchData();
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    // Refresh stats periodically
    const interval = setInterval(refreshStats, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearCache,
    prefetchData,
    cacheManager
  };
}

/**
 * Hook for background data prefetching
 */
export function usePrefetchData() {
  useEffect(() => {
    // Prefetch common data on app load
    const prefetch = async () => {
      try {
        await cachedAPI.prefetchData();
        console.log('Background data prefetching completed');
      } catch (error) {
        console.warn('Background data prefetching failed:', error);
      }
    };

    // Delay prefetching to not interfere with initial page load
    const timer = setTimeout(prefetch, 2000);
    return () => clearTimeout(timer);
  }, []);
}

export default {
  useCachedData,
  useCachedStockDetails,
  useCachedHistoricalData,
  useCachedMarketData,
  useCachedFeaturedStocks,
  useCachedNews,
  useCachedIPOData,
  useCachedSearch,
  useCachedCompanyProfile,
  useCachedMarketMovers,
  useCache,
  usePrefetchData
};
