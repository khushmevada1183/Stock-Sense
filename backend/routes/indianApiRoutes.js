const express = require('express');
const router = express.Router();
const indianStockApiService = require('../services/indianStockApi');
const { asyncHandler } = require('../utils/asyncHandler');

// Get stock details
router.get('/stock/:name', asyncHandler(async (req, res) => {
  const { name } = req.params;
  const stockData = await indianStockApiService.getStockByName(name);
  res.json(stockData);
}));

// Get trending stocks
router.get('/trending', asyncHandler(async (req, res) => {
  const trendingStocks = await indianStockApiService.getTrendingStocks();
  res.json(trendingStocks);
}));

// Get historical data
router.get('/historical/:name', asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { period = '1m', filter = 'default' } = req.query;
  const historicalData = await indianStockApiService.getHistoricalData(name, period, filter);
  res.json(historicalData);
}));

// Get IPO data
router.get('/ipo', asyncHandler(async (req, res) => {
  const ipoData = await indianStockApiService.getIPOData();
  res.json(ipoData);
}));

// Get news data
router.get('/news', asyncHandler(async (req, res) => {
  const newsData = await indianStockApiService.getNewsData();
  res.json(newsData);
}));

// Get commodities data
router.get('/commodities', asyncHandler(async (req, res) => {
  const commoditiesData = await indianStockApiService.getCommoditiesData();
  res.json(commoditiesData);
}));

// Get mutual funds data
router.get('/mutual-funds', asyncHandler(async (req, res) => {
  const mutualFundsData = await indianStockApiService.getMutualFundsData();
  res.json(mutualFundsData);
}));

// Get BSE most active stocks
router.get('/bse-most-active', asyncHandler(async (req, res) => {
  const bseMostActiveStocks = await indianStockApiService.getBSEMostActiveStocks();
  res.json(bseMostActiveStocks);
}));

// Get NSE most active stocks
router.get('/nse-most-active', asyncHandler(async (req, res) => {
  const nseMostActiveStocks = await indianStockApiService.getNSEMostActiveStocks();
  res.json(nseMostActiveStocks);
}));

// Get price shockers data
router.get('/price-shockers', asyncHandler(async (req, res) => {
  const priceShockersData = await indianStockApiService.getPriceShockersData();
  res.json(priceShockersData);
}));

// Get 52 week high/low data
router.get('/52-week-high-low', asyncHandler(async (req, res) => {
  const highLowData = await indianStockApiService.get52WeekHighLowData();
  res.json(highLowData);
}));

// Search for industry data
router.get('/industry-search', asyncHandler(async (req, res) => {
  const { query } = req.query;
  const industryData = await indianStockApiService.searchIndustryData(query);
  res.json(industryData);
}));

// Search for mutual funds
router.get('/mutual-fund-search', asyncHandler(async (req, res) => {
  const { query } = req.query;
  const mutualFundsData = await indianStockApiService.searchMutualFunds(query);
  res.json(mutualFundsData);
}));

// Search for stocks
router.get('/stock-search', asyncHandler(async (req, res) => {
  const { query } = req.query;
  const searchResults = await indianStockApiService.searchStocks(query);
  res.json(searchResults);
}));

module.exports = router; 