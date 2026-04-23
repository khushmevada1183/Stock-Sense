'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, FileText, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import * as stockApi from '@/api/api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  EMPTY_IPO_SECTIONS,
  buildIpoOverview,
  formatDateLabel,
  formatPercent,
  formatPriceBand,
  formatTimestampLabel,
  getIpoDetailsHref,
  normalizeIpoCalendarSections,
  type IpoCalendarSections,
} from '@/lib/ipo';
import { IpoEmptyState, IpoEntryCard, IpoMetricCard, PremiumSection } from '@/components/ipo/IpoPanels';
import { cn } from '@/lib/utils';

const IPO_NEWS = [
  { title: 'Mouri Tech refiles DRHP with SEBI', date: '8 May, 2:56 PM' },
  { title: 'SK Minerals & Additives files draft papers with BSE SME', date: '6 May, 3:46 PM' },
  { title: "Travel Food Services gets SEBI's nod for Rs 2,000 crore IPO", date: '30 Apr, 3:24 PM' },
  { title: 'Canara Robeco AMC files DRHP with SEBI', date: '28 Apr, 12:36 PM' },
];

const IPO_PREP = [
  'Research the business model before applying.',
  'Check subscription momentum near the issue close.',
  'Keep lot size and capital commitment in view.',
  'Review the prospectus instead of chasing headlines.',
  'Plan your listing-day exit before the bid is placed.',
];

