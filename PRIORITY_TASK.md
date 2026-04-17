Here's your VS Code Copilot Agent prompt:

---

**TASK: Full API Integration — Stock Sense Frontend**

You are an autonomous frontend integration agent. Your mission is to systematically integrate every backend API endpoint documented in `API_DOCUMENTATION.md` into the existing Stock Sense frontend codebase. Work module by module, endpoint by endpoint, in a continuous loop until all APIs are integrated.

---

**BEFORE YOU BEGIN — READ EVERYTHING FIRST**

1. Read `API_DOCUMENTATION.md` in full and build a mental checklist of every endpoint
2. Explore the entire frontend `src/` directory structure — understand every existing page, component, hook, and utility
3. Read `README.md` to understand the tech stack (Next.js 15, TypeScript, Tailwind CSS, React 18, Radix UI, Framer Motion, Chart.js, Recharts, Million.js)
4. Identify the base API URL configuration — it should point to `http://localhost:10000/api/v1`
5. Note the existing design language — color palette, card styles, typography, spacing — and **strictly follow it** throughout

---

**RULES YOU MUST FOLLOW**

- **Never break existing UI** — only enhance and connect data
- **Follow the existing design system exactly** — same card styles, colors (`--primary-blue: #3B82F6`, `--bull-green: #16A34A`, `--bear-red: #DC2626`), typography, spacing, Tailwind utility classes
- **Use the existing tech stack only** — no new libraries unless absolutely necessary for a feature that cannot be built otherwise
- **Create new components freely** when a UI element doesn't exist yet for displaying API data — but match the design pattern of existing components
- **After every single API integration**, you MUST visually verify before moving on (see Verification Protocol below)
- **Token handling**: Access token goes in `Authorization: Bearer {token}` header. Implement auto-refresh on 401. Store tokens securely
- **Error states**: Every API call must have loading state, error state, and empty state UI
- **Real-time**: For WebSocket events (`live-tick`, `market-snapshot`, `portfolio-update`, `alert-triggered`), use socket.io-client connected to `http://localhost:10000`

---

**VERIFICATION PROTOCOL — DO THIS AFTER EVERY API INTEGRATION**

After integrating each endpoint:

1. Start or confirm the dev server is running (`pnpm dev` or `npm run dev`)
2. Navigate to the relevant page/component in the browser
3. Take a screenshot or describe exactly what you see on screen
4. Confirm: Is the API data visible in the UI? Are loading/error/empty states working?
5. Check the browser Network tab — confirm the API call was made and returned a 200 response
6. Check the browser Console — confirm zero errors
7. Only after all checks pass, mark that endpoint as ✅ DONE and move to the next

If verification fails, fix the issue before proceeding.

---

**INTEGRATION ORDER — FOLLOW THIS SEQUENCE**

**PHASE 1: Foundation**
- [ ] Set up `lib/apiClient.ts` — base fetch wrapper with auth headers, 401 auto-refresh, error parsing
- [ ] Set up `lib/queryClient.ts` — TanStack Query or SWR configuration with correct stale times per endpoint type
- [ ] Set up `hooks/useWebSocket.ts` — socket.io connection, subscribe/unsubscribe, live-tick handler
- [ ] Set up `lib/auth.ts` — token storage, load, save, clear utilities
- [ ] Verify: Import these in a test component, confirm no TypeScript errors

