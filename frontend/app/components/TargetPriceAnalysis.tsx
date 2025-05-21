'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStockTargetPrice } from '@/services/stockService';
import LoadingSpinner from './LoadingSpinner';
import { Progress } from '@/components/ui/progress';

interface TargetPriceProps {
  symbol: string;
  currentPrice?: number;
}

interface AnalystRecommendation {
  Recommendation: number;
  NumberOfAnalysts: number;
}

interface TargetPriceData {
  priceTarget: {
    CurrencyCode: string;
    Mean: number;
    High: number;
    Low: number;
    NumberOfAnalysts: number;
  };
  recommendation: {
    Mean: number;
    Statistics: {
      Statistic: AnalystRecommendation[];
    };
  };
}

const getRecommendationText = (value: number): string => {
  if (value <= 1.5) return 'Strong Buy';
  if (value <= 2.5) return 'Buy';
  if (value <= 3.5) return 'Hold';
  if (value <= 4.5) return 'Sell';
  return 'Strong Sell';
};

const getRecommendationColor = (value: number): string => {
  if (value <= 1.5) return 'text-green-600 dark:text-green-400';
  if (value <= 2.5) return 'text-emerald-600 dark:text-emerald-400';
  if (value <= 3.5) return 'text-amber-600 dark:text-amber-400';
  if (value <= 4.5) return 'text-red-500 dark:text-red-400';
  return 'text-red-700 dark:text-red-300';
};

const getProgressColor = (type: number): string => {
  switch (type) {
    case 1: return 'bg-green-600';
    case 2: return 'bg-emerald-500';
    case 3: return 'bg-amber-500';
    case 4: return 'bg-red-500';
    case 5: return 'bg-red-700';
    default: return 'bg-gray-500';
  }
};

const TargetPriceAnalysis: React.FC<TargetPriceProps> = ({ symbol, currentPrice }) => {
  const [targetPriceData, setTargetPriceData] = useState<TargetPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTargetPrice = async () => {
      try {
        setLoading(true);
        const data = await getStockTargetPrice(symbol);
        setTargetPriceData(data);
      } catch (err) {
        console.error('Error fetching target price:', err);
        setError('Failed to load target price data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchTargetPrice();
    }
  }, [symbol]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyst Recommendations</CardTitle>
          <CardDescription>Target price analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !targetPriceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyst Recommendations</CardTitle>
          <CardDescription>Target price analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            {error || 'No target price data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { priceTarget, recommendation } = targetPriceData;
  const totalAnalysts = recommendation.Statistics.Statistic.reduce(
    (sum, stat) => sum + stat.NumberOfAnalysts, 0
  );

  const upside = currentPrice 
    ? ((priceTarget.Mean - currentPrice) / currentPrice * 100).toFixed(2)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyst Recommendations</CardTitle>
        <CardDescription>Based on {priceTarget.NumberOfAnalysts} analyst estimates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-sm font-medium">Target Price Range (₹)</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs">₹{priceTarget.Low.toLocaleString('en-IN')}</span>
              <span className="text-xs">₹{priceTarget.High.toLocaleString('en-IN')}</span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              {currentPrice && (
                <div 
                  className="absolute h-4 w-2 bg-blue-600 -top-1 rounded-full"
                  style={{ 
                    left: `${((currentPrice - priceTarget.Low) / (priceTarget.High - priceTarget.Low)) * 100}%`
                  }}
                ></div>
              )}
              <div 
                className="absolute h-4 w-2 bg-green-600 -top-1 rounded-full"
                style={{ 
                  left: `${((priceTarget.Mean - priceTarget.Low) / (priceTarget.High - priceTarget.Low)) * 100}%`
                }}
              ></div>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Mean Target</div>
                  <div className="text-lg font-semibold">₹{priceTarget.Mean.toLocaleString('en-IN')}</div>
                  {upside && (
                    <div className={`text-xs ${parseFloat(upside) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {parseFloat(upside) >= 0 ? '+' : ''}{upside}% potential {parseFloat(upside) >= 0 ? 'upside' : 'downside'}
                    </div>
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Consensus</div>
                  <div className={`text-lg font-semibold ${getRecommendationColor(recommendation.Mean)}`}>
                    {getRecommendationText(recommendation.Mean)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Score: {recommendation.Mean.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm font-medium mb-2">Analyst Recommendations</div>
            {recommendation.Statistics.Statistic.map((stat, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{getRecommendationText(stat.Recommendation)}</span>
                  <span>{stat.NumberOfAnalysts} ({Math.round(stat.NumberOfAnalysts / totalAnalysts * 100)}%)</span>
                </div>
                <Progress 
                  value={(stat.NumberOfAnalysts / totalAnalysts) * 100} 
                  className={`h-2 ${getProgressColor(stat.Recommendation)}`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetPriceAnalysis; 