'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { stockService } from '@/services/api';
import { Stock } from '@/types/stocks';
import { getMockFeaturedStocks } from '@/services/mockHomeData';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, BarChart2, DollarSign } from 'lucide-react';

// Helper function to normalize stock data across different formats
const normalizeStock = (stock: any): Stock => {
  return {
    id: stock.id || stock.symbol || '',
    symbol: stock.symbol || '',
    company_name: stock.company_name || stock.companyName || '',
    sector_name: stock.sector_name || stock.sector || '',
    price_change_percentage: stock.price_change_percentage || 
                             stock.changePercent || 
                             stock.change_percent || 
                             stock.change || 0,
    current_price: stock.current_price || stock.latestPrice || stock.price || 0
  };
};

export default function FeaturedStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    if (!loading && stocks.length > 0 && sectionRef.current && cardsRef.current) {
      // Animate the section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Animate each card with staggered effect
      const cards = cardsRef.current.querySelectorAll('.stock-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 15, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.4, 
          stagger: 0.1, 
          ease: "back.out(1.2)" 
        }
      );

      // Animate price elements
      cards.forEach((card) => {
        const priceElements = card.querySelectorAll('.price-element');
        gsap.fromTo(
          priceElements,
          { opacity: 0, y: -10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.3, 
            stagger: 0.1,
            delay: 0.2,
            ease: "power1.out" 
          }
        );

        // Animate the horizontal bar
        const bar = card.querySelector('.price-bar-fill');
        if (bar) {
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            { 
              scaleX: 1, 
              duration: 0.8, 
              delay: 0.4,
              ease: "power2.out" 
            }
          );
        }
      });
    }
  }, [loading, stocks]);

  useEffect(() => {
    const fetchFeaturedStocks = async () => {
      try {
        // First try to use mock data directly
        const mockStocks = getMockFeaturedStocks();
        if (mockStocks && mockStocks.length > 0) {
          console.log('Using mock featured stocks data');
          setStocks(mockStocks);
          setLoading(false);
          return;
        }
        
        // If no mock data, fetch from API
        const data = await stockService.getFeaturedStocks();
        console.log('Featured stocks data:', data);
        
        if (data && Array.isArray(data)) {
          // Direct array of stocks
          setStocks(data.map(normalizeStock));
        } else if (data && data.stocks && Array.isArray(data.stocks)) {
          // Stocks wrapped in a 'stocks' property
          setStocks(data.stocks.map(normalizeStock));
        } else if (data && typeof data === 'object') {
          // No clear array structure, try to extract stocks from the object
          const extractedStocks: any[] = [];
          
          // Handle nested arrays like top_gainers, top_losers, etc.
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              extractedStocks.push(...value);
            }
          });
          
          if (extractedStocks.length > 0) {
            setStocks(extractedStocks.map(normalizeStock));
          } else {
            setError('No stocks data found');
          }
        } else {
          setError('Invalid stocks data format');
        }
      } catch (err: any) {
        setError('Failed to load featured stocks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStocks();
  }, []);

  if (loading) {
    return (
      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl shadow-lg p-6 animate-pulse border border-gray-800">
            <div className="h-4 bg-gray-800 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-2/4 mb-6"></div>
            <div className="h-10 bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-800 rounded-xl p-4 text-yellow-400 text-center">
        No featured stocks available at this time.
      </div>
    );
  }

  // Helper function to format a number with 2 decimal places
  const formatNumber = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    return '0.00';
  };

  // Helper function to check if a value is positive
  const isPositive = (value: string | number): boolean => {
    if (typeof value === 'number') {
      return value >= 0;
    }
    if (typeof value === 'string') {
      return parseFloat(value) >= 0;
    }
    return true;
  };

  // Calculate the max price for scaling the bars
  const maxPrice = Math.max(...stocks.map(stock => 
    typeof stock.current_price === 'number' 
      ? stock.current_price 
      : parseFloat(String(stock.current_price || 0))
  ));

  return (
    <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="stock-card bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-800 hover:border-gray-700"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-1">
                      <Link href={`/stocks/${stock.symbol}`} className="hover:text-blue-400">
                        {stock.symbol}
                      </Link>
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {stock.company_name || 'N/A'}
                    </p>
                  </div>
                  <span className={`price-element text-sm font-semibold rounded-full px-3 py-1 flex items-center ${
                    positive
                      ? 'bg-green-900/40 text-green-400 border border-green-800' 
                      : 'bg-red-900/40 text-red-400 border border-red-800'
                  }`}>
                    {positive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {positive ? '+' : ''}
                    {formatNumber(stock.price_change_percentage)}%
                  </span>
                </div>
                
                <div className="price-element text-2xl font-bold mb-3 text-gray-100">
                  ₹{currentPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Price vs. Category</span>
                    <span className="text-gray-400">{Math.round(percentOfMax)}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`price-bar-fill h-full ${positive ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400'} rounded-full`}
                      style={{ width: `${percentOfMax}%`, transformOrigin: 'left' }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-4">
                  <div className="flex items-center text-gray-400">
                    <BarChart2 size={14} className="mr-1" />
                    <span>{stock.sector_name || 'Various Sectors'}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <DollarSign size={14} className="mr-1" />
                    <span>Volume: 2.3M</span>
                  </div>
                </div>
                
                <Link 
                  href={`/stocks/${stock.symbol}`}
                  className="block text-center w-full py-2 border border-blue-700 bg-blue-900/30 text-blue-400 hover:bg-blue-800 hover:text-blue-100 rounded-lg transition-colors"
                >
                  View Analysis
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 