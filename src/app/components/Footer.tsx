'use client';

import React from 'react';
import { Heart, Github, AlertCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/90 backdrop-blur-lg dark:bg-gray-900 border-t border border-gray-800/30 shadow-lg py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Indian Stock Analyzer
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <a 
              href="https://github.com/yourusername/indian-stock-analyzer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
            >
              <Github className="h-4 w-4 mr-1" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Integration:</span>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">API v1 connected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>
            Data sourced from Stock Sense Backend v1 <span className="inline-block mx-1">•</span> For informational use only
          </p>
          <p className="mt-1">
            Made with <Heart className="h-3 w-3 inline text-red-500" fill="currentColor" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 