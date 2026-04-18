import {
  apiClientConfig,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from '@/lib/apiClient';
import { clearAuthTokens, saveAuthTokens } from '@/lib/auth';
import { logger } from '@/lib/logger';

const DEFAULT_SEARCH_LIMIT = 25;
const DEFAULT_USER_ID = '1';

const asArray = (value) => (Array.isArray(value) ? value : []);

const unwrapData = (value) => {
  if (value && typeof value === 'object' && 'data' in value) {
    return value.data;
  }

  return value;
};

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

const periodToBucket = (period) => {
  const normalized = String(period || '').toLowerCase();
  if (['1d', '1day', 'day'].includes(normalized)) return '1m';
  if (['5d', '1w', 'week'].includes(normalized)) return '5m';
  if (['1m', '1mo', 'month'].includes(normalized)) return '15m';
  return '1d';
};

const toLegacySearchItem = (item) => ({
  companyName: item.companyName || item.company_name || item.name || 'Unknown Company',
  symbol: item.symbol || item.ticker || item.tickerId || 'N/A',
  ticker_id: item.symbol || item.ticker || item.tickerId || 'N/A',
  company_name: item.companyName || item.company_name || item.name || 'Unknown Company',
  name: item.companyName || item.company_name || item.name || 'Unknown Company',
  latestPrice: item.currentPrice ?? item.current_price ?? item.price ?? null,
  current_price: item.currentPrice ?? item.current_price ?? item.price ?? null,
  price: item.currentPrice ?? item.current_price ?? item.price ?? null,
  change: item.change ?? item.net_change ?? item.netChange ?? 0,
  changePercent: item.changePercent ?? item.percent_change ?? item.price_change_percentage ?? 0,
  percentChange: item.changePercent ?? item.percent_change ?? item.price_change_percentage ?? 0,
  percent_change: item.changePercent ?? item.percent_change ?? item.price_change_percentage ?? 0,
  price_change_percentage: item.changePercent ?? item.percent_change ?? item.price_change_percentage ?? 0,
  sector: item.sector || item.sector_name || null,
  sector_name: item.sector_name || item.sector || null,
});

const toLegacyMover = (item) => {
  const percentChange = Number(
    item.change_percent ?? item.percent_change ?? item.changePercent ?? item.price_change_percentage ?? 0
  );

  return {
    symbol: item.symbol || item.ticker || 'N/A',
    companyName: item.company_name || item.companyName || item.name || 'Unknown Company',
    company_name: item.company_name || item.companyName || item.name || 'Unknown Company',
    price: Number(item.current_price ?? item.currentPrice ?? item.price ?? item.last_price ?? 0),
    current_price: Number(item.current_price ?? item.currentPrice ?? item.price ?? item.last_price ?? 0),
    change: Number(item.net_change ?? item.change ?? 0),
    changePercent: percentChange,
    change_percent: percentChange,
    volume: Number(item.volume ?? item.traded_volume ?? 0),
  };
};

const toFiniteNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const mapMarketStockToLegacy = (item = {}) => {
  const symbolCandidate = item.symbol || item.nseSymbol || item.ticker_id || item.ticker || item.ric;
  const symbol = normalizeSymbol(String(symbolCandidate || 'N/A').split('.')[0]);
  const companyName = item.company_name || item.companyName || item.company || item.name || symbol || 'Unknown Company';

  const price = toFiniteNumber(
    item.current_price ?? item.currentPrice ?? item.lastPrice ?? item.last_price ?? item.price ?? item.close
  );
  const percentChange = toFiniteNumber(
    item.percent_change ??
      item.change_percent ??
      item.price_change_percentage ??
      item.pChange ??
      item.changePercent ??
      item.percentChange
  );
  const change = toFiniteNumber(
    item.net_change ??
      item.change ??
      item.price_change ??
      (price && item.previousClose ? price - Number(item.previousClose) : 0)
  );
  const volume = toFiniteNumber(item.volume ?? item.totalTurnover ?? item.traded_volume ?? item.finalQuantity ?? item.quantity);

  return {
    ...item,
    symbol,
    ticker_id: symbol,
    companyName,
    company_name: companyName,
    name: companyName,
    latestPrice: price,
    current_price: price,
    last_price: price,
    price,
    change,
    net_change: change,
    changePercent: percentChange,
    percentChange,
    percent_change: percentChange,
    change_percent: percentChange,
    price_change_percentage: percentChange,
    sector: item.sector || item.sector_name || null,
    sector_name: item.sector_name || item.sector || null,
    volume,
    traded_volume: volume,
  };
};

const dedupeBySymbol = (items) => {
  const seen = new Set();

  return asArray(items).filter((item) => {
    const key = normalizeSymbol(item?.symbol || item?.ticker_id || item?.ticker || '');
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const saveTokensFromAuthPayload = (response) => {
  const data = unwrapData(response);
  if (data?.accessToken || data?.refreshToken) {
    saveAuthTokens({
      accessToken: data.accessToken || null,
      refreshToken: data.refreshToken || null,
    });
  }
};

const MARKET_OVERVIEW_CACHE_TTL_MS = 15000;
let marketOverviewCache = {
  data: null,
  expiresAt: 0,
  inFlight: null,
};

const requestCacheStore = new Map();
const REQUEST_CACHE_MAX_ENTRIES = 200;

const pruneRequestCacheStore = (now = Date.now()) => {
  // Drop expired entries that are no longer in-flight.
  for (const [cacheKey, entry] of requestCacheStore.entries()) {
    if (!entry?.inFlight && entry?.expiresAt <= now) {
      requestCacheStore.delete(cacheKey);
    }
  }

  // Keep cache bounded to avoid silent memory growth in long dev sessions.
  if (requestCacheStore.size <= REQUEST_CACHE_MAX_ENTRIES) {
    return;
  }

  const overflowCount = requestCacheStore.size - REQUEST_CACHE_MAX_ENTRIES;
  let removed = 0;

  for (const [cacheKey, entry] of requestCacheStore.entries()) {
    if (removed >= overflowCount) {
      break;
    }

    if (!entry?.inFlight) {
      requestCacheStore.delete(cacheKey);
      removed += 1;
    }
  }
};

const buildCacheKey = (prefix, params = {}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');

  return query ? `${prefix}?${query}` : prefix;
};

const withRequestCache = async (key, fetcher, ttlMs = 3500) => {
  const now = Date.now();
  pruneRequestCacheStore(now);
  const cached = requestCacheStore.get(key);

  if (cached?.inFlight) {
    return cached.inFlight;
  }

  if (cached?.data && cached.expiresAt > now) {
    return cached.data;
  }

  if (cached?.error && cached.expiresAt > now) {
    throw cached.error;
  }

  const inFlight = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      requestCacheStore.set(key, {
        data,
        error: null,
        expiresAt: Date.now() + ttlMs,
        inFlight: null,
      });
      return data;
    })
    .catch((error) => {
      const statusCode = typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : NaN;

      if (statusCode === 401 || statusCode === 429) {
        requestCacheStore.set(key, {
          data: null,
          error,
          expiresAt: Date.now() + ttlMs,
          inFlight: null,
        });
      } else {
        requestCacheStore.delete(key);
      }

      throw error;
    })
    .finally(() => {
      const current = requestCacheStore.get(key);
      if (current && current.inFlight) {
        requestCacheStore.set(key, {
          ...current,
          inFlight: null,
        });
      }
    });

  requestCacheStore.set(key, {
    data: cached?.data || null,
    error: cached?.error || null,
    expiresAt: cached?.expiresAt || 0,
    inFlight,
  });

  return inFlight;
};

// ===== AUTH =====

export async function signup(payload) {
  const response = await apiPost('/auth/signup', payload);
  saveTokensFromAuthPayload(response);
  return response;
}

export async function login(payload) {
  const response = await apiPost('/auth/login', payload);
  saveTokensFromAuthPayload(response);
  return response;
}

export async function oauthLogin(payload) {
  const response = await apiPost('/auth/oauth/login', payload);
  saveTokensFromAuthPayload(response);
  return response;
}

export async function refreshAuthToken(refreshToken) {
  const response = await apiPost('/auth/refresh', { refreshToken });
  saveTokensFromAuthPayload(response);
  return response;
}

export async function logout(refreshToken) {
  const response = await apiPost('/auth/logout', { refreshToken });
  clearAuthTokens();
  return response;
}

export async function logoutAll() {
  const response = await apiPost('/auth/logout-all', {}, { requiresAuth: true });
  clearAuthTokens();
  return response;
}

export async function getAuthSessions(params = {}) {
  return apiGet('/auth/sessions', params, { requiresAuth: true });
}

export async function getAuthAuditLogs(params = {}) {
  return apiGet('/auth/audit-logs', params, { requiresAuth: true });
}

export async function verifyEmail(payload) {
  return apiPost('/auth/verify-email', payload);
}

export async function resendVerification(payload) {
  return apiPost('/auth/resend-verification', payload);
}

export async function forgotPassword(payload) {
  return apiPost('/auth/forgot-password', payload);
}

export async function resetPassword(payload) {
  return apiPost('/auth/reset-password', payload);
}

export async function getProfile() {
  return withRequestCache(
    'auth:profile',
    () => apiGet('/auth/profile', undefined, { requiresAuth: true }),
    5000
  );
}

export async function updateProfile(payload) {
  return apiPatch('/auth/profile', payload, { requiresAuth: true });
}

// ===== STOCKS =====

export async function searchStocks(query, options = {}) {
  const q = String(query || '').trim();
  if (!q) {
    return [];
  }

  const response = await apiGet('/stocks/search', {
    q,
    page: options.page || 1,
    limit: options.limit || DEFAULT_SEARCH_LIMIT,
  });

  const data = unwrapData(response);
  const results = asArray(data?.results || data?.stocks || data);
  return results.map(toLegacySearchItem);
}

export async function getStockDetails(stockName) {
  const symbol = normalizeSymbol(stockName);

  try {
    const response = await apiGet(`/stocks/${symbol}`);
    return unwrapData(response);
  } catch (error) {
    logger.warn('getStockDetails direct lookup failed, trying search fallback', {
      symbol,
      error: error instanceof Error ? error.message : error,
    });

    const matches = await searchStocks(stockName, { limit: 1 });
    if (matches.length === 0) {
      throw error;
    }

    const fallbackSymbol = normalizeSymbol(matches[0].symbol);
    const response = await apiGet(`/stocks/${fallbackSymbol}`);
    return unwrapData(response);
  }
}

export async function getStockQuote(symbol) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/quote`);
  return unwrapData(response);
}

export async function getStockTechnical(symbol, params = {}) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/technical`, params);
  return unwrapData(response);
}

