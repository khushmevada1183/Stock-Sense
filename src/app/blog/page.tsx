'use client';

import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { BookOpen, Bookmark, TrendingUp, Clock, ChevronRight, Search, Filter, Calendar, Tag, User } from 'lucide-react';
import { ContentPageLayout } from '@/components/content/ContentPageLayout';
import { fieldClass } from '@/styles/design-tokens';

// Mock data for blog posts
const featuredPosts = [
  {
    id: 1,
    title: 'Understanding the Indian Stock Market Bull Run of 2025',
    excerpt: 'An in-depth analysis of factors driving the current market rally and what investors should know.',
    date: 'May 15, 2025',
    author: 'Priya Sharma',
    category: 'Market Analysis',
    readTime: '8 min',
    image: '/blog/market-bull.jpg',
    views: 8240,
    likes: 1254,
    comments: 186
  },
  {
    id: 2,
    title: 'Top 5 Small-Cap Stocks with Growth Potential',
    excerpt: 'Discover hidden gems in the small-cap segment that show promising growth trajectories.',
    date: 'May 10, 2025',
    author: 'Amit Patel',
    category: 'Stock Picks',
    readTime: '6 min',
    image: '/blog/small-cap.jpg',
    views: 5680,
    likes: 892,
    comments: 92
  },
  {
    id: 3,
    title: 'Tech Sector Analysis: The Rise of AI Startups in India',
    excerpt: 'How artificial intelligence is transforming the Indian tech landscape and creating investment opportunities.',
    date: 'May 8, 2025',
    author: 'Rajiv Mehta',
    category: 'Tech Stocks',
    readTime: '10 min',
    image: '/blog/ai-tech.jpg',
    views: 7920,
    likes: 1105,
    comments: 158
  }
];

const recentPosts = [
  { id: 4, title: 'Navigating Volatility: Risk Management Strategies', date: 'May 5, 2025', category: 'Risk Management', readTime: '5 min' },
  { id: 5, title: 'The Impact of Global Inflation on Indian Markets', date: 'May 3, 2025', category: 'Global Markets', readTime: '7 min' },
  { id: 6, title: 'Dividend Aristocrats: Consistent Income Generators', date: 'April 30, 2025', category: 'Dividend Investing', readTime: '6 min' },
  { id: 7, title: 'IPO Watch: Upcoming Offerings in Q2 2025', date: 'April 28, 2025', category: 'IPOs', readTime: '4 min' },
  { id: 8, title: 'Technical Analysis Patterns Every Trader Should Know', date: 'April 25, 2025', category: 'Technical Analysis', readTime: '9 min' },
];

// Mock data for visualizations
const postsByCategory = [
  { name: 'Market Analysis', posts: 42, color: '#3b82f6' },
  { name: 'Stock Picks', posts: 38, color: '#10b981' },
  { name: 'Technical Analysis', posts: 27, color: '#6366f1' },
  { name: 'Fundamental Analysis', posts: 24, color: '#f59e0b' },
  { name: 'IPO Analysis', posts: 18, color: '#ec4899' },
  { name: 'Global Markets', posts: 15, color: '#8b5cf6' }
];

const readerEngagement = [
  { month: 'Dec', views: 15200, comments: 820 },
  { month: 'Jan', views: 18400, comments: 950 },
  { month: 'Feb', views: 22100, comments: 1120 },
  { month: 'Mar', views: 26500, comments: 1340 },
  { month: 'Apr', views: 31200, comments: 1580 },
  { month: 'May', views: 38600, comments: 1920 }
];

