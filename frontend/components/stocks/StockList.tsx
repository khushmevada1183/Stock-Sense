'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import StockLogo from '@/components/stocks/StockLogo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

interface Stock {
  symbol: string;
  companyName: string;
  latestPrice: number;
  change: number;
  changePercent: number;
  sector: string;
  volume: number;
}

interface StockListProps {
  onStockSelect?: (symbol: string) => void;
}

const StockList = ({ onStockSelect }: StockListProps) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching top stocks');
        // Use featured-stocks endpoint first
        try {
          const response = await axios.get(`${API_URL}/featured-stocks`);
          if (response.status === 200) {
            const data = response.data.data || response.data;
            console.log('Featured stocks:', data);
            
            // Transform data to match Stock interface
            const formattedStocks = transformStocksData(data);
            
            if (formattedStocks.length > 0) {
              setStocks(formattedStocks);
              setError('');
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log('Failed to fetch from featured-stocks, trying fallback...');
        }
        
        // Fallback to regular stocks endpoint
        const response = await axios.get(`${API_URL}/stocks`);
        const responseData = response.data.data || response.data;
        console.log('Regular stocks:', responseData);
        
        // Transform API response to match our Stock interface
        const formattedStocks = transformApiResponse(responseData);
        
        if (formattedStocks.length > 0) {
          setStocks(formattedStocks);
          setError('');
        } else {
          throw new Error('No stock data found');
        }
      } catch (err) {
        console.error('Error fetching stocks:', err);
        setError('Failed to load stocks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Helper function to transform API response to match our Stock interface
  const transformApiResponse = (apiData: any): Stock[] => {
    let result: Stock[] = [];
    
    // Check if apiData is an object with top_gainers/top_losers
    if (apiData && typeof apiData === 'object' && !Array.isArray(apiData)) {
      // Combine gainers and losers if available
      const allStocks = [
        ...(apiData.top_gainers || []),
        ...(apiData.top_losers || [])
      ];
      
      if (allStocks.length > 0) {
        result = allStocks.map(stock => ({
          symbol: stock.ticker_id || stock.symbol || stock.ric || '',
          companyName: stock.company_name || stock.companyName || '',
          latestPrice: parseFloat(stock.price || stock.current_price) || 0,
          change: parseFloat(stock.net_change || stock.change) || 0,
          changePercent: parseFloat(stock.percent_change || stock.changePercent) || 0,
          sector: stock.sector || stock.exchange_type || 'Various',
          volume: parseInt(stock.volume) || 0
        }));
      }
    } else if (Array.isArray(apiData)) {
      // Direct array format
      result = apiData.map(stock => ({
        symbol: stock.symbol || stock.ticker_id || '',
        companyName: stock.company_name || stock.companyName || '',
        latestPrice: parseFloat(stock.current_price || stock.latestPrice || stock.price) || 0,
        change: parseFloat(stock.change || stock.net_change) || 0,
        changePercent: parseFloat(stock.percent_change || stock.changePercent) || 0,
        sector: stock.sector || stock.sector_name || 'Various',
        volume: parseInt(stock.volume) || 0
      }));
    }
    
    return result;
  };

  // Helper function to transform any stock data to match our interface
  const transformStocksData = (data: any): Stock[] => {
    if (Array.isArray(data)) {
      return data.map(stock => ({
        symbol: stock.symbol || stock.ticker_id || '',
        companyName: stock.company_name || stock.companyName || '',
        latestPrice: parseFloat(stock.current_price || stock.latestPrice || stock.price) || 0,
        change: parseFloat(stock.change || stock.net_change) || 0,
        changePercent: parseFloat(stock.percent_change || stock.changePercent) || 0,
        sector: stock.sector || stock.sector_name || 'Various',
        volume: parseInt(stock.volume) || 0
      }));
    }
    return [];
  };

  useEffect(() => {
    // Debounce search to avoid too many API calls
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchStocks(searchTerm);
      } else if (searchTerm.trim().length === 0 && stocks.length === 0) {
        // If search is cleared and we have no stocks, fetch top stocks again
        fetchTopStocks();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchStocks = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await axios.get(`${API_URL}/stocks/search`, {
        params: { query }
      });
      
      // Handle the response data format
      let responseData;
      
      if (response.data && response.data.status === 'success') {
        responseData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        responseData = response.data;
      } else if (response.data && response.data.results) {
        responseData = response.data.results;
      } else {
        responseData = [];
      }
      
      console.log('Search results:', responseData);
      
      // Transform the data to match our Stock interface
      const formattedResults = transformStocksData(responseData);
      setStocks(formattedResults);
      setError('');
    } catch (err) {
      console.error('Error searching stocks:', err);
      setError('Failed to search stocks. Please try again later.');
      setStocks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchTopStocks = async () => {
    try {
      setIsLoading(true);
      // First try to get trending stocks from the API
      const response = await axios.get(`${API_URL}/stocks`);
      const responseData = response.data.data || response.data;
      
      // Transform API response to match our Stock interface
      const formattedStocks = transformApiResponse(responseData);
      
      setStocks(formattedStocks);
      setError('');
    } catch (err) {
      console.error('Error fetching top stocks:', err);
      setError('Failed to load top stocks. Please try again later.');
      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockClick = (symbol: string) => {
    if (onStockSelect) {
      onStockSelect(symbol);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle>Top Stocks</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks..."
              className="pl-8 pr-4 py-2 text-sm border rounded-md w-full sm:w-64 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead className="hidden sm:table-cell">Sector</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No stocks found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  stocks.map((stock, index) => (
                    <TableRow 
                      key={`${stock.symbol}-${index}`} 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleStockClick(stock.symbol)}
                    >
                      <TableCell className="font-medium">
                        <Link href={`/stocks/${stock.symbol}`} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                          <StockLogo symbol={stock.symbol} size={24} className="mr-2" />
                          {stock.symbol}
                        </Link>
                      </TableCell>
                      <TableCell>{stock.companyName}</TableCell>
                      <TableCell>₹{stock.latestPrice?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {stock.changePercent > 0 ? (
                            <ArrowUp className="h-3 w-3 text-green-500" />
                          ) : stock.changePercent < 0 ? (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          ) : null}
                          <Badge variant={stock.changePercent > 0 ? "success" : stock.changePercent < 0 ? "destructive" : "secondary"}>
                            {stock.changePercent > 0 ? '+' : ''}
                            {stock.changePercent?.toFixed(2)}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {stock.sector}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        {stock.volume?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockList; 