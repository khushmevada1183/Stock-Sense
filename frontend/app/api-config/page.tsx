'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ApiConfigPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Get the API URL from localStorage or default
    const url = localStorage.getItem('api_url') || 'http://localhost:5002/api';
    setApiUrl(url);
    setSavedUrl(url);
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('api_url', apiUrl);
      setSavedUrl(apiUrl);
      setStatus('API URL saved successfully! Please restart the application or refresh the page.');
      
      // Update in sessionStorage for immediate use
      sessionStorage.setItem('temp_api_url', apiUrl);
    } catch (error) {
      console.error('Error saving API URL:', error);
      setStatus('Failed to save API URL. Check console for errors.');
    }
  };

  const handleReset = () => {
    const defaultUrl = 'http://localhost:5002/api';
    setApiUrl(defaultUrl);
    localStorage.setItem('api_url', defaultUrl);
    setSavedUrl(defaultUrl);
    setStatus('API URL reset to default!');
  };

  const setPort = (port: string) => {
    const newUrl = `http://localhost:${port}/api`;
    setApiUrl(newUrl);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Configuration</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API URL Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-bold mb-2">Current API URL: <span className="font-normal">{savedUrl}</span></p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="apiUrl" className="block mb-2 font-medium">
              New API URL:
            </label>
            <div className="flex gap-2">
              <input
                id="apiUrl"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
              <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
                Save
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="font-medium mb-2">Quick Port Selection:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setPort('5001')} 
                variant="outline"
                className={apiUrl.includes('5001') ? 'bg-green-100 dark:bg-green-900' : ''}
              >
                Port 5001 (Default)
              </Button>
              <Button 
                onClick={() => setPort('5002')} 
                variant="outline"
                className={apiUrl.includes('5002') ? 'bg-green-100 dark:bg-green-900' : ''}
              >
                Port 5002 (Alternate)
              </Button>
              <Button 
                onClick={() => setPort('5000')} 
                variant="outline"
                className={apiUrl.includes('5000') ? 'bg-green-100 dark:bg-green-900' : ''}
              >
                Port 5000 (Legacy)
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <Button onClick={handleReset} variant="destructive">
              Reset to Default
            </Button>
          </div>
          
          {status && (
            <div className={`p-3 rounded mt-4 ${status.includes('success') ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
              {status}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Use this page to configure which API server your frontend application uses. After changing the API URL, you may need to refresh the page for changes to take effect.
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Port 5001 (Default):</strong> Use the primary API server</li>
            <li><strong>Port 5002 (Alternate):</strong> Use the alternate API server if the primary is unavailable</li>
            <li><strong>Port 5000 (Legacy):</strong> Only for legacy systems</li>
          </ul>
          
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded border border-amber-200 dark:border-amber-800">
            <p className="text-amber-700 dark:text-amber-400 font-medium">Troubleshooting Connection Issues:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2 text-amber-700 dark:text-amber-400">
              <li>Check that the backend server is running</li>
              <li>Verify the port is correct and not blocked by firewall</li>
              <li>Check the API Debug page for detailed diagnostics</li>
              <li>Ensure both frontend and backend are using the same port configuration</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 