'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { getSettingsReports } from '@/lib/api';

const formatRelative = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const formatDistance = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently';
  }

  const diff = Date.now() - parsed.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const statusStyles: Record<string, string> = {
  Ready: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200',
  Queued: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200',
  Expired: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200',
};

export default function Reports() {
  const query = useQuery({
    queryKey: ['settings', 'reports'],
    queryFn: getSettingsReports,
  });

  const reportsData = query.data?.data;

  const sortedReports = useMemo(() => {
    return [...(reportsData?.reports || [])].sort(
      (left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime()
    );
  }, [reportsData?.reports]);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <LoadingSkeleton className="h-24 w-full rounded-[18px]" />
          <LoadingSkeleton className="h-24 w-full rounded-[18px]" />
          <LoadingSkeleton className="h-24 w-full rounded-[18px]" />
          <LoadingSkeleton className="h-24 w-full rounded-[18px]" />
        </div>
        <LoadingSkeleton className="h-64 w-full rounded-[20px]" />
      </div>
    );
  }

  if (query.isError || !reportsData) {
    return <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">Failed to load reports.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[24px] border border-slate-200 bg-white shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="mt-0 text-xl text-slate-950 dark:text-white">Reports</CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Download account statements, portfolio snapshots, and tax-ready summaries from one place.
              </CardDescription>
            </div>

            <button
              type="button"
              onClick={() => void query.refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Total reports</p>
              <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{reportsData.summary.total}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Ready</p>
              <p className="mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-300">{reportsData.summary.ready}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Queued</p>
              <p className="mt-2 text-xl font-semibold text-amber-600 dark:text-amber-300">{reportsData.summary.queued}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Last generated</p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{formatDistance(reportsData.summary.lastGeneratedAt)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Recent reports</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Latest downloadable statements and snapshots.</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Updated {formatRelative(reportsData.summary.lastGeneratedAt)}</p>
            </div>

            <div className="space-y-3">
              {sortedReports.map((report) => (
                <div key={report.id} className="rounded-[18px] border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{report.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {report.period} • {report.size} • generated {formatDistance(report.generatedAt)}
                      </p>
                    </div>

                    <a
                      href={report.downloadUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {sortedReports.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                No reports are available yet.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
