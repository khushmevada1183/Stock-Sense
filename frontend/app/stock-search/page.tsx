'use client';

import React, { useState } from 'react';
import { getStockByName } from '@/services/stockService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Define a type for the stock data
interface StockData {
  tickerId?: string;
  companyName?: string;
  [key: string]: any;
}

export default function StockSearchPage() {
  const [stockName, setStockName] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName.trim()) return;

    setLoading(true);
    setError('');
    setStockData(null);
    setApiStatus('idle');

    try {
      console.log(`Searching for stock: ${stockName}`);
      const data = await getStockByName(stockName);
      console.log('Received data:', data);
      setStockData(data);
      setApiStatus('success');
    } catch (err: any) {
      console.error('Error fetching stock:', err);
      setError(`Failed to fetch stock data: ${err.message || 'Unknown error'}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Stock Search</h1>
      <p className="text-gray-600 mb-6">
        Search for a stock using the direct API endpoint format. Try searching for stocks like &quot;ITC&quot;, &quot;Reliance&quot;, &quot;TCS&quot;, etc.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="text"
          value={stockName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStockName(e.target.value)}
          placeholder="Enter stock name (e.g., ITC, Reliance)"
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {apiStatus === 'success' && stockData && (
        <Card>
          <CardHeader>
            <CardTitle>{stockData.companyName || stockData.company_name || stockData.tickerId}</CardTitle>
            <CardDescription>Stock Details</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
              {JSON.stringify(stockData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {apiStatus === 'success' && !stockData && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          No data found for the stock &quot;{stockName}&quot;. Please try another stock symbol.
        </div>
      )}
    </div>
  );
}