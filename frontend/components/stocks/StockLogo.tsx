'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCompanyLogo } from '@/services/stockService';

interface StockLogoProps {
  symbol: string;
  size?: number;
  className?: string;
  imageUrl?: string;
}

const StockLogo: React.FC<StockLogoProps> = ({ symbol, size = 40, className = '', imageUrl }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(imageUrl || null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(imageUrl ? false : true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // If imageUrl is provided directly, use it instead of fetching
    if (imageUrl) {
      setLogoUrl(imageUrl);
      setIsLoading(false);
      return;
    }
    
    const fetchLogo = async () => {
      if (!symbol) return;

      setIsLoading(true);
      setError(false);

      // Always set a fallback URL based on the symbol
      const defaultFallback = `https://ui-avatars.com/api/?name=${symbol}&background=random&size=128`;
      setFallbackUrl(defaultFallback);

      try {
        const logoData = await getCompanyLogo(symbol);
        
        if (logoData && logoData.url) {
          setLogoUrl(logoData.url);
          
          // Store the fallback URL if provided by the API
          if (logoData.fallbackUrl) {
            setFallbackUrl(logoData.fallbackUrl);
          }
        } else {
          throw new Error('No logo URL returned');
        }
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError(true);
        setLogoUrl(defaultFallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [symbol, imageUrl]);

  const handleImageError = () => {
    console.log(`Image error for ${symbol}, using fallback`);
    setError(true);
    setLogoUrl(fallbackUrl || `https://ui-avatars.com/api/?name=${symbol}&background=random&size=128`);
  };

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`} 
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