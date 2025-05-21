const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

// Stock search routes
router.get('/search', stockController.searchStocks);
router.get('/symbol/:symbol', stockController.getStockBySymbol);

// 52-week high/low route
router.get('/market/52-week', stockController.get52WeekHighLow);

// Historical data route
router.get('/historical/:symbol', stockController.getHistoricalData);

// Cached data route
router.get('/cached', stockController.getCachedData);

module.exports = router;
