'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, FileText, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import * as stockApi from '@/api/api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  EMPTY_IPO_SECTIONS,
  buildIpoOverview,
  daysUntil,
  formatCurrency,
  formatDateLabel,
  formatLotSize,
  formatPercent,
  formatPriceBand,
  formatRatio,
  formatTimestampLabel,
  getIpoStatusLabel,
  getIpoStatusTone,
  normalizeIpoCalendarSections,
  normalizeIpoEntry,
  type IpoCalendarEntry,
  type IpoCalendarSections,
} from '@/lib/ipo';
import { IpoEmptyState, IpoMetricCard, PremiumSection } from '@/components/ipo/IpoPanels';

type SubscriptionRow = {
  label: string;
  date?: string;
  retail?: number;
  qib?: number;
  nii?: number;
  total?: number;
  status?: string;
  note?: string;
};

type GmpRow = {
  label: string;
  date?: string;
  gmp?: number;
  issuePrice?: number;
  premiumPercent?: number;
  status?: string;
  note?: string;
};

const extractApiData = (response: unknown) => {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data?: unknown }).data;
  }

  return response;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 12000): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('IPO detail request timed out.'));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const toText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return undefined;
};

const toNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const cleaned = value.replace(/[₹,%x,]/g, '').trim();
      if (!cleaned) {
        continue;
      }

      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const collectRecords = (payload: unknown): unknown[] => {
  const data = extractApiData(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const record = data as Record<string, unknown>;
  const candidates: unknown[] = [];
  const objectKeys = ['data', 'ipo', 'item', 'result', 'record', 'details', 'info'];
  const arrayKeys = ['items', 'ipos', 'history', 'records', 'subscriptions', 'gmp', 'results'];

  for (const key of objectKeys) {
    const value = record[key];
    if (value !== undefined && value !== null) {
      candidates.push(value);
    }
  }

  for (const key of arrayKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      candidates.push(...value);
    }
  }

  return candidates.length > 0 ? candidates : [data];
};

const mergeEntries = (primary: IpoCalendarEntry | null, fallback: IpoCalendarEntry | null) => {
  if (primary && fallback) {
    return { ...fallback, ...primary };
  }

  return primary || fallback || null;
};

const findCalendarEntry = (sections: IpoCalendarSections, ipoId: string) => {
  const normalizedId = ipoId.trim().toLowerCase();
  const allEntries = [...sections.upcoming, ...sections.active, ...sections.listed, ...sections.closed];

  return allEntries.find((entry) => {
    const entryId = String(entry.id || '').trim().toLowerCase();
    const entrySymbol = String(entry.symbol || '').trim().toLowerCase();
    return entryId === normalizedId || entrySymbol === normalizedId;
  }) || null;
};

const normalizeIpoDetail = (payload: unknown, ipoId: string) => {
  const normalizedId = ipoId.trim().toLowerCase();
  const candidates = collectRecords(payload)
    .map((item) => normalizeIpoEntry(item))
    .filter((item): item is IpoCalendarEntry => Boolean(item));

  return candidates.find((entry) => {
    const entryId = String(entry.id || '').trim().toLowerCase();
    const entrySymbol = String(entry.symbol || '').trim().toLowerCase();
    return entryId === normalizedId || entrySymbol === normalizedId;
  }) || candidates[0] || null;
};

const normalizeSubscriptionRows = (payload: unknown): SubscriptionRow[] => {
  return collectRecords(payload).flatMap((item, index) => {
    if (!isRecord(item)) {
      return [];
    }

    const row = item as Record<string, unknown>;
    const normalized: SubscriptionRow = {
      label: toText(row.companyName, row.company_name, row.name, row.symbol, row.ipoName, row.ipo_name) || `Snapshot ${index + 1}`,
      date: toText(row.date, row.createdAt, row.created_at, row.timestamp, row.updatedAt, row.updated_at),
      retail: toNumber(row.retail, row.retail_subscription, row.retail_sub, row.retailPercent, row.retail_percent),
      qib: toNumber(row.qib, row.qib_subscription, row.qib_sub, row.qibPercent, row.qib_percent),
      nii: toNumber(row.nii, row.nii_subscription, row.nii_sub, row.niiPercent, row.nii_percent),
      total: toNumber(row.total, row.subscription, row.total_subscription, row.overall, row.aggregate),
      status: toText(row.status, row.stage),
      note: toText(row.note, row.message, row.comment),
    };

    return [normalized];
  });
};

