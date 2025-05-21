"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const env_1 = __importDefault(require("../config/env"));
const logger_1 = require("../utils/logger");
// Create PostgreSQL connection pool
let pool;
try {
    pool = new pg_1.Pool({
        connectionString: env_1.default.DATABASE_URL,
        // Maximum number of clients the pool should contain
        max: 20,
        // Maximum time in milliseconds a client can be idle before being removed
        idleTimeoutMillis: 30000,
        // Maximum time to wait for available connection
        connectionTimeoutMillis: 2000,
    });
    // Log database connection information (development only)
    if (env_1.default.NODE_ENV === 'development') {
        const config = pool.options;
        logger_1.logger.info(`PostgreSQL connection configured: ${config.database || 'N/A'} on ${config.host || 'N/A'}:${config.port || 'N/A'}`);
    }
    // Handle unexpected errors to prevent app crash
    pool.on('error', (err) => {
        logger_1.logger.error('Unexpected error on idle client', err);
    });
}
catch (error) {
    logger_1.logger.error('Failed to create PostgreSQL connection pool:', error);
    throw new Error('Failed to create database connection');
}
// Export connection pool
exports.db = pool;
exports.default = pool;