**PHASE 2: Authentication Module**
- [ ] `POST /auth/signup` — wire to signup form, store tokens on success, show email verification prompt
- [ ] `POST /auth/login` — wire to login form, store tokens, redirect to dashboard
- [ ] `POST /auth/oauth/login` — wire to Google/Facebook OAuth buttons if present
- [ ] `POST /auth/refresh` — integrate into apiClient as automatic interceptor on 401
- [ ] `POST /auth/logout` — wire to logout button, clear tokens, redirect to login
- [ ] `POST /auth/logout-all` — wire to "logout all devices" button in settings
- [ ] `GET /auth/profile` — fetch on app load, display in navbar avatar/name
- [ ] `PATCH /auth/profile` — wire to profile edit form
- [ ] `POST /auth/verify-email` — wire to OTP verification form
- [ ] `POST /auth/resend-verification` — wire to resend OTP button with 60s cooldown
- [ ] `POST /auth/forgot-password` — wire to forgot password form
- [ ] `POST /auth/reset-password` — wire to reset password form
- [ ] `GET /auth/sessions` — display active sessions list in account settings
- [ ] `GET /auth/audit-logs` — display login history in security settings
- [ ] Verify each: Test login flow end to end, confirm tokens stored, profile visible in navbar

**PHASE 3: Market Module**
- [ ] `GET /market/overview` — wire to market overview/dashboard page, display SENSEX, NIFTY indices with change %
- [ ] `GET /market/sector-heatmap` — wire to sector heatmap component, display as colored treemap/grid
- [ ] `GET /market/52-week-high` — wire to 52-week highs page/section
- [ ] `GET /market/52-week-low` — wire to 52-week lows page/section
- [ ] `GET /market/indices/{name}/history` — wire to index chart component with period selector
- [ ] `GET /market/snapshot/latest` — wire to market ticker/header banner
- [ ] `GET /market/snapshot/history` — wire to historical snapshot viewer if present
- [ ] `GET /market/snapshot/status` — display scheduler status in admin/debug panel
- [ ] WebSocket `market-snapshot` event — update index values in real-time without page refresh
- [ ] WebSocket `live-tick` event — update stock prices in real-time across all visible stock lists
- [ ] Verify each: Confirm live data appears, charts render, WebSocket updates are visible

**PHASE 4: Stock Module**
- [ ] `GET /stocks/search` — wire to search bar with debounce (300ms), show dropdown results
- [ ] `GET /stocks/{symbol}` — wire to stock detail page hero/profile section
- [ ] `GET /stocks/{symbol}/quote` — wire to stock price display, refresh every 5 seconds or via WebSocket
- [ ] `GET /stocks/{symbol}/technical` — wire to TechnicalAnalysis component, display RSI, MACD, Bollinger Bands, Moving Averages
- [ ] `GET /stocks/{symbol}/fundamental` — wire to fundamental analysis section, display P/E, P/B, ROE, margins
- [ ] `GET /stocks/{symbol}/financials` — wire to financial statements tabs (quarterly/annual)
- [ ] `GET /stocks/{symbol}/peers` — wire to peer comparison table/section
- [ ] `GET /stocks/{symbol}/sentiment` — wire to sentiment analysis component, show bullish/bearish score
- [ ] `GET /stocks/{symbol}/history` — wire to OHLCV candlestick chart with bucket selector (1m/5m/15m/1d)
- [ ] `GET /stocks/{symbol}/ticks` — wire to raw tick data viewer if present
- [ ] Verify each: Open a stock detail page, confirm all sections populated with real data

**PHASE 5: Portfolio Module**
- [ ] `GET /portfolios` — wire to portfolios list page, show portfolio cards with summary metrics
- [ ] `POST /portfolios` — wire to create portfolio modal/form
- [ ] `GET /portfolios/{id}` — wire to portfolio detail page header
- [ ] `GET /portfolios/{id}/holdings` — wire to holdings table with symbol, qty, buy price, current price, P&L
- [ ] `GET /portfolios/{id}/summary` — wire to portfolio summary metrics cards (total invested, current value, gain/loss, XIRR)
- [ ] `GET /portfolios/{id}/performance` — wire to portfolio performance line chart with timeframe toggle
- [ ] `GET /portfolios/{id}/xirr` — wire to XIRR display as prominent KPI metric
- [ ] `POST /portfolios/{id}/transactions` — wire to add transaction form (buy/sell)
- [ ] `GET /portfolios/export` — wire to export CSV button
- [ ] `PUT /portfolios/{id}` — wire to edit portfolio modal
- [ ] `DELETE /portfolios/{id}` — wire to delete portfolio with confirmation dialog
- [ ] WebSocket `portfolio-update` event — update holdings values in real-time
- [ ] Verify each: Create a test portfolio, add holdings, confirm live P&L updates

