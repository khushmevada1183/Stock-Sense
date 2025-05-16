"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { apiHelpers } from '../../../utils/api';
import DataSummaryCard, { defaultIcons } from '@/components/stocks/DataSummaryCard';
import { 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  LineChart, 
  BarChart4, 
  Scale,
  Percent
} from 'lucide-react';

// Enhanced stock detail page that uses API helpers and displays more detailed information
export default function StockDetailPage() {
  const params = useParams();
  const symbol = params?.symbol as string || '';

  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!symbol) {
      setError('No symbol provided');
      setLoading(false);
      return;
    }

    // Function to fetch stock data using our improved apiHelpers
    const fetchStockData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching stock data for symbol: ${symbol}`);
        
        // Use the robust apiHelpers which will try multiple endpoints and formats
        const data = await apiHelpers.getStockDetails(symbol);
        
        if (data) {
          console.log('Stock data received:', data);
          setStockData(data);
        } else {
          setError(`No data found for "${symbol}". Please check the stock name or symbol and try again.`);
        }
      } catch (err: any) {
        console.error('Error fetching stock data:', err);
        setError(
          err.response?.status === 404
            ? `Stock "${symbol}" not found. Please check the name or symbol and try again.`
            : `Failed to fetch stock data: ${err.message || 'Unknown error'}. Please try again.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  // Helper function to extract price
  const extractPrice = () => {
    if (!stockData) return 'N/A';
    
    // Try all possible price fields
    if (stockData.latestPrice) return stockData.latestPrice;
    if (stockData.price) return stockData.price;
    if (stockData.current_price) return stockData.current_price;
    if (stockData.currentPrice?.BSE) return stockData.currentPrice.BSE;
    if (stockData.currentPrice?.NSE) return stockData.currentPrice.NSE;
    if (stockData.stockTechnicalData?.[0]?.bsePrice) return stockData.stockTechnicalData[0].bsePrice;
    
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
        {error || `No data found for symbol "${symbol}"`}
      </div>
    );
  }

  // Extract key information for display
  const companyName = stockData.companyName || stockData.name || symbol;
  const displaySymbol = stockData.symbol || symbol;
  const industry = stockData.industry || stockData.sector || 'N/A';
  const price = extractPrice();
  
  // Percent change
  const percentChange = stockData.percentChange || stockData.percent_change || 0;
  const isPositive = parseFloat(percentChange) >= 0;
  
  // 52-week range
  const yearHigh = stockData.yearHigh || stockData.year_high;
  const yearLow = stockData.yearLow || stockData.year_low;
  
  // Key metrics
  const marketCap = stockData.marketCap || stockData.market_cap;
  const pe = stockData.pe || stockData.pe_ratio;
  const eps = stockData.eps;
  const debtToEquity = stockData.debtToEquity || stockData.debt_to_equity;
  const dividendYield = stockData.dividendYield || stockData.dividend_yield;
  const volume = stockData.volume;
  const avgVolume = stockData.averageVolume || stockData.average_volume;
  
  // Company description
  const description = stockData.companyProfile?.companyDescription || stockData.description || 'No company description available.';
  
  // Identifiers
  const isin = stockData.companyProfile?.isInId;
  const bseCode = stockData.companyProfile?.exchangeCodeBse;
  const nseCode = stockData.companyProfile?.exchangeCodeNse;
  
  // Management team
  const officers = stockData.companyProfile?.officers?.officer || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        {/* Stock Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{companyName}</h1>
              <p className="text-gray-600">{displaySymbol}</p>
              {industry && <p className="text-sm text-gray-500 mt-1">{industry}</p>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">₹{price}</div>
              {percentChange && (
                <div className={`flex items-center justify-end text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{isPositive ? '+' : ''}{percentChange}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Details */}
        <div className="p-6">
          {/* 52 Week Range */}
          {(yearHigh || yearLow) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">52 Week Range</h2>
              <div className="flex items-center justify-between">
                <span>₹{yearLow || 'N/A'}</span>
                <div className="h-2 bg-gray-200 rounded-full flex-grow mx-4 relative">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        Math.max(
                          0, 
                          ((price - (yearLow || 0)) / 
                           ((yearHigh || 0) - (yearLow || 0))) * 100
                        )
                      )}%` 
                    }}
                  />
                  <div 
                    className="absolute h-4 w-4 bg-blue-600 -top-1 rounded-full transform -translate-x-1/2"
                    style={{ 
                      left: `${Math.min(
                        100, 
                        Math.max(
                          0, 
                          ((price - (yearLow || 0)) / 
                           ((yearHigh || 0) - (yearLow || 0))) * 100
                        )
                      )}%` 
                    }}
                  />
                </div>
                <span>₹{yearHigh || 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          {(marketCap || pe || eps || dividendYield) && (
            <DataSummaryCard
              title="Key Metrics"
              description="Important financial indicators"
              metrics={[
                ...(marketCap ? [{
                  label: "Market Cap",
                  value: marketCap,
                  icon: <BarChart4 className="h-5 w-5" />,
                  isCurrency: true,
                  highlight: true
                }] : []),
                ...(pe ? [{
                  label: "P/E Ratio",
                  value: pe,
                  icon: <Scale className="h-5 w-5" />
                }] : []),
                ...(eps ? [{
                  label: "EPS",
                  value: eps,
                  icon: <DollarSign className="h-5 w-5" />,
                  isCurrency: true
                }] : []),
                ...(dividendYield ? [{
                  label: "Dividend Yield",
                  value: dividendYield,
                  icon: <Percent className="h-5 w-5" />,
                  isPercentage: true,
                  isPositive: true
                }] : []),
                ...(volume ? [{
                  label: "Volume",
                  value: volume,
                  icon: <TrendingUp className="h-5 w-5" />
                }] : []),
                ...(avgVolume ? [{
                  label: "Avg Volume",
                  value: avgVolume,
                  icon: <LineChart className="h-5 w-5" />
                }] : []),
                ...(debtToEquity ? [{
                  label: "Debt to Equity",
                  value: debtToEquity
                }] : [])
              ]}
            />
          )}

          {/* Company Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-700">{description}</p>
          </div>

          {/* Stock Identifiers */}
          {(isin || bseCode || nseCode) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Stock Identifiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isin && (
                  <div>
                    <p className="text-sm text-gray-500">ISIN</p>
                    <p className="font-semibold">{isin}</p>
                  </div>
                )}
                {bseCode && (
                  <div>
                    <p className="text-sm text-gray-500">BSE Code</p>
                    <p className="font-semibold">{bseCode}</p>
                  </div>
                )}
                {nseCode && (
                  <div>
                    <p className="text-sm text-gray-500">NSE Code</p>
                    <p className="font-semibold">{nseCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Management Team */}
          {officers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Key Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {officers.map((officer: any, index: number) => {
                  const fullName = [officer.firstName, officer.mI, officer.lastName].filter(Boolean).join(' ');
                  return (
                    <div key={index} className="border p-3 rounded-lg">
                      <p className="font-semibold">{fullName}</p>
                      <p className="text-sm text-gray-600">{officer.title?.Value || officer.title}</p>
                      {officer.since && <p className="text-xs text-gray-500 mt-1">Since {officer.since}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technical Data */}
          {stockData.stockTechnicalData && stockData.stockTechnicalData.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Price Data</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Days</th>
                      <th className="text-right py-2">BSE Price</th>
                      <th className="text-right py-2">NSE Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.stockTechnicalData.slice(0, 5).map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.days || 'N/A'}</td>
                        <td className="text-right py-2">₹{item.bsePrice || 'N/A'}</td>
                        <td className="text-right py-2">₹{item.nsePrice || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Data (for debugging) */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Debug Data</h3>
            <pre className="text-xs overflow-auto max-h-48">
              {JSON.stringify(stockData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 