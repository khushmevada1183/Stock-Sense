# 🚀 Frontend Quick-Start Implementation Guide

**For:** New Frontend Developers  
**Time to First Component:** 15 minutes  
**Stack:** Next.js 15 + React 18 + Tailwind CSS + TypeScript  
**Updated:** April 12, 2026

---

## 📌 Day 1: Project Setup (30 mins)

### Step 1: Create Next.js Project

```bash
# Create new Next.js project
npm create next-app@latest stock-sense-frontend --typescript --tailwind

cd stock-sense-frontend
```

### Step 2: Install Dependencies

```bash
npm install \
  @tanstack/react-query@latest \
  axios \
  socket.io-client \
  framer-motion \
  recharts \
  @radix-ui/react-dialog \
  zustand
```

### Step 3: Create API Base Configuration

**File:** `lib/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  'http://localhost:10000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        originalRequest.headers.Authorization = 
          `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refresh_error) {
        // Redirect to login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```

### Step 4: Setup React Query (Provider)

**File:** `app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**File:** `app/layout.tsx`

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 📱 Day 2: Build Core Components (2 hours)

### 1. Glass Card Component (Reusable)

**File:** `components/GlassCard.tsx`

```typescript
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ 
  children, 
  className = '', 
  hover = true 
}: GlassCardProps) {
  return (
    <div className={`
      backdrop-blur-xl
      bg-white/10
      dark:bg-black/10
      border border-white/20
      dark:border-white/10
      rounded-2xl
      shadow-2xl
      ${hover && 'hover:bg-white/15 transition-all'}
      ${className}
    `}>
      {children}
    </div>
  );
}
```

### 2. Stock Search Component

**File:** `components/StockSearch.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface StockSearchProps {
  onSelect: (symbol: string) => void;
}

