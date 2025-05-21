import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-t-2 border-b-2',
    md: 'h-10 w-10 border-t-2 border-b-2',
    lg: 'h-14 w-14 border-t-3 border-b-3'
  };
  
  return (
    <div className="flex justify-center items-center h-full">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-500 dark:border-indigo-500`}></div>
    </div>
  );
};

export default LoadingSpinner; 