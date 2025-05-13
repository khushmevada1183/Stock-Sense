'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { get52WeekHighLow } from '@/services/stockService';
import LoadingSpinner from './LoadingSpinner';
import Link from 'next/link';

interface StockData {
  ticker: string;
  company: string;
  price: number;
  '52_week_high'?: number;
  '52_week_low'?: number;
  date: string;
}

interface HighLowData {
  BSE_52WeekHighLow: {
    high52Week: StockData[];
    low52Week: StockData[];
  };
  NSE_52WeekHighLow: {
    high52Week: StockData[];
    low52Week: StockData[];
  };
}

const HighLowTable: React.FC = () => {
  const [highLowData, setHighLowData] = useState<HighLowData | null>(null);
  const [activeTab, setActiveTab] = useState('bse');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighLowData = async () => {
      try {
        setLoading(true);
        const data = await get52WeekHighLow();
        setHighLowData(data);
      } catch (err) {
        console.error('Error fetching 52-week high/low data:', err);
        setError('Failed to load 52-week high/low data');
      } finally {
        setLoading(false);
      }
    };

    fetchHighLowData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>52-Week High/Low</CardTitle>
          <CardDescription>
            Stocks at their 52-week highs and lows
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !highLowData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>52-Week High/Low</CardTitle>
          <CardDescription>
            Stocks at their 52-week highs and lows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            {error || 'No 52-week high/low data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>52-Week High/Low</CardTitle>
        <CardDescription>
          Stocks at their 52-week highs and lows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="bse">BSE</TabsTrigger>
            <TabsTrigger value="nse">NSE</TabsTrigger>
          </TabsList>

          <TabsContent value="bse">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-2">52-Week Highs</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>52W High</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highLowData.BSE_52WeekHighLow.high52Week.slice(0, 5).map((stock, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <Link href={`/stocks/${stock.ticker.split('.')[0]}`} className="text-blue-600 hover:underline">
                              {stock.company}
                            </Link>
                          </TableCell>
                          <TableCell>₹{stock.price.toLocaleString()}</TableCell>
                          <TableCell>₹{stock['52_week_high']?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">52-Week Lows</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>52W Low</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highLowData.BSE_52WeekHighLow.low52Week.slice(0, 5).map((stock, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <Link href={`/stocks/${stock.ticker.split('.')[0]}`} className="text-blue-600 hover:underline">
                              {stock.company}
                            </Link>
                          </TableCell>
                          <TableCell>₹{stock.price.toLocaleString()}</TableCell>
                          <TableCell>₹{stock['52_week_low']?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nse">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-2">52-Week Highs</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>52W High</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highLowData.NSE_52WeekHighLow.high52Week.slice(0, 5).map((stock, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <Link href={`/stocks/${stock.ticker.split('.')[0]}`} className="text-blue-600 hover:underline">
                              {stock.company}
                            </Link>
                          </TableCell>
                          <TableCell>₹{stock.price.toLocaleString()}</TableCell>
                          <TableCell>₹{stock['52_week_high']?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">52-Week Lows</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>52W Low</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highLowData.NSE_52WeekHighLow.low52Week.slice(0, 5).map((stock, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <Link href={`/stocks/${stock.ticker.split('.')[0]}`} className="text-blue-600 hover:underline">
                              {stock.company}
                            </Link>
                          </TableCell>
                          <TableCell>₹{stock.price.toLocaleString()}</TableCell>
                          <TableCell>₹{stock['52_week_low']?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HighLowTable; 