export async function getStockFundamental(symbol, params = {}) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/fundamental`, params);
  return unwrapData(response);
}

export async function getStockFinancials(symbol, params = {}) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/financials`, params);
  return unwrapData(response);
}

export async function getStockPeers(symbol, params = {}) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/peers`, params);
  return unwrapData(response);
}

export async function getStockSentiment(symbol, params = {}) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/sentiment`, params);
  return unwrapData(response);
}

export async function getStockHistory(symbol, params = {}) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/history`, params);
  return unwrapData(response);
}

export async function getStockTicks(symbol, params = {}) {
  const response = await apiGet(`/stocks/${normalizeSymbol(symbol)}/ticks`, params);
  return unwrapData(response);
}

export async function getHistoricalData(stockName, period = '6m', filter = 'price') {
  const bucket = periodToBucket(period);
  const payload = await getStockHistory(stockName, { bucket, filter });
  return asArray(payload?.candles || payload?.ticks || payload?.history || payload);
}

export async function getHistoricalPrices(stockName, period = '6m', filter = 'price') {
  return getHistoricalData(stockName, period, filter);
}

export async function getFinancialStatement(stockName) {
  return getStockFinancials(stockName);
}

export async function getFinancialStatements(stockName) {
  return getStockFinancials(stockName);
}

export async function getCompanyProfile(stockName) {
  return getStockDetails(stockName);
}

export async function getStockTargetPrice(stockId) {
  const fundamental = await getStockFundamental(stockId);
  const mean = Number(fundamental?.targetPrice ?? fundamental?.priceTarget ?? fundamental?.meanTarget ?? 0);
  const high = Number(fundamental?.targetPriceHigh ?? fundamental?.highTarget ?? mean);
  const low = Number(fundamental?.targetPriceLow ?? fundamental?.lowTarget ?? mean);
  const analysts = Number(fundamental?.analystsCount ?? fundamental?.numberOfAnalysts ?? 0);

  return {
    priceTarget: {
      CurrencyCode: 'INR',
      Mean: mean,
      High: high,
      Low: low,
      NumberOfAnalysts: analysts,
    },
    recommendation: {
      Mean: Number(fundamental?.recommendationMean ?? 3),
      Statistics: {
        Statistic: [
          { Recommendation: 1, NumberOfAnalysts: 0 },
          { Recommendation: 2, NumberOfAnalysts: 0 },
          { Recommendation: 3, NumberOfAnalysts: 0 },
          { Recommendation: 4, NumberOfAnalysts: 0 },
          { Recommendation: 5, NumberOfAnalysts: 0 },
        ],
      },
    },
  };
}

export async function getCorporateActions(stockName, params = {}) {
  const response = await apiGet('/institutional/corporate-actions', {
    ...params,
    symbol: normalizeSymbol(stockName),
  });
  return unwrapData(response);
}

export async function getRecentAnnouncements(stockName, params = {}) {
  return getCorporateActions(stockName, params);
}

export async function getStockForecasts(stockId) {
  const financials = await getStockFinancials(stockId);
  return asArray(financials?.forecast || financials?.forecasts || []);
}

export async function getHistoricalStats(stockName, stats = 'price') {
  return getHistoricalData(stockName, '6m', stats);
}

// ===== MARKET =====

export async function getMarketOverview() {
  const now = Date.now();

  if (marketOverviewCache.data && marketOverviewCache.expiresAt > now) {
    return marketOverviewCache.data;
  }

  if (marketOverviewCache.inFlight) {
    return marketOverviewCache.inFlight;
  }

  marketOverviewCache.inFlight = apiGet('/market/overview')
    .then((response) => {
      marketOverviewCache.data = response;
      marketOverviewCache.expiresAt = Date.now() + MARKET_OVERVIEW_CACHE_TTL_MS;
      return response;
    })
    .catch((error) => {
      marketOverviewCache.data = null;
      marketOverviewCache.expiresAt = 0;
      throw error;
    })
    .finally(() => {
      marketOverviewCache.inFlight = null;
    });

  return marketOverviewCache.inFlight;
}

export async function getMarketSnapshotLatest() {
  return apiGet('/market/snapshot/latest');
}

export async function getMarketSnapshotHistory(params = {}) {
  return apiGet('/market/snapshot/history', params);
}

export async function getMarketSnapshotStatus() {
  return apiGet('/market/snapshot/status');
}

export async function getMarketSectorHeatmap(params = {}) {
  return apiGet('/market/sector-heatmap', params);
}

export async function get52WeekHigh(params = {}) {
  return apiGet('/market/52-week-high', params);
}

export async function get52WeekLow(params = {}) {
  return apiGet('/market/52-week-low', params);
}

export async function getMarketIndexHistory(indexName, params = {}) {
  try {
    return await apiGet(`/market/indices/${normalizeSymbol(indexName)}/history`, params);
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : NaN;

    if (statusCode === 404) {
      return {
        success: true,
        data: {
          items: [],
        },
      };
    }

    throw error;
  }
}

export async function getTrendingStocks() {
  try {
    const overviewResponse = await getMarketOverview();
    const overview = unwrapData(overviewResponse);

    const nseMostActive = asArray(overview?.mostActive?.nse?.stocks || overview?.mostActive?.stocks);
    const bseMostActive = asArray(overview?.mostActive?.bse?.stocks);
    const moverGainers = asArray(overview?.gainersLosers?.gainers || overview?.gainersLosers?.topGainers);
    const moverLosers = asArray(overview?.gainersLosers?.losers || overview?.gainersLosers?.topLosers);

    const stocks = dedupeBySymbol(
      [...nseMostActive, ...bseMostActive, ...moverGainers, ...moverLosers].map(mapMarketStockToLegacy)
    );

    if (stocks.length > 0) {
      const topGainers = [...stocks]
        .filter((item) => toFiniteNumber(item.percent_change) >= 0)
        .sort((a, b) => toFiniteNumber(b.percent_change) - toFiniteNumber(a.percent_change))
        .slice(0, 25);
      const topLosers = [...stocks]
        .filter((item) => toFiniteNumber(item.percent_change) < 0)
        .sort((a, b) => toFiniteNumber(a.percent_change) - toFiniteNumber(b.percent_change))
        .slice(0, 25);

      return {
        success: true,
        data: {
          stocks,
          trending_stocks: {
            top_gainers: topGainers,
            top_losers: topLosers,
          },
        },
      };
    }
  } catch (error) {
    logger.warn('getTrendingStocks overview derivation failed, using search fallback', {
      error: error instanceof Error ? error.message : error,
    });
  }

  const stocks = await searchStocks('a', { limit: 50 });
  const topGainers = stocks
    .filter((item) => Number(item.percent_change || 0) >= 0)
    .slice(0, 25);
  const topLosers = stocks
    .filter((item) => Number(item.percent_change || 0) < 0)
    .slice(0, 25);

  return {
    success: true,
    data: {
      stocks,
      trending_stocks: {
        top_gainers: topGainers,
        top_losers: topLosers,
      },
    },
  };
}

export async function getBSEMostActive() {
  const overviewResponse = await getMarketOverview();
  const overview = unwrapData(overviewResponse);
  const bsePayload = overview?.mostActive?.bse;

  if (Array.isArray(bsePayload)) {
    return {
      success: true,
      data: bsePayload.map(mapMarketStockToLegacy),
    };
  }

  if (bsePayload && typeof bsePayload === 'object') {
    return {
      success: true,
      data: {
        ...bsePayload,
        stocks: asArray(bsePayload.stocks).map(mapMarketStockToLegacy),
      },
    };
  }

  return {
    success: true,
    data: [],
  };
}

export async function getNSEMostActive() {
  const overviewResponse = await getMarketOverview();
  const overview = unwrapData(overviewResponse);
  const nsePayload = overview?.mostActive?.nse;

  if (Array.isArray(nsePayload)) {
    return {
      success: true,
      data: nsePayload.map(mapMarketStockToLegacy),
    };
  }

  if (nsePayload && typeof nsePayload === 'object') {
    return {
      success: true,
      data: {
        ...nsePayload,
        stocks: asArray(nsePayload.stocks).map(mapMarketStockToLegacy),
      },
    };
  }

  return {
    success: true,
    data: [],
  };
}

export async function getPriceShockers() {
  const overviewResponse = await getMarketOverview();
  const overview = unwrapData(overviewResponse);
  const shockers = overview?.gainersLosers || {};

  const gainers = asArray(shockers?.gainers || shockers?.topGainers || shockers?.advances).map(mapMarketStockToLegacy);
  const losers = asArray(shockers?.losers || shockers?.topLosers || shockers?.declines).map(mapMarketStockToLegacy);

  return {
    success: true,
    data: {
      gainers,
      losers,
      BSE_PriceShocker: gainers,
      NSE_PriceShocker: losers,
    },
  };
}

export async function get52WeekHighLow() {
  const [highResponse, lowResponse] = await Promise.all([get52WeekHigh(), get52WeekLow()]);

  const highData = unwrapData(highResponse);
  const lowData = unwrapData(lowResponse);

  const highItems = asArray(highData?.items || highData?.results || highData?.stocks || highData);
  const lowItems = asArray(lowData?.items || lowData?.results || lowData?.stocks || lowData);

  return {
    BSE_52WeekHighLow: {
      high52Week: highItems,
      low52Week: lowItems,
    },
    NSE_52WeekHighLow: {
      high52Week: highItems,
      low52Week: lowItems,
    },
  };
}

export async function getCommodities() {
  // v1 backend currently does not expose a dedicated /commodities endpoint.
  return [];
}

export async function getTopGainers() {
  const response = await getPriceShockers();
  return asArray(response?.data?.gainers).map(toLegacyMover);
}

export async function getTopLosers() {
  const response = await getPriceShockers();
  return asArray(response?.data?.losers).map(toLegacyMover);
}

export async function getFeaturedStocks() {
  const response = await getTrendingStocks();
  return asArray(response?.data?.stocks || []);
}

export async function getMarketMovers() {
  const [bseResponse, nseResponse] = await Promise.all([getBSEMostActive(), getNSEMostActive()]);

  return {
    bse: unwrapData(bseResponse),
    nse: unwrapData(nseResponse),
  };
}

// ===== NEWS =====

export async function getLatestNews(params = {}) {
  return withRequestCache(
    buildCacheKey('news:latest', params),
    () => apiGet('/news', params),
    4000
  );
}

export async function getNewsByCategory(category, params = {}) {
  const normalizedCategory = encodeURIComponent(String(category || '').trim().toLowerCase());
  return withRequestCache(
    buildCacheKey(`news:category:${normalizedCategory}`, params),
    () => apiGet(`/news/category/${normalizedCategory}`, params),
    4000
  );
}

export async function getTrendingNews(params = {}) {
  return withRequestCache(
    buildCacheKey('news:trending', params),
    () => apiGet('/news/trending', params),
    4000
  );
}

export async function getNewsAlerts(params = {}) {
  return apiGet('/news/alerts', params);
}

export async function getFearGreedIndex(params = {}) {
  return apiGet('/news/fear-greed', params);
}

export async function syncNews(payload = {}) {
  return apiPost('/news/sync', payload, { requiresAuth: true });
}

export async function fetchMarketNews() {
  const response = await getLatestNews();
  const data = unwrapData(response);
  return asArray(data?.articles || data?.news || data);
}

// ===== IPO =====

export async function getIPOCalendar(params = {}) {
  return withRequestCache(
    buildCacheKey('ipo:calendar', params),
    () => apiGet('/ipo/calendar', params),
    5000
  );
}

export async function getIpoById(ipoId) {
  return apiGet(`/ipo/${encodeURIComponent(String(ipoId || '').trim())}`);
}

export async function getIpoSubscriptionsLatest(params = {}) {
  return apiGet('/ipo/subscriptions/latest', params);
}

export async function getIpoSubscriptionHistory(ipoId, params = {}) {
  return apiGet(`/ipo/${encodeURIComponent(String(ipoId || '').trim())}/subscription`, params);
}

export async function getIpoGmpLatest(params = {}) {
  return apiGet('/ipo/gmp/latest', params);
}

export async function getIpoGmpHistory(ipoId, params = {}) {
  return apiGet(`/ipo/${encodeURIComponent(String(ipoId || '').trim())}/gmp`, params);
}

export async function getIPOData() {
  const response = await getIPOCalendar();
  const data = unwrapData(response);

  if (data?.upcoming || data?.active || data?.listed || data?.closed) {
    return {
      success: true,
      data,
    };
  }

  const items = asArray(data?.ipos || data?.items || data);
  const bucketed = {
    upcoming: items.filter((item) => String(item.status || '').toLowerCase() === 'upcoming'),
    active: items.filter((item) => String(item.status || '').toLowerCase() === 'active'),
    listed: items.filter((item) => String(item.status || '').toLowerCase() === 'listed'),
    closed: items.filter((item) => String(item.status || '').toLowerCase() === 'closed'),
  };

  return {
    success: true,
    data: bucketed,
  };
}

export async function getUpcomingIPOs() {
  const ipoData = await getIPOData();
  return ipoData?.data?.upcoming || [];
}

// ===== INSTITUTIONAL =====

export async function getFiiDiiLatest(params = {}) {
  return apiGet('/institutional/fii-dii', params);
}

export async function getFiiDiiHistory(params = {}) {
  return apiGet('/institutional/fii-dii/history', params);
}

export async function getFiiDiiCumulative(params = {}) {
  return apiGet('/institutional/fii-dii/cumulative', params);
}

export async function getBlockDealsLatest(params = {}) {
  return apiGet('/institutional/block-deals', params);
}

export async function getBlockDealsHistory(params = {}) {
  return apiGet('/institutional/block-deals/history', params);
}

export async function getMutualFunds(params = {}) {
  return apiGet('/institutional/mutual-funds', params);
}

export const getMutualFundsLatest = getMutualFunds;

export async function searchMutualFunds(query) {
  return apiGet('/institutional/mutual-funds', { symbol: query, q: query });
}

export async function getMutualFundDetails(stockName, params = {}) {
  return apiGet('/institutional/mutual-funds/top-holders', {
    ...params,
    symbol: normalizeSymbol(stockName),
  });
}

export async function searchIndustry(query) {
  return getNewsByCategory(query || 'markets');
}

export async function getMutualFundsHistory(params = {}) {
  return apiGet('/institutional/mutual-funds/history', params);
}

export async function getMutualFundsTopHolders(params = {}) {
  return apiGet('/institutional/mutual-funds/top-holders', params);
}

export async function getInsiderTradesLatest(params = {}) {
  return apiGet('/institutional/insider-trades', params);
}

export async function getInsiderTradesHistory(params = {}) {
  return apiGet('/institutional/insider-trades/history', params);
}

export async function getInsiderTradesSummary(params = {}) {
  return apiGet('/institutional/insider-trades/summary', params);
}

export async function getShareholdingLatest(params = {}) {
  return apiGet('/institutional/shareholding', params);
}

export async function getShareholdingHistory(params = {}) {
  return apiGet('/institutional/shareholding/history', params);
}

export async function getShareholdingTrends(params = {}) {
  return apiGet('/institutional/shareholding/trends', params);
}

export async function getCorporateActionsLatest(params = {}) {
  return apiGet('/institutional/corporate-actions', params);
}

export async function getCorporateActionsHistory(params = {}) {
  return apiGet('/institutional/corporate-actions/history', params);
}

export async function getCorporateActionsSummary(params = {}) {
  return apiGet('/institutional/corporate-actions/summary', params);
}

export async function getEarningsCalendarLatest(params = {}) {
  return apiGet('/institutional/earnings-calendar', params);
}

export async function getEarningsCalendarHistory(params = {}) {
  return apiGet('/institutional/earnings-calendar/history', params);
}

export async function getEarningsCalendarSummary(params = {}) {
  return apiGet('/institutional/earnings-calendar/summary', params);
}

// ===== PORTFOLIO =====

export async function getUserPortfolios(userId = DEFAULT_USER_ID) {
  const response = await withRequestCache(
    'portfolio:list',
    () => apiGet('/portfolios', undefined, { requiresAuth: true }),
    5000
  );
  const data = unwrapData(response);

  return {
    userId,
    portfolios: asArray(data?.portfolios || data),
  };
}

export async function getPortfolioDetails(portfolioId, userId = DEFAULT_USER_ID) {
  const response = await apiGet(`/portfolios/${encodeURIComponent(String(portfolioId || '').trim())}`, undefined, {
    requiresAuth: true,
  });
  const data = unwrapData(response);

  return {
    userId,
    details: data?.details || data,
  };
}

export async function createPortfolio(portfolioData) {
  const response = await apiPost('/portfolios', portfolioData, { requiresAuth: true });
  const data = unwrapData(response);

  return {
    success: true,
    portfolioId: data?.portfolioId || data?.portfolio?.id,
    portfolio: data?.portfolio || data,
  };
}

export async function updatePortfolio(portfolioId, portfolioData) {
  const response = await apiPut(`/portfolios/${encodeURIComponent(String(portfolioId || '').trim())}`, portfolioData, {
    requiresAuth: true,
  });
  const data = unwrapData(response);

  return {
    success: true,
    portfolio: data?.portfolio || data,
  };
}

export async function deletePortfolio(portfolioId, userId = DEFAULT_USER_ID) {
  const response = await apiDelete(`/portfolios/${encodeURIComponent(String(portfolioId || '').trim())}`, {
    requiresAuth: true,
  });
  const data = unwrapData(response);

  return {
    success: true,
    userId,
    message: data?.message || 'Portfolio deleted successfully',
  };
}

/**
 * @param {string} [userId]
 * @param {string|null|undefined} [portfolioId]
 */
export async function getPortfolioHoldings(userId = DEFAULT_USER_ID, portfolioId = null) {
  const path = portfolioId
    ? `/portfolios/${encodeURIComponent(String(portfolioId).trim())}/holdings`
    : '/portfolios/holdings';

  const response = await apiGet(path, undefined, { requiresAuth: true });
  const data = unwrapData(response);

  return {
    userId,
    holdings: asArray(data?.holdings || data),
  };
}

/**
 * @param {string} [userId]
 * @param {string|null|undefined} [portfolioId]
 */
export async function getPortfolioSummary(userId = DEFAULT_USER_ID, portfolioId = null) {
  const path = portfolioId
    ? `/portfolios/${encodeURIComponent(String(portfolioId).trim())}/summary`
    : '/portfolios/summary';

  const response = await apiGet(path, undefined, { requiresAuth: true });
  const data = unwrapData(response);

  return {
    userId,
    summary: data?.summary || data,
  };
}

/**
 * @param {string} [userId]
 * @param {string|null|undefined} [portfolioId]
 * @param {Record<string, unknown>} [params]
 */
export async function getPortfolioPerformance(userId = DEFAULT_USER_ID, portfolioId = null, params = {}) {
  const path = portfolioId
    ? `/portfolios/${encodeURIComponent(String(portfolioId).trim())}/performance`
    : '/portfolios/performance';

  const response = await apiGet(path, params, { requiresAuth: true });
  const data = unwrapData(response);

  return {
    userId,
    performance: data?.performance || data,
  };
}

/**
 * @param {string} [userId]
 * @param {string|null|undefined} [portfolioId]
 * @param {Record<string, unknown>} [params]
 */
export async function getPortfolioXirr(userId = DEFAULT_USER_ID, portfolioId = null, params = {}) {
  const path = portfolioId
    ? `/portfolios/${encodeURIComponent(String(portfolioId).trim())}/xirr`
    : '/portfolios/xirr';

  const response = await apiGet(path, params, { requiresAuth: true });
  const data = unwrapData(response);

  return {
    userId,
    xirr: data?.xirr || data,
  };
}

export async function getPortfolioExport(portfolioId, params = {}) {
  const response = await apiGet(`/portfolios/${encodeURIComponent(String(portfolioId || '').trim())}/export`, params, {
    requiresAuth: true,
  });
  const data = unwrapData(response);

  return {
    portfolioId,
    exportData: data,
  };
}

export async function addPortfolioTransaction(portfolioId, payload) {
  return apiPost(`/portfolios/${encodeURIComponent(String(portfolioId || '').trim())}/transactions`, payload, {
    requiresAuth: true,
  });
}

// ===== WATCHLISTS =====

export async function getWatchlists() {
  const response = await apiGet('/watchlists', undefined, { requiresAuth: true });
  const data = unwrapData(response);
  return asArray(data?.watchlists || data);
}

export async function createWatchlist(payload) {
  return apiPost('/watchlists', payload, { requiresAuth: true });
}

export async function getWatchlistById(watchlistId) {
  return apiGet(`/watchlists/${encodeURIComponent(String(watchlistId || '').trim())}`, undefined, {
    requiresAuth: true,
  });
}

export async function updateWatchlist(watchlistId, payload) {
  return apiPatch(`/watchlists/${encodeURIComponent(String(watchlistId || '').trim())}`, payload, {
    requiresAuth: true,
  });
}

export async function deleteWatchlist(watchlistId) {
  return apiDelete(`/watchlists/${encodeURIComponent(String(watchlistId || '').trim())}`, {
    requiresAuth: true,
  });
}

export async function addWatchlistItem(watchlistId, payload) {
  return apiPost(`/watchlists/${encodeURIComponent(String(watchlistId || '').trim())}/items`, payload, {
    requiresAuth: true,
  });
}

export async function removeWatchlistItem(watchlistId, itemId) {
  return apiDelete(`/watchlists/${encodeURIComponent(String(watchlistId || '').trim())}/items/${encodeURIComponent(String(itemId || '').trim())}`, {
    requiresAuth: true,
  });
}

export async function reorderWatchlistItems(watchlistId, payload) {
  return apiPatch(`/watchlists/${encodeURIComponent(String(watchlistId || '').trim())}/items/reorder`, payload, {
    requiresAuth: true,
  });
}

// ===== ALERTS =====

export async function getAlerts(params = {}) {
  return apiGet('/alerts', params, { requiresAuth: true });
}

export async function getAlertById(alertId) {
  return apiGet(`/alerts/${encodeURIComponent(String(alertId || '').trim())}`, undefined, {
    requiresAuth: true,
  });
}

export async function createAlert(payload) {
  return apiPost('/alerts', payload, { requiresAuth: true });
}

export async function updateAlert(alertId, payload) {
  return apiPatch(`/alerts/${encodeURIComponent(String(alertId || '').trim())}`, payload, {
    requiresAuth: true,
  });
}

export async function deleteAlert(alertId) {
  return apiDelete(`/alerts/${encodeURIComponent(String(alertId || '').trim())}`, {
    requiresAuth: true,
  });
}

export async function getAlertEvaluatorStatus() {
  return apiGet('/alerts/evaluator/status', undefined, { requiresAuth: true });
}

// ===== NOTIFICATIONS =====

export async function getNotifications(params = {}) {
  return withRequestCache(
    buildCacheKey('notifications:list', params),
    () => apiGet('/notifications', params, { requiresAuth: true }),
    5000
  );
}

export async function getNotificationDeliveryStatus() {
  return apiGet('/notifications/delivery/status', undefined, { requiresAuth: true });
}

export async function getPushDevices() {
  return apiGet('/notifications/push-devices', undefined, { requiresAuth: true });
}

export async function registerPushDevice(payload) {
  return apiPost('/notifications/push-devices', payload, { requiresAuth: true });
}

export async function deletePushDevice(deviceId) {
  return apiDelete(`/notifications/push-devices/${encodeURIComponent(String(deviceId || '').trim())}`, {
    requiresAuth: true,
  });
}

// ===== HEALTH =====

export async function getHealthStatus() {
  return withRequestCache(
    'health:status',
    async () => {
      const response = await apiGet('/health');
      return unwrapData(response);
    },
    10000
  );
}

export async function getDatabaseHealthStatus() {
  return withRequestCache(
    'health:db',
    async () => {
      const response = await apiGet('/health/db');
      return unwrapData(response);
    },
    10000
  );
}

// ===== COMPATIBILITY =====

export const fetchStockDetails = getStockDetails;
export const fetchHistoricalData = getHistoricalData;

export const apiHelpers = {
  getStockDetails,
  searchStocks,
  getHistoricalData,
  getHistoricalPrices,
  getFinancialStatements,
  getCompanyProfile,
  getStockTargetPrice,
  getFeaturedStocks,
  getMarketOverview,
  getLatestNews,
  getIPOData,
  getMarketMovers,
  getUserPortfolios,
  getPortfolioHoldings,
  getPortfolioSummary,
  getCommodities,
  getNSEMostActive,
  getBSEMostActive,
  getPriceShockers,
};

export const API_BASE_URL = apiClientConfig.BASE_URL;

logger.info(`API integration enabled with base URL: ${API_BASE_URL}`);
