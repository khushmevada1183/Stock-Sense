"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  Activity,
  Signal,
  Target,
  BarChart3
} from 'lucide-react';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  description: string;
}

interface SupportResistanceLevel {
  level: number;
  type: 'support' | 'resistance';
  strength: 'weak' | 'moderate' | 'strong';
}

interface TechnicalAnalysisProps {
  symbol: string;
  currentPrice: number;
  priceData?: number[];
  volume?: number[];
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ 
  symbol, 
  currentPrice, 
  priceData = [], 
  volume = [] 
}) => {
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [supportResistance, setSupportResistance] = useState<SupportResistanceLevel[]>([]);
  const [overallSignal, setOverallSignal] = useState<'BUY' | 'SELL' | 'HOLD'>('HOLD');
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate technical indicators
  useEffect(() => {
    if (priceData.length > 0) {
      const calculatedIndicators = calculateTechnicalIndicators(priceData, volume);
      setIndicators(calculatedIndicators);
      
      const levels = calculateSupportResistance(priceData);
      setSupportResistance(levels);
      
      const signal = calculateOverallSignal(calculatedIndicators);
      setOverallSignal(signal);
    }
  }, [priceData, volume]);

  // Animation
  useEffect(() => {
    if (!containerRef.current) return;

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
  }, [indicators]);

  const calculateTechnicalIndicators = (prices: number[], volumes: number[]): TechnicalIndicator[] => {
    const indicators: TechnicalIndicator[] = [];
    
    if (prices.length < 14) return indicators;

    // RSI Calculation
    const rsi = calculateRSI(prices, 14);
    indicators.push({
      name: 'RSI (14)',
      value: rsi,
      signal: rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'HOLD',
      description: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'
    });

    // MACD
    const macd = calculateMACD(prices);
    indicators.push({
      name: 'MACD',
      value: macd.histogram,
      signal: macd.histogram > 0 ? 'BUY' : 'SELL',
      description: macd.histogram > 0 ? 'Bullish momentum' : 'Bearish momentum'
    });

    // Moving Averages
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    indicators.push({
      name: 'SMA 20/50',
      value: ((sma20 - sma50) / sma50) * 100,
      signal: sma20 > sma50 ? 'BUY' : 'SELL',
      description: sma20 > sma50 ? 'Golden Cross' : 'Death Cross'
    });

    // Bollinger Bands
    const bb = calculateBollingerBands(prices, 20);
    const currentPrice = prices[prices.length - 1];
    const bbPosition = (currentPrice - bb.lower) / (bb.upper - bb.lower);
    indicators.push({
      name: 'Bollinger Bands',
      value: bbPosition * 100,
      signal: bbPosition > 0.8 ? 'SELL' : bbPosition < 0.2 ? 'BUY' : 'HOLD',
      description: bbPosition > 0.8 ? 'Near upper band' : bbPosition < 0.2 ? 'Near lower band' : 'Mid-range'
    });

    // Volume analysis
    if (volumes.length > 0) {
      const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
      const currentVolume = volumes[volumes.length - 1];
      indicators.push({
        name: 'Volume',
        value: ((currentVolume - avgVolume) / avgVolume) * 100,
        signal: currentVolume > avgVolume * 1.5 ? 'BUY' : 'HOLD',
        description: currentVolume > avgVolume * 1.5 ? 'High volume breakout' : 'Normal volume'
      });
    }

    return indicators;
  };

  const calculateRSI = (prices: number[], period: number): number => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateSMA = (prices: number[], period: number): number => {
    if (prices.length < period) return prices[prices.length - 1];
    
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  };

  const calculateMACD = (prices: number[]) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    const signalLine = calculateEMA([macdLine], 9);
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  };

  const calculateEMA = (prices: number[], period: number): number => {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  };

  const calculateBollingerBands = (prices: number[], period: number) => {
    const sma = calculateSMA(prices, period);
    const slice = prices.slice(-period);
    const variance = slice.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  };

  const calculateSupportResistance = (prices: number[]): SupportResistanceLevel[] => {
    const levels: SupportResistanceLevel[] = [];
    const lookback = Math.min(50, prices.length);
    const recentPrices = prices.slice(-lookback);
    
    // Find local highs and lows
    for (let i = 2; i < recentPrices.length - 2; i++) {
      const current = recentPrices[i];
      const isLocalHigh = current > recentPrices[i-1] && current > recentPrices[i-2] && 
                         current > recentPrices[i+1] && current > recentPrices[i+2];
      const isLocalLow = current < recentPrices[i-1] && current < recentPrices[i-2] && 
                        current < recentPrices[i+1] && current < recentPrices[i+2];
      
      if (isLocalHigh) {
        levels.push({
          level: current,
          type: 'resistance',
          strength: 'moderate'
        });
      }
      
      if (isLocalLow) {
        levels.push({
          level: current,
          type: 'support',
          strength: 'moderate'
        });
      }
    }
    
    return levels.slice(-6); // Return most recent 6 levels
  };

  const calculateOverallSignal = (indicators: TechnicalIndicator[]): 'BUY' | 'SELL' | 'HOLD' => {
    if (indicators.length === 0) return 'HOLD';
    
    const buySignals = indicators.filter(ind => ind.signal === 'BUY').length;
    const sellSignals = indicators.filter(ind => ind.signal === 'SELL').length;
    
    if (buySignals > sellSignals * 1.5) return 'BUY';
    if (sellSignals > buySignals * 1.5) return 'SELL';
    return 'HOLD';
  };

  const getSignalColor = (signal: 'BUY' | 'SELL' | 'HOLD') => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-500/10 border border-green-500/20';
      case 'SELL': return 'text-red-400 bg-red-500/10 border border-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20';
    }
  };

  const getSignalIcon = (signal: 'BUY' | 'SELL' | 'HOLD') => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-4 h-4" />;
      case 'SELL': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Overall Signal */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Signal className="w-5 h-5 text-neon-400" />
            Technical Analysis Signal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${getSignalColor(overallSignal)}`}>
            {getSignalIcon(overallSignal)}
            <span>{overallSignal}</span>
          </div>
          <p className="text-gray-500 mt-2">
            Based on analysis of {indicators.length} technical indicators
          </p>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-400" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indicators.map((indicator, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{indicator.name}</h4>
                  <div className={`px-2 py-1 rounded text-xs ${getSignalColor(indicator.signal)}`}>
                    {indicator.signal}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                  </span>
                  {indicator.signal !== 'HOLD' && (
                    indicator.signal === 'BUY' ? 
                      <ArrowUp className="w-4 h-4 text-green-400" /> :
                      <ArrowDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">{indicator.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support & Resistance Levels */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-neon-400" />
            Support & Resistance Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {supportResistance.length > 0 ? (
              supportResistance.map((level, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-800/30 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      level.type === 'resistance' ? 'bg-red-400' : 'bg-green-400'
                    }`} />
                    <span className="text-white capitalize">{level.type}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      level.strength === 'strong' ? 'bg-cyan-500/10 text-cyan-400' :
                      level.strength === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {level.strength}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">₹{level.level.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">
                      {((level.level - currentPrice) / currentPrice * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No significant levels identified</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalAnalysis;