const FAQS = [
  {
    question: 'What is an IPO?',
    answer:
      'An initial public offering is the first time a company sells shares to the public. Investors can apply through their broker or bank during the subscription window.',
  },
  {
    question: 'How do I invest in an IPO?',
    answer: 'Apply through your demat account or bank using ASBA before the issue closes.',
  },
  {
    question: 'What is the benefit of an IPO?',
    answer: 'IPO participation can offer listing gains and early access to new businesses, but it still carries market risk.',
  },
  {
    question: 'What is the minimum amount to invest in an IPO?',
    answer: 'The minimum ticket usually equals the price of one lot and depends on the issue document.',
  },
  {
    question: 'How is IPO allotment decided?',
    answer: 'Oversubscribed issues are allocated through the exchange allotment process, typically using a lottery for retail investors.',
  },
];

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
          reject(new Error('IPO calendar request timed out.'));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export default function IpoPage() {
  const [sections, setSections] = useState<IpoCalendarSections>(EMPTY_IPO_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadIpoCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await withTimeout(stockApi.getIPOCalendar());
      const normalized = normalizeIpoCalendarSections(extractApiData(response));

      setSections(normalized);
      setLastUpdated(new Date().toISOString());
    } catch (loadError) {
      setSections({ ...EMPTY_IPO_SECTIONS });
      setError(loadError instanceof Error ? loadError.message : 'Unable to load the IPO calendar right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIpoCalendar();

    const intervalId = window.setInterval(() => {
      void loadIpoCalendar();
    }, 5 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadIpoCalendar]);

  const overview = useMemo(() => buildIpoOverview(sections), [sections]);
  const featuredIpo = sections.upcoming[0] || sections.active[0] || sections.listed[0] || sections.closed[0] || null;
  const featuredDetailHref = featuredIpo ? getIpoDetailsHref(featuredIpo) : '/ipo';

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="premium-shell h-[24rem] animate-pulse p-6 sm:p-8 lg:p-10" />
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="premium-card h-28 animate-pulse" />
            <div className="premium-card h-28 animate-pulse" />
            <div className="premium-card h-28 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="premium-card h-80 animate-pulse lg:col-span-2" />
          <div className="premium-card h-80 animate-pulse" />
        </div>
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
              <Link href="/" className="transition-colors hover:text-[color:var(--app-text-1)]">
                Dashboard
              </Link>
              <span>·</span>
              <span>IPO Calendar</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <p className="premium-kicker">IPO Calendar</p>
              <h1 className="premium-title">Initial Public Offerings</h1>
              <p className="premium-subtitle">
                Track upcoming, live, and recently listed issues through the live market API. The calendar keeps the IPO flow restrained, technical, and easy to scan.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="#upcoming-ipo" className="premium-chip">
                Upcoming <span className="font-mono text-[10px] tracking-[0.14em]">{overview.upcoming}</span>
              </Link>
              <Link href="#active-ipo" className="premium-chip">
                Active <span className="font-mono text-[10px] tracking-[0.14em]">{overview.active}</span>
              </Link>
              <Link href="#listed-ipo" className="premium-chip">
                Listed <span className="font-mono text-[10px] tracking-[0.14em]">{overview.listed}</span>
              </Link>
              <Link href="#archived-ipo" className="premium-chip">
                Archived <span className="font-mono text-[10px] tracking-[0.14em]">{overview.closed}</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--app-text-3)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2">
                <Sparkles className="h-4 w-4 text-[color:var(--app-accent-strong)]" />
                Live market calendar
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-3 py-2">
                <Clock3 className="h-4 w-4 text-[color:var(--app-accent-strong)]" />
                Updated {lastUpdated ? formatTimestampLabel(lastUpdated) : 'just now'}
              </span>
              <Button onClick={() => void loadIpoCalendar()} variant="outline" size="sm" className="ml-0 sm:ml-auto">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <IpoMetricCard
            label="Upcoming"
            value={overview.upcoming}
            hint="Open windows scheduled by the API"
            tone="sky"
            icon={<CalendarDays className="h-5 w-5" />}
          />
          <IpoMetricCard
            label="Active"
            value={overview.active}
            hint="Live bidding currently in progress"
            tone="emerald"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <IpoMetricCard
            label="Recently listed"
            value={overview.listed}
            hint="Closed issues with final listing data"
            tone="amber"
            icon={<FileText className="h-5 w-5" />}
          />
        </div>
      </section>

      {error ? (
        <Card className="border-red-500/20 bg-red-500/[0.04]">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-200">IPO calendar unavailable</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4 pb-6">
            <p className="max-w-3xl text-sm leading-6 text-[color:var(--app-text-2)]">{error}</p>
            <Button onClick={() => void loadIpoCalendar()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <PremiumSection
        id="upcoming-ipo"
        eyebrow="Calendar"
        title="Upcoming IPOs"
        description="Open windows, price bands, and issue timing are presented in a clean grid for quick scanning."
      >
        {sections.upcoming.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.upcoming.map((ipo) => (
              <IpoEntryCard key={ipo.id || ipo.symbol} ipo={ipo} variant="upcoming" />
            ))}
          </div>
        ) : (
          <IpoEmptyState
            title="No upcoming IPOs right now"
            description="The calendar is quiet on the upcoming bucket. Fresh issues will appear here as soon as the API exposes them."
            action={
              <Button asChild variant="outline">
                <Link href="#listed-ipo">Review recent listings</Link>
              </Button>
            }
            icon={<CalendarDays className="h-5 w-5" />}
          />
        )}
      </PremiumSection>

      <PremiumSection
        id="active-ipo"
        eyebrow="Live subscriptions"
        title="Active IPOs"
        description="Issues that are currently open for bidding, with the same restrained card language used across the premium product surfaces."
      >
        {sections.active.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.active.map((ipo) => (
              <IpoEntryCard key={ipo.id || ipo.symbol} ipo={ipo} variant="active" />
            ))}
          </div>
        ) : (
          <IpoEmptyState
            title="No active IPOs at the moment"
            description="Applications are currently closed across the active bucket. This section will surface live issues as soon as bidding opens."
            action={
              <Button asChild variant="outline">
                <Link href="#upcoming-ipo">Check the upcoming calendar</Link>
              </Button>
            }
            icon={<TrendingUp className="h-5 w-5" />}
          />
        )}
      </PremiumSection>

      <PremiumSection
        id="listed-ipo"
        eyebrow="Outcome"
        title="Recently listed IPOs"
        description="A compact table keeps the closing price, listing gain, and listing date visible without cluttering the page."
      >
        {sections.listed.length > 0 ? (
          <div className="premium-table-shell">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Issue price</TableHead>
                  <TableHead>Listing price</TableHead>
                  <TableHead>Gain</TableHead>
                  <TableHead>Listing date</TableHead>
                  <TableHead>Prospectus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.listed.map((ipo) => (
                  <TableRow key={ipo.id || ipo.symbol}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-[color:var(--app-text-1)]">{ipo.companyName}</p>
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--app-text-3)]">{ipo.symbol}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatPriceBand(ipo)}</TableCell>
                    <TableCell>{ipo.listingPrice !== undefined ? `₹${ipo.listingPrice.toLocaleString('en-IN')}` : 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          (ipo.listingGainsPercent || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'
                        )}
                      >
                        {formatPercent(ipo.listingGainsPercent)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDateLabel(ipo.listingDate)}</TableCell>
                    <TableCell>
                      {ipo.documentUrl ? (
                        <Button asChild variant="outline" size="sm">
                          <a href={ipo.documentUrl} target="_blank" rel="noreferrer">
                            <FileText className="h-4 w-4" />
                            Open
                          </a>
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <IpoEmptyState
            title="No listed IPOs yet"
            description="Closed offerings will appear here once the calendar exposes recently listed companies."
            action={
              <Button asChild variant="outline">
                <Link href="#active-ipo">Review active issues</Link>
              </Button>
            }
            icon={<FileText className="h-5 w-5" />}
          />
        )}
      </PremiumSection>

      <PremiumSection
        id="archived-ipo"
        eyebrow="Archive"
        title="Archived IPOs"
        description="Closed issues remain visible for reference with the same calm card treatment used elsewhere on the page."
      >
        {sections.closed.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.closed.map((ipo) => (
              <IpoEntryCard key={ipo.id || ipo.symbol} ipo={ipo} variant="closed" />
            ))}
          </div>
        ) : (
          <IpoEmptyState
            title="No archived IPOs loaded"
            description="The API currently has no closed issues in this bucket. Archived IPOs will appear here when available."
            icon={<CalendarDays className="h-5 w-5" />}
          />
        )}
      </PremiumSection>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardDescription className="premium-kicker">Research</CardDescription>
            <CardTitle className="text-xl tracking-[-0.03em] text-[color:var(--app-text-1)]">IPO checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {IPO_PREP.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/50 p-4 text-sm leading-6 text-[color:var(--app-text-2)]">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--app-accent-soft)] text-[11px] font-semibold text-[color:var(--app-accent-strong)]">
                    {String(IPO_PREP.indexOf(item) + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="premium-kicker">Latest news</CardDescription>
            <CardTitle className="text-xl tracking-[-0.03em] text-[color:var(--app-text-1)]">IPO headlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {IPO_NEWS.map((item) => (
              <div key={item.title} className="space-y-1 border-b border-[color:var(--app-border)] pb-3 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-[color:var(--app-text-1)]">{item.title}</p>
                <p className="text-xs text-[color:var(--app-text-3)]">{item.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <PremiumSection id="faq" eyebrow="Help" title="IPO FAQs" description="Common questions around bidding, allocation, and listing outcomes.">
        <div className="premium-panel overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
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
            Live API route: {overview.total} IPO buckets loaded across upcoming, active, listed, and archived views.
          </span>
        </div>
        <Link href={featuredDetailHref} className="inline-flex items-center gap-2 font-medium text-[color:var(--app-accent-strong)] transition-colors hover:text-[color:var(--app-text-1)]">
          Browse a detail view
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}