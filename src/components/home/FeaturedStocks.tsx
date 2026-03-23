'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as stockApi from '@/api/api';
import { StockData as Stock } from '@/types/stocks';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, BarChart2, ArrowRight } from 'lucide-react';

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
        console.log('Fetching trending stocks...');
        const response = await stockApi.getTrendingStocks();
        console.log('Trending stocks response:', response);
        
        if (response && response.success && response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            const featuredStocks = response.data
              .slice(0, 6)
              .map(normalizeStock);
            
            console.log('Normalized stocks:', featuredStocks);
            setStocks(featuredStocks);
          } else {
            console.log('API returned empty data array for trending stocks');
            setStocks(fallbackStocks);
          }
        } else {
          setStocks(fallbackStocks);
          console.log('API returned unexpected data structure for featured stocks, using fallback');
        }
      } catch (err) {
        console.error('Failed to fetch featured stocks:', err);
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
      <div className="glass-card rounded-xl p-4 border-red-500/20 text-red-400">
        {error}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4 border-yellow-500/20 text-yellow-400 text-center">
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
              className="stock-card glass-card card-shine rounded-xl overflow-hidden group"
            >
              {/* Top accent line */}
              <div className={`h-[2px] ${
                positive 
                  ? 'bg-gradient-to-r from-transparent via-green-400/50 to-transparent' 
                  : 'bg-gradient-to-r from-transparent via-red-400/50 to-transparent'
              }`} />
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-1">
                      <Link href={`/stocks/${stock.symbol}`} className="hover:text-neon-400 transition-colors duration-300">
                        {stock.symbol}
                      </Link>
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {stock.company_name || 'N/A'}
                    </p>
                  </div>
                  <span className={`price-element text-sm font-semibold rounded-full px-3 py-1 flex items-center ${
                    positive
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {positive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {positive ? '+' : ''}
                    {formatNumber(stock.price_change_percentage)}%
                  </span>
                </div>
                
                <div className="price-element text-2xl font-bold mb-4 text-white">
                  ₹{currentPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </div>
                
                {/* Price progress bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600">Price vs. Category</span>
                    <span className="text-gray-500">{Math.round(percentOfMax)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                    <div 
                      className={`price-bar-fill h-full ${
                        positive 
                          ? 'bg-gradient-to-r from-green-500/80 to-neon-400/60' 
                          : 'bg-gradient-to-r from-red-500/80 to-red-400/60'
                      } rounded-full`}
                      style={{ width: `${percentOfMax}%`, transformOrigin: 'left' }}
                    />
                  </div>
                </div>
                
                {/* Sector info */}
                <div className="flex items-center text-sm mb-5 text-gray-500">
                  <BarChart2 size={14} className="mr-1.5" />
                  <span>{stock.sector_name || 'Various Sectors'}</span>
                </div>
                
                {/* CTA */}
                <Link 
                  href={`/stocks/${stock.symbol}`}
                  className="group/btn flex items-center justify-center w-full py-2.5 rounded-lg border border-neon-400/20 bg-neon-400/[0.04] text-neon-400 text-sm font-medium hover:bg-neon-400/10 hover:border-neon-400/30 transition-all duration-300"
                >
                  View Analysis
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}