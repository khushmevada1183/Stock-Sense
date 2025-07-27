'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Volume, Target, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface EnhancedStockCardProps {
  stock: any; // Raw API response with all fields
  showAllData?: boolean;
}

const EnhancedStockCard: React.FC<EnhancedStockCardProps> = ({ stock, showAllData = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentChange = parseFloat(stock.percent_change || stock.percentChange || 0);
  const isPositive = percentChange >= 0;
  
  const formatCurrency = (value: any) => {
    const num = parseFloat(value || 0);
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };
  
  const formatVolume = (volume: any) => {
    const num = parseInt(volume || 0);
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    return num.toLocaleString();
  };

  const formatMarketCap = (marketCap: any) => {
    const num = parseFloat(marketCap || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return formatCurrency(num);
  };

  const getRatingColor = (rating: string) => {
    const ratingLower = rating?.toLowerCase();
    switch (ratingLower) {
      case 'bullish': return 'text-green-400 bg-green-900/20';
      case 'bearish': return 'text-red-400 bg-red-900/20';
      case 'neutral': return 'text-yellow-400 bg-yellow-900/20';
      case 'moderately bearish': return 'text-orange-400 bg-orange-900/20';
      case 'moderately bullish': return 'text-lime-400 bg-lime-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 h-fit">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-base font-semibold truncate">
              {stock.company_name || stock.displayName || stock.name || 'Unknown Company'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400 text-sm">
                {stock.nseCode || stock.ric?.split('.')[0] || stock.symbol || stock.ticker_id}
              </span>
              {(stock.exchange_type || stock.exchangeType) && (
                <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-300 text-xs rounded">
                  {stock.exchange_type || stock.exchangeType}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {formatCurrency(stock.price || stock.current_price)}
            </div>
            <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Compact Essential Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-400">Day Range</div>
            <div className="text-gray-200 truncate">
              {formatCurrency(stock.low)} - {formatCurrency(stock.high)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Volume</div>
            <div className="text-gray-200 flex items-center gap-1">
              <Volume className="w-3 h-3" />
              {formatVolume(stock.volume)}
            </div>
          </div>
        </div>

        {/* Rating */}
        {(stock.overall_rating || stock.overallRating) && (
          <div className="flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(stock.overall_rating || stock.overallRating)}`}>
              {stock.overall_rating || stock.overallRating}
            </span>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white transition-colors border-t border-gray-700/50"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-gray-700/30">
            {/* Circuit Limits */}
            {(stock.low_circuit_limit || stock.up_circuit_limit) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Lower Circuit</div>
                  <div className="text-sm text-red-300">
                    {formatCurrency(stock.low_circuit_limit)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Upper Circuit</div>
                  <div className="text-sm text-green-300">
                    {formatCurrency(stock.up_circuit_limit)}
                  </div>
                </div>
              </div>
            )}

            {/* 52-Week Range */}
            {(stock['52_week_low'] !== undefined || stock.year_low !== undefined || stock['52_week_high'] !== undefined || stock.year_high !== undefined) && (
              <div>
                <div className="text-xs text-gray-400 mb-1">52-Week Range</div>
                <div className="text-sm text-gray-200">
                  {formatCurrency(stock['52_week_low'] || stock.year_low || 0)} - {formatCurrency(stock['52_week_high'] || stock.year_high || 0)}
                </div>
              </div>
            )}

            {/* Bid/Ask */}
            {(stock.bid || stock.ask) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Bid</div>
                  <div className="text-sm text-green-300">
                    {formatCurrency(stock.bid)} ({stock.bid_size || 0})
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Ask</div>
                  <div className="text-sm text-red-300">
                    {formatCurrency(stock.ask)} ({stock.ask_size || 0})
                  </div>
                </div>
              </div>
            )}

            {/* Open & Close Prices */}
            {(stock.open || stock.close) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Open</div>
                  <div className="text-sm text-gray-200">
                    {formatCurrency(stock.open)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Previous Close</div>
                  <div className="text-sm text-gray-200">
                    {formatCurrency(stock.close)}
                  </div>
                </div>
              </div>
            )}

            {/* Trends */}
            {(stock.short_term_trends || stock.long_term_trends) && (
              <div className="flex flex-wrap gap-2 justify-center">
                {(stock.short_term_trends || stock.short_term_trend || stock.shortTermTrends) && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(stock.short_term_trends || stock.short_term_trend || stock.shortTermTrends)}`}>
                    ST: {stock.short_term_trends || stock.short_term_trend || stock.shortTermTrends}
                  </span>
                )}
                {(stock.long_term_trends || stock.long_term_trend || stock.longTermTrends) && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(stock.long_term_trends || stock.long_term_trend || stock.longTermTrends)}`}>
                    LT: {stock.long_term_trends || stock.long_term_trend || stock.longTermTrends}
                  </span>
                )}
              </div>
            )}

            {/* Additional Technical Info */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              {stock.date && <div>Date: {stock.date}</div>}
              {stock.time && <div>Time: {stock.time}</div>}
              {(stock.lot_size || stock.lotSize) && <div>Lot Size: {stock.lot_size || stock.lotSize}</div>}
              {stock.net_change && <div>Net Change: ₹{stock.net_change}</div>}
            </div>

            {/* Market Cap & Advanced Metrics */}
            {(stock.marketCap || stock.market_cap) && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                <div className="text-sm text-gray-200">
                  {formatMarketCap(stock.marketCap || stock.market_cap)}
                </div>
              </div>
            )}

            {stock.description && (
              <div className="p-2 bg-gray-800/50 rounded text-xs text-gray-300">
                <Info className="w-3 h-3 inline mr-1" />
                {stock.description}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedStockCard;
