"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTables = initializeTables;
exports.seedData = seedData;
exports.initializeDatabase = initializeDatabase;
exports.insertSampleData = insertSampleData;
exports.initDB = initDB;
const index_1 = __importStar(require("./index"));
const env_1 = __importDefault(require("../config/env"));
const logger_1 = require("../utils/logger");
// Initialize database tables
async function initializeTables() {
    try {
        logger_1.logger.info('Creating database tables...');
        // Create users table
        await index_1.db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        logger_1.logger.info('✅ Users table created or confirmed');
        // Create sectors table
        await index_1.db.query(`
      CREATE TABLE IF NOT EXISTS sectors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        logger_1.logger.info('✅ Sectors table created or confirmed');
        // Create stocks table
        await index_1.db.query(`
      CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        sector_id INTEGER REFERENCES sectors(id),
        current_price DECIMAL(10, 2),
        market_cap DECIMAL(20, 2),
        pe_ratio DECIMAL(10, 2),
        dividend_yield DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        logger_1.logger.info('✅ Stocks table created or confirmed');
        // Create stock_financial_data table
        await index_1.db.query(`
      CREATE TABLE IF NOT EXISTS stock_financial_data (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER REFERENCES stocks(id),
        date DATE NOT NULL,
        revenue DECIMAL(20, 2),
        net_income DECIMAL(20, 2),
        eps DECIMAL(10, 2),
        debt_to_equity DECIMAL(10, 2),
        current_ratio DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        logger_1.logger.info('✅ Stock financial data table created or confirmed');
        // Create watchlists table
        await index_1.db.query(`
      CREATE TABLE IF NOT EXISTS watchlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        logger_1.logger.info('✅ Watchlists table created or confirmed');
        // Create watchlist_items table
        await index_1.db.query(`
      CREATE TABLE IF NOT EXISTS watchlist_items (
        id SERIAL PRIMARY KEY,
        watchlist_id INTEGER REFERENCES watchlists(id),
        stock_id INTEGER REFERENCES stocks(id),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(watchlist_id, stock_id)
      )
    `);
        logger_1.logger.info('✅ Watchlist items table created or confirmed');
        logger_1.logger.info('🏁 All database tables initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Error initializing database tables:', error);
        throw error;
    }
}
// Seed initial data for development
async function seedData() {
    try {
        logger_1.logger.info('Seeding initial data...');
        // Check if sectors table is empty
        const sectorCount = await index_1.db.query('SELECT COUNT(*) FROM sectors');
        if (parseInt(sectorCount.rows[0].count) === 0) {
            // Insert sectors
            await index_1.db.query(`
        INSERT INTO sectors (name, description)
        VALUES
        ('Technology', 'Companies involved in research, development, or distribution of technology-based goods and services'),
        ('Financial Services', 'Companies that provide financial services to commercial and retail customers'),
        ('Healthcare', 'Companies that provide medical services, manufacture medical equipment or drugs'),
        ('Consumer Goods', 'Companies that provide goods directly to the consumer'),
        ('Energy', 'Companies involved in the production or supply of energy')
      `);
            logger_1.logger.info('✅ Sectors data seeded');
        }
        // Additional seeding can be added here as needed
        logger_1.logger.info('🏁 Initial data seeded successfully');
    }
    catch (error) {
        logger_1.logger.error('Error seeding data:', error);
        throw error;
    }
}
// Main initialization function
async function initializeDatabase() {
    try {
        await initializeTables();
        // Only seed data in development environment
        if (env_1.default.NODE_ENV === 'development') {
            await seedData();
        }
        logger_1.logger.info('✅ Database initialization completed successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}
// Insert sample data if tables are empty
async function insertSampleData() {
    // For development with mock DB, we'll skip the actual DB initialization
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
        console.log('🛢️ Using mock database, skipping data insertion...');
        return;
    }
    const client = await index_1.default.connect();
    try {
        // Check if users table is empty
        const { rows: userCount } = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount[0].count) === 0) {
            console.log('🌱 Inserting sample user data...');
            // Sample admin user (password: admin123)
            await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ('admin@example.com', '$2b$10$zGw/zhU.HbbQm4EY59lmVe3Itkf1o8Vl.rq/nNWrri9q.F0D3IdAq', 'Admin', 'User', 'admin')
      `);
            // Sample regular user (password: password123)
            await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name)
        VALUES ('user@example.com', '$2b$10$GH1RVyV0ZQwMj/qxdEjMBeYucXqYZ0AQjCMqvvx0XLMh/PN8EpU3O', 'Regular', 'User')
      `);
            console.log('✅ Sample users created');
        }
        // Check if stocks table is empty
        const { rows: stockCount } = await client.query('SELECT COUNT(*) FROM stocks');
        if (parseInt(stockCount[0].count) === 0) {
            console.log('🌱 Inserting sample stock data...');
            // Define sample stocks
            const sampleStocks = [
                {
                    symbol: 'RELIANCE',
                    company_name: 'Reliance Industries Ltd.',
                    sector_name: 'Energy',
                    current_price: 3285.50,
                    price_change_percentage: 1.78,
                    market_cap: '22,47,680 Cr',
                    pe_ratio: 28.4,
                    dividend_yield: 0.72,
                    eps: 115.65,
                    volume: '4.8M',
                    day_high: 3298.75,
                    day_low: 3221.30,
                    year_high: 3450.25,
                    year_low: 2780.15
                },
                {
                    symbol: 'HDFCBANK',
                    company_name: 'HDFC Bank Ltd.',
                    sector_name: 'Financial Services',
                    current_price: 2156.75,
                    price_change_percentage: 0.64,
                    market_cap: '12,08,541 Cr',
                    pe_ratio: 19.8,
                    dividend_yield: 1.05,
                    eps: 108.94,
                    volume: '3.2M',
                    day_high: 2178.50,
                    day_low: 2135.10,
                    year_high: 2245.60,
                    year_low: 1875.45
                },
                {
                    symbol: 'INFY',
                    company_name: 'Infosys Ltd.',
                    sector_name: 'Information Technology',
                    current_price: 1895.30,
                    price_change_percentage: -0.45,
                    market_cap: '7,82,432 Cr',
                    pe_ratio: 24.3,
                    dividend_yield: 2.35,
                    eps: 77.99,
                    volume: '2.7M',
                    day_high: 1915.60,
                    day_low: 1885.20,
                    year_high: 1975.85,
                    year_low: 1580.75
                },
                {
                    symbol: 'TCS',
                    company_name: 'Tata Consultancy Services Ltd.',
                    sector_name: 'Information Technology',
                    current_price: 4325.80,
                    price_change_percentage: 1.12,
                    market_cap: '15,81,694 Cr',
                    pe_ratio: 27.6,
                    dividend_yield: 1.95,
                    eps: 156.73,
                    volume: '1.8M',
                    day_high: 4352.25,
                    day_low: 4275.40,
                    year_high: 4498.60,
                    year_low: 3845.95
                },
                {
                    symbol: 'BHARTIARTL',
                    company_name: 'Bharti Airtel Ltd.',
                    sector_name: 'Telecom',
                    current_price: 1364.45,
                    price_change_percentage: 2.35,
                    market_cap: '7,61,530 Cr',
                    pe_ratio: 32.1,
                    dividend_yield: 0.65,
                    eps: 42.51,
                    volume: '5.1M',
                    day_high: 1375.20,
                    day_low: 1335.75,
                    year_high: 1395.60,
                    year_low: 1165.30
                }
            ];
            // Insert sample stocks
            for (const stock of sampleStocks) {
                await client.query(`
          INSERT INTO stocks (
            symbol, company_name, sector_name, current_price, price_change_percentage, 
            market_cap, pe_ratio, dividend_yield, eps, volume, 
            day_high, day_low, year_high, year_low
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
        `, [
                    stock.symbol,
                    stock.company_name,
                    stock.sector_name,
                    stock.current_price,
                    stock.price_change_percentage,
                    stock.market_cap,
                    stock.pe_ratio,
                    stock.dividend_yield,
                    stock.eps,
                    stock.volume,
                    stock.day_high,
                    stock.day_low,
                    stock.year_high,
                    stock.year_low
                ]);
            }
            console.log('✅ Sample stocks created');
            // Add sample watchlist entries for the regular user
            const { rows: users } = await client.query('SELECT id FROM users WHERE email = $1', ['user@example.com']);
            const { rows: stocks } = await client.query('SELECT id FROM stocks LIMIT 3');
            if (users.length > 0 && stocks.length > 0) {
                const userId = users[0].id;
                for (const stock of stocks) {
                    await client.query(`
            INSERT INTO watchlist (user_id, stock_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, stock_id) DO NOTHING
          `, [userId, stock.id]);
                }
                console.log('✅ Sample watchlist entries created');
            }
        }
    }
    catch (error) {
        console.error('❌ Error inserting sample data:', error);
    }
    finally {
        client.release();
    }
}
// Function to run both initialization steps
async function initDB() {
    try {
        // Set environment variable for mock database in development
        if (process.env.NODE_ENV === 'development') {
            process.env.MOCK_DB = 'true';
            console.log('⚠️ Using mock database for development');
        }
        await initializeDatabase();
        await insertSampleData();
        return true;
    }
    catch (error) {
        console.error('❌ Database setup failed:', error);
        return false;
    }
}
// Direct execution of this file will initialize the database
if (require.main === module) {
    initDB()
        .then(() => {
        console.log('✅ Database setup completed successfully');
        process.exit(0);
    })
        .catch(error => {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    });
}
