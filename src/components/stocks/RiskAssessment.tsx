'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface RiskAssessmentProps {
  stock: any;
  className?: string;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ stock, className = '' }) => {
  // Calculate risk metrics
  const calculateVolatilityRisk = () => {
    const high = parseFloat(stock.high || 0);
    const low = parseFloat(stock.low || 0);
    const price = parseFloat(stock.price || 0);
    
    if (!price) return 0;
    
    const dayRange = ((high - low) / price) * 100;
    return Math.min(dayRange, 100);
  };

  const calculateCircuitRisk = () => {
    const price = parseFloat(stock.price || 0);
    const lowerCircuit = parseFloat(stock.low_circuit_limit || stock.lowCircuitLimit || 0);
    const upperCircuit = parseFloat(stock.up_circuit_limit || stock.upCircuitLimit || 0);
    
    if (!price || !lowerCircuit || !upperCircuit) return 0;
    
    const lowerDistance = ((price - lowerCircuit) / price) * 100;
    const upperDistance = ((upperCircuit - price) / price) * 100;
    
    // Risk is higher when closer to circuit limits
    const minDistance = Math.min(lowerDistance, upperDistance);
    return Math.max(0, 20 - minDistance); // Higher risk when within 20% of circuit
  };

  const calculateTechnicalRisk = () => {
    const rating = (stock.overall_rating || stock.overallRating || '').toLowerCase();
    const shortTerm = (stock.short_term_trends || stock.short_term_trend || stock.shortTermTrends || '').toLowerCase();
    const longTerm = (stock.long_term_trends || stock.long_term_trend || stock.longTermTrends || '').toLowerCase();
    
    let risk = 50; // Neutral baseline
    
    // Adjust based on overall rating
    if (rating.includes('bullish')) risk -= 20;
    else if (rating.includes('bearish')) risk += 20;
    else if (rating.includes('neutral')) risk += 0;
    
    // Adjust based on short term trends
    if (shortTerm.includes('bullish')) risk -= 10;
    else if (shortTerm.includes('bearish')) risk += 15;
    
    // Adjust based on long term trends
    if (longTerm.includes('bullish')) risk -= 10;
    else if (longTerm.includes('bearish')) risk += 10;
    
    return Math.max(0, Math.min(100, risk));
  };

  const calculateDeviationRisk = () => {
    const deviation = Math.abs(parseFloat(stock.deviation || stock.actualDeviation || 0));
    return Math.min(deviation * 2, 100); // Scale deviation to risk percentage
  };

  const calculateVolumeRisk = () => {
    const volume = parseInt(stock.volume || 0);
    const avgVolume = parseInt(stock.averageVolume || 0);
    
    if (!volume) return 50; // Medium risk if no volume data
    if (!avgVolume) return 30; // Lower risk assumption if no average
    
    const volumeRatio = volume / avgVolume;
    
    // High volume (>3x average) can indicate high volatility
    if (volumeRatio > 3) return Math.min(volumeRatio * 15, 100);
    // Very low volume (<0.3x average) can indicate liquidity risk
    if (volumeRatio < 0.3) return Math.min((1 - volumeRatio) * 60, 80);
    
    return 20; // Normal volume = lower risk
  };

  const calculate52WeekRisk = () => {
    const price = parseFloat(stock.price || 0);
    const yearHigh = parseFloat(stock.year_high || stock.yhigh || stock['52_week_high'] || 0);
    const yearLow = parseFloat(stock.year_low || stock.ylow || stock['52_week_low'] || 0);
    
    if (!price || !yearHigh || !yearLow) return 50;
    
    const range = yearHigh - yearLow;
    const positionInRange = (price - yearLow) / range;
    
    // Higher risk at extremes (very high or very low in 52-week range)
    if (positionInRange > 0.9) return 70; // Near 52-week high
    if (positionInRange < 0.1) return 80; // Near 52-week low
    if (positionInRange > 0.7) return 50; // Upper range
    if (positionInRange < 0.3) return 60; // Lower range
    
    return 30; // Middle range - lower risk
  };

  // Calculate individual risk components
  const volatilityRisk = calculateVolatilityRisk();
  const circuitRisk = calculateCircuitRisk();
  const technicalRisk = calculateTechnicalRisk();
  const deviationRisk = calculateDeviationRisk();
  const volumeRisk = calculateVolumeRisk();
  const rangeRisk = calculate52WeekRisk();

  // Calculate overall risk score (weighted average)
  const overallRisk = Math.round(
    (volatilityRisk * 0.2 + 
     circuitRisk * 0.15 + 
     technicalRisk * 0.25 + 
     deviationRisk * 0.15 + 
     volumeRisk * 0.15 + 
     rangeRisk * 0.1)
  );

  const getRiskLevel = (risk: number) => {
    if (risk <= 25) return { level: 'Low', color: 'text-green-400 bg-green-900/20', icon: Shield };
    if (risk <= 50) return { level: 'Moderate', color: 'text-yellow-400 bg-yellow-900/20', icon: Activity };
    if (risk <= 75) return { level: 'High', color: 'text-orange-400 bg-orange-900/20', icon: AlertTriangle };
    return { level: 'Critical', color: 'text-red-400 bg-red-900/20', icon: Zap };
  };

  const getRiskBar = (risk: number) => {
    const width = Math.min(risk, 100);
    let colorClass = 'bg-green-500';
    if (risk > 25) colorClass = 'bg-yellow-500';
    if (risk > 50) colorClass = 'bg-orange-500';
    if (risk > 75) colorClass = 'bg-red-500';
    
    return (
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    );
  };

  const overallRiskInfo = getRiskLevel(overallRisk);
  const OverallIcon = overallRiskInfo.icon;

  return (
    <Card className={`bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <OverallIcon className="w-5 h-5 text-orange-400" />
          Risk Assessment
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Risk Score */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 font-medium">Overall Risk</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${overallRiskInfo.color}`}>
              {overallRiskInfo.level}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {getRiskBar(overallRisk)}
            <span className="text-white font-bold text-lg min-w-[3rem]">
              {overallRisk}%
            </span>
          </div>
        </div>

        {/* Risk Components */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300 mb-3">Risk Breakdown:</div>
          
          {/* Volatility Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Day Volatility</span>
            </div>
            <div className="flex items-center gap-2">
              {getRiskBar(volatilityRisk)}
              <span className="text-xs text-gray-400 min-w-[2.5rem]">{Math.round(volatilityRisk)}%</span>
            </div>
          </div>

          {/* Technical Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Technical Trends</span>
            </div>
            <div className="flex items-center gap-2">
              {getRiskBar(technicalRisk)}
              <span className="text-xs text-gray-400 min-w-[2.5rem]">{Math.round(technicalRisk)}%</span>
            </div>
          </div>

          {/* Price Deviation Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Price Deviation</span>
            </div>
            <div className="flex items-center gap-2">
              {getRiskBar(deviationRisk)}
              <span className="text-xs text-gray-400 min-w-[2.5rem]">{Math.round(deviationRisk)}%</span>
            </div>
          </div>

          {/* Volume Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-300">Volume Pattern</span>
            </div>
            <div className="flex items-center gap-2">
              {getRiskBar(volumeRisk)}
              <span className="text-xs text-gray-400 min-w-[2.5rem]">{Math.round(volumeRisk)}%</span>
            </div>
          </div>

          {/* Circuit Risk */}
          {circuitRisk > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">Circuit Proximity</span>
              </div>
              <div className="flex items-center gap-2">
                {getRiskBar(circuitRisk)}
                <span className="text-xs text-gray-400 min-w-[2.5rem]">{Math.round(circuitRisk)}%</span>
              </div>
            </div>
          )}

          {/* 52-Week Range Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-gray-300">52W Position</span>
            </div>
            <div className="flex items-center gap-2">
              {getRiskBar(rangeRisk)}
              <span className="text-xs text-gray-400 min-w-[2.5rem]">{Math.round(rangeRisk)}%</span>
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="pt-3 border-t border-gray-700/50">
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Risk calculated from volatility, technical trends, and market position</div>
            <div>• Higher scores indicate increased potential for price fluctuation</div>
            <div>• Consider position sizing and stop-loss strategies for high-risk stocks</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessment;
