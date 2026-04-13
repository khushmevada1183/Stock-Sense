'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface StockLogoProps {
  symbol: string;
  size?: number;
  className?: string;
  imageUrl?: string;
}

const StockLogo: React.FC<StockLogoProps> = ({ symbol, size = 40, className = '', imageUrl }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(imageUrl || null);
  const [isLoading, setIsLoading] = useState<boolean>(imageUrl ? false : true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
    setError(!imageUrl);
    setLogoUrl(imageUrl || null);
  }, [symbol, imageUrl]);

  const handleImageError = () => {
    logger.debug(`Image error for ${symbol}, using text fallback`);
    setError(true);
    setLogoUrl(null);
  };

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-800/60 rounded shimmer-full animate-pulse ${className}`} 
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  if (error || !logoUrl) {
    // Display a fallback with the stock symbol
    return (
      <div 
        className={`flex items-center justify-center bg-blue-500 text-white font-bold rounded-full ${className}`} 
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {symbol.substring(0, 2)}
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <Image
        src={logoUrl}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        className="object-contain"
        onError={handleImageError}
        unoptimized // Add this to prevent Next.js image optimization issues with external URLs
      />
    </div>
  );
};

export default StockLogo; 