export function StockSearch({ onSelect }: StockSearchProps) {
  const [query, setQuery] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['stocks', 'search', query],
    queryFn: async () => {
      if (!query) return { data: { results: [] } };
      const res = await api.get(`/stocks/search?query=${query}`);
      return res.data;
    },
    enabled: query.length > 0,
  });

  const results = data?.data?.results || [];

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stocks..."
        className="
          w-full
          px-4 py-3
          bg-white/10
          border border-white/20
          rounded-xl
          text-white
          placeholder-gray-400
          focus:outline-none
          focus:bg-white/20
        "
      />

      {results.length > 0 && (
        <div className="
          absolute
          top-full
          left-0
          right-0
          mt-2
          bg-gray-900/95
          border border-white/10
          rounded-xl
          overflow-hidden
          z-50
        ">
          {results.map(stock => (
            <button
              key={stock.symbol}
              onClick={() => {
                onSelect(stock.symbol);
                setQuery('');
              }}
              className="
                w-full
                px-4 py-3
                text-left
                hover:bg-white/10
                border-b border-white/5
                last:border-0
                transition-colors
              "
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{stock.symbol}</p>
                  <p className="text-sm text-gray-400">
                    {stock.companyName}
                  </p>
                </div>
                <p className="font-semibold">₹{stock.currentPrice}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Market Overview Component

**File:** `components/MarketOverview.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { GlassCard } from './GlassCard';

export function MarketOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['market', 'overview'],
    queryFn: async () => {
      const res = await api.get('/market/overview');
      return res.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <div>Loading...</div>;

  const indices = data?.data?.indices || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {indices.map(index => {
        const isPositive = index.changePercent > 0;
        return (
          <GlassCard key={index.name} className="p-6">
            <p className="text-gray-400 text-sm">{index.name}</p>
            <p className="text-3xl font-bold text-white mt-2">
              {index.value.toLocaleString()}
            </p>
            <div className={`
              mt-4 text-sm font-semibold
              ${isPositive ? 'text-green-400' : 'text-red-400'}
            `}>
              {isPositive ? '📈' : '📉'} {index.changePercent > 0 ? '+' : ''}
              {index.changePercent}%
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
```

### 4. Stock Quote Component (Live Updates)

**File:** `components/StockQuote.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { GlassCard } from './GlassCard';

interface StockQuoteProps {
  symbol: string;
}

export function StockQuote({ symbol }: StockQuoteProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['stock', symbol, 'quote'],
    queryFn: async () => {
      const res = await api.get(`/stocks/${symbol}/quote`);
      return res.data;
    },
    refetchInterval: 5000, // 5 seconds
  });

  if (isLoading) return <div>Loading...</div>;

  const quote = data?.data || {};
  const isPositive = quote.change > 0;

  return (
    <GlassCard className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">{symbol}</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-gray-400 text-sm">Current Price</p>
          <p className="text-4xl font-bold text-white'>
            ₹{quote.lastPrice?.toFixed(2)}
          </p>
        </div>

        <div className={`
          inline-block
          px-4 py-2
          rounded-lg
          font-semibold
          ${isPositive
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
          }
        `}>
          {isPositive ? '📈' : '📉'} {isPositive ? '+' : ''}
          {quote.change?.toFixed(2)} ({quote.changePercent?.toFixed(2)}%)
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-gray-400 text-sm">Open</p>
            <p className="text-xl font-semibold text-white'>
              ₹{quote.open?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">High</p>
            <p className="text-xl font-semibold text-white'>
              ₹{quote.high?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Low</p>
            <p className="text-xl font-semibold text-white'>
              ₹{quote.low?.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Volume</p>
            <p className="text-xl font-semibold text-white'>
              {(quote.volume / 1_000_000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
```

---

## 🏠 Day 3: Build Dashboard Page (1 hour)

**File:** `app/dashboard/page.tsx`

```typescript
'use client';

import { MarketOverview } from '@/components/MarketOverview';
import { StockSearch } from '@/components/StockSearch';
import { StockQuote } from '@/components/StockQuote';
import { useState } from 'react';

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br
      from-gray-900
      via-gray-800
      to-gray-900
      p-8
    ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Stock Sense 📈
          </h1>
          <p className="text-gray-400">
            Real-time Indian stock market analysis
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            Find Stocks
          </h2>
          <StockSearch onSelect={setSelectedSymbol} />
        </div>

        {/* Market Overview */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            Market Overview
          </h2>
          <MarketOverview />
        </div>

        {/* Stock Details */}
        {selectedSymbol && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">
              Stock Details
            </h2>
            <StockQuote symbol={selectedSymbol} />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔐 Day 4: Implement Authentication (1.5 hours)

### 1. Create Auth Store

**File:** `lib/auth.ts`

```typescript
import { create } from 'zustand';
import { api } from './api';

interface AuthStore {
  accessToken: string | null;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  accessToken: typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken')
    : null,
  user: null,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    set({
      accessToken: data.data.accessToken,
      user: data.data.user,
    });
  },

  signup: async (email, password, fullName) => {
    const { data } = await api.post('/auth/signup', {
      email,
      password,
      fullName,
    });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    set({
      accessToken: data.data.accessToken,
      user: data.data.user,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ accessToken: null, user: null });
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const { data } = await api.post('/auth/refresh', { refreshToken });
    localStorage.setItem('accessToken', data.data.accessToken);
    set({ accessToken: data.data.accessToken });
  },
}));
```

### 2. Create Login Component

**File:** `components/LoginForm.tsx`

```typescript
'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { GlassCard } from './GlassCard';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="
              w-full
              px-4 py-2
              bg-white/10
              border border-white/20
              rounded-lg
              text-white
              placeholder-gray-500
              focus:outline-none
              focus:bg-white/20
            "
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="
              w-full
              px-4 py-2
              bg-white/10
              border border-white/20
              rounded-lg
              text-white
              placeholder-gray-500
              focus:outline-none
              focus:bg-white/20
            "
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            py-2
            bg-gradient-to-r
            from-blue-500
            to-purple-600
            rounded-lg
            text-white
            font-semibold
            hover:shadow-lg
            transition-shadow
            disabled:opacity-50
          "
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </GlassCard>
  );
}
```

---

## 🌐 Day 5: WebSocket Real-Time Updates (1 hour)

**File:** `hooks/useWebSocket.ts`

```typescript
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useWebSocket(symbols: string[]) {
  const [ticks, setTicks] = useState<Record<string, any>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000',
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      }
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      if (symbols.length > 0) {
        socket.emit('subscribe', { symbols });
      }
    });

    socket.on('live-tick', (data) => {
      setTicks((prev) => ({
        ...prev,
        [data.symbol]: data,
      }));
    });

    return () => {
      if (symbols.length > 0) {
        socket.emit('unsubscribe', { symbols });
      }
      socket.disconnect();
    };
  }, [symbols]);

  return ticks;
}
```

### Use WebSocket in Component

```typescript
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';

