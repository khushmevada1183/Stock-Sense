"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stockController_1 = require("../controllers/stockController");
const router = express_1.default.Router();
// Search routes
router.get('/stocks/search', stockController_1.stockController.searchStocks);
// Stock details
router.get('/stocks/:symbol', stockController_1.stockController.getStockDetails);
router.get('/stock/:name', stockController_1.stockController.getStockDetails); // Alias for compatibility
// Historical data
router.get('/stocks/:symbol/historical', stockController_1.stockController.getHistoricalData);
// Market data
router.get('/stocks', stockController_1.stockController.getAllStocks);
router.get('/ipo', stockController_1.stockController.getIpoData);
router.get('/news', stockController_1.stockController.getMarketNews);
router.get('/stocks/top-gainers', stockController_1.stockController.getTopGainers);
router.get('/stocks/top-losers', stockController_1.stockController.getTopLosers);
router.get('/market-indices', stockController_1.stockController.getMarketIndices);
router.get('/52-week-high-low', stockController_1.stockController.get52WeekHighLow);
exports.default = router;
