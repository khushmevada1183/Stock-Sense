import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import StockLogo from '@/components/stocks/StockLogo';

interface CompanyHeaderProps {
  companyName: string;
  symbol: string;
  industry: string;
  bsePrice: number;
  nsePrice: number;
  percentChange: number;
  yearHigh: number;
  yearLow: number;
  imageUrl?: string;
}

const CompanyHeader = ({
  companyName,
  symbol,
  industry,
  bsePrice,
  nsePrice,
  percentChange,
  yearHigh,
  yearLow,
  imageUrl
}: CompanyHeaderProps) => {
  const isPositive = percentChange >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <StockLogo symbol={symbol} size={64} className="mr-4" imageUrl={imageUrl} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{companyName}</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center flex-wrap">
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded mr-2">{symbol}</span>
              <span className="mr-2">•</span>
              <span>{industry}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-baseline">
            <span className="text-3xl md:text-4xl font-bold mr-3">
              ₹{nsePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {isPositive ? (
                <ArrowUp className="h-5 w-5 mr-1" />
              ) : (
                <ArrowDown className="h-5 w-5 mr-1" />
              )}
              <span className="text-lg font-medium">
                {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="flex mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="mr-4">
              <span className="font-medium mr-1">BSE:</span>
              <span>₹{bsePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="font-medium mr-1">NSE:</span>
              <span>₹{nsePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
          <span>₹{yearLow.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          <span className="font-medium">52-Week Range</span>
          <span>₹{yearHigh.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="absolute h-4 w-4 bg-blue-600 dark:bg-blue-500 -top-1 rounded-full transform -translate-x-1/2"
            style={{ 
              left: `${Math.max(0, Math.min(100, ((nsePrice - yearLow) / (yearHigh - yearLow)) * 100))}%`
            }}
          ></div>
          <div 
            className="h-full bg-blue-100 dark:bg-blue-900/50 rounded-full" 
            style={{ 
              width: `${Math.max(0, Math.min(100, ((nsePrice - yearLow) / (yearHigh - yearLow)) * 100))}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader; 