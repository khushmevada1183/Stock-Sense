'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { stockService } from '@/services/api';
import { NewsItem } from '@/services/api/types';
import { gsap } from 'gsap';

// Mock sector news data
const MOCK_SECTOR_NEWS = {
  technology: [
    {
      id: 'tech-1',
      title: 'Indian IT Companies Report Strong Q1 Results Despite Global Headwinds',
      description: 'Major Indian IT firms including TCS, Infosys, and Wipro have reported better-than-expected Q1 results, showing resilience despite global economic challenges.',
      url: '#',
      date: new Date().toISOString(),
      source: 'Economic Times',
      imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop'
    },
    {
      id: 'tech-2',
      title: 'Government Launches Digital India 2.0 with ₹10,000 Crore Investment',
      description: 'The Indian government has announced the Digital India 2.0 initiative with a substantial investment to boost technology infrastructure and digital literacy across the country.',
      url: '#',
      date: new Date(Date.now() - 86400000).toISOString(),
      source: 'Business Standard',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop'
    }
  ],
  banking: [
    {
      id: 'bank-1',
      title: 'RBI Issues New Guidelines for Digital Lending Platforms',
      description: 'The Reserve Bank of India has issued new regulatory guidelines for digital lending platforms to ensure transparency and protect consumer interests.',
      url: '#',
      date: new Date().toISOString(),
      source: 'Financial Express',
      imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'bank-2',
      title: 'HDFC Bank-HDFC Merger Creates India\'s Largest Private Bank',
      description: 'The merger between HDFC Bank and HDFC has been completed, creating India\'s largest private bank with a market capitalization exceeding ₹12 lakh crore.',
      url: '#',
      date: new Date(Date.now() - 172800000).toISOString(),
      source: 'Mint',
      imageUrl: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?q=80&w=2070&auto=format&fit=crop'
    }
  ],
  pharma: [
    {
      id: 'pharma-1',
      title: 'Indian Pharma Exports Reach Record $25 Billion',
      description: 'Indian pharmaceutical exports have reached a record $25 billion in the last fiscal year, growing at 8% despite global supply chain challenges.',
      url: '#',
      date: new Date().toISOString(),
      source: 'Pharma Biz',
      imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b4123a3a?q=80&w=2069&auto=format&fit=crop'
    },
    {
      id: 'pharma-2',
      title: 'Sun Pharma Acquires US-Based Dermatology Company for $500 Million',
      description: 'Sun Pharmaceutical Industries has announced the acquisition of a US-based dermatology company for $500 million to strengthen its specialty product portfolio.',
      url: '#',
      date: new Date(Date.now() - 259200000).toISOString(),
      source: 'CNBC-TV18',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2080&auto=format&fit=crop'
    }
  ],
  auto: [
    {
      id: 'auto-1',
      title: 'Maruti Suzuki Unveils India\'s First Flex-Fuel Car',
      description: 'Maruti Suzuki has unveiled India\'s first flex-fuel vehicle that can run on multiple fuel options, including ethanol blends up to E85.',
      url: '#',
      date: new Date().toISOString(),
      source: 'Auto Car India',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2071&auto=format&fit=crop'
    },
    {
      id: 'auto-2',
      title: 'Tata Motors Becomes Third Largest Global EV Manufacturer',
      description: 'Tata Motors has emerged as the third largest electric vehicle manufacturer globally, with its EV sales growing by 150% in the last financial year.',
      url: '#',
      date: new Date(Date.now() - 345600000).toISOString(),
      source: 'ET Auto',
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba13a3760?q=80&w=2072&auto=format&fit=crop'
    }
  ]
};

interface SectorNewsItem extends NewsItem {
  sector?: string;
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
  source: string;
  imageUrl?: string;
}

interface SectorNewsMap {
  [key: string]: SectorNewsItem[];
}

export default function SectorNews() {
  const [sectorNews, setSectorNews] = useState<SectorNewsMap>({});
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState('technology');
  const [sectors, setSectors] = useState<string[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    if (!loading && sectionRef.current) {
      // Animate the section
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.sector-news-item'),
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.1, 
          ease: "power2.out" 
        }
      );
    }
  }, [loading, activeSector]);

  useEffect(() => {
    const fetchSectorNews = async () => {
      try {
        setLoading(true);
        
        // Try to get news from the API - this would need to be implemented in your backend
        // For now, we'll use mock data
        try {
          const response = await stockService.getMarketNews();
          
          if (response && response.news && Array.isArray(response.news) && response.news.length > 0) {
            // In a real implementation, we would categorize news by sector
            // For this mock, we'll just use our mock data
            setSectorNews(MOCK_SECTOR_NEWS);
            setSectors(Object.keys(MOCK_SECTOR_NEWS));
          } else {
            // Use mock data if API doesn't return sector-specific news
            setSectorNews(MOCK_SECTOR_NEWS);
            setSectors(Object.keys(MOCK_SECTOR_NEWS));
          }
        } catch (error) {
          console.error('Error fetching sector news:', error);
          // Use mock data on error
          setSectorNews(MOCK_SECTOR_NEWS);
          setSectors(Object.keys(MOCK_SECTOR_NEWS));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSectorNews();
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getSectorDisplayName = (sector: string) => {
    const sectorNames: {[key: string]: string} = {
      'technology': 'Technology & IT',
      'banking': 'Banking & Finance',
      'pharma': 'Pharmaceutical',
      'auto': 'Automotive',
      'energy': 'Energy & Power',
      'fmcg': 'Consumer Goods',
      'realestate': 'Real Estate'
    };
    
    return sectorNames[sector] || sector.charAt(0).toUpperCase() + sector.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-8 w-24 bg-gray-800 rounded-full"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2 mb-2"></div>
              <div className="h-24 bg-gray-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (Object.keys(sectorNews).length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-gray-400 text-center">
        No sector news available at this time.
      </div>
    );
  }

  return (
    <div ref={sectionRef}>
      {/* Sector tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setActiveSector(sector)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeSector === sector
                ? 'bg-purple-900/70 text-purple-200 border border-purple-800'
                : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            {getSectorDisplayName(sector)}
          </button>
        ))}
      </div>

      {/* News grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {sectorNews[activeSector]?.map((item) => (
          <Card key={item.id} className="sector-news-item bg-gray-900 border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                {item.imageUrl && (
                  <div className="w-full h-32 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-2 flex items-start">
                    <span>{item.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1 mt-1 opacity-70" />
                  </h3>
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-2 mb-2">
                    <span>{item.source}</span>
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View more link */}
      <div className="mt-4 text-right">
        <a 
          href="#" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
        >
          View all {getSectorDisplayName(activeSector)} news
          <ChevronRight size={16} className="ml-1" />
        </a>
      </div>
    </div>
  );
} 