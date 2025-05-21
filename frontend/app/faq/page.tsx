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

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface ExpandedFaqs {
  [key: string]: boolean;
}

// Mock FAQ data with categories
const faqs: FAQ[] = [
  {
    id: '1',
    question: 'What is Stock Sense?',
    answer: 'Stock Sense is a comprehensive stock market analysis platform designed specifically for Indian markets. It provides real-time data, advanced analytics, and portfolio management tools to help investors make informed decisions.'
  },
  {
    id: '2',
    question: 'How do I get started with Stock Sense?',
    answer: 'Getting started is easy! Simply create an account, explore our features through the dashboard, and begin tracking your favorite stocks. We recommend starting with our tutorial section to familiarize yourself with all available tools.'
  },
  {
    id: '3',
    question: 'Is my data secure?',
    answer: 'Yes, we take data security very seriously. We use industry-standard encryption and security measures to protect your personal and financial information. Our systems are regularly audited and updated to maintain the highest security standards.'
  },
  {
    id: '4',
    question: 'What markets does Stock Sense cover?',
    answer: 'Stock Sense primarily focuses on Indian stock markets, including both NSE and BSE. We provide comprehensive coverage of stocks, mutual funds, and market indices listed on these exchanges.'
  },
  {
    id: '5',
    question: 'How real-time is the data?',
    answer: 'Our market data is near real-time with minimal delay. Stock prices, market indices, and other data points are updated every few seconds during market hours.'
  },
  {
    id: '6',
    question: 'Can I track my portfolio performance?',
    answer: 'Yes! Stock Sense offers robust portfolio tracking features. You can create multiple portfolios, track their performance, set price alerts, and generate detailed reports of your investments.'
  },
  {
    id: '7',
    question: 'What technical analysis tools are available?',
    answer: 'We offer a wide range of technical analysis tools including various chart types, technical indicators, trend analysis, and pattern recognition features. You can customize these tools according to your analysis needs.'
  },
  {
    id: '8',
    question: 'Is there a mobile app available?',
    answer: 'Yes, Stock Sense is available as a mobile app for both iOS and Android devices. You can download it from the respective app stores to access your portfolio and market data on the go.'
  },
  {
    id: '9',
    question: 'How do I contact customer support?',
    answer: 'Our customer support team is available 24/7. You can reach us through the contact form on our website, email us at support@stocksense.com, or use the live chat feature during business hours.'
  },
  {
    id: '10',
    question: 'What educational resources are available?',
    answer: 'We offer extensive educational resources including video tutorials, articles, webinars, and market analysis reports. These resources cater to both beginners and experienced investors.'
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

export default function FAQ() {
  const mainRef = useRef(null);
  const sectionsRef = useRef([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<ExpandedFaqs>({});

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

  const toggleFaq = (id: string) => {
    setExpandedFaqs((prev: ExpandedFaqs) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => {
    return faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
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
                </div>
              )}
            </div>
          ))}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <section className="mb-8">
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
