'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTopGainers, getTopLosers } from '@/services/stockService';

interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

const HighLowTable = () => {
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching top gainers and losers...');
      
      // Use the stockService functions which handle caching and error recovery
      const [gainersData, losersData] = await Promise.all([
        getTopGainers(),
        getTopLosers()
      ]);
      
      console.log('Received gainers data:', gainersData);
      console.log('Received losers data:', losersData);
      
      // Ensure we're working with arrays before calling slice
      const gainersArray = Array.isArray(gainersData) ? gainersData : [];
      const losersArray = Array.isArray(losersData) ? losersData : [];
      
      setTopGainers(gainersArray.slice(0, 5));
      setTopLosers(losersArray.slice(0, 5));
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error('Error fetching top gainers/losers:', err);
      setError('Failed to load market data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Market Movers</CardTitle>
          <button 
            onClick={fetchData} 
            disabled={isLoading}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {formatTime(lastUpdated)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="gainers">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="gainers" className="flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Top Gainers
              </TabsTrigger>
              <TabsTrigger value="losers" className="flex items-center justify-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                Top Losers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="gainers">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : topGainers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data available
                </div>
              ) : (
                <Table>
                  <TableBody>
                    {topGainers.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell>
                          <Link href={`/stocks/${stock.symbol}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                              {stock.companyName}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">₹{stock.price.toLocaleString()}</div>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            +{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="losers">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : topLosers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data available
                </div>
              ) : (
                <Table>
                  <TableBody>
                    {topLosers.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell>
                          <Link href={`/stocks/${stock.symbol}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                              {stock.companyName}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">₹{stock.price.toLocaleString()}</div>
                          <div className="text-xs text-red-600 dark:text-red-400">
                            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default HighLowTable; 