"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const stockRoutes_1 = __importDefault(require("./routes/stockRoutes"));
const securityMiddleware_1 = require("./middleware/securityMiddleware");
// Load environment variables if .env exists
try {
    require('dotenv').config();
}
catch (err) {
    console.log('No .env file found, using default values');
}
// Create Express app
const app = (0, express_1.default)();
// Apply middleware
app.use(securityMiddleware_1.requestLoggerMiddleware);
app.use(securityMiddleware_1.corsMiddleware);
app.use(securityMiddleware_1.securityMiddleware);
app.use(securityMiddleware_1.rateLimitMiddleware);
app.use((0, compression_1.default)()); // Compress all responses
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            status: 'UP',
            timestamp: new Date(),
            environment: process.env.NODE_ENV || 'development'
        }
    });
});
// API key config - returns masked API key for display purposes
app.get('/api/config', (req, res) => {
    const apiKey = process.env.STOCK_API_KEY || '';
    const maskedKey = apiKey
        ? `sk-live-${'*'.repeat(Math.max(0, apiKey.length - 15))}${apiKey.substring(Math.max(0, apiKey.length - 4))}`
        : 'Not configured';
    res.status(200).json({
        status: 'success',
        data: {
            apiKey: maskedKey,
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        }
    });
});
// API routes
app.use('/api', stockRoutes_1.default);
// Error handling middleware should be last
app.use(securityMiddleware_1.errorMiddleware);
exports.default = app;