export function LiveStockPrice({ symbol }: { symbol: string }) {
  const ticks = useWebSocket([symbol]);
  const tick = ticks[symbol];

  if (!tick) return <div>Loading...</div>;

  return (
    <div className="
      bg-white/10
      border border-white/20
      rounded-lg
      p-4
    ">
      <p className="text-gray-400">Current Price</p>
      <p className={`
        text-3xl font-bold
        ${tick.change > 0 ? 'text-green-400' : 'text-red-400'}
      `}>
        ₹{tick.price?.toFixed(2)}
      </p>
    </div>
  );
}
```

---

## 📋 File Structure After Week 1

```
stock-sense-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── login/
│       └── page.tsx
├── components/
│   ├── GlassCard.tsx
│   ├── StockSearch.tsx
│   ├── StockQuote.tsx
│   ├── MarketOverview.tsx
│   └── LoginForm.tsx
├── hooks/
│   └── useWebSocket.ts
├── lib/
│   ├── api.ts
│   └── auth.ts
├── globals.css
└── package.json
```

---

## 🧪 Testing Your Endpoints

### Quick Test Commands

```bash
# Test health
curl http://localhost:10000/api/v1/health

# Test market overview
curl http://localhost:10000/api/v1/market/overview

# Test stock search
curl "http://localhost:10000/api/v1/stocks/search?query=TCS"

# Test authentication
curl -X POST http://localhost:10000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## ✅ Checklist: First Week Goals

- [x] Setup Next.js project
- [x] Install dependencies
- [x] Create API client with axios
- [x] Setup React Query provider
- [x] Build GlassCard component
- [x] Build StockSearch component
- [x] Build MarketOverview component
- [x] Build StockQuote component
- [x] Create authentication store
- [x] Build LoginForm component
- [x] Implement WebSocket hook
- [x] Test all components
- [x] Basic responsive design
- [ ] Deploy to Vercel
- [ ] Setup CI/CD

---

## 🚨 Common Errors & Fixes

### Error: "API call returns 401"
**Solution:** Check if `accessToken` is stored correctly
```typescript
// Debug
console.log('Token:', localStorage.getItem('accessToken'));
```

### Error: "WebSocket connection failed"
**Solution:** Ensure backend server is running on port 10000
```bash
# Check if backend is running
lsof -i :10000
```

### Error: "Types are showing as 'any'"
**Solution:** Generate types from API responses
```bash
npm install openapi-typescript
```

---

## 📚 Next Steps

1. **Week 2:** Portfolio management components
2. **Week 3:** Technical analysis charts
3. **Week 4:** Watchlists and alerts
4. **Week 5:** News feed and sentiment
5. **Week 6:** Optimization and deployment

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Guide](https://tanstack.com/query/v5/docs/react/overview)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

---

**Good luck! 🚀 You've got this!**

Need help? Check the main `API_DOCUMENTATION.md` file for detailed endpoint information.
