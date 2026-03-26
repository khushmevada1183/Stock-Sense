'use client';

import { useEffect } from 'react';

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

/**
 * KeepAlive — invisible component that pings the backend every 14 minutes
 * to prevent Render free-tier from spinning down.
 * Also pings the frontend's own /api/health to keep it warm.
 */
export default function KeepAlive() {
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) return;

    // Derive base (strip /api suffix if present)
    const backendBase = backendUrl.replace(/\/api\/?$/, '');

    const ping = async () => {
      const targets = [
        `${backendBase}/health`,     // backend health
        '/api/health',                // frontend self (relative)
      ];

      for (const url of targets) {
        try {
          await fetch(url, { cache: 'no-store' });
        } catch {
          // Silently fail — keep-alive is best-effort
        }
      }
    };

    // First ping after 1 minute (let page fully settle)
    const initialTimeout = setTimeout(ping, 60_000);
    // Then every 14 minutes
    const interval = setInterval(ping, PING_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Renders nothing — purely a side-effect component
  return null;
}
