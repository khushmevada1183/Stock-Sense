import React, { CSSProperties, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const colorMap: Record<NonNullable<GlowCardProps['glowColor']>, string> = {
  blue: 'border-blue-200 dark:border-blue-700',
  purple: 'border-purple-200 dark:border-purple-700',
  green: 'border-green-200 dark:border-green-700',
  red: 'border-red-200 dark:border-red-700',
  orange: 'border-orange-200 dark:border-orange-700'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const getSizeClasses = () => {
    if (customSize) {
      return '';
    }
    return sizeMap[size];
  };

  const getInlineStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      borderRadius: '0.5rem',
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : String(width);
    }

    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : String(height);
    }

    return baseStyles;
  };

  return (
    <div
      style={getInlineStyles()}
      className={`
        ${getSizeClasses()}
        ${!customSize ? 'aspect-[3/4]' : ''}
        border
        bg-white
        dark:bg-slate-950
        ${colorMap[glowColor]}
        overflow-hidden
        p-4
        transition-all
        duration-300
        ease-out
        hover:shadow-md
        ${className}
      `}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export { GlowCard }