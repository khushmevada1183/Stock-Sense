'use client';

import { useEffect } from 'react';
import { getHealthStatus } from '@/api/api';

export default function KeepAlive() {
  useEffect(() => {
    const ping = () => {
      getHealthStatus().catch(() => {
        // Swallow errors to avoid noisy console output from keep-alive failures.
      });
    };

    ping();
    const interval = window.setInterval(ping, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
