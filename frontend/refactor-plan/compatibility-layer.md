# API Compatibility Layer Implementation

This document outlines the implementation of a compatibility layer to ensure smooth migration from the old API services to the new unified API architecture.

## Purpose

The compatibility layer will:
1. Maintain backward compatibility with existing components
2. Allow gradual migration without breaking changes
3. Provide a clear path for transitioning to the new API

## Implementation Strategy

### 1. Create Adapter Modules

Create adapter modules that mirror the interfaces of the old API services but use the new API implementation internally:

```
services/
  compat/
    apiService.ts       # Compatible with old apiService.ts
    indianApiService.ts # Compatible with old indianApiService.ts
    stockApiService.js  # Compatible with old stockApiService.js
    stockService.js     # Compatible with old stockService.js
    api.js              # Compatible with old api.js
```

### 2. Implementation Approach

For each legacy API service:

1. **Create a compatibility module** with the same name and export pattern
2. **Import the new API services** internally
3. **Map old function signatures** to new API calls
4. **Preserve return types** and error handling patterns

### 3. Example Implementation

#### Original `apiService.ts`:
```typescript
export default {
  async searchStocks(query: string): Promise<{ results: SearchResult[] }> {
    // Original implementation
  },
  async getStockDetails(symbol: string): Promise<StockDetails> {
    // Original implementation
  }
}
```

#### Compatibility `apiService.ts`:
```typescript
import { stocksService } from '../api';
import type { SearchResult, StockDetails } from '../api/types';

// Create compatibility layer that matches the original interface
const apiService = {
  async searchStocks(query: string): Promise<{ results: SearchResult[] }> {
    // Call new API implementation
    return stocksService.searchStocks(query);
  },
  async getStockDetails(symbol: string): Promise<StockDetails> {
    // Call new API implementation
    return stocksService.getStockDetails(symbol);
  }
};

export default apiService;
export type { SearchResult, StockDetails };
```

### 4. Function Mapping

Below is a mapping of legacy functions to their new counterparts:

| Legacy Service | Legacy Function | New Service | New Function |
|----------------|----------------|-------------|--------------|
| apiService | searchStocks | stocksService | searchStocks |
| apiService | getStockDetails | stocksService | getStockDetails |
| apiService | getHistoricalData | stocksService | getHistoricalData |
| apiService | getIpoData | ipoService | getUpcomingIpos |
| apiService | getMarketNews | newsService | getLatestNews |
| apiService | getTopGainers | marketService | getTopGainers |
| apiService | getTopLosers | marketService | getTopLosers |
| apiService | getFeaturedStocks | stocksService | getFeaturedStocks |
| indianApiService | getIPOData | ipoService | getUpcomingIpos |
| indianApiService | getNewsData | newsService | getLatestNews |
| indianApiService | getStockDetails | stocksService | getStockDetails |
| indianApiService | getTrendingStocks | stocksService | getTrendingStocks |
| indianApiService | getCommoditiesData | marketService | getCommodities |
| stockService | getUserPortfolios | portfolioService | getUserPortfolios |
| stockService | createPortfolio | portfolioService | createPortfolio |
| stockService | updatePortfolio | portfolioService | updatePortfolio |
| stockService | deletePortfolio | portfolioService | deletePortfolio |
| stockService | get52WeekHighLow | marketService | get52WeekHighLow |
| stockService | getCompanyLogo | stocksService | getCompanyLogo |

### 5. Deprecation Strategy

1. **Add Deprecation Warnings**:
   ```typescript
   const apiService = {
     async searchStocks(query: string): Promise<{ results: SearchResult[] }> {
       console.warn('Warning: apiService.searchStocks is deprecated. Use stocksService.searchStocks instead.');
       return stocksService.searchStocks(query);
     }
   };
   ```

2. **Documentation**:
   - Add JSDoc comments with `@deprecated` tags
   - Provide migration examples

3. **Monitoring**:
   - Track usage of deprecated functions
   - Use this data to prioritize component migration

## Migration Process

### Phase 1: Deploy Compatibility Layer

1. Implement compatibility modules
2. Test thoroughly with existing components
3. Deploy alongside new API implementation

### Phase 2: Component Migration

1. Identify components using old API services
2. Update import statements to use new API
3. Update function calls if necessary
4. Test components after migration

### Phase 3: Removal

1. After all components are migrated, mark compatibility layer as deprecated
2. Set timeline for removal
3. Remove compatibility layer after timeline expires

## Testing

1. **Unit Tests**:
   - Test each compatibility function
   - Ensure it correctly maps to new API

2. **Integration Tests**:
   - Test with actual components
   - Verify backward compatibility

3. **Regression Tests**:
   - Run existing tests with compatibility layer
   - Ensure no regressions 