'use client';

import React, { useState, useEffect } from 'react';
import { getIPOData } from '../../api/clientApi';

interface IPOItem {
  symbol: string;
  name: string;
  status: 'upcoming' | 'active' | 'listed' | 'closed';
  is_sme: boolean;
  additional_text: string;
  min_price: number | null;
  max_price: number | null;
  issue_price: number | null;
  listing_gains: number | null;
  listing_price: number | null;
  bidding_start_date: string | null;
  bidding_end_date: string | null;
  listing_date: string | null;
  lot_size: number | null;
  document_url: string | null;
}

interface IPOData {
  upcoming: IPOItem[];
  active: IPOItem[];
  listed: IPOItem[];
  closed: IPOItem[];
  statistics?: {
    upcoming: number;
    active: number;
    recentlyListed: number;
    closed: number;
  };
}

const IPOTable: React.FC = () => {
  const [ipoData, setIpoData] = useState<IPOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'listed' | 'closed'>('active');

  useEffect(() => {
    const fetchIPOData = async () => {
      try {
        setLoading(true);
        const data = await getIPOData();
        console.log('IPO API Response:', data);
        setIpoData(data);
      } catch (err) {
        console.error('Error fetching IPO data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch IPO data');
      } finally {
        setLoading(false);
      }
    };

    fetchIPOData();
  }, []);

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A';
    return `₹${price}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatGains = (gains: number | null) => {
    if (gains === null || gains === undefined) return 'N/A';
    const color = gains >= 0 ? 'text-green-600' : 'text-red-600';
    const sign = gains >= 0 ? '+' : '';
    return <span className={color}>{sign}{gains.toFixed(2)}%</span>;
  };

  const getPriceRange = (item: IPOItem) => {
    if (item.min_price && item.max_price) {
      if (item.min_price === item.max_price) {
        return formatPrice(item.min_price);
      }
      return `${formatPrice(item.min_price)} - ${formatPrice(item.max_price)}`;
    }
    return 'N/A';
  };

  const getStatusBadge = (status: string, is_sme: boolean) => {
    const smeText = is_sme ? ' (SME)' : '';
    const statusColors = {
      upcoming: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      listed: 'bg-purple-100 text-purple-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}{smeText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading IPO data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!ipoData) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">No IPO data available</p>
      </div>
    );
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'upcoming': return ipoData.upcoming || [];
      case 'active': return ipoData.active || [];
      case 'listed': return ipoData.listed || [];
      case 'closed': return ipoData.closed || [];
      default: return [];
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {ipoData.statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Upcoming</h3>
            <p className="text-2xl font-bold text-blue-900">{ipoData.statistics.upcoming}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Active</h3>
            <p className="text-2xl font-bold text-green-900">{ipoData.statistics.active}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Recently Listed</h3>
            <p className="text-2xl font-bold text-purple-900">{ipoData.statistics.recentlyListed}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800">Closed</h3>
            <p className="text-2xl font-bold text-gray-900">{ipoData.statistics.closed}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'active', label: 'Active IPOs', count: ipoData.active?.length || 0 },
            { key: 'upcoming', label: 'Upcoming', count: ipoData.upcoming?.length || 0 },
            { key: 'listed', label: 'Recently Listed', count: ipoData.listed?.length || 0 },
            { key: 'closed', label: 'Closed', count: ipoData.closed?.length || 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* IPO Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price Range
              </th>
              {activeTab === 'listed' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listing Gains
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lot Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((ipo, index) => (
              <tr key={`${ipo.symbol}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{ipo.name}</div>
                    <div className="text-sm text-gray-500">{ipo.symbol}</div>
                    {ipo.additional_text && (
                      <div className="text-xs text-gray-400 mt-1">{ipo.additional_text}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getPriceRange(ipo)}</div>
                  {ipo.issue_price && (
                    <div className="text-xs text-gray-500">Issue: {formatPrice(ipo.issue_price)}</div>
                  )}
                  {ipo.listing_price && (
                    <div className="text-xs text-gray-500">Listed: {formatPrice(ipo.listing_price)}</div>
                  )}
                </td>
                {activeTab === 'listed' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {formatGains(ipo.listing_gains)}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    {ipo.bidding_start_date && (
                      <div>Start: {formatDate(ipo.bidding_start_date)}</div>
                    )}
                    {ipo.bidding_end_date && (
                      <div>End: {formatDate(ipo.bidding_end_date)}</div>
                    )}
                    {ipo.listing_date && (
                      <div>Listing: {formatDate(ipo.listing_date)}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ipo.lot_size ? ipo.lot_size.toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(ipo.status, ipo.is_sme)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ipo.document_url ? (
                    <a 
                      href={ipo.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Prospectus
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {currentData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No {activeTab} IPOs available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPOTable;
