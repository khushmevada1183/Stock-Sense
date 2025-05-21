"use client";

import { useParams } from 'next/navigation';
import StockDetailsClient from './StockDetailsClient';

// Enhanced stock detail page
export default function StockDetailPage() {
  return (
    <div className="bg-gray-900 min-h-screen py-8">
      <StockDetailsClient />
    </div>
  );
} 