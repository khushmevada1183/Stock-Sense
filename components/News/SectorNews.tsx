'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ChevronRight } from 'lucide-react';
import * as stockApi from '@/api/clientApi';
import { NewsItem } from '@/types/news';
import { gsap } from 'gsap';

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
        const response = await stockApi.getMarketNews();
        // Assuming the API returns sector-specific news; adjust accordingly
        const formattedNews = response.news.reduce((acc: { [key: string]: NewsItem[] }, item: NewsItem) => {
          const sector = item.sector || 'general';
          if (!acc[sector]) acc[sector] = [];
          acc[sector].push(item);
          return acc;
        }, {});
        setSectorNews(formattedNews);
        setSectors(Object.keys(formattedNews));
      } catch (error) {
        console.error('Error fetching sector news:', error);
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
            <div key={i} className="animate-pulse h-8 w-24 bg-gray-900/90 backdrop-blur-lg rounded-full border border-gray-700/50"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-900/90 backdrop-blur-lg rounded w-3/4 mb-2 border border-gray-700/50"></div>
              <div className="h-3 bg-gray-900/90 backdrop-blur-lg rounded w-1/2 mb-2 border border-gray-700/50"></div>
              <div className="h-24 bg-gray-900/90 backdrop-blur-lg rounded w-full border border-gray-700/50"></div>
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
                : 'bg-gray-900/90 backdrop-blur-lg text-gray-300 border border-gray-700 hover:bg-gray-700'
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