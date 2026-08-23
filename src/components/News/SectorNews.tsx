'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { contentCardClass, secondaryButtonClass, tabActiveClass } from '@/styles/design-tokens';

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
      general: [],
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

  useEffect(() => {
    if (!loading && sectionRef.current) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.sector-news-item'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [loading, activeSector]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return 'Invalid date';
    }
  };

  const getSectorDisplayName = (sector: string) => {
    const names: Record<string, string> = {
      technology: 'Technology',
      finance: 'Finance & Banking',
      healthcare: 'Healthcare',
      energy: 'Energy',
      general: 'General News',
    };
    return names[sector] || sector;
  };

  if (loading) {
    return (
      <div className={`${contentCardClass} p-6`}>
        <div className="animate-pulse">
          <div className="mb-4 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-20 rounded bg-slate-200 dark:bg-white/10" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded bg-slate-200 dark:bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${contentCardClass} p-6`}>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentSectorNews = sectorNews[activeSectorKey] || [];

  return (
    <div ref={sectionRef} className={`${contentCardClass} p-6`}>
      <div className="mb-6 flex flex-wrap gap-2">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setActiveSector(sector)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeSectorKey === sector
                ? tabActiveClass
                : `${secondaryButtonClass} border`
            }`}
          >
            {getSectorDisplayName(sector)}
            {sectorNews[sector] && (
              <span className="ml-2 text-xs opacity-70">({sectorNews[sector].length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {currentSectorNews.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            No news available for {getSectorDisplayName(activeSectorKey)} sector.
          </div>
        ) : (
          currentSectorNews.slice(0, 6).map((item, index) => (
            <Card
              key={item.id || index}
              className="sector-news-item border border-slate-200/70 bg-white/50 transition-all duration-200 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {(item.image_url || item.imageUrl) && (
                    <div className="shrink-0">
                      <img
                        src={item.image_url || item.imageUrl || undefined}
                        alt={item.title}
                        className="h-16 w-20 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight text-slate-950 dark:text-white">
                      {item.title}
                    </h3>

                    {(item.summary || item.description) && (
                      <p className="mb-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                        {item.summary || item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{formatDate(item.pub_date || item.date || '')}</span>
                      </div>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
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

      {currentSectorNews.length > 6 && (
        <div className="mt-6 text-center">
          <button className={`${secondaryButtonClass} inline-flex items-center gap-2 border`}>
            View All {getSectorDisplayName(activeSectorKey)} News
            <ExternalLink size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