const normalizeGmpRows = (payload: unknown): GmpRow[] => {
  return collectRecords(payload).flatMap((item, index) => {
    if (!isRecord(item)) {
      return [];
    }

    const row = item as Record<string, unknown>;
    const gmp = toNumber(row.gmp, row.gray_market_premium, row.premium, row.amount);
    const issuePrice = toNumber(row.issuePrice, row.issue_price, row.price, row.issue);
    const premiumPercent =
      toNumber(row.premiumPercent, row.premium_percent, row.percent, row.changePercent, row.change_percent) ??
      (gmp !== undefined && issuePrice ? (gmp / issuePrice) * 100 : undefined);
    const normalized: GmpRow = {
      label: toText(row.companyName, row.company_name, row.name, row.symbol, row.ipoName, row.ipo_name) || `GMP ${index + 1}`,
      date: toText(row.date, row.createdAt, row.created_at, row.timestamp, row.updatedAt, row.updated_at),
      gmp,
      issuePrice,
      premiumPercent,
      status: toText(row.status, row.stage),
      note: toText(row.note, row.message, row.comment),
    };

    return [normalized];
  });
};

const formatWindowLabel = (ipo: IpoCalendarEntry | null) => {
  if (!ipo) {
    return 'Awaiting IPO data';
  }

  if (ipo.status === 'upcoming') {
    return ipo.biddingStartDate ? `Opens ${formatDateLabel(ipo.biddingStartDate)}` : 'Opening soon';
  }

  if (ipo.status === 'active') {
    return ipo.biddingEndDate ? `Closes ${formatDateLabel(ipo.biddingEndDate)}` : 'Open now';
  }

  if (ipo.status === 'listed') {
    return ipo.listingDate ? `Listed ${formatDateLabel(ipo.listingDate)}` : 'Recently listed';
  }

  return ipo.listingDate ? `Archived ${formatDateLabel(ipo.listingDate)}` : 'Archived';
};

