'use client';

import React from 'react';
import CursiveLoader from '@/components/ui/CursiveLoader';

interface LoadingSkeletonProps {
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={`relative rounded-lg bg-slate-200/80 shimmer dark:bg-slate-800/70 ${className || ''}`}>
    <div className="absolute inset-0 flex items-center justify-center">
      <CursiveLoader textClassName="text-base sm:text-lg" />
    </div>
  </div>
);

export default LoadingSkeleton;
