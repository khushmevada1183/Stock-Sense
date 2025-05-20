'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [backendStatus, setBackendStatus] = useState('Loading...');
  const [backendUrl, setBackendUrl] = useState('');
  
  useEffect(() => {
    // Display the current API URL from environment variables
    setBackendUrl(process.env.NEXT_PUBLIC_API_URL || 'Not set');
    
    // Test connection to the backend health endpoint
    const checkBackend = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api'}/health`);
        const data = await response.json();
        setBackendStatus(`Connected! Status: ${JSON.stringify(data)}`);
      } catch (err) {
        setBackendStatus(`Error connecting to backend: ${err.message}`);
      }
    };
    
    checkBackend();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Stock-Sense Backend Connection Test</h1>
      
      <div className="mb-4">
        <p><strong>Backend URL:</strong> {backendUrl}</p>
      </div>
      
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Backend Status:</h2>
        <pre className="bg-gray-100 p-3 rounded">{backendStatus}</pre>
      </div>
    </div>
  );
}
