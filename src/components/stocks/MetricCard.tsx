"use client";

import React, { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon: React.ReactNode;
  isAnimated?: boolean;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, change, isPositive, icon, isAnimated = true, delay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAnimated && cardRef.current) {
      gsap.from(cardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: delay,
        ease: "power3.out"
      });
    }
  }, [isAnimated, delay]);

  return (
    <div ref={cardRef} className="metric-card bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg rounded-xl overflow-hidden hover:bg-gray-700/50 transition-colors">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
          <div className={`p-2 rounded-lg ${
            typeof isPositive === 'boolean' 
              ? isPositive 
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
              : 'bg-indigo-500/20 text-indigo-400'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
