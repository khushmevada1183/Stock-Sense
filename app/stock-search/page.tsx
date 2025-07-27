'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, TrendingUp, TrendingDown, Volume, Clock } from 'lucide-react';
import EnhancedStockCard from '@/components/stocks/EnhancedStockCard';

const StockSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [popularStocks, setPopularStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('stockSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Fetch popular stocks
    fetchPopularStocks();
  }, []);

  const fetchPopularStocks = async () => {
    try {
      const response = await fetch('/api/trending');
      const data = await response.json();
      if (data.success) {
        const popular = [
          ...(data.data.trending_stocks?.top_gainers?.slice(0, 3) || []),
          ...(data.data.trending_stocks?.top_losers?.slice(0, 3) || [])
        ];
        setPopularStocks(popular);
      }
    } catch (error) {
      console.error('Error fetching popular stocks:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Add to search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('stockSearchHistory', JSON.stringify(newHistory));

      // Search across different endpoints
      const [trending, bse, shockers] = await Promise.all([
        fetch('/api/trending').then(r => r.json()),
        fetch('/api/BSE_most_active').then(r => r.json()),
        fetch('/api/price_shockers').then(r => r.json())
      ]);

      const allStocks = [
        ...(trending.data?.trending_stocks?.top_gainers || []),
        ...(trending.data?.trending_stocks?.top_losers || []),
        ...(bse.data || []),
        ...(shockers.data?.BSE_PriceShocker || []),
        ...(shockers.data?.NSE_PriceShocker || [])
      ];

      // Filter stocks based on search query
      const filtered = allStocks.filter(stock => 
        (stock.company_name || stock.displayName || stock.company || '').toLowerCase().includes(query.toLowerCase()) ||
        (stock.ticker_id || stock.ticker || stock.symbol || '').toLowerCase().includes(query.toLowerCase()) ||
        (stock.nseCode || '').toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('stockSearchHistory');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔍 Stock Search
          </h1>
          <p className="text-gray-400 text-lg">
            Search for stocks by company name, ticker symbol, or NSE code
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
          <CardContent className="p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks (e.g., 'Reliance', 'INFY', 'TCS')"
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-lg"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>
                
                {searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Clear Results
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <Card className="mb-8 bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Searches
                </CardTitle>
                <button
                  onClick={clearHistory}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Clear History
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(query);
                      handleSearch(query);
                    }}
                    className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-full text-sm transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((stock, index) => (
                <EnhancedStockCard 
                  key={`result-${stock.ticker_id || stock.ticker || index}`} 
                  stock={stock} 
                  showAllData={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Popular/Trending Stocks */}
        {searchResults.length === 0 && popularStocks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Popular Stocks
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {popularStocks.map((stock, index) => (
                <EnhancedStockCard 
                  key={`popular-${stock.ticker_id || index}`} 
                  stock={stock} 
                  showAllData={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !loading && (
          <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No stocks found</h3>
                <p>
                  No stocks match your search for "{searchQuery}". 
                  Try searching with different keywords or ticker symbols.
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p className="mb-2">Search tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Try company names like "Reliance" or "TCS"</li>
                  <li>Use ticker symbols like "INFY" or "HDFC"</li>
                  <li>Search partial names like "Tech" for tech companies</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockSearchPage;
