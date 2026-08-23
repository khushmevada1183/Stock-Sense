'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import EnhancedStockCard from '@/components/stocks/EnhancedStockCard';
import SearchBar from '@/app/components/SearchBar';
import { useRouter } from 'next/navigation';
import { getTrendingStocks } from '@/api/api';
import { panelShellClass, sectionTitleClass, sectionEyebrowClass } from '@/styles/design-tokens';

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

const loadSearchHistory = (): string[] => {
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
};

const StockSearchPage: React.FC = () => {
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(loadSearchHistory);
  const router = useRouter();

  const toNumber = (value: number | string | undefined) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  useEffect(() => {
    const loadPopular = async () => {
      try {
        const response = await getTrendingStocks() as TrendingResponse;
        const topGainers = response?.data?.trending_stocks?.top_gainers || [];
        const topLosers = response?.data?.trending_stocks?.top_losers || [];
        setPopularStocks([...topGainers.slice(0, 6), ...topLosers.slice(0, 6)]);
      } catch {
        setPopularStocks([]);
      }
    };

    void loadPopular();
  }, []);

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
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8 text-center">
          <p className={sectionEyebrowClass}>Discover</p>
          <h1 className={`${sectionTitleClass} mb-4`}>
            Stock Search
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Search for stocks by company name, ticker symbol, or NSE code
          </p>
        </div>

        <div className={`${panelShellClass} mb-8 p-6`}>
          <SearchBar showDetailsInline={false} compact={false} onSearchComplete={handleSearchComplete} />
        </div>

        {searchHistory.length > 0 && (
          <div className={`${panelShellClass} mb-8`}>
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
                <Clock className="h-5 w-5" />
                Recent Searches
              </h2>
              <button
                onClick={clearHistory}
                className="inline-flex min-h-[44px] items-center px-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear History
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      router.push(`/stocks/${query}`);
                    }}
                    className="min-h-[44px] rounded-full border border-slate-200/70 bg-white/75 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {popularStocks.length > 0 && (
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-slate-950 dark:text-white">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-green-400" />
              Popular Stocks
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
