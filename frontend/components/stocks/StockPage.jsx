'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from './LoadingSpinner';

/**
 * StockPage component to display detailed stock information
 */
const StockPage = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockDetails = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/stocks/${symbol}`);
        
        // Extract stock data from the response
        const stockData = response.data?.data || response.data;
        
        // Process stock data for consistent rendering
        const processedData = processStockData(stockData);
        setStock(processedData);
      } catch (err) {
        console.error('Error fetching stock details:', err);
        setError('Failed to load stock details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [symbol]);

  // Process the stock data to handle different API response formats
  const processStockData = (data) => {
    if (!data) return null;
    
    // Extract the current price
    let currentPrice = null;
    if (data.latestPrice) {
      currentPrice = data.latestPrice;
    } else if (data.currentPrice) {
      // Handle the object with BSE/NSE properties
      currentPrice = data.currentPrice.BSE || data.currentPrice.NSE;
    } else if (data.price) {
      currentPrice = data.price;
    } else if (data.stockTechnicalData && data.stockTechnicalData.length > 0) {
      currentPrice = data.stockTechnicalData[0].bsePrice || data.stockTechnicalData[0].nsePrice;
    }
    
    // Extract change percentage
    let changePercent = null;
    if (data.changePercent) {
      changePercent = data.changePercent;
    } else if (data.percentChange) {
      changePercent = parseFloat(data.percentChange);
    } else if (data.percent_change) {
      changePercent = parseFloat(data.percent_change);
    }
    
    return {
      ...data,
      processedPrice: currentPrice,
      processedChange: changePercent,
      companyName: data.companyName || data.name || data.company_name || symbol,
      symbol: data.symbol || symbol,
      sector: data.sector || data.industry || 'Unknown',
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
        {error}
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">
        No data available for this stock.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stock.companyName}</h1>
            <div className="flex items-center mt-1">
              <span className="text-sm font-medium bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                {stock.symbol}
              </span>
              {stock.sector && (
                <span className="ml-2 text-sm text-gray-600">
                  {stock.sector}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              ₹{stock.processedPrice || 'N/A'}
            </div>
            {stock.processedChange && (
              <div 
                className={`flex items-center justify-end mt-1 ${
                  stock.processedChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stock.processedChange >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                <span className="font-medium">
                  {stock.processedChange >= 0 ? '+' : ''}
                  {stock.processedChange}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Details */}
      <div className="p-6">
        {/* Price Range */}
        {(stock.yearHigh || stock.yearLow) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Price Range (52 Week)</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Low</div>
                <div className="font-medium">₹{stock.yearLow || 'N/A'}</div>
              </div>
              <div className="grow mx-4 h-2 bg-gray-200 rounded-full">
                {stock.yearHigh && stock.yearLow && stock.processedPrice && (
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        Math.max(
                          0, 
                          ((stock.processedPrice - stock.yearLow) / (stock.yearHigh - stock.yearLow)) * 100
                        )
                      )}%` 
                    }}
                  />
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500">High</div>
                <div className="font-medium">₹{stock.yearHigh || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Company Description */}
        {stock.companyProfile?.companyDescription && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-700 leading-relaxed">
              {stock.companyProfile.companyDescription}
            </p>
          </div>
        )}

        {/* Key Metrics */}
        {stock.keyMetrics && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Key Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Map available metrics for display */}
              {stock.keyMetrics.valuation && (
                <>
                  <div>
                    <div className="text-sm text-gray-500">P/E Ratio</div>
                    <div className="font-medium">{stock.keyMetrics.valuation.peRatio || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Market Cap</div>
                    <div className="font-medium">{stock.keyMetrics.valuation.marketCap || 'N/A'}</div>
                  </div>
                </>
              )}
              {stock.keyMetrics.financialstrength && (
                <div>
                  <div className="text-sm text-gray-500">Debt to Equity</div>
                  <div className="font-medium">{stock.keyMetrics.financialstrength.debtToEquity || 'N/A'}</div>
                </div>
              )}
              {stock.keyMetrics.persharedata && (
                <div>
                  <div className="text-sm text-gray-500">EPS</div>
                  <div className="font-medium">{stock.keyMetrics.persharedata.eps || 'N/A'}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Data Summary */}
        {stock.financials && stock.financials.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Financial Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quarter
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stock.financials.slice(0, 4).map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.date || item.quarter || 'Q' + (4 - index)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.revenue || item.Revenue || 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.profit || item.NetProfit || item['Net Profit'] || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPage; 