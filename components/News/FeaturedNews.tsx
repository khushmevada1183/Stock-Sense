'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as stockApi from '@/api/clientApi';
import { NewsItem } from '@/types/news';
import { Calendar, ExternalLink, Tag, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { gsap } from 'gsap';

interface FeaturedNewsItem extends NewsItem {
  category?: string;
  author?: string;
  summary?: string;
  imageUrl?: string;
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
        const response = await stockApi.getLatestNews();
        setFeaturedNews(response.news as FeaturedNewsItem[] || []);
      } catch (error) {
        console.error('Error fetching featured news:', error);
        setFeaturedNews([]);
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
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl overflow-hidden h-[400px] animate-pulse border border-gray-700/50">
        <div className="h-full w-full bg-gray-600/50"></div>
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
            className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg/80 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg/80 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      
      {/* Slide indicators */}
      {featuredNews.length > 1 && (
        <div className="absolute bottom-6 left-6 z-20 flex space-x-2">
          {featuredNews.map((item, index) => (
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