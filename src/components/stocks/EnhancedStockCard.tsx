'use client';

import React, { useState } from 'react';
import { Volume, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="group h-fit overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_70px_rgba(2,6,23,0.38)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/20 hover:shadow-[0_30px_90px_rgba(2,6,23,0.52)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-[var(--font-roboto-mono)] text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
            Live stock
          </div>
          <h3 className="truncate text-base font-semibold tracking-tight text-white">
            {stock.company_name || stock.displayName || stock.name || 'Unknown Company'}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-slate-400">
              {stock.nseCode || stock.ric?.split('.')[0] || stock.symbol || stock.ticker_id}
            </span>
            {(stock.exchange_type || stock.exchangeType) && (
              <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                {stock.exchange_type || stock.exchangeType}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold tracking-tight text-white">
            {formatCurrency(stock.price || stock.current_price)}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
            isPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            <span className="font-semibold">{isPositive ? '+' : '-'}</span>
            {Math.abs(percentChange).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Day Range</div>
            <div className="truncate text-slate-100">
              {formatCurrency(stock.low)} - {formatCurrency(stock.high)}
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Volume</div>
            <div className="flex items-center gap-1 text-slate-100">
              <Volume className="h-3 w-3 text-emerald-400" />
              {formatVolume(stock.volume)}
            </div>
          </div>
        </div>

        {rating && (
          <div className="flex justify-start">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getRatingColor(rating)}`}>
              {rating}
            </span>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2 text-sm text-slate-300 transition-colors hover:border-white/15 hover:bg-white/10 hover:text-white"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            {(stock.low_circuit_limit || stock.up_circuit_limit) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Lower Circuit</div>
                  <div className="text-sm text-rose-400">
                    {formatCurrency(stock.low_circuit_limit)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Upper Circuit</div>
                  <div className="text-sm text-emerald-400">
                    {formatCurrency(stock.up_circuit_limit)}
                  </div>
                </div>
              </div>
            )}

            {(stock['52_week_low'] !== undefined || stock.year_low !== undefined || stock['52_week_high'] !== undefined || stock.year_high !== undefined) && (
              <div>
                <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">52-Week Range</div>
                <div className="text-sm text-slate-100">
                  {formatCurrency(stock['52_week_low'] || stock.year_low || 0)} - {formatCurrency(stock['52_week_high'] || stock.year_high || 0)}
                </div>
              </div>
            )}

            {(stock.bid || stock.ask) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Bid</div>
                  <div className="text-sm text-emerald-400">
                    {formatCurrency(stock.bid)} ({stock.bid_size || 0})
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Ask</div>
                  <div className="text-sm text-rose-400">
                    {formatCurrency(stock.ask)} ({stock.ask_size || 0})
                  </div>
                </div>
              </div>
            )}

            {(stock.open || stock.close) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Open</div>
                  <div className="text-sm text-slate-100">
                    {formatCurrency(stock.open)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Previous Close</div>
                  <div className="text-sm text-slate-100">
                    {formatCurrency(stock.close)}
                  </div>
                </div>
              </div>
            )}

            {(shortTrend || longTrend) && (
              <div className="flex flex-wrap gap-2">
                {shortTrend && (
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRatingColor(shortTrend)}`}>
                    ST: {shortTrend}
                  </span>
                )}
                {longTrend && (
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRatingColor(longTrend)}`}>
                    LT: {longTrend}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              {stock.date && <div>Date: {stock.date}</div>}
              {stock.time && <div>Time: {stock.time}</div>}
              {(stock.lot_size || stock.lotSize) && <div>Lot Size: {stock.lot_size || stock.lotSize}</div>}
              {stock.net_change && <div>Net Change: ₹{stock.net_change}</div>}
            </div>

            {(stock.marketCap || stock.market_cap) && (
              <div>
                <div className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Market Cap</div>
                <div className="text-sm text-slate-100">
                  {formatMarketCap(stock.marketCap || stock.market_cap)}
                </div>
              </div>
            )}

            {stock.description && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-300">
                <Info className="mr-1 inline h-3 w-3 text-emerald-400" />
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
