import React from 'react';

/**
 * Simple loading spinner component
 */
const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  // Color classes
  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          animate-spin rounded-full
          ${sizeClasses[size] || sizeClasses.md}
          border-2 ${colorClasses[color] || colorClasses.blue}
          border-t-transparent
        `}
      />
    </div>
  );
};

export default LoadingSpinner; 