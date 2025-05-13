import React, { useState } from 'react';
import { ArrowUpDown, Info, ArrowUp, ArrowDown, BarChart2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import StockLogo from '@/components/stocks/StockLogo';

interface PeerCompany {
  companyName: string;
  symbol?: string;
  imageUrl?: string;
  price?: number;
  percentChange?: number;
  netChange?: number;
  marketCap?: number;
  priceToBookValueRatio?: number;
  priceToEarningsValueRatio?: number;
  returnOnAverageEquity5YearAverage?: number;
  returnOnAverageEquityTrailing12Month?: number;
  ltDebtPerEquityMostRecentFiscalYear?: number;
  netProfitMargin5YearAverage?: number;
  netProfitMarginPercentTrailing12Month?: number;
  dividendYieldIndicatedAnnualDividend?: number;
  totalSharesOutstanding?: number;
  overallRating?: string;
  yhigh?: number;
  ylow?: number;
}

interface PeerComparisonTableProps {
  peerCompanies: PeerCompany[];
  currentSymbol: string;
}

// Helper to format large numbers to K, M, B
const formatNumber = (num?: number) => {
  if (num === undefined || num === null) return 'N/A';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  
  return num.toFixed(2);
};

const PeerComparisonTable = ({ peerCompanies, currentSymbol }: PeerComparisonTableProps) => {
  const [sortField, setSortField] = useState<string>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Sort the peer companies
  const sortedPeers = [...peerCompanies].sort((a, b) => {
    const fieldA = a[sortField as keyof PeerCompany];
    const fieldB = b[sortField as keyof PeerCompany];
    
    // Handle undefined/null values
    if (fieldA === undefined || fieldA === null) return 1;
    if (fieldB === undefined || fieldB === null) return -1;
    
    // Handle string comparisons
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    // Handle number comparisons
    return sortDirection === 'asc' 
      ? Number(fieldA) - Number(fieldB) 
      : Number(fieldB) - Number(fieldA);
  });
  
  // Get rating color based on rating text
  const getRatingColor = (rating?: string) => {
    if (!rating) return 'text-gray-500';
    
    const lowerRating = rating.toLowerCase();
    if (lowerRating.includes('bullish') || lowerRating.includes('strong buy') || lowerRating.includes('buy')) {
      return 'text-green-600 dark:text-green-500';
    } else if (lowerRating.includes('bearish') || lowerRating.includes('sell')) {
      return 'text-red-600 dark:text-red-500';
    }
    return 'text-amber-600 dark:text-amber-500';
  };
  
  const getSortArrow = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Peer Comparison
        </CardTitle>
        <CardDescription>Compare with similar companies</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center">
                    Price {getSortArrow('price')}
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('percentChange')}>
                  <div className="flex items-center">
                    Chg% {getSortArrow('percentChange')}
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('marketCap')}>
                  <div className="flex items-center">
                    Mkt Cap {getSortArrow('marketCap')}
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('priceToEarningsValueRatio')}>
                  <div className="flex items-center">
                    P/E {getSortArrow('priceToEarningsValueRatio')}
                    <div title="Price to Earnings Ratio">
                      <Info className="h-3 w-3 ml-1 text-gray-400" />
                    </div>
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('netProfitMarginPercentTrailing12Month')}>
                  <div className="flex items-center">
                    Margin {getSortArrow('netProfitMarginPercentTrailing12Month')}
                    <div title="Net Profit Margin %">
                      <Info className="h-3 w-3 ml-1 text-gray-400" />
                    </div>
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('overallRating')}>
                  <div className="flex items-center">
                    Rating {getSortArrow('overallRating')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPeers.map((peer, index) => {
                const isCurrentCompany = peer.symbol === currentSymbol || 
                  peer.companyName.toLowerCase().includes(currentSymbol.toLowerCase());
                
                return (
                  <tr 
                    key={`${peer.companyName}-${index}`}
                    className={`border-b dark:border-gray-700 ${isCurrentCompany 
                      ? 'bg-blue-50 dark:bg-blue-900/10' 
                      : index % 2 === 0 
                        ? 'bg-white dark:bg-gray-800' 
                        : 'bg-gray-50 dark:bg-gray-700'}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <StockLogo 
                          symbol={peer.symbol || peer.companyName.substring(0, 2)} 
                          size={28} 
                          className="mr-2"
                          imageUrl={peer.imageUrl}
                        />
                        <div>
                          <div className="font-medium">{peer.companyName}</div>
                          {peer.symbol && <div className="text-xs text-gray-500">{peer.symbol}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {peer.price ? `₹${peer.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'N/A'}
                    </td>
                    <td className="p-4">
                      {peer.percentChange !== undefined ? (
                        <span className={peer.percentChange >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                          {peer.percentChange >= 0 ? '+' : ''}{peer.percentChange.toFixed(2)}%
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="p-4">
                      {peer.marketCap ? `₹${formatNumber(peer.marketCap)}` : 'N/A'}
                    </td>
                    <td className="p-4">
                      {peer.priceToEarningsValueRatio !== undefined 
                        ? peer.priceToEarningsValueRatio.toFixed(2) 
                        : 'N/A'}
                    </td>
                    <td className="p-4">
                      {peer.netProfitMarginPercentTrailing12Month !== undefined 
                        ? `${peer.netProfitMarginPercentTrailing12Month.toFixed(2)}%` 
                        : 'N/A'}
                    </td>
                    <td className="p-4">
                      {peer.overallRating ? (
                        <span className={getRatingColor(peer.overallRating)}>
                          {peer.overallRating}
                        </span>
                      ) : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeerComparisonTable; 