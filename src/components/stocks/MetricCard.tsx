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
    <div ref={cardRef} className="glass-card card-shine rounded-xl overflow-hidden group">
      {/* Top accent */}
      <div className={`h-[2px] ${
        typeof isPositive === 'boolean'
          ? isPositive 
            ? 'bg-gradient-to-r from-transparent via-green-400/50 to-transparent'
            : 'bg-gradient-to-r from-transparent via-red-400/50 to-transparent'
          : 'bg-gradient-to-r from-transparent via-neon-400/30 to-transparent'
      }`} />
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">{title}</h3>
          <div className={`p-2 rounded-lg transition-colors duration-300 ${
            typeof isPositive === 'boolean' 
              ? isPositive 
                ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/15'
                : 'bg-red-500/10 text-red-400 group-hover:bg-red-500/15'
              : 'bg-neon-400/10 text-neon-400 group-hover:bg-neon-400/15'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`flex items-center mt-1.5 text-sm font-medium ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <ArrowUp className="w-3.5 h-3.5 mr-1" /> : <ArrowDown className="w-3.5 h-3.5 mr-1" />}
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
