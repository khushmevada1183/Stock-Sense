'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Indian Stock API Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete reference for the Indian Stock API used in this application
          </p>
        </div>
        
        {/* API Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'authentication'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('authentication')}
          >
            Authentication
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'endpoints'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('endpoints')}
          >
            Endpoints
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'models'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('models')}
          >
            Data Models
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">API Overview</h2>
              
              <p className="mb-4">
                The Indian Stock API provides comprehensive data for Indian stock markets, including real-time and historical prices, company information, IPO data, and market news.
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Base URL</h3>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono text-sm">
                  https://stock.indianapi.in
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">API Version</h3>
                <p>Current version: <span className="font-semibold">0.1.0</span></p>
                <p>OpenAPI Specification: <span className="font-semibold">3.0.1</span></p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Rate Limits</h3>
                <p className="mb-2">The API has the following rate limits:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>100 requests per minute</li>
                  <li>5,000 requests per day</li>
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Response Format</h3>
                <p className="mb-2">All API responses are returned in JSON format with the following structure:</p>
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono text-sm overflow-x-auto">
{`{
  "status": "success",
  "data": { ... }
}`}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'authentication' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>
              
              <p className="mb-4">
                Authentication to the API is performed via API Key. You must include your API key in the request headers.
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">API Key Header</h3>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono text-sm">
                  x-api-key: sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Example Request</h3>
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono text-sm overflow-x-auto">
{`fetch('https://stock.indianapi.in/stocks', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'endpoints' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
              
              <div className="space-y-8">
                {/* Stocks Endpoint */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium mr-2">GET</span>
                    <code className="font-mono text-sm">/stocks</code>
                  </div>
                  <p className="mb-3">Returns a list of all available stocks.</p>
                  <h4 className="font-medium mb-2">Example Response:</h4>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded font-mono text-xs overflow-x-auto">
{`{
  "status": "success",
  "data": [
    {
      "id": 1,
      "symbol": "RELIANCE",
      "company_name": "Reliance Industries Ltd.",
      "sector_name": "Energy",
      "current_price": 3285.50,
      "price_change_percentage": 1.78,
      ...
    },
    ...
  ]
}`}
                  </pre>
                </div>
                
                {/* Stock by Symbol Endpoint */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium mr-2">GET</span>
                    <code className="font-mono text-sm">/stocks/{'{symbol}'}</code>
                  </div>
                  <p className="mb-3">Returns detailed information for a specific stock by its symbol.</p>
                  <h4 className="font-medium mb-2">Parameters:</h4>
                  <table className="min-w-full mb-3">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      <tr>
                        <td className="px-4 py-2 text-sm">symbol</td>
                        <td className="px-4 py-2 text-sm">string</td>
                        <td className="px-4 py-2 text-sm">Stock symbol (e.g., RELIANCE, TCS)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Historical Data Endpoint */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium mr-2">GET</span>
                    <code className="font-mono text-sm">/stocks/{'{symbol}'}/historical</code>
                  </div>
                  <p className="mb-3">Returns historical price data for a specific stock.</p>
                  <h4 className="font-medium mb-2">Query Parameters:</h4>
                  <table className="min-w-full mb-3">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      <tr>
                        <td className="px-4 py-2 text-sm">dataAge</td>
                        <td className="px-4 py-2 text-sm">string</td>
                        <td className="px-4 py-2 text-sm">Time period for historical data (OneWeekAgo, ThirtyDaysAgo, SixtyDaysAgo, NinetyDaysAgo)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* IPO Endpoint */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium mr-2">GET</span>
                    <code className="font-mono text-sm">/ipo</code>
                  </div>
                  <p className="mb-3">Returns information about upcoming and recent IPOs.</p>
                </div>
                
                {/* News Endpoint */}
                <div>
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium mr-2">GET</span>
                    <code className="font-mono text-sm">/news</code>
                  </div>
                  <p className="mb-3">Returns latest market news and articles.</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'models' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Data Models</h2>
              
              <div className="space-y-8">
                {/* Stock Model */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-medium mb-3">Stock</h3>
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Field</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      <tr>
                        <td className="px-4 py-2 text-sm">id</td>
                        <td className="px-4 py-2 text-sm">integer</td>
                        <td className="px-4 py-2 text-sm">Unique identifier</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">symbol</td>
                        <td className="px-4 py-2 text-sm">string</td>
                        <td className="px-4 py-2 text-sm">Stock symbol</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">company_name</td>
                        <td className="px-4 py-2 text-sm">string</td>
                        <td className="px-4 py-2 text-sm">Company name</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">sector_name</td>
                        <td className="px-4 py-2 text-sm">string</td>
                        <td className="px-4 py-2 text-sm">Business sector</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">current_price</td>
                        <td className="px-4 py-2 text-sm">number</td>
                        <td className="px-4 py-2 text-sm">Current stock price</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">price_change_percentage</td>
                        <td className="px-4 py-2 text-sm">number</td>
                        <td className="px-4 py-2 text-sm">Daily percentage change</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Historical Data Model */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-medium mb-3">Historical Data</h3>
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Field</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      <tr>
                        <td className="px-4 py-2 text-sm">dates</td>
                        <td className="px-4 py-2 text-sm">array of strings</td>
                        <td className="px-4 py-2 text-sm">Collection of dates (YYYY-MM-DD format)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">prices</td>
                        <td className="px-4 py-2 text-sm">array of numbers</td>
                        <td className="px-4 py-2 text-sm">Corresponding closing prices</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">volumes</td>
                        <td className="px-4 py-2 text-sm">array of numbers</td>
                        <td className="px-4 py-2 text-sm">Corresponding trading volumes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* DataAge Enum */}
                <div>
                  <h3 className="text-lg font-medium mb-3">DataAge Enum Values</h3>
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                      <tr>
                        <td className="px-4 py-2 text-sm">OneWeekAgo</td>
                        <td className="px-4 py-2 text-sm">Data from past 7 days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">ThirtyDaysAgo</td>
                        <td className="px-4 py-2 text-sm">Data from past 30 days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">SixtyDaysAgo</td>
                        <td className="px-4 py-2 text-sm">Data from past 60 days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">NinetyDaysAgo</td>
                        <td className="px-4 py-2 text-sm">Data from past 90 days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm">Current</td>
                        <td className="px-4 py-2 text-sm">Current data (today only)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 