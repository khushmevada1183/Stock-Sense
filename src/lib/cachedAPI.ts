/**
 * Cached API Wrapper
 * 
 * Wraps API calls with intelligent caching strategies
 */

import { cacheManager, CacheStrategy } from './cache/CacheManager';
import * as apiUtils from '../utils/api';
import { logger } from '@/lib/logger';

// Cache TTL configurations for different data types
const CACHE_CONFIG = {
  // Real-time data - short cache
  STOCK_PRICES: 30 * 1000, // 30 seconds
  MARKET_MOVERS: 60 * 1000, // 1 minute
  
  // Semi-static data - medium cache
  STOCK_DETAILS: 5 * 60 * 1000, // 5 minutes
  COMPANY_PROFILE: 15 * 60 * 1000, // 15 minutes
  NEWS: 5 * 60 * 1000, // 5 minutes
  
  // Static data - long cache
  HISTORICAL_DATA: 60 * 60 * 1000, // 1 hour
  FINANCIAL_STATEMENTS: 4 * 60 * 60 * 1000, // 4 hours
  IPO_DATA: 30 * 60 * 1000, // 30 minutes
  
  // Search results - medium cache
  SEARCH_RESULTS: 10 * 60 * 1000, // 10 minutes
};

class CachedAPI {
  /**
   * Get cached stock details
   */
  async getStockDetails(symbol: string, useCache: boolean = true) {
    const cacheKey = `stock_details_${symbol}`;
    
    if (!useCache) {
      const data = await apiUtils.getStockDetails(symbol);
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.STOCK_DETAILS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getStockDetails(symbol),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.STOCK_DETAILS
    );
  }

  /**
   * Get cached historical prices
   */
  async getHistoricalPrices(
    symbol: string,
    period: string = '1Y',
    filter: string = 'price',
    useCache: boolean = true
  ) {
    const cacheKey = `historical_${symbol}_${period}_${filter}`;
    
    if (!useCache) {
      const data = await apiUtils.getHistoricalData(symbol, period, filter);
      await cacheManager.set(cacheKey, data, CacheStrategy.LOCAL_STORAGE, CACHE_CONFIG.HISTORICAL_DATA);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getHistoricalData(symbol, period, filter),
      CacheStrategy.LOCAL_STORAGE, // Use local storage for historical data
      CACHE_CONFIG.HISTORICAL_DATA
    );
  }

  /**
   * Get cached company profile
   */
  async getCompanyProfile(symbol: string, useCache: boolean = true) {
    const cacheKey = `company_profile_${symbol}`;
    
    if (!useCache) {
      const data = await apiUtils.getCompanyProfile(symbol);
      await cacheManager.set(cacheKey, data, CacheStrategy.LOCAL_STORAGE, CACHE_CONFIG.COMPANY_PROFILE);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getCompanyProfile(symbol),
      CacheStrategy.LOCAL_STORAGE,
      CACHE_CONFIG.COMPANY_PROFILE
    );
  }

