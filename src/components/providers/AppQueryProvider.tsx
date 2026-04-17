'use client';

import { ReactNode, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient as sharedQueryClient } from '@/lib/queryClient';

export default function AppQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => sharedQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
