# Indian Stock Market API Usage Guide

This guide provides instructions on how to use the Indian Stock Market API from IndianAPI using Axios in your JavaScript project. The API provides access to financial data for companies listed on the Bombay Stock Exchange (BSE) and National Stock Exchange (NSE). Below are all 20 GET endpoints as specified in the OpenAPI schema, with corresponding Axios commands. Ensure you have an API key rotation system in place to manage your API key securely.

## Prerequisites
- Install Axios in your project:
  ```bash
  npm install axios
  ```
- Import Axios in your JavaScript file:
  ```javascript
  import axios from 'axios';
  ```

## Base URL
```
https://stock.indianapi.in
```

## Authentication
Include the API key in the `X-Api-Key` header for all requests. Your API key rotation system should handle this automatically.

## Endpoints

### 1. Fetch IPO Data
Retrieve data related to Initial Public Offerings (IPOs).

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/ipo',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 2. Fetch News Data
Access the latest news articles related to Indian companies and markets.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/news',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 3. Fetch Stock Details
Retrieve stock data for a specific company.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/stock',
  params: { name: 'Tata Steel' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 4. Fetch Trending Stocks
Retrieve data on trending stocks.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/trending',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 5. Fetch Financial Statements
Get financial statements for a specific stock.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/statement',
  params: { stock_name: 'YOUR_STOCK_NAME', stats: 'YOUR_STATS' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 6. Fetch Commodities Data
Retrieve data related to commodities.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/commodities',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 7. Fetch Mutual Funds Data
Retrieve data on mutual funds.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/mutual_funds',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 8. Fetch Price Shockers Data
Retrieve data on stocks experiencing significant price movements.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/price_shockers',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 9. Fetch BSE Most Active Stocks
Retrieve data on the most active stocks on the Bombay Stock Exchange (BSE).

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/BSE_most_active',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 10. Fetch NSE Most Active Stocks
Retrieve data on the most active stocks on the National Stock Exchange (NSE).

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/NSE_most_active',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 11. Fetch Historical Data
Access historical stock data for a specific company.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/historical_data',
  params: { 
    stock_name: 'YOUR_STOCK_NAME', 
    period: '1m', // Options: 1m, 6m, 1yr, 3yr, 5yr, 10yr, max
    filter: 'default' // Options: default, price, pe, sm, evebitda, ptb, mcs
  },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 12. Industry Search
Search for industries based on a query.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/industry_search',
  params: { query: 'YOUR_QUERY' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 13. Fetch Stock Forecasts
Retrieve stock forecast data based on specific parameters.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/stock_forecasts',
  params: {
    stock_id: 'YOUR_STOCK_ID',
    measure_code: 'EPS', // Options: EPS, CPS, CPX, DPS, EBI, EBT, GPS, GRM, NAV, NDT, NET, PRE, ROA, ROE, SAL
    period_type: 'Annual', // Options: Annual, Interim
    data_type: 'Actuals', // Options: Actuals, Estimates
    age: 'Current' // Options: OneWeekAgo, ThirtyDaysAgo, SixtyDaysAgo, NinetyDaysAgo, Current
  },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 14. Fetch Historical Stats
Retrieve historical statistics for a specific stock.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/historical_stats',
  params: { stock_name: 'YOUR_STOCK_NAME', stats: 'YOUR_STATS' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 15. Fetch Corporate Actions
Get data on corporate actions like dividends, stock splits, etc.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/corporate_actions',
  params: { stock_name: 'YOUR_STOCK_NAME' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 16. Mutual Fund Search
Search for mutual funds based on a query.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/mutual_fund_search',
  params: { query: 'YOUR_QUERY' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 17. Fetch Stock Target Price
Get the target price for a specific stock.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/stock_target_price',
  params: { stock_id: 'YOUR_STOCK_ID' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 18. Fetch Mutual Fund Details
Retrieve details for a specific mutual fund.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/mutual_funds_details',
  params: { stock_name: 'YOUR_STOCK_NAME' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 19. Fetch Recent Announcements
Access recent announcements for a specific stock.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/recent_announcements',
 Scottish
  params: { stock_name: 'YOUR_STOCK_NAME' },
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 20. Fetch 52-Week High/Low Data
Retrieve 52-week high and low data for stocks.

```javascript
const options = {
  method: 'GET',
  url: 'https://stock.indianapi.in/fetch_52_week_high_low_data',
  headers: {'X-Api-Key': 'YOUR_API_KEY'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
```

## Error Handling
- **200**: Successful response.
- **422**: Validation error (check query parameters).
Ensure proper error handling in your application as shown in the examples.

## Usage Limits
Monitor your API usage to stay within rate limits. Your API key rotation system should account for these limits.

## Additional Notes
- Replace placeholders like `YOUR_STOCK_NAME`, `YOUR_STATS`, `YOUR_QUERY`, `YOUR_STOCK_ID` with actual values.
- Parameter options for `/historical_data`, `/stock_forecasts`, and other endpoints are listed as per the OpenAPI schema (e.g., `period`, `measure_code`).
- Refer to the official documentation at [https://indianapi.in/indian-stock-market](https://indianapi.in/indian-stock-market) for more details.
- The API supports client libraries in multiple languages (Shell, Ruby, Node.js, PHP, Python), but this guide focuses on JavaScript with Axios.