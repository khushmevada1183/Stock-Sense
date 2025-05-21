'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Newspaper, TrendingUp, Briefcase, BarChart3, Globe, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';

// News categories
const NEWS_CATEGORIES = [
  {
    id: 'all',
    name: 'All News',
    icon: Newspaper,
    path: '/news'
  },
  {
    id: 'markets',
    name: 'Markets',
    icon: BarChart3,
    path: '/news/markets'
  },
  {
    id: 'economy',
    name: 'Economy',
    icon: Globe,
    path: '/news/economy'
  },
  {
    id: 'companies',
    name: 'Companies',
    icon: Briefcase,
    path: '/news/companies'
  },
  {
    id: 'trending',
    name: 'Trending',
    icon: TrendingUp,
    path: '/news/trending'
  },
  {
    id: 'alerts',
    name: 'Alerts',
    icon: AlertCircle,
    path: '/news/alerts'
  }
];

export default function NewsCategoryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState('all');
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    if (tabsRef.current) {
      // Animate the tabs
      gsap.fromTo(
        tabsRef.current.querySelectorAll('.category-tab'),
        { opacity: 0, y: -10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: "power2.out" 
        }
      );
    }
  }, []);

  // Determine active category based on path
  useEffect(() => {
    const path = pathname || '';
    const category = NEWS_CATEGORIES.find(cat => path === cat.path)?.id || 'all';
    setActiveCategory(category);
    
    // Animate the indicator when category changes
    animateIndicator(category);
  }, [pathname]);

  // Function to animate the indicator
  const animateIndicator = (categoryId: string) => {
    if (!indicatorRef.current || !tabsRef.current) return;
    
    const activeTab = tabsRef.current.querySelector(`[data-category="${categoryId}"]`);
    if (!activeTab) return;
    
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsRef.current.getBoundingClientRect();
    
    // Calculate position relative to container
    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;
    
    gsap.to(indicatorRef.current, {
      left,
      width,
      duration: 0.3,
      ease: "power2.inOut"
    });
  };

  // Handle category change
  const handleCategoryChange = (path: string, categoryId: string) => {
    setActiveCategory(categoryId);
    router.push(path);
  };

  return (
    <div className="relative">
      <div 
        ref={tabsRef}
        className="flex space-x-1 md:space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {NEWS_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              data-category={category.id}
              onClick={() => handleCategoryChange(category.path, category.id)}
              className={`category-tab flex items-center px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-white bg-blue-600 shadow-sm shadow-blue-900/30' 
                  : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Icon size={16} className="mr-1.5" />
              {category.name}
            </button>
          );
        })}
      </div>
      
      {/* Active indicator (visible only on larger screens) */}
      <div 
        ref={indicatorRef}
        className="hidden md:block absolute bottom-0 h-1 bg-blue-500 rounded-full transition-all duration-300"
        style={{ left: 0, width: 0 }}
      />
    </div>
  );
} 