const popularTopics = [
  { name: 'Market Analysis', value: 28, color: '#3b82f6' },
  { name: 'Stock Selection', value: 22, color: '#10b981' },
  { name: 'Technical Analysis', value: 18, color: '#6366f1' },
  { name: 'Sector Analysis', value: 16, color: '#f59e0b' },
  { name: 'IPOs', value: 10, color: '#ec4899' },
  { name: 'Others', value: 6, color: '#8b5cf6' }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoryOptions = ['All', 'Market Analysis', 'Stock Picks', 'Technical Analysis', 'IPOs', 'Global Markets'];

  return (
    <ContentPageLayout
      eyebrow="Insights"
      title="Stock Sense Blog"
      description="Expert analysis, market insights, and trading strategies to help you make informed investment decisions in the Indian stock market."
    >
      <div>
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <label htmlFor="blog-search" className="sr-only">Search blog articles</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              id="blog-search"
              type="text"
                className={`${fieldClass} block w-full min-h-[44px] pl-10 pr-3 py-2`}
              placeholder="Search articles..."
              aria-label="Search blog articles"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <label htmlFor="blog-category" className="sr-only">Filter blog articles by category</label>
              <select 
                  id="blog-category"
                  className={`${fieldClass} appearance-none block w-full min-h-[44px] px-3 py-2 pr-8`}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter blog articles by category"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Articles */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <BookOpen size={24} className="text-emerald-600" />
              Featured Articles
            </h2>
              <button type="button" className="text-emerald-600 hover:underline inline-flex min-h-[44px] items-center px-2">
              View All <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="blog-card overflow-hidden rounded-xl shadow-lg border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 hover:shadow-lg transition-shadow duration-200">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <BookOpen size={48} className="text-gray-400 dark:text-gray-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center">
                      <Clock size={12} className="mr-1" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-950 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-600 dark:text-slate-300">
                        {post.author}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {post.date}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-2.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">{post.views.toLocaleString()} views</span>
                  <span className="flex items-center gap-1">{post.likes.toLocaleString()} likes</span>
                  <span className="flex items-center gap-1">{post.comments.toLocaleString()} comments</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-950 dark:text-white flex items-center gap-2 mb-8">
            <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
            Blog Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Posts by Category Chart */}
            <Card className="chart-container p-5 rounded-xl shadow-lg border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-950 dark:text-white mb-4">Posts by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={postsByCategory}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      color: '#F9FAFB'  
                    }}
                  />
                  <Legend />
                  <Bar dataKey="posts" name="Number of Posts">
                    {postsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Reader Engagement Chart */}
            <Card className="chart-container p-5 rounded-xl shadow-lg border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-950 dark:text-white mb-4">Reader Engagement</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={readerEngagement}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      color: '#F9FAFB'  
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="views" name="Page Views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="comments" name="Comments" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-950 dark:text-white flex items-center gap-2 mb-6">
            <Tag size={24} className="text-blue-600 dark:text-blue-400" />
            Popular Topics
          </h2>

          <Card className="chart-container p-5 rounded-xl shadow-lg border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-950 dark:text-white mb-4">Topic Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={popularTopics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {popularTopics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        borderColor: '#374151',
                        color: '#F9FAFB'  
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-950 dark:text-white mb-4">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic, idx) => (
                    <span 
                      key={idx} 
                      className="tag-item inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: `${topic.color}20`, 
                        color: topic.color, 
                        border: `1px solid ${topic.color}40` 
                      }}
                    >
                      {topic.name}
                      <span className="ml-1.5 border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:bg-gray-700 text-xs py-0.5 px-1.5 rounded-full">
                        {topic.value}%
                      </span>
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-slate-950 dark:text-white mb-2">Most Searched Terms</h4>
                  <div className="flex flex-wrap gap-2 trending-section">
                    {['NIFTY 50', 'Multibagger Stocks', 'Dividend Yield', 'Bank Nifty', 'IT Sector', 'IPO Calendar', 'Technical Patterns'].map((term, idx) => (
                      <span 
                        key={idx} 
                        className="tag-item inline-block px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Articles */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-950 dark:text-white flex items-center gap-2">
              <Clock size={24} className="text-blue-600 dark:text-blue-400" />
              Recent Articles
            </h2>
            <button type="button" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex min-h-[44px] items-center px-2">
              View Archive <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recentPosts.map((post) => (
              <Card key={post.id} className="blog-card flex items-center p-4 rounded-xl shadow-lg border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 hover:shadow-md transition-shadow duration-200">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <BookOpen size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center">
                      <Clock size={12} className="mr-1" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar size={14} className="mr-1" /> {post.date}
                </div>
                <button
                  type="button"
                  className="ml-4 text-blue-600 dark:text-blue-400 p-2.5 min-h-[44px] min-w-[44px] rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                  aria-label={`Save article: ${post.title}`}
                  title={`Save article: ${post.title}`}
                >
                  <Bookmark size={18} />
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <Card className="rounded-xl border border-slate-200/80 bg-white/80 p-8 dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold mb-2 text-slate-950 dark:text-slate-950 dark:text-white">Stay Updated</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Subscribe to our weekly newsletter for market insights, analysis, and investment ideas delivered straight to your inbox.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="blog-newsletter-email" className="sr-only">Email address</label>
                <input
                  id="blog-newsletter-email"
                  type="email"
                  className="px-4 py-2 min-h-[44px] rounded-lg border border-slate-200/70 bg-white/75 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-950 dark:text-white"
                  placeholder="Your email address"
                  aria-label="Email address"
                />
                <button className="px-4 py-2 min-h-[44px] bg-emerald-500 text-slate-950 font-medium rounded-lg hover:bg-emerald-400 transition-colors">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ContentPageLayout>
  );
}
