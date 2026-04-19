'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Filter, RefreshCw, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { getSettingsSuspiciousActivity, type SuspiciousActivityEvent } from '@/lib/api';

const formatRelative = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
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

  return `${Math.round(hours / 24)}d ago`;
};

const severityStyles: Record<SuspiciousActivityEvent['severity'], string> = {
  high: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200',
  medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200',
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200',
};

const statusStyles: Record<SuspiciousActivityEvent['status'], string> = {
  open: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200',
  reviewed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200',
  blocked: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200',
};

export default function SuspiciousActivity() {
  const query = useQuery({
    queryKey: ['settings', 'suspicious-activity'],
    queryFn: getSettingsSuspiciousActivity,
  });

  const [severityFilter, setSeverityFilter] = useState<'all' | SuspiciousActivityEvent['severity']>('all');

  const data = query.data?.data;

  const filteredEvents = useMemo(() => {
    const events = data?.events || [];
    if (severityFilter === 'all') {
      return events;
    }

    return events.filter((event) => event.severity === severityFilter);
  }, [data?.events, severityFilter]);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-32 w-full rounded-[18px]" />
        <LoadingSkeleton className="h-64 w-full rounded-[20px]" />
      </div>
    );
  }

  if (query.isError || !data) {
    return <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">Failed to load suspicious activity.</div>;
  }

  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="mt-0 text-xl text-slate-950 dark:text-white">Suspicious activity</CardTitle>
            <CardDescription className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Review recent security signals, session anomalies, and sign-in warnings from your account.
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
          <SummaryTile label="Total alerts" value={data.summary.total} tone="text-slate-950 dark:text-white" />
          <SummaryTile label="High severity" value={data.summary.high} tone="text-rose-700 dark:text-rose-300" />
          <SummaryTile label="Medium severity" value={data.summary.medium} tone="text-amber-700 dark:text-amber-300" />
          <SummaryTile label="Low severity" value={data.summary.low} tone="text-emerald-700 dark:text-emerald-300" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </span>
          {(['all', 'high', 'medium', 'low'] as const).map((severity) => {
            const active = severityFilter === severity;
            return (
              <button
                key={severity}
                type="button"
                onClick={() => setSeverityFilter(severity)}
                className={`border-b-2 px-0 py-1 text-sm font-medium transition ${
                  active
                    ? 'border-emerald-500 text-slate-950 dark:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {severity}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="rounded-[18px] border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${severityStyles[event.severity]}`}>
                    {event.severity === 'high' ? <AlertTriangle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{event.title}</h3>

                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {event.severity} • {event.status}
                    </p>

                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{event.description}</p>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                      {event.location} • {event.ipAddress} • {event.device}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">{formatRelative(event.timestamp)}</p>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No alerts match the selected filter.
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-[18px] border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-400/20 dark:bg-cyan-400/10">
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-200">
            <CheckCircle2 className="h-4 w-4" />
            Security note
          </div>
          <p className="mt-1.5 text-sm leading-6 text-cyan-700 dark:text-cyan-100">
            If you do not recognize a session or location, log out the device and update your password immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type SummaryTileProps = {
  label: string;
  value: number;
  tone: string;
};

function SummaryTile({ label, value, tone }: SummaryTileProps) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
