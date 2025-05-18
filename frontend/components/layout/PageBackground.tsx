import React, { ReactNode } from 'react';

interface PageBackgroundProps {
  children: ReactNode;
}

/**
 * PageBackground component provides consistent styling across all pages
 * with the dark gradient background and grid overlay pattern
 */
export default function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      {/* Content container with proper z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 