export default function IpoDetailPage() {
  const routeParams = useParams<{ ipoId: string }>();
  const ipoId = String(routeParams?.ipoId || '').trim();
  const [detailSource, setDetailSource] = useState<unknown>(null);
  const [calendarSections, setCalendarSections] = useState<IpoCalendarSections>(EMPTY_IPO_SECTIONS);
  const [entry, setEntry] = useState<IpoCalendarEntry | null>(null);
  const [subscriptionLatest, setSubscriptionLatest] = useState<SubscriptionRow[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionRow[]>([]);
  const [gmpLatest, setGmpLatest] = useState<GmpRow[]>([]);
  const [gmpHistory, setGmpHistory] = useState<GmpRow[]>([]);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [gmpError, setGmpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadIpoDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSubscriptionError(null);
    setGmpError(null);

    try {
      const [detailResult, calendarResult, subscriptionLatestResult, subscriptionHistoryResult, gmpLatestResult, gmpHistoryResult] =
        await Promise.allSettled([
          withTimeout(stockApi.getIpoById(ipoId)),
          withTimeout(stockApi.getIPOCalendar()),
          withTimeout(stockApi.getIpoSubscriptionsLatest()),
          withTimeout(stockApi.getIpoSubscriptionHistory(ipoId)),
          withTimeout(stockApi.getIpoGmpLatest()),
          withTimeout(stockApi.getIpoGmpHistory(ipoId)),
        ]);

      const detailPayload = detailResult.status === 'fulfilled' ? extractApiData(detailResult.value) : null;
      const calendarPayload = calendarResult.status === 'fulfilled' ? extractApiData(calendarResult.value) : null;
      const normalizedCalendarSections = normalizeIpoCalendarSections(calendarPayload);
      const calendarMatch = findCalendarEntry(normalizedCalendarSections, ipoId);
      const detailMatch = normalizeIpoDetail(detailPayload, ipoId);
      const mergedEntry = mergeEntries(detailMatch, calendarMatch);

      setDetailSource(detailPayload);
      setCalendarSections(normalizedCalendarSections);
      setEntry(mergedEntry);
      setSubscriptionLatest(subscriptionLatestResult.status === 'fulfilled' ? normalizeSubscriptionRows(subscriptionLatestResult.value) : []);
      setSubscriptionHistory(subscriptionHistoryResult.status === 'fulfilled' ? normalizeSubscriptionRows(subscriptionHistoryResult.value) : []);
      setGmpLatest(gmpLatestResult.status === 'fulfilled' ? normalizeGmpRows(gmpLatestResult.value) : []);
      setGmpHistory(gmpHistoryResult.status === 'fulfilled' ? normalizeGmpRows(gmpHistoryResult.value) : []);
      setSubscriptionError(
        subscriptionLatestResult.status === 'rejected' || subscriptionHistoryResult.status === 'rejected'
          ? 'Subscription snapshots are partially unavailable from the live API.'
          : null
      );
      setGmpError(
        gmpLatestResult.status === 'rejected' || gmpHistoryResult.status === 'rejected'
          ? 'GMP snapshots are partially unavailable from the live API.'
          : null
      );

      if (!mergedEntry) {
        setError('Unable to locate IPO details for this route.');
      }

      setLastUpdated(new Date().toISOString());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load IPO details right now.');
      setEntry(null);
      setCalendarSections({ ...EMPTY_IPO_SECTIONS });
    } finally {
      setLoading(false);
    }
  }, [ipoId]);

  useEffect(() => {
    void loadIpoDetail();
  }, [loadIpoDetail]);

  const overview = useMemo(() => buildIpoOverview(calendarSections), [calendarSections]);
  const statusLabel = getIpoStatusLabel(entry?.status);
  const statusTone = getIpoStatusTone(entry?.status);
  const statusClass =
    statusTone === 'emerald'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : statusTone === 'amber'
        ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : statusTone === 'sky'
          ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300'
          : 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300';
  const windowLabel = formatWindowLabel(entry);
  const primaryDocumentUrl = toText(
    detailSource && isRecord(detailSource) ? detailSource.documentUrl : undefined,
    detailSource && isRecord(detailSource) ? detailSource.document_url : undefined,
    detailSource && isRecord(detailSource) ? detailSource.rhpLink : undefined,
    detailSource && isRecord(detailSource) ? detailSource.rhp_link : undefined,
    detailSource && isRecord(detailSource) ? detailSource.drhpLink : undefined,
    detailSource && isRecord(detailSource) ? detailSource.drhp_link : undefined
  );
  const detailCards = [
    {
      label: 'Price band',
      value: entry ? formatPriceBand(entry) : 'N/A',
      hint: 'Live issue range from the calendar',
      tone: 'sky' as const,
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      label: 'Issue size',
      value: entry?.issueSizeText || 'TBA',
      hint: entry?.issueType || 'Public offer',
      tone: 'emerald' as const,
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: 'Lot size',
      value: formatLotSize(entry?.lotSize),
      hint: windowLabel,
      tone: 'amber' as const,
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      label: 'Listing date',
      value: formatDateLabel(entry?.listingDate),
      hint: lastUpdated ? `Updated ${formatTimestampLabel(lastUpdated)}` : 'Awaiting refresh',
      tone: 'slate' as const,
      icon: <Clock3 className="h-5 w-5" />,
    },
  ];
  const subscriptionRows = subscriptionHistory.length > 0 ? subscriptionHistory : subscriptionLatest;
  const gmpRows = gmpHistory.length > 0 ? gmpHistory : gmpLatest;
  const subscriptionHighlight = subscriptionLatest[0] || subscriptionHistory[0] || null;
  const gmpHighlight = gmpLatest[0] || gmpHistory[0] || null;

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="premium-shell h-[24rem] animate-pulse p-6 sm:p-8 lg:p-10" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="premium-card h-28 animate-pulse" />
            <div className="premium-card h-28 animate-pulse" />
            <div className="premium-card h-28 animate-pulse sm:col-span-2 xl:col-span-1" />
            <div className="premium-card h-28 animate-pulse sm:col-span-2 xl:col-span-1" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="premium-card h-72 animate-pulse" />
          <div className="premium-card h-72 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!entry && error) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-red-500/20 bg-red-500/[0.04]">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-200">IPO detail unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <p className="max-w-3xl text-sm leading-6 text-[color:var(--app-text-2)]">{error}</p>
            <Button asChild variant="outline">
              <Link href="/ipo">
                <ArrowLeft className="h-4 w-4" />
                Back to IPO calendar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="premium-shell relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-8 translate-x-12 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-sky-500/10 blur-3xl" aria-hidden="true" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--app-text-3)]">
              <Link href="/ipo" className="inline-flex items-center gap-2 transition-colors hover:text-[color:var(--app-text-1)]">
                <ArrowLeft className="h-4 w-4" />
                IPO calendar
              </Link>
              <span>·</span>
              <span>{entry?.symbol || ipoId}</span>
              <Badge variant="outline" className={statusClass}>
                {statusLabel}
              </Badge>
              {entry?.isSme ? (
                <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  SME
                </Badge>
              ) : null}
            </div>

            <div className="max-w-3xl space-y-4">
              <p className="premium-kicker">IPO Detail</p>
              <h1 className="premium-title">{entry?.companyName || ipoId}</h1>
              <p className="premium-subtitle">
                {entry
                  ? `The live API resolves this issue into a compact detail view with offer timing, subscription snapshots, and GMP history.`
                  : 'The live API could not resolve this issue yet, but the page still retains the calendar context and retry controls.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="#offer-details" className="premium-chip">
                Offer details <span className="font-mono text-[10px] tracking-[0.14em]">{overview.total}</span>
              </Link>
              <Link href="#subscription" className="premium-chip">
                Subscription <span className="font-mono text-[10px] tracking-[0.14em]">{subscriptionRows.length}</span>
              </Link>
              <Link href="#gmp" className="premium-chip">
                GMP <span className="font-mono text-[10px] tracking-[0.14em]">{gmpRows.length}</span>
              </Link>
              <span className="premium-chip">
                {windowLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--app-text-3)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2">
                <Sparkles className="h-4 w-4 text-[color:var(--app-accent-strong)]" />
                Live IPO detail
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2">
                <Clock3 className="h-4 w-4 text-[color:var(--app-accent-strong)]" />
                Updated {lastUpdated ? formatTimestampLabel(lastUpdated) : 'just now'}
              </span>
              <Button onClick={() => void loadIpoDetail()} variant="outline" size="sm" className="ml-0 sm:ml-auto">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {detailCards.map((card) => (
            <IpoMetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
              tone={card.tone}
              icon={card.icon}
            />
          ))}
        </div>
      </section>

      {error ? (
        <Card className="border-red-500/20 bg-red-500/[0.04]">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-200">Primary IPO response unavailable</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="max-w-4xl text-sm leading-6 text-[color:var(--app-text-2)]">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card id="offer-details" className="premium-card">
          <CardHeader>
            <CardDescription className="premium-kicker">Offer</CardDescription>
            <CardTitle className="text-2xl tracking-[-0.03em] text-[color:var(--app-text-1)]">Issue overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ['Price band', entry ? formatPriceBand(entry) : 'N/A'],
              ['Issue size', entry?.issueSizeText || 'TBA'],
              ['Lot size', formatLotSize(entry?.lotSize)],
              ['Issue type', entry?.issueType || 'Book built'],
              ['Bidding window', formatWindowLabel(entry)],
              ['Listing date', formatDateLabel(entry?.listingDate)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-4">
                <p className="premium-label">{label}</p>
                <p className="mt-2 text-sm font-medium text-[color:var(--app-text-1)]">{value}</p>
              </div>
            ))}

            {entry?.additionalText ? (
              <div className="sm:col-span-2 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-4 text-sm leading-6 text-[color:var(--app-text-2)]">
                {entry.additionalText}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="premium-kicker">Context</CardDescription>
            <CardTitle className="text-2xl tracking-[-0.03em] text-[color:var(--app-text-1)]">Calendar and documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-4">
                <p className="premium-label">Calendar buckets</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--app-text-1)]">{overview.total}</p>
                <p className="mt-1 text-xs text-[color:var(--app-text-3)]">Loaded from the live API</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-4">
                <p className="premium-label">Days away</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--app-text-1)]">
                  {daysUntil(entry?.listingDate) ?? daysUntil(entry?.biddingStartDate) ?? 'N/A'}
                </p>
                <p className="mt-1 text-xs text-[color:var(--app-text-3)]">Relative to the next event</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="premium-label">Documents</p>
              <div className="flex flex-wrap gap-3">
                {primaryDocumentUrl ? (
                  <Button asChild variant="outline">
                    <a href={primaryDocumentUrl} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4" />
                      Prospectus
                    </a>
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link href="/ipo">
                    <ArrowLeft className="h-4 w-4" />
                    Back to calendar
                  </Link>
                </Button>
              </div>
            </div>

            {subscriptionError || gmpError ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-sm leading-6 text-[color:var(--app-text-2)]">
                {subscriptionError || gmpError}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <PremiumSection
        id="subscription"
        eyebrow="Subscription"
        title="Subscription snapshots"
        description="Latest data and historical snapshots are kept side by side so the trend remains legible without leaving the page."
      >
        {subscriptionRows.length > 0 || subscriptionHighlight ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <Card>
              <CardHeader>
                <CardDescription className="premium-kicker">Latest snapshot</CardDescription>
                <CardTitle className="text-xl tracking-[-0.03em] text-[color:var(--app-text-1)]">
                  {subscriptionHighlight?.label || 'Subscription summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscriptionHighlight ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Retail', formatRatio(subscriptionHighlight.retail)],
                        ['QIB', formatRatio(subscriptionHighlight.qib)],
                        ['NII', formatRatio(subscriptionHighlight.nii)],
                        ['Total', formatRatio(subscriptionHighlight.total)],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-3">
                          <p className="premium-label">{label}</p>
                          <p className="mt-2 text-sm font-medium text-[color:var(--app-text-1)]">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-4 text-sm leading-6 text-[color:var(--app-text-2)]">
                      <p className="font-medium text-[color:var(--app-text-1)]">{subscriptionHighlight.date ? formatDateLabel(subscriptionHighlight.date) : 'N/A'}</p>
                      {subscriptionHighlight.note ? <p className="mt-2">{subscriptionHighlight.note}</p> : null}
                    </div>
                  </>
                ) : (
                  <IpoEmptyState
                    title="Subscription snapshots unavailable"
                    description="The subscription API did not return a usable snapshot for this IPO yet."
                    className="border-0 shadow-none"
                  />
                )}
              </CardContent>
            </Card>

            <div className="premium-table-shell">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Snapshot</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Retail</TableHead>
                    <TableHead>QIB</TableHead>
                    <TableHead>NII</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionRows.map((row) => (
                    <TableRow key={`${row.label}-${row.date || 'latest'}`}>
                      <TableCell className="font-medium text-[color:var(--app-text-1)]">{row.label}</TableCell>
                      <TableCell>{row.date ? formatDateLabel(row.date) : 'N/A'}</TableCell>
                      <TableCell>{formatRatio(row.retail)}</TableCell>
                      <TableCell>{formatRatio(row.qib)}</TableCell>
                      <TableCell>{formatRatio(row.nii)}</TableCell>
                      <TableCell>{formatRatio(row.total)}</TableCell>
                      <TableCell>{row.status || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <IpoEmptyState
            title="No subscription snapshots available"
            description="The live subscription APIs did not return data for this IPO yet."
            icon={<TrendingUp className="h-5 w-5" />}
          />
        )}
      </PremiumSection>

      <PremiumSection
        id="gmp"
        eyebrow="GMP"
        title="Grey market premium"
        description="GMP history is rendered against the same API-backed row structure so market sentiment stays easy to read."
      >
        {gmpRows.length > 0 || gmpHighlight ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <Card>
              <CardHeader>
                <CardDescription className="premium-kicker">Latest GMP</CardDescription>
                <CardTitle className="text-xl tracking-[-0.03em] text-[color:var(--app-text-1)]">{gmpHighlight?.label || 'GMP summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gmpHighlight ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['GMP', formatCurrency(gmpHighlight.gmp)],
                        ['Issue price', formatCurrency(gmpHighlight.issuePrice)],
                        ['Premium', formatPercent(gmpHighlight.premiumPercent)],
                        [
                          'Indicative listing',
                          gmpHighlight.gmp !== undefined && gmpHighlight.issuePrice !== undefined
                            ? formatCurrency(gmpHighlight.gmp + gmpHighlight.issuePrice)
                            : 'N/A',
                        ],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-3">
                          <p className="premium-label">{label}</p>
                          <p className="mt-2 text-sm font-medium text-[color:var(--app-text-1)]">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-4 text-sm leading-6 text-[color:var(--app-text-2)]">
                      <p className="font-medium text-[color:var(--app-text-1)]">{gmpHighlight.date ? formatDateLabel(gmpHighlight.date) : 'N/A'}</p>
                      {gmpHighlight.note ? <p className="mt-2">{gmpHighlight.note}</p> : null}
                    </div>
                  </>
                ) : (
                  <IpoEmptyState
                    title="GMP snapshots unavailable"
                    description="The live GMP API did not return a usable row for this IPO yet."
                    className="border-0 shadow-none"
                  />
                )}
              </CardContent>
            </Card>

            <div className="premium-table-shell">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Snapshot</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>GMP</TableHead>
                    <TableHead>Issue price</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gmpRows.map((row) => (
                    <TableRow key={`${row.label}-${row.date || 'latest'}`}>
                      <TableCell className="font-medium text-[color:var(--app-text-1)]">{row.label}</TableCell>
                      <TableCell>{row.date ? formatDateLabel(row.date) : 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(row.gmp)}</TableCell>
                      <TableCell>{formatCurrency(row.issuePrice)}</TableCell>
                      <TableCell>{formatPercent(row.premiumPercent)}</TableCell>
                      <TableCell>{row.status || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <IpoEmptyState
            title="No GMP snapshots available"
            description="The live GMP APIs did not return data for this IPO yet."
            icon={<Sparkles className="h-5 w-5" />}
          />
        )}
      </PremiumSection>

      <PremiumSection
        id="faq"
        eyebrow="FAQ"
        title="IPO notes"
        description="A short reminder of the practical checks investors usually make before submitting a bid."
      >
        <div className="premium-panel overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                question: 'What should I check before applying?',
                answer:
                  'Review the price band, lot size, issue type, prospectus, and the final subscription trend before placing a bid.',
              },
              {
                question: 'Where do I find the official documents?',
                answer:
                  'The prospectus button in the documents card opens the live document URL returned by the IPO API when it is available.',
              },
              {
                question: 'What does GMP indicate?',
                answer:
                  'Grey market premium is a sentiment indicator. It is not a guarantee of listing gains and should be used with the rest of the issue data.',
              },
            ].map((item, index) => (
              <AccordionItem key={item.question} value={`note-${index}`}>
                <AccordionTrigger className="px-5 py-4 text-left text-[color:var(--app-text-1)] hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-sm leading-6 text-[color:var(--app-text-2)]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </PremiumSection>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-4 text-sm text-[color:var(--app-text-3)] shadow-[var(--app-shadow)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--app-accent-strong)]" />
          <span>
            Live API route: {overview.total} IPO buckets loaded across the calendar, plus subscription and GMP detail endpoints.
          </span>
        </div>
        <Button asChild variant="outline">
          <Link href="/ipo">
            <ArrowLeft className="h-4 w-4" />
            Back to IPO calendar
          </Link>
        </Button>
      </section>
    </main>
  );
}