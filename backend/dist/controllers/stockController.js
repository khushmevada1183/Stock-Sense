"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockController = void 0;
const stockApiService_1 = require("../services/stockApiService");
// Standardized API response format
function createApiResponse(status, data, message) {
    return {
        status,
        data,
        message: message || (status === 'success' ? 'Request successful' : 'Request failed')
    };
}
// Standardized error handler
function handleApiError(res, error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || defaultMessage;
    return res.status(statusCode).json(createApiResponse('error', null, errorMessage));
}
exports.stockController = {
    // Search stocks
    searchStocks: async (req, res) => {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                return res.json(createApiResponse('success', { results: [] }));
            }
            // Use uppercase for better results with the API
            const formattedQuery = query.toUpperCase();
            console.log(`Searching for stock: ${formattedQuery}`);
            try {
                // Try to get stock details directly
                const stock = await stockApiService_1.stockApiService.getStockBySymbol(formattedQuery);
                if (stock) {
                    // Format the response as expected by the frontend
                    const formattedResult = {
                        results: [{
                                symbol: stock.symbol || formattedQuery,
                                companyName: stock.companyName || 'Unknown',
                                latestPrice: stock.currentPrice?.BSE || stock.currentPrice?.NSE || 0,
                                change: stock.percentChange?.change || 0,
                                changePercent: stock.percentChange?.percent_change || 0,
                                sector: stock.industry || stock.sector || ''
                            }]
                    };
                    console.log(`Found stock data for ${formattedQuery}`);
                    return res.json(createApiResponse('success', formattedResult));
                }
            }
            catch (directError) {
                console.error(`Error getting direct stock data for ${formattedQuery}:`, directError.message);
                // Continue to search if direct lookup fails
            }
            // Fall back to search API
            const searchResults = await stockApiService_1.stockApiService.searchStocks(formattedQuery);
            return res.json(createApiResponse('success', searchResults));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to search stocks');
        }
    },
    // Get stock details
    getStockDetails: async (req, res) => {
        try {
            const { symbol } = req.params;
            const stock = await stockApiService_1.stockApiService.getStockBySymbol(symbol);
            if (!stock) {
                return res.status(404).json(createApiResponse('error', null, `Stock ${symbol} not found`));
            }
            return res.json(createApiResponse('success', stock));
        }
        catch (error) {
            return handleApiError(res, error, `Failed to fetch stock data for ${req.params.symbol}`);
        }
    },
    // Get historical data
    getHistoricalData: async (req, res) => {
        try {
            const { symbol } = req.params;
            const { period = '1yr', filter = 'price' } = req.query;
            const historicalData = await stockApiService_1.stockApiService.getHistoricalData(symbol, period, filter);
            return res.json(createApiResponse('success', historicalData));
        }
        catch (error) {
            return handleApiError(res, error, `Failed to fetch historical data for ${req.params.symbol}`);
        }
    },
    // Get IPO data
    getIpoData: async (req, res) => {
        try {
            const ipoData = await stockApiService_1.stockApiService.getIpoData();
            return res.json(createApiResponse('success', ipoData));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to fetch IPO data');
        }
    },
    // Get market news
    getMarketNews: async (req, res) => {
        try {
            const newsData = await stockApiService_1.stockApiService.getMarketNews();
            return res.json(createApiResponse('success', newsData));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to fetch news data');
        }
    },
    // Get top gainers
    getTopGainers: async (req, res) => {
        try {
            const topGainers = await stockApiService_1.stockApiService.getTopGainers();
            return res.json(createApiResponse('success', topGainers));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to fetch top gainers');
        }
    },
    // Get top losers
    getTopLosers: async (req, res) => {
        try {
            const topLosers = await stockApiService_1.stockApiService.getTopLosers();
            return res.json(createApiResponse('success', topLosers));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to fetch top losers');
        }
    },
    // Get market indices
    getMarketIndices: async (req, res) => {
        try {
            const indicesData = await stockApiService_1.stockApiService.getMarketIndices();
            return res.json(createApiResponse('success', indicesData));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to fetch market indices data');
        }
    },
    // Get 52-week high/low
    get52WeekHighLow: async (req, res) => {
        try {
            const highLowData = await stockApiService_1.stockApiService.get52WeekHighLow();
            return res.json(createApiResponse('success', highLowData));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to fetch 52-week high/low data');
        }
    },
    // Get all stocks data
    getAllStocks: async (req, res) => {
        try {
            const stocksData = await stockApiService_1.stockApiService.getAllStocks();
            return res.json(createApiResponse('success', stocksData));
        }
        catch (error) {
            return handleApiError(res, error, 'Failed to fetch stocks data');
        }
    }
};
