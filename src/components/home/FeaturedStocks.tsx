'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as stockApi from '@/api/api';
import { StockData as Stock } from '@/types/stocks';
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
        // Fetch trending stocks from API
        console.log('Fetching trending stocks...');
        const response = await stockApi.getTrendingStocks();
        console.log('Trending stocks response:', response);
        
        if (response && response.success && response.data && Array.isArray(response.data)) {
          // Make sure we have data and it's an array
          if (response.data.length > 0) {
            const featuredStocks = response.data
              .slice(0, 6) // Limit to 6 stocks
              .map(normalizeStock);
            
            console.log('Normalized stocks:', featuredStocks);
            setStocks(featuredStocks);
          } else {
            console.log('API returned empty data array for trending stocks');
            // Use the fallback mock data
            setStocks([
              {
                id: 'RELIANCE',
                symbol: 'RELIANCE',
                company_name: 'Reliance Industries',
                sector_name: 'Oil & Gas',
                price_change_percentage: 0.96,
                current_price: 2457.35
              },
              {
                id: 'TCS',
                symbol: 'TCS',
                company_name: 'Tata Consultancy Services',
                sector_name: 'Information Technology',
                price_change_percentage: 1.25,
                current_price: 3725.80
              },
              {
                id: 'HDFCBANK',
                symbol: 'HDFCBANK',
                company_name: 'HDFC Bank',
                sector_name: 'Banking',
                price_change_percentage: -0.32,
                current_price: 1680.45
              },
              {
                id: 'INFY',
                symbol: 'INFY',
                company_name: 'Infosys',
                sector_name: 'Information Technology',
                price_change_percentage: 0.85,
                current_price: 1560.30
              }
            ]);
          }
        } else {
          // Mock data for fallback
          setStocks([
            {
              id: 'RELIANCE',
              symbol: 'RELIANCE',
              company_name: 'Reliance Industries',
              sector_name: 'Oil & Gas',
              price_change_percentage: 0.96,
              current_price: 2457.35
            },
            {
              id: 'TCS',
              symbol: 'TCS',
              company_name: 'Tata Consultancy Services',
              sector_name: 'Information Technology',
              price_change_percentage: 1.25,
              current_price: 3725.80
            },
            {
              id: 'HDFCBANK',
              symbol: 'HDFCBANK',
              company_name: 'HDFC Bank',
              sector_name: 'Banking',
              price_change_percentage: -0.32,
              current_price: 1680.45
            },
            {
              id: 'INFY',
              symbol: 'INFY',
              company_name: 'Infosys',
              sector_name: 'Information Technology',
              price_change_percentage: 0.85,
              current_price: 1560.30
            },
            {
              id: 'BHARTIARTL',
              symbol: 'BHARTIARTL',
              company_name: 'Bharti Airtel',
              sector_name: 'Telecom',
              price_change_percentage: 1.20,
              current_price: 865.75
            },
            {
              id: 'ICICIBANK',
              symbol: 'ICICIBANK',
              company_name: 'ICICI Bank',
              sector_name: 'Banking',
              price_change_percentage: -0.15,
              current_price: 992.50
            }
          ]);
          console.log('API returned unexpected data structure for featured stocks, using fallback');
        }
      } catch (err) {
        console.error('Failed to fetch featured stocks:', err);
        setError('Failed to fetch featured stocks');
        // Fallback data
        setStocks([
          {
            id: 'RELIANCE',
            symbol: 'RELIANCE',
            company_name: 'Reliance Industries',
            sector_name: 'Oil & Gas',
            price_change_percentage: 0.96,
            current_price: 2457.35
          },
          {
            id: 'TCS',
            symbol: 'TCS',
            company_name: 'Tata Consultancy Services',
            sector_name: 'Information Technology',
            price_change_percentage: 1.25,
            current_price: 3725.80
          },
          {
            id: 'HDFCBANK',
            symbol: 'HDFCBANK',
            company_name: 'HDFC Bank',
            sector_name: 'Banking',
            price_change_percentage: -0.32,
            current_price: 1680.45
          }
        ]);
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
          <div key={i} className="bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-lg p-6 animate-pulse border border-gray-700/50">
            <div className="h-4 bg-gray-600/50 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-600/50 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-600/50 rounded w-2/4 mb-6"></div>
            <div className="h-10 bg-gray-600/50 rounded"></div>
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
                  <div className="h-2 bg-gray-900/90 backdrop-blur-lg rounded-full overflow-hidden">
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