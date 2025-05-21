'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface StockDetailsJsonProps {
  stock: any;
  isLoading: boolean;
  error: string | null;
}

const StockDetailsJson: React.FC<StockDetailsJsonProps> = ({ stock, isLoading, error }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Format JSON for display
  const formatJSON = (json: any) => {
    return JSON.stringify(json, null, 2);
  };

  // Copy JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatJSON(stock));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-300">Loading stock details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-gray-500 dark:text-gray-400">Search and select a stock to view details</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
      <div data-testid="stock-details">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {stock.name || stock.company_name || stock.symbol} Details
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy JSON"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          {stock.current_price && (
            <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                ₹{stock.current_price.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
          )}
          {stock.percent_change && (
            <div className={`${
              Number(stock.percent_change) >= 0 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            } px-3 py-1 rounded-full font-medium`}>
              {Number(stock.percent_change) >= 0 ? '+' : ''}
              {stock.percent_change.toFixed(2)}%
            </div>
          )}
          {stock.sector && (
            <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
              <span className="text-purple-700 dark:text-purple-300">{stock.sector}</span>
            </div>
          )}
          {stock.market_cap && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
              <span className="text-gray-700 dark:text-gray-300">
                Market Cap: ₹{(stock.market_cap / 10000000).toFixed(2)}Cr
              </span>
            </div>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">API Response:</h4>
              <div className="text-xs text-gray-400">
                {Object.keys(stock).length} fields
              </div>
            </div>
            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-800 dark:text-gray-200 max-h-80">
              {formatJSON(stock)}
            </pre>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Data fetched directly from Indian Stock API</p>
        </div>
      </div>
    </div>
  );
};

export default StockDetailsJson; 