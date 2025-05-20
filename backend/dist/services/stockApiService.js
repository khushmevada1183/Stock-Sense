"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockApiService = void 0;
const axios_1 = __importDefault(require("axios"));
const cacheService_1 = require("./cacheService");
// Configure environment variables
const API_KEY = process.env.STOCK_API_KEY || '';
const API_BASE_URL = 'https://stock.indianapi.in';
class StockApiService {
    // Create an API client with proper headers
    createApiClient() {
        return axios_1.default.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            timeout: 10000 // 10 second timeout
        });
    }
    // General fetch method with caching
    async fetchWithCache(endpoint, dataType) {
        const cacheKey = `api:${endpoint}`;
        try {
            // Try to get from cache first
            const cachedData = await cacheService_1.cacheService.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }
            // Fetch fresh data if not in cache
            const apiClient = this.createApiClient();
            const response = await apiClient.get(endpoint);
            const data = response.data;
            // Cache the result
            const ttl = cacheService_1.DEFAULT_TTL[dataType];
            await cacheService_1.cacheService.set(cacheKey, data, ttl);
            return data;
        }
        catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }
    // Search stocks by query
    async searchStocks(query) {
        if (!query || query.length < 2) {
            return { results: [] };
        }
        try {
            const results = await this.fetchWithCache(`/stock?name=${encodeURIComponent(query)}`, 'STOCK_DATA');
            // Transform the API response to our expected format
            if (results && Array.isArray(results.data)) {
                return {
                    results: results.data.map((item) => ({
                        symbol: item.symbol || item.name,
                        companyName: item.company_name || item.name,
                        latestPrice: item.current_price,
                        change: item.change,
                        changePercent: item.percent_change,
                        sector: item.sector
                    }))
                };
            }
            return { results: [] };
        }
        catch (error) {
            console.error(`Error searching stocks for "${query}":`, error);
            return { results: [] };
        }
    }
    // Get details for a specific stock
    async getStockBySymbol(symbol) {
        try {
            const data = await this.fetchWithCache(`/stock?name=${encodeURIComponent(symbol)}`, 'STOCK_DATA');
            if (data && data.data && data.data.length > 0) {
                return data.data[0];
            }
            return null;
        }
        catch (error) {
            console.error(`Error fetching stock details for ${symbol}:`, error);
            throw error;
        }
    }
    // Get historical data for a stock
    async getHistoricalData(symbol, period = '1yr', filter = 'price') {
        try {
            const data = await this.fetchWithCache(`/stock/history?name=${encodeURIComponent(symbol)}&period=${period}&filter=${filter}`, 'HISTORICAL_DATA');
            // Transform API data to our expected format
            if (data && data.data && data.data.dates && data.data.prices) {
                return data.data.dates.map((date, index) => ({
                    date,
                    price: data.data.prices[index],
                    volume: data.data.volumes ? data.data.volumes[index] : undefined
                }));
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching historical data for ${symbol}:`, error);
            return [];
        }
    }
    // Get IPO data
    async getIpoData() {
        try {
            const data = await this.fetchWithCache('/ipo', 'MARKET_DATA');
            return data.data || [];
        }
        catch (error) {
            console.error('Error fetching IPO data:', error);
            return [];
        }
    }
    // Get market news
    async getMarketNews() {
        try {
            const data = await this.fetchWithCache('/news', 'MARKET_DATA');
            return data.data || [];
        }
        catch (error) {
            console.error('Error fetching market news:', error);
            return [];
        }
    }
    // Get top gainers
    async getTopGainers() {
        try {
            const data = await this.fetchWithCache('/trending', 'MARKET_DATA');
            return data.data && data.data.top_gainers ? data.data.top_gainers : [];
        }
        catch (error) {
            console.error('Error fetching top gainers:', error);
            return [];
        }
    }
    // Get top losers
    async getTopLosers() {
        try {
            const data = await this.fetchWithCache('/trending', 'MARKET_DATA');
            return data.data && data.data.top_losers ? data.data.top_losers : [];
        }
        catch (error) {
            console.error('Error fetching top losers:', error);
            return [];
        }
    }
    // Get market indices
    async getMarketIndices() {
        try {
            const data = await this.fetchWithCache('/indices', 'MARKET_DATA');
            return data.data || {};
        }
        catch (error) {
            console.error('Error fetching market indices:', error);
            return {};
        }
    }
    // Get 52 week high/low stocks
    async get52WeekHighLow() {
        try {
            const data = await this.fetchWithCache('/52-week', 'MARKET_DATA');
            return data.data || {};
        }
        catch (error) {
            console.error('Error fetching 52-week high/low data:', error);
            return {};
        }
    }
    // Get all stocks data (combined endpoint)
    async getAllStocks() {
        try {
            const data = await this.fetchWithCache('/trending', 'MARKET_DATA');
            return data.data || {};
        }
        catch (error) {
            console.error('Error fetching all stocks data:', error);
            return {};
        }
    }
}
// Export a singleton instance
exports.stockApiService = new StockApiService();
