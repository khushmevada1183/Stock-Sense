"use client";

import React, { useState, useEffect, useCallback } from 'react';
import indianApiService from '../../services/indianApiService';
import { StockDetails } from '../../services/indianApiService';
import StockChart from './StockChart';

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

  // Fetch stock data with proper error handling
  const fetchStockData = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Clean up the symbol - remove any exchange prefixes
      const cleanSymbol = symbol.replace(/^(NSE:|BSE:)/, '');
      console.log(`Fetching stock data for symbol: ${cleanSymbol} (Attempt ${fetchAttempts + 1})`);
      
      // Fetch stock details - try both APIs
      let details = null;
      let fetchError = null;
      
      // Try different variations of the symbol
      const symbolVariations = [
        cleanSymbol,
        cleanSymbol.toUpperCase(),
        `NSE:${cleanSymbol}`,
        `BSE:${cleanSymbol}`
      ];
      
      // Try Indian API first with different symbol variations
      for (const variation of symbolVariations) {
        try {
          console.log(`Trying Indian API with symbol: ${variation}`);
          details = await indianApiService.getStockDetails(variation);
          if (details && Object.keys(details).length > 0) {
            console.log("Successfully fetched from Indian API:", details);
            break;
          }
        } catch (err) {
          console.error(`Error fetching from Indian API with ${variation}:`, err);
          fetchError = err;
        }
      }
      
      // If Indian API fails, try global API
      if (!details) {
        try {
          console.log("Trying global API as fallback");
          // Check if we have access to the global API service
          const apiService = await import('../../services/apiService').then(module => module.default);
          
          // Try different symbol variations with global API
          for (const variation of symbolVariations) {
            try {
              console.log(`Trying global API with symbol: ${variation}`);
              const globalDetails = await apiService.getStockDetails(variation);
              if (globalDetails && Object.keys(globalDetails).length > 0) {
                console.log("Successfully fetched from global API:", globalDetails);
                
                // Convert global API format to our expected format
                details = {
                  symbol: globalDetails.symbol,
                  name: globalDetails.companyName || globalDetails.company_name || globalDetails.symbol,
                  company_name: globalDetails.company_name || globalDetails.companyName,
                  current_price: globalDetails.current_price || globalDetails.latestPrice || 0,
                  change: globalDetails.change || 0,
                  percent_change: globalDetails.changePercent || globalDetails.percent_change || 0,
                  market_cap: globalDetails.market_cap || globalDetails.marketCap,
                  pe_ratio: globalDetails.pe_ratio || globalDetails.peRatio,
                  eps: globalDetails.eps,
                  dividend_yield: globalDetails.dividend_yield || globalDetails.dividendYield,
                  volume: globalDetails.volume,
                  sector: globalDetails.sector,
                  industry: globalDetails.industry,
                  year_high: globalDetails.year_high || globalDetails.yearHigh || globalDetails.week52High,
                  year_low: globalDetails.year_low || globalDetails.yearLow || globalDetails.week52Low
                };
                break;
              }
            } catch (err) {
              console.error(`Error fetching from global API with ${variation}:`, err);
            }
          }
        } catch (globalErr) {
          console.error(`Error loading global API service:`, globalErr);
          // If both APIs fail, we'll use the first error
        }
      }
      
      if (!details) {
        throw fetchError || new Error(`Failed to fetch stock details for ${cleanSymbol} after multiple attempts`);
      }
      
      setStockDetails(details);
      
      // Fetch historical data
      await fetchHistoricalData(cleanSymbol, period);
      
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err);
      setError('Failed to load stock data. Please try again later.');
      setStockDetails(null);
    } finally {
      setLoading(false);
      setFetchAttempts(prev => prev + 1);
    }
  }, [symbol, period, fetchAttempts]);

  // Separate function to fetch historical data
  const fetchHistoricalData = async (cleanSymbol: string, selectedPeriod: string) => {
    try {
      const historical = await indianApiService.getHistoricalData(cleanSymbol, selectedPeriod);
      if (historical && historical.length > 0) {
        setHistoricalData(historical);
        return;
      }
      
      // Try global API for historical data if Indian API returns empty
      try {
        const apiService = await import('../../services/apiService').then(module => module.default);
        const globalHistorical = await apiService.getHistoricalData(cleanSymbol, selectedPeriod);
        if (globalHistorical && globalHistorical.length > 0) {
          setHistoricalData(globalHistorical);
          return;
        }
      } catch (globalHistErr) {
        console.error(`Error fetching global historical data:`, globalHistErr);
      }
      
      // If both APIs fail, set empty array
      setHistoricalData([]);
    } catch (histErr) {
      console.error(`Error fetching historical data:`, histErr);
      
      // Try global API as fallback for historical data
      try {
        const apiService = await import('../../services/apiService').then(module => module.default);
        const globalHistorical = await apiService.getHistoricalData(cleanSymbol, selectedPeriod);
        if (globalHistorical && globalHistorical.length > 0) {
          setHistoricalData(globalHistorical);
          return;
        }
      } catch (globalHistErr) {
        console.error(`Error fetching global historical data:`, globalHistErr);
      }
      
      setHistoricalData([]);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchStockData();
    }
  }, [symbol, period, fetchStockData]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
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
          {indianApiService.formatCurrency(stockDetails.current_price || 0)}
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
            {p}
          </button>
        ))}
      </div>

      {/* Stock Chart */}
      <div className="mb-8 h-64">
        {historicalData.length > 0 ? (
          <StockChart data={historicalData} />
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