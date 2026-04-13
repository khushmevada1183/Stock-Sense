// Frontend-local data layer.
// All external API/network integration is intentionally removed.

import { logger } from '@/lib/logger';

const LOCAL_TRENDING_STOCKS = [];

const LOCAL_PRICE_SHOCKERS = [];

const LOCAL_BSE_ACTIVE = [];

const LOCAL_NSE_ACTIVE = [];

const LOCAL_NEWS = [];

const LOCAL_IPO_DATA = {
  upcoming: [],
  active: [],
  listed: [],
  closed: [],
};

const LOCAL_COMMODITIES = [];

const DEFAULT_USER_ID = '1';

const toTopMover = (item) => {
  const pct = Number(item.change_percent || 0);
  return {
    symbol: item.symbol,
    companyName: item.company_name,
    price: Number(item.current_price || 0),
    change: Number(item.net_change || 0),
    changePercent: pct,
    volume: Number(item.volume || 0),
  };
};

const findStockBySymbol = (symbolOrName = '') => {
  const query = String(symbolOrName).trim().toLowerCase();
  return LOCAL_TRENDING_STOCKS.find((stock) => {
    const symbol = String(stock.symbol || '').toLowerCase();
    const name = String(stock.company_name || '').toLowerCase();
    return symbol === query || symbol.includes(query) || name.includes(query);
  });
};

// ===== STOCK DATA =====

export async function getStockDetails(stockName) {
  const found = findStockBySymbol(stockName);
  if (!found) {
    return {
      symbol: String(stockName || '').toUpperCase(),
      company_name: String(stockName || 'Unknown Company'),
      current_price: 0,
      percent_change: 0,
      sector: 'N/A',
      industry: 'N/A',
      market_cap: 0,
      year_high: 0,
      year_low: 0,
      volume: 0,
      average_volume: 0,
    };
  }

  return {
    symbol: found.symbol,
    company_name: found.company_name,
    current_price: Number(found.current_price || 0),
    percent_change: Number(found.price_change_percentage || 0),
    sector: found.sector_name || 'N/A',
    industry: found.sector_name || 'N/A',
    market_cap: 0,
    year_high: Number(found.current_price || 0),
    year_low: Number(found.current_price || 0),
    volume: 0,
    average_volume: 0,
  };
}

export async function getTrendingStocks() {
  return {
    success: true,
    data: {
      stocks: LOCAL_TRENDING_STOCKS,
      trending_stocks: {
        top_gainers: LOCAL_TRENDING_STOCKS.filter((stock) => Number(stock.price_change_percentage || 0) >= 0),
        top_losers: LOCAL_TRENDING_STOCKS.filter((stock) => Number(stock.price_change_percentage || 0) < 0),
      },
    },
  };
}

export async function getHistoricalData() {
  return [];
}

export async function getFinancialStatement() {
  return { statements: [] };
}

