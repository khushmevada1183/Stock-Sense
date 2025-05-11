"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserPortfolios, deletePortfolio } from '@/services/stockService';
import { Trash2, Edit, ChevronRight, PlusCircle } from 'lucide-react';

interface Stock {
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

interface Portfolio {
  id: number;
  userId: string;
  portfolioName: string;
  stocks: Stock[];
  createdAt: string;
}

const PortfolioList = ({ userId = '1' }: { userId?: string }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const data = await getUserPortfolios(userId);
      setPortfolios(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load portfolios. Please try again later.');
      console.error('Error fetching portfolios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, [userId]);

  const handleDelete = async (portfolioId: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        const success = await deletePortfolio(portfolioId);
        if (success) {
          setPortfolios(portfolios.filter(p => p.id !== portfolioId));
        } else {
          setError('Failed to delete portfolio. Please try again.');
        }
      } catch (err) {
        setError('An error occurred while deleting the portfolio.');
        console.error('Error deleting portfolio:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        <p>{error}</p>
        <button 
          onClick={fetchPortfolios}
          className="mt-2 text-sm font-medium underline hover:text-red-800 dark:hover:text-red-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No portfolios yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first portfolio to track your investments</p>
        <Link 
          href="/portfolio/create" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Portfolios</h2>
        <Link 
          href="/portfolio/create" 
          className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircle className="mr-1.5 h-4 w-4" />
          New Portfolio
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {portfolios.map((portfolio) => (
          <div 
            key={portfolio.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium">{portfolio.portfolioName}</h3>
              <div className="flex space-x-2">
                <Link href={`/portfolio/edit/${portfolio.id}`}>
                  <button className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                    <Edit className="h-4 w-4" />
                  </button>
                </Link>
                <button 
                  className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  onClick={() => handleDelete(portfolio.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {portfolio.stocks.length} {portfolio.stocks.length === 1 ? 'stock' : 'stocks'} in portfolio
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {portfolio.stocks.slice(0, 3).map((stock) => (
                  <div 
                    key={stock.symbol} 
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    {stock.symbol} ({stock.quantity})
                  </div>
                ))}
                {portfolio.stocks.length > 3 && (
                  <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    +{portfolio.stocks.length - 3} more
                  </div>
                )}
              </div>
              
              <Link 
                href={`/portfolio/${portfolio.id}`}
                className="flex items-center justify-end text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioList; 