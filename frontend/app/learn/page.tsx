'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  BookOpen, GraduationCap, BarChart2, TrendingUp, 
  FileText, Play, ArrowRight, Search, Star, Filter, User
} from 'lucide-react';
import { 
  LineChart, Line as RechartsLine, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Mock data for visualizations
const fundamentalsData = [
  { name: 'P/E Ratio', description: 'Price-to-Earnings', completion: 85 },
  { name: 'EPS Growth', description: 'Earnings Per Share', completion: 70 },
  { name: 'ROE', description: 'Return on Equity', completion: 65 },
  { name: 'Debt-to-Equity', description: 'Leverage Ratio', completion: 60 },
  { name: 'Div Yield', description: 'Dividend Yield', completion: 55 },
];

const candlestickPatterns = [
  { name: 'Engulfing', difficulty: 2, effectiveness: 8 },
  { name: 'Doji', difficulty: 1, effectiveness: 6 },
  { name: 'Hammer', difficulty: 2, effectiveness: 7 },
  { name: 'Morning Star', difficulty: 4, effectiveness: 9 },
  { name: 'Head & Shoulders', difficulty: 3, effectiveness: 7 },
];

const courseCompletionData = [
  { name: 'Stock Basics', value: 65 },
  { name: 'Technical Analysis', value: 45 },
  { name: 'Fundamental Analysis', value: 80 },
  { name: 'Trading Strategies', value: 30 },
];

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

export default function LearnPage() {
  const mainRef = useRef(null);
  const bannerRef = useRef(null);
  const sectionsRef = useRef([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    // Main entrance animation
    gsap.from(mainRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out"
    });

    // Banner animation
    gsap.from(bannerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      delay: 0.3,
      ease: "back.out(1.7)"
    });

    // Staggered sections animation
    gsap.from(sectionsRef.current, {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.8,
      delay: 0.5,
      ease: "back.out(1.2)"
    });
  }, []);

  // Add sections to ref array for animations
  const addToSectionsRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Mock course data
  const courses = [
    { 
      id: 1, 
      title: "Stock Market Fundamentals", 
      level: "Beginner",
      lessons: 12,
      duration: "3 hours",
      category: "basics",
      rating: 4.8,
      students: 3240,
      image: "/courses/placeholder.png"
    },
    { 
      id: 2, 
      title: "Technical Analysis Mastery", 
      level: "Intermediate",
      lessons: 24,
      duration: "6 hours",
      category: "technical",
      rating: 4.9,
      students: 2156,
      image: "/courses/placeholder.png"
    },
    { 
      id: 3, 
      title: "Fundamental Analysis Deep Dive", 
      level: "Advanced",
      lessons: 18,
      duration: "5 hours",
      category: "fundamental",
      rating: 4.7,
      students: 1879,
      image: "/courses/placeholder.png"
    },
    { 
      id: 4, 
      title: "Indian Stock Market Insights", 
      level: "Intermediate",
      lessons: 15,
      duration: "4 hours",
      category: "markets",
      rating: 4.6,
      students: 1562,
      image: "/courses/placeholder.png"
    },
    { 
      id: 5, 
      title: "Portfolio Management Strategies", 
      level: "Advanced",
      lessons: 20,
      duration: "5 hours",
      category: "strategies",
      rating: 4.9,
      students: 2345,
      image: "/courses/placeholder.png"
    },
    { 
      id: 6, 
      title: "IPO Investing in India", 
      level: "Intermediate",
      lessons: 10,
      duration: "2.5 hours",
      category: "markets",
      rating: 4.8,
      students: 1890,
      image: "/courses/placeholder.png"
    }
  ];

  // Filter courses based on search and tab
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || course.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <main 
      ref={mainRef}
      className="container mx-auto px-4 py-12 min-h-screen"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Learning Center
      </h1>
      
      <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
        Master stock market analysis and investing strategies with our comprehensive learning resources.
      </p>

      {/* Featured Banner */}
      <div 
        ref={bannerRef}
        className="relative mb-16 rounded-xl overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 to-indigo-700"
      >
        <div className="p-8 md:p-12 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stock Analysis Masterclass</h2>
            <p className="text-blue-100 mb-6">
              Our most comprehensive course on analyzing Indian stocks using both technical 
              and fundamental methodologies. Over 10,000 investors trained.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2 text-sm backdrop-blur-sm">
                <GraduationCap className="w-4 h-4 mr-2" />
                <span>42 Lessons</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2 text-sm backdrop-blur-sm">
                <Clock className="w-4 h-4 mr-2" />
                <span>12 Hours</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2 text-sm backdrop-blur-sm">
                <Star className="w-4 h-4 mr-2" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
            <button className="mt-6 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center">
              Start Learning Now <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 hidden lg:block w-1/3 h-full">
          {/* Placeholder for an image or illustration */}
          <div className="h-full flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-white/20" />
          </div>
        </div>
      </div>

      <section ref={addToSectionsRefs} className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Course Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Stock Market Basics", 
              description: "Learn the essentials of how stock markets work", 
              icon: <BookOpen className="w-8 h-8 text-blue-500" />,
              color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            },
            { 
              title: "Technical Analysis", 
              description: "Master chart patterns and indicators", 
              icon: <TrendingUp className="w-8 h-8 text-green-500" />,
              color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            },
            { 
              title: "Fundamental Analysis", 
              description: "Evaluate stocks using financial statements", 
              icon: <BarChart2 className="w-8 h-8 text-purple-500" />,
              color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
            },
            { 
              title: "Trading Strategies", 
              description: "Develop and implement effective trading plans", 
              icon: <TrendingUp className="w-8 h-8 text-amber-500" />,
              color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            }
          ].map((category, index) => (
            <div 
              key={index} 
              className={`rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 ${category.color}`}
            >
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{category.description}</p>
              <button className="flex items-center font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Explore Courses
                <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <section ref={addToSectionsRefs} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Fundamental Analysis Topics</h2>
          <div className="space-y-4">
            {fundamentalsData.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.completion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${item.completion}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={addToSectionsRefs} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Technical Chart Patterns</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={candlestickPatterns}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    color: '#e5e7eb'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="difficulty" 
                  name="Learning Difficulty (1-5)" 
                  fill="#f59e0b" 
                />
                <Bar 
                  dataKey="effectiveness" 
                  name="Effectiveness (1-10)" 
                  fill="#3b82f6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section ref={addToSectionsRefs} className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Your Learning Progress</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Course Completion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Courses Enrolled', value: '6' },
                { label: 'Courses Completed', value: '2' },
                { label: 'Hours Learned', value: '28' },
                { label: 'Certificates Earned', value: '2' }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</h4>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { week: 'Week 1', hours: 2 },
                    { week: 'Week 2', hours: 3 },
                    { week: 'Week 3', hours: 5 },
                    { week: 'Week 4', hours: 4 },
                    { week: 'Week 5', hours: 7 },
                    { week: 'Week 6', hours: 6 }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#e5e7eb'
                    }}
                  />
                  <Legend />
                  <RechartsLine 
                    type="monotone" 
                    dataKey="hours" 
                    name="Hours Spent Learning"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Topic Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {courseCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Completion']}
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#e5e7eb'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recommended Next Steps</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Complete "Trading Strategies" module</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Review Technical Analysis lessons</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section ref={addToSectionsRefs} className="mb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Browse Courses</h2>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="relative">
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'basics', label: 'Basics' },
            { id: 'technical', label: 'Technical Analysis' },
            { id: 'fundamental', label: 'Fundamental Analysis' },
            { id: 'markets', label: 'Markets' },
            { id: 'strategies', label: 'Strategies' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      course.level === 'Beginner' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : course.level === 'Intermediate'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                    }`}>
                      {course.level}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      <section ref={addToSectionsRefs} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Ready to Start Learning?</h2>
            <p className="text-indigo-200 max-w-lg">
              Join thousands of investors mastering the Indian stock market with our
              comprehensive learning resources and expert-led courses.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors">
            Enroll Now
          </button>
        </div>
      </section>
    </main>
  );
}

// Missing component reference
const Clock = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
};

const Users = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
};
