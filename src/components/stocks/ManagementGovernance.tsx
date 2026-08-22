"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getStockDetails } from '@/api/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Shield, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Building,
  UserCheck,
  FileText,
  IndianRupee,
  BarChart3,
  Eye
} from 'lucide-react';

interface ExecutiveProfile {
  name: string;
  position: string;
  tenure: number;
  background: string;
  education: string;
  experience: number;
  previousRoles: string[];
  shareholding: number;
}

interface GovernanceMetric {
  category: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  factors: string[];
}

interface ComplianceRecord {
  area: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAudit: string;
  issues: number;
  description: string;
}

interface CorporateAction {
  type: string;
  date: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface ManagementGovernanceProps {
  symbol: string;
  companyName: string;
}

const ManagementGovernance: React.FC<ManagementGovernanceProps> = ({ 
  symbol, 
  companyName 
}) => {
  const [executives, setExecutives] = useState<ExecutiveProfile[]>([]);
  const [governanceMetrics, setGovernanceMetrics] = useState<GovernanceMetric[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [corporateActions, setCorporateActions] = useState<CorporateAction[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchManagementData();
  }, [symbol]);

  const fetchManagementData = async () => {
    setLoading(true);
    try {
      const payload = await getStockDetails(symbol);
      const profile = (payload as { profile?: Record<string, unknown> })?.profile ?? payload;
      const management = (profile as { management?: unknown }).management;

      let mappedExecutives: ExecutiveProfile[] = [];
      if (Array.isArray(management)) {
        mappedExecutives = management.map((entry) => {
          const row = entry as Record<string, unknown>;
          return {
            name: String(row.name ?? row.officerName ?? 'Unknown'),
            position: String(row.position ?? row.designation ?? row.title ?? 'Executive'),
            tenure: Number(row.tenure ?? 0),
            background: String(row.background ?? row.experience ?? 'N/A'),
            education: String(row.education ?? 'N/A'),
            experience: Number(row.experienceYears ?? row.experience ?? 0),
            previousRoles: Array.isArray(row.previousRoles) ? row.previousRoles.map(String) : [],
            shareholding: Number(row.shareholding ?? 0),
          };
        });
      }

      setExecutives(mappedExecutives);
      setGovernanceMetrics([]);
      setCompliance([]);
      setCorporateActions([]);
    } catch (error) {
      console.error('Error fetching management data:', error);
      setExecutives([]);
      setGovernanceMetrics([]);
      setCompliance([]);
      setCorporateActions([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': case 'compliant': return 'text-green-400 bg-green-500/20';
      case 'good': case 'partial': return 'text-yellow-400 bg-yellow-500/20';
      case 'fair': return 'text-orange-400 bg-orange-500/20';
      case 'poor': case 'non-compliant': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'good': case 'partial': return <Clock className="w-4 h-4" />;
      case 'fair': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': case 'non-compliant': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-400 bg-green-500/20';
      case 'negative': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
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
                <div className="h-32 bg-gray-800/60 rounded shimmer"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Executive Team */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-400" />
            Executive Leadership Team
          </CardTitle>
          <div className="text-sm text-slate-600 dark:text-slate-400">{companyName}</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {executives.map((executive, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium">{executive.name}</h4>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">{executive.position}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-900 dark:text-white text-sm">{executive.tenure}y</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">Tenure</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-700 dark:text-slate-300">{executive.education}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-700 dark:text-slate-300">{executive.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">{executive.shareholding}% shareholding</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-slate-600 dark:text-slate-400 text-xs mb-1">Previous Roles:</div>
                  <div className="space-y-1">
                    {executive.previousRoles.slice(0, 2).map((role, roleIndex) => (
                      <div key={roleIndex} className="text-xs text-slate-600 dark:text-slate-400">• {role}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Governance Score */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-neon-400" />
            Corporate Governance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 mb-6">
            <div className="text-4xl font-bold text-green-400 mb-2">83/100</div>
            <div className="text-gray-400">Strong Governance Standards</div>
            <div className="text-sm text-gray-500 mt-1">Above industry average (78)</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {governanceMetrics.map((metric, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium text-sm">{metric.category}</h4>
                  <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                    <span className="capitalize">{metric.status}</span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Score</span>
                    <span className="text-white">{metric.score}/{metric.maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-800/60 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-neon-400 to-cyan-400 h-1.5 rounded-full"
                      style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-xs mb-2">{metric.description}</p>
                
                <div className="space-y-1">
                  {metric.factors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="flex items-center gap-1 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-neon-400 rounded-full"></div>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-neon-400" />
            Regulatory Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {compliance.map((item, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{item.area}</h4>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </div>
                    {item.issues > 0 && (
                      <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                        {item.issues} issues
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{item.description}</span>
                  <span className="text-gray-500">
                    Last audit: {new Date(item.lastAudit).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Corporate Actions */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-400" />
            Recent Corporate Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {corporateActions.map((action, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-medium">{action.type}</h4>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs mb-1 ${getImpactColor(action.impact)}`}>
                      {action.impact}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(action.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Management Effectiveness Metrics */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-400" />
            Management Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-green-400 text-2xl font-bold mb-1">18.5%</div>
              <div className="text-gray-400 text-sm">ROE (Return on Equity)</div>
              <div className="text-xs text-gray-500 mt-1">Above peer average</div>
            </div>
            
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-cyan-400 text-2xl font-bold mb-1">24.2%</div>
              <div className="text-gray-400 text-sm">ROIC (Return on Capital)</div>
              <div className="text-xs text-gray-500 mt-1">Efficient capital use</div>
            </div>
            
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-yellow-400 text-2xl font-bold mb-1">1.8%</div>
              <div className="text-gray-400 text-sm">Employee Turnover</div>
              <div className="text-xs text-gray-500 mt-1">Below industry avg</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Key Strengths</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Strong leadership continuity</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Experienced management team</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">Transparent communication</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Consistent performance delivery</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagementGovernance;
