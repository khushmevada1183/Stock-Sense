'use client';

import { useEffect, useState } from 'react';
import {
  getBlockDealsHistory,
  getBlockDealsLatest,
  getCorporateActionsHistory,
  getCorporateActionsLatest,
  getCorporateActionsSummary,
  getEarningsCalendarHistory,
  getEarningsCalendarLatest,
  getEarningsCalendarSummary,
  getFiiDiiCumulative,
  getFiiDiiHistory,
  getFiiDiiLatest,
  getInsiderTradesHistory,
  getInsiderTradesLatest,
  getInsiderTradesSummary,
  getMutualFundsHistory,
  getMutualFundsLatest,
  getMutualFundsTopHolders,
  getShareholdingHistory,
  getShareholdingLatest,
  getShareholdingTrends,
} from '@/api/api';

type SectionState = {
  title: string;
  status: 'loading' | 'success' | 'error';
  count: number;
  sample: unknown[];
  error?: string;
};

const makeLoadingState = (title: string): SectionState => ({
  title,
  status: 'loading',
  count: 0,
  sample: [],
});

const normalizeArray = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    for (const key of ['items', 'rows', 'results', 'data', 'records']) {
      if (Array.isArray(data[key])) {
        return data[key] as unknown[];
      }
    }
  }

  return [];
};

const pace = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export default function InstitutionalPage() {
  const [sections, setSections] = useState<SectionState[]>([
    makeLoadingState('FII / DII Latest'),
    makeLoadingState('FII / DII History'),
    makeLoadingState('FII / DII Cumulative'),
    makeLoadingState('Block Deals Latest'),
    makeLoadingState('Block Deals History'),
    makeLoadingState('Mutual Funds Latest'),
    makeLoadingState('Mutual Funds History'),
    makeLoadingState('Mutual Funds Top Holders'),
    makeLoadingState('Insider Trades Latest'),
    makeLoadingState('Insider Trades History'),
    makeLoadingState('Insider Trades Summary'),
    makeLoadingState('Shareholding Latest'),
    makeLoadingState('Shareholding History'),
    makeLoadingState('Shareholding Trends'),
    makeLoadingState('Corporate Actions Latest'),
    makeLoadingState('Corporate Actions History'),
    makeLoadingState('Corporate Actions Summary'),
    makeLoadingState('Earnings Calendar Latest'),
    makeLoadingState('Earnings Calendar History'),
    makeLoadingState('Earnings Calendar Summary'),
  ]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const requests: Array<{
        title: string;
        run: () => Promise<unknown>;
      }> = [
        { title: 'FII / DII Latest', run: () => getFiiDiiLatest({ limit: 10 }) },
        { title: 'FII / DII History', run: () => getFiiDiiHistory({ limit: 10 }) },
        { title: 'FII / DII Cumulative', run: () => getFiiDiiCumulative({ limit: 10 }) },
        { title: 'Block Deals Latest', run: () => getBlockDealsLatest({ limit: 10 }) },
        { title: 'Block Deals History', run: () => getBlockDealsHistory({ limit: 10 }) },
        { title: 'Mutual Funds Latest', run: () => getMutualFundsLatest({ limit: 10 }) },
        { title: 'Mutual Funds History', run: () => getMutualFundsHistory({ limit: 10 }) },
        { title: 'Mutual Funds Top Holders', run: () => getMutualFundsTopHolders({ limit: 10 }) },
        { title: 'Insider Trades Latest', run: () => getInsiderTradesLatest({ limit: 10 }) },
        { title: 'Insider Trades History', run: () => getInsiderTradesHistory({ limit: 10 }) },
        { title: 'Insider Trades Summary', run: () => getInsiderTradesSummary({ limit: 10 }) },
        { title: 'Shareholding Latest', run: () => getShareholdingLatest({ limit: 10 }) },
        { title: 'Shareholding History', run: () => getShareholdingHistory({ limit: 10 }) },
        { title: 'Shareholding Trends', run: () => getShareholdingTrends({ limit: 10 }) },
        { title: 'Corporate Actions Latest', run: () => getCorporateActionsLatest({ limit: 10 }) },
        { title: 'Corporate Actions History', run: () => getCorporateActionsHistory({ limit: 10 }) },
        { title: 'Corporate Actions Summary', run: () => getCorporateActionsSummary({ limit: 10 }) },
        { title: 'Earnings Calendar Latest', run: () => getEarningsCalendarLatest({ limit: 10 }) },
        { title: 'Earnings Calendar History', run: () => getEarningsCalendarHistory({ limit: 10 }) },
        { title: 'Earnings Calendar Summary', run: () => getEarningsCalendarSummary({ limit: 10 }) },
      ];

      const nextSections = requests.map((request) => makeLoadingState(request.title));

      if (!cancelled) {
        setSections(nextSections);
      }

      for (let index = 0; index < requests.length; index += 1) {
        const request = requests[index];

        try {
          const response = await request.run();
          const payload = (response as { data?: unknown })?.data ?? response;
          const rows = normalizeArray(payload);

          nextSections[index] = {
            title: request.title,
            status: 'success',
            count: rows.length,
            sample: rows.slice(0, 3),
          };
        } catch (err) {
          nextSections[index] = {
            title: request.title,
            status: 'error',
            count: 0,
            sample: [],
            error: err instanceof Error ? err.message : 'Failed to load section',
          };
        }

        if (!cancelled) {
          setSections([...nextSections]);
        }

        // Pace requests to stay below backend throttling thresholds.
        await pace(150);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Institutional Intelligence</h1>
        <p className="text-gray-400 mt-1">Live institutional datasets integrated from /institutional endpoints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-semibold text-sm">{section.title}</h2>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  section.status === 'success'
                    ? 'bg-green-900/30 text-green-300 border border-green-700'
                    : section.status === 'error'
                      ? 'bg-red-900/30 text-red-300 border border-red-700'
                      : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                }`}
              >
                {section.status.toUpperCase()}
              </span>
            </div>

            <p className="text-2xl font-bold text-neon-400 mb-3">{section.count}</p>

            {section.status === 'error' ? (
              <p className="text-xs text-red-300">{section.error}</p>
            ) : (
              <pre className="text-xs text-gray-300 bg-gray-800 border border-gray-700 rounded-md p-3 overflow-x-auto max-h-40">
                {JSON.stringify(section.sample, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
