'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

interface Stock {
  id: number;
  symbol: string;
  company_name: string;
  current_price?: number;
  price_change?: number;
  price_change_percentage?: number;
  sector_name?: string;
}

interface WatchlistSectionProps {
  watchlist: Stock[];
  loading: boolean;
}

const WatchlistSection = ({ watchlist, loading }: WatchlistSectionProps) => {
  const { token } = useAuth();
  const [removing, setRemoving] = useState<number | null>(null);
  
  const handleRemoveFromWatchlist = async (stockId: number) => {
    if (!token) return;
    
    try {
      setRemoving(stockId);
      
      // Setup axios with auth header
      const headers = { Authorization: `Bearer ${token}` };
      
      // Remove from watchlist
      await axios.delete(`${API_URL}/watchlists/stocks/${stockId}`, { headers });
      
      // Refresh the page to update the watchlist - better to use state management or context
      window.location.reload();
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
    } finally {
      setRemoving(null);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Watchlist</h2>
        </div>
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Watchlist</h2>
        <Link
          href="/watchlist"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          View All
        </Link>
      </div>
      
      {watchlist.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't added any stocks to your watchlist yet.</p>
          <Link
            href="/stocks"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Browse Stocks
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Symbol</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Change</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {watchlist.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <Link 
                      href={`/stocks/${stock.symbol}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {stock.company_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {stock.sector_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">
                    ₹{stock.current_price?.toLocaleString() || 'N/A'}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    (stock.price_change || 0) > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {(stock.price_change || 0) > 0 ? '+' : ''}
                    {stock.price_change?.toFixed(2) || '0.00'} ({stock.price_change_percentage?.toFixed(2) || '0.00'}%)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemoveFromWatchlist(stock.id)}
                      disabled={removing === stock.id}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      {removing === stock.id ? 'Removing...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WatchlistSection; 