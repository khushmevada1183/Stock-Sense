'use client';

import React, { useState, useEffect } from 'react';
import * as stockApi from '@/api/clientApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface IPO {
  id: string;
  companyName: string;
  symbol: string;
  issuePrice: string;
  issueSize: string;
  openDate: string;
  closeDate: string;
  listingDate: string;
  status: 'upcoming' | 'active' | 'closed' | 'listed';
}

const IPOTable = () => {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIPOs = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching IPO data using stockApi.getIPOData()...');
        
        // Use the consolidated API function
        const ipoData = await stockApi.getIPOData();
        console.log('IPO response:', ipoData);
        
        // Transform the data to match our component's expected format
        let formattedIpos: IPO[] = [];
        
        // Handle different possible response structures from the /ipo endpoint
        if (Array.isArray(ipoData)) {
          // Direct array response
          formattedIpos = ipoData.map((ipo: any, index: number) => ({
            id: `ipo-${index}`,
            companyName: ipo.company_name || ipo.name || ipo.companyName || 'Unknown Company',
            symbol: ipo.symbol || 'N/A',
            issuePrice: ipo.issue_price || ipo.price_range || ipo.priceRange || ipo.issuePrice || 'TBA',
            issueSize: ipo.issue_size || ipo.size || ipo.issueSize || 'TBA',
            openDate: ipo.open || ipo.date || ipo.bidding_start_date || ipo.openDate || '',
            closeDate: ipo.close || ipo.bidding_end_date || ipo.closeDate || '',
            listingDate: ipo.listing_date || ipo.listingDate || '',
            status: (ipo.status || 'upcoming') as 'upcoming' | 'active' | 'closed' | 'listed'
          }));
        } else if (ipoData && typeof ipoData === 'object') {
          // Object response with nested data
          
          // Check for direct 'ipos' array (mock data structure)
          if (ipoData.ipos && Array.isArray(ipoData.ipos)) {
            formattedIpos = ipoData.ipos.map((ipo: any, index: number) => ({
              id: `mock-${index}`,
              companyName: ipo.name || ipo.company_name || 'Unknown Company',
              symbol: ipo.symbol || 'N/A',
              issuePrice: ipo.priceRange || ipo.issue_price || 'TBA',
              issueSize: ipo.size || ipo.issue_size || 'TBA',
              openDate: ipo.date || ipo.open || '',
              closeDate: ipo.close || '',
              listingDate: ipo.listing_date || '',
              status: (ipo.status || 'upcoming') as 'upcoming' | 'active' | 'closed' | 'listed'
            }));
          } else {
            // Check for categorized IPO data (upcoming, active, recent, etc.)
            const categories = [
              { key: 'upcoming', status: 'upcoming' },
              { key: 'upcomingIPOs', status: 'upcoming' },
              { key: 'active', status: 'active' },
              { key: 'activeIPOs', status: 'active' },
              { key: 'recent', status: 'listed' },
              { key: 'recentlyListedIPOs', status: 'listed' },
              { key: 'listed', status: 'listed' }
            ];
            
            categories.forEach(({ key, status }) => {
              if (ipoData[key] && Array.isArray(ipoData[key])) {
                const categoryIpos = ipoData[key].map((ipo: any, index: number) => ({
                  id: `${key}-${index}`,
                  companyName: ipo.company_name || ipo.name || ipo.companyName || 'Unknown Company',
                  symbol: ipo.symbol || 'N/A',
                  issuePrice: ipo.issue_price || ipo.price_range || ipo.priceRange || ipo.issuePrice || 'TBA',
                  issueSize: ipo.issue_size || ipo.size || ipo.issueSize || 'TBA',
                  openDate: ipo.open || ipo.date || ipo.bidding_start_date || ipo.openDate || '',
                  closeDate: ipo.close || ipo.bidding_end_date || ipo.closeDate || '',
                  listingDate: ipo.listing_date || ipo.listingDate || '',
                  status: (ipo.status || status) as 'upcoming' | 'active' | 'closed' | 'listed'
                }));
                formattedIpos = [...formattedIpos, ...categoryIpos];
              }
            });
          }
        }
        
        console.log(`Processed ${formattedIpos.length} IPO records`);
        setIpos(formattedIpos);
        setError('');
      } catch (err) {
        console.error('Error fetching IPOs:', err);
        setError('Failed to load IPO data. Please try again later.');
        
        // Set fallback IPO data
        setIpos([{
          id: 'placeholder',
          companyName: 'Sample IPO Company',
          symbol: 'SAMPLE',
          issuePrice: '₹800-850',
          issueSize: '₹1000 Cr',
          openDate: new Date().toISOString(),
          closeDate: new Date(Date.now() + 2*24*60*60*1000).toISOString(),
          listingDate: new Date(Date.now() + 10*24*60*60*1000).toISOString(),
          status: 'upcoming'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIPOs();
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'active':
        return 'success';
      case 'closed':
        return 'secondary';
      case 'listed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Upcoming & Recent IPOs</CardTitle>
        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        ) : ipos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No IPO data available at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden sm:table-cell">Symbol</TableHead>
                  <TableHead className="text-right">Price Range</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Issue Size</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipos.map((ipo) => (
                  <TableRow key={ipo.id}>
                    <TableCell className="font-medium">{ipo.companyName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{ipo.symbol || 'TBA'}</TableCell>
                    <TableCell className="text-right">₹{ipo.issuePrice}</TableCell>
                    <TableCell className="hidden md:table-cell text-right">₹{ipo.issueSize} Cr</TableCell>
                    <TableCell className="text-right text-sm">
                      {ipo.status === 'upcoming' ? formatDate(ipo.openDate) : 
                       ipo.status === 'active' ? `${formatDate(ipo.openDate)} - ${formatDate(ipo.closeDate)}` :
                       ipo.status === 'closed' ? formatDate(ipo.listingDate) :
                       `Listed on ${formatDate(ipo.listingDate)}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(ipo.status)}>
                        {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IPOTable; 