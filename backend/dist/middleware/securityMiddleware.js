"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLoggerMiddleware = exports.errorMiddleware = exports.rateLimitMiddleware = exports.securityMiddleware = exports.corsMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
// CORS middleware configuration
exports.corsMiddleware = (0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
});
// Helmet security middleware
exports.securityMiddleware = (0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
});
// API rate limiting middleware
exports.rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute by default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per minute by default
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.'
    }
});
// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        data: null,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
};
exports.errorMiddleware = errorMiddleware;
// Request logging middleware
const requestLoggerMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
};
exports.requestLoggerMiddleware = requestLoggerMiddleware;
