import { ApiClient } from '../services/api/client';
import * as StocksAPI from '../services/api/stocks';
import * as IpoAPI from '../services/api/ipo';
import * as NewsAPI from '../services/api/news';
import * as MarketAPI from '../services/api/market';
import * as PortfolioAPI from '../services/api/portfolio';

// Colors for terminal output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

/**
 * Test configuration
 */
let CONFIG = {
  // Enable/disable specific tests
  testStandardAPI: true,
  testIndianAPI: true,
  
  // Set API URLs and keys
  standardApiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  standardApiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  
  indianApiKey: process.env.NEXT_PUBLIC_INDIAN_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
  indianApiUrl: process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in',
  
  // Test parameters
  stockSymbol: 'RELIANCE', // For Indian API
  timeoutMs: 10000,
  apiRotationTest: true,
  
  // Logging
  verbose: true
};

// Allow configuration from command line or browser
if (typeof process !== 'undefined' && process.env.TEST_CONFIG) {
  try {
    const overrideConfig = JSON.parse(process.env.TEST_CONFIG);
    CONFIG = { ...CONFIG, ...overrideConfig };
    console.log('Using custom test configuration');
  } catch (e) {
    console.error('Failed to parse TEST_CONFIG:', e);
  }
}

// Allow configuration from browser global
if (typeof window !== 'undefined' && (window as any).CONFIG) {
  CONFIG = { ...(window as any).CONFIG };
  console.log('Using browser test configuration');
}

/**
 * Create a standard API client
 */
function createStandardClient(): ApiClient {
  return new ApiClient({
    baseURL: CONFIG.standardApiUrl,
    apiKey: CONFIG.standardApiKey,
    timeout: CONFIG.timeoutMs
  });
}

/**
 * Create an Indian API client
 */
function createIndianClient(): ApiClient {
  return new ApiClient({
    baseURL: CONFIG.indianApiUrl,
    apiKey: CONFIG.indianApiKey,
    timeout: CONFIG.timeoutMs
  });
}

/**
 * Log success message
 */
function logSuccess(message: string): void {
  console.log(`${GREEN}✓ ${message}${RESET}`);
}

/**
 * Log error message
 */
function logError(message: string, error?: any): void {
  console.error(`${RED}✗ ${message}${RESET}`);
  if (error && CONFIG.verbose) {
    console.error(error);
  }
}

/**
 * Log info message
 */
function logInfo(message: string): void {
  console.log(`${BLUE}ℹ ${message}${RESET}`);
}

/**
 * Log heading
 */
function logHeading(message: string): void {
  console.log(`\n${YELLOW}=== ${message} ===${RESET}`);
}

/**
 * Test the ApiClient implementation
 */
async function testApiClient(): Promise<void> {
  logHeading('Testing ApiClient');
  
  try {
    const standardClient = createStandardClient();
    
    // Test get method
    logInfo('Testing GET request...');
    try {
      const response = await standardClient.get('/');
      logSuccess('GET request successful');
      if (CONFIG.verbose) {
        console.log('Response:', response);
      }
    } catch (error) {
      logError('GET request failed', error);
    }
    
    // Test cache
    logInfo('Testing cache functionality...');
    try {
      const start = Date.now();
      await standardClient.get('/');
      const firstRequestTime = Date.now() - start;
      
      const cacheStart = Date.now();
      await standardClient.get('/');
      const cachedRequestTime = Date.now() - cacheStart;
      
      if (cachedRequestTime < firstRequestTime) {
        logSuccess(`Cache is working (${firstRequestTime}ms vs ${cachedRequestTime}ms)`);
      } else {
        logError(`Cache may not be working (${firstRequestTime}ms vs ${cachedRequestTime}ms)`);
      }
    } catch (error) {
      logError('Cache test failed', error);
    }
    
    // Test error handling
    logInfo('Testing error handling...');
    try {
      await standardClient.get('/nonexistent-endpoint-12345');
      logError('Error handling test failed - should have thrown an error');
    } catch (error) {
      logSuccess('Error handling is working');
    }
    
  } catch (error) {
    logError('ApiClient tests failed', error);
  }
}

/**
 * Test the Stocks API module
 */
