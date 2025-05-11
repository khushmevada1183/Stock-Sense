import express from 'express';
import { stockController } from '../controllers/stockController';

const router = express.Router();

// Search routes
router.get('/stocks/search', stockController.searchStocks);

// Stock details
router.get('/stocks/:symbol', stockController.getStockDetails);
router.get('/stock/:name', stockController.getStockDetails); // Alias for compatibility

// Historical data
router.get('/stocks/:symbol/historical', stockController.getHistoricalData);

// Market data
router.get('/stocks', stockController.getAllStocks);
router.get('/ipo', stockController.getIpoData);
router.get('/news', stockController.getMarketNews);
router.get('/stocks/top-gainers', stockController.getTopGainers);
router.get('/stocks/top-losers', stockController.getTopLosers);
router.get('/market-indices', stockController.getMarketIndices);
router.get('/52-week-high-low', stockController.get52WeekHighLow);

export default router; 