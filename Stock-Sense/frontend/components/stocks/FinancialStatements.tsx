import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface FinancialStatementsProps {
  financialData: FinancialPeriod[];
}

const FinancialStatements: React.FC<FinancialStatementsProps> = ({ financialData }) => {
  const [activeTab, setActiveTab] = useState('income');

  // Check if we have any financial data
  if (!financialData || financialData.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Financial Statements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No financial statement data available.</p>
        </CardContent>
      </Card>
    );
  }

  // Get the most recent financial period
  const latestFinancialPeriod = financialData[0];
  const { stockFinancialMap } = latestFinancialPeriod;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format value with commas for thousands
  const formatValue = (value: string) => {
    if (!value) return 'N/A';
    
    // Check if value is a number
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // Format with commas
    return num.toLocaleString('en-IN');
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Financial Statements</CardTitle>
        <div className="text-sm text-gray-400">
          <span>Period ending: {formatDate(latestFinancialPeriod.EndDate)}</span>
          <span className="ml-4">Type: {latestFinancialPeriod.Type}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cash">Cash Flow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income">
            {stockFinancialMap.INC && stockFinancialMap.INC.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Metric</TableHead>
                      <TableHead className="text-gray-300 text-right">Value (₹ in Cr)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockFinancialMap.INC.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-gray-400">{item.displayName}</TableCell>
                        <TableCell className="text-white text-right">{formatValue(item.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-400">No income statement data available.</p>
            )}
          </TabsContent>
          
          <TabsContent value="balance">
            {stockFinancialMap.BAL && stockFinancialMap.BAL.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Metric</TableHead>
                      <TableHead className="text-gray-300 text-right">Value (₹ in Cr)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockFinancialMap.BAL.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-gray-400">{item.displayName}</TableCell>
                        <TableCell className="text-white text-right">{formatValue(item.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-400">No balance sheet data available.</p>
            )}
          </TabsContent>
          
          <TabsContent value="cash">
            {stockFinancialMap.CAS && stockFinancialMap.CAS.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Metric</TableHead>
                      <TableHead className="text-gray-300 text-right">Value (₹ in Cr)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockFinancialMap.CAS.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-gray-400">{item.displayName}</TableCell>
                        <TableCell className="text-white text-right">{formatValue(item.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-400">No cash flow statement data available.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialStatements; 