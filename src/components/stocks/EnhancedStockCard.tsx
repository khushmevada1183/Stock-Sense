'use client';

import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Volume, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

type NumericInput = number | string | undefined;

interface EnhancedStockData {
  company_name?: string;
  displayName?: string;
  name?: string;
  nseCode?: string;
  ric?: string;
  symbol?: string;
  ticker_id?: string;
  exchange_type?: string;
  exchangeType?: string;
  price?: NumericInput;
  current_price?: NumericInput;
  percent_change?: NumericInput;
  percentChange?: NumericInput;
  low?: NumericInput;
  high?: NumericInput;
  volume?: NumericInput;
  overall_rating?: string;
  overallRating?: string;
  low_circuit_limit?: NumericInput;
  up_circuit_limit?: NumericInput;
  '52_week_low'?: NumericInput;
  year_low?: NumericInput;
  '52_week_high'?: NumericInput;
  year_high?: NumericInput;
  bid?: NumericInput;
  ask?: NumericInput;
  bid_size?: NumericInput;
  ask_size?: NumericInput;
  open?: NumericInput;
  close?: NumericInput;
  short_term_trends?: string;
  short_term_trend?: string;
  shortTermTrends?: string;
  long_term_trends?: string;
  long_term_trend?: string;
  longTermTrends?: string;
  date?: string;
  time?: string;
  lot_size?: NumericInput;
  lotSize?: NumericInput;
  net_change?: NumericInput;
  marketCap?: NumericInput;
  market_cap?: NumericInput;
  description?: string;
}

interface EnhancedStockCardProps {
  stock: EnhancedStockData; // Raw API response with all fields
  price_change_percentage: number;
  showAllData?: boolean;
}

const EnhancedStockCard: React.FC<EnhancedStockCardProps> = ({ stock, price_change_percentage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentChange = parseFloat((stock.percent_change ?? stock.percentChange ?? price_change_percentage ?? 0).toString());
  const isPositive = percentChange >= 0;
  const rating = stock.overall_rating || stock.overallRating;
  const shortTrend = stock.short_term_trends || stock.short_term_trend || stock.shortTermTrends;
  const longTrend = stock.long_term_trends || stock.long_term_trend || stock.longTermTrends;
  
  const formatCurrency = (value: NumericInput) => {
    const num = parseFloat((value ?? 0).toString());
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };
  
  const formatVolume = (volume: NumericInput) => {
    const num = parseInt((volume ?? 0).toString(), 10);
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    return num.toLocaleString();
  };

  const formatMarketCap = (marketCap: NumericInput) => {
    const num = parseFloat((marketCap ?? 0).toString());
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return formatCurrency(num);
  };

  const getRatingColor = (rating: string) => {
    const ratingLower = rating?.toLowerCase();
    switch (ratingLower) {
      case 'bullish': return 'text-emerald-700 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800';
      case 'bearish': return 'text-rose-700 bg-rose-100 dark:text-rose-200 dark:bg-rose-950 border border-rose-200 dark:border-rose-800';
      case 'neutral': return 'text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800';
      case 'moderately bearish': return 'text-amber-700 bg-amber-100 dark:text-amber-200 dark:bg-amber-950 border border-amber-200 dark:border-amber-800';
      case 'moderately bullish': return 'text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-950 border border-blue-200 dark:border-blue-800';
      default: return 'text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 dark:border-slate-700 dark:bg-slate-950 p-5">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 dark:text-white text-base font-semibold truncate">
            {stock.company_name || stock.displayName || stock.name || 'Unknown Company'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-slate-600 dark:text-slate-400 text-sm">
              {stock.nseCode || stock.ric?.split('.')[0] || stock.symbol || stock.ticker_id}
            </span>
            {(stock.exchange_type || stock.exchangeType) && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200 text-xs rounded">
                {stock.exchange_type || stock.exchangeType}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(stock.price || stock.current_price)}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
        {/* Compact Essential Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Day Range</div>
            <div className="text-slate-900 dark:text-slate-100 truncate">
              {formatCurrency(stock.low)} - {formatCurrency(stock.high)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Volume</div>
            <div className="text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <Volume className="w-3 h-3" />
              {formatVolume(stock.volume)}
            </div>
          </div>
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(rating)}`}>
              {rating}
            </span>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-t border-slate-200 dark:border-slate-700"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            {/* Circuit Limits */}
            {(stock.low_circuit_limit || stock.up_circuit_limit) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Lower Circuit</div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(stock.low_circuit_limit)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Upper Circuit</div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {formatCurrency(stock.up_circuit_limit)}
                  </div>
                </div>
              </div>
            )}

            {/* 52-Week Range */}
            {(stock['52_week_low'] !== undefined || stock.year_low !== undefined || stock['52_week_high'] !== undefined || stock.year_high !== undefined) && (
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">52-Week Range</div>
                <div className="text-sm text-slate-900 dark:text-slate-100">
                  {formatCurrency(stock['52_week_low'] || stock.year_low || 0)} - {formatCurrency(stock['52_week_high'] || stock.year_high || 0)}
                </div>
              </div>
            )}

            {/* Bid/Ask */}
            {(stock.bid || stock.ask) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Bid</div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {formatCurrency(stock.bid)} ({stock.bid_size || 0})
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Ask</div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(stock.ask)} ({stock.ask_size || 0})
                  </div>
                </div>
              </div>
            )}

            {/* Open & Close Prices */}
            {(stock.open || stock.close) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Open</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {formatCurrency(stock.open)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Previous Close</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {formatCurrency(stock.close)}
                  </div>
                </div>
              </div>
            )}

            {/* Trends */}
            {(shortTrend || longTrend) && (
              <div className="flex flex-wrap gap-2 justify-center">
                {shortTrend && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(shortTrend)}`}>
                    ST: {shortTrend}
                  </span>
                )}
                {longTrend && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(longTrend)}`}>
                    LT: {longTrend}
                  </span>
                )}
              </div>
            )}

            {/* Additional Technical Info */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              {stock.date && <div>Date: {stock.date}</div>}
              {stock.time && <div>Time: {stock.time}</div>}
              {(stock.lot_size || stock.lotSize) && <div>Lot Size: {stock.lot_size || stock.lotSize}</div>}
              {stock.net_change && <div>Net Change: ₹{stock.net_change}</div>}
            </div>

            {/* Market Cap & Advanced Metrics */}
            {(stock.marketCap || stock.market_cap) && (
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Market Cap</div>
                <div className="text-sm text-slate-900 dark:text-slate-100">
                  {formatMarketCap(stock.marketCap || stock.market_cap)}
                </div>
              </div>
            )}

            {stock.description && (
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded text-xs text-slate-700 dark:text-slate-300">
                <Info className="w-3 h-3 inline mr-1" />
                {stock.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedStockCard;
