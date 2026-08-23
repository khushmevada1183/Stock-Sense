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
import { getFiiDiiLatest, getFiiDiiCumulative } from '@/api/api';
import { insetPanelClass } from '@/styles/design-tokens';

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
      const [latestResponse, cumulativeResponse] = await Promise.all([
        getFiiDiiLatest({ limit: 5 }),
        getFiiDiiCumulative({ limit: 30 }).catch(() => null),
      ]);

      const toArray = (value: unknown) => {
        if (Array.isArray(value)) return value;
        if (value && typeof value === 'object') {
          const data = value as Record<string, unknown>;
          for (const key of ['summary', 'items', 'rows', 'results', 'data', 'records']) {
            if (Array.isArray(data[key])) return data[key] as unknown[];
          }
        }
        return [];
      };

      const latestPayload = (latestResponse as { data?: unknown })?.data ?? latestResponse;
      const flowRows = toArray(latestPayload);

      const mappedIndicators: MacroIndicator[] = flowRows.slice(0, 5).flatMap((row) => {
        const item = row as Record<string, unknown>;
        const date = String(item.flowDate || item.date || 'Latest');
        const fiiNet = Number(item.fiiNet ?? item.fii_net ?? 0);
        const diiNet = Number(item.diiNet ?? item.dii_net ?? 0);
        const totalNet = Number(item.totalNet ?? item.total_net ?? fiiNet + diiNet);

        return [
          {
            name: `FII Net Flow (${date})`,
            value: Math.round(fiiNet * 100) / 100,
            unit: '₹ Cr',
            change: fiiNet,
            impact: fiiNet >= 0 ? 'positive' as const : 'negative' as const,
            description: 'Foreign institutional investor net flow',
            category: 'external' as const,
          },
          {
            name: `DII Net Flow (${date})`,
            value: Math.round(diiNet * 100) / 100,
            unit: '₹ Cr',
            change: diiNet,
            impact: diiNet >= 0 ? 'positive' as const : 'negative' as const,
            description: 'Domestic institutional investor net flow',
            category: 'monetary' as const,
          },
          {
            name: `Total Net Flow (${date})`,
            value: Math.round(totalNet * 100) / 100,
            unit: '₹ Cr',
            change: totalNet,
            impact: totalNet >= 0 ? 'positive' as const : 'negative' as const,
            description: 'Combined FII + DII net institutional flow',
            category: 'growth' as const,
          },
        ];
      });

      const cumulativePayload = cumulativeResponse
        ? ((cumulativeResponse as { data?: unknown })?.data ?? cumulativeResponse)
        : null;
      const cumulativeRows = toArray(cumulativePayload);
      if (cumulativeRows.length > 0) {
        const latest = cumulativeRows[0] as Record<string, unknown>;
        const fiiCumulative = Number(latest.fiiCumulative ?? latest.fii_cumulative ?? latest.fiiNet ?? 0);
        const diiCumulative = Number(latest.diiCumulative ?? latest.dii_cumulative ?? latest.diiNet ?? 0);
        mappedIndicators.push(
          {
            name: 'FII Cumulative (30d)',
            value: Math.round(fiiCumulative * 100) / 100,
            unit: '₹ Cr',
            change: fiiCumulative,
            impact: fiiCumulative >= 0 ? 'positive' : 'negative',
            description: 'Rolling cumulative FII net flow',
            category: 'external',
          },
          {
            name: 'DII Cumulative (30d)',
            value: Math.round(diiCumulative * 100) / 100,
            unit: '₹ Cr',
            change: diiCumulative,
            impact: diiCumulative >= 0 ? 'positive' : 'negative',
            description: 'Rolling cumulative DII net flow',
            category: 'monetary',
          },
        );
      }

      setIndicators(mappedIndicators);
      setPolicyUpdates([]);
    } catch (error) {
      console.error('Error fetching macro data:', error);
      setIndicators([]);
      setPolicyUpdates([]);
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
      { y: 20 },
      {
        y: 0,
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

  if (!indicators.length) {
    return (
      <Card glass>
        <CardContent className="p-8 text-center">
          <Globe className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No macroeconomic flow data available from the API.</p>
          <p className="text-gray-500 text-sm mt-1">FII/DII institutional flows will appear here when synced.</p>
        </CardContent>
      </Card>
    );
  }

  const groupedIndicators = indicators.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, MacroIndicator[]>);

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
          {policyUpdates.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No policy updates available from the API.</p>
          ) : (
          <div className="space-y-4">
            {policyUpdates.map((update, index) => (
              <div key={index} className={`${insetPanelClass} p-4`}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MacroeconomicIndicators;
