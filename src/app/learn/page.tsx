'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, Award, Search, ChevronRight, Clock, BarChart2, TrendingUp, PieChart, Mail } from 'lucide-react';
import { ContentPageLayout } from '@/components/content/ContentPageLayout';
import { contentCardClass, fieldClass, secondaryButtonClass } from '@/styles/design-tokens';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
    <ContentPageLayout
      eyebrow="Education"
      title="Learning Center"
      description="Enhance your investment knowledge with our comprehensive courses, tutorials, and resources designed for all experience levels."
    >
    <div>
        {/* Search and Filter */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
        </div>
              <input
                type="text"
                className={`${fieldClass} block w-full min-h-[44px] pl-10 pr-3 py-2`}
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
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-emerald-500 text-slate-950'
                      : `${secondaryButtonClass} border`
                  }`}
                >
                  {category}
              </button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-950 dark:text-white flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-emerald-600" />
            Featured Courses
          </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className={`${contentCardClass} overflow-hidden shadow-md transition-colors hover:border-emerald-500/50`}
              >
                <div className="flex h-40 items-center justify-center bg-slate-100 dark:bg-white/5">
                  {course.category === "Technical Analysis" && <BarChart2 className="h-16 w-16 text-emerald-600/70" />}
                  {course.category === "Fundamental Analysis" && <PieChart className="h-16 w-16 text-emerald-600/70" />}
                  {course.category === "Portfolio Management" && <TrendingUp className="h-16 w-16 text-emerald-600/70" />}
                  {!["Technical Analysis", "Fundamental Analysis", "Portfolio Management"].includes(course.category) && 
                    <BookOpen className="h-16 w-16 text-emerald-600/70" />
                  }
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      course.level === "Beginner" ? "bg-green-400/20 text-green-400" :
                      course.level === "Intermediate" ? "bg-blue-400/20 text-blue-400" :
                      "bg-amber-400/20 text-amber-600 dark:text-amber-400"
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center">
                      <Clock size={12} className="mr-1" /> {course.duration}
                    </span>
                    </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">{course.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">{course.modules} modules</span>
                    <button className="text-emerald-600 hover:text-emerald-500 inline-flex min-h-[44px] items-center px-2 text-sm">
                      View Course <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Paths */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-950 dark:text-white flex items-center">
            <Award className="mr-2 h-6 w-6 text-emerald-600" />
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
                color: "from-emerald-400/20 to-emerald-600/20",
                border: "border-emerald-400/30"
              }
            ].map((path, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${path.color} rounded-xl shadow-md p-6 border ${path.border} hover:shadow-lg transition-shadow`}
              >
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{path.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{path.description}</p>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 mb-4">
                  <span>{path.courses} courses</span>
                  <span>{path.duration}</span>
                </div>
                <button className={`${secondaryButtonClass} w-full min-h-[44px] border py-2 font-medium`}>
                  Start Path
                </button>
                    </div>
            ))}
                    </div>
        </section>

        {/* Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-950 dark:text-white flex items-center">
            <FileText className="mr-2 h-6 w-6 text-emerald-600" />
            Free Resources
          </h2>
          
          <div className="border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 rounded-xl shadow-lg p-6">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-950 dark:text-white">{resource.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{resource.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{resource.downloads.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button className="px-3 py-1 min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-black rounded text-xs font-medium transition-colors">
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
        <section>
          <div className="border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 rounded-xl shadow-lg p-8 border border-emerald-500/20">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">Stay Updated with Market Insights</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Subscribe to our newsletter for weekly market analysis, investment tips, and new learning resources.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className={`${fieldClass} min-h-[44px] flex-grow px-4 py-2`}
                  />
                  <button className="px-6 py-2 min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <Mail className="h-16 w-16 text-emerald-600" />
                </div>
              </div>
            </div>
        </div>
      </section>
    </div>
    </ContentPageLayout>
  );
}
