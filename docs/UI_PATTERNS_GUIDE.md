# 🎨 Modern 2026 UI Patterns & Component Guide

**For:** Junior Frontend Developers  
**Framework:** Next.js + React + Tailwind CSS + shadcn/ui  
**Updated:** April 12, 2026

---

## 🎯 Modern 2026 Design Trends

### 1. **Glassmorphism with Colorful Gradients**
Real glass effect with vibrant, subtle gradients

```tsx
// components/ModernCard.tsx
export const GlassmorphicCard = ({ children, className = '' }) => {
  return (
    <div className={`
      backdrop-blur-xl
      bg-white/10
      dark:bg-black/10
      border border-white/20
      dark:border-white/10
      rounded-2xl
      shadow-2xl
      hover:shadow-xl
      hover:bg-white/15
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
};

// Usage with gradient background
<div className="
  bg-gradient-to-br
  from-indigo-500/20
  via-purple-500/20
  to-pink-500/20
">
  <GlassmorphicCard>
    <p className="text-white">₹3,950.50</p>
  </GlassmorphicCard>
</div>
```

### 2. **Smooth Micro-Interactions**
Subtle, delightful animations

```tsx
// components/InteractiveButton.tsx
import { motion } from 'framer-motion';

export const ModernButton = ({ children, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="
        px-6 py-3
        bg-gradient-to-r
        from-blue-500
        to-purple-600
        rounded-xl
        text-white
        font-semibold
        shadow-lg
        hover:shadow-xl
        transition-shadow
      "
    >
      {children}
    </motion.button>
  );
};
```

### 3. **Color-Coded Financial Data**

```tsx
// Components for market sentiment
export const SentimentBadge = ({ sentiment, value }) => {
  const colors = {
    bullish: 'bg-gradient-to-r from-green-400 to-emerald-600',
    neutral: 'bg-gradient-to-r from-gray-400 to-slate-600',
    bearish: 'bg-gradient-to-r from-red-400 to-rose-600',
  };

  return (
    <div className={`
      px-3 py-1
      rounded-full
      text-white
      font-semibold
      text-sm
      ${colors[sentiment]}
    `}>
      {sentiment.toUpperCase()} {value > 0 ? '📈' : '📉'}
    </div>
  );
};
```

### 4. **Real-Time Data Animations**

```tsx
// Stock price with smooth transitions
import { motion } from 'framer-motion';

export const LiveStockPrice = ({ price, previousPrice }) => {
  const isPositive = price >= previousPrice;

  return (
    <motion.div
      animate={{
        color: isPositive ? '#10b981' : '#ef4444',
        scale: isPositive ? 1.05 : 0.95,
      }}
      transition={{ duration: 0.3 }}
      className="text-3xl font-bold"
    >
      ₹{price.toFixed(2)}
    </motion.div>
  );
};
```

### 5. **Neumorphism + Bento Grid Layouts**

```tsx
// Modern dashboard layout
import { motion } from 'framer-motion';

