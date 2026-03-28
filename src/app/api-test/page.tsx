"use client";

import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@/api/api';
import { logger } from '@/lib/logger';

interface TestResult {
  name: string;
  status: 'SUCCESS' | 'FAILED';
  time: string;
  data?: string;
  error?: string;
  hasData: boolean;
}

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runApiTests = useCallback(async () => {
    setLoading(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Trending Stocks',
        test: () => api.getTrendingStocks()
      },
      {
        name: 'Latest News',
        test: () => api.getLatestNews()
      },
      {
        name: 'IPO Data',
        test: () => api.getIPOData()
      },
      {
        name: 'BSE Most Active',
        test: () => api.getBSEMostActive()
      }
    ];

    const results: TestResult[] = [];
    
    for (const testCase of tests) {
      try {
        logger.info(`Testing ${testCase.name}...`);
        const startTime = Date.now();
        const result = await testCase.test();
        const endTime = Date.now();
        
        results.push({
          name: testCase.name,
          status: 'SUCCESS',
          time: `${endTime - startTime}ms`,
          data: result ? JSON.stringify(result).substring(0, 100) + '...' : 'No data',
          hasData: !!result
        });
      } catch (error) {
        results.push({
          name: testCase.name,
          status: 'FAILED',
          time: '0ms',
          error: error instanceof Error ? error.message : 'Unknown error',
          hasData: false
        });
      }
    }
    
    setTestResults(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void runApiTests();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [runApiTests]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 API Testing Dashboard</h1>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Backend Configuration</h2>
          <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
          <p><strong>Status:</strong> <span className="text-green-400">Connected to deployed Render backend</span></p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={runApiTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium"
          >
            {loading ? 'Running Tests...' : 'Run API Tests'}
          </button>
        </div>

        {loading && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span>Testing API endpoints...</span>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{result.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{result.time}</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        result.status === 'SUCCESS' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                  
                  {result.status === 'SUCCESS' ? (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Data received:</p>
                      <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                        {result.data}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-red-400 text-sm">Error: {result.error}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">Summary</h3>
              <p>
                <span className="text-green-400">{testResults.filter(r => r.status === 'SUCCESS').length} passed</span>
                {' | '}
                <span className="text-red-400">{testResults.filter(r => r.status === 'FAILED').length} failed</span>
                {' | '}
                <span className="text-gray-300">{testResults.length} total</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
