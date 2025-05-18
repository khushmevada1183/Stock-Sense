# API Refactoring Testing Strategy

This document outlines the testing strategy for the API service refactoring to ensure a smooth transition and maintain application stability.

## Testing Goals

1. Verify that the new API services work correctly
2. Ensure backward compatibility during migration
3. Prevent regressions in existing functionality
4. Validate error handling and edge cases

## Testing Levels

### 1. Unit Tests

Unit tests will focus on testing individual functions and classes in isolation.

#### API Client Tests

- Test HTTP request methods (get, post, put, delete)
- Test caching mechanism
- Test error handling
- Test retry logic
- Test API key rotation

```typescript
// Example unit test for API client
describe('ApiClient', () => {
  let client: ApiClient;
  let mockAxios: jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    mockAxios = axios as jest.Mocked<typeof axios>;
    mockAxios.create.mockReturnValue(mockAxios);
    client = new ApiClient({
      baseURL: 'https://test-api.com',
      apiKey: 'test-key'
    });
  });
  
  test('get method should return data from API', async () => {
    const mockData = { data: { result: 'success' } };
    mockAxios.get.mockResolvedValueOnce({ data: mockData });
    
    const result = await client.get('/test');
    
    expect(mockAxios.get).toHaveBeenCalledWith('/test', expect.any(Object));
    expect(result).toEqual(mockData.data);
  });
  
  test('should cache responses', async () => {
    const mockData = { data: { result: 'success' } };
    mockAxios.get.mockResolvedValueOnce({ data: mockData });
    
    // First call should make an API request
    await client.get('/test');
    
    // Second call should use cache
    await client.get('/test');
    
    // Axios get should only be called once
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });
});
```

#### Service Module Tests

- Test service functions with mocked API client
- Test data normalization
- Test fallback logic between APIs

```typescript
// Example unit test for stocks service
describe('stocksService', () => {
  let mockApiClient: jest.Mocked<ApiClient>;
  
  beforeEach(() => {
    // Mock the API client factory functions
    jest.mock('../api', () => ({
      getApiClient: jest.fn().mockReturnValue(mockApiClient),
      getIndianApiClient: jest.fn().mockReturnValue(mockApiClient)
    }));
    
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      clearCache: jest.fn(),
      clearCacheItem: jest.fn(),
      setApiKey: jest.fn()
    } as unknown as jest.Mocked<ApiClient>;
  });
  
  test('searchStocks should return formatted results', async () => {
    const mockResults = { results: [{ symbol: 'AAPL', name: 'Apple Inc' }] };
    mockApiClient.get.mockResolvedValueOnce(mockResults);
    
    const results = await stocksService.searchStocks('apple');
    
    expect(mockApiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/search'),
      { query: 'apple' },
      expect.any(Object),
      expect.any(Number)
    );
    expect(results).toEqual(mockResults);
  });
});
```

#### Compatibility Layer Tests

- Test that old API calls are correctly mapped to new ones
- Test deprecation warnings

```typescript
// Example unit test for compatibility layer
describe('apiService compatibility', () => {
  let mockStocksService: any;
  
  beforeEach(() => {
    mockStocksService = {
      searchStocks: jest.fn(),
      getStockDetails: jest.fn()
    };
    
    jest.mock('../api', () => ({
      stocksService: mockStocksService
    }));
  });
  
  test('searchStocks should call new API', async () => {
    const mockResults = { results: [] };
    mockStocksService.searchStocks.mockResolvedValueOnce(mockResults);
    
    const apiService = require('../compat/apiService').default;
    const results = await apiService.searchStocks('test');
    
    expect(mockStocksService.searchStocks).toHaveBeenCalledWith('test');
    expect(results).toEqual(mockResults);
  });
});
```

### 2. Integration Tests

Integration tests will verify that different parts of the system work together correctly.

#### API Integration Tests

- Test API client with mock server
- Test service modules with real API client
- Test error scenarios and retries

```typescript
// Example integration test
describe('API Integration', () => {
  let mockServer: any;
  
  beforeAll(() => {
    mockServer = setupMockServer();
    mockServer.start();
  });
  
  afterAll(() => {
    mockServer.stop();
  });
  
  test('stocksService should fetch stock details', async () => {
    mockServer.addRoute('/stock/AAPL', 'GET', {
      symbol: 'AAPL',
      name: 'Apple Inc',
      price: 150.25
    });
    
    const details = await stocksService.getStockDetails('AAPL');
    
    expect(details.symbol).toBe('AAPL');
    expect(details.name).toBe('Apple Inc');
    expect(details.price).toBe(150.25);
  });
});
```

#### Component Integration Tests

- Test components with the new API services
- Test components with the compatibility layer

```typescript
// Example component integration test
describe('StockSearch component', () => {
  test('should display search results', async () => {
    // Mock the API response
    jest.spyOn(stocksService, 'searchStocks').mockResolvedValueOnce({
      results: [
        { symbol: 'AAPL', companyName: 'Apple Inc' },
        { symbol: 'MSFT', companyName: 'Microsoft Corporation' }
      ]
    });
    
    // Render the component
    render(<StockSearch />);
    
    // Type in the search box
    fireEvent.change(screen.getByPlaceholderText('Search stocks...'), {
      target: { value: 'app' }
    });
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
    });
  });
});
```

### 3. End-to-End Tests

E2E tests will verify that the entire application works correctly with the new API services.

```typescript
// Example E2E test with Cypress
describe('Stock Search Feature', () => {
  it('should search for stocks and display results', () => {
    cy.visit('/');
    cy.get('[data-testid="search-input"]').type('apple');
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="search-results"]').should('be.visible');
    cy.get('[data-testid="stock-item"]').should('have.length.at.least', 1);
    cy.contains('Apple Inc').should('be.visible');
  });
});
```

## Testing Process

### 1. Pre-Refactoring Tests

Before starting the refactoring, create a baseline of tests for existing functionality:

- Document current API behavior
- Create tests for critical paths
- Measure performance benchmarks

### 2. During Refactoring Tests

During the refactoring process:

- Write unit tests for each new component
- Test compatibility layer thoroughly
- Run regression tests frequently

### 3. Post-Refactoring Tests

After completing the refactoring:

- Run full test suite
- Compare performance metrics
- Verify all components work with new API
- Test edge cases and error scenarios

## Test Coverage Goals

Aim for the following test coverage:

- **Core API Client**: 90%+ coverage
- **Service Modules**: 80%+ coverage
- **Compatibility Layer**: 90%+ coverage
- **Component Integration**: Key components tested

## Automated Testing

Set up automated testing in the CI/CD pipeline:

1. Run unit tests on every commit
2. Run integration tests on pull requests
3. Run E2E tests before deployment

## Manual Testing Checklist

For critical features, perform manual testing:

- [ ] Search functionality
- [ ] Stock details page
- [ ] Historical data charts
- [ ] Market news
- [ ] IPO information
- [ ] Portfolio management

## Error Scenario Testing

Test the following error scenarios:

- Network failures
- API rate limiting
- Invalid responses
- Authentication failures
- Timeout handling

## Performance Testing

Compare performance metrics before and after refactoring:

- API response times
- Component render times
- Memory usage
- Network request count

## Monitoring During Rollout

During the rollout of the refactored API:

- Monitor error rates
- Track API call performance
- Watch for unexpected behavior
- Be prepared to roll back if necessary

## Tools and Libraries

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: MSW (Mock Service Worker)
- **E2E Testing**: Cypress
- **Performance Testing**: Lighthouse, React Profiler
- **API Mocking**: MSW, Mirage JS 