export const BentoDashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4"
    >
      {/* Large card spanning 2 columns */}
      <motion.div
        variants={itemVariants}
        className="col-span-2 row-span-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <h3 className="text-2xl font-bold">₹5,25,000</h3>
        <p className="text-blue-100">Portfolio Value</p>
      </motion.div>

      {/* Regular cards */}
      <motion.div
        variants={itemVariants}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-4"
      >
        <p className="text-sm text-gray-500">Gain/Loss</p>
        <p className="text-2xl font-bold text-green-500">+₹25,000</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-4"
      >
        <p className="text-sm text-gray-500">Return %</p>
        <p className="text-2xl font-bold text-green-500">+5.00%</p>
      </motion.div>
    </motion.div>
  );
};
```

---

## 📊 Component Examples for API Responses

### 1. Market Overview Card (Hero Section)

```tsx
// components/MarketHero.tsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export const MarketHeroSection = () => {
  const { data } = useQuery({
    queryKey: ['market', 'overview'],
    queryFn: async () => {
      const res = await fetch('/api/v1/market/overview');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const indices = data?.data?.indices || [];

  return (
    <div className="
      relative
      overflow-hidden
      bg-gradient-to-br
      from-blue-600/20
      via-purple-600/20
      to-pink-600/20
      rounded-3xl
      p-8
      backdrop-blur-xl
      border border-white/20
    ">
      {/* Animated background gradient */}
      <div className="
        absolute
        inset-0
        opacity-30
      ">
        <div className="
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-white/10
          to-transparent
          animate-shimmer
        " />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-8">
          Market Overview 📊
        </h1>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        ">
          {indices.map((index, i) => (
            <motion.div
              key={index.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="
                bg-white/5
                backdrop-blur-md
                border border-white/10
                rounded-2xl
                p-6
                hover:bg-white/10
                transition-all
              "
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">{index.name}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {index.value.toLocaleString()}
                  </p>
                </div>
                <div className={`
                  px-3 py-1 rounded-full
                  ${index.changePercent > 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                  }
                `}>
                  {index.changePercent > 0 ? '📈' : '📉'}
                </div>
              </div>

              <div className="
                mt-4
                flex
                items-center
                gap-2
              ">
                <span className={`
                  text-sm font-semibold
                  ${index.changePercent > 0
                    ? 'text-green-400'
                    : 'text-red-400'
                  }
                `}>
                  {index.changePercent > 0 ? '+' : ''}{index.changePercent}%
                </span>
                <span className="text-gray-500 text-sm">
                  ({index.change > 0 ? '+' : ''}{index.change.toLocaleString()})
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2. Stock Search with Autocomplete

```tsx
// components/StockSearchBox.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

export const StockSearchBox = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['stocks', 'search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { data: { results: [] } };
      const res = await fetch(`/api/v1/stocks/search?query=${debouncedQuery}`);
      return res.json();
    },
    enabled: debouncedQuery.length > 0,
  });

  const results = data?.data?.results || [];

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="
        relative
        flex
        items-center
        bg-white/10
        backdrop-blur-xl
        border border-white/20
        rounded-2xl
        px-4
        py-3
        hover:bg-white/15
        transition-all
      ">
        <span className="text-xl mr-3">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks... (e.g., TCS, INFY)"
          className="
            flex-1
            bg-transparent
            outline-none
            text-white
            placeholder-gray-400
          "
        />
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute
              top-full
              left-0
              right-0
              mt-2
              bg-gray-900/95
              backdrop-blur-xl
              border border-white/10
              rounded-2xl
              overflow-hidden
              z-50
            "
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {results.map((stock, i) => (
                <motion.button
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    onSelectStock(stock);
                    setQuery('');
                  }}
                  className="
                    w-full
                    px-4
                    py-3
                    text-left
                    hover:bg-white/10
                    transition-colors
                    border-b border-white/5
                    last:border-0
                    flex
                    justify-between
                    items-center
                  "
                >
                  <div>
                    <p className="font-semibold text-white">
                      {stock.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      {stock.companyName}
                    </p>
                  </div>
                  <p className="text-white font-semibold">
                    ₹{stock.currentPrice}
                  </p>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

### 3. Sector Heatmap with Treemap Visualization

```tsx
// components/SectorHeatmap.tsx
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';

export const SectorHeatmapComponent = () => {
  const { data } = useQuery({
    queryKey: ['market', 'sector-heatmap'],
    queryFn: async () => {
      const res = await fetch('/api/v1/market/sector-heatmap');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const sectors = data?.data?.sectors || [];

  // Transform data for treemap
  const treeData = sectors.map(sector => ({
    name: sector.name,
    value: Math.abs(sector.change),
    change: sector.changePercent,
    stocks: sector.stocks,
  }));

  const COLORS = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#f59e0b',
  };

  const CustomizedContent = (props) => {
    const { x, y, width, height, name, change } = props;
    const isPositive = change > 0;

    return (
      <g>
        {/* Background */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isPositive ? COLORS.positive : isPositive === false ? COLORS.negative : COLORS.neutral}
          opacity={0.7}
        />

        {/* Label */}
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold text-white"
        >
          {name}
        </text>

        {/* Percentage */}
        <text
          x={x + width / 2}
          y={y + height / 2 + 20}
          textAnchor="middle"
          className="text-sm font-semibold text-white"
        >
          {change > 0 ? '+' : ''}{change.toFixed(2)}%
        </text>
      </g>
    );
  };

  return (
    <div className="
      w-full
      h-96
      bg-gradient-to-br
      from-gray-900
      to-gray-800
      rounded-2xl
      p-4
    ">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeData}
          dataKey="value"
          content={<CustomizedContent />}
        >
          <Tooltip />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};
```

### 4. Portfolio Holdings Table with Live Updates

```tsx
// components/PortfolioHoldings.tsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';

export const PortfolioHoldings = ({ portfolioId }) => {
  const { data } = useQuery({
    queryKey: ['portfolio', portfolioId, 'holdings'],
    queryFn: async () => {
      const res = await fetch(`/api/v1/portfolios/${portfolioId}/holdings`);
      return res.json();
    },
  });

  const holdings = data?.data?.holdings || [];
  const ticks = useWebSocket(holdings.map(h => h.symbol));

  return (
    <div className="
      bg-gradient-to-br
      from-gray-900/50
      to-gray-800/50
      backdrop-blur-xl
      border border-white/10
      rounded-2xl
      overflow-hidden
    ">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left px-4 py-3 text-gray-400 font-semibold">Stock</th>
            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Qty</th>
            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Price</th>
            <th className="text-right px-4 py-3 text-gray-400 font-semibold">P&L</th>
            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Return</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, i) => {
            const currentTick = ticks[holding.symbol] || holding;
            const isPositive = currentTick.profitLoss > 0;

            return (
              <motion.tr
                key={holding.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="
                  border-b border-white/5
                  hover:bg-white/5
                  transition-colors
                "
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{holding.symbol}</p>
                </td>
                <td className="text-right px-4 py-3 text-gray-400">
                  {holding.quantity}
                </td>
                <td className="text-right px-4 py-3 text-white font-semibold">
                  ₹{currentTick.lastPrice.toFixed(2)}
                </td>
                <td className={`
                  text-right px-4 py-3 font-semibold
                  ${isPositive ? 'text-green-400' : 'text-red-400'}
                `}>
                  {isPositive ? '+' : ''}₹{currentTick.profitLoss.toLocaleString()}
                </td>
                <td className={`
                  text-right px-4 py-3 font-semibold
                  ${isPositive ? 'text-green-400' : 'text-red-400'}
                `}>
                  {isPositive ? '+' : ''}{currentTick.profitLossPercent.toFixed(2)}%
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
```

### 5. Live Chart with Multiple Timeframes

```tsx
// components/StockChart.tsx
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export const StockChart = ({ symbol }) => {
  const [period, setPeriod] = useState('1d');

  const { data } = useQuery({
    queryKey: ['stock', symbol, 'history', period],
    queryFn: async () => {
      const res = await fetch(`/api/v1/market/indices/SENSEX/history?period=${period}`);
      return res.json();
    },
  });

  const candles = data?.data?.candles || [];

  return (
    <div className="
      bg-gradient-to-br
      from-gray-900/50
      to-gray-800/50
      backdrop-blur-xl
      border border-white/10
      rounded-2xl
      p-6
    ">
      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6">
        {['1d', '1w', '1m', '3m', '1y', '5y'].map(p => (
          <motion.button
            key={p}
            onClick={() => setPeriod(p)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-3 py-1
              rounded-lg
              font-semibold
              text-sm
              transition-all
              ${period === p
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }
            `}
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={candles}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="timestamp" opacity={0.5} />
          <YAxis opacity={0.5} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## 🎨 Tailwind CSS Custom Classes for 2026

```css
/* globals.css */

@layer components {
  /* Glassmorphic backgrounds */
  .glass {
    @apply backdrop-blur-xl bg-white/10 border border-white/20;
  }

  .glass-dark {
    @apply backdrop-blur-xl bg-black/10 border border-white/10;
  }

  /* Gradient text */
  .gradient-text {
    @apply bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent;
  }

  /* Card hover effects */
  .card {
    @apply rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-xl;
  }

  /* Button styles */
  .btn-primary {
    @apply px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-shadow;
  }

  .btn-secondary {
    @apply px-6 py-3 bg-white/10 backdrop-blur-xl rounded-xl text-white font-semibold border border-white/20 hover:bg-white/20 transition-all;
  }

  /* Badges */
  .badge-success {
    @apply inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold;
  }

  .badge-danger {
    @apply inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold;
  }

  .badge-warning {
    @apply inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold;
  }

  /* Animations */
  @keyframes shimmer {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  .animate-shimmer {
    animation: shimmer 3s infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { filter: drop-shadow(0 0 0 rgba(59, 130, 246, 0)); }
    50% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5)); }
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s infinite;
  }
}
```

---

## 🚀 Best Component Practices

### 1. Responsive Design Pattern
```tsx
// Always mobile-first
className="
  grid
  grid-cols-1        // Mobile: 1 column
  md:grid-cols-2     // Tablet: 2 columns
  lg:grid-cols-4     // Desktop: 4 columns
  gap-4
"
```

### 2. Dark Mode Support
```tsx
className="
  bg-white              // Light mode
  dark:bg-gray-900      // Dark mode
  text-gray-900
  dark:text-white
"
```

### 3. Accessibility
```tsx
<button
  aria-label="Search stocks"
  aria-describedby="search-help"
  className="..."
>
  🔍
</button>

<div id="search-help" className="sr-only">
  Enter stock symbol or company name
</div>
```

### 4. Performance Optimization
```tsx
// Lazy load expensive components
const HeavyChart = dynamic(
  () => import('@/components/HeavyChart'),
  { loading: () => <div>Loading chart...</div> }
);

// Memoize expensive components
const MemoizedHoldings = memo(PortfolioHoldings);
```

---

## 📋 Card Recommendations for Each API Response

| API Endpoint | Best Card Type | Visual Style | Components |
|-------------|----------------|-------------|-----------|
| Market Overview | Hero Card | Gradient + Glass | Title, 3-4 metric cards |
| Stock Search | Search Card | Glass + Dropdown | Search input, Results list |
| Stock Quote | Ticker Card | Minimal + Animated | Price, Change, Chart sparkline |
| Portfolio Summary | Dashboard Card | Bento Grid | Value, P&L, Charts |
| Holdings Table | Data Table | Glass rows | Symbol, Qty, Price, Status |
| Sector Heatmap | Treemap Visual | Colorful blocks | Interactive treemap |
| News Feed | Article Cards | Image + Glass | Thumbnail, Title, Time |
| IPO Calendar | Timeline Card | Status indicators | Date, Company, Status |
| F11/DII | Flow Chart | In/Out visual | Bar chart, Numbers |
| Price Alerts | Minimal Cards | Alert status | Title, Condition, Status |

---

## 🎬 Animation Library Stack

```json
{
  "devDependencies": {
    "framer-motion": "^10.16.4",
    "@react-spring/web": "^9.7.3",
    "react-hot-toast": "^2.4.1",
    "zustand": "^4.5.0",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.32"
  }
}
```

---

## 💡 Quick Implementation Checklist

- [ ] Setup Next.js + TypeScript
- [ ] Configure Tailwind CSS + custom components
- [ ] Setup React Query for data fetching
- [ ] Implement auth context
- [ ] Create reusable card components
- [ ] Build stock search autocomplete
- [ ] Integrate WebSocket for live updates
- [ ] Add error boundaries and error handling
- [ ] Implement loading states
- [ ] Add toast notifications
- [ ] Setup dark mode toggle
- [ ] Optimize images
- [ ] Test responsive design
- [ ] Setup analytics
- [ ] Deploy to Vercel

---

**Version:** 1.0  
**Last Updated:** April 12, 2026
