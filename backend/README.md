# Indian Stock Analyzer - Backend API

The Indian Stock Analyzer backend provides a REST API that connects to the Indian Stock API service to deliver market data, stock information, and financial analysis to clients.

## Features

- Real-time stock data from Indian markets (NSE and BSE)
- Company financials and key financial ratios
- Historical price data with various time ranges
- Corporate actions and company announcements
- Market indices, trending stocks, and sector performance
- IPO calendar and details
- Financial statements (cash flow, balance sheet, quarterly and yearly results)

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Market Data
- `GET /api/stocks/featured` - Get trending/featured stocks
- `GET /api/stocks/market-overview` - Get market indices and overview
- `GET /api/stocks/news/latest` - Get latest market news
- `GET /api/stocks/ipo/upcoming` - Get upcoming IPO data
- `GET /api/stocks/market/52-week` - Get 52-week high/low data
- `GET /api/stocks/search?query=<search_term>` - Search for stocks

### Stock-specific Data
- `GET /api/stocks/:symbol` - Get detailed stock information
- `GET /api/stocks/:symbol/prices?range=<time_range>` - Get historical price data
  - Supported ranges: 1D, 1W, 1M, 3M, 6M, 1Y, 5Y, MAX
- `GET /api/stocks/:symbol/ratios` - Get key financial ratios
- `GET /api/stocks/:symbol/corporate-actions` - Get corporate actions
- `GET /api/stocks/:symbol/announcements` - Get company announcements
- `GET /api/stocks/:symbol/financials/:statementType` - Get financial statements
  - Supported statement types: cashflow, yoy_results, quarter_results, balancesheet

### User Data (requires authentication)
- `GET /api/stocks/watchlist` - Get user's watchlist
- `POST /api/stocks/watchlist` - Add stock to watchlist
- `DELETE /api/stocks/watchlist/:stockId` - Remove stock from watchlist

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=your_password
   DB_NAME=stock_analyzer
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Testing

You can test the API endpoints using the included test script:

```
node test_api_endpoints.js
```

## Data Sources

This API connects to the Indian Stock API service, which provides comprehensive data for Indian stock markets. The API features multiple fallback mechanisms to ensure reliability, even when certain endpoints are unavailable.

## Technologies Used

- Node.js and Express
- TypeScript
- PostgreSQL for user data
- JWT for authentication
- Axios for API requests

## API Key Rotation System

The application uses an API key rotation system to handle rate limits and ensure continuous API access. The system automatically rotates between multiple API keys when:

1. A key hits its rate limit (HTTP 429 response)
2. A key becomes invalid (HTTP 401 response)
3. The API reports a "Missing API key" error (HTTP 400 response)
4. A key reaches its monthly usage quota (500 requests per month)

### How it works

The API key manager (`services/apiKeyManager.js`) maintains a pool of API keys and automatically selects the next available key when needed. The system:

- Tracks each key's usage count and availability status
- Temporarily disables keys that hit rate limits with appropriate cooldown periods
- Monitors monthly usage quotas for each key
- Provides detailed logging of key rotation events

### Testing the key rotation

You can test the API key rotation using the included test script:

```bash
cd backend
node test-api-keys.js
```

This script makes multiple API calls in succession to verify that the system properly rotates keys when needed.

### API Key Status Endpoint

The system provides a status endpoint to monitor the health of your API keys:

```
GET /api/keys/status
```

This returns information about all keys in the system, including:
- Total number of keys
- Number of available keys
- Number of rate-limited keys
- Number of keys that have reached monthly quotas
- Current active key

### Troubleshooting

If you encounter "Missing API key" errors despite having multiple keys configured:
1. Check the key configuration in `config/api-keys.json`
2. Verify that the keys are correctly formatted
3. Review server logs for key rotation events
4. Add more API keys if all existing keys have reached their rate limits or monthly quotas 