  /**
   * Get cached financial statements
   */
  async getFinancialStatements(symbol: string, useCache: boolean = true) {
    const cacheKey = `financial_statements_${symbol}`;
    
    if (!useCache) {
      const data = await apiUtils.getFinancialStatements(symbol);
      await cacheManager.set(cacheKey, data, CacheStrategy.LOCAL_STORAGE, CACHE_CONFIG.FINANCIAL_STATEMENTS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getFinancialStatements(symbol),
      CacheStrategy.LOCAL_STORAGE,
      CACHE_CONFIG.FINANCIAL_STATEMENTS
    );
  }

  /**
   * Get cached search results
   */
  async searchStocks(query: string, useCache: boolean = true) {
    const cacheKey = `search_${query.toLowerCase()}`;
    
    if (!useCache) {
      const data = await apiUtils.searchStocks(query);
      await cacheManager.set(cacheKey, data, CacheStrategy.SESSION_STORAGE, CACHE_CONFIG.SEARCH_RESULTS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.searchStocks(query),
      CacheStrategy.SESSION_STORAGE,
      CACHE_CONFIG.SEARCH_RESULTS
    );
  }

  /**
   * Get cached featured stocks
   */
  async getFeaturedStocks(useCache: boolean = true) {
    const cacheKey = 'featured_stocks';
    
    if (!useCache) {
      const data = await apiUtils.getFeaturedStocks();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.STOCK_PRICES);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getFeaturedStocks(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.STOCK_PRICES
    );
  }

  /**
   * Get cached market overview
   */
  async getMarketOverview(useCache: boolean = true) {
    const cacheKey = 'market_overview';
    
    if (!useCache) {
      const data = await apiUtils.getMarketOverview();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getMarketOverview(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Get cached latest news
   */
  async getLatestNews(useCache: boolean = true) {
    const cacheKey = 'latest_news';
    
    if (!useCache) {
      const data = await apiUtils.getLatestNews();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.NEWS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getLatestNews(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.NEWS
    );
  }

  /**
   * Get cached upcoming IPOs
   */
  async getUpcomingIPOs(useCache: boolean = true) {
    const cacheKey = 'upcoming_ipos';
    
    if (!useCache) {
      const data = await apiUtils.getUpcomingIPOs();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.IPO_DATA);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getUpcomingIPOs(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.IPO_DATA
    );
  }

  /**
   * Get cached market movers
   */
  async getMarketMovers(useCache: boolean = true) {
    const cacheKey = 'market_movers';
    
    if (!useCache) {
      const data = await apiUtils.getMarketMovers();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getMarketMovers(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Get cached NSE most active
   */
  async getNSEMostActive(useCache: boolean = true) {
    const cacheKey = 'nse_most_active';
    
    if (!useCache) {
      const data = await apiUtils.getNSEMostActive();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getNSEMostActive(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Get cached BSE most active
   */
  async getBSEMostActive(useCache: boolean = true) {
    const cacheKey = 'bse_most_active';
    
    if (!useCache) {
      const data = await apiUtils.getBSEMostActive();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getBSEMostActive(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Get cached price shockers (gainers/losers)
   */
  async getPriceShockers(useCache: boolean = true) {
    const cacheKey = 'price_shockers';
    
    if (!useCache) {
      const data = await apiUtils.getPriceShockers();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getPriceShockers(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Get cached top gainers
   */
  async getTopGainers(useCache: boolean = true) {
    const cacheKey = 'top_gainers';
    
    if (!useCache) {
      const data = await apiUtils.getTopGainers();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getTopGainers(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Get cached top losers
   */
  async getTopLosers(useCache: boolean = true) {
    const cacheKey = 'top_losers';
    
    if (!useCache) {
      const data = await apiUtils.getTopLosers();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getTopLosers(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Get cached commodities data
   */
  async getCommodities(useCache: boolean = true) {
    const cacheKey = 'commodities';
    
    if (!useCache) {
      const data = await apiUtils.getCommodities();
      await cacheManager.set(cacheKey, data, CacheStrategy.HYBRID, CACHE_CONFIG.MARKET_MOVERS);
      return data;
    }
    
    return cacheManager.withCache(
      cacheKey,
      () => apiUtils.getCommodities(),
      CacheStrategy.HYBRID,
      CACHE_CONFIG.MARKET_MOVERS
    );
  }

  /**
   * Clear specific cache entries
   */
  async clearCache(pattern?: string) {
    if (pattern) {
      // Clear specific pattern - this would require implementing pattern matching in CacheManager
      logger.debug(`Clearing cache for pattern: ${pattern}`);
    } else {
      // Clear all cache
      await cacheManager.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheManager.getStats();
  }

  /**
   * Prefetch important data
   */
  async prefetchData() {
    try {
      // Prefetch commonly accessed data
      await Promise.allSettled([
        this.getFeaturedStocks(),
        this.getMarketOverview(),
        this.getLatestNews(),
        this.getUpcomingIPOs(),
        this.getMarketMovers()
      ]);
      
      logger.debug('Data prefetching completed');
    } catch (error) {
      logger.warn('Data prefetching failed:', error);
    }
  }
}

// Create singleton instance
export const cachedAPI = new CachedAPI();

// Export cache utilities
export { cacheManager, CacheStrategy, CACHE_CONFIG };

export default cachedAPI;
