'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  SearchIcon, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, 
  HelpCircle, BarChart2, LineChart, Tag, AlertTriangle, Settings, Shield
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import PageBackground from '@/components/layout/PageBackground';

// Import GSAP ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Mock data for FAQ categories
const faqCategories = [
  { id: 'general', name: 'General Questions', icon: <HelpCircle /> },
  { id: 'account', name: 'Account & Billing', icon: <Settings /> },
  { id: 'data', name: 'Data & Sources', icon: <BarChart2 /> },
  { id: 'features', name: 'Features & Tools', icon: <LineChart /> },
  { id: 'pricing', name: 'Pricing & Plans', icon: <Tag /> },
  { id: 'security', name: 'Security & Privacy', icon: <Shield /> },
  { id: 'errors', name: 'Troubleshooting', icon: <AlertTriangle /> }
];

// Mock data for popular FAQs
const popularQuestions = [
  "How accurate is the stock data?",
  "How can I track my portfolio performance?",
  "What financial ratios does the platform analyze?",
  "How often is stock data updated?"
];

// Mock FAQ data with categories
const faqs = [
  {
    id: 1,
    question: "What is Indian Stock Analyzer?",
    answer: "Indian Stock Analyzer is a comprehensive web application for analyzing Indian stocks with real-time data, charts, and financial insights. It provides tools for technical and fundamental analysis, portfolio tracking, and market research specifically focused on the Indian stock markets.",
    category: "general",
    helpfulCount: 248
  },
  {
    id: 2,
    question: "How is the data sourced and how frequent are the updates?",
    answer: "Our data is sourced directly from Indian stock exchanges (NSE and BSE) through official APIs and trusted financial data providers. Stock prices are updated in near real-time with a delay of approximately 1-15 minutes depending on your subscription plan. Fundamental data is updated quarterly or as soon as companies release their financial statements.",
    category: "data",
    helpfulCount: 187
  },
  {
    id: 3,
    question: "What financial ratios and metrics are available for analysis?",
    answer: "We provide over 50 financial metrics and ratios including P/E, P/B, EPS, ROE, ROCE, Debt-to-Equity, Current Ratio, Profit Margins, Revenue Growth, Dividend Yield, and many more. These metrics are calculated using the latest financial statements and are available for all listed companies on NSE and BSE.",
    category: "features",
    helpfulCount: 163
  },
  {
    id: 4,
    question: "How do I create and track my stock portfolio?",
    answer: "To create a portfolio, navigate to the Portfolio section and click on 'Create New Portfolio'. You can add stocks with purchase dates, quantities, and purchase prices. The system will automatically track the performance of your portfolio including gains/losses, dividends, and comparison with market benchmarks.",
    category: "features",
    helpfulCount: 145
  },
  {
    id: 5,
    question: "What are the subscription plans and pricing?",
    answer: "We offer three subscription tiers: Basic (free), Premium (₹499/month), and Professional (₹999/month). Each tier offers different features, data refresh rates, and analysis tools. You can view a detailed comparison on our Pricing page or contact our sales team for enterprise plans.",
    category: "pricing",
    helpfulCount: 132
  },
  {
    id: 6,
    question: "Is my financial data secure?",
    answer: "Yes, we implement industry-standard security measures to protect your data. This includes encryption in transit and at rest, regular security audits, and strict access controls. We never share your personal or portfolio information with third parties without your explicit consent.",
    category: "security",
    helpfulCount: 210
  },
  {
    id: 7,
    question: "How do I recover my password?",
    answer: "To recover your password, click on the 'Forgot Password' link on the login page. Enter your registered email address, and we will send you a password reset link. For security reasons, this link will expire after 24 hours.",
    category: "account",
    helpfulCount: 98
  },
  {
    id: 8,
    question: "I'm seeing incorrect stock data. What should I do?",
    answer: "If you notice any discrepancies in stock data, please report it by clicking the 'Report Issue' button next to the stock information. Include details about the specific error, and our data team will investigate and correct it promptly. Most data issues are resolved within 24 hours.",
    category: "errors",
    helpfulCount: 87
  },
  {
    id: 9,
    question: "Can I export data for my own analysis?",
    answer: "Yes, Premium and Professional subscribers can export data in various formats including CSV, Excel, and PDF. You can export historical price data, financial statements, and portfolio reports. There are daily export limits based on your subscription tier.",
    category: "features",
    helpfulCount: 119
  },
  {
    id: 10,
    question: "Do you offer API access?",
    answer: "Yes, API access is available to Professional tier subscribers. Our RESTful API provides programmatic access to stock data, financial metrics, and market information. Detailed documentation and sample code are available in the Developer section after you upgrade to the Professional plan.",
    category: "features",
    helpfulCount: 156
  },
  {
    id: 11,
    question: "How can I cancel my subscription?",
    answer: "You can cancel your subscription at any time from your Account Settings page. Select 'Manage Subscription' and then 'Cancel Subscription'. Your access will continue until the end of your current billing period. We do not offer refunds for partial months.",
    category: "account",
    helpfulCount: 88
  },
  {
    id: 12,
    question: "What technical indicators are available for chart analysis?",
    answer: "We offer over 50 technical indicators including Moving Averages, RSI, MACD, Bollinger Bands, Fibonacci Retracements, Stochastic Oscillator, and more. You can customize parameters for each indicator and save your favorite chart setups for quick access.",
    category: "features",
    helpfulCount: 143
  },
  {
    id: 13,
    question: "How far back does historical data go?",
    answer: "Our historical data goes back to the year 2000 for major stocks, with daily OHLC data available for the entire period. Intraday data is available for the past 60 days for Premium users and 2 years for Professional users.",
    category: "data",
    helpfulCount: 102
  },
  {
    id: 14,
    question: "Can I set price alerts?",
    answer: "Yes, you can set custom price alerts for any stock. Configure alerts based on price thresholds, percentage changes, or technical indicator signals. Alerts can be delivered via email, push notifications, or SMS (SMS available for Premium and Professional users only).",
    category: "features",
    helpfulCount: 127
  }
];

