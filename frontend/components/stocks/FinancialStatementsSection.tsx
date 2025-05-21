import React, { useState } from 'react';
import { FileText, TrendingUp, Calendar, Search } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FinancialItem {
  displayName: string;
  value: string | number;
  key?: string;
  yqoQComp?: number;  // Year-over-Year comparison
  qoQComp?: number;   // Quarter-over-Quarter comparison
}

interface FinancialStatement {
  type: 'CAS' | 'BAL' | 'INC';  // Cash Flow, Balance Sheet, Income Statement
  items: FinancialItem[];
}

interface FinancialYear {
  fiscalYear: string;
  endDate: string;
  type: 'Annual' | 'Quarterly';
  statementDate: string;
  fiscalPeriodNumber?: number;
  statements: {
    cashFlow?: FinancialStatement;
    balanceSheet?: FinancialStatement;
    incomeStatement?: FinancialStatement;
  };
}

interface FinancialStatementsSectionProps {
  financials: FinancialYear[];
}

const FinancialStatementsSection = ({ financials }: FinancialStatementsSectionProps) => {
  const [activeTab, setActiveTab] = useState<'cashFlow' | 'balanceSheet' | 'incomeStatement'>('incomeStatement');
  const [selectedYear, setSelectedYear] = useState<string>(financials[0]?.fiscalYear || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Get array of unique fiscal years
  const fiscalYears = Array.from(new Set(financials.map(f => f.fiscalYear))).sort().reverse();
  
  // Set the first year as default if not set
  React.useEffect(() => {
    if (fiscalYears.length > 0 && !selectedYear) {
      setSelectedYear(fiscalYears[0]);
    }
  }, [fiscalYears, selectedYear]);
  
  // Get the selected financial year data
  const selectedFinancials = financials.find(f => f.fiscalYear === selectedYear);
  
  // Helper to get statement data based on active tab
  const getActiveStatementData = (): FinancialItem[] => {
    if (!selectedFinancials) return [];
    
    switch (activeTab) {
      case 'cashFlow':
        return selectedFinancials.statements.cashFlow?.items || [];
      case 'balanceSheet':
        return selectedFinancials.statements.balanceSheet?.items || [];
      case 'incomeStatement':
        return selectedFinancials.statements.incomeStatement?.items || [];
      default:
        return [];
    }
  };
  
  // Filter items based on search term
  const filteredItems = getActiveStatementData().filter(item => 
    item.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format number with commas and decimal places
  const formatNumber = (value: string | number): string => {
    if (typeof value === 'string') {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) return value;
      return parsedValue.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };
  
  // Get comparison color based on value
  const getComparisonColor = (value?: number): string => {
    if (!value) return '';
    return value > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Financial Statements
        </CardTitle>
        <CardDescription className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {selectedFinancials ? (
            <span>As of {new Date(selectedFinancials.endDate).toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          ) : (
            <span>Financial data</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {financials.length > 0 ? (
          <>
            {/* Year Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fiscal Year
              </label>
              <div className="flex flex-wrap gap-2">
                {fiscalYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedYear === year 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    FY {year}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Statement Type Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="incomeStatement">Income Statement</TabsTrigger>
                <TabsTrigger value="balanceSheet">Balance Sheet</TabsTrigger>
                <TabsTrigger value="cashFlow">Cash Flow</TabsTrigger>
              </TabsList>
              
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search financial items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  />
                </div>
              </div>
              
              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="p-3 border-b dark:border-gray-700">Item</th>
                      <th className="p-3 border-b dark:border-gray-700 text-right">Value (₹ Cr)</th>
                      {/* Show Y/Y column if data exists */}
                      {filteredItems.some(item => item.yqoQComp !== undefined) && (
                        <th className="p-3 border-b dark:border-gray-700 text-right">Y/Y Change</th>
                      )}
                      {/* Show Q/Q column if data exists */}
                      {filteredItems.some(item => item.qoQComp !== undefined) && (
                        <th className="p-3 border-b dark:border-gray-700 text-right">Q/Q Change</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => (
                        <tr 
                          key={`${item.key || item.displayName}-${index}`}
                          className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                        >
                          <td className="p-3 border-b dark:border-gray-700">{item.displayName}</td>
                          <td className="p-3 border-b dark:border-gray-700 text-right font-medium">
                            {formatNumber(item.value)}
                          </td>
                          {/* Y/Y Change */}
                          {filteredItems.some(item => item.yqoQComp !== undefined) && (
                            <td className={`p-3 border-b dark:border-gray-700 text-right ${getComparisonColor(item.yqoQComp)}`}>
                              {item.yqoQComp !== undefined ? (
                                <div className="flex items-center justify-end">
                                  {item.yqoQComp > 0 ? '+' : ''}{item.yqoQComp.toFixed(2)}%
                                  <TrendingUp className={`h-4 w-4 ml-1 ${item.yqoQComp >= 0 ? 'rotate-0' : 'rotate-180'}`} />
                                </div>
                              ) : '-'}
                            </td>
                          )}
                          {/* Q/Q Change */}
                          {filteredItems.some(item => item.qoQComp !== undefined) && (
                            <td className={`p-3 border-b dark:border-gray-700 text-right ${getComparisonColor(item.qoQComp)}`}>
                              {item.qoQComp !== undefined ? (
                                <div className="flex items-center justify-end">
                                  {item.qoQComp > 0 ? '+' : ''}{item.qoQComp.toFixed(2)}%
                                  <TrendingUp className={`h-4 w-4 ml-1 ${item.qoQComp >= 0 ? 'rotate-0' : 'rotate-180'}`} />
                                </div>
                              ) : '-'}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          {searchTerm 
                            ? 'No items match your search. Try a different term.' 
                            : 'No financial data available for this statement.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Financial data is not available at this time.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialStatementsSection; 