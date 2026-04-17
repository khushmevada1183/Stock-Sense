'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Hash } from 'lucide-react';
import { gsap } from 'gsap';
import { getTrendingNews } from '@/api/api';
import { logger } from '@/lib/logger';

interface TrendingTopic {
  id: number;
  topic: string;
  count: number;
  change: number;
  category: string;
}

export default function TrendingTopics() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLUListElement>(null);

  // Initialize animations
  useEffect(() => {
    if (!loading && listRef.current) {
      // Animate the list items
      gsap.fromTo(
        listRef.current.querySelectorAll('.trend-item'),
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          stagger: 0.08, 
          ease: "power1.out" 
        }
      );
    }
  }, [loading]);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setLoading(true);

        const response = await getTrendingNews({ limit: 20 });
        const payload = response?.data || response;

        const articles = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.articles)
            ? payload.articles
            : Array.isArray(payload?.news)
              ? payload.news
              : [];

        const topics: TrendingTopic[] = articles.slice(0, 8).map((article: Record<string, unknown>, index: number) => {
          const title = String(article.title || 'Market Update').trim();
          const normalizedTopic = title.split(' ').slice(0, 3).join(' ');
          const sentiment = Number(article.sentiment || 0);

          return {
            id: Number(article.id || index + 1),
            topic: normalizedTopic,
            count: Number(article.rank || articles.length - index) * 100,
            change: Number.isFinite(sentiment) ? Math.round(sentiment * 100) : 0,
            category: String(article.category || 'markets'),
          };
        });

        setTrendingTopics(topics);
      } catch (error) {
        logger.error('Error fetching trending topics:', error);
        setTrendingTopics([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchTrendingTopics();
  }, []);

  // Function to get category badge color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'economy':
        return 'bg-blue-900/50 text-blue-300 border-blue-800';
      case 'stocks':
        return 'bg-green-900/50 text-green-300 border-green-800';
      case 'crypto':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-800';
      case 'policy':
        return 'bg-purple-900/50 text-purple-300 border-purple-800';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-700 rounded-full"></div>
              <div className="h-3 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-3 bg-gray-700 rounded w-10"></div>
          </div>
        ))}
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4">
        No trending topics available.
      </div>
    );
  }

  return (
    <div>
      <ul ref={listRef} className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <li key={topic.id} className="trend-item">
            <a href="#" className="flex items-center justify-between group">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-xs font-medium">#{index + 1}</span>
                <span className="text-gray-200 group-hover:text-blue-300 transition-colors">
                  {topic.topic}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${getCategoryColor(topic.category)}`}>
                  {topic.category}
                </span>
              </div>
              <div className={`flex items-center text-xs font-medium ${
                topic.change > 0 ? 'text-green-400' : topic.change < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {topic.change > 0 && '+'}{topic.change}%
              </div>
            </a>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 pt-3 border-t border-gray-800">
        <a 
          href="#" 
          className="flex items-center justify-between text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span className="flex items-center">
            <Hash size={14} className="mr-1" />
            View all trending topics
          </span>
          <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
} 