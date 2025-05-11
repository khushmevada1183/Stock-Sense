'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export default function ApiDebugPage() {
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [healthResponse, setHealthResponse] = useState<any>(null);
  const [stocksResponse, setStocksResponse] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiUrl, setApiUrl] = useState('http://localhost:5002/api');

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiStatus('checking');
    setErrors([]);
    
    try {
      // Check health endpoint
      try {
        const healthRes = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
        setHealthResponse(healthRes.data);
      } catch (error: any) {
        const errorMessage = error.response 
          ? `Health check failed: ${error.response.status} - ${error.response.statusText}`
          : `Health check failed: ${error.message}`;
        setErrors(prev => [...prev, errorMessage]);
        setHealthResponse(null);
      }

      // Check stocks endpoint
      try {
        const stocksRes = await axios.get(`${apiUrl}/stocks`, { timeout: 5000 });
        setStocksResponse(stocksRes.data);
      } catch (error: any) {
        const errorMessage = error.response 
          ? `Stocks check failed: ${error.response.status} - ${error.response.statusText}`
          : `Stocks check failed: ${error.message}`;
        setErrors(prev => [...prev, errorMessage]);
        setStocksResponse(null);
      }

      // Determine overall status
      if (healthResponse || stocksResponse) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error: any) {
      setApiStatus('offline');
      setErrors(prev => [...prev, `General error: ${error.message}`]);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Connectivity Debug Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-bold">API URL: {apiUrl}</p>
          </div>
          <div className="mb-4">
            <p className="font-bold">Status: 
              <span className={`ml-2 ${apiStatus === 'online' ? 'text-green-500' : apiStatus === 'offline' ? 'text-red-500' : 'text-yellow-500'}`}>
                {apiStatus === 'checking' ? 'Checking...' : apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1)}
              </span>
            </p>
          </div>
          <button 
            onClick={checkApiStatus}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Refresh Status
          </button>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="mb-6 border-red-300">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-600 dark:text-red-400">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index} className="text-red-600 dark:text-red-400">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Health Endpoint Response</CardTitle>
          </CardHeader>
          <CardContent>
            {healthResponse ? (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(healthResponse, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No response</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stocks Endpoint Response</CardTitle>
          </CardHeader>
          <CardContent>
            {stocksResponse ? (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(stocksResponse, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No response</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 