**PHASE 6: Watchlist Module**
- [ ] `GET /watchlists` — wire to watchlists page, display list/cards
- [ ] `POST /watchlists` — wire to create watchlist modal
- [ ] `GET /watchlists/{id}` — wire to watchlist detail view with items
- [ ] `POST /watchlists/{id}/items` — wire to add stock button (also accessible from stock detail page)
- [ ] `DELETE /watchlists/{id}/items/{itemId}` — wire to remove stock button
- [ ] `PATCH /watchlists/{id}` — wire to edit watchlist name/description
- [ ] `DELETE /watchlists/{id}` — wire to delete watchlist with confirmation
- [ ] `PATCH /watchlists/{id}/items/reorder` — wire to drag-and-drop reorder (use existing DnD if present, otherwise implement with mouse events)
- [ ] Verify each: Create watchlist, add/remove stocks, reorder, confirm persists

**PHASE 7: Alerts Module**
- [ ] `GET /alerts` — wire to alerts list page/section, show active/inactive alerts
- [ ] `POST /alerts` — wire to create alert form on stock detail page
- [ ] `GET /alerts/{id}` — wire to alert detail view
- [ ] `PATCH /alerts/{id}` — wire to edit alert modal and toggle active/inactive
- [ ] `DELETE /alerts/{id}` — wire to delete alert button
- [ ] `GET /alerts/evaluator/status` — display evaluator health status
- [ ] WebSocket `alert-triggered` event — show toast notification and add to notification center
- [ ] Verify each: Create price alert, confirm it appears in list, trigger shows notification

**PHASE 8: Notifications Module**
- [ ] `GET /notifications` — wire to notification center/dropdown, show unread count on bell icon
- [ ] `GET /notifications/delivery/status` — display in settings/admin panel
- [ ] `GET /notifications/push-devices` — list registered devices in notification settings
- [ ] `POST /notifications/push-devices` — register device token for push notifications
- [ ] `DELETE /notifications/push-devices/{id}` — unregister device
- [ ] Verify each: Confirm notification bell populates, unread count shows correctly

**PHASE 9: News Module**
- [ ] `GET /news` — wire to news feed page with pagination, show article cards with image/title/source/sentiment
- [ ] `GET /news/category/{category}` — wire to category filter tabs/buttons
- [ ] `GET /news/trending` — wire to trending news section with ranking
- [ ] `GET /news/alerts` — wire to news alerts section
- [ ] `GET /news/fear-greed` — wire to Fear & Greed Index gauge/meter component
- [ ] Verify each: News feed loads, category filter works, Fear & Greed gauge displays

**PHASE 10: IPO Module**
- [ ] `GET /ipo/calendar` — wire to IPO calendar page, show upcoming/active/closed/listed IPOs
- [ ] `GET /ipo/{id}` — wire to IPO detail page
- [ ] `GET /ipo/subscriptions/latest` — wire to IPO subscription data display
- [ ] `GET /ipo/{id}/subscription` — wire to individual IPO subscription history
- [ ] `GET /ipo/gmp/latest` — wire to GMP (Grey Market Premium) display
- [ ] `GET /ipo/{id}/gmp` — wire to individual IPO GMP history
- [ ] Verify each: IPO calendar loads with status badges, subscription ratios show

