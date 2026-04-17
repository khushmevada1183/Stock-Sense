import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from '@/lib/auth';

const FALLBACK_BASE_URL = 'http://localhost:10000/api/v1';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || FALLBACK_BASE_URL;

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  requiresAuth?: boolean;
  retryOnAuthFail?: boolean;
  retryOnRateLimit?: boolean;
  rateLimitRetries?: number;
  signal?: AbortSignal;
  cache?: RequestCache;
};

type ErrorShape = {
  message?: string;
  code?: string;
  details?: unknown;
  statusCode?: number;
};

export class ApiClientError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(message: string, status: number, code = 'ERR_API', details: unknown = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise: Promise<string | null> | null = null;

const normalizePath = (path: string) => {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
};

const buildUrl = (path: string, params?: Record<string, QueryValue>) => {
  const url = new URL(`${BASE_URL}${normalizePath(path)}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const extractError = (payload: unknown, status: number): ApiClientError => {
  if (payload && typeof payload === 'object') {
    const wrapper = payload as { error?: ErrorShape; message?: string };
    const err = wrapper.error;

    if (err) {
      return new ApiClientError(
        err.message || 'Request failed',
        err.statusCode || status,
        err.code || 'ERR_API',
        err.details || null
      );
    }

    return new ApiClientError(wrapper.message || 'Request failed', status, 'ERR_API', payload);
  }

  return new ApiClientError('Request failed', status, 'ERR_API', payload);
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthTokens();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const payload = await parseJson(response);
      if (!response.ok) {
        clearAuthTokens();
        throw extractError(payload, response.status);
      }

      const data = (payload as { data?: { accessToken?: string; refreshToken?: string } })?.data;
      const newAccessToken = data?.accessToken || null;
      const newRefreshToken = data?.refreshToken || refreshToken;

      if (!newAccessToken) {
        clearAuthTokens();
        return null;
      }

      saveAuthTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      return newAccessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const buildHeaders = (options: RequestOptions, token?: string | null): Headers => {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

const parseRetryAfterMs = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const asSeconds = Number(value);
  if (Number.isFinite(asSeconds)) {
    return Math.max(0, asSeconds * 1000);
  }

  const asDate = Date.parse(value);
  if (Number.isFinite(asDate)) {
    return Math.max(0, asDate - Date.now());
  }

  return null;
};

const waitMs = (delayMs: number) => new Promise((resolve) => {
  setTimeout(resolve, delayMs);
});

export async function requestApi<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    params,
    body,
    headers,
    requiresAuth = false,
    retryOnAuthFail = true,
    retryOnRateLimit = true,
    rateLimitRetries = 2,
    signal,
    cache,
  } = options;

  const accessToken = requiresAuth ? getAccessToken() : null;
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: buildHeaders({ ...options, headers }, accessToken),
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    cache,
  });

  const payload = await parseJson(response);

  if (response.status === 401 && retryOnAuthFail && !path.startsWith('/auth/refresh')) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      return requestApi<T>(path, {
        ...options,
        retryOnAuthFail: false,
      });
    }
  }

  if (response.status === 429 && retryOnRateLimit && method === 'GET' && rateLimitRetries > 0) {
    const retryAfterMs = parseRetryAfterMs(response.headers.get('Retry-After'));
    const fallbackDelayMs = (3 - Math.min(rateLimitRetries, 3)) * 500;
    const delayMs = retryAfterMs ?? Math.max(300, fallbackDelayMs);

    await waitMs(delayMs);

    return requestApi<T>(path, {
      ...options,
      rateLimitRetries: rateLimitRetries - 1,
    });
  }

  if (!response.ok) {
    throw extractError(payload, response.status);
  }

  return payload as T;
}

export const apiGet = <T>(path: string, params?: Record<string, QueryValue>, options: Omit<RequestOptions, 'method' | 'params'> = {}) => {
  return requestApi<T>(path, { ...options, method: 'GET', params });
};

export const apiPost = <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
  return requestApi<T>(path, { ...options, method: 'POST', body });
};

export const apiPut = <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
  return requestApi<T>(path, { ...options, method: 'PUT', body });
};

export const apiPatch = <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
  return requestApi<T>(path, { ...options, method: 'PATCH', body });
};

export const apiDelete = <T>(path: string, options: Omit<RequestOptions, 'method'> = {}) => {
  return requestApi<T>(path, { ...options, method: 'DELETE' });
};

export const apiClientConfig = {
  BASE_URL,
};
