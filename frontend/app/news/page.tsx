import React from 'react';
import MarketNews from '@/components/News/MarketNews';

export const metadata = {
  title: 'Market News | Stock Analyzer',
  description: 'Latest market news and updates from the stock market',
};

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Market News</h1>
      <div className="grid grid-cols-1 gap-6">
        <MarketNews />
      </div>
    </div>
  );
} 