"use client";

import React, { useRef, useEffect } from 'react';
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
  const changeText = change === undefined || change === null
    ? ''
    : String(change).trim().replace(/^[+-]/, '');

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
    <div ref={cardRef} className="group overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/20 hover:shadow-[0_28px_80px_rgba(2,6,23,0.5)]">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</h3>
          <div className={`rounded-2xl p-2.5 transition-colors duration-300 ${
            typeof isPositive === 'boolean' 
              ? isPositive 
                ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20'
                : 'bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20'
              : 'bg-white/5 text-slate-300 ring-1 ring-white/10'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
          {change && (
            <div className={`flex items-center mt-1.5 text-sm font-medium ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <span className="mr-1 font-semibold">{isPositive ? '+' : '-'}</span>
              <span>{changeText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
