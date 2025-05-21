'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { BookOpen, Play, FileText, Award, Search, ChevronRight, Clock, BarChart2, TrendingUp, PieChart, Mail } from 'lucide-react';
import PageBackground from '@/components/layout/PageBackground';

// Mock data for courses
const courses = [
  {
    id: 1,
    title: "Stock Market Fundamentals",
    description: "Learn the basics of stock markets, how they work, and key terminology every investor should know.",
    level: "Beginner",
    duration: "3 hours",
    modules: 12,
    category: "Fundamentals",
    image: "/courses/fundamentals.jpg"
  },
  {
    id: 2,
    title: "Technical Analysis Masterclass",
    description: "Master chart patterns, indicators, and technical analysis strategies to improve your trading decisions.",
    level: "Intermediate",
    duration: "5 hours",
    modules: 18,
    category: "Technical Analysis",
    image: "/courses/technical.jpg"
  },
  {
    id: 3,
    title: "Fundamental Analysis Deep Dive",
    description: "Learn how to analyze financial statements, understand company valuations, and identify investment opportunities.",
    level: "Intermediate",
    duration: "4 hours",
    modules: 15,
    category: "Fundamental Analysis",
    image: "/courses/fundamental.jpg"
  },
  {
    id: 4,
    title: "Portfolio Management Strategies",
    description: "Develop strategies for building and managing a diversified portfolio to achieve your financial goals.",
    level: "Advanced",
    duration: "4.5 hours",
    modules: 14,
    category: "Portfolio Management",
    image: "/courses/portfolio.jpg"
  },
  {
    id: 5,
    title: "Risk Management for Traders",
    description: "Learn essential risk management techniques to protect your capital and maximize returns.",
    level: "Intermediate",
    duration: "3.5 hours",
    modules: 10,
    category: "Risk Management",
    image: "/courses/risk.jpg"
  },
  {
    id: 6,
    title: "Advanced Options Trading",
    description: "Master complex options strategies for income generation, hedging, and leveraged returns.",
    level: "Advanced",
    duration: "6 hours",
    modules: 20,
    category: "Options",
    image: "/courses/options.jpg"
  }
];

// Mock data for resources
const resources = [
  { title: "Market Terminology Glossary", type: "PDF", downloads: 2450 },
  { title: "Financial Ratios Cheat Sheet", type: "PDF", downloads: 1870 },
  { title: "Technical Indicators Guide", type: "PDF", downloads: 3120 },
  { title: "Stock Screener Templates", type: "Excel", downloads: 2240 },
  { title: "Investment Tracking Spreadsheet", type: "Excel", downloads: 1980 }
];

