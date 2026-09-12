'use client';

import React, { useState, useEffect } from 'react';
import * as stockApi from '@/api/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { logger } from '@/lib/logger';

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

type IpoStatus = IPO['status'];

interface RawIpo {
  company_name?: string;
  name?: string;
  companyName?: string;
  symbol?: string;
  issue_price?: string;
  price_range?: string;
  priceRange?: string;
  issuePrice?: string;
  issue_size?: string;
  size?: string;
  issueSize?: string;
  open?: string;
  date?: string;
  bidding_start_date?: string;
  openDate?: string;
  close?: string;
  bidding_end_date?: string;
  closeDate?: string;
  listing_date?: string;
  listingDate?: string;
  status?: IpoStatus;
}

interface IpoDataResponse {
  ipos?: RawIpo[];
  upcoming?: RawIpo[];
  upcomingIPOs?: RawIpo[];
  active?: RawIpo[];
  activeIPOs?: RawIpo[];
  recent?: RawIpo[];
  recentlyListedIPOs?: RawIpo[];
  listed?: RawIpo[];
}

const IPOTable = () => {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIPOs = async () => {
      try {
        setIsLoading(true);
        logger.debug('Fetching IPO data using stockApi.getIPOData()...');
        
        // Use the consolidated API function
        const ipoData = await stockApi.getIPOData();
        logger.debug('IPO response:', ipoData);
        
        // Transform the data to match our component's expected format
        let formattedIpos: IPO[] = [];
        const mapRawIpo = (ipo: RawIpo, id: string, fallbackStatus: IpoStatus = 'upcoming'): IPO => ({
          id,
          companyName: ipo.company_name || ipo.name || ipo.companyName || 'Unknown Company',
          symbol: ipo.symbol || 'N/A',
          issuePrice: ipo.issue_price || ipo.price_range || ipo.priceRange || ipo.issuePrice || 'TBA',
          issueSize: ipo.issue_size || ipo.size || ipo.issueSize || 'TBA',
          openDate: ipo.open || ipo.date || ipo.bidding_start_date || ipo.openDate || '',
          closeDate: ipo.close || ipo.bidding_end_date || ipo.closeDate || '',
          listingDate: ipo.listing_date || ipo.listingDate || '',
          status: ipo.status || fallbackStatus
        });
        
        // Handle different possible response structures from the /ipo endpoint
        if (Array.isArray(ipoData)) {
          // Direct array response
          formattedIpos = ipoData.map((ipo: RawIpo, index: number) => mapRawIpo(ipo, `ipo-${index}`, 'upcoming'));
        } else if (ipoData && typeof ipoData === 'object') {
          const dataObject = ipoData as IpoDataResponse;
          // Object response with nested data
          
          // Check for direct 'ipos' array (mock data structure)
          if (Array.isArray(dataObject.ipos)) {
            formattedIpos = dataObject.ipos.map((ipo, index) => mapRawIpo(ipo, `mock-${index}`, 'upcoming'));
          } else {
            // Check for categorized IPO data (upcoming, active, recent, etc.)
            const categories: Array<{ key: keyof IpoDataResponse; status: IpoStatus }> = [
              { key: 'upcoming', status: 'upcoming' },
              { key: 'upcomingIPOs', status: 'upcoming' },
              { key: 'active', status: 'active' },
              { key: 'activeIPOs', status: 'active' },
              { key: 'recent', status: 'listed' },
              { key: 'recentlyListedIPOs', status: 'listed' },
              { key: 'listed', status: 'listed' }
            ];
            
            categories.forEach(({ key, status }) => {
              const categoryData = dataObject[key];
              if (Array.isArray(categoryData)) {
                const categoryIpos = categoryData.map((ipo, index) => mapRawIpo(ipo, `${key}-${index}`, status));
                formattedIpos = [...formattedIpos, ...categoryIpos];
              }
            });
          }
        }
        
        logger.info(`Processed ${formattedIpos.length} IPO records`);
        setIpos(formattedIpos);
        setError('');
      } catch (err) {
        logger.error('Error fetching IPOs:', err);
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