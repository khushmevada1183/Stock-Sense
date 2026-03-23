"use client";

import React from 'react';
import { BarChart4 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FinancialStatements from '@/components/stocks/FinancialStatements';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FundamentalAnalysisProps {
  financialRatios: any;
  financialStatements: any;
  companyName: string;
  pe: string | number;
  eps: string | number;
  dividendYield: string | number;
  debtToEquity: string | number;
  currencySymbol: string;
  loadingRatios: boolean;
  errorRatios: string | null;
  loadingStatements: boolean;
  errorStatements: string | null;
  transformFetchedFinancialStatements: (data: any) => any;
}

const FundamentalAnalysis: React.FC<FundamentalAnalysisProps> = ({
  financialRatios,
  financialStatements,
  companyName,
  pe,
  eps,
  dividendYield,
  debtToEquity,
  currencySymbol = '₹',
  loadingRatios,
  errorRatios,
  loadingStatements,
  errorStatements,
  transformFetchedFinancialStatements
}) => {
  // Helper function to render financial ratio items
  const renderRatioItem = (label: string, value: string | number | undefined, unit: string = '') => {
    if (value === undefined || value === null || value === 'N/A' || value === '--' || value === '-') {
      return null; 
    }
    return (
      <div className="flex justify-between py-3 border-b border-gray-800/30 last:border-b-0">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="text-gray-200 font-medium text-sm">{typeof value === 'number' ? value.toFixed(2) : value}{unit}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Financial Ratios Section */}
      {!loadingRatios && financialRatios && Object.keys(financialRatios).length > 0 && (
        <Card glass className="text-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <BarChart4 className="w-5 h-5 mr-2.5 text-neon-400" />
              Key Financial Ratios
            </CardTitle>
            <CardDescription className="text-gray-500">
              Important financial metrics for {companyName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
              {renderRatioItem("P/E Ratio", financialRatios.peRatio ?? pe)} 
              {renderRatioItem("P/B Ratio", financialRatios.pbRatio)}
              {renderRatioItem("Dividend Yield", financialRatios.dividendYield ?? dividendYield, '%')}
              {renderRatioItem("Debt to Equity", financialRatios.debtToEquity ?? debtToEquity)}
              {renderRatioItem("ROE (Return on Equity)", financialRatios.roe, '%')}
              {renderRatioItem("ROCE (Return on Capital Employed)", financialRatios.roce, '%')}
              {renderRatioItem("EPS (Earnings Per Share)", financialRatios.eps ?? eps, currencySymbol)}
              {renderRatioItem("Book Value", financialRatios.bookValue, currencySymbol)}
              {renderRatioItem("Current Ratio", financialRatios.currentRatio)}
              {renderRatioItem("Quick Ratio", financialRatios.quickRatio)}
              {renderRatioItem("Promoter Holding", financialRatios.promoterHolding, '%')}
              {renderRatioItem("Pledged Percentage", financialRatios.pledgedPercentage, '%')}
            </div>
          </CardContent>
        </Card>
      )}
      {loadingRatios && <LoadingSpinner />}
      {!loadingRatios && errorRatios && (
        <Card glass>
          <CardContent className="p-6">
            <p className="text-red-400 text-sm">{errorRatios}</p>
          </CardContent>
        </Card>
      )}

      {/* Financial Statements Section */}
      {!loadingStatements && financialStatements && (
        <FinancialStatements 
          financialData={transformFetchedFinancialStatements(financialStatements)}
        />
      )}
      {loadingStatements && <LoadingSpinner />}
      {!loadingStatements && errorStatements && (
        <Card glass>
          <CardContent className="p-6">
            <p className="text-red-400 text-sm">{errorStatements}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FundamentalAnalysis;
