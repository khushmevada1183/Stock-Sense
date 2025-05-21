'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

interface Commodity {
  id: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  lastUpdated: string;
  category: string;
}

const CommoditiesTable = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/commodities`);
        setCommodities(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching commodities:', err);
        setError('Failed to load commodities data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommodities();
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commodities</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        ) : commodities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No commodities data available at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commodity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commodities.map((commodity) => (
                  <TableRow key={commodity.id}>
                    <TableCell className="font-medium">{commodity.name}</TableCell>
                    <TableCell className="text-right">
                      ₹{commodity.price.toLocaleString()} <span className="text-xs text-gray-500">/{commodity.unit}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {commodity.change > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <Badge variant={commodity.change > 0 ? "success" : "destructive"}>
                          {commodity.change > 0 ? '+' : ''}{commodity.change.toFixed(2)} ({commodity.changePercent.toFixed(2)}%)
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="font-normal">
                        {commodity.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-xs text-gray-500">
                      {formatDate(commodity.lastUpdated)}
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

export default CommoditiesTable; 