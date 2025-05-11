import { Request, Response } from 'express';
import { stockApiService } from '../services/stockApiService';

// Standardized API response format
function createApiResponse(status: 'success' | 'error', data: any, message?: string) {
  return {
    status,
    data,
    message: message || (status === 'success' ? 'Request successful' : 'Request failed')
  };
}

// Standardized error handler
function handleApiError(res: Response, error: any, defaultMessage = 'An error occurred') {
  console.error('API Error:', error.message);
  
  const statusCode = error.response?.status || 500;
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  
  return res.status(statusCode).json(createApiResponse('error', null, errorMessage));
}

export const stockController = {
  // Search stocks
  searchStocks: async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.json(createApiResponse('success', { results: [] }));
      }
      
      const searchResults = await stockApiService.searchStocks(query);
      return res.json(createApiResponse('success', searchResults));
    } catch (error) {
      return handleApiError(res, error, 'Failed to search stocks');
    }
  },
  
  // Get stock details
  getStockDetails: async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const stock = await stockApiService.getStockBySymbol(symbol);
      
      if (!stock) {
        return res.status(404).json(createApiResponse('error', null, `Stock ${symbol} not found`));
      }
      
      return res.json(createApiResponse('success', stock));
    } catch (error) {
      return handleApiError(res, error, `Failed to fetch stock data for ${req.params.symbol}`);
    }
  },
  
  // Get historical data
  getHistoricalData: async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const { period = '1yr', filter = 'price' } = req.query;
      
      const historicalData = await stockApiService.getHistoricalData(
        symbol, 
        period as string, 
        filter as string
      );
      
      return res.json(createApiResponse('success', historicalData));
    } catch (error) {
      return handleApiError(res, error, `Failed to fetch historical data for ${req.params.symbol}`);
    }
  },
  
  // Get IPO data
  getIpoData: async (req: Request, res: Response) => {
    try {
      const ipoData = await stockApiService.getIpoData();
      return res.json(createApiResponse('success', ipoData));
    } catch (error) {
      return handleApiError(res, error, 'Failed to fetch IPO data');
    }
  },
  
  // Get market news
  getMarketNews: async (req: Request, res: Response) => {
    try {
      const newsData = await stockApiService.getMarketNews();
      return res.json(createApiResponse('success', newsData));
    } catch (error) {
      return handleApiError(res, error, 'Failed to fetch news data');
    }
  },
  
  // Get top gainers
  getTopGainers: async (req: Request, res: Response) => {
    try {
      const topGainers = await stockApiService.getTopGainers();
      return res.json(createApiResponse('success', topGainers));
    } catch (error) {
      return handleApiError(res, error, 'Failed to fetch top gainers');
    }
  },
  
  // Get top losers
  getTopLosers: async (req: Request, res: Response) => {
    try {
      const topLosers = await stockApiService.getTopLosers();
      return res.json(createApiResponse('success', topLosers));
    } catch (error) {
      return handleApiError(res, error, 'Failed to fetch top losers');
    }
  },
  
  // Get market indices
  getMarketIndices: async (req: Request, res: Response) => {
    try {
      const indicesData = await stockApiService.getMarketIndices();
      return res.json(createApiResponse('success', indicesData));
    } catch (error) {
      return handleApiError(res, error, 'Failed to fetch market indices data');
    }
  },
  
  // Get 52-week high/low
  get52WeekHighLow: async (req: Request, res: Response) => {
    try {
      const highLowData = await stockApiService.get52WeekHighLow();
      return res.json(createApiResponse('success', highLowData));
    } catch (error) {
      return handleApiError(res, error, 'Failed to fetch 52-week high/low data');
    }
  },
  
  // Get all stocks data
  getAllStocks: async (req: Request, res: Response) => {
    try {
      const stocksData = await stockApiService.getAllStocks();
      return res.json(createApiResponse('success', stocksData));
    } catch (error) {
      return handleApiError(res, error, 'Failed to fetch stocks data');
    }
  }
}; 