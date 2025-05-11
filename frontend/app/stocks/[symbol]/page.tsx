"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import StockDetailView from '../../../components/stocks/StockDetailView';

// Stock details page component
export default function StockDetailPage() {
  const params = useParams();
  const symbol = params?.symbol as string || '';

  if (!symbol) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-center text-red-500">Invalid stock symbol</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <StockDetailView symbol={symbol} />
    </div>
  );
} 