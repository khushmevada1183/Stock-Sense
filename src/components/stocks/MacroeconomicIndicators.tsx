"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Globe, 
  TrendingUp, 
  IndianRupee, 
  Building,
  BarChart3,
  PieChart,
  Minus
} from 'lucide-react';

interface MacroIndicator {
  name: string;
  value: number;
  unit: string;
  change: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  category: 'monetary' | 'fiscal' | 'inflation' | 'growth' | 'employment' | 'external';
}

interface PolicyUpdate {
  title: string;
  date: string;
  category: 'monetary' | 'fiscal' | 'regulatory';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface MacroeconomicIndicatorsProps {
  sector?: string;
  refreshTrigger?: number;
}

const MacroeconomicIndicators: React.FC<MacroeconomicIndicatorsProps> = ({ 
  sector, 
  refreshTrigger = 0 
}) => {
  const [indicators, setIndicators] = useState<MacroIndicator[]>([]);
  const [policyUpdates, setPolicyUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMacroData();
  }, [refreshTrigger]);

  const fetchMacroData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual RBI/government data APIs
      const mockIndicators: MacroIndicator[] = [
        {
          name: 'Repo Rate',
          value: 6.50,
          unit: '%',
          change: 0.25,
          impact: 'negative',
          description: 'RBI\'s benchmark lending rate',
          category: 'monetary'
        },
        {
          name: 'CPI Inflation',
          value: 5.66,
          unit: '%',
          change: -0.34,
          impact: 'positive',
          description: 'Consumer Price Index inflation rate',
          category: 'inflation'
        },
        {
          name: 'GDP Growth',
          value: 7.20,
          unit: '%',
          change: 0.50,
          impact: 'positive',
          description: 'Gross Domestic Product growth rate',
          category: 'growth'
        },
        {
          name: 'Unemployment Rate',
          value: 3.20,
          unit: '%',
          change: -0.10,
          impact: 'positive',
          description: 'Unemployment rate for urban areas',
          category: 'employment'
        },
        {
          name: 'Fiscal Deficit',
          value: 5.90,
          unit: '% of GDP',
          change: -0.20,
          impact: 'positive',
          description: 'Government fiscal deficit',
          category: 'fiscal'
        },
        {
          name: 'Current Account Deficit',
          value: -2.80,
          unit: '% of GDP',
          change: 0.30,
          impact: 'negative',
          description: 'Current account balance',
          category: 'external'
        },
        {
          name: 'Foreign Exchange Reserves',
          value: 645.2,
          unit: 'Billion INR',
          change: 12.5,
          impact: 'positive',
          description: 'India\'s forex reserves',
          category: 'external'
        },
        {
          name: 'WPI Inflation',
          value: 1.84,
          unit: '%',
          change: -0.52,
          impact: 'positive',
          description: 'Wholesale Price Index inflation',
          category: 'inflation'
        },
        {
          name: 'Bank Credit Growth',
          value: 16.20,
          unit: '%',
          change: 1.10,
          impact: 'positive',
          description: 'Year-on-year bank credit growth',
          category: 'monetary'
        },
        {
          name: 'Industrial Production',
          value: 5.80,
          unit: '%',
          change: 2.30,
          impact: 'positive',
          description: 'Index of Industrial Production growth',
          category: 'growth'
        }
      ];

      const mockPolicyUpdates: PolicyUpdate[] = [
        {
          title: 'RBI Monetary Policy Committee Meeting',
          date: '2024-02-08',
          category: 'monetary',
          impact: 'neutral',
          description: 'RBI maintained repo rate at 6.50% with a focus on inflation targeting'
        },
        {
          title: 'Union Budget 2024-25',
          date: '2024-02-01',
          category: 'fiscal',
          impact: 'positive',
          description: 'Capital expenditure increased by 11.1% to ₹11.11 lakh crore'
        },
        {
          title: 'PLI Scheme Extension',
          date: '2024-01-25',
          category: 'fiscal',
          impact: 'positive',
          description: 'Production Linked Incentive scheme extended to more sectors'
        },
        {
          title: 'SEBI Regulatory Updates',
          date: '2024-01-20',
          category: 'regulatory',
          impact: 'neutral',
          description: 'New guidelines for mutual fund investments and ESG disclosures'
        }
      ];

      setIndicators(mockIndicators);
      setPolicyUpdates(mockPolicyUpdates);
    } catch (error) {
      console.error('Error fetching macro data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !containerRef.current) return;

    const elements = Array.from(containerRef.current.children);
    if (!elements.length) return;

    gsap.killTweensOf(elements);
    gsap.set(elements, { clearProps: 'opacity,transform,filter' });

    const tween = gsap.fromTo(
      elements,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: "auto"
      }
    );

    return () => {
      tween.kill();
      gsap.set(elements, { clearProps: 'opacity,transform,filter' });
    };
  }, [loading]);

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-400 bg-green-500/20';
      case 'negative': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return <span className="font-semibold leading-none">+</span>;
      case 'negative': return <span className="font-semibold leading-none">-</span>;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monetary': return <IndianRupee className="w-4 h-4" />;
      case 'fiscal': return <Building className="w-4 h-4" />;
      case 'inflation': return <TrendingUp className="w-4 h-4" />;
      case 'growth': return <BarChart3 className="w-4 h-4" />;
      case 'employment': return <Globe className="w-4 h-4" />;
      case 'external': return <Globe className="w-4 h-4" />;
      default: return <PieChart className="w-4 h-4" />;
    }
  };

  const groupedIndicators = indicators.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, MacroIndicator[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} glass>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-800/60 rounded shimmer w-1/4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-800/60 rounded shimmer"></div>
                  <div className="h-20 bg-gray-800/60 rounded shimmer"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Key Economic Indicators by Category */}
      {Object.entries(groupedIndicators).map(([category, categoryIndicators]) => (
        <Card key={category} glass>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 capitalize">
              {getCategoryIcon(category)}
              {category} Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryIndicators.map((indicator, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm">{indicator.name}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getImpactColor(indicator.impact)}`}>
                      {getImpactIcon(indicator.impact)}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-white">
                      {indicator.value}
                    </span>
                    <span className="text-gray-400 text-sm">{indicator.unit}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    indicator.change > 0 ? 'text-green-400' : 
                    indicator.change < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                      {indicator.change > 0 ? <span className="font-semibold leading-none">+</span> :
                       indicator.change < 0 ? <span className="font-semibold leading-none">-</span> :
                     <Minus className="w-3 h-3" />}
                    <span>{Math.abs(indicator.change)}{indicator.unit}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {indicator.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recent Policy Updates */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-neon-400" />
            Recent Policy Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policyUpdates.map((update, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{update.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${getImpactColor(update.impact)}`}>
                      {update.impact}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(update.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 capitalize`}>
                    {update.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{update.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Economic Health Score */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-neon-400" />
            Economic Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-green-400 mb-2">75/100</div>
            <div className="text-gray-400 mb-4">
              Strong Economic Fundamentals{sector ? ` for ${sector}` : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="glass-card rounded-xl p-3">
                <div className="text-green-400 font-bold">Good</div>
                <div className="text-gray-400 text-sm">Growth Metrics</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <div className="text-yellow-400 font-bold">Moderate</div>
                <div className="text-gray-400 text-sm">Inflation Control</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <div className="text-green-400 font-bold">Strong</div>
                <div className="text-gray-400 text-sm">External Position</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MacroeconomicIndicators;
