'use client';

import React, { useState, useEffect } from 'react';
import StockList from '@/components/stocks/StockList';
import MarketNews from '@/components/News/MarketNews';
import IPOTable from '@/components/IPO/IPOTable';
import CommoditiesTable from '@/components/dashboard/CommoditiesTable';
import HighLowTable from '@/components/market/HighLowTable';

export default function Dashboard() {
  const [activeStock, setActiveStock] = useState('');

  const handleStockSelect = (symbol: string) => {
    setActiveStock(symbol);
  };

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold mb-0 text-gray-900 dark:text-gray-100">
          Indian Stock Market Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 -mt-4">
          Real-time insights and analytics for the Indian stock market
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <StockList onStockSelect={handleStockSelect} />
            <CommoditiesTable />
            <IPOTable />
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            <MarketNews />
            <HighLowTable />
          </div>
        </div>
      </div>
    </main>
  );
} 