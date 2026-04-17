export interface Pagination {
  limit?: number;
  offset?: number;
  total?: number;
  hasNext?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata?: {
    pagination?: Pagination;
    requestId?: string;
    timestamp?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode?: number;
    details?: unknown;
    requestId?: string;
    timestamp?: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  avatar?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface StockSearchItem {
  symbol: string;
  companyName: string;
  exchange?: string;
  sector?: string;
}

export interface StockQuote {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface PortfolioSummary {
  totalInvested?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  xirr?: number;
}

export interface AlertItem {
  id: string;
  symbol: string;
  alertType: string;
  targetValue: number;
  enabled: boolean;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  read?: boolean;
  createdAt?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  source?: string;
  category?: string;
  publishedAt?: string;
  sentiment?: number;
  url?: string;
  imageUrl?: string | null;
}

export interface IpoCalendarItem {
  id: string;
  name: string;
  symbol?: string;
  status?: string;
}
