'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stocks/${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Stock Search
      </h1>
      
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Search for any stock by name or symbol. For Indian stocks, try searching for companies like RELIANCE, TCS, INFY, or HDFC.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter a stock symbol or name and press Enter to view detailed information.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for stocks (e.g., RELIANCE, ITC)"
            className="w-full py-3 pl-12 pr-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search stocks"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-6 h-6 text-gray-400" aria-hidden="true" />
          </div>
          <button 
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center px-4 font-medium text-blue-600 hover:text-blue-800"
          >
            Search
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <h3 className="font-medium mb-2">About this feature:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Search for any stock by symbol or name</li>
          <li>View detailed stock information including price, charts, and key statistics</li>
          <li>Supports both Indian and global stocks</li>
          <li>Responsive design that works on all devices</li>
        </ul>
      </div>
    </div>
  );
} 