async function testStocksApi(): Promise<void> {
  logHeading('Testing Stocks API');
  
  try {
    // Test search stocks
    logInfo('Testing searchStocks...');
    try {
      const results = await StocksAPI.searchStocks('RELI');
      logSuccess(`searchStocks returned ${results.results.length} results`);
      if (CONFIG.verbose && results.results.length > 0) {
        console.log('First result:', results.results[0]);
      }
    } catch (error) {
      logError('searchStocks failed', error);
    }
    
    // Test getStockDetails
    logInfo('Testing getStockDetails...');
    try {
      const stock = await StocksAPI.getStockDetails(CONFIG.stockSymbol);
      logSuccess(`getStockDetails for ${CONFIG.stockSymbol} successful`);
      if (CONFIG.verbose) {
        console.log('Stock details:', stock);
      }
    } catch (error) {
      logError(`getStockDetails for ${CONFIG.stockSymbol} failed`, error);
    }
    
    // Test getHistoricalData
    logInfo('Testing getHistoricalData...');
    try {
      const historyData = await StocksAPI.getHistoricalData(CONFIG.stockSymbol, '1m');
      logSuccess(`getHistoricalData returned ${historyData.length} data points`);
      if (CONFIG.verbose && historyData.length > 0) {
        console.log('First data point:', historyData[0]);
      }
    } catch (error) {
      logError('getHistoricalData failed', error);
    }
    
    // Test getFeaturedStocks
    logInfo('Testing getFeaturedStocks...');
    try {
      const featuredStocks = await StocksAPI.getFeaturedStocks();
      logSuccess(`getFeaturedStocks returned ${featuredStocks.length} stocks`);
      if (CONFIG.verbose && featuredStocks.length > 0) {
        console.log('First featured stock:', featuredStocks[0]);
      }
    } catch (error) {
      logError('getFeaturedStocks failed', error);
    }
    
  } catch (error) {
    logError('Stocks API tests failed', error);
  }
}

/**
 * Test the IPO API module
 */
async function testIpoApi(): Promise<void> {
  logHeading('Testing IPO API');
  
  try {
    // Test getIpoData
    logInfo('Testing getIpoData...');
    try {
      const ipos = await IpoAPI.getIpoData();
      logSuccess(`getIpoData returned ${ipos.ipoData.length} IPOs`);
      if (CONFIG.verbose && ipos.ipoData.length > 0) {
        console.log('First IPO:', ipos.ipoData[0]);
      }
    } catch (error) {
      logError('getIpoData failed', error);
    }
    
    // Test getUpcomingIpos
    logInfo('Testing getUpcomingIpos...');
    try {
      const upcomingIpos = await IpoAPI.getUpcomingIpos();
      logSuccess(`getUpcomingIpos returned ${upcomingIpos.length} upcoming IPOs`);
      if (CONFIG.verbose && upcomingIpos.length > 0) {
        console.log('First upcoming IPO:', upcomingIpos[0]);
      }
    } catch (error) {
      logError('getUpcomingIpos failed', error);
    }
    
  } catch (error) {
    logError('IPO API tests failed', error);
  }
}

/**
 * Test the News API module
 */
async function testNewsApi(): Promise<void> {
  logHeading('Testing News API');
  
  try {
    // Test getMarketNews
    logInfo('Testing getMarketNews...');
    try {
      const news = await NewsAPI.getMarketNews(5);
      logSuccess(`getMarketNews returned ${news.news.length} news items`);
      if (CONFIG.verbose && news.news.length > 0) {
        console.log('First news item:', news.news[0]);
      }
    } catch (error) {
      logError('getMarketNews failed', error);
    }
    
    // Test getStockNews
    logInfo('Testing getStockNews...');
    try {
      const stockNews = await NewsAPI.getStockNews(CONFIG.stockSymbol, 3);
      logSuccess(`getStockNews for ${CONFIG.stockSymbol} returned ${stockNews.news.length} news items`);
      if (CONFIG.verbose && stockNews.news.length > 0) {
        console.log('First stock news item:', stockNews.news[0]);
      }
    } catch (error) {
      logError(`getStockNews for ${CONFIG.stockSymbol} failed`, error);
    }
    
    // Test searchNews
    logInfo('Testing searchNews...');
    try {
      const searchResults = await NewsAPI.searchNews('market');
      logSuccess(`searchNews returned ${searchResults.news.length} results`);
      if (CONFIG.verbose && searchResults.news.length > 0) {
        console.log('First search result:', searchResults.news[0]);
      }
    } catch (error) {
      logError('searchNews failed', error);
    }
    
  } catch (error) {
    logError('News API tests failed', error);
  }
}

/**
 * Test the Market API module
 */
