const { Pool } = require('pg');
require('dotenv').config({ path: './.env.local' });

async function setupDatabase() {
  // Create a PostgreSQL connection pool
  const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: 'postgres', // Connect to default database first
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT || 5432,
  });

  try {
    console.log('Starting database setup...');

    // Check if our database exists
    const dbCheckResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'stock_analyzer'"
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log('Creating stock_analyzer database...');
      await pool.query('CREATE DATABASE stock_analyzer');
      console.log('Database created successfully');
    } else {
      console.log('Database stock_analyzer already exists');
    }

    // Close connection to postgres database
    await pool.end();

    // Connect to our application database
    const appPool = new Pool({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: 'stock_analyzer', // Now connect to our database
      password: process.env.PGPASSWORD || 'postgres',
      port: process.env.PGPORT || 5432,
    });

    // Create tables if they don't exist
    console.log('Creating tables if they don\'t exist...');
    
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS stock_data (
        id SERIAL PRIMARY KEY,
        query VARCHAR(255) UNIQUE,
        data JSONB NOT NULL,
        fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_stock_data_query ON stock_data(query);
      CREATE INDEX IF NOT EXISTS idx_stock_data_fetched_at ON stock_data(fetched_at);
    `);

    console.log('Database setup completed successfully');
    
    // Test inserting a sample record
    console.log('Testing database connection with sample data insertion...');
    
    const testData = {
      sample: true,
      message: 'This is a test record',
      timestamp: new Date().toISOString()
    };
    
    await appPool.query(
      'INSERT INTO stock_data (query, data) VALUES ($1, $2) ON CONFLICT (query) DO UPDATE SET data = $2, fetched_at = NOW()',
      ['test-sample', JSON.stringify(testData)]
    );
    
    console.log('Sample data inserted successfully');
    
    // Verify data was inserted
    const verifyResult = await appPool.query('SELECT * FROM stock_data WHERE query = $1', ['test-sample']);
    console.log('Sample data retrieved:', verifyResult.rows[0]);
    
    await appPool.end();
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  }
}

// Run the setup function
setupDatabase()
  .then(success => {
    if (success) {
      console.log('Database setup script completed successfully.');
      process.exit(0);
    } else {
      console.error('Database setup script failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error in database setup:', error);
    process.exit(1);
  });
