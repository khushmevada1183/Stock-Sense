'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '@/types/news';
import { Calendar, ExternalLink, Tag, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { gsap } from 'gsap';
import { contentCardClass, primaryButtonClass } from '@/styles/design-tokens';

interface FeaturedNewsItem extends NewsItem {
  category?: string;
  author?: string;
  summary?: string;
  description?: string;
  imageUrl?: string | null;
  image_url?: string | null;
  pub_date?: string;
}

interface FeaturedNewsProps {
  newsData?: FeaturedNewsItem[];
  loading?: boolean;
  error?: string;
}

const FALLBACK_NEWS_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"%3E%3Crect width="1200" height="675" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="44" fill="%239ca3af"%3ENews%20Image%3C/text%3E%3C/svg%3E';

export default function FeaturedNews({ newsData = [], loading = false, error = '' }: FeaturedNewsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  const featuredNews = Array.isArray(newsData) ? newsData.slice(0, 5) : [];

  useEffect(() => {
    if (!loading && featuredNews.length > 0 && sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      if (slideRef.current) {
        const elements = slideRef.current.querySelectorAll('.animate-item');
        gsap.fromTo(
          elements,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power1.out' }
        );
      }
    }
  }, [loading, featuredNews, currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className={`${contentCardClass} p-6`}>
        <div className="animate-pulse">
          <div className="mb-4 h-64 rounded-lg bg-slate-200 dark:bg-white/10" />
          <div className="mb-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
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

  if (featuredNews.length === 0) {
    return (
      <div className={`${contentCardClass} p-6`}>
        <div className="py-8 text-center text-slate-500 dark:text-slate-400">
          No featured news available at the moment.
        </div>
      </div>
    );
  }

  const currentNews = featuredNews[currentSlide];

  return (
    <div ref={sectionRef} className={`${contentCardClass} overflow-hidden`}>
      <div className="relative h-96">
        <div className="absolute inset-0">
          <img
            src={currentNews.image_url || currentNews.imageUrl || FALLBACK_NEWS_IMAGE}
            alt={currentNews.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = FALLBACK_NEWS_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {featuredNews.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/50"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div ref={slideRef} className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {currentNews.category && (
              <span className="animate-item rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                <Tag size={12} className="mr-1 inline" />
                {currentNews.category}
              </span>
            )}
            <span className="animate-item rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
              FEATURED
            </span>
          </div>

          <h1 className="animate-item mb-3 text-2xl font-bold leading-tight text-white">{currentNews.title}</h1>

          <p className="animate-item mb-4 line-clamp-2 text-sm text-slate-300">
            {currentNews.summary || currentNews.description || 'No summary available.'}
          </p>

          <div className="animate-item flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(currentNews.pub_date || currentNews.date)}
              </span>
              <span>{currentNews.source}</span>
              {currentNews.author && <span>By {currentNews.author}</span>}
            </div>

            <a
              href={currentNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${primaryButtonClass} inline-flex items-center gap-2`}
            >
              Read More
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {featuredNews.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex gap-2">
              {featuredNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    index === currentSlide ? 'w-4 bg-emerald-400' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
