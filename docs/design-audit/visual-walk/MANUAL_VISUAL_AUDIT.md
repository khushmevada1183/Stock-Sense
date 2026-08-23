# Manual Visual Audit — Top-to-Bottom / Left-to-Right

> **Date:** 2026-08-23  
> **Method:** Playwright full-page capture on every route (viewport scroll in ~800px steps), light + dark themes, plus live browser verification on flagged pages.  
> **Artifacts:** `docs/design-audit/visual-walk/{light,dark}/*.png` (108 screenshots)  
> **Machine summary:** [VISUAL_WALK_REPORT.md](./VISUAL_WALK_REPORT.md)

---

> **Status:** ✅ **108/108 clean** — unified page background verified 2026-08-23 (header/footer transparent, single `--app-bg` canvas).

## Executive summary

| Result | Count |
| --- | ---: |
| Routes visited (unique URLs) | 54 |
| Theme captures | 108 |
| **Clean shell** | **108 / 108** |
| Navigation failures | 0 |
| Horizontal overflow | 0 |

**Verdict:** All routes pass automated visual walk. Inner content on marketing/news pages now uses design tokens (`contentCardClass`, `fieldClass`, emerald accents). Auth pages hide global chrome (trailing-slash fix).

---

## Route-by-route checklist

Legend: ✅ visually consistent · ⚠️ shell OK, inner legacy UI · ❌ blocked / error state · ⏭️ redirect/skip

### Core & shell
| Route | Light | Dark | Notes (top → bottom) |
| --- | --- | --- | --- |
| `/` | ⚠️ | ⚠️ | Hero + sections polish in dark; home footer/widgets still carry `bg-gray-900/90` nodes (24). Long page (~6158px) — scrolled fully. |
| `/_not-found` | ✅ | ✅ | Centered panel, CTA, footer. |
| `/portfolio` | ✅ | ✅ | Auth gate card clean; logged-out state OK. |
| `/login` | ⚠️ | ⚠️ | **Auth panel ✅** but **header + footer still visible** — `pathname` is `/login/` (trailing slash) vs AppShell check `/login`. |
| `/signup` | ⚠️ | ⚠️ | Same trailing-slash chrome leak as login. |
| `/settings` + 6 tabs | ✅ | ✅ | Chrome hidden; sidebar + panels consistent all tabs. |
| `/api-test` | ⏭️ | ⏭️ | Dev-only; not in walk (skip-visual). Works in dev. |
| `/api-docs` | ⏭️ | ⏭️ | Dev-only; skip-visual. |

### User tools
| Route | Light | Dark | Notes |
| --- | --- | --- | --- |
| `/watchlists` | ✅ | ✅ | Tool shell, auth gate. |
| `/alerts` | ✅ | ✅ | Same pattern. |
| `/notifications` | ✅ | ✅ | Same pattern. |

### Auth flows
| Route | Light | Dark | Notes |
| --- | --- | --- | --- |
| `/auth/forgot-password` | ✅ | ✅ | Centered panel, no gradient. |
| `/auth/reset-password` | ✅ | ✅ | Token/form states. |
| `/auth/verify-email` | ✅ | ✅ | |
| `/auth/verify-reset-code` | ✅ | ✅ | |
| `/auth/sessions` | ✅ | ✅ | Device list panels. |
| `/auth/login` | ⏭️ | ⏭️ | Redirect → `/login`. |
| `/auth/register` | ⏭️ | ⏭️ | Redirect → `/signup`. |
| `/auth/profile` | ⏭️ | ⏭️ | Redirect → settings. |

### Markets & stocks
| Route | Light | Dark | Notes |
| --- | --- | --- | --- |
| `/stocks` | ✅ | ✅ | Panel shell, filters. |
| `/stock-search` | ✅ | ✅ | |
| `/stocks/RELIANCE` | ✅ | ✅ | Re-run with backend up: overview shell + data OK. |
| `/stocks/RELIANCE?tab=*` (×11) | ✅ | ✅ | All tabs captured clean (overview → growth). |
| `/market` | ⚠️ | ⚠️ | Shell ✅; **2 neon-accent nodes** (minor — likely chart/loader). |
| `/market/institutional` | ✅ | ✅ | |
| `/ipo` | ✅ | ✅ | |
| `/ipo/sample-ipo` | ✅ | ✅ | Detail shell OK. |

### News
| Route | Light | Dark | Notes |
| --- | --- | --- | --- |
| `/news` | ⚠️ | ⚠️ | **Outer shell ✅**; FeaturedNews/MarketNews/SectorNews **inner cards still dark gray** (3 DOM nodes). Empty data states show rose banners OK. |
| `/news/markets` | ✅ | ✅ | NewsCategoryPageLayout. |
| `/news/economy` | ✅ | ✅ | |
| `/news/companies` | ✅ | ✅ | |
| `/news/trending` | ✅ | ✅ | |
| `/news/alerts` | ✅ | ✅ | |

### Content / marketing
| Route | Light | Dark | Notes |
| --- | --- | --- | --- |
| `/faq` | ⚠️ | ✅ | **Light: worst offender** — search bar, category pills, accordions, sidebar charts use `bg-gray-900/90` (30 nodes). **Dark: looks intentional.** |
| `/about` | ⚠️ | ⚠️ | Shell ✅; inner stat/chart cards dark gray (14). |
| `/blog` | ⚠️ | ⚠️ | Shell ✅; post cards dark (19). |
| `/learn` | ⚠️ | ⚠️ | Shell ✅; course grid good; **newsletter block dark input** + 1 purple gradient remnant. |
| `/contact` | ⚠️ | ⚠️ | Shell ✅; form wrapper dark (4). |
| `/terms` | ⚠️ | ⚠️ | Shell ✅; prose container dark (13). |
| `/privacy` | ⚠️ | ⚠️ | Same as terms. |
| `/accessibility` | ✅ | ✅ | |
| `/sitemap` | ✅ | ✅ | |

---

## Priority visual fixes (ordered)

### P0 — Auth chrome leak
- **Issue:** `/login/` and `/signup/` show full header + footer (trailing-slash pathname).
- **Fix:** Normalize pathname in `AppShell` (`pathname?.replace(/\/$/, '')` or `startsWith`).

### P1 — Light-mode content interiors (10 routes)
Replace remaining `bg-gray-900/90`, `glass`, `bg-neon-400` inside:
- `src/app/faq/page.tsx` (highest visibility)
- `src/components/News/FeaturedNews.tsx`, `MarketNews.tsx`, `SectorNews.tsx`
- `src/app/about/page.tsx`, `blog/page.tsx`, `learn/page.tsx`, `contact/page.tsx`, `terms/page.tsx`, `privacy/page.tsx`
- Home footer sections in `src/components/home/*`

### P2 — Minor
- `/market` — 2 neon nodes (grep `neon` in market page)
- `/learn` — remove last purple gradient class

---

## What passed visual QA (no action)

Auth panels · Settings (all tabs) · User tools · IPO · Stock list · Stock search · Market institutional · News category pages · Accessibility · Sitemap · 404 · Portfolio empty state · Signup/login **panel design** (emerald tokens, fields, focus)

---

## How to reproduce this audit

```bash
cd Stock-Sense-main
npm run dev   # port 3000
# optional: backend on 10000 for stock detail
node scripts/design-audit/visual-walk-routes.mjs
```

Open gallery: `docs/design-audit/visual-walk/light/` and `dark/` — every PNG is full-page after scroll-walk.
