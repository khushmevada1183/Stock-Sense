# News Section Architecture

## Overview

The News section of Stock Sense follows a specific architectural pattern to handle dynamic imports with SSR disabled in Next.js App Router. This document explains the architecture and the reasoning behind it.

## Server and Client Component Pattern

Each news page follows a server/client component pattern:

1. **Server Component (`page.tsx`)**: 
   - Defines metadata for the page
   - Imports the client component
   - Returns the client component
   - Does NOT contain any dynamic imports with `ssr: false`

2. **Client Component (`page-client.tsx`)**:
   - Marked with `'use client';` directive
   - Contains all dynamic imports with `ssr: false`
   - Contains all the UI rendering logic
   - Handles client-side data fetching

## Example Structure

```
app/
  news/
    page.tsx                # Server component
    page-client.tsx         # Client component
    markets/
      page.tsx              # Server component
      page-client.tsx       # Client component
    economy/
      page.tsx              # Server component
      page-client.tsx       # Client component
    companies/
      page.tsx              # Server component
      page-client.tsx       # Client component
    trending/
      page.tsx              # Server component
      page-client.tsx       # Client component
    alerts/
      page.tsx              # Server component
      page-client.tsx       # Client component
```

## Code Example

### Server Component (`page.tsx`)

```tsx
import React from 'react';
import NewsPageClient from './page-client';

export const metadata = {
  title: 'Market News | Stock Sense',
  description: 'Stay updated with the latest market news, sector updates, and financial insights',
};

export default function NewsPage() {
  return <NewsPageClient />;
}
```

### Client Component (`page-client.tsx`)

```tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
// ... other dynamic imports

export default function NewsPageClient() {
  return (
    // Component UI and logic
  );
}
```

## Why This Pattern?

Next.js App Router enforces that dynamic imports with `ssr: false` can only be used in client components. This pattern allows us to:

1. Keep server-only code (like metadata) in server components
2. Move client-side functionality to client components
3. Maintain a clean separation of concerns
4. Follow Next.js best practices

## Common Issues

If you encounter the error: 
```
Error: `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
```

It means you're trying to use dynamic imports with `ssr: false` directly in a server component. Move these imports to a client component following the pattern described above. 