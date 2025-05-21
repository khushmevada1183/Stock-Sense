const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool with fallback configuration
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'stock_analyzer',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
  // Add connection timeout and retry options
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// Test the database connection with more robust error handling
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
    console.log('⚠️ PostgreSQL connection failed - the app will continue to work but without database features');
    console.log('💡 To use database features, please run the setup-database.bat script');
  } else {
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

// Create tables if they don't exist
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_data (
        id SERIAL PRIMARY KEY,
        query VARCHAR(255) UNIQUE,
        data JSONB NOT NULL,
        fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Database tables verified/created');
  } catch (error) {
    console.error('Error creating database tables:', error);
    console.log('⚠️ Continuing without database storage - data will not be cached');
  }
};

// Execute table creation
createTables();

// Modified pool object with fallback methods when DB is unavailable
const fallbackPool = {
  query: async (...args) => {
    try {
      return await pool.query(...args);
    } catch (error) {
      console.warn('Database query failed, using fallback:', error.message);
      // Return empty result to avoid breaking application
      return { rows: [] };
    }
  }
};

module.exports = fallbackPool;