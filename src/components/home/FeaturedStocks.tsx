'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as stockApi from '@/api/api';
import { StockData as Stock } from '@/types/stocks';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, BarChart2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface StockLike {
  id?: string;
  symbol?: string;
  company_name?: string;
  companyName?: string;
  sector_name?: string;
  sector?: string;
  price_change_percentage?: number | string;
  changePercent?: number | string;
  change_percent?: number | string;
  change?: number | string;
  current_price?: number | string;
  latestPrice?: number | string;
  price?: number | string;
}

interface TrendingStocksResponse {
  success?: boolean;
  data?:
    | {
        stocks?: unknown[];
        trending_stocks?: {
          top_gainers?: unknown[];
          top_losers?: unknown[];
        };
      }
    | unknown[];
}

const asStockLike = (value: unknown): StockLike => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  return value as StockLike;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

// Helper function to normalize stock data across different formats
const normalizeStock = (value: unknown): Stock => {
  const stock = asStockLike(value);

  return {
    id: stock.id || stock.symbol || '',
    symbol: stock.symbol || '',
    company_name: stock.company_name || stock.companyName || '',
    sector_name: stock.sector_name || stock.sector || '',
    price_change_percentage:
      toNumber(stock.price_change_percentage) ||
      toNumber(stock.changePercent) ||
      toNumber(stock.change_percent) ||
      toNumber(stock.change),
    current_price:
      toNumber(stock.current_price) ||
      toNumber(stock.latestPrice) ||
      toNumber(stock.price)
  };
};

