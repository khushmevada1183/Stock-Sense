'use client';

import React, { useState, useEffect, useRef } from 'react';
import { stockService } from '@/services/api';
import { NewsItem } from '@/services/api/types';
import { Calendar, ExternalLink, Tag, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { gsap } from 'gsap';

// Mock featured news data
const MOCK_FEATURED_NEWS = [
  {
    id: '1',
    title: 'RBI Keeps Repo Rate Unchanged at 6.5% for Seventh Consecutive Time',
    description: 'The Reserve Bank of India (RBI) has kept the repo rate unchanged at 6.5% for the seventh consecutive time, maintaining its focus on inflation control while supporting growth. Governor Shaktikanta Das announced the decision after the three-day monetary policy committee meeting.',
    summary: 'The Reserve Bank of India (RBI) has kept the repo rate unchanged at 6.5% for the seventh consecutive time, maintaining its focus on inflation control while supporting growth.',
    url: 'https://economictimes.indiatimes.com/markets/stocks/news/rbi-policy-mpc-keeps-repo-rate-unchanged-at-6-5-for-7th-time-in-a-row/articleshow/109861234.cms',
    date: new Date().toISOString(),
    source: 'Economic Times',
    imageUrl: 'https://img.etimg.com/thumb/msid-109861234,width-650,height-488,imgsize-35672,resizemode-75/rbi-policy-mpc-keeps-repo-rate-unchanged-at-6-5-for-7th-time-in-a-row.jpg',
    category: 'economy',
    author: 'ET Bureau'
  },
  {
    id: '2',
    title: 'Sensex, Nifty Hit Fresh Record Highs Led by Banking and IT Stocks',
    description: 'Indian benchmark indices Sensex and Nifty hit fresh record highs on Friday, led by strong gains in banking and IT stocks. The 30-share BSE Sensex crossed the 75,000 mark for the first time, while the NSE Nifty surpassed 22,800. HDFC Bank, Infosys, and TCS were among the top gainers.',
    summary: 'Indian benchmark indices Sensex and Nifty hit fresh record highs on Friday, led by strong gains in banking and IT stocks.',
    url: 'https://www.livemint.com/market/stock-market-news/stock-market-today-sensex-nifty-hit-fresh-record-highs-led-by-banking-it-stocks-11621234567890.html',
    date: new Date(Date.now() - 3600000).toISOString(),
    source: 'Mint',
    imageUrl: 'https://images.livemint.com/img/2023/05/17/600x338/sensex_nifty_stock_market_1684293546661_1684293546896.jpg',
    category: 'markets',
    author: 'Mint Markets'
  },
  {
    id: '3',
    title: 'Reliance Industries Plans $10 Billion Investment in Green Energy Sector',
    description: 'Reliance Industries has announced plans to invest $10 billion in green energy projects over the next three years. The conglomerate aims to build four giga factories for solar panels, energy storage, green hydrogen, and fuel cells at its Jamnagar complex in Gujarat. This move aligns with India\'s goal to achieve net-zero carbon emissions by 2070.',
    summary: 'Reliance Industries has announced plans to invest $10 billion in green energy projects over the next three years, building four giga factories at its Jamnagar complex.',
    url: 'https://www.business-standard.com/companies/news/reliance-industries-plans-10-billion-investment-in-green-energy-sector-123051600789_1.html',
    date: new Date(Date.now() - 7200000).toISOString(),
    source: 'Business Standard',
    imageUrl: 'https://bsmedia.business-standard.com/include/_mod/site/images/no-image-680x400.jpg',
    category: 'companies',
    author: 'BS Reporter'
  }
];

interface FeaturedNewsItem extends NewsItem {
  category?: string;
  author?: string;
  summary?: string;
}

export default function FeaturedNews() {
  const [featuredNews, setFeaturedNews] = useState<FeaturedNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    if (!loading && featuredNews.length > 0 && sectionRef.current) {
      // Animate the section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Animate the current slide
      if (slideRef.current) {
        const elements = slideRef.current.querySelectorAll('.animate-item');
        gsap.fromTo(
          elements,
          { opacity: 0, y: 15 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: "power1.out" 
          }
        );
      }
    }
  }, [loading, featuredNews, currentSlide]);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        setLoading(true);
        
        // Try to get news from the API
        const response = await stockService.getMarketNews();
        
        if (response && response.news && Array.isArray(response.news) && response.news.length > 0) {
          // Transform and use the first 3 news items as featured
          const formattedNews = response.news.slice(0, 3).map(item => ({
            ...item,
            category: 'markets',
            author: item.source
          }));
          setFeaturedNews(formattedNews);
        } else {
          // Use mock data if API fails
          setFeaturedNews(MOCK_FEATURED_NEWS);
        }
      } catch (error) {
        console.error('Error fetching featured news:', error);
        // Use mock data on error
        setFeaturedNews(MOCK_FEATURED_NEWS);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl overflow-hidden h-[400px] animate-pulse">
        <div className="h-full w-full bg-gray-800"></div>
      </div>
    );
  }

  if (featuredNews.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-gray-400 text-center">
        No featured news available at this time.
      </div>
    );
  }

  const currentNews = featuredNews[currentSlide];

  return (
    <div ref={sectionRef} className="relative">
      <div 
        ref={slideRef}
        className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 relative h-[400px]"
      >
        {/* Image with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full">
            <img 
              src={currentNews.imageUrl} 
              alt={currentNews.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
          <div className="animate-item">
            <span className="px-2 py-1 bg-blue-900/70 text-blue-300 text-xs font-medium rounded-md border border-blue-800 mb-4 inline-block">
              {currentNews.category || 'Markets'}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 animate-item text-shadow">
            {currentNews.title}
          </h2>
          
          <p className="text-gray-300 mb-4 line-clamp-2 animate-item text-shadow">
            {currentNews.summary || currentNews.description}
          </p>
          
          <div className="flex justify-between items-center animate-item">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 flex items-center">
                <Calendar size={14} className="mr-1.5" />
                {formatDate(currentNews.date)}
              </span>
              <span className="text-sm text-gray-300">
                {currentNews.source}
              </span>
            </div>
            
            <Link 
              href={currentNews.url}
              target="_blank"
              className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Read Full Article <ExternalLink size={14} className="ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Navigation controls */}
      {featuredNews.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex space-x-2">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      
      {/* Slide indicators */}
      {featuredNews.length > 1 && (
        <div className="absolute bottom-6 left-6 z-20 flex space-x-2">
          {featuredNews.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentSlide 
                  ? 'bg-blue-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              } transition-colors`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 