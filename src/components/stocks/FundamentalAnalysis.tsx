"use client";

import React from 'react';
import { BarChart4 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FinancialStatements, { type FinancialPeriod } from '@/components/stocks/FinancialStatements';
import CursiveLoader from '@/components/ui/CursiveLoader';

interface FinancialRatios {
  peRatio?: string | number;
  pbRatio?: string | number;
  dividendYield?: string | number;
  debtToEquity?: string | number;
  roe?: string | number;
  roce?: string | number;
  eps?: string | number;
  bookValue?: string | number;
  currentRatio?: string | number;
  quickRatio?: string | number;
  promoterHolding?: string | number;
  pledgedPercentage?: string | number;
}

interface FundamentalAnalysisProps {
  financialRatios: FinancialRatios | null;
  financialStatements: unknown;
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
  transformFetchedFinancialStatements: (data: unknown) => FinancialPeriod[];
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
      <div className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
        <span className="text-slate-600 dark:text-slate-400 text-sm">{label}</span>
        <span className="text-slate-900 dark:text-slate-100 font-medium text-sm">{typeof value === 'number' ? value.toFixed(2) : value}{unit}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Financial Ratios Section */}
      {!loadingRatios && financialRatios && Object.keys(financialRatios).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <BarChart4 className="w-5 h-5 mr-2.5 text-blue-600 dark:text-blue-400" />
              Key Financial Ratios
            </CardTitle>
            <CardDescription>
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
      {loadingRatios && <CursiveLoader className="min-h-[120px] w-full" />}
      {!loadingRatios && typeof errorRatios === 'string' && errorRatios.length > 0 && (
        <Card glass>
          <CardContent className="p-6">
            <p className="text-red-400 text-sm">{errorRatios}</p>
          </CardContent>
        </Card>
      )}

      {/* Financial Statements Section */}
      {!loadingStatements && financialStatements != null && (
        <FinancialStatements 
          financialData={transformFetchedFinancialStatements(financialStatements)}
        />
      )}
      {loadingStatements && <CursiveLoader className="min-h-[120px] w-full" />}
      {!loadingStatements && typeof errorStatements === 'string' && errorStatements.length > 0 && (
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