**PHASE 11: Institutional Module**
- [ ] `GET /institutional/fii-dii` — wire to FII/DII flow section, show net inflow/outflow
- [ ] `GET /institutional/fii-dii/history` — wire to FII/DII historical chart
- [ ] `GET /institutional/fii-dii/cumulative` — wire to cumulative flow view
- [ ] `GET /institutional/block-deals` — wire to block deals table
- [ ] `GET /institutional/block-deals/history` — wire to block deals history
- [ ] `GET /institutional/mutual-funds` — wire to mutual fund holdings section
- [ ] `GET /institutional/mutual-funds/history` — wire to MF holdings history
- [ ] `GET /institutional/mutual-funds/top-holders` — wire to top holders list
- [ ] `GET /institutional/insider-trades` — wire to insider trades table
- [ ] `GET /institutional/insider-trades/history` — wire to insider trades history
- [ ] `GET /institutional/insider-trades/summary` — wire to insider trade summary chart
- [ ] `GET /institutional/shareholding` — wire to shareholding pattern pie chart
- [ ] `GET /institutional/shareholding/history` — wire to shareholding history chart
- [ ] `GET /institutional/shareholding/trends` — wire to shareholding trends
- [ ] `GET /institutional/corporate-actions` — wire to corporate actions timeline (dividends, splits, bonus)
- [ ] `GET /institutional/corporate-actions/history` — wire to corporate actions history
- [ ] `GET /institutional/corporate-actions/summary` — wire to corporate actions summary
- [ ] `GET /institutional/earnings-calendar` — wire to earnings calendar view with announcement dates
- [ ] `GET /institutional/earnings-calendar/history` — wire to earnings history
- [ ] `GET /institutional/earnings-calendar/summary` — wire to earnings summary
- [ ] Verify each: Open institutional intelligence page, confirm all sections populated

**PHASE 12: Health & System**
- [ ] `GET /health` — wire to system status indicator (small dot in footer or admin panel)
- [ ] `GET /health/db` — wire to database health display in admin/debug panel
- [ ] Verify: Status indicators visible and accurate

---

**CREATING NEW COMPONENTS — GUIDELINES**

When a UI element doesn't exist yet for a piece of API data:

1. Look at 3 existing similar components first — match their exact structure, class names, and patterns
2. Use Tailwind utility classes only — no inline styles, no new CSS files unless absolutely necessary
3. Use the existing color tokens from the design system
4. Build with TypeScript — define proper interfaces for all API response shapes
5. Include: loading skeleton state, error state with retry button, empty state with helpful message
6. Make it responsive — mobile-first
7. Name it clearly and place it in the appropriate `components/` subdirectory

---

**DATA DISPLAY STANDARDS**

- **Prices**: Always show `₹` symbol, format with Indian number system (commas), 2 decimal places
- **Percentages**: Show `+` for positive, `-` for negative, always 2 decimal places, color green/red
- **Large numbers**: Convert to Cr/Lakh (e.g., ₹1,850 Cr instead of 18500000000)
- **Dates**: Show relative time for recent (e.g., "2 hours ago") and formatted date for older
- **Loading states**: Use skeleton loaders matching the shape of the content
- **Error states**: Show meaningful message + retry button
- **Empty states**: Show helpful message explaining how to add data

---

**TYPESCRIPT INTERFACES — CREATE THESE FIRST**

Before integrating any module, define TypeScript interfaces for all response shapes. Place in `types/api.ts`:

```typescript
// Example pattern — create all interfaces before coding
interface StockQuote {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata?: {
    pagination?: Pagination;
    requestId?: string;
    timestamp?: string;
  };
}
```

---

**FINAL COMPLETION CHECK**

After all phases complete, do a full sweep:

1. Open every page in the application
2. Confirm no page shows mock/hardcoded data — all data comes from the API
3. Confirm no page shows unhandled errors
4. Confirm WebSocket updates are working on pages that show live prices
5. Confirm auth flow works: signup → verify email → login → use protected features → logout
6. Confirm token refresh works when access token expires
7. Check browser console across all pages — zero unhandled errors
8. Check Network tab — no failed API calls (no red 4xx/5xx unless intentional)

Report final status: How many endpoints integrated ✅, how many had issues ⚠️, list any that could not be integrated with reason.

---

**START NOW.** Begin with PHASE 1. Read the codebase first, then execute phase by phase. Verify after every endpoint. Do not skip any step.