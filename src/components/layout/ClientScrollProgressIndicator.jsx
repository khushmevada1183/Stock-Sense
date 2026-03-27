'use client';

import { useEffect, useState } from 'react';
import ScrollProgressIndicator from './ScrollProgressIndicator';
import { logger } from '@/lib/logger';

export default function ClientScrollProgressIndicator() {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      setMounted(true);
    } catch (error) {
      logger.error('Error mounting ScrollProgressIndicator:', error);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    // Silently fail - don't render anything if there's an error
    return null;
  }

  if (!mounted) {
    return null;
  }

  try {
    return <ScrollProgressIndicator />;
  } catch (error) {
    logger.error('Error rendering ScrollProgressIndicator:', error);
    return null;
  }
}