export async function getStockTargetPrice() {
  return {
    priceTarget: {
      CurrencyCode: 'INR',
      Mean: 0,
      High: 0,
      Low: 0,
      NumberOfAnalysts: 0,
    },
    recommendation: {
      Mean: 3,
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

export async function getCorporateActions() {
  return [];
}

export async function getRecentAnnouncements() {
  return [];
}

export async function getStockForecasts() {
  return [];
}

export async function getHistoricalStats() {
  return [];
}

// ===== MARKET DATA =====

export async function getBSEMostActive() {
  return {
    success: true,
    data: {
      data: LOCAL_BSE_ACTIVE,
      indices: {
        nifty: { value: 0, change: 0, percent_change: 0 },
        sensex: { value: 0, change: 0, percent_change: 0 },
        bank_nifty: { value: 0, change: 0, percent_change: 0 },
        it_nifty: { value: 0, change: 0, percent_change: 0 },
      },
    },
  };
}

export async function getNSEMostActive() {
  return {
    success: true,
    data: {
      data: LOCAL_NSE_ACTIVE,
      sector_performance: [],
    },
  };
}

export async function get52WeekHighLow() {
  return {
    BSE_52WeekHighLow: {
      high52Week: [],
      low52Week: [],
    },
    NSE_52WeekHighLow: {
      high52Week: [],
      low52Week: [],
    },
  };
}

export async function getPriceShockers() {
  return {
    success: true,
    data: {
      gainers: LOCAL_PRICE_SHOCKERS.filter((stock) => Number(stock.change_percent || 0) > 0),
      losers: LOCAL_PRICE_SHOCKERS.filter((stock) => Number(stock.change_percent || 0) < 0),
      BSE_PriceShocker: [],
      NSE_PriceShocker: [],
    },
  };
}

export async function getCommodities() {
  return LOCAL_COMMODITIES;
}

// ===== IPO / NEWS / FUNDS =====

export async function getIPOData() {
  return {
    success: true,
    data: LOCAL_IPO_DATA,
  };
}

export async function getLatestNews() {
  return {
    success: true,
    data: LOCAL_NEWS,
  };
}

export async function getMutualFunds() {
  return [];
}

export async function searchMutualFunds() {
  return [];
}

export async function getMutualFundDetails() {
  return {};
}

export async function searchIndustry() {
  return [];
}

// ===== COMPATIBILITY ALIASES =====

export const getUpcomingIPOs = () => getIPOData();
export const getIPOCalendar = () => getIPOData();
export const getFeaturedStocks = () => Promise.resolve(LOCAL_TRENDING_STOCKS);

export const searchStocks = async (query) => {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return LOCAL_TRENDING_STOCKS.filter((stock) => {
    const symbol = String(stock.symbol || '').toLowerCase();
    const name = String(stock.company_name || '').toLowerCase();
    return symbol.includes(normalized) || name.includes(normalized);
  }).map((stock) => ({
    symbol: stock.symbol,
    ticker_id: stock.ticker_id,
    company_name: stock.company_name,
    current_price: stock.current_price,
    percent_change: stock.price_change_percentage,
    sector: stock.sector_name,
  }));
};

export const getTopGainers = async () => {
  const gainers = LOCAL_PRICE_SHOCKERS.filter((stock) => Number(stock.change_percent || 0) > 0);
  return gainers.map(toTopMover);
};

export const getTopLosers = async () => {
  const losers = LOCAL_PRICE_SHOCKERS.filter((stock) => Number(stock.change_percent || 0) < 0);
  return losers.map(toTopMover);
};

export const getFinancialStatements = () => getFinancialStatement();
export const getCompanyProfile = async (stockName) => {
  const details = await getStockDetails(stockName);
  return { ...details, logo: null };
};
export const getHistoricalPrices = (stockName, period = '6m') => getHistoricalData(stockName, period, 'price');
export const fetchStockDetails = getStockDetails;
export const fetchHistoricalData = getHistoricalData;

export const fetchMarketNews = async () => {
  const response = await getLatestNews();
  return response.data || [];
};

export async function getMarketOverview() {
  return { trending: LOCAL_TRENDING_STOCKS };
}

export async function getMarketMovers() {
  return {
    bse: LOCAL_BSE_ACTIVE,
    nse: LOCAL_NSE_ACTIVE,
  };
}

// ===== PORTFOLIO =====

export async function getUserPortfolios(userId = DEFAULT_USER_ID) {
  return { portfolios: [] };
}

export async function getPortfolioDetails() {
  return { details: {} };
}

export async function createPortfolio(portfolioData) {
  return {
    success: true,
    portfolioId: 'local-portfolio',
    portfolio: {
      userId: portfolioData?.userId || DEFAULT_USER_ID,
      portfolioName: portfolioData?.portfolioName || 'Untitled Portfolio',
      stocks: Array.isArray(portfolioData?.stocks) ? portfolioData.stocks : [],
    },
  };
}

export async function updatePortfolio(portfolioId, portfolioData) {
  if (!portfolioId) {
    throw new Error('portfolioId is required to update portfolio');
  }

  return {
    success: true,
    portfolio: {
      id: portfolioId,
      userId: portfolioData?.userId || DEFAULT_USER_ID,
      portfolioName: portfolioData?.portfolioName || 'Untitled Portfolio',
      stocks: Array.isArray(portfolioData?.stocks) ? portfolioData.stocks : [],
    },
  };
}

export async function deletePortfolio() {
  return { success: true };
}

export async function getPortfolioHoldings() {
  return { holdings: [] };
}

export async function getPortfolioSummary() {
  return {
    summary: {
      totalValue: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      dayGain: 0,
      dayGainPercent: 0,
      riskProfile: 'Moderate',
      valuationScore: 0,
      sectorAllocation: [],
    },
  };
}

// ===== HEALTH =====

export async function getHealthStatus() {
  return {
    status: 'disabled',
    message: 'Frontend API integration has been removed for backend migration.',
  };
}

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

logger.info('External API integration is disabled. Frontend is using local data only.');
