'use client';

import { useSyncExternalStore } from 'react';
import ScrollProgressIndicator from './ScrollProgressIndicator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ClientScrollProgressIndicator() {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={null}
      onError={(error) => {
        logger.error('Error rendering ScrollProgressIndicator:', error);
      }}
    >
      <ScrollProgressIndicator />
    </ErrorBoundary>
  );
}
