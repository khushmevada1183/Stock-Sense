import React from 'react';
import StockDetailsClient from './StockDetailsClient';

// Stock details page component
export default async function StockDetailsPage({ params }: { params: { symbol: string } }) {
  // Ensure params are properly resolved before using them
  const symbol = params.symbol;
  
  return (
            <div>
      <StockDetailsClient symbol={symbol} />
    </div>
  );
} 