export default function LearnPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  useEffect(() => {
    // Main entrance animation
    gsap.from(mainRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out"
    });

    // Staggered sections animation
    gsap.from(sectionsRef.current, {
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.8,
      ease: "back.out(1.2)",
      delay: 0.3
    });
  }, []);

  // Add sections to ref array for animations
  const addToSectionsRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Filter courses based on search query and active category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from courses
  const categories = ['All', ...Array.from(new Set(courses.map(course => course.category)))];

  return (
    <PageBackground>
    <main 
      ref={mainRef}
        className="container mx-auto px-4 py-12"
    >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
        Learning Center
      </h1>
      
        <p className="text-lg text-center text-gray-300 mb-12 max-w-3xl mx-auto">
          Enhance your investment knowledge with our comprehensive courses, tutorials, and resources designed for all experience levels.
      </p>

        {/* Hero Section */}
        <section 
          ref={addToSectionsRefs}
          className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700 glass-premium mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-400/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Start Your Investment Journey Today</h2>
              <p className="text-gray-300 mb-6">
                Our expert-led courses and comprehensive resources will guide you through every step of your investment journey, 
                from understanding market basics to implementing advanced trading strategies.
            </p>
            <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-neon-400 hover:bg-neon-300 text-black font-medium rounded-lg transition-colors shadow-neon-sm hover:shadow-neon flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </button>
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  View Resources
                </button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="w-48 h-48 bg-gray-700 rounded-full flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-neon-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section ref={addToSectionsRefs} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
        </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:ring-neon-400 focus:border-neon-400"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-neon-400 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
              </button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section ref={addToSectionsRefs} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-neon-400" />
            Featured Courses
          </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700 hover:border-neon-400/50 transition-colors glass-premium"
              >
                <div className="h-40 bg-gray-700 flex items-center justify-center">
                  {course.category === "Technical Analysis" && <BarChart2 className="h-16 w-16 text-neon-400/70" />}
                  {course.category === "Fundamental Analysis" && <PieChart className="h-16 w-16 text-neon-400/70" />}
                  {course.category === "Portfolio Management" && <TrendingUp className="h-16 w-16 text-neon-400/70" />}
                  {!["Technical Analysis", "Fundamental Analysis", "Portfolio Management"].includes(course.category) && 
                    <BookOpen className="h-16 w-16 text-neon-400/70" />
                  }
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      course.level === "Beginner" ? "bg-green-400/20 text-green-400" :
                      course.level === "Intermediate" ? "bg-blue-400/20 text-blue-400" :
                      "bg-purple-400/20 text-purple-400"
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center">
                      <Clock size={12} className="mr-1" /> {course.duration}
                    </span>
                    </div>
                  <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{course.modules} modules</span>
                    <button className="text-neon-400 hover:text-neon-300 flex items-center text-sm">
                      View Course <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Paths */}
        <section ref={addToSectionsRefs} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <Award className="mr-2 h-6 w-6 text-neon-400" />
            Learning Paths
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Beginner Investor",
                description: "Start your investment journey with foundational knowledge of markets and basic strategies.",
                courses: 4,
                duration: "10 hours",
                color: "from-green-400/20 to-green-600/20",
                border: "border-green-400/30"
              },
              {
                title: "Technical Trader",
                description: "Master chart analysis, indicators, and technical trading strategies for short-term profits.",
                courses: 5,
                duration: "15 hours",
                color: "from-blue-400/20 to-blue-600/20",
                border: "border-blue-400/30"
              },
              {
                title: "Value Investor",
                description: "Learn to identify undervalued companies and build a long-term investment portfolio.",
                courses: 6,
                duration: "18 hours",
                color: "from-purple-400/20 to-purple-600/20",
                border: "border-purple-400/30"
              }
            ].map((path, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${path.color} rounded-xl shadow-md p-6 border ${path.border} hover:shadow-lg transition-shadow`}
              >
                <h3 className="text-xl font-bold text-white mb-2">{path.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{path.description}</p>
                <div className="flex justify-between text-sm text-gray-300 mb-4">
                  <span>{path.courses} courses</span>
                  <span>{path.duration}</span>
                </div>
                <button className="w-full py-2 bg-gray-800/50 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
                  Start Path
                </button>
                    </div>
            ))}
                    </div>
        </section>

        {/* Resources */}
        <section ref={addToSectionsRefs} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <FileText className="mr-2 h-6 w-6 text-neon-400" />
            Free Resources
          </h2>
          
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {resources.map((resource, index) => (
                    <tr key={index} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{resource.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{resource.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{resource.downloads.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button className="px-3 py-1 bg-neon-400 hover:bg-neon-300 text-black rounded text-xs font-medium transition-colors">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                    </div>
                  </div>
        </section>

        {/* Newsletter */}
        <section ref={addToSectionsRefs}>
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-neon-400/20 glass-premium">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold text-white mb-2">Stay Updated with Market Insights</h2>
                <p className="text-gray-300 mb-4">
                  Subscribe to our newsletter for weekly market analysis, investment tips, and new learning resources.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="flex-grow px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-neon-400 focus:border-neon-400"
                  />
                  <button className="px-6 py-2 bg-neon-400 hover:bg-neon-300 text-black font-medium rounded-lg transition-colors shadow-neon-sm hover:shadow-neon">
                    Subscribe
                  </button>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="w-32 h-32 bg-neon-400/10 rounded-full flex items-center justify-center border border-neon-400/30">
                  <Mail className="h-16 w-16 text-neon-400" />
                </div>
              </div>
            </div>
        </div>
      </section>
    </main>
    </PageBackground>
  );
}
