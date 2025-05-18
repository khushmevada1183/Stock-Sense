# Component Migration Guide

This guide provides step-by-step instructions for migrating components from the old API services to the new unified API architecture.

## Migration Process Overview

1. Identify API imports in your component
2. Replace with new API imports
3. Update function calls if necessary
4. Test your component

## Step 1: Identify API Imports

Look for imports like these in your component:

```typescript
// Old imports - these need to be updated
import apiService from '../../services/apiService';
import indianApiService from '../../services/indianApiService';
import { getStockDetails } from '@/services/stockService';
import { stockService } from '@/services/api';
```

## Step 2: Replace with New API Imports

Replace old imports with the new unified API imports:

```typescript
// New imports
import { stocksService, newsService, marketService } from '@/services/api';
```

## Step 3: Update Function Calls

Update function calls to use the new API services:

### Before:

```typescript
// Old API calls
const searchResults = await apiService.searchStocks(query);
const stockDetails = await indianApiService.getStockDetails(symbol);
const portfolios = await stockService.getUserPortfolios(userId);
```

### After:

```typescript
// New API calls
const searchResults = await stocksService.searchStocks(query);
const stockDetails = await stocksService.getStockDetails(symbol);
const portfolios = await portfolioService.getUserPortfolios(userId);
```

## Common Migration Patterns

### Stock Search

#### Before:
```typescript
import apiService from '../../services/apiService';

// In component
const handleSearch = async (query: string) => {
  const { results } = await apiService.searchStocks(query);
  setSearchResults(results);
};
```

#### After:
```typescript
import { stocksService } from '@/services/api';

// In component
const handleSearch = async (query: string) => {
  const { results } = await stocksService.searchStocks(query);
  setSearchResults(results);
};
```

### Stock Details

#### Before:
```typescript
import { getStockDetails, getHistoricalData } from '@/services/stockService';

// In component
useEffect(() => {
  const fetchData = async () => {
    const details = await getStockDetails(symbol);
    const history = await getHistoricalData(symbol, '1yr');
    setStockData({ details, history });
  };
  fetchData();
}, [symbol]);
```

#### After:
```typescript
import { stocksService } from '@/services/api';

// In component
useEffect(() => {
  const fetchData = async () => {
    const details = await stocksService.getStockDetails(symbol);
    const history = await stocksService.getHistoricalData(symbol, '1yr');
    setStockData({ details, history });
  };
  fetchData();
}, [symbol]);
```

### Market Data

#### Before:
```typescript
import indianApiService from '../../services/indianApiService';

// In component
const fetchMarketData = async () => {
  const gainers = await indianApiService.getBSEMostActiveStocks();
  const losers = await indianApiService.getNSEMostActiveStocks();
  setMarketData({ gainers, losers });
};
```

#### After:
```typescript
import { marketService } from '@/services/api';

// In component
const fetchMarketData = async () => {
  const gainers = await marketService.getTopGainers('BSE');
  const losers = await marketService.getTopLosers('NSE');
  setMarketData({ gainers, losers });
};
```

### News

#### Before:
```typescript
import { getMarketNews } from '@/services/stockService';

// In component
useEffect(() => {
  const fetchNews = async () => {
    const news = await getMarketNews();
    setNewsItems(news);
  };
  fetchNews();
}, []);
```

#### After:
```typescript
import { newsService } from '@/services/api';

// In component
useEffect(() => {
  const fetchNews = async () => {
    const news = await newsService.getLatestNews();
    setNewsItems(news);
  };
  fetchNews();
}, []);
```

## Function Mapping Reference

| Old Function | New Function |
|-------------|--------------|
| `apiService.searchStocks(query)` | `stocksService.searchStocks(query)` |
| `apiService.getStockDetails(symbol)` | `stocksService.getStockDetails(symbol)` |
| `apiService.getHistoricalData(symbol, period)` | `stocksService.getHistoricalData(symbol, period)` |
| `apiService.getIpoData()` | `ipoService.getUpcomingIpos()` |
| `apiService.getMarketNews()` | `newsService.getLatestNews()` |
| `apiService.getTopGainers()` | `marketService.getTopGainers()` |
| `apiService.getTopLosers()` | `marketService.getTopLosers()` |
| `apiService.getFeaturedStocks()` | `stocksService.getFeaturedStocks()` |
| `indianApiService.getIPOData()` | `ipoService.getUpcomingIpos()` |
| `indianApiService.getNewsData()` | `newsService.getLatestNews()` |
| `indianApiService.getStockDetails(symbol)` | `stocksService.getStockDetails(symbol)` |
| `indianApiService.getTrendingStocks()` | `stocksService.getTrendingStocks()` |
| `indianApiService.getCommoditiesData()` | `marketService.getCommodities()` |
| `indianApiService.getMutualFundsData()` | `marketService.getMutualFunds()` |
| `stockService.getUserPortfolios(userId)` | `portfolioService.getUserPortfolios(userId)` |
| `stockService.createPortfolio(data)` | `portfolioService.createPortfolio(data)` |
| `stockService.updatePortfolio(id, data)` | `portfolioService.updatePortfolio(id, data)` |
| `stockService.deletePortfolio(id)` | `portfolioService.deletePortfolio(id)` |
| `stockService.get52WeekHighLow()` | `marketService.get52WeekHighLow()` |
| `stockService.getCompanyLogo(symbol)` | `stocksService.getCompanyLogo(symbol)` |
| `stockService.getStockTargetPrice(symbol)` | `stocksService.getTargetPrice(symbol)` |

## Testing Your Migration

After migrating your component:

1. Run unit tests for the component
2. Test the component in the browser
3. Verify all functionality works as expected
4. Check the browser console for any errors or warnings

## Common Issues and Solutions

### Issue: Function not found in new API
**Solution**: Check the function mapping reference above. Some functions have been renamed for consistency.

### Issue: Different return type
**Solution**: The new API may return slightly different data structures. Check the type definitions in `services/api/types.ts`.

### Issue: Missing functionality
**Solution**: If you can't find a function in the new API, check if it has been moved to a different service or renamed. If it's truly missing, report it to the API team.

## Getting Help

If you encounter issues during migration:

1. Check the API documentation in `services/api/README.md`
2. Look at the implementation in `services/api/services/`
3. Contact the API team for assistance 