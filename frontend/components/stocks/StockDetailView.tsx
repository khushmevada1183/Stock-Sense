"use client";

import React, { useState, useEffect, useCallback } from 'react';
import indianApiService from '../../services/indianApiService';
import { StockDetails, HistoricalDataPoint } from '../../services/indianApiService';
import StockChart from '@/components/stocks/StockChart';

interface StockDetailViewProps {
  symbol: string;
}

const StockDetailView: React.FC<StockDetailViewProps> = ({ symbol }) => {
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('1m');
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);

  // Add this helper function at the top of the component, after the state declarations
  const extractPriceFromResponse = (data: any): number => {
    // Check all possible price fields in the response
    const priceFields = [
      'current_price', 'price', 'last_price', 'lastPrice', 'close', 
      'close_price', 'closePrice', 'ltp', 'last_traded_price',
      'regularMarketPrice', 'latestPrice', 'regularMarketLastPrice',
      'nse_price', 'bse_price', 'stockPrice', 'marketPrice'
    ];
    
    for (const field of priceFields) {
      if (data[field] && !isNaN(parseFloat(String(data[field])))) {
        const price = parseFloat(String(data[field]));
        console.log(`Found price in field '${field}': ${price}`);
        return price;
      }
    }
    
    // If no price field is found, check if there's a 'data' object that might contain price
    if (data.data) {
      for (const field of priceFields) {
        if (data.data[field] && !isNaN(parseFloat(String(data.data[field])))) {
          const price = parseFloat(String(data.data[field]));
          console.log(`Found price in data.${field}: ${price}`);
          return price;
        }
      }
    }
    
    // If no standard price field is found, look for any numeric field that might be a price
    // Only consider fields with values between 10 and 100000 as potential prices (reasonable range for Indian stocks)
    for (const field in data) {
      if (typeof data[field] === 'number' || 
         (typeof data[field] === 'string' && !isNaN(parseFloat(data[field])))) {
        const value = typeof data[field] === 'number' ? data[field] : parseFloat(data[field]);
        if (value >= 10 && value <= 100000) {
          console.log(`Found potential price in field '${field}': ${value}`);
          return value;
        }
      }
    }
    
    // Check nested data object for any numeric field
    if (data.data) {
      for (const field in data.data) {
        if (typeof data.data[field] === 'number' || 
           (typeof data.data[field] === 'string' && !isNaN(parseFloat(data.data[field])))) {
          const value = typeof data.data[field] === 'number' ? data.data[field] : parseFloat(data.data[field]);
          if (value >= 10 && value <= 100000) {
            console.log(`Found potential price in data.${field}: ${value}`);
            return value;
          }
        }
      }
    }
    
    // If no price is found, log the issue
    console.warn('No valid price found in response:', data);
    return 0;
  };

  // Add this helper function after the extractPriceFromResponse function
  const getBestAvailablePrice = (details: StockDetails): number => {
    if (typeof details.current_price === 'number' && details.current_price > 0) {
      return details.current_price;
    }
    if (typeof details.price === 'number' && details.price > 0) {
      return details.price;
    }
    if (typeof details.lastPrice === 'number' && details.lastPrice > 0) {
      return details.lastPrice;
    }
    if (typeof details.last_price === 'number' && details.last_price > 0) {
      return details.last_price;
    }
    
    // Check other possible price fields
    const priceFields = ['close', 'close_price', 'closePrice', 'ltp', 'last_traded_price'];
    for (const field of priceFields) {
      if (typeof details[field] === 'number' && details[field] > 0) {
        console.log(`Using ${field} as price: ${details[field]}`);
        return details[field];
      }
    }
    
    console.warn('No valid price found in stock details:', details);
    return 0;
  };

  // Fetch stock data with proper error handling
  const fetchStockData = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Clean up the symbol - remove any exchange prefixes
      const cleanSymbol = symbol.replace(/^(NSE:|BSE:)/, '');
      console.log(`Fetching stock data for symbol: ${cleanSymbol}`);
      
      // DIRECT API CALL - This is the most reliable way to get real-time price
      try {
        // Make a direct fetch call to the API to get real-time price
        console.log(`Making direct API call to fetch price for ${cleanSymbol}`);
        const response = await fetch(`https://stock.indianapi.in/stock/${cleanSymbol}`, {
          headers: {
            'X-Api-Key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const directData = await response.json();
          console.log("Direct API call result:", directData);
          
          // Debug: Log all potential price fields
          console.log("Debugging price fields in response:");
          ['current_price', 'price', 'last_price', 'lastPrice', 'close', 
           'close_price', 'closePrice', 'ltp', 'last_traded_price',
           'regularMarketPrice', 'latestPrice', 'regularMarketLastPrice'].forEach(field => {
            if (directData[field] !== undefined) {
              console.log(`Field ${field}:`, directData[field]);
            }
          });
          
          // If there's a data object, check that too
          if (directData.data) {
            console.log("Checking nested data object for price fields:");
            ['current_price', 'price', 'last_price', 'lastPrice', 'close', 
             'close_price', 'closePrice', 'ltp', 'last_traded_price',
             'regularMarketPrice', 'latestPrice', 'regularMarketLastPrice'].forEach(field => {
              if (directData.data[field] !== undefined) {
                console.log(`Field data.${field}:`, directData.data[field]);
              }
            });
          }
          
          // Create stock details object from direct API response
          const details: StockDetails = {
            symbol: directData.symbol || cleanSymbol,
            name: directData.name || directData.company_name || cleanSymbol,
            company_name: directData.company_name || directData.name || '',
            current_price: extractPriceFromResponse(directData),
            price: extractPriceFromResponse(directData),
            change: parseFloat(directData.change || 0),
            percent_change: parseFloat(directData.percent_change || directData.changePercent || 0),
            market_cap: parseFloat(directData.market_cap || directData.marketCap || 0),
            pe_ratio: parseFloat(directData.pe_ratio || directData.peRatio || 0),
            eps: parseFloat(directData.eps || 0),
            dividend_yield: parseFloat(directData.dividend_yield || directData.dividendYield || 0),
            volume: parseFloat(directData.volume || 0),
            sector: directData.sector || '',
            industry: directData.industry || '',
            year_high: parseFloat(directData.year_high || directData.yearHigh || directData.week52High || 0),
            year_low: parseFloat(directData.year_low || directData.yearLow || directData.week52Low || 0)
          };
          
          // Log the price for debugging
          console.log(`Direct API price for ${cleanSymbol}:`, details.current_price);
          
          // Set stock details and fetch historical data
          setStockDetails(details);
          await fetchHistoricalData(cleanSymbol, period);
          setLoading(false);
          return;
        } else {
          console.error(`Direct API call failed with status: ${response.status}`);
        }
      } catch (directErr) {
        console.error("Direct API call error:", directErr);
      }
      
      // If direct API call fails, try alternative approach with NSE/BSE prefixes
      try {
        console.log("Trying with NSE prefix");
        const nseResponse = await fetch(`https://stock.indianapi.in/stock/NSE:${cleanSymbol}`, {
          headers: {
            'X-Api-Key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
            'Content-Type': 'application/json'
          }
        });
        
        if (nseResponse.ok) {
          const nseData = await nseResponse.json();
          console.log("NSE API call result:", nseData);
          
          // Debug: Log all potential price fields
          console.log("Debugging NSE price fields in response:");
          ['current_price', 'price', 'last_price', 'lastPrice', 'close', 
           'close_price', 'closePrice', 'ltp', 'last_traded_price'].forEach(field => {
            if (nseData[field] !== undefined) {
              console.log(`NSE Field ${field}:`, nseData[field]);
            }
          });
          
          // Create stock details object from NSE API response
          const details: StockDetails = {
            symbol: nseData.symbol || `NSE:${cleanSymbol}`,
            name: nseData.name || nseData.company_name || cleanSymbol,
            company_name: nseData.company_name || nseData.name || '',
            current_price: extractPriceFromResponse(nseData),
            price: extractPriceFromResponse(nseData),
            change: parseFloat(nseData.change || 0),
            percent_change: parseFloat(nseData.percent_change || nseData.changePercent || 0),
            market_cap: parseFloat(nseData.market_cap || nseData.marketCap || 0),
            pe_ratio: parseFloat(nseData.pe_ratio || nseData.peRatio || 0),
            eps: parseFloat(nseData.eps || 0),
            dividend_yield: parseFloat(nseData.dividend_yield || nseData.dividendYield || 0),
            volume: parseFloat(nseData.volume || 0),
            sector: nseData.sector || '',
            industry: nseData.industry || '',
            year_high: parseFloat(nseData.year_high || nseData.yearHigh || nseData.week52High || 0),
            year_low: parseFloat(nseData.year_low || nseData.yearLow || nseData.week52Low || 0)
          };
          
          // Log the price for debugging
          console.log(`NSE API price for ${cleanSymbol}:`, details.current_price);
          
          // Set stock details and fetch historical data
          setStockDetails(details);
          await fetchHistoricalData(cleanSymbol, period);
          setLoading(false);
          return;
        }
      } catch (nseErr) {
        console.error("NSE API call error:", nseErr);
      }
      
      // Try with BSE prefix if NSE fails
      try {
        console.log("Trying with BSE prefix");
        const bseResponse = await fetch(`https://stock.indianapi.in/stock/BSE:${cleanSymbol}`, {
          headers: {
            'X-Api-Key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
            'Content-Type': 'application/json'
          }
        });
        
        if (bseResponse.ok) {
          const bseData = await bseResponse.json();
          console.log("BSE API call result:", bseData);
          
          // Debug: Log all potential price fields
          console.log("Debugging BSE price fields in response:");
          ['current_price', 'price', 'last_price', 'lastPrice', 'close', 
           'close_price', 'closePrice', 'ltp', 'last_traded_price'].forEach(field => {
            if (bseData[field] !== undefined) {
              console.log(`BSE Field ${field}:`, bseData[field]);
            }
          });
          
          // Create stock details object from BSE API response
          const details: StockDetails = {
            symbol: bseData.symbol || `BSE:${cleanSymbol}`,
            name: bseData.name || bseData.company_name || cleanSymbol,
            company_name: bseData.company_name || bseData.name || '',
            current_price: extractPriceFromResponse(bseData),
            price: extractPriceFromResponse(bseData),
            change: parseFloat(bseData.change || 0),
            percent_change: parseFloat(bseData.percent_change || bseData.changePercent || 0),
            market_cap: parseFloat(bseData.market_cap || bseData.marketCap || 0),
            pe_ratio: parseFloat(bseData.pe_ratio || bseData.peRatio || 0),
            eps: parseFloat(bseData.eps || 0),
            dividend_yield: parseFloat(bseData.dividend_yield || bseData.dividendYield || 0),
            volume: parseFloat(bseData.volume || 0),
            sector: bseData.sector || '',
            industry: bseData.industry || '',
            year_high: parseFloat(bseData.year_high || bseData.yearHigh || bseData.week52High || 0),
            year_low: parseFloat(bseData.year_low || bseData.yearLow || bseData.week52Low || 0)
          };
          
          // Log the price for debugging
          console.log(`BSE API price for ${cleanSymbol}:`, details.current_price);
          
          // Set stock details and fetch historical data
          setStockDetails(details);
          await fetchHistoricalData(cleanSymbol, period);
          setLoading(false);
          return;
        }
      } catch (bseErr) {
        console.error("BSE API call error:", bseErr);
      }
      
      // Try a direct search API call as a last resort
      try {
        console.log("Trying search API as last resort");
        const searchResponse = await fetch(`https://stock.indianapi.in/stock-search?query=${encodeURIComponent(cleanSymbol)}`, {
          headers: {
            'X-Api-Key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
            'Content-Type': 'application/json'
          }
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log("Search API call result:", searchData);
          
          if (searchData.results && searchData.results.length > 0) {
            // Use the first search result
            const firstResult = searchData.results[0];
            console.log("Using first search result:", firstResult);
            
            // Create stock details from search result
            const details: StockDetails = {
              symbol: firstResult.symbol || cleanSymbol,
              name: firstResult.name || firstResult.company_name || cleanSymbol,
              company_name: firstResult.company_name || firstResult.name || '',
              current_price: extractPriceFromResponse(firstResult),
              price: extractPriceFromResponse(firstResult),
              change: parseFloat(firstResult.change || 0),
              percent_change: parseFloat(firstResult.percent_change || firstResult.changePercent || 0),
              market_cap: parseFloat(firstResult.market_cap || firstResult.marketCap || 0),
              pe_ratio: parseFloat(firstResult.pe_ratio || firstResult.peRatio || 0),
              eps: parseFloat(firstResult.eps || 0),
              dividend_yield: parseFloat(firstResult.dividend_yield || firstResult.dividendYield || 0),
              volume: parseFloat(firstResult.volume || 0),
              sector: firstResult.sector || '',
              industry: firstResult.industry || '',
              year_high: parseFloat(firstResult.year_high || firstResult.yearHigh || firstResult.week52High || 0),
              year_low: parseFloat(firstResult.year_low || firstResult.yearLow || firstResult.week52Low || 0)
            };
            
            // Log the price for debugging
            console.log(`Search API price for ${cleanSymbol}:`, details.current_price);
            
            // Set stock details and fetch historical data
            setStockDetails(details);
            await fetchHistoricalData(cleanSymbol, period);
            setLoading(false);
            return;
          }
        }
      } catch (searchErr) {
        console.error("Search API call error:", searchErr);
      }
      
      // If all direct API calls fail, fall back to the service layer
      console.log("Falling back to service layer");
      const details = await indianApiService.getStockDetails(cleanSymbol);
      
      // Ensure we have a valid current_price using our extraction helper
      if (!details.current_price || details.current_price === 0) {
        const extractedPrice = extractPriceFromResponse(details);
        if (extractedPrice > 0) {
          details.current_price = extractedPrice;
          details.price = extractedPrice;
        }
      }
      
      console.log("Final stock details with price:", details);
      setStockDetails(details);
      
      // Fetch historical data
      await fetchHistoricalData(cleanSymbol, period);
      
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err);
      setError('Failed to load stock data. Please try again later.');
      setStockDetails(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);

  // Separate function to fetch historical data
  const fetchHistoricalData = async (cleanSymbol: string, selectedPeriod: string) => {
    try {
      console.log(`Fetching historical data for ${cleanSymbol} with period ${selectedPeriod}`);
      
      // Clear previous data
      setHistoricalData([]);
      
      // Direct API call to ensure fresh data
      try {
        // Map UI period values to API expected values if needed
        const apiPeriod = selectedPeriod === '1yr' ? '1y' : 
                         selectedPeriod === '3yr' ? '3y' : 
                         selectedPeriod === '5yr' ? '5y' : selectedPeriod;
        
        console.log(`Making direct API call for historical data with period ${apiPeriod}`);
        const response = await fetch(`https://stock.indianapi.in/historical_data?stock_name=${encodeURIComponent(cleanSymbol)}&period=${apiPeriod}`, {
          headers: {
            'X-Api-Key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Direct API historical data for ${selectedPeriod}:`, data);
          
          let formattedData = [];
          
          // Transform API data to our expected format
          if (data.datasets) {
            const priceDataset = data.datasets.find((d: any) => d.metric === 'Price');
            if (priceDataset && priceDataset.values) {
              formattedData = priceDataset.values.map((point: [string, number]) => ({
                date: point[0],
                price: point[1]
              }));
            }
          } else if (data.dates && data.prices) {
            formattedData = data.dates.map((date: string, index: number) => ({
              date,
              price: data.prices[index],
              volume: data.volumes ? data.volumes[index] : undefined
            }));
          } else if (Array.isArray(data)) {
            formattedData = data.map((item: any) => ({
              date: item.date || item.timestamp,
              price: item.price || item.close || item.value || 0,
              volume: item.volume
            }));
          }
          
          if (formattedData.length > 0) {
            console.log(`Received ${formattedData.length} direct historical data points for ${selectedPeriod}`);
            setHistoricalData(formattedData);
            return;
          }
        } else {
          console.error(`Direct historical API call failed with status: ${response.status}`);
        }
      } catch (directErr) {
        console.error("Direct historical API call error:", directErr);
      }
      
      // Fall back to service method if direct call fails
      const historical = await indianApiService.getHistoricalData(cleanSymbol, selectedPeriod);
      if (historical && historical.length > 0) {
        console.log(`Received ${historical.length} historical data points for ${selectedPeriod}`);
        setHistoricalData(historical);
        return;
      }
      
      // Try global API for historical data if Indian API returns empty
      try {
        const apiService = await import('../../services/apiService').then(module => module.default);
        const globalHistorical = await apiService.getHistoricalData(cleanSymbol, selectedPeriod);
        if (globalHistorical && globalHistorical.length > 0) {
          console.log(`Received ${globalHistorical.length} global historical data points for ${selectedPeriod}`);
          setHistoricalData(globalHistorical);
          return;
        }
      } catch (globalHistErr) {
        console.error(`Error fetching global historical data:`, globalHistErr);
      }
      
      // If all APIs fail, just set empty array - NO MOCK DATA
      console.log(`No historical data available for ${cleanSymbol} with period ${selectedPeriod}`);
      setHistoricalData([]);
    } catch (histErr) {
      console.error(`Error fetching historical data:`, histErr);
      setHistoricalData([]);
    }
  };

  useEffect(() => {
    if (symbol) {
      // Reset state when symbol changes to prevent showing old data
      setStockDetails(null);
      setHistoricalData([]);
      setError(null);
      setLoading(true);
      
      // Fetch new data
      fetchStockData();
    }
  }, [symbol, period, fetchStockData]);

  const handlePeriodChange = (newPeriod: string) => {
    console.log(`Changing period to ${newPeriod}`);
    setPeriod(newPeriod);
    
    // If we already have stock details, just fetch new historical data
    if (stockDetails && symbol) {
      const cleanSymbol = symbol.replace(/^(NSE:|BSE:)/, '');
      fetchHistoricalData(cleanSymbol, newPeriod);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchStockData();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 text-red-500 dark:text-red-400 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stockDetails) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No stock data available for {symbol}
        </p>
        <div className="mt-4 flex justify-center">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Stock Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {stockDetails.name || stockDetails.company_name || symbol}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {stockDetails.symbol} • {stockDetails.sector || 'N/A'} • {stockDetails.industry || 'N/A'}
        </p>
      </div>

      {/* Price and Change */}
      <div className="flex items-baseline mb-6">
        <h2 className="text-3xl font-bold mr-3">
          {indianApiService.formatCurrency(getBestAvailablePrice(stockDetails))}
        </h2>
        <span className={`text-lg font-semibold ${
          (stockDetails.percent_change || 0) >= 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {(stockDetails.percent_change || 0) >= 0 ? '+' : ''}
          {(stockDetails.percent_change || 0).toFixed(2)}%
        </span>
      </div>

      {/* Chart Period Selector */}
      <div className="flex mb-4 space-x-2 overflow-x-auto">
        {['1m', '6m', '1yr', '3yr', '5yr', 'max'].map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-3 py-1 text-sm rounded-full ${
              period === p
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {p === '1m' ? '1M' : 
             p === '6m' ? '6M' : 
             p === '1yr' ? '1Y' : 
             p === '3yr' ? '3Y' : 
             p === '5yr' ? '5Y' : 'Max'}
          </button>
        ))}
      </div>

      {/* Stock Chart */}
      <div className="mb-8 h-64">
        {historicalData.length > 0 ? (
          <StockChart data={historicalData} period={period} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-gray-500 dark:text-gray-400">No historical data available</p>
          </div>
        )}
      </div>

      {/* Key Statistics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Key Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
            <p className="font-semibold">
              {stockDetails.market_cap 
                ? indianApiService.formatCurrency(stockDetails.market_cap) 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">P/E Ratio</p>
            <p className="font-semibold">
              {stockDetails.pe_ratio ? stockDetails.pe_ratio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">EPS</p>
            <p className="font-semibold">
              {stockDetails.eps ? stockDetails.eps.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Dividend Yield</p>
            <p className="font-semibold">
              {stockDetails.dividend_yield 
                ? `${stockDetails.dividend_yield.toFixed(2)}%` 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">52-Week High</p>
            <p className="font-semibold">
              {stockDetails.year_high 
                ? indianApiService.formatCurrency(stockDetails.year_high) 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">52-Week Low</p>
            <p className="font-semibold">
              {stockDetails.year_low 
                ? indianApiService.formatCurrency(stockDetails.year_low) 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
            <p className="font-semibold">
              {stockDetails.volume 
                ? stockDetails.volume.toLocaleString() 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Volume</p>
            <p className="font-semibold">
              {stockDetails.average_volume 
                ? stockDetails.average_volume.toLocaleString() 
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="flex space-x-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Add to Watchlist
        </button>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          View News
        </button>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          View Financials
        </button>
      </div>
    </div>
  );
};

export default StockDetailView; 