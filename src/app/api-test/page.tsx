'use client';

import { useEffect, useState } from 'react';
import {
  getDatabaseHealthStatus,
  getHealthStatus,
  getLatestNews,
  getMarketOverview,
} from '@/api/api';

type TestResult = {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

const defaultTests: TestResult[] = [
  { name: 'GET /health', status: 'idle', message: 'Not run yet' },
  { name: 'GET /health/db', status: 'idle', message: 'Not run yet' },
  { name: 'GET /market/overview', status: 'idle', message: 'Not run yet' },
  { name: 'GET /news', status: 'idle', message: 'Not run yet' },
];

export default function ApiTestPage() {
  const [tests, setTests] = useState<TestResult[]>(defaultTests);
  const [running, setRunning] = useState(false);

  const updateTest = (index: number, patch: Partial<TestResult>) => {
    setTests((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const runTests = async () => {
    setRunning(true);

    for (let i = 0; i < defaultTests.length; i += 1) {
      updateTest(i, { status: 'loading', message: 'Running...' });

      try {
        if (i === 0) {
          const health = await getHealthStatus();
          updateTest(i, { status: 'success', message: `Service: ${health?.status || 'UP'}` });
        } else if (i === 1) {
          const db = await getDatabaseHealthStatus();
          updateTest(i, {
            status: 'success',
            message: `DB: ${db?.status || 'OK'}`,
          });
        } else if (i === 2) {
          const overviewResponse = await getMarketOverview();
          const overview =
            overviewResponse && typeof overviewResponse === 'object' && 'data' in overviewResponse
              ? (overviewResponse as { data?: unknown }).data
              : overviewResponse;
          updateTest(i, {
            status: 'success',
            message:
              overview && typeof overview === 'object' && 'capturedAt' in overview
                ? `Captured At: ${String((overview as { capturedAt?: unknown }).capturedAt || 'available')}`
                : 'Captured At: available',
          });
        } else if (i === 3) {
          const newsResponse = await getLatestNews({ limit: 10 });
          const newsPayload =
            newsResponse && typeof newsResponse === 'object' && 'data' in newsResponse
              ? (newsResponse as { data?: unknown }).data
              : newsResponse;
          const count = Array.isArray(newsPayload)
            ? newsPayload.length
            : newsPayload && typeof newsPayload === 'object' && 'articles' in newsPayload && Array.isArray((newsPayload as { articles?: unknown }).articles)
              ? ((newsPayload as { articles: unknown[] }).articles).length
              : 0;
          updateTest(i, { status: 'success', message: `Articles: ${count}` });
        }
      } catch (err) {
        updateTest(i, {
          status: 'error',
          message: err instanceof Error ? err.message : 'Request failed',
        });
      }
    }

    setRunning(false);
  };

  useEffect(() => {
    void runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-2">API Test Dashboard</h1>
          <p className="text-gray-300 text-sm mb-4">
            Base URL: <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api/v1'}</span>
          </p>
          <button
            onClick={() => void runTests()}
            disabled={running}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-sm"
          >
            {running ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Endpoint Checks</h2>
          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.name} className="border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-gray-200">{test.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{test.message}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    test.status === 'success'
                      ? 'bg-green-900/40 text-green-300 border border-green-700'
                      : test.status === 'error'
                        ? 'bg-red-900/40 text-red-300 border border-red-700'
                        : test.status === 'loading'
                          ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700'
                          : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}
                >
                  {test.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
