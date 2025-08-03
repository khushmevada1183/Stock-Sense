'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ChevronRight, Hash } from 'lucide-react';
import { gsap } from 'gsap';

// Mock trending topics data
const MOCK_TRENDING_TOPICS = [
  {
    id: 1,
    topic: 'Budget 2023',
    count: 2453,
    change: 12,
    category: 'economy'
  },
  {
    id: 2,
    topic: 'Inflation Data',
    count: 1876,
    change: 5,
    category: 'economy'
  },
  {
    id: 3,
    topic: 'HDFC Bank',
    count: 1654,
    change: -3,
    category: 'stocks'
  },
  {
    id: 4,
    topic: 'Crypto Regulation',
    count: 1432,
    change: 20,
    category: 'crypto'
  },
  {
    id: 5,
    topic: 'RBI Policy',
    count: 1298,
    change: 8,
    category: 'economy'
  },
  {
    id: 6,
    topic: 'Reliance Industries',
    count: 1187,
    change: 2,
    category: 'stocks'
  }
];

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
        
        // In a real implementation, we would fetch trending topics from an API
        // For now, we'll use mock data with a slight delay to simulate network request
        setTimeout(() => {
          setTrendingTopics(MOCK_TRENDING_TOPICS);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching trending topics:', error);
        // Use mock data on error
        setTrendingTopics(MOCK_TRENDING_TOPICS);
        setLoading(false);
      }
    };

    fetchTrendingTopics();
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