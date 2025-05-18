'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { stockService } from '@/services/api';
import { NewsItem } from '@/types/news';
import { getMockNewsData } from '@/services/mockHomeData';
import { gsap } from 'gsap';
import { Calendar, ExternalLink, Tag, ChevronRight } from 'lucide-react';

// Helper function to normalize news data
const normalizeNewsItem = (item: any): NewsItem => {
  return {
    id: item.id || Math.random().toString(36).substr(2, 9),
    title: item.title || '',
    source: item.source || 'News Source',
    date: item.date || item.published_at || new Date().toISOString(),
    content: item.content || '',
    summary: item.summary || item.content || '',
    url: item.url || '#',
    imageUrl: item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    category: item.category || 'markets',
    author: item.author || ''
  };
};

export default function LatestNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    if (!loading && news.length > 0 && sectionRef.current && cardsRef.current) {
      // Animate the section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Animate each card with staggered effect
      const cards = cardsRef.current.querySelectorAll('.news-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 15, scale: 0.98 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.4, 
          stagger: 0.1, 
          ease: "back.out(1.1)" 
        }
      );

      // Animate images with a slight delay
      cards.forEach((card) => {
        const image = card.querySelector('.news-image');
        if (image) {
          gsap.fromTo(
            image,
            { opacity: 0, scale: 1.1 },
            { 
              opacity: 1, 
              scale: 1, 
              duration: 0.6,
              delay: 0.3,
              ease: "power2.out" 
            }
          );
        }
      });
    }
  }, [loading, news]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // First try to use mock data directly
        const mockData = getMockNewsData();
        if (mockData && mockData.news && Array.isArray(mockData.news) && mockData.news.length > 0) {
          console.log('Using mock news data');
          // Transform mock data to match our component's expected format
          const formattedNews = mockData.news.map((item: any) => normalizeNewsItem(item));
          setNews(formattedNews);
          setLoading(false);
          return;
        }
        
        // If no mock data, fetch from the real API
        const response = await stockService.getMarketNews();
        
        if (response && response.news && Array.isArray(response.news)) {
          // Transform API data to match our component's expected format
          const formattedNews = response.news.map((item: any) => normalizeNewsItem(item));
          setNews(formattedNews);
        } else {
          setError('Invalid data format received from server');
          setNews([]);
        }
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError('Failed to load latest news');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800 animate-pulse">
            <div className="h-40 bg-gray-800"></div>
            <div className="p-5">
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2 mb-4"></div>
              <div className="h-16 bg-gray-800 rounded mb-4"></div>
              <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            </div>
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

  if (news.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-gray-400 text-center">
        No news articles available at this time.
      </div>
    );
  }

  // Get only the latest 2 news items for a more compact display
  const displayedNews = news.slice(0, 2);

  return (
    <div ref={sectionRef} className="space-y-6">
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedNews.map((item) => (
          <div key={item.id} className="news-card bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 flex flex-col h-full">
            <div className="h-40 relative overflow-hidden">
              <div className="news-image opacity-0 w-full h-full">
                <img 
                  src={item.imageUrl || item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
              </div>
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-blue-900/70 text-blue-300 text-xs font-medium rounded-md border border-blue-800">
                  {item.category || 'Markets'}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-bold text-white line-clamp-2 text-shadow">
                  {item.title}
                </h3>
              </div>
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-blue-400 font-medium flex items-center">
                  <Tag size={14} className="mr-1.5" />
                  {item.source}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Calendar size={12} className="mr-1.5" />
                  {formatDate(item.date)}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                {item.summary}
              </p>
              
              <Link 
                href={item.url}
                target="_blank"
                className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors mt-auto"
              >
                Read Full Article <ExternalLink size={14} className="ml-1.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Link 
          href="/news"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium inline-flex items-center transition-colors border border-gray-700"
        >
          View More News <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (e) {
    return dateString;
  }
}

// CSS to add to your global styles
const styles = `
  .text-shadow {
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  }
`; 