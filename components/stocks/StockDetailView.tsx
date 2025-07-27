"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { fetchStockDetails, fetchHistoricalData } from '../../utils/api';
import StockChart from '@/components/stocks/StockChart';
import { StockDetails, HistoricalDataPoint } from '@/types/stock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface StockDetailViewProps {
  symbol: string;
}

const StockDetailView: React.FC<StockDetailViewProps> = ({ symbol }) => {
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('1m');

  const getStockData = useCallback(async (currentPeriod: string) => {
    if (!symbol) return;
    
      setLoading(true);
      setError(null);
      
    try {
      // Fetch both stock details and historical data in parallel
      const [details, history] = await Promise.all([
        fetchStockDetails(symbol),
        fetchHistoricalData(symbol, currentPeriod)
      ]);

      // The backend now provides a standardized response.
      // Let's ensure we get the data from the 'data' property of the response.
      const stockData = details.data;
      const historyData = history.data;

      if (!stockData || Object.keys(stockData).length === 0) {
        throw new Error(`No stock details found for ${symbol}. The stock may not be listed or the API is down.`);
      }
      if (!historyData || !Array.isArray(historyData) || historyData.length === 0) {
        console.warn(`No historical data found for ${symbol} for the period ${currentPeriod}. The chart may be empty.`);
      }
      
      setStockDetails(stockData);
      setHistoricalData(historyData || []);

    } catch (err: any) {
      console.error("Failed to fetch stock data:", err);
      setError(err.message || 'An unknown error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    getStockData(period);
  }, [getStockData, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const handleRetry = () => {
    getStockData(period);
  };

  const renderStat = (label: string, value: string | number | undefined, unit: string = '') => {
      const displayValue = (value !== null && value !== undefined && value !== 0 && value !== '0') ? `${value}${unit}` : 'N/A';
      return (
          <div className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{displayValue}</span>
          </div>
      );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-4 text-lg">Loading stock data for {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Fetching Data</AlertTitle>
            <AlertDescription>
                <p>{error}</p>
                <Button onClick={handleRetry} className="mt-4">Try Again</Button>
            </AlertDescription>
        </Alert>
    );
  }

  if (!stockDetails) {
    return (
      <div className="text-center py-10">
        <p>No data available for {symbol}.</p>
      </div>
    );
  }

  const { name, current_price, change, percent_change, market_cap, pe_ratio, eps, dividend_yield, volume, sector, industry, year_high, year_low } = stockDetails;
  const isPositiveChange = change && change > 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle className="text-3xl font-bold">{name || 'Unknown Company'}</CardTitle>
              <p className="text-lg text-gray-500 dark:text-gray-400">{symbol}</p>
          </div>
          <div className="text-right">
              <p className={`text-4xl font-bold ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{current_price?.toFixed(2) || 'N/A'}
              </p>
              <p className={`text-lg font-semibold ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
                  {change?.toFixed(2) || '0.00'} ({percent_change?.toFixed(2) || '0.00'}%)
            </p>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Price Chart</CardTitle>
             <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="1m">1 Month</SelectItem>
                    <SelectItem value="6m">6 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
            {historicalData.length > 0 ? (
                <StockChart data={historicalData} />
            ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Historical data is not available for the selected period.
          </div>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Key Statistics</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
            {renderStat('Market Cap', market_cap, ' Cr')}
            {renderStat('P/E Ratio', pe_ratio)}
            {renderStat('EPS', eps)}
            {renderStat('Dividend Yield', dividend_yield, '%')}
            {renderStat('Volume', volume?.toLocaleString())}
            {renderStat('52-Week High', year_high)}
            {renderStat('52-Week Low', year_low)}
            {renderStat('Sector', sector)}
            {renderStat('Industry', industry)}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDetailView; 