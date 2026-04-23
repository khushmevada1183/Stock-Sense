'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div
    className={`relative overflow-hidden rounded-[24px] border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/80 shimmer ${className || ''}`}
    aria-hidden="true"
  >
    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 dark:via-white/10" />
    <div className="absolute inset-0 rounded-[inherit] bg-[color:var(--app-surface)]/35" />
  </div>
);

export default LoadingSkeleton;
