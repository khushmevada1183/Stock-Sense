'use client';

import dynamic from 'next/dynamic';

// Import StockSearch with no SSR since it uses browser APIs
const StockSearch = dynamic(() => import('./StockSearch'), { ssr: false });

export default function ClientStockSearch() {
  return <StockSearch />;
}
