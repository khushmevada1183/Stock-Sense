'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getCommodities } from '@/services/stockService';
import LoadingSpinner from './LoadingSpinner';

interface Commodity {
  commoditySymbol: string;
  expiryDate: string;
  lastTradedPrice: number;
  percentChange: number;
  netChange: number;
  buyPrice: number;
  sellPrice: number;
  lowPrice: number;
  highPrice: number;
  openPrice: number;
  volume: number;
  openInterest: number;
}

interface CommodityGroup {
  [key: string]: Commodity[];
}

const CommoditiesTable: React.FC = () => {
  const [commodities, setCommodities] = useState<CommodityGroup>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        setLoading(true);
        const data = await getCommodities();

        if (data && Array.isArray(data)) {
          // Group commodities by type (GOLD, SILVER, etc.)
          const groupedCommodities: CommodityGroup = {};
          
          data.forEach((commodity: Commodity) => {
            // Extract commodity type from symbol
            const type = commodity.commoditySymbol.split(' ')[0];
            
            if (!groupedCommodities[type]) {
              groupedCommodities[type] = [];
            }
            
            groupedCommodities[type].push(commodity);
          });
          
          const commodityTypes = Object.keys(groupedCommodities);
          
          setCommodities(groupedCommodities);
          setCategories(commodityTypes);
          setActiveCategory(commodityTypes[0] || '');
        } else {
          setError('Invalid commodity data format');
        }
      } catch (err) {
        console.error('Error fetching commodities:', err);
        setError('Failed to load commodities data');
      } finally {
        setLoading(false);
      }
    };

    fetchCommodities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commodities</CardTitle>
          <CardDescription>
            Latest commodity futures contracts
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commodities</CardTitle>
          <CardDescription>
            Latest commodity futures contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commodities</CardTitle>
        <CardDescription>
          Latest commodity futures contracts from MCX
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 flex flex-wrap">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>LTP (₹)</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Open</TableHead>
                    <TableHead>High</TableHead>
                    <TableHead>Low</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Open Interest</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commodities[category]?.map((commodity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {commodity.commoditySymbol}
                      </TableCell>
                      <TableCell>{commodity.expiryDate}</TableCell>
                      <TableCell>₹{commodity.lastTradedPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={commodity.percentChange >= 0 ? "success" : "destructive"}>
                          {commodity.percentChange >= 0 ? '+' : ''}{commodity.percentChange.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell>₹{commodity.openPrice.toLocaleString()}</TableCell>
                      <TableCell>₹{commodity.highPrice.toLocaleString()}</TableCell>
                      <TableCell>₹{commodity.lowPrice.toLocaleString()}</TableCell>
                      <TableCell>{commodity.volume.toLocaleString()}</TableCell>
                      <TableCell>{commodity.openInterest.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommoditiesTable; 