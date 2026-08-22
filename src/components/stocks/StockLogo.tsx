'use client';
import { logger } from '@/lib/logger';

import React, { useState } from 'react';
import Image from 'next/image';

interface StockLogoProps {
  symbol: string;
  size?: number;
  className?: string;
  imageUrl?: string;
}

const StockLogo: React.FC<StockLogoProps> = ({ symbol, size = 40, className = '', imageUrl }) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = imageUrl || null;
  const error = imageError || !logoUrl;

  const handleImageError = () => {
    logger.debug(`Image error for ${symbol}, using text fallback`);
    setImageError(true);
  };

  if (error || !logoUrl) {
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
        key={`${symbol}-${logoUrl}`}
        src={logoUrl}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        className="object-contain"
        onError={handleImageError}
        unoptimized
      />
    </div>
  );
};

export default StockLogo;
