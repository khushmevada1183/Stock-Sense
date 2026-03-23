'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={`bg-gray-800/60 rounded-lg shimmer ${className || ''}`} />
);

export default LoadingSkeleton;
