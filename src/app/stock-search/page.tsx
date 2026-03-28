'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock } from 'lucide-react';
import EnhancedStockCard from '@/components/stocks/EnhancedStockCard';
import SearchBar from '@/app/components/SearchBar';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface PopularStock {
  ticker_id?: string;
  percent_change?: number | string;
  changePercent?: number | string;
  [key: string]: unknown;
}

interface TrendingResponse {
  success?: boolean;
  data?: {
    trending_stocks?: {
      top_gainers?: PopularStock[];
      top_losers?: PopularStock[];
    };
  };
}

const StockSearchPage: React.FC = () => {
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const history = localStorage.getItem('stockSearchHistory');
      if (!history) {
        return [];
      }

      const parsed: unknown = JSON.parse(history);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  });
  const router = useRouter();

  const toNumber = (value: number | string | undefined) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const fetchPopularStocks = async () => {
    try {
      const response = await fetch('/api/trending');
      const payload: unknown = await response.json();
      const data = payload as TrendingResponse;

      if (data.success) {
        const popular = [
          ...(data.data?.trending_stocks?.top_gainers?.slice(0, 3) || []),
          ...(data.data?.trending_stocks?.top_losers?.slice(0, 3) || [])
        ];
        setPopularStocks(popular);
      }
    } catch (error) {
      logger.error('Error fetching popular stocks:', error);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchPopularStocks();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  // This function will be passed to the SearchBar component
  const handleSearchComplete = (stockSymbol: string) => {
    if (stockSymbol) {
      router.push(`/stocks/${stockSymbol}`);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('stockSearchHistory');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔍 Stock Search
          </h1>
          <p className="text-gray-400 text-lg">
            Search for stocks by company name, ticker symbol, or NSE code
          </p>
        </div>

        {/* Search Form - Using the unified SearchBar component */}
        <Card className="mb-8 bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
          <CardContent className="p-6">
            <SearchBar showDetailsInline={false} compact={false} onSearchComplete={handleSearchComplete} />
          </CardContent>
        </Card>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <Card className="mb-8 bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
                <button
                  onClick={clearHistory}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Clear History
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Navigate to stock details or trigger new search
                      router.push(`/stocks/${query}`);
                    }}
                    className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-full text-sm transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular/Trending Stocks */}
        {popularStocks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Popular Stocks
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {popularStocks.map((stock, index) => (
                <EnhancedStockCard 
                  key={`popular-${stock.ticker_id || index}`} 
                  stock={stock} 
                  showAllData={true}
                  price_change_percentage={toNumber(stock.percent_change ?? stock.changePercent)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSearchPage;
