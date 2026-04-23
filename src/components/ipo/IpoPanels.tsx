import Link from 'next/link';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  daysUntil,
  formatCurrency,
  formatDateLabel,
  formatLotSize,
  formatPercent,
  formatPriceBand,
  getIpoCtaLabel,
  getIpoDetailsHref,
  getIpoStatusLabel,
  getIpoStatusTone,
  type IpoCalendarEntry,
  type IpoSectionKey,
} from '@/lib/ipo';

type PremiumSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type IpoMetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  tone?: 'sky' | 'emerald' | 'amber' | 'slate';
  className?: string;
};

type IpoEmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

type IpoEntryCardProps = {
  ipo: IpoCalendarEntry;
  variant?: IpoSectionKey;
  className?: string;
};

const toneStyles: Record<
  'sky' | 'emerald' | 'amber' | 'slate',
  {
    icon: string;
    badge: string;
    gradient: string;
  }
> = {
  sky: {
    icon: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300',
    badge: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    gradient: 'from-sky-500/90 via-cyan-400/80 to-sky-500/90',
  },
  emerald: {
    icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    gradient: 'from-emerald-500/90 via-teal-400/80 to-emerald-500/90',
  },
  amber: {
    icon: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    gradient: 'from-amber-500/90 via-orange-400/80 to-amber-500/90',
  },
  slate: {
    icon: 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300',
    badge: 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300',
    gradient: 'from-slate-500/90 via-slate-400/80 to-slate-500/90',
  },
};

export function PremiumSection({ id, eyebrow, title, description, action, children, className }: PremiumSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-28 space-y-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          {eyebrow ? <p className="premium-kicker">{eyebrow}</p> : null}
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--app-text-1)] sm:text-[1.75rem]">
            {title}
          </h2>
          {description ? <p className="max-w-3xl premium-subtitle">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function IpoMetricCard({ label, value, hint, icon, tone = 'emerald', className }: IpoMetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="flex h-full items-start gap-4 p-5">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', styles.icon)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="premium-label">{label}</p>
          <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[color:var(--app-text-1)]">{value}</p>
          {hint ? <p className="mt-2 text-sm text-[color:var(--app-text-3)]">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function IpoEmptyState({ title, description, action, icon, className }: IpoEmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)] text-[color:var(--app-accent-strong)]">
            {icon || <Sparkles className="h-5 w-5" />}
          </div>
          <div className="max-w-2xl space-y-1">
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--app-text-1)]">{title}</h3>
            <p className="text-sm leading-6 text-[color:var(--app-text-2)]">{description}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

function FactTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/55 p-3">
      <p className="premium-label">{label}</p>
      <p className="mt-2 text-sm font-medium text-[color:var(--app-text-1)]">{value}</p>
    </div>
  );
}

export function IpoEntryCard({ ipo, variant = ipo.status, className }: IpoEntryCardProps) {
  const tone = getIpoStatusTone(variant);
  const toneClass = toneStyles[tone];
  const daysToOpen = daysUntil(ipo.biddingStartDate);
  const daysToClose = daysUntil(ipo.biddingEndDate);
  const ctaLabel = getIpoCtaLabel(variant);
  const statusLabel = getIpoStatusLabel(variant);

  const leadCopy =
    variant === 'upcoming'
      ? daysToOpen === null
        ? 'Opening soon'
        : daysToOpen > 0
          ? `${daysToOpen} days to open`
          : 'Opens today'
      : variant === 'active'
        ? daysToClose === null
          ? 'Applications open'
          : daysToClose > 0
            ? `${daysToClose} days left`
            : 'Last day'
        : variant === 'listed'
          ? ipo.listingDate
            ? `Listed ${formatDateLabel(ipo.listingDate)}`
            : 'Recently listed'
          : 'Archived';

  const facts =
    variant === 'listed'
      ? [
          { label: 'Issue price', value: formatCurrency(ipo.issuePrice) },
          { label: 'Listing price', value: formatCurrency(ipo.listingPrice) },
          { label: 'Gain', value: formatPercent(ipo.listingGainsPercent) },
          { label: 'Lot size', value: formatLotSize(ipo.lotSize) },
        ]
      : variant === 'active'
        ? [
            { label: 'Price band', value: formatPriceBand(ipo) },
            { label: 'Lot size', value: formatLotSize(ipo.lotSize) },
            { label: 'Closes on', value: formatDateLabel(ipo.biddingEndDate) },
            { label: 'Issue size', value: ipo.issueSizeText || 'TBA' },
          ]
        : variant === 'closed'
          ? [
              { label: 'Price band', value: formatPriceBand(ipo) },
              { label: 'Lot size', value: formatLotSize(ipo.lotSize) },
              { label: 'Listing date', value: formatDateLabel(ipo.listingDate) },
              { label: 'Issue size', value: ipo.issueSizeText || 'TBA' },
            ]
          : [
              { label: 'Price band', value: formatPriceBand(ipo) },
              { label: 'Lot size', value: formatLotSize(ipo.lotSize) },
              { label: 'Opens on', value: formatDateLabel(ipo.biddingStartDate) },
              { label: 'Listing date', value: formatDateLabel(ipo.listingDate) },
            ];

  return (
    <Card className={cn('group relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]', className)}>
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', toneClass.gradient)} aria-hidden="true" />

      <CardHeader className="space-y-0 border-b border-[color:var(--app-border)]/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="truncate text-lg tracking-[-0.02em] text-[color:var(--app-text-1)] sm:text-xl">
                {ipo.companyName}
              </CardTitle>
              {ipo.isSme ? (
                <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  SME
                </Badge>
              ) : null}
            </div>
            <CardDescription className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--app-text-3)]">
              {ipo.symbol}
            </CardDescription>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            <Badge variant="outline" className={toneClass.badge}>
              {statusLabel}
            </Badge>
            <span className="text-xs text-[color:var(--app-text-3)]">{leadCopy}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {facts.map((fact) => (
            <FactTile key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </div>

        {ipo.additionalText ? (
          <div className="mt-4 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)]/60 p-3 text-sm leading-6 text-[color:var(--app-text-2)]">
            {ipo.additionalText}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button asChild className="flex-1">
            <Link href={getIpoDetailsHref(ipo)}>
              <span>{ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {ipo.documentUrl ? (
            <Button asChild variant="outline" className="shrink-0">
              <a href={ipo.documentUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4" />
                <span>Prospectus</span>
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}