// Mock data for visualizations
const faqDistributionData = [
  { name: 'Features', value: 5 },
  { name: 'Data', value: 2 },
  { name: 'Security', value: 1 },
  { name: 'Account', value: 2 },
  { name: 'General', value: 1 },
  { name: 'Pricing', value: 1 },
  { name: 'Errors', value: 2 },
];

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export default function FaqPage() {
  const mainRef = useRef(null);
  const sectionsRef = useRef([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [helpfulFlags, setHelpfulFlags] = useState({});

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
      stagger: 0.15,
      duration: 0.8,
      delay: 0.3,
      ease: "back.out(1.2)"
    });

    // Set up scroll animations
    sectionsRef.current.forEach((section, index) => {
      if (index > 0) { // Skip first section since it's already visible
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          onEnter: () => {
            gsap.to(section, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "back.out(1.2)"
            });
          },
          once: true
        });
      }
    });
  }, []);

  // Handle expanding/collapsing FAQs
  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle marking FAQ as helpful/not helpful
  const markHelpful = (id, helpful) => {
    setHelpfulFlags(prev => ({
      ...prev,
      [id]: helpful
    }));
  };

  // Add sections to ref array for animations
  const addToSectionsRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Filter FAQs based on search query and active category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageBackground>
    <main 
      ref={mainRef}
        className="container mx-auto px-4 py-12"
    >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
        Frequently Asked Questions
      </h1>
      
        <p className="text-lg text-center text-gray-300 mb-12 max-w-3xl mx-auto">
        Find answers to common questions about Indian Stock Analyzer, its features, and how to make the most of our platform.
      </p>

        {/* Search and Categories */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
        <input
          type="text"
                placeholder="Search for questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-12 pr-4 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-neon-400 focus:border-transparent text-gray-900 dark:text-white"
        />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
        </div>
      </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all' 
                  ? 'bg-neon-400 text-black shadow-neon-sm' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
              All Questions
          </button>

          {faqCategories.map((category) => (
            <button
              key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors ${
                activeCategory === category.id 
                    ? 'bg-neon-400 text-black shadow-neon-sm' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
                <span className={`mr-2 ${activeCategory === category.id ? 'text-black' : 'text-gray-500 dark:text-gray-400'}`}>
                  {React.cloneElement(category.icon, { size: 16 })}
                </span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List */}
        <div 
          ref={addToSectionsRefs}
          className="space-y-4 mb-12"
        >
          {filteredFaqs.map((faq) => (
            <div 
              key={faq.id} 
              className="bg-white dark:bg-gray-850 glass rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex justify-between items-center text-left"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={expandedFaqs[faq.id]}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </h3>
                {expandedFaqs[faq.id] ? 
                  <ChevronUp className="flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400" /> : 
                  <ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400" />
                }
              </button>
              
              {expandedFaqs[faq.id] && (
                <div 
                  id={`faq-answer-${faq.id}`}
                  className="px-6 pb-4"
                >
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                        Was this helpful?
                      </span>
                      <button 
                        className={`p-1.5 rounded-full mr-2 ${
                          helpfulFlags[faq.id] === 'yes' 
                            ? 'bg-neon-400/20 text-neon-400' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => markHelpful(faq.id, 'yes')}
                        disabled={helpfulFlags[faq.id] !== undefined}
                        aria-label="Mark as helpful"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button 
                        className={`p-1.5 rounded-full ${
                          helpfulFlags[faq.id] === 'no' 
                            ? 'bg-red-400/20 text-red-400' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => markHelpful(faq.id, 'no')}
                        disabled={helpfulFlags[faq.id] !== undefined}
                        aria-label="Mark as not helpful"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <ThumbsUp className="w-3.5 h-3.5 mr-1 text-neon-400" />
                      <span>{faq.helpfulCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <section ref={addToSectionsRefs} className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {activeCategory === 'all' ? 'All FAQs' : faqCategories.find(c => c.id === activeCategory)?.name}
            </h2>
            
            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div 
                    key={faq.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      className="w-full px-6 py-4 flex justify-between items-center text-left"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <h3 className="font-semibold text-lg pr-8">{faq.question}</h3>
                      {expandedFaqs[faq.id] ? (
                        <ChevronUp className="w-5 h-5 flex-shrink-0 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedFaqs[faq.id] && (
                      <div className="px-6 pb-4">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-gray-700 dark:text-gray-300">
                          <p>{faq.answer}</p>
                          
                          {/* Helpful buttons */}
                          <div className="flex items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
                            <span className="text-gray-500 dark:text-gray-400 mr-4">Was this answer helpful?</span>
                            <button 
                              className={`flex items-center mr-4 px-3 py-1 rounded-full ${
                                helpfulFlags[faq.id] === true 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                              onClick={() => markHelpful(faq.id, true)}
                            >
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Yes
                            </button>
                            <button 
                              className={`flex items-center px-3 py-1 rounded-full ${
                                helpfulFlags[faq.id] === false 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                              onClick={() => markHelpful(faq.id, false)}
                            >
                              <ThumbsDown className="w-4 h-4 mr-2" />
                              No
                            </button>
                            <span className="ml-auto text-gray-500 dark:text-gray-400">
                              {faq.helpfulCount} people found this helpful
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
                <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No FAQs Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  We couldn&apos;t find any FAQs matching your search criteria.
                </p>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          {/* FAQ Distribution */}
          <section 
            ref={addToSectionsRefs}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4">FAQ Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={faqDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name}) => name}
                  >
                    {faqDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} questions`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      color: '#e5e7eb'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Popular Questions */}
          <section 
            ref={addToSectionsRefs}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4">Popular Questions</h3>
            <ul className="space-y-3">
              {popularQuestions.map((question, index) => (
                <li key={index}>
                  <button 
                    className="w-full text-left flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setSearchQuery(question);
                      setActiveCategory('all');
                    }}
                  >
                    <HelpCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{question}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact Support */}
          <section 
            ref={addToSectionsRefs}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
          >
            <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <a 
              href="/contact" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </section>
        </div>
      </div>
    </main>
    </PageBackground>
  );
}
