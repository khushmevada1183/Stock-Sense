'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import * as stockApi from '@/api/api';

type IpoDetail = {
  id: string;
  symbol: string;
  companyName: string;
  status: string;
  priceMin?: number;
  priceMax?: number;
  issuePrice?: number;
  listingPrice?: number;
  listingGainsPercent?: number;
  biddingStartDate?: string;
  biddingEndDate?: string;
  listingDate?: string;
  lotSize?: number;
  issueSizeText?: string;
  isSme?: boolean;
};

type SubscriptionSnapshot = {
  snapshotDate?: string;
  totalSubscribed?: number;
  retailSubscribed?: number;
  niiSubscribed?: number;
  qibSubscribed?: number;
  employeeSubscribed?: number;
  updatedAt?: string;
};

type GmpSnapshot = {
  snapshotDate?: string;
  gmpPrice?: number;
  gmpPercent?: number;
  expectedListingPrice?: number;
  sentiment?: string;
  updatedAt?: string;
};

const UUID_REGEX = /^[0-9a-fA-F-]{36}$/;

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[₹,]/g, '').trim();
    if (!cleaned) {
      return undefined;
    }

    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const toText = (...values: unknown[]): string | undefined => {
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

const toTitleCase = (value: string): string => {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const toDateLabel = (value?: string): string => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const toCurrency = (value?: number): string => {
  if (value === undefined) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const toPercent = (value?: number): string => {
  if (value === undefined) {
    return 'N/A';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const statusClassMap: Record<string, string> = {
  upcoming: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  active: 'bg-green-500/15 text-green-300 border-green-500/30',
  listed: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  closed: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
};

const sentimentClassMap: Record<string, string> = {
  bullish: 'bg-green-500/15 text-green-300 border-green-500/30',
  positive: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  neutral: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  bearish: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const mergeCalendarEntries = (calendarData: unknown): Record<string, unknown>[] => {
  if (!calendarData || typeof calendarData !== 'object') {
    return [];
  }

  const data = calendarData as {
    entries?: unknown[];
    upcoming?: unknown[];
    active?: unknown[];
    listed?: unknown[];
    closed?: unknown[];
  };

  if (Array.isArray(data.entries)) {
    return data.entries as Record<string, unknown>[];
  }

  return [
    ...asArray<Record<string, unknown>>(data.upcoming),
    ...asArray<Record<string, unknown>>(data.active),
    ...asArray<Record<string, unknown>>(data.listed),
    ...asArray<Record<string, unknown>>(data.closed),
  ];
};

const normalizeIpo = (raw: unknown): IpoDetail | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const row = raw as Record<string, unknown>;
  const id = toText(row.id, row.externalKey);
  const symbol = toText(row.symbol)?.toUpperCase();
  const companyName = toText(row.companyName, row.company_name, row.name);

  if (!symbol || !companyName) {
    return null;
  }

  return {
    id: id || symbol,
    symbol,
    companyName,
    status: toText(row.status)?.toLowerCase() || 'upcoming',
    priceMin: toNumber(row.priceMin ?? row.min_price),
    priceMax: toNumber(row.priceMax ?? row.max_price),
    issuePrice: toNumber(row.issuePrice ?? row.issue_price),
    listingPrice: toNumber(row.listingPrice ?? row.listing_price),
    listingGainsPercent: toNumber(row.listingGainsPercent ?? row.listing_gains),
    biddingStartDate: toText(row.biddingStartDate, row.bidding_start_date),
    biddingEndDate: toText(row.biddingEndDate, row.bidding_end_date),
    listingDate: toText(row.listingDate, row.listing_date),
    lotSize: toNumber(row.lotSize ?? row.lot_size),
    issueSizeText: toText(row.issueSizeText, row.issue_size),
    isSme: Boolean(row.isSme ?? row.is_sme),
  };
};

const normalizeSubscription = (raw: unknown): SubscriptionSnapshot | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const row = raw as Record<string, unknown>;

  return {
    snapshotDate: toText(row.snapshotDate, row.snapshot_date),
    totalSubscribed: toNumber(row.totalSubscribed ?? row.total_subscribed),
    retailSubscribed: toNumber(row.retailSubscribed ?? row.retail_subscribed),
    niiSubscribed: toNumber(row.niiSubscribed ?? row.nii_subscribed),
    qibSubscribed: toNumber(row.qibSubscribed ?? row.qib_subscribed),
    employeeSubscribed: toNumber(row.employeeSubscribed ?? row.employee_subscribed),
    updatedAt: toText(row.updatedAt, row.updated_at),
  };
};

const normalizeGmp = (raw: unknown): GmpSnapshot | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const row = raw as Record<string, unknown>;

  return {
    snapshotDate: toText(row.snapshotDate, row.snapshot_date),
    gmpPrice: toNumber(row.gmpPrice ?? row.gmp_price),
    gmpPercent: toNumber(row.gmpPercent ?? row.gmp_percent),
    expectedListingPrice: toNumber(row.expectedListingPrice ?? row.expected_listing_price),
    sentiment: toText(row.sentiment)?.toLowerCase(),
    updatedAt: toText(row.updatedAt, row.updated_at),
  };
};

const formatSubscriptionRatio = (value?: number): string => {
  if (value === undefined) {
    return 'N/A';
  }

  return `${value.toFixed(2)}x`;
};

export default function IpoDetailPage() {
  const params = useParams<{ ipoId?: string }>();
  const routeParam = useMemo(() => decodeURIComponent(String(params?.ipoId || '').trim()), [params?.ipoId]);

  const [ipo, setIpo] = useState<IpoDetail | null>(null);
  const [resolvedIpoId, setResolvedIpoId] = useState<string | null>(null);
  const [subscriptionLatest, setSubscriptionLatest] = useState<SubscriptionSnapshot | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionSnapshot[]>([]);
  const [gmpLatest, setGmpLatest] = useState<GmpSnapshot | null>(null);
  const [gmpHistory, setGmpHistory] = useState<GmpSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIpoDetails = async () => {
    if (!routeParam) {
      setError('Missing IPO identifier in route.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const looksLikeUuid = UUID_REGEX.test(routeParam);
      let ipoDetail: IpoDetail | null = null;
      let ipoId: string | null = looksLikeUuid ? routeParam : null;
      let symbolHint = routeParam.toUpperCase();

      if (ipoId) {
        try {
          const ipoResponse = await stockApi.getIpoById(ipoId);
          ipoDetail = normalizeIpo((ipoResponse as { data?: { ipo?: unknown } })?.data?.ipo);
        } catch {
          ipoDetail = null;
        }
      }

      if (!ipoDetail) {
        const calendarResponse = await stockApi.getIPOCalendar({ grouped: false, limit: 500 });
        const calendarData = (calendarResponse as { data?: unknown })?.data;
        const entries = mergeCalendarEntries(calendarData);

        const match = entries.find((entry) => {
          const entryId = toText(entry.id);
          const entrySymbol = toText(entry.symbol)?.toUpperCase();
          return entryId === routeParam || entrySymbol === symbolHint;
        });

        ipoDetail = normalizeIpo(match || null);

        if (ipoDetail?.id && UUID_REGEX.test(ipoDetail.id)) {
          ipoId = ipoDetail.id;
        }

        if (ipoDetail?.symbol) {
          symbolHint = ipoDetail.symbol;
        }
      }

      if (!ipoDetail) {
        throw new Error('Unable to find IPO details for this identifier.');
      }

      if (ipoId) {
        try {
          const exactDetailResponse = await stockApi.getIpoById(ipoId);
          const exactDetail = normalizeIpo((exactDetailResponse as { data?: { ipo?: unknown } })?.data?.ipo);
          if (exactDetail) {
            ipoDetail = exactDetail;
          }
        } catch {
          // Keep the resolved detail from calendar.
        }
      }

      setIpo(ipoDetail);
      setResolvedIpoId(ipoId);

      let nextSubscriptionLatest: SubscriptionSnapshot | null = null;
      let nextSubscriptionHistory: SubscriptionSnapshot[] = [];
      let nextGmpLatest: GmpSnapshot | null = null;
      let nextGmpHistory: GmpSnapshot[] = [];

      if (ipoId) {
        const [subscriptionResult, gmpResult] = await Promise.allSettled([
          stockApi.getIpoSubscriptionHistory(ipoId, { limit: 12 }),
          stockApi.getIpoGmpHistory(ipoId, { limit: 12 }),
        ]);

        if (subscriptionResult.status === 'fulfilled') {
          const payload = (subscriptionResult.value as { data?: { latest?: unknown; history?: unknown[] } })?.data;
          nextSubscriptionLatest = normalizeSubscription(payload?.latest || null);
          nextSubscriptionHistory = asArray(payload?.history)
            .map((item) => normalizeSubscription(item))
            .filter((item): item is SubscriptionSnapshot => Boolean(item));
        }

        if (gmpResult.status === 'fulfilled') {
          const payload = (gmpResult.value as { data?: { latest?: unknown; history?: unknown[] } })?.data;
          nextGmpLatest = normalizeGmp(payload?.latest || null);
          nextGmpHistory = asArray(payload?.history)
            .map((item) => normalizeGmp(item))
            .filter((item): item is GmpSnapshot => Boolean(item));
        }
      }

      // If per-IPO history was unavailable, fallback to latest snapshot lists and filter by symbol/id.
      if (!nextSubscriptionLatest || nextSubscriptionHistory.length === 0) {
        const latestSubscriptionResponse = await stockApi.getIpoSubscriptionsLatest({ limit: 200 });
        const snapshots = asArray<Record<string, unknown>>(
          (latestSubscriptionResponse as { data?: { snapshots?: unknown[] } })?.data?.snapshots
        ).filter((item) => {
          const itemIpoId = toText(item.ipoId);
          const itemSymbol = toText(item.symbol)?.toUpperCase();
          return itemIpoId === ipoId || itemSymbol === symbolHint;
        });

        const normalized = snapshots
          .map((item) => normalizeSubscription(item))
          .filter((item): item is SubscriptionSnapshot => Boolean(item));

        if (!nextSubscriptionLatest) {
          nextSubscriptionLatest = normalized[0] || null;
        }

        if (nextSubscriptionHistory.length === 0) {
          nextSubscriptionHistory = normalized.slice(0, 10);
        }
      }

      if (!nextGmpLatest || nextGmpHistory.length === 0) {
        const latestGmpResponse = await stockApi.getIpoGmpLatest({ limit: 200 });
        const snapshots = asArray<Record<string, unknown>>(
          (latestGmpResponse as { data?: { snapshots?: unknown[] } })?.data?.snapshots
        ).filter((item) => {
          const itemIpoId = toText(item.ipoId);
          const itemSymbol = toText(item.symbol)?.toUpperCase();
          return itemIpoId === ipoId || itemSymbol === symbolHint;
        });

        const normalized = snapshots
          .map((item) => normalizeGmp(item))
          .filter((item): item is GmpSnapshot => Boolean(item));

        if (!nextGmpLatest) {
          nextGmpLatest = normalized[0] || null;
        }

        if (nextGmpHistory.length === 0) {
          nextGmpHistory = normalized.slice(0, 10);
        }
      }

      setSubscriptionLatest(nextSubscriptionLatest);
      setSubscriptionHistory(nextSubscriptionHistory);
      setGmpLatest(nextGmpLatest);
      setGmpHistory(nextGmpHistory);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load IPO details.');
      setIpo(null);
      setResolvedIpoId(null);
      setSubscriptionLatest(null);
      setSubscriptionHistory([]);
      setGmpLatest(null);
      setGmpHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIpoDetails();
  }, [routeParam]);

  const statusClass = statusClassMap[ipo?.status || 'upcoming'] || statusClassMap.upcoming;
  const sentimentClass = sentimentClassMap[gmpLatest?.sentiment || 'neutral'] || sentimentClassMap.neutral;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Link
          href="/ipo"
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to IPO List
        </Link>

        {loading ? (
          <div className="rounded-xl border border-gray-700/50 bg-gray-900/90 p-8 text-gray-300">
            Loading IPO details...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 space-y-4">
            <p className="text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => {
                void loadIpoDetails();
              }}
              className="inline-flex items-center gap-2 rounded-md bg-red-700 hover:bg-red-600 px-3 py-2 text-sm"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && ipo ? (
          <>
            <section className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/90 p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-400">IPO Detail</p>
                  <h1 className="text-3xl font-bold tracking-tight">{ipo.companyName}</h1>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                    <span className="font-mono">{ipo.symbol}</span>
                    {resolvedIpoId ? <span className="text-gray-500">ID: {resolvedIpoId}</span> : null}
                    {ipo.isSme ? (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                        SME
                      </span>
                    ) : null}
                  </div>
                </div>

                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                  {toTitleCase(ipo.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border border-gray-700/60 bg-gray-900/70 p-3">
                  <p className="text-xs text-gray-400">Price Band</p>
                  <p className="mt-1 text-sm font-semibold">
                    {ipo.priceMin !== undefined && ipo.priceMax !== undefined
                      ? `${toCurrency(ipo.priceMin)} - ${toCurrency(ipo.priceMax)}`
                      : toCurrency(ipo.issuePrice)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-700/60 bg-gray-900/70 p-3">
                  <p className="text-xs text-gray-400">Issue Size</p>
                  <p className="mt-1 text-sm font-semibold">{ipo.issueSizeText || 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-gray-700/60 bg-gray-900/70 p-3">
                  <p className="text-xs text-gray-400">Lot Size</p>
                  <p className="mt-1 text-sm font-semibold">{ipo.lotSize ? ipo.lotSize.toLocaleString('en-IN') : 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-gray-700/60 bg-gray-900/70 p-3">
                  <p className="text-xs text-gray-400">Listing Gain</p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      (ipo.listingGainsPercent || 0) > 0
                        ? 'text-green-300'
                        : (ipo.listingGainsPercent || 0) < 0
                          ? 'text-red-300'
                          : 'text-gray-200'
                    }`}
                  >
                    {toPercent(ipo.listingGainsPercent)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-gray-700/60 bg-gray-900/70 p-3">
                  <p className="text-xs text-gray-400">Open Date</p>
                  <p className="mt-1 font-medium">{toDateLabel(ipo.biddingStartDate)}</p>
                </div>
                <div className="rounded-lg border border-gray-700/60 bg-gray-900/70 p-3">
                  <p className="text-xs text-gray-400">Close Date</p>
                  <p className="mt-1 font-medium">{toDateLabel(ipo.biddingEndDate)}</p>
                </div>
                <div className="rounded-lg border border-gray-700/60 bg-gray-900/70 p-3">
                  <p className="text-xs text-gray-400">Listing Date</p>
                  <p className="mt-1 font-medium">{toDateLabel(ipo.listingDate)}</p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-700/50 bg-gray-900/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Subscription Snapshot</h2>
                  <span className="text-xs text-gray-400">
                    {toDateLabel(subscriptionLatest?.snapshotDate || subscriptionLatest?.updatedAt)}
                  </span>
                </div>

                {subscriptionLatest ? (
                  <>
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                      <p className="text-xs text-green-300">Total Subscription</p>
                      <p className="mt-1 text-2xl font-bold text-green-200">
                        {formatSubscriptionRatio(subscriptionLatest.totalSubscribed)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-gray-700/60 bg-gray-900/80 p-3">
                        <p className="text-xs text-gray-400">QIB</p>
                        <p className="mt-1 font-semibold">{formatSubscriptionRatio(subscriptionLatest.qibSubscribed)}</p>
                      </div>
                      <div className="rounded-lg border border-gray-700/60 bg-gray-900/80 p-3">
                        <p className="text-xs text-gray-400">NII</p>
                        <p className="mt-1 font-semibold">{formatSubscriptionRatio(subscriptionLatest.niiSubscribed)}</p>
                      </div>
                      <div className="rounded-lg border border-gray-700/60 bg-gray-900/80 p-3">
                        <p className="text-xs text-gray-400">Retail</p>
                        <p className="mt-1 font-semibold">{formatSubscriptionRatio(subscriptionLatest.retailSubscribed)}</p>
                      </div>
                      <div className="rounded-lg border border-gray-700/60 bg-gray-900/80 p-3">
                        <p className="text-xs text-gray-400">Employee</p>
                        <p className="mt-1 font-semibold">{formatSubscriptionRatio(subscriptionLatest.employeeSubscribed)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-gray-700/50 bg-gray-900/70 p-4 text-sm text-gray-300">
                    Subscription data is not available for this IPO yet.
                  </div>
                )}

                {subscriptionHistory.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-800/70 text-gray-300">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Total</th>
                          <th className="px-3 py-2 text-left">Retail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptionHistory.slice(0, 6).map((item, index) => (
                          <tr key={`${item.snapshotDate || 'sub'}-${index}`} className="border-t border-gray-800/80">
                            <td className="px-3 py-2 text-gray-300">{toDateLabel(item.snapshotDate || item.updatedAt)}</td>
                            <td className="px-3 py-2">{formatSubscriptionRatio(item.totalSubscribed)}</td>
                            <td className="px-3 py-2">{formatSubscriptionRatio(item.retailSubscribed)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-gray-700/50 bg-gray-900/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Grey Market Premium</h2>
                  <span className="text-xs text-gray-400">
                    {toDateLabel(gmpLatest?.snapshotDate || gmpLatest?.updatedAt)}
                  </span>
                </div>

                {gmpLatest ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-gray-700/60 bg-gray-900/80 p-3">
                        <p className="text-xs text-gray-400">GMP Price</p>
                        <p className="mt-1 text-xl font-semibold">{toCurrency(gmpLatest.gmpPrice)}</p>
                      </div>
                      <div className="rounded-lg border border-gray-700/60 bg-gray-900/80 p-3">
                        <p className="text-xs text-gray-400">Expected Listing Price</p>
                        <p className="mt-1 text-xl font-semibold">{toCurrency(gmpLatest.expectedListingPrice)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-md border border-gray-700/60 bg-gray-900/80 px-3 py-2 text-sm">
                        GMP Change: {toPercent(gmpLatest.gmpPercent)}
                      </span>
                      <span className={`rounded-md border px-3 py-2 text-sm ${sentimentClass}`}>
                        Sentiment: {toTitleCase(gmpLatest.sentiment || 'neutral')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-gray-700/50 bg-gray-900/70 p-4 text-sm text-gray-300">
                    GMP data is not available for this IPO yet.
                  </div>
                )}

                {gmpHistory.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-800/70 text-gray-300">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">GMP</th>
                          <th className="px-3 py-2 text-left">Percent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gmpHistory.slice(0, 6).map((item, index) => (
                          <tr key={`${item.snapshotDate || 'gmp'}-${index}`} className="border-t border-gray-800/80">
                            <td className="px-3 py-2 text-gray-300">{toDateLabel(item.snapshotDate || item.updatedAt)}</td>
                            <td className="px-3 py-2">{toCurrency(item.gmpPrice)}</td>
                            <td className="px-3 py-2">{toPercent(item.gmpPercent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
