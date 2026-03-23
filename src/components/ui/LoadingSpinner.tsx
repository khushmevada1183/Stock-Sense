import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };
  
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[200px] gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-800/50`} />
        {/* Spinning arc */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-neon-400 border-r-neon-400/30 animate-spin`} />
        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-neon-400/60 animate-pulse shadow-neon-sm" />
        </div>
      </div>
      <span className="text-gray-600 text-sm">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;