'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ApiDocumentationPage = () => {
  const endpoints = [
    {
      name: 'Get All Trending Stocks',
      endpoint: '/api/stocks',
      method: 'GET',
      description: 'Returns a list of trending stocks including top gainers and losers.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/stocks',
        response: `{
  "status": "success",
  "data": {
    "top_gainers": [
      {
        "ticker_id": "RELIANCE",
        "company_name": "Reliance Industries",
        "price": "2200.55",
        "percent_change": "0.70",
        ...
      }
    ],
    "top_losers": [
      ...
    ]
  }
}`
      }
    },
    {
      name: 'Get Stock Details',
      endpoint: '/api/stocks/:symbol',
      method: 'GET',
      description: 'Returns detailed information about a specific stock.',
      params: [
        { name: 'symbol', type: 'path', required: true, description: 'Stock symbol or name' }
      ],
      example: {
        url: 'http://localhost:5001/api/stocks/RELIANCE',
        response: `{
  "status": "success",
  "data": {
    "tickerId": "RELIANCE",
    "companyName": "Reliance Industries Limited",
    "industry": "Conglomerate",
    "currentPrice": {
      "BSE": 2200.50,
      "NSE": 2195.75
    },
    ...
  }
}`
      }
    },
    {
      name: 'Get Historical Data',
      endpoint: '/api/stocks/:symbol/historical',
      method: 'GET',
      description: 'Returns historical price data for a stock.',
      params: [
        { name: 'symbol', type: 'path', required: true, description: 'Stock symbol or name' },
        { name: 'period', type: 'query', required: false, description: 'Time period (1m, 6m, 1yr, 3yr, 5yr, 10yr, max). Default: 1yr' },
        { name: 'filter', type: 'query', required: false, description: 'Data filter (default, price, pe, sm, evebitda, ptb, mcs). Default: price' }
      ],
      example: {
        url: 'http://localhost:5001/api/stocks/RELIANCE/historical?period=1yr&filter=price',
        response: `{
  "status": "success",
  "data": {
    "datasets": [
      {
        "metric": "Price",
        "label": "Price on NSE",
        "values": [
          ["2023-05-01", "2150.75"],
          ["2023-05-02", "2155.30"],
          ...
        ]
      },
      ...
    ]
  }
}`
      }
    },
    {
      name: 'Get IPO Data',
      endpoint: '/api/ipo',
      method: 'GET',
      description: 'Returns information about upcoming and recent IPOs.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/ipo',
        response: `{
  "status": "success",
  "data": [
    {
      "company": "Example Tech Ltd",
      "open_date": "2023-06-15",
      "close_date": "2023-06-18",
      "listing_date": "2023-06-25",
      "issue_price": "450-500",
      ...
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Get Market News',
      endpoint: '/api/news',
      method: 'GET',
      description: 'Returns latest market news and updates.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/news',
        response: `{
  "status": "success",
  "data": [
    {
      "headline": "RBI Policy: Repo rate unchanged at 6.5%",
      "summary": "The Reserve Bank of India kept the repo rate unchanged at 6.5% in its latest monetary policy meeting...",
      "source": "Financial Times",
      "published_date": "2023-06-08T10:30:00Z",
      ...
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Get 52-Week High/Low Data',
      endpoint: '/api/52-week-high-low',
      method: 'GET',
      description: 'Returns stocks at their 52-week highs and lows from both BSE and NSE.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/52-week-high-low',
        response: `{
  "status": "success",
  "data": {
    "BSE_52WeekHighLow": {
      "high52Week": [
        {
          "ticker": "RELIANCE.BO",
          "company": "Reliance Industries",
          "price": 2200.55,
          "52_week_high": 2300.00
        },
        ...
      ],
      "low52Week": [
        ...
      ]
    },
    "NSE_52WeekHighLow": {
      ...
    }
  }
}`
      }
    },
    {
      name: 'Get Most Active Stocks (BSE)',
      endpoint: '/api/most-active/bse',
      method: 'GET',
      description: 'Returns the most actively traded stocks on BSE.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/most-active/bse',
        response: `{
  "status": "success",
  "data": [
    {
      "ticker": "TATAMOTORS.BO",
      "company": "Tata Motors",
      "price": 450.75,
      "percent_change": 0.28,
      "net_change": 1.25,
      "volume": 8000000
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Get Most Active Stocks (NSE)',
      endpoint: '/api/most-active/nse',
      method: 'GET',
      description: 'Returns the most actively traded stocks on NSE.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/most-active/nse',
        response: `{
  "status": "success",
  "data": [
    {
      "ticker": "RELIANCE.NS",
      "company": "Reliance Industries",
      "price": 2200.55,
      "percent_change": 0.70,
      "net_change": 15.45,
      "volume": 12000000
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Get Mutual Funds',
      endpoint: '/api/mutual-funds',
      method: 'GET',
      description: 'Returns data for mutual funds categories and their performance.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/mutual-funds',
        response: `{
  "status": "success",
  "data": {
    "Equity": {
      "Large Cap": [
        {
          "fund_name": "SBI Bluechip Fund",
          "latest_nav": 45.67,
          "percentage_change": 0.45,
          "asset_size": 25000,
          "1_year_return": 12.5,
          ...
        },
        ...
      ]
    },
    ...
  }
}`
      }
    },
    {
      name: 'Search Mutual Funds',
      endpoint: '/api/mutual-funds/search',
      method: 'GET',
      description: 'Search for mutual funds by name or category.',
      params: [
        { name: 'query', type: 'query', required: true, description: 'Search term for mutual funds' }
      ],
      example: {
        url: 'http://localhost:5001/api/mutual-funds/search?query=SBI',
        response: `{
  "status": "success",
  "data": [
    {
      "id": "MF000063",
      "schemeName": "SBI Bluechip Fund",
      "isin": "INF204KA1W02",
      "schemeType": "Open Ended Investment Company",
      "categoryId": "MFCAT002"
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Get Price Shockers',
      endpoint: '/api/price-shockers',
      method: 'GET',
      description: 'Get stocks with significant price movement in a short period.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/price-shockers',
        response: `{
  "status": "success",
  "data": [
    {
      "ticker": "BPCL.NS",
      "company": "Bharat Petroleum Corporation",
      "price": 309.15,
      "percent_change": -1.27,
      "net_change": -3.98,
      "high": 319,
      "low": 308.7,
      ...
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Get Commodities Data',
      endpoint: '/api/commodities',
      method: 'GET',
      description: 'Get data for commodity futures contracts.',
      params: [],
      example: {
        url: 'http://localhost:5001/api/commodities',
        response: `{
  "status": "success",
  "data": [
    {
      "contractId": "QIU2O5ABzMxWRO9BIztY",
      "commoditySymbol": "ALUMINIUM",
      "expiryDate": "28 Jun 2024",
      "lastTradedPrice": 230.75,
      "totalVolume": 1369,
      "openInterest": 1066,
      ...
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Search Industries',
      endpoint: '/api/industry/search',
      method: 'GET',
      description: 'Search for companies within a specific industry.',
      params: [
        { name: 'query', type: 'query', required: true, description: 'Industry search term' }
      ],
      example: {
        url: 'http://localhost:5001/api/industry/search?query=Software',
        response: `{
  "status": "success",
  "data": [
    {
      "id": "S0003051",
      "commonName": "Tata Consultancy Services",
      "mgIndustry": "Software & Programming",
      "mgSector": "Technology",
      "stockType": "Equity",
      ...
    },
    ...
  ]
}`
      }
    },
    {
      name: 'Get Stock Target Price',
      endpoint: '/api/stocks/:symbol/target-price',
      method: 'GET',
      description: 'Get analyst recommendations and target price for a stock.',
      params: [
        { name: 'symbol', type: 'path', required: true, description: 'Stock symbol or ID' }
      ],
      example: {
        url: 'http://localhost:5001/api/stocks/RELIANCE/target-price',
        response: `{
  "status": "success",
  "data": {
    "priceTarget": {
      "CurrencyCode": "INR",
      "Mean": 4305.17073171,
      "High": 4800,
      "Low": 3165,
      ...
    },
    "recommendation": {
      "Mean": 2.46511628,
      "Statistics": {
        "Statistic": [
          {
            "Recommendation": 1,
            "NumberOfAnalysts": 6
          },
          ...
        ]
      }
    },
    ...
  }
}`
      }
    },
    {
      name: 'Get Historical Stats',
      endpoint: '/api/stocks/:symbol/historical-stats',
      method: 'GET',
      description: 'Get historical financial statistics for a stock.',
      params: [
        { name: 'symbol', type: 'path', required: true, description: 'Stock symbol or name' },
        { name: 'stats', type: 'query', required: true, description: 'Type of statistics (quarter_results, yoy_results, balancesheet, cashflow, ratios, shareholding_pattern_quarterly, shareholding_pattern_yearly)' }
      ],
      example: {
        url: 'http://localhost:5001/api/stocks/RELIANCE/historical-stats?stats=quarter_results',
        response: `{
  "status": "success",
  "data": {
    "Sales": {
      "Jun 2021": 45411,
      "Sep 2021": 46867,
      "Dec 2021": 48885,
      ...
    },
    "Expenses": {
      ...
    },
    ...
  }
}`
      }
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Indian Stock Analyzer API Documentation</h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">
        This documentation provides information about the premium API endpoints available in the Indian Stock Analyzer application.
        All endpoints return JSON responses with a consistent structure.
      </p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Response Format</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          All API responses follow this standard format:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <SyntaxHighlighter language="json" style={tomorrow}>
{`{
  "status": "success" | "error",
  "data": { ... } | [ ... ],  // On success
  "message": "Error message",  // On error
  "error": "Detailed error"    // On error
}`}
          </SyntaxHighlighter>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h3 className="text-xl font-semibold">{endpoint.name}</h3>
              <div className="mt-2 md:mt-0 flex items-center">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md font-mono text-sm mr-2">
                  {endpoint.method}
                </span>
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {endpoint.endpoint}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">{endpoint.description}</p>
            
            {endpoint.params.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Required</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {endpoint.params.map((param, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}>
                          <td className="px-4 py-2 text-sm font-mono">{param.name}</td>
                          <td className="px-4 py-2 text-sm">{param.type}</td>
                          <td className="px-4 py-2 text-sm">{param.required ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-2 text-sm">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-lg font-medium mb-2">Example</h4>
              <div className="mb-2">
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {endpoint.example.url}
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg">
                <SyntaxHighlighter language="json" style={tomorrow} customStyle={{ margin: 0 }}>
                  {endpoint.example.response}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDocumentationPage; 