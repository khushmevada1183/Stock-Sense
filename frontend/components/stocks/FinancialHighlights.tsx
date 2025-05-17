import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Scale, DollarSign, BarChart4, Percent } from 'lucide-react';

interface FinancialItem {
  displayName: string;
  key: string;
  value: string;
  yqoQComp: string | null;
  qoQComp: string | null;
}

interface FinancialData {
  CAS?: FinancialItem[] | null; // Cash Flow
  BAL?: FinancialItem[] | null; // Balance Sheet
  INC?: FinancialItem[] | null; // Income Statement
}

interface FinancialPeriod {
  stockFinancialMap: FinancialData;
  FiscalYear: string;
  EndDate: string;
  Type: string; // "Annual" or "Interim"
  StatementDate: string;
  fiscalPeriodNumber: number;
}

interface FinancialHighlightsProps {
  financialData: FinancialPeriod[];
}

interface HighlightMetric {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
}

const FinancialHighlights: React.FC<FinancialHighlightsProps> = ({ financialData }) => {
  if (!financialData || financialData.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Financial Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No financial data available.</p>
        </CardContent>
      </Card>
    );
  }

  // Get the most recent financial period
  const latestFinancialPeriod = financialData[0];
  const { stockFinancialMap } = latestFinancialPeriod;

  // Helper to find item in financial data
  const findItem = (section: keyof FinancialData, key: string): FinancialItem | undefined => {
    const data = stockFinancialMap[section];
    if (!data) return undefined;
    return data.find((item) => item.key === key);
  };

  // Helper to find item by display name (less reliable but useful as fallback)
  const findItemByDisplayName = (section: keyof FinancialData, namePattern: string): FinancialItem | undefined => {
    const data = stockFinancialMap[section];
    if (!data) return undefined;
    return data.find((item) => 
      item.displayName.toLowerCase().includes(namePattern.toLowerCase())
    );
  };

  // Format value with commas for thousands
  const formatValue = (value?: string) => {
    if (!value) return 'N/A';
    
    // Check if value is a number
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // Format with commas
    return num.toLocaleString('en-IN');
  };

  // Extraction of key financial metrics
  const revenueItem = findItem('INC', 'Revenue') || findItemByDisplayName('INC', 'revenue');
  const netIncomeItem = findItem('INC', 'NetIncome') || findItemByDisplayName('INC', 'net income');
  const epsItem = findItem('INC', 'DilutedEPSExcludingExtraOrdItems') || findItemByDisplayName('INC', 'eps');
  const totalAssetsItem = findItem('BAL', 'TotalAssets') || findItemByDisplayName('BAL', 'total assets');
  const totalDebtItem = findItem('BAL', 'TotalDebt') || findItemByDisplayName('BAL', 'total debt');
  const cashItem = findItem('BAL', 'Cash') || findItemByDisplayName('BAL', 'cash');

  // Create highlight metrics
  const highlightMetrics: HighlightMetric[] = [
    {
      title: 'Revenue',
      value: `₹${formatValue(revenueItem?.value)} Cr`,
      icon: <BarChart4 className="h-5 w-5" />,
    },
    {
      title: 'Net Income',
      value: `₹${formatValue(netIncomeItem?.value)} Cr`,
      icon: <TrendingUp className="h-5 w-5" />,
      isPositive: netIncomeItem ? parseFloat(netIncomeItem.value) > 0 : undefined,
    },
    {
      title: 'EPS',
      value: `₹${formatValue(epsItem?.value)}`,
      icon: <DollarSign className="h-5 w-5" />,
      isPositive: epsItem ? parseFloat(epsItem.value) > 0 : undefined,
    },
    {
      title: 'Total Assets',
      value: `₹${formatValue(totalAssetsItem?.value)} Cr`,
      icon: <BarChart4 className="h-5 w-5" />,
    },
    {
      title: 'Total Debt',
      value: `₹${formatValue(totalDebtItem?.value)} Cr`,
      icon: <Scale className="h-5 w-5" />,
    },
    {
      title: 'Cash',
      value: `₹${formatValue(cashItem?.value)} Cr`,
      icon: <DollarSign className="h-5 w-5" />,
    }
  ];

  // Calculate period label (Quarterly, Annual)
  const periodType = latestFinancialPeriod.Type === 'Annual' ? 'Annual' : 'Quarterly';
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          Financial Highlights ({periodType})
        </CardTitle>
        <div className="text-sm text-gray-400">
          Period: {latestFinancialPeriod.EndDate.split('-')[0]} - FY{latestFinancialPeriod.FiscalYear}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlightMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700/80 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-400 font-medium text-sm">{metric.title}</h3>
                <div className={`p-2 rounded-lg ${
                  typeof metric.isPositive === 'boolean' 
                    ? metric.isPositive 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {metric.icon}
                </div>
              </div>
              <p className="text-xl font-bold text-white">{metric.value}</p>
              {metric.change && (
                <div className={`flex items-center mt-1 text-sm ${
                  metric.isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  <span>{metric.change}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHighlights; 