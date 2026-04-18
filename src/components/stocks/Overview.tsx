"use client";

import React from 'react';
import { Building, LineChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FinancialHighlights from '@/components/stocks/FinancialHighlights';
import ManagementInfo from '@/components/stocks/ManagementInfo';
import StockNewsSection from '@/components/stocks/StockNewsSection';

interface OverviewProps {
  stockData: unknown;
  symbol: string;
  companyName: string;
  industry: string;
  price: string | number;
  yearHigh: number | undefined;
  yearLow: number | undefined;
  volume: number | undefined;
  marketCap: string | number | undefined;
  avgVolume: number | undefined;
  dividendYield: number | string | undefined;
  debtToEquity: number | string | undefined;
  description: string;
  financialData: React.ComponentProps<typeof FinancialHighlights>['financialData'];
  recentNews: React.ComponentProps<typeof StockNewsSection>['news'];
  officers: React.ComponentProps<typeof ManagementInfo>['officers'];
  managementFallbackDetails?: React.ComponentProps<typeof ManagementInfo>['fallbackDetails'];
  // Chart refs
  performanceChartRef: React.RefObject<HTMLCanvasElement>;
  sectorDistributionChartRef: React.RefObject<HTMLCanvasElement>;
  aboutRef: React.RefObject<HTMLDivElement>;
  chartContainerRef: React.RefObject<HTMLDivElement>;
}

const Overview: React.FC<OverviewProps> = ({
  volume,
  marketCap,
  dividendYield,
  debtToEquity,
  description,
  financialData,
  recentNews,
  officers,
  managementFallbackDetails,
  performanceChartRef,
  sectorDistributionChartRef,
  aboutRef,
  chartContainerRef
}) => {
  return (
    <div className="space-y-8">
      {/* Financial Highlights Section */}
      {financialData && financialData.length > 0 && (
        <FinancialHighlights financialData={financialData} />
      )}
      
      {/* Charts and About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div ref={chartContainerRef} className="lg:col-span-2">
          <Card glass className="h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-400" />
                Price Performance
              </CardTitle>
              <CardDescription className="text-gray-500">Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] relative">
                <canvas ref={performanceChartRef} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* About Card */}
        <div ref={aboutRef} className="lg:col-span-1">
          <Card glass className="h-full">
            <CardHeader>
              <CardTitle className="text-white">About</CardTitle>
              <CardDescription className="text-gray-500">Company Overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-400 text-sm overflow-y-auto max-h-[230px] pr-2 leading-relaxed">
                {description}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trading Info and Sector Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Info */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LineChart className="h-5 w-5 text-neon-400" />
              Trading Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              { label: 'Market Cap', value: marketCap || 'N/A' },
              { label: 'Volume', value: volume ? volume.toLocaleString() : 'N/A' },
              { label: 'Dividend Yield', value: dividendYield && dividendYield !== 'N/A' ? `${dividendYield}%` : 'N/A' },
              { label: 'Debt to Equity', value: debtToEquity || 'N/A' }
            ].map((item, i, arr) => (
              <div 
                key={item.label} 
                className={`flex justify-between py-3 ${
                  i < arr.length - 1 ? 'border-b border-gray-800/30' : ''
                }`}
              >
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className="text-gray-200 font-medium text-sm">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Sector Distribution */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-neon-400" />
              Sector Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center relative">
              <canvas ref={sectorDistributionChartRef} />
            </div>
          </CardContent>
        </Card>
        
        {/* Key Management - Basic version for overview */}
        <div className="lg:col-span-1">
          <ManagementInfo officers={officers} fallbackDetails={managementFallbackDetails} />
        </div>
      </div>

      {/* Recent News Section */}
      {recentNews && recentNews.length > 0 && (
        <StockNewsSection news={recentNews} />
      )}
    </div>
  );
};

export default Overview;
