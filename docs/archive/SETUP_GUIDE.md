# Indian Stock Analyzer - Setup Guide

## Project Structure

The application now has the following structure:

```
stock-analyzer/
├── run.js           # Main unified runner script
├── run.bat          # Windows batch script (run with double-click)
├── run.sh           # Unix/Linux/Mac shell script (run with ./run.sh)
├── package.json     # Root package with unified scripts
├── README.md        # General instructions
├── backend/         # JavaScript/TypeScript backend
└── frontend/        # Next.js frontend
```

## Explanation of Unified Setup

We've simplified the application startup process with a unified approach that:

1. **Eliminates confusion** - No more wondering which server implementation to use
2. **Simplifies commands** - One command to run everything
3. **Provides clear output** - Color-coded console output separates frontend and backend logs
4. **Properly configures API ports** - Makes sure frontend talks to the proper backend port (5001)

## Database Setup (New)

This application now uses PostgreSQL for data storage. Follow these steps to set up the database:

### 1. Install PostgreSQL

#### Windows:
- Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)
- During installation, set a password for the "postgres" user
- The default port is 5432

#### Mac:
- Install using Homebrew: `brew install postgresql`
- Start service: `brew services start postgresql`

#### Linux:
- Use your distribution's package manager, e.g., `sudo apt install postgresql postgresql-contrib`

### 2. Setup the Database

You can use our automatic database setup script:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies if you haven't already
npm install

# Run the setup script
node src/db/setup-db.js
```

Or manually:

```bash
# Log into PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE stock_analyzer;

# Connect to the database
\c stock_analyzer

# Run the schema script
\i src/db/schema.sql

# Exit PostgreSQL
\q
```

### 3. Configure Database Connection

Update the database connection settings in the `.env.local` file in the backend directory:

```
PGUSER=postgres
PGHOST=localhost
PGDATABASE=stock_analyzer
PGPASSWORD=your_password
PGPORT=5432
```

## Running the Application

### For Windows Users:

1. Navigate to your project folder
2. Double-click the `run.bat` file
   - Or open a command prompt and run `npm start`

### For Mac/Linux Users:

1. Navigate to your project folder in the terminal
2. Run `./run.sh`
   - Or run `npm start`

### Understanding Backend Implementations

This application has two backend server implementations:

1. **JavaScript Server (server.js)**
   - Located in: `/backend/server.js`
   - Runs on: Port 5001
   - Status: This is the MAIN server implementation with ALL required endpoints

2. **TypeScript Server (src/server.ts)**
   - Located in: `/backend/src/server.ts`
   - Runs on: Port 5000
   - Status: Secondary implementation, might not have all endpoints

Our unified setup uses the JavaScript server (server.js) because it has all the required endpoints, including:
- `/api/ipo` for IPO data
- `/api/market-indices` for market indices
- `/api/stocks/top-gainers` for top gaining stocks
- `/api/stocks/top-losers` for top losing stocks

## Available NPM Scripts (at root level)

```bash
# Start everything (backend + frontend)
npm start

# Start only the backend
npm run backend

# Start only the frontend
npm run frontend

# Install dependencies for all parts of the application
npm run install:all

# Build the frontend for production
npm run build
```

## Common Issues

1. **"Cannot connect to API" error**:
   - This usually means the frontend is trying to connect to port 5000, but the JavaScript server runs on port 5001
   - Solution: Use our unified script which uses the correct port

2. **TypeErrors in frontend components**:
   - These occur when frontend components expect data in a specific format
   - Solution: Our JavaScript server formats the data properly for all components

3. **Page shows "loading" indefinitely**:
   - This happens when an API endpoint is missing or returning the wrong format
   - Solution: Use the JavaScript server which implements all required endpoints

## Advanced: Adding New Features

If you need to add new features:

1. For frontend changes:
   - Implement in the Next.js frontend
   - Make API calls to port 5001

2. For backend changes:
   - Implement in BOTH server.js AND src/server.ts to keep them in sync
   - Test with the unified script to ensure everything works 