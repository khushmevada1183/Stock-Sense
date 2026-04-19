'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={`rounded-lg bg-slate-200/80 shimmer dark:bg-slate-800/70 ${className || ''}`} />
);

export default LoadingSkeleton;
