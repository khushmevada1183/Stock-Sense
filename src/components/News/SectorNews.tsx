'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';

interface SectorNewsItem {
  sector?: string;
  id?: string | number;
  title: string;
  description?: string;
  summary?: string;
  url: string;
  date?: string;
  pub_date?: string;
  source: string;
  imageUrl?: string | null;
  image_url?: string | null;
}

interface SectorNewsMap {
  [key: string]: SectorNewsItem[];
}

interface SectorNewsProps {
  newsData?: SectorNewsItem[];
  loading?: boolean;
  error?: string;
}

export default function SectorNews({ newsData = [], loading = false, error = '' }: SectorNewsProps) {
  const [activeSector, setActiveSector] = useState('technology');
  const sectionRef = useRef<HTMLDivElement>(null);

  const sectorNews = useMemo<SectorNewsMap>(() => {
    const categorizedNews: SectorNewsMap = {
      technology: [],
      finance: [],
      healthcare: [],
      energy: [],
      general: []
    };

    newsData.forEach((item) => {
      const title = item.title.toLowerCase();
      const summary = (item.summary || item.description || '').toLowerCase();
      const content = `${title} ${summary}`;

      if (content.includes('tech') || content.includes('software') || content.includes('digital') || content.includes('ai') || content.includes('cyber')) {
        categorizedNews.technology.push(item);
      } else if (content.includes('bank') || content.includes('finance') || content.includes('market') || content.includes('stock') || content.includes('investment')) {
        categorizedNews.finance.push(item);
      } else if (content.includes('health') || content.includes('pharma') || content.includes('medical') || content.includes('drug')) {
        categorizedNews.healthcare.push(item);
      } else if (content.includes('energy') || content.includes('oil') || content.includes('gas') || content.includes('renewable') || content.includes('coal')) {
        categorizedNews.energy.push(item);
      } else {
        categorizedNews.general.push(item);
      }
    });

    return categorizedNews;
  }, [newsData]);

  const sectors = useMemo(
    () => Object.keys(sectorNews).filter((sector) => sectorNews[sector].length > 0),
    [sectorNews]
  );

  const activeSectorKey = sectors.includes(activeSector) ? activeSector : sectors[0] || 'general';

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

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get sector display name
  const getSectorDisplayName = (sector: string) => {
    const names: { [key: string]: string } = {
      technology: 'Technology',
      finance: 'Finance & Banking',
      healthcare: 'Healthcare',
      energy: 'Energy',
      general: 'General News'
    };
    return names[sector] || sector;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 glass">
        <div className="animate-pulse">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-700 rounded w-20"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 glass">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentSectorNews = sectorNews[activeSectorKey] || [];

  return (
    <div ref={sectionRef} className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 glass">
      {/* Sector Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setActiveSector(sector)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSectorKey === sector
                ? 'bg-neon-400 text-black shadow-neon-sm'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
            }`}
          >
            {getSectorDisplayName(sector)}
            {sectorNews[sector] && (
              <span className="ml-2 text-xs opacity-70">
                ({sectorNews[sector].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* News Items */}
      <div className="space-y-4">
        {currentSectorNews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No news available for {getSectorDisplayName(activeSectorKey)} sector.
          </div>
        ) : (
          currentSectorNews.slice(0, 6).map((item, index) => (
            <Card key={item.id || index} className="sector-news-item bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {(item.image_url || item.imageUrl) && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url || item.imageUrl || undefined}
                        alt={item.title}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    
                    {(item.summary || item.description) && (
                      <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                        {item.summary || item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{formatDate(item.pub_date || item.date || '')}</span>
                      </div>
                      
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-neon-400 hover:text-neon-300 transition-colors"
                      >
                        Read More
                        <ChevronRight size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View All Link */}
      {currentSectorNews.length > 6 && (
        <div className="text-center mt-6">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-700/50">
            View All {getSectorDisplayName(activeSectorKey)} News
            <ExternalLink size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
