'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Github, Check, AlertCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [apiKey, setApiKey] = useState<string>('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api'; // Use consistent default

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await axios.get(`${apiUrl}/health`); // Use apiUrl
        if (response.data.status === 'UP' || response.data.status === 'OK') { // Accept 'OK' as well
          setApiStatus('active');
          const configResponse = await axios.get(`${apiUrl}/config`); // Use apiUrl
          if (configResponse.data.apiKey) {
            const key = configResponse.data.apiKey;
            setApiKey(`...${key.substring(key.length - 4)}`);
          }
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        console.error('Error checking API status:', error);
        setApiStatus('error');
      }
    };

    checkApiStatus();
  }, [apiUrl]); // Add apiUrl as a dependency

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
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
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">API Status:</span>
              {apiStatus === 'loading' ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : apiStatus === 'active' ? (
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">Active</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">Error</span>
                </div>
              )}
            </div>

            {apiKey && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                API Key: <span className="font-mono">{apiKey}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>
            Powered by Indian Stock Exchange API <span className="inline-block mx-1">•</span> Data provided for educational purposes only
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