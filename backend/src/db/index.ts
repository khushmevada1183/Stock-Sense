import { Pool } from 'pg';
import env from '../config/env';
import { logger } from '../utils/logger';

// Create PostgreSQL connection pool
let pool: Pool;

try {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    // Maximum number of clients the pool should contain
    max: 20,
    // Maximum time in milliseconds a client can be idle before being removed
    idleTimeoutMillis: 30000,
    // Maximum time to wait for available connection
    connectionTimeoutMillis: 2000,
  });

  // Log database connection information (development only)
  if (env.NODE_ENV === 'development') {
    const config = pool.options;
    logger.info(`PostgreSQL connection configured: ${config.database || 'N/A'} on ${config.host || 'N/A'}:${config.port || 'N/A'}`);
  }

  // Handle unexpected errors to prevent app crash
  pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
  });
} catch (error) {
  logger.error('Failed to create PostgreSQL connection pool:', error);
  throw new Error('Failed to create database connection');
}

// Export connection pool
export const db = pool;
export default pool; 