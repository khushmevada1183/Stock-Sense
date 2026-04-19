import type { CSSProperties } from 'react';
import toast, { ToastOptions } from 'react-hot-toast';
import { ApiClientError } from '@/lib/apiClient';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const normalizeMessage = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const message = value.trim();
  return message.length > 0 ? message : null;
};

const baseStyle: CSSProperties = {
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  lineHeight: 1.4,
  border: '1px solid #cbd5e1',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
};

const withStyle = (icon: string, style: CSSProperties): ToastOptions => ({
  icon,
  duration: 4200,
  style: {
    ...baseStyle,
    ...style,
  },
});

const successOptions = withStyle('✅', {
  borderColor: '#86efac',
  background: '#f0fdf4',
  color: '#14532d',
});

const errorOptions = withStyle('⛔', {
  borderColor: '#fca5a5',
  background: '#fef2f2',
  color: '#991b1b',
});

const warningOptions = withStyle('⚠️', {
  borderColor: '#fcd34d',
  background: '#fffbeb',
  color: '#92400e',
});

const infoOptions = withStyle('ℹ️', {
  borderColor: '#93c5fd',
  background: '#eff6ff',
  color: '#1e3a8a',
});

export const getApiResponseMessage = (response: unknown): string | null => {
  if (!isRecord(response)) {
    return null;
  }

  const directMessage = normalizeMessage(response.message);
  if (directMessage) {
    return directMessage;
  }

  const nestedData = response.data;
  if (!isRecord(nestedData)) {
    return null;
  }

  return normalizeMessage(nestedData.message);
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    return normalizeMessage(error.message) || fallback;
  }

  if (error instanceof Error) {
    return normalizeMessage(error.message) || fallback;
  }

  return fallback;
};

export const toastSuccess = (message: string) => {
  return toast.success(message, successOptions);
};

export const toastError = (message: string) => {
  return toast.error(message, errorOptions);
};

export const toastWarning = (message: string) => {
  return toast(message, warningOptions);
};

export const toastInfo = (message: string) => {
  return toast(message, infoOptions);
};

export const toastApiSuccess = (response: unknown, fallback: string) => {
  return toastSuccess(getApiResponseMessage(response) || fallback);
};

export const toastApiError = (error: unknown, fallback: string) => {
  const message = getErrorMessage(error, fallback);

  if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
    return toastWarning(message);
  }

  return toastError(message);
};