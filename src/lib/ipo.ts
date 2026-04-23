export type IpoSectionKey = 'upcoming' | 'active' | 'listed' | 'closed';

export interface IpoCalendarEntry {
  id?: string;
  externalKey?: string;
  symbol: string;
  companyName: string;
  name?: string;
  status: IpoSectionKey;
  isSme: boolean;
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
  subscriptionPercentage?: number;
  documentUrl?: string;
  additionalText?: string;
  issueType?: string;
}

export interface IpoCalendarSections {
  upcoming: IpoCalendarEntry[];
  active: IpoCalendarEntry[];
  listed: IpoCalendarEntry[];
  closed: IpoCalendarEntry[];
}

export interface IpoOverview {
  upcoming: number;
  active: number;
  listed: number;
  closed: number;
  total: number;
}

export const EMPTY_IPO_SECTIONS: IpoCalendarSections = {
  upcoming: [],
  active: [],
  listed: [],
  closed: [],
};

const ALLOWED_STATUSES: IpoSectionKey[] = ['upcoming', 'active', 'listed', 'closed'];

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

const toNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const cleaned = value.replace(/[₹,]/g, '').trim();
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

const normalizeNumberDisplay = (value: number): string => {
  const fractionDigits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCurrency = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return `₹${normalizeNumberDisplay(value)}`;
};

export const formatPercent = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatRatio = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 'N/A';
  }

  return `${value.toFixed(2)}x`;
};

export const formatLotSize = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 'TBA';
  }

  return new Intl.NumberFormat('en-IN').format(value);
};

export const formatDateLabel = (value?: string | null): string => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export const formatTimestampLabel = (value?: string | null): string => {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

export const daysUntil = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const diffTime = parsed.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const titleCase = (value: string): string => {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const getIpoStatusTone = (status?: IpoSectionKey): 'sky' | 'emerald' | 'amber' | 'slate' => {
  switch (status) {
    case 'active':
      return 'emerald';
    case 'listed':
      return 'amber';
    case 'closed':
      return 'slate';
    case 'upcoming':
    default:
      return 'sky';
  }
};

export const getIpoStatusLabel = (status?: IpoSectionKey): string => {
  return titleCase((status || 'upcoming').toString());
};

export const getIpoCtaLabel = (status?: IpoSectionKey): string => {
  switch (status) {
    case 'active':
      return 'Track IPO';
    case 'listed':
      return 'Review listing';
    case 'closed':
      return 'Open archive';
    case 'upcoming':
    default:
      return 'View details';
  }
};

export const getIpoDetailsHref = (ipo: Pick<IpoCalendarEntry, 'id' | 'symbol'>): string => {
  const identifier = String(ipo.id || ipo.symbol || '').trim();
  return `/ipo/${encodeURIComponent(identifier)}`;
};

export const formatPriceBand = (ipo: Pick<IpoCalendarEntry, 'priceMin' | 'priceMax' | 'issuePrice'>): string => {
  if (ipo.priceMin !== undefined && ipo.priceMax !== undefined) {
    if (ipo.priceMin === ipo.priceMax) {
      return formatCurrency(ipo.priceMin);
    }

    return `${formatCurrency(ipo.priceMin)} - ${formatCurrency(ipo.priceMax)}`;
  }

  return formatCurrency(ipo.issuePrice) || 'Price TBA';
};

const normalizeStatus = (value: unknown): IpoSectionKey => {
  const candidate = toText(value)?.toLowerCase();
  if (candidate && ALLOWED_STATUSES.includes(candidate as IpoSectionKey)) {
    return candidate as IpoSectionKey;
  }

  return 'upcoming';
};

export const normalizeIpoEntry = (raw: unknown): IpoCalendarEntry | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const row = raw as Record<string, unknown>;
  const symbol = toText(row.symbol)?.toUpperCase();
  const companyName = toText(row.companyName, row.company_name, row.name);

  if (!symbol || !companyName) {
    return null;
  }

  const status = normalizeStatus(row.status);
  const isSme = Boolean(row.isSme ?? row.is_sme);
  const issueSizeText = toText(row.issueSizeText, row.issue_size);

  return {
    id: toText(row.id, row.externalKey),
    externalKey: toText(row.externalKey),
    symbol,
    companyName,
    name: companyName,
    status,
    isSme,
    priceMin: toNumber(row.priceMin, row.min_price),
    priceMax: toNumber(row.priceMax, row.max_price),
    issuePrice: toNumber(row.issuePrice, row.issue_price),
    listingPrice: toNumber(row.listingPrice, row.listing_price),
    listingGainsPercent: toNumber(row.listingGainsPercent, row.listing_gains),
    biddingStartDate: toText(row.biddingStartDate, row.bidding_start_date),
    biddingEndDate: toText(row.biddingEndDate, row.bidding_end_date),
    listingDate: toText(row.listingDate, row.listing_date),
    lotSize: toNumber(row.lotSize, row.lot_size),
    issueSizeText,
    subscriptionPercentage: toNumber(row.subscription_percentage),
    documentUrl: toText(row.documentUrl, row.document_url),
    additionalText: toText(row.additionalText, row.additional_text),
    issueType: toText(row.issueType, row.issue_type) || (isSme ? 'SME IPO' : 'Book Built'),
  };
};

const normalizeBucket = (value: unknown): IpoCalendarEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeIpoEntry(item)).filter((item): item is IpoCalendarEntry => Boolean(item));
};

const bucketEntries = (entries: IpoCalendarEntry[]): IpoCalendarSections => {
  return entries.reduce<IpoCalendarSections>(
    (accumulator, entry) => {
      accumulator[entry.status].push(entry);
      return accumulator;
    },
    { ...EMPTY_IPO_SECTIONS }
  );
};

export const normalizeIpoCalendarSections = (value: unknown): IpoCalendarSections => {
  if (!value || typeof value !== 'object') {
    return { ...EMPTY_IPO_SECTIONS };
  }

  const data = value as Record<string, unknown>;

  const explicitBuckets = {
    upcoming: normalizeBucket(data.upcoming),
    active: normalizeBucket(data.active),
    listed: normalizeBucket(data.listed),
    closed: normalizeBucket(data.closed),
  };

  if (
    explicitBuckets.upcoming.length ||
    explicitBuckets.active.length ||
    explicitBuckets.listed.length ||
    explicitBuckets.closed.length
  ) {
    return explicitBuckets;
  }

  const entriesSource =
    Array.isArray(data.entries) ? data.entries : Array.isArray(data.items) ? data.items : Array.isArray(data.ipos) ? data.ipos : [];

  return bucketEntries(
    entriesSource
      .map((item) => normalizeIpoEntry(item))
      .filter((item): item is IpoCalendarEntry => Boolean(item))
  );
};

export const buildIpoOverview = (sections: IpoCalendarSections): IpoOverview => {
  const upcoming = sections.upcoming.length;
  const active = sections.active.length;
  const listed = sections.listed.length;
  const closed = sections.closed.length;

  return {
    upcoming,
    active,
    listed,
    closed,
    total: upcoming + active + listed + closed,
  };
};