export default function FeaturedStocks() {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    if (!loading && stocks.length > 0 && sectionRef.current && cardsRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      const cards = cardsRef.current.querySelectorAll('.stock-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 15, scale: 0.95 },
        { 
          opacity: 1, y: 0, scale: 1, 
          duration: 0.4, stagger: 0.08, 
          ease: "back.out(1.2)" 
        }
      );

      cards.forEach((card) => {
        const priceElements = card.querySelectorAll('.price-element');
        gsap.fromTo(
          priceElements,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, delay: 0.2, ease: "power1.out" }
        );

        const bar = card.querySelector('.price-bar-fill');
        if (bar) {
          gsap.fromTo(bar,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, delay: 0.4, ease: "power2.out" }
          );
        }
      });
    }
  }, [loading, stocks]);

  useEffect(() => {
    const fetchFeaturedStocks = async () => {
      try {
        const response = (await stockApi.getTrendingStocks()) as TrendingStocksResponse;
        logger.debug('Trending stocks response:', response);

        // Actual API shape: { success, data: { stocks: [...] } }
        // Fallback shapes: { success, data: [...] } or { success, data: { trending_stocks: {...} } }
        let rawStocks: unknown[] = [];

        if (
          response?.success &&
          typeof response.data === 'object' &&
          response.data !== null &&
          !Array.isArray(response.data) &&
          Array.isArray(response.data.stocks)
        ) {
          rawStocks = response.data.stocks;
        } else if (
          response?.success &&
          typeof response.data === 'object' &&
          response.data !== null &&
          !Array.isArray(response.data) &&
          response.data.trending_stocks
        ) {
          const g = response.data.trending_stocks.top_gainers || [];
          const l = response.data.trending_stocks.top_losers || [];
          rawStocks = [...g, ...l];
        } else if (response?.success && Array.isArray(response?.data)) {
          rawStocks = response.data;
        }

        if (rawStocks.length > 0) {
          setStocks(rawStocks.slice(0, 6).map(normalizeStock));
        } else {
          logger.debug('No stocks returned from API — using fallback');
          setStocks(fallbackStocks);
        }
      } catch (err) {
        logger.error('Failed to fetch featured stocks:', err);
        setError('Failed to fetch featured stocks');
        setStocks(fallbackStocks.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStocks();
  }, []);

  const fallbackStocks: Stock[] = [
    { id: 'RELIANCE', symbol: 'RELIANCE', company_name: 'Reliance Industries', sector_name: 'Oil & Gas', price_change_percentage: 0.96, current_price: 2457.35 },
    { id: 'TCS', symbol: 'TCS', company_name: 'Tata Consultancy Services', sector_name: 'Information Technology', price_change_percentage: 1.25, current_price: 3725.80 },
    { id: 'HDFCBANK', symbol: 'HDFCBANK', company_name: 'HDFC Bank', sector_name: 'Banking', price_change_percentage: -0.32, current_price: 1680.45 },
    { id: 'INFY', symbol: 'INFY', company_name: 'Infosys', sector_name: 'Information Technology', price_change_percentage: 0.85, current_price: 1560.30 },
    { id: 'BHARTIARTL', symbol: 'BHARTIARTL', company_name: 'Bharti Airtel', sector_name: 'Telecom', price_change_percentage: 1.20, current_price: 865.75 },
    { id: 'ICICIBANK', symbol: 'ICICIBANK', company_name: 'ICICI Bank', sector_name: 'Banking', price_change_percentage: -0.15, current_price: 992.50 },
  ];

  if (loading) {
    return (
      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <div>
                <div className="h-5 bg-gray-800/60 rounded-lg w-20 mb-2 shimmer" />
                <div className="h-4 bg-gray-800/60 rounded-lg w-36 shimmer" />
              </div>
              <div className="h-7 bg-gray-800/60 rounded-full w-20 shimmer" />
            </div>
            <div className="h-8 bg-gray-800/60 rounded-lg w-28 mb-4 shimmer" />
            <div className="h-2 bg-gray-800/60 rounded-full mb-4 shimmer" />
            <div className="h-10 bg-gray-800/60 rounded-lg shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700 text-center dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400">
        No featured stocks available at this time.
      </div>
    );
  }

  const formatNumber = (value: string | number): string => {
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    return '0.00';
  };

  const isPositive = (value: string | number): boolean => {
    if (typeof value === 'number') return value >= 0;
    if (typeof value === 'string') return parseFloat(value) >= 0;
    return true;
  };

  const maxPrice = Math.max(...stocks.map(stock => 
    typeof stock.current_price === 'number' 
      ? stock.current_price 
      : parseFloat(String(stock.current_price || 0))
  ));

  return (
    <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div ref={cardsRef} className="contents">
        {stocks.map((stock, index) => {
          const currentPrice = typeof stock.current_price === 'number' 
            ? stock.current_price 
            : parseFloat(String(stock.current_price || 0));
          
          const percentOfMax = (currentPrice / maxPrice) * 100;
          const positive = isPositive(stock.price_change_percentage);
          
          return (
            <div 
              key={stock.id || stock.symbol || index} 
              className="stock-card"
            >
              <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950 p-5 hover:shadow-md transition-shadow">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        <Link href={`/stocks/${stock.symbol}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                          {stock.symbol}
                        </Link>
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {stock.company_name || 'N/A'}
                      </p>
                    </div>
                    <span className={`price-element text-sm font-semibold rounded-full px-3 py-1 flex items-center ${
                      positive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {positive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                      {positive ? '+' : ''}
                      {formatNumber(stock.price_change_percentage)}%
                    </span>
                  </div>

                  <div className="price-element text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    ₹{currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>

                  {/* Price progress bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400">Price vs. Category</span>
                      <span className="text-slate-500 dark:text-slate-400">{Math.round(percentOfMax)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`price-bar-fill h-full ${
                          positive
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        } rounded-full`}
                        style={{ width: `${percentOfMax}%`, transformOrigin: 'left' }}
                      />
                    </div>
                  </div>

                  {/* Sector info */}
                  <div className="flex items-center text-sm mb-5 text-slate-500 dark:text-slate-400">
                    <BarChart2 size={14} className="mr-1.5" />
                    <span>{stock.sector_name || 'Various Sectors'}</span>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full flex items-center justify-center"
                    onClick={() => router.push(`/stocks/${stock.symbol}`)}
                  >
                    View Analysis
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}