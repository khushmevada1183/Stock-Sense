"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const env_1 = __importDefault(require("./config/env"));
const db_1 = __importDefault(require("./db"));
const init_1 = require("./db/init");
const logger_1 = require("./utils/logger");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const stock_routes_1 = __importDefault(require("./routes/stock.routes"));
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: env_1.default.CORS_ORIGIN,
    credentials: true,
}));
app.use((0, compression_1.default)()); // Compress responses
app.use((0, morgan_1.default)('dev')); // Logging
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/stocks', stock_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.url}`
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    logger_1.logger.error(`Error: ${err.message}`);
    res.status(statusCode).json({
        status: 'error',
        message: err.message,
        ...(env_1.default.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
});
// Start server
const PORT = env_1.default.PORT;
// Initialize the database then start the server
async function startServer() {
    try {
        // Initialize database
        await (0, init_1.initializeDatabase)();
        // Start the server
        app.listen(PORT, () => {
            logger_1.logger.info(`Server running in ${env_1.default.NODE_ENV} mode on port ${PORT}`);
            // Check database connection
            db_1.default.query('SELECT NOW()', (err) => {
                if (err) {
                    logger_1.logger.error('Database connection error:', err.message);
                }
                else {
                    logger_1.logger.info('Database connection successful');
                }
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('UNHANDLED REJECTION:', err);
    // Don't crash the server on unhandled promise rejections
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION:', err);
    // Exit process on critical errors
    process.exit(1);
});
exports.default = app;