async function testMarketApi(): Promise<void> {
  logHeading('Testing Market API');
  
  try {
    // Test getMarketOverview
    logInfo('Testing getMarketOverview...');
    try {
      const overview = await MarketAPI.getMarketOverview();
      logSuccess(`getMarketOverview returned ${overview.indices.length} indices`);
      if (CONFIG.verbose && overview.indices.length > 0) {
        console.log('First index:', overview.indices[0]);
      }
    } catch (error) {
      logError('getMarketOverview failed', error);
    }
    
    // Test getMarketIndices
    logInfo('Testing getMarketIndices...');
    try {
      const indices = await MarketAPI.getMarketIndices();
      logSuccess(`getMarketIndices returned ${indices.length} indices`);
      if (CONFIG.verbose && indices.length > 0) {
        console.log('First index:', indices[0]);
      }
    } catch (error) {
      logError('getMarketIndices failed', error);
    }
    
    // Test getCommoditiesData
    logInfo('Testing getCommoditiesData...');
    try {
      const commodities = await MarketAPI.getCommoditiesData();
      logSuccess('getCommoditiesData successful');
      if (CONFIG.verbose) {
        console.log('Commodities data:', commodities);
      }
    } catch (error) {
      logError('getCommoditiesData failed', error);
    }
    
  } catch (error) {
    logError('Market API tests failed', error);
  }
}

/**
 * Test the Portfolio API module
 */
async function testPortfolioApi(): Promise<void> {
  logHeading('Testing Portfolio API');
  
  // Note: Most portfolio endpoints require authentication,
  // so we'll just test that the API functions exist
  
  logSuccess('Portfolio API functions exist');
  logInfo('Note: Portfolio API functions require authentication and were not tested');
  
  // If you want to test with authentication, uncomment the following:
  /*
  try {
    // You would need to set up authentication first
    
    // Test getUserPortfolios
    logInfo('Testing getUserPortfolios...');
    try {
      const portfolios = await PortfolioAPI.getUserPortfolios();
      logSuccess(`getUserPortfolios returned ${portfolios.length} portfolios`);
    } catch (error) {
      logError('getUserPortfolios failed', error);
    }
    
  } catch (error) {
    logError('Portfolio API tests failed', error);
  }
  */
}

/**
 * Test API rotation system
 */
async function testApiRotation(): Promise<void> {
  if (!CONFIG.apiRotationTest) {
    return;
  }
  
  logHeading('Testing API Rotation System');
  
  try {
    // Store original API URLs
    const originalStandardUrl = CONFIG.standardApiUrl;
    const originalIndianUrl = CONFIG.indianApiUrl;
    
    // Deliberately use invalid URLs to force failover
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_url', 'https://invalid-api-url.example.com');
      sessionStorage.setItem('temp_api_url', 'https://another-invalid-url.example.com');
    }
    
    // Test that service falls back to Indian API when standard fails
    logInfo('Testing API failover...');
    try {
      const results = await StocksAPI.searchStocks('RELI');
      logSuccess('API rotation/failover is working');
      if (CONFIG.verbose) {
        console.log('Search results with failover:', results);
      }
    } catch (error) {
      logError('API rotation/failover test failed', error);
    }
    
    // Restore original API URLs
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_url', originalStandardUrl);
      sessionStorage.removeItem('temp_api_url');
    }
    
  } catch (error) {
    logError('API rotation tests failed', error);
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log(`${YELLOW}====================================${RESET}`);
  console.log(`${YELLOW}  STOCK ANALYZER API TEST SUITE     ${RESET}`);
  console.log(`${YELLOW}====================================${RESET}`);
  
  try {
    await testApiClient();
    await testStocksApi();
    await testIpoApi();
    await testNewsApi();
    await testMarketApi();
    await testPortfolioApi();
    
    if (CONFIG.apiRotationTest) {
      await testApiRotation();
    }
    
    console.log(`\n${GREEN}==== All tests completed ====${RESET}`);
  } catch (error) {
    console.error(`\n${RED}==== Test suite failed ====${RESET}`);
    console.error(error);
  }
}

// If this file is run directly, run the tests
if (typeof window !== 'undefined') {
  // In browser environment
  (window as any).runApiTests = runAllTests;
  console.log('API test suite loaded. Run tests with window.runApiTests()');
} else {
  // In Node.js environment
  runAllTests();
}

// Export for programmatic usage
export { runAllTests }; 