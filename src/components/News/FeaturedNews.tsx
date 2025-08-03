'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '@/types/news';
import { Calendar, ExternalLink, Tag, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { gsap } from 'gsap';

interface FeaturedNewsItem extends NewsItem {
  category?: string;
  author?: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  pub_date?: string;
}

interface FeaturedNewsProps {
  newsData: FeaturedNewsItem[];
  loading: boolean;
  error: string;
}

export default function FeaturedNews({ newsData, loading, error }: FeaturedNewsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Take first 5 news items as featured
  const featuredNews = Array.isArray(newsData) ? newsData.slice(0, 5) : [];

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 glass">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
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

  if (featuredNews.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 glass">
        <div className="text-center py-8 text-gray-300">
          No featured news available at the moment.
        </div>
      </div>
    );
  }

  const currentNews = featuredNews[currentSlide];

  return (
    <div ref={sectionRef} className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden glass">
      <div className="relative h-96">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={currentNews.image_url || currentNews.imageUrl || '/images/news-placeholder.jpg'}
            alt={currentNews.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop if placeholder also fails
              target.src = '/images/news-placeholder.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
        </div>

        {/* Navigation Arrows */}
        {featuredNews.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Content */}
        <div ref={slideRef} className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {currentNews.category && (
              <span className="animate-item px-3 py-1 bg-neon-400/20 text-neon-400 text-xs font-medium rounded-full border border-neon-400/30">
                <Tag size={12} className="inline mr-1" />
                {currentNews.category}
              </span>
            )}
            <span className="animate-item px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
              FEATURED
            </span>
          </div>

          <h1 className="animate-item text-2xl font-bold text-white mb-3 leading-tight">
            {currentNews.title}
          </h1>

          <p className="animate-item text-gray-300 text-sm mb-4 line-clamp-2">
            {currentNews.summary || currentNews.description || 'No summary available.'}
          </p>

          <div className="animate-item flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-neon-400 hover:bg-neon-300 text-black font-medium rounded-lg transition-colors hover:shadow-neon-sm"
            >
              Read More
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Slide Indicators */}
        {featuredNews.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex gap-2">
              {featuredNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-neon-400 w-4'
                      : 'bg-white/30 hover:bg-white/50'
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
