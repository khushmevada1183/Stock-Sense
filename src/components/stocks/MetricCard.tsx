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
    if (!isAnimated || !cardRef.current) return;

    const element = cardRef.current;
    gsap.killTweensOf(element);
    gsap.set(element, { clearProps: 'opacity,transform,filter' });

    const tween = gsap.fromTo(
      element,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: delay, ease: "power3.out", overwrite: "auto" }
    );

    return () => {
      tween.kill();
      gsap.set(element, { clearProps: 'opacity,transform,filter' });
    };
  }, [isAnimated, delay]);

  return (
    <div ref={cardRef} className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-950 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-slate-600 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">{title}</h3>
          <div className={`p-2 rounded-lg transition-colors duration-300 ${
            typeof isPositive === 'boolean' 
              ? isPositive 
                ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
                : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {change && (
            <div className={`flex items-center mt-1.5 text-sm font-medium ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
