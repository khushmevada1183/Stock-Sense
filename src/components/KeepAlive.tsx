'use client';

import { useEffect } from 'react';

/**
 * KeepAlive is intentionally disabled while API integration is removed.
 */
export default function KeepAlive() {
  useEffect(() => {
    return;
  }, []);

  // Renders nothing.
  return null;
}
