"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Activity,
  BarChart3,
  Download,
  Eye,
  IndianRupee,
  Plus,
  PieChart,
  RefreshCw,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import * as stockApi from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';

interface PortfolioHolding {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent?: number;
  quantity: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
  pe?: number;
}

interface SectorAllocation {
  name: string;
  percentage: number;
}

interface PortfolioSummary {
  totalValue?: number;
  totalProfitLoss?: number;
  totalProfitLossPercent?: number;
  dayGain?: number;
  dayGainPercent?: number;
  riskProfile?: string;
  valuationScore?: number;
  sectorAllocation?: SectorAllocation[];
}

interface PortfolioPerformancePoint {
  [key: string]: unknown;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number | undefined): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '0.00%';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const formatLargeNumber = (value: number): string => {
  const absoluteValue = Math.abs(value);
  let formattedValue: string;

  if (absoluteValue >= 10000000) {
    formattedValue = `₹${(absoluteValue / 10000000).toFixed(2)}Cr`;
  } else if (absoluteValue >= 100000) {
    formattedValue = `₹${(absoluteValue / 100000).toFixed(2)}L`;
  } else if (absoluteValue >= 1000) {
    formattedValue = `₹${(absoluteValue / 1000).toFixed(2)}K`;
  } else {
    formattedValue = formatCurrency(absoluteValue);
  }

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const panelShellClass =
  'dashboard-card rounded-[28px] border border-slate-200/80 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)]';

const insetPanelClass =
  'rounded-[24px] border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5';

const extractPerformanceValue = (point: PortfolioPerformancePoint, index: number): number => {
  const record = point as Record<string, unknown>;
  const candidateKeys = ['value', 'portfolioValue', 'nav', 'amount', 'equity', 'close', 'price', 'xirr', 'y', 'performance'];

  for (const key of candidateKeys) {
    const candidate = record[key];

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }

    if (typeof candidate === 'string') {
      const numericCandidate = Number(candidate);
      if (candidate.trim() !== '' && Number.isFinite(numericCandidate)) {
        return numericCandidate;
      }
    }
  }

  const firstNumeric = Object.values(record).find((candidate): candidate is number => typeof candidate === 'number' && Number.isFinite(candidate));

  return firstNumeric ?? index + 1;
};

const buildPerformanceChart = (values: number[], hasData: boolean) => {
  const series = values.length > 1 ? values : [12, 18, 16, 24, 30, 28, 34];
  const width = 320;
  const height = 160;
  const paddingX = 14;
  const paddingY = 14;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const minValue = Math.min(...series);
  const maxValue = Math.max(...series);
  const range = maxValue - minValue || 1;

  const chartPoints = series.map((value, index) => {
    const x = paddingX + (chartWidth * index) / Math.max(series.length - 1, 1);
    const y = height - paddingY - ((value - minValue) / range) * chartHeight;
    return { x, y };
  });

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;
  const trend = series[series.length - 1] - series[0];
  const latestValue = series[series.length - 1];

  return {
    linePath,
    areaPath,
    chartPoints,
    hasData,
    trend,
    latestValue,
  };
};

const PortfolioDashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [performancePoints, setPerformancePoints] = useState<PortfolioPerformancePoint[]>([]);
  const [xirrValue, setXirrValue] = useState<number | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionSymbol, setTransactionSymbol] = useState('');
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [transactionQuantity, setTransactionQuantity] = useState('1');
  const [transactionPrice, setTransactionPrice] = useState('0');
  const [submittingTransaction, setSubmittingTransaction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchPortfolioData = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setAuthRequired(true);
      setApiMessage('Please log in to access portfolio analytics.');
      setHoldings([]);
      setSummary(null);
      setSelectedPortfolioId('');
      setPerformancePoints([]);
      setXirrValue(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const userPortfoliosResponse = await stockApi.getUserPortfolios();
      const portfolios = Array.isArray(userPortfoliosResponse?.portfolios)
        ? userPortfoliosResponse.portfolios as Array<Record<string, unknown>>
        : [];

      const primaryPortfolioId = String(
        portfolios[0]?.id || portfolios[0]?.portfolioId || portfolios[0]?.uuid || ''
      );

      setSelectedPortfolioId(primaryPortfolioId);

      const [holdingsData, summaryData, performanceData, xirrData] = await Promise.all([
        stockApi.getPortfolioHoldings(undefined, primaryPortfolioId || null),
        stockApi.getPortfolioSummary(undefined, primaryPortfolioId || null),
        stockApi.getPortfolioPerformance(undefined, primaryPortfolioId || null),
        stockApi.getPortfolioXirr(undefined, primaryPortfolioId || null),
      ]);

      setHoldings(Array.isArray(holdingsData.holdings) ? holdingsData.holdings as PortfolioHolding[] : []);
      setSummary(summaryData.summary ? summaryData.summary as PortfolioSummary : null);

      const performancePayload = (performanceData as { performance?: unknown })?.performance;
      setPerformancePoints(Array.isArray(performancePayload) ? performancePayload as PortfolioPerformancePoint[] : []);

      const rawXirr = (xirrData as { xirr?: unknown })?.xirr;
      const numericXirr = Number(
        (rawXirr && typeof rawXirr === 'object'
          ? (rawXirr as Record<string, unknown>).value || (rawXirr as Record<string, unknown>).xirr
          : rawXirr) ?? NaN
      );
      setXirrValue(Number.isFinite(numericXirr) ? numericXirr : null);
      setAuthRequired(false);
      setApiMessage('');
    } catch (error) {
      console.error('Error fetching portfolio data:', error);

      const message = error instanceof Error ? error.message : 'Failed to load portfolio analytics endpoints.';
      const statusCode =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: unknown }).status)
          : NaN;

      const unauthorized =
        statusCode === 401 ||
        /unauthorized|authorization bearer token is required|token/i.test(message);

      setAuthRequired(unauthorized);
      setApiMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const handleExport = async () => {
    if (!selectedPortfolioId) {
      setApiMessage('No portfolio selected for export.');
      return;
    }

    try {
      const exportResponse = await stockApi.getPortfolioExport(selectedPortfolioId);
      const payload = exportResponse?.exportData || exportResponse;
      const csvPayload = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
      const blob = new Blob([csvPayload], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio-${selectedPortfolioId}-export.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setApiMessage('Portfolio export downloaded successfully.');
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : 'Failed to export portfolio data.');
    }
  };

  const handleAddTransaction = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPortfolioId) {
      setApiMessage('No portfolio selected for transaction.');
      return;
    }

    if (!transactionSymbol.trim() || Number(transactionQuantity) <= 0 || Number(transactionPrice) <= 0) {
      setApiMessage('Enter symbol, quantity, and price before submitting transaction.');
      return;
    }

    try {
      setSubmittingTransaction(true);
      await stockApi.addPortfolioTransaction(selectedPortfolioId, {
        symbol: transactionSymbol.trim().toUpperCase(),
        transactionType,
        quantity: Number(transactionQuantity),
        price: Number(transactionPrice),
        executedAt: new Date().toISOString(),
      });

      setTransactionSymbol('');
      setTransactionQuantity('1');
      setTransactionPrice('0');
      setApiMessage('Transaction submitted successfully.');
      await fetchPortfolioData();
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : 'Failed to add transaction.');
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const { subscribePortfolio, unsubscribePortfolio } = useWebSocket({
    onPortfolioUpdate: (payload) => {
      const eventPortfolioId = String((payload as { portfolioId?: string })?.portfolioId || '').trim();
      if (eventPortfolioId && selectedPortfolioId && eventPortfolioId !== selectedPortfolioId) {
        return;
      }

      void fetchPortfolioData();
    },
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void fetchPortfolioData();
  }, [authLoading, fetchPortfolioData]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !selectedPortfolioId) {
      return;
    }

    subscribePortfolio(selectedPortfolioId);
    return () => {
      unsubscribePortfolio(selectedPortfolioId);
    };
  }, [authLoading, isAuthenticated, selectedPortfolioId, subscribePortfolio, unsubscribePortfolio]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const interval = window.setInterval(() => {
      void fetchPortfolioData();
    }, 60000);

    return () => {
      window.clearInterval(interval);
    };
  }, [authLoading, isAuthenticated, fetchPortfolioData]);

  useEffect(() => {
    if (!isLoading && dashboardRef.current) {
      const cards = dashboardRef.current.querySelectorAll('.dashboard-card');

      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100 * index);
      });
    }
  }, [isLoading]);

  const totalValue = summary?.totalValue || 0;
  const totalProfitLoss = summary?.totalProfitLoss || 0;
  const dayGain = summary?.dayGain || 0;
  const holdingsCount = Array.isArray(holdings) ? holdings.length : 0;
  const xirrDisplay = xirrValue === null ? 'n/a' : `${xirrValue.toFixed(2)}%`;
  const selectedPortfolioLabel = selectedPortfolioId
    ? selectedPortfolioId.length > 16
      ? `${selectedPortfolioId.slice(0, 8)}…${selectedPortfolioId.slice(-4)}`
      : selectedPortfolioId
    : 'n/a';
  const allocationItems = Array.isArray(summary?.sectorAllocation) ? summary.sectorAllocation.slice(0, 3) : [];
  const performanceValues = useMemo(() => {
    const extractedValues = performancePoints.map((point, index) => extractPerformanceValue(point, index)).filter((value) => Number.isFinite(value));
    return extractedValues.length > 1 ? extractedValues : [12, 18, 16, 24, 30, 28, 34];
  }, [performancePoints]);
  const performanceChart = useMemo(
    () => buildPerformanceChart(performanceValues, performancePoints.length > 1),
    [performanceValues, performancePoints.length]
  );
  const riskMarkerPosition = summary?.riskProfile === 'Low'
    ? '18%'
    : summary?.riskProfile === 'Moderately Aggressive'
      ? '61%'
      : summary?.riskProfile === 'Aggressive'
        ? '82%'
        : '48%';
  const holdingRows = Array.isArray(holdings) ? holdings : [];
  const openTransactionForm = () => setShowTransactionForm(true);

  if (isLoading) {
    return (
      <div className="relative min-h-screen text-slate-950 dark:text-white">

        <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className={`${panelShellClass} animate-pulse p-6 sm:p-8`}>
            <div className="h-4 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-4 h-10 w-72 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-slate-200/80 dark:bg-white/10" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={`${insetPanelClass} h-28 bg-slate-100/90 dark:bg-white/5`} />
              <div className={`${insetPanelClass} h-28 bg-slate-100/90 dark:bg-white/5`} />
              <div className={`${insetPanelClass} h-28 bg-slate-100/90 dark:bg-white/5`} />
              <div className={`${insetPanelClass} h-28 bg-slate-100/90 dark:bg-white/5`} />
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className={`${panelShellClass} h-[22rem] animate-pulse`} />
            <div className="grid gap-6">
              <div className={`${panelShellClass} h-56 animate-pulse`} />
              <div className={`${panelShellClass} h-56 animate-pulse`} />
            </div>
          </div>

          <div className={`${panelShellClass} mt-6 h-[32rem] animate-pulse`} />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="relative min-h-screen text-slate-950 dark:text-white">

        <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className={`${panelShellClass} w-full p-8 text-center sm:p-10`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400">
              <BarChart3 className="h-7 w-7" />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Portfolio workspace</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Portfolio not available
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {authRequired
                ? 'Sign in to unlock your portfolio view and live analytics.'
                : 'We could not load your portfolio analytics right now. Try again in a moment.'}
            </p>
            {apiMessage ? (
              <p className="mx-auto mt-5 max-w-xl rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
                {apiMessage}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {authRequired ? (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.35)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Go to login
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void fetchPortfolioData();
                }}
                className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-950 dark:text-white">

      <div ref={dashboardRef} className="relative mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className={`${panelShellClass} overflow-hidden p-5 sm:p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div className="sr-only">
                <p>Portfolio overview</p>
                <p>Selected portfolio {selectedPortfolioLabel}.</p>
                <p>XIRR {xirrDisplay}.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchPortfolioData()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/80 bg-white/80 text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Refresh data"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                onClick={() => void handleExport()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/80 bg-white/80 text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Export portfolio"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {apiMessage ? (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
              {apiMessage}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`${insetPanelClass} sm:col-span-2 p-5 sm:p-6`}>
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-2">
                    <p className="sr-only">Portfolio value</p>
                    <p className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                      {formatLargeNumber(totalValue)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500 dark:text-emerald-400">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className={`${insetPanelClass} p-5 sm:p-6`}>
                <div className="flex items-end justify-between gap-4">
                  <p className="sr-only">Total P&amp;L</p>
                  <p className={`text-2xl font-semibold tracking-tight ${totalProfitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatLargeNumber(totalProfitLoss)}
                  </p>
                  <div className={`rounded-2xl p-3 ${totalProfitLoss >= 0 ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'}`}>
                    {totalProfitLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              <div className={`${insetPanelClass} p-5 sm:p-6`}>
                <div className="flex items-end justify-between gap-4">
                  <p className="sr-only">Day change</p>
                  <p className={`text-2xl font-semibold tracking-tight ${dayGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatLargeNumber(dayGain)}
                  </p>
                  <div className={`rounded-2xl p-3 ${dayGain >= 0 ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'}`}>
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className={`${insetPanelClass} p-5 sm:p-6`}>
                <div className="flex items-end justify-between gap-4">
                  <p className="sr-only">Holdings</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {holdingsCount}
                  </p>
                  <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-500 dark:text-sky-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`${insetPanelClass} overflow-hidden p-5 sm:p-6`}>
              <div className="flex items-center justify-between gap-4">
                <span className="sr-only">Performance chart</span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${performanceChart.hasData ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}
                  aria-hidden="true"
                />
              </div>

              <div className="mt-4 rounded-[26px] border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <svg viewBox="0 0 320 160" className="h-44 w-full">
                  <defs>
                    <linearGradient id="portfolio-line" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                    <linearGradient id="portfolio-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="14" x2="306" y1="134" y2="134" className="stroke-slate-200 dark:stroke-white/10" strokeDasharray="4 8" />
                  <path d={performanceChart.areaPath} fill="url(#portfolio-area)" opacity={performanceChart.hasData ? 1 : 0.4} />
                  <path d={performanceChart.linePath} fill="none" stroke="url(#portfolio-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={performanceChart.hasData ? 1 : 0.45} />
                  {performanceChart.chartPoints.map((point, index) => (
                    <circle
                      key={`${point.x}-${point.y}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r={index === performanceChart.chartPoints.length - 1 ? 4 : 2.5}
                      fill={index === performanceChart.chartPoints.length - 1 ? '#34d399' : '#94a3b8'}
                      opacity={performanceChart.hasData ? 1 : 0.45}
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className={`${panelShellClass} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-medium tracking-tight text-slate-950 dark:text-white">Risk</h3>
              <Shield className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400" />
                <span
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-[0_0_0_4px_rgba(52,211,153,0.15)] dark:border-slate-900 dark:bg-white"
                  style={{ left: riskMarkerPosition }}
                />
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/5">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{summary.riskProfile || 'Moderate'}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Risk level</p>
              </div>
            </div>
          </div>

          <div className={`${panelShellClass} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-medium tracking-tight text-slate-950 dark:text-white">Score</h3>
              <Target className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="relative h-28 w-28">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-white/10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${((summary.valuationScore ?? 3) / 5) * 251.2} 251.2`}
                    className="text-emerald-500 dark:text-emerald-400"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{Number(summary.valuationScore ?? 3).toFixed(1)}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">/ 5.0</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-center dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Good performance</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Overall score</p>
              </div>
            </div>
          </div>

          <div className={`${panelShellClass} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-medium tracking-tight text-slate-950 dark:text-white">Spread</h3>
              <PieChart className="h-5 w-5 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="mt-6 flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {allocationItems.length >= 3 ? (
                    <>
                      <circle cx="50" cy="50" r="36" fill="transparent" stroke="#34d399" strokeWidth="12" strokeDasharray={`${allocationItems[0].percentage * 2.26} 226`} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="36" fill="transparent" stroke="#0ea5e9" strokeWidth="12" strokeDasharray={`${allocationItems[1].percentage * 2.26} 226`} strokeDashoffset={`${-allocationItems[0].percentage * 2.26}`} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="36" fill="transparent" stroke="#8b5cf6" strokeWidth="12" strokeDasharray={`${allocationItems[2].percentage * 2.26} 226`} strokeDashoffset={`${-(allocationItems[0].percentage + allocationItems[1].percentage) * 2.26}`} transform="rotate(-90 50 50)" />
                    </>
                  ) : (
                    <circle cx="50" cy="50" r="36" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-200 dark:text-white/10" />
                  )}
                </svg>
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                {allocationItems.length >= 3 ? (
                  allocationItems.map((item, index) => {
                    const colorClass = index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-sky-500' : 'bg-violet-500';
                    return (
                      <div key={item.name} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorClass}`} />
                          <span className="truncate text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-950 dark:text-white">{item.percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    No sector allocation data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={`${panelShellClass} overflow-hidden p-6 sm:p-7`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Holdings
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTransactionForm((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/15 dark:text-emerald-300"
              >
                <Plus size={16} />
                {showTransactionForm ? 'Hide transaction form' : 'Add transaction'}
              </button>
            </div>
          </div>

          {showTransactionForm ? (
            <form
              onSubmit={handleAddTransaction}
              className="mt-6 grid gap-3 rounded-[26px] border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_auto]"
            >
              <input
                value={transactionSymbol}
                onChange={(event) => setTransactionSymbol(event.target.value)}
                placeholder="Symbol"
                className="h-12 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              <select
                value={transactionType}
                onChange={(event) => setTransactionType(event.target.value as 'BUY' | 'SELL')}
                className="h-12 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 text-sm text-slate-950 outline-none transition-colors focus:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
              <input
                type="number"
                min="1"
                step="1"
                value={transactionQuantity}
                onChange={(event) => setTransactionQuantity(event.target.value)}
                placeholder="Quantity"
                className="h-12 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={transactionPrice}
                onChange={(event) => setTransactionPrice(event.target.value)}
                placeholder="Price"
                className="h-12 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={submittingTransaction}
                className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
              >
                {submittingTransaction ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="bg-slate-50/90 dark:bg-white/5">
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                    <th className="px-6 py-4 font-semibold">Stock</th>
                    <th className="px-4 py-4 font-semibold">Price</th>
                    <th className="px-4 py-4 font-semibold">Change</th>
                    <th className="px-4 py-4 font-semibold">Quantity</th>
                    <th className="px-4 py-4 font-semibold">Value</th>
                    <th className="px-4 py-4 font-semibold">P&amp;L</th>
                    <th className="px-4 py-4 font-semibold">P&amp;L %</th>
                    <th className="px-4 py-4 font-semibold">P/E</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingRows.length > 0 ? holdingRows.map((stock, index) => (
                    <tr
                      key={stock.symbol || index}
                      className="border-t border-slate-200/70 transition-colors duration-200 hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-slate-950 shadow-[0_14px_32px_rgba(52,211,153,0.2)]">
                            {stock.symbol?.substring(0, 2) || 'ST'}
                          </div>
                          <div>
                            <Link href={`/stocks/${stock.symbol}`} className="font-semibold text-slate-950 transition-colors hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400">
                              {stock.symbol}
                            </Link>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">NSE</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{formatCurrency(stock.lastPrice)}</td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center gap-1.5 text-sm font-semibold ${stock.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {stock.change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          <span>{stock.change.toFixed(2)}</span>
                          <span className="text-xs font-medium opacity-75">({formatPercent(stock.changePercent)})</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{stock.quantity}</td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{formatLargeNumber(stock.marketValue)}</td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-semibold ${stock.profitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {stock.profitLoss >= 0 ? '+' : ''}{formatLargeNumber(stock.profitLoss)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stock.profitLossPercent >= 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'}`}>
                          {formatPercent(stock.profitLossPercent)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{stock.pe?.toFixed(2) || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 transition-colors hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-300"
                            aria-label={`View ${stock.symbol}`}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-14 text-center">
                        <div className="mx-auto flex max-w-md flex-col items-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
                            <BarChart3 className="h-7 w-7" />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">No holdings found</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Start building your portfolio by adding your first stock.
                          </p>
                          <button
                            type="button"
                            onClick={openTransactionForm}
                            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(16,185,129,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
                          >
                            Add your first stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
