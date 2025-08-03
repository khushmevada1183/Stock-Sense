"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Users,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  BarChart3,
  Globe,
  Calendar,
  Target,
  Percent,
  DollarSign
} from 'lucide-react';

interface InstitutionalHolding {
  institution: string;
  type: 'FII' | 'DII' | 'MF' | 'Insurance' | 'Bank' | 'Other';
  holding: number;
  percentage: number;
  change: number;
  quarter: string;
  value: number;
}

interface InstitutionalFlow {
  date: string;
  fiiFlow: number;
  diiFlow: number;
  netFlow: number;
  priceImpact: number;
}

interface TopInstitution {
  name: string;
  type: 'FII' | 'DII';
  sharesHeld: number;
  percentage: number;
  change: number;
  averageCost: number;
}

interface InstitutionalInvestmentProps {
  symbol: string;
  marketCap: number;
}

const InstitutionalInvestment: React.FC<InstitutionalInvestmentProps> = ({ 
  symbol, 
  marketCap 
}) => {
  const [holdings, setHoldings] = useState<InstitutionalHolding[]>([]);
  const [flows, setFlows] = useState<InstitutionalFlow[]>([]);
  const [topInstitutions, setTopInstitutions] = useState<TopInstitution[]>([]);
  const [totalInstitutional, setTotalInstitutional] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstitutionalData();
  }, [symbol]);

  const fetchInstitutionalData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual institutional data APIs
      const mockHoldings: InstitutionalHolding[] = [
        {
          institution: 'Foreign Institutional Investors',
          type: 'FII',
          holding: 12580000,
          percentage: 18.5,
          change: 2.1,
          quarter: 'Q3 FY24',
          value: 15125000000
        },
        {
          institution: 'Domestic Institutional Investors',
          type: 'DII',
          holding: 9450000,
          percentage: 13.9,
          change: -0.8,
          quarter: 'Q3 FY24',
          value: 11362500000
        },
        {
          institution: 'Mutual Funds',
          type: 'MF',
          holding: 8200000,
          percentage: 12.1,
          change: 1.5,
          quarter: 'Q3 FY24',
          value: 9860000000
        },
        {
          institution: 'Insurance Companies',
          type: 'Insurance',
          holding: 3800000,
          percentage: 5.6,
          change: 0.3,
          quarter: 'Q3 FY24',
          value: 4570000000
        },
        {
          institution: 'Banks',
          type: 'Bank',
          holding: 2100000,
          percentage: 3.1,
          change: -0.2,
          quarter: 'Q3 FY24',
          value: 2525000000
        },
        {
          institution: 'Other Institutions',
          type: 'Other',
          holding: 1500000,
          percentage: 2.2,
          change: 0.1,
          quarter: 'Q3 FY24',
          value: 1800000000
        }
      ];

      const mockFlows: InstitutionalFlow[] = [
        { date: '2024-02-01', fiiFlow: 125.5, diiFlow: -45.2, netFlow: 80.3, priceImpact: 1.2 },
        { date: '2024-01-01', fiiFlow: -89.3, diiFlow: 156.7, netFlow: 67.4, priceImpact: 0.8 },
        { date: '2023-12-01', fiiFlow: 234.1, diiFlow: 78.9, netFlow: 313.0, priceImpact: 2.1 },
        { date: '2023-11-01', fiiFlow: -156.8, diiFlow: -23.4, netFlow: -180.2, priceImpact: -1.5 },
        { date: '2023-10-01', fiiFlow: 45.6, diiFlow: 112.3, netFlow: 157.9, priceImpact: 1.0 }
      ];

      const mockTopInstitutions: TopInstitution[] = [
        {
          name: 'Vanguard Emerging Markets',
          type: 'FII',
          sharesHeld: 2850000,
          percentage: 4.2,
          change: 0.5,
          averageCost: 1150
        },
        {
          name: 'Government of Singapore',
          type: 'FII',
          sharesHeld: 2100000,
          percentage: 3.1,
          change: 0.2,
          averageCost: 1080
        },
        {
          name: 'SBI Bluechip Fund',
          type: 'DII',
          sharesHeld: 1950000,
          percentage: 2.9,
          change: -0.1,
          averageCost: 980
        },
        {
          name: 'HDFC Top 200 Fund',
          type: 'DII',
          sharesHeld: 1720000,
          percentage: 2.5,
          change: 0.3,
          averageCost: 1020
        },
        {
          name: 'LIC of India',
          type: 'DII',
          sharesHeld: 1680000,
          percentage: 2.5,
          change: 0.0,
          averageCost: 850
        }
      ];

      setHoldings(mockHoldings);
      setFlows(mockFlows);
      setTopInstitutions(mockTopInstitutions);
      setTotalInstitutional(mockHoldings.reduce((sum, holding) => sum + holding.percentage, 0));
    } catch (error) {
      console.error('Error fetching institutional data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      });
    }
  }, [loading]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FII': return 'text-blue-400 bg-blue-500/20';
      case 'DII': return 'text-green-400 bg-green-500/20';
      case 'MF': return 'text-purple-400 bg-purple-500/20';
      case 'Insurance': return 'text-yellow-400 bg-yellow-500/20';
      case 'Bank': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? <ArrowUp className="w-3 h-3" /> : 
           change < 0 ? <ArrowDown className="w-3 h-3" /> : 
           <Activity className="w-3 h-3" />;
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}K Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Institutional Holding Summary */}
      <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building className="w-5 h-5" />
            Institutional Holdings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 mb-6">
            <div className="text-4xl font-bold text-blue-400 mb-2">{totalInstitutional.toFixed(1)}%</div>
            <div className="text-gray-400">Total Institutional Holding</div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(marketCap * totalInstitutional / 100)} market value
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holdings.map((holding, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium text-sm">{holding.institution}</h4>
                  <div className={`px-2 py-1 rounded text-xs ${getTypeColor(holding.type)}`}>
                    {holding.type}
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-white mb-1">
                  {holding.percentage.toFixed(1)}%
                </div>
                
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-400">Shares: {(holding.holding / 1000000).toFixed(1)}M</span>
                  <div className={`flex items-center gap-1 ${getChangeColor(holding.change)}`}>
                    {getChangeIcon(holding.change)}
                    <span>{Math.abs(holding.change).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Value: {formatCurrency(holding.value)}
                </div>
                <div className="text-xs text-gray-500">
                  {holding.quarter}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FII vs DII Flows */}
      <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            FII vs DII Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flows.map((flow, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-white font-medium">
                    {new Date(flow.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className={`text-sm font-medium ${getChangeColor(flow.priceImpact)}`}>
                    Price Impact: {flow.priceImpact > 0 ? '+' : ''}{flow.priceImpact.toFixed(1)}%
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getChangeColor(flow.fiiFlow)}`}>
                      {flow.fiiFlow > 0 ? '+' : ''}₹{Math.abs(flow.fiiFlow).toFixed(1)}Cr
                    </div>
                    <div className="text-gray-400 text-sm">FII Flow</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getChangeColor(flow.diiFlow)}`}>
                      {flow.diiFlow > 0 ? '+' : ''}₹{Math.abs(flow.diiFlow).toFixed(1)}Cr
                    </div>
                    <div className="text-gray-400 text-sm">DII Flow</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getChangeColor(flow.netFlow)}`}>
                      {flow.netFlow > 0 ? '+' : ''}₹{Math.abs(flow.netFlow).toFixed(1)}Cr
                    </div>
                    <div className="text-gray-400 text-sm">Net Flow</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {((Math.abs(flow.netFlow) / marketCap) * 100).toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-sm">of Market Cap</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Institutional Investors */}
      <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Top Institutional Investors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-3">Institution</th>
                  <th className="text-center text-gray-400 font-medium py-3">Type</th>
                  <th className="text-right text-gray-400 font-medium py-3">Shares Held</th>
                  <th className="text-right text-gray-400 font-medium py-3">Holding %</th>
                  <th className="text-right text-gray-400 font-medium py-3">Change</th>
                  <th className="text-right text-gray-400 font-medium py-3">Avg Cost</th>
                </tr>
              </thead>
              <tbody>
                {topInstitutions.map((institution, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3">
                      <div className="text-white font-medium">{institution.name}</div>
                    </td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex px-2 py-1 rounded text-xs ${getTypeColor(institution.type)}`}>
                        {institution.type}
                      </div>
                    </td>
                    <td className="py-3 text-right text-white">
                      {(institution.sharesHeld / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 text-right text-white">
                      {institution.percentage.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-right ${getChangeColor(institution.change)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {getChangeIcon(institution.change)}
                        <span>{Math.abs(institution.change).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-white">
                      ₹{institution.averageCost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investment Analysis */}
      <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Investment Pattern Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FII vs DII Comparison */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">FII vs DII Holding Pattern</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Foreign Institutional</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '74%'}}></div>
                    </div>
                    <span className="text-white text-sm">18.5%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Domestic Institutional</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '56%'}}></div>
                    </div>
                    <span className="text-white text-sm">13.9%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trends */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Recent Trends</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">FII interest increasing (+2.1%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-gray-300">DII holding slight decline (-0.8%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Mutual fund participation stable</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Insurance sector increasing exposure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Key Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-blue-400 font-medium text-sm">Strong Institutional Support</div>
                    <div className="text-gray-300 text-sm">
                      High institutional holding at {totalInstitutional.toFixed(1)}% indicates strong confidence
                      from professional investors and fund managers.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-green-400 font-medium text-sm">Balanced FII-DII Mix</div>
                    <div className="text-gray-300 text-sm">
                      Healthy balance between foreign and domestic institutional investors
                      provides stability during market volatility.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionalInvestment;
