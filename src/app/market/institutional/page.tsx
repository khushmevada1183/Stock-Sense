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
import { insetPanelClass, panelShellClass, sectionTitleClass } from '@/styles/design-tokens';

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

const statusBadgeClass = (status: SectionState['status']) => {
  if (status === 'success') {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400';
  }

  if (status === 'error') {
    return 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400';
  }

  return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400';
};

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
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h1 className={sectionTitleClass}>Institutional Intelligence</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Live institutional datasets integrated from /institutional endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className={`${panelShellClass} p-5`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{section.title}</h2>
                <span className={`rounded px-2 py-1 text-xs ${statusBadgeClass(section.status)}`}>
                  {section.status.toUpperCase()}
                </span>
              </div>

              <p className="mb-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{section.count}</p>

              {section.status === 'error' ? (
                <p className="text-xs text-rose-600 dark:text-rose-400">{section.error}</p>
              ) : (
                <pre className={`${insetPanelClass} max-h-40 overflow-x-auto p-3 text-xs text-slate-600 dark:text-slate-400`}>
                  {JSON.stringify(section.sample, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
