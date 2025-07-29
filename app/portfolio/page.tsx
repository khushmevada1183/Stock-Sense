'use client';

import dynamic from 'next/dynamic';

const PortfolioDashboard = dynamic(() => import('@/components/portfolio/PortfolioDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-neon-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio data...</p>
      </div>
    </div>
  )
});

export default function PortfolioPage() {
  return <PortfolioDashboard />;
} 