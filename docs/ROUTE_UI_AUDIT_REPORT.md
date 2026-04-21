# ROUTE UI AUDIT REPORT

## 1. Header
- Timestamp: 2026-04-21T13:08:39.706Z
- Scope: src/app route files and src/components + src/app/components modules

## 2. Executive summary metrics
| Metric | Value |
| --- | --- |
| Total routes | 41 |
| Total route handlers | 1 |
| Module files scanned | 115 |
| Component files | 115 |
| Reachable component files | 65 |
| Orphan component files | 50 |

## 3. Global layout chain (from src/app/layout.tsx and AppShell)
```txt
- src/app/layout.tsx [66 lines] (root)
  - AppQueryProvider -> src/components/providers/AppQueryProvider.tsx [12 lines] (imported-file)
  - AppShell -> src/components/layout/AppShell.tsx [43 lines] (imported-file)
    - Footer -> src/components/layout/Footer.tsx [159 lines] (imported-file)
    - Header -> src/components/layout/Header.tsx [375 lines] (imported-file)
      - SearchBar -> src/app/components/SearchBar.tsx [339 lines] (imported-file)
        - StockLogo -> src/app/components/StockLogo.tsx [67 lines] (imported-file)
      - ThemeToggle -> src/components/ui/ThemeToggle.tsx [40 lines] (imported-file)
      - MenuActionItem -> src/components/layout/Header.tsx [375 lines] (internal-component)
  - AuthProvider -> src/context/AuthContext.tsx [279 lines] (imported-file)
  - ErrorBoundary -> src/components/ErrorBoundary.tsx [86 lines] (imported-file)
  - HotToastProvider -> src/components/providers/HotToastProvider.tsx [16 lines] (imported-file)
  - KeepAlive -> src/components/KeepAlive.tsx [24 lines] (imported-file)
  - ModalContainer -> src/components/ui/ModalContainer.tsx [115 lines] (imported-file)
    - Modal -> src/components/ui/ModalContainer.tsx [115 lines] (internal-component)
  - StockProvider -> src/context/StockContext.tsx [277 lines] (imported-file)
  - ThemeProvider -> src/components/ui/ThemeProvider.tsx [8 lines] (imported-file)
  - UIProvider -> src/context/UIContext.tsx [143 lines] (imported-file)
```

## 4. Route coverage table (all routes)
| Route | File | Lines | Redirect aliases | Tab systems |
| --- | --- | --- | --- | --- |
| / | src/app/page.tsx | 209 | - | - |
| /_not-found | src/app/not-found.tsx | 8 | - | - |
| /about | src/app/about/page.tsx | 394 | - | - |
| /accessibility | src/app/accessibility/page.tsx | 44 | - | - |
| /alerts | src/app/alerts/page.tsx | 273 | - | - |
| /api-docs | src/app/api-docs/page.tsx | 111 | - | - |
| /api-test | src/app/api-test/page.tsx | 140 | - | - |
| /auth/forgot-password | src/app/auth/forgot-password/page.tsx | 151 | - | - |
| /auth/login | src/app/auth/login/page.tsx | 6 | /login | - |
| /auth/profile | src/app/auth/profile/page.tsx | 5 | /settings?tab=basic | query param tab= |
| /auth/register | src/app/auth/register/page.tsx | 6 | /signup | - |
| /auth/reset-password | src/app/auth/reset-password/page.tsx | 249 | - | - |
| /auth/sessions | src/app/auth/sessions/page.tsx | 186 | - | - |
| /auth/verify-email | src/app/auth/verify-email/page.tsx | 156 | - | - |
| /auth/verify-reset-code | src/app/auth/verify-reset-code/page.tsx | 175 | - | - |
| /blog | src/app/blog/page.tsx | 494 | - | - |
| /contact | src/app/contact/page.tsx | 319 | - | - |
| /faq | src/app/faq/page.tsx | 415 | - | - |
| /ipo | src/app/ipo/page.tsx | 1812 | - | - |
| /ipo/[ipoId] | src/app/ipo/[ipoId]/page.tsx | 660 | - | - |
| /learn | src/app/learn/page.tsx | 373 | - | - |
| /login | src/app/login/page.tsx | 256 | - | - |
| /market | src/app/market/page.tsx | 1253 | - | - |
| /market/institutional | src/app/market/institutional/page.tsx | 203 | - | - |
| /news | src/app/news/page.tsx | 11 | - | - |
| /news/alerts | src/app/news/alerts/page.tsx | 11 | - | - |
| /news/companies | src/app/news/companies/page.tsx | 11 | - | - |
| /news/economy | src/app/news/economy/page.tsx | 11 | - | - |
| /news/markets | src/app/news/markets/page.tsx | 11 | - | - |
| /news/trending | src/app/news/trending/page.tsx | 11 | - | - |
| /notifications | src/app/notifications/page.tsx | 239 | - | - |
| /portfolio | src/app/portfolio/page.tsx | 8 | - | - |
| /privacy | src/app/privacy/page.tsx | 429 | - | - |
| /settings | src/app/settings/page.tsx | 20 | - | - |
| /signup | src/app/signup/page.tsx | 333 | - | - |
| /sitemap | src/app/sitemap/page.tsx | 38 | - | - |
| /stock-search | src/app/stock-search/page.tsx | 166 | - | - |
| /stocks | src/app/stocks/page.tsx | 2322 | - | - |
| /stocks/[symbol] | src/app/stocks/[symbol]/page.tsx | 1150 | - | Tabs |
| /terms | src/app/terms/page.tsx | 227 | - | - |
| /watchlists | src/app/watchlists/page.tsx | 351 | - | - |

## 5. Detailed route audit
### Route: /
- Parent file: src/app/page.tsx
- Direct child components: AnalysisFeatures -> src/components/home/AnalysisFeatures.tsx; CtaSection -> src/components/home/CtaSection.tsx; FeaturedStocks -> src/components/home/FeaturedStocks.tsx; HeroSection -> src/components/home/HeroSection.tsx; IpoSection -> src/components/home/IpoSection.tsx; MarketNetworkSection -> src/components/ui/market-network-section.tsx; MarketOverview -> src/components/home/MarketOverview.tsx; SectionReveal -> src/components/ui/SectionReveal.tsx; SectorPerformance -> src/components/home/SectorPerformance.tsx
- Internal child components: SectionHeader
- Intrinsic UI elements: div, h2, section, span
- Tab systems: -
- Nested component tree:
```txt
- src/app/page.tsx [209 lines] (root)
  - AnalysisFeatures -> src/components/home/AnalysisFeatures.tsx [700 lines] (imported-file)
  - CtaSection -> src/components/home/CtaSection.tsx [151 lines] (imported-file)
    - Button -> src/components/ui/button.tsx [54 lines] (imported-file)
    - AnimatedCounter -> src/components/home/CtaSection.tsx [151 lines] (internal-component)
  - FeaturedStocks -> src/components/home/FeaturedStocks.tsx [334 lines] (imported-file)
    - Button -> src/components/ui/button.tsx [54 lines] (imported-file)
  - HeroSection -> src/components/home/HeroSection.tsx [236 lines] (imported-file)
    - Button -> src/components/ui/button.tsx [54 lines] (imported-file)
  - IpoSection -> src/components/home/IpoSection.tsx [349 lines] (imported-file)
    - Button -> src/components/ui/button.tsx [54 lines] (imported-file)
  - MarketNetworkSection -> src/components/ui/market-network-section.tsx [110 lines] (imported-file)
    - MarketEntityTicker -> src/components/ui/market-entity-ticker.tsx [72 lines] (imported-file)
      - InfiniteSlider -> src/components/ui/infinite-slider.tsx [106 lines] (imported-file)
      - ProgressiveBlur -> src/components/ui/progressive-blur.tsx [62 lines] (imported-file)
  - MarketOverview -> src/components/home/MarketOverview.tsx [221 lines] (imported-file)
  - SectionReveal -> src/components/ui/SectionReveal.tsx [23 lines] (imported-file)
  - SectorPerformance -> src/components/home/SectorPerformance.tsx [140 lines] (imported-file)
  - SectionHeader -> src/app/page.tsx [209 lines] (internal-component)
```

### Route: /_not-found
- Parent file: src/app/not-found.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: div, h1
- Tab systems: -
- Nested component tree:
```txt
- src/app/not-found.tsx [8 lines] (root)
```

### Route: /about
- Parent file: src/app/about/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: div, h1, h2, h3, main, p, section, span
- Tab systems: -
- Nested component tree:
```txt
- src/app/about/page.tsx [394 lines] (root)
```

### Route: /accessibility
- Parent file: src/app/accessibility/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: div, h1, h2, header, li, main, p, section, ul
- Tab systems: -
- Nested component tree:
```txt
- src/app/accessibility/page.tsx [44 lines] (root)
```

### Route: /alerts
- Parent file: src/app/alerts/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, form, h1, h2, input, option, p, pre, select
- Tab systems: -
- Nested component tree:
```txt
- src/app/alerts/page.tsx [273 lines] (root)
```

### Route: /api-docs
- Parent file: src/app/api-docs/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: div, h1, h2, h3, header, li, main, p, section, span, ul
- Tab systems: -
- Nested component tree:
```txt
- src/app/api-docs/page.tsx [111 lines] (root)
```

### Route: /api-test
- Parent file: src/app/api-test/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, h1, h2, p, span
- Tab systems: -
- Nested component tree:
```txt
- src/app/api-test/page.tsx [140 lines] (root)
```

### Route: /auth/forgot-password
- Parent file: src/app/auth/forgot-password/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, form, h1, h2, input, label, p, path, svg
- Tab systems: -
- Nested component tree:
```txt
- src/app/auth/forgot-password/page.tsx [151 lines] (root)
```

### Route: /auth/login
- Parent file: src/app/auth/login/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/auth/login/page.tsx [6 lines] (root)
```

### Route: /auth/profile
- Parent file: src/app/auth/profile/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: query param tab=
- Nested component tree:
```txt
- src/app/auth/profile/page.tsx [5 lines] (root)
```

### Route: /auth/register
- Parent file: src/app/auth/register/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/auth/register/page.tsx [6 lines] (root)
```

### Route: /auth/reset-password
- Parent file: src/app/auth/reset-password/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, form, h1, input, label, p
- Tab systems: -
- Nested component tree:
```txt
- src/app/auth/reset-password/page.tsx [249 lines] (root)
```

### Route: /auth/sessions
- Parent file: src/app/auth/sessions/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, h1, h2, p
- Tab systems: -
- Nested component tree:
```txt
- src/app/auth/sessions/page.tsx [186 lines] (root)
```

### Route: /auth/verify-email
- Parent file: src/app/auth/verify-email/page.tsx
- Direct child components: -
- Internal child components: VerifyEmailContent
- Intrinsic UI elements: button, div, form, h1, input, p
- Tab systems: -
- Nested component tree:
```txt
- src/app/auth/verify-email/page.tsx [156 lines] (root)
  - VerifyEmailContent -> src/app/auth/verify-email/page.tsx [156 lines] (internal-component)
```

### Route: /auth/verify-reset-code
- Parent file: src/app/auth/verify-reset-code/page.tsx
- Direct child components: -
- Internal child components: VerifyResetCodeContent
- Intrinsic UI elements: button, div, form, h1, input, label, p
- Tab systems: -
- Nested component tree:
```txt
- src/app/auth/verify-reset-code/page.tsx [175 lines] (root)
  - VerifyResetCodeContent -> src/app/auth/verify-reset-code/page.tsx [175 lines] (internal-component)
```

### Route: /blog
- Parent file: src/app/blog/page.tsx
- Direct child components: Card -> src/components/ui/card.tsx; PageBackground -> src/components/layout/PageBackground.tsx
- Internal child components: -
- Intrinsic UI elements: button, div, h1, h2, h3, h4, input, label, option, p, select, span
- Tab systems: -
- Nested component tree:
```txt
- src/app/blog/page.tsx [494 lines] (root)
  - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
  - PageBackground -> src/components/layout/PageBackground.tsx [23 lines] (imported-file)
```

### Route: /contact
- Parent file: src/app/contact/page.tsx
- Direct child components: PageBackground -> src/components/layout/PageBackground.tsx
- Internal child components: -
- Intrinsic UI elements: a, br, button, div, form, h1, h2, h3, input, label, main, p, span, textarea
- Tab systems: -
- Nested component tree:
```txt
- src/app/contact/page.tsx [319 lines] (root)
  - PageBackground -> src/components/layout/PageBackground.tsx [23 lines] (imported-file)
```

### Route: /faq
- Parent file: src/app/faq/page.tsx
- Direct child components: PageBackground -> src/components/layout/PageBackground.tsx
- Internal child components: -
- Intrinsic UI elements: a, button, div, h1, h2, h3, input, li, main, p, section, span, ul
- Tab systems: -
- Nested component tree:
```txt
- src/app/faq/page.tsx [415 lines] (root)
  - PageBackground -> src/components/layout/PageBackground.tsx [23 lines] (imported-file)
```

### Route: /ipo
- Parent file: src/app/ipo/page.tsx
- Direct child components: Accordion -> src/components/ui/accordion.tsx; AccordionContent -> src/components/ui/accordion.tsx; AccordionItem -> src/components/ui/accordion.tsx; AccordionTrigger -> src/components/ui/accordion.tsx; CursiveLoader -> src/components/ui/CursiveLoader.tsx
- Internal child components: ActiveIpoCard, SimpleIpoCard, UpcomingIpoCard
- Intrinsic UI elements: a, button, div, h1, h2, h3, li, p, path, span, svg, ul
- Tab systems: -
- Nested component tree:
```txt
- src/app/ipo/page.tsx [1812 lines] (root)
  - Accordion -> src/components/ui/accordion.tsx [59 lines] (imported-file)
  - AccordionContent -> src/components/ui/accordion.tsx [59 lines] (imported-file)
  - AccordionItem -> src/components/ui/accordion.tsx [59 lines] (imported-file)
  - AccordionTrigger -> src/components/ui/accordion.tsx [59 lines] (imported-file)
  - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
  - ActiveIpoCard -> src/app/ipo/page.tsx [1812 lines] (internal-component)
  - SimpleIpoCard -> src/app/ipo/page.tsx [1812 lines] (internal-component)
  - UpcomingIpoCard -> src/app/ipo/page.tsx [1812 lines] (internal-component)
```

### Route: /ipo/[ipoId]
- Parent file: src/app/ipo/[ipoId]/page.tsx
- Direct child components: CursiveLoader -> src/components/ui/CursiveLoader.tsx
- Internal child components: -
- Intrinsic UI elements: button, div, h1, h2, p, section, span, table, tbody, td, th, thead, tr
- Tab systems: -
- Nested component tree:
```txt
- src/app/ipo/[ipoId]/page.tsx [660 lines] (root)
  - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
```

### Route: /learn
- Parent file: src/app/learn/page.tsx
- Direct child components: PageBackground -> src/components/layout/PageBackground.tsx
- Internal child components: -
- Intrinsic UI elements: button, div, h1, h2, h3, input, main, p, section, span, table, tbody, td, th, thead, tr
- Tab systems: -
- Nested component tree:
```txt
- src/app/learn/page.tsx [373 lines] (root)
  - PageBackground -> src/components/layout/PageBackground.tsx [23 lines] (imported-file)
```

### Route: /login
- Parent file: src/app/login/page.tsx
- Direct child components: -
- Internal child components: LoginContent
- Intrinsic UI elements: button, div, form, h1, h2, input, label, p, path, span, svg
- Tab systems: -
- Nested component tree:
```txt
- src/app/login/page.tsx [256 lines] (root)
  - LoginContent -> src/app/login/page.tsx [256 lines] (internal-component)
```

### Route: /market
- Parent file: src/app/market/page.tsx
- Direct child components: CursiveLoader -> src/components/ui/CursiveLoader.tsx
- Internal child components: HeatMap, MarketBreadth, MarketIndices, MostActive, SectorPerformance, SectorTooltip, TopMovers
- Intrinsic UI elements: button, div, h1, h3, h4, p, span, table, tbody, td, th, thead, tr
- Tab systems: -
- Nested component tree:
```txt
- src/app/market/page.tsx [1253 lines] (root)
  - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
  - HeatMap -> src/app/market/page.tsx [1253 lines] (internal-component)
  - MarketBreadth -> src/app/market/page.tsx [1253 lines] (internal-component)
  - MarketIndices -> src/app/market/page.tsx [1253 lines] (internal-component)
  - MostActive -> src/app/market/page.tsx [1253 lines] (internal-component)
  - SectorPerformance -> src/app/market/page.tsx [1253 lines] (internal-component)
  - SectorTooltip -> src/app/market/page.tsx [1253 lines] (internal-component)
  - TopMovers -> src/app/market/page.tsx [1253 lines] (internal-component)
```

### Route: /market/institutional
- Parent file: src/app/market/institutional/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: div, h1, h2, p, pre, span
- Tab systems: -
- Nested component tree:
```txt
- src/app/market/institutional/page.tsx [203 lines] (root)
```

### Route: /news
- Parent file: src/app/news/page.tsx
- Direct child components: NewsPageClient -> src/app/news/page-client.tsx
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/news/page.tsx [11 lines] (root)
  - NewsPageClient -> src/app/news/page-client.tsx [302 lines] (imported-file)
    - FeaturedNews -> src/components/News/FeaturedNews.tsx [216 lines] (imported-file)
    - MarketNews -> src/components/News/MarketNews.tsx [173 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
    - NewsCategoryTabs -> src/components/News/NewsCategoryTabs.tsx [142 lines] (imported-file)
    - SectorNews -> src/components/News/SectorNews.tsx [242 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - TrendingTopics -> src/components/News/TrendingTopics.tsx [161 lines] (imported-file)
```

### Route: /news/alerts
- Parent file: src/app/news/alerts/page.tsx
- Direct child components: AlertsNewsPageClient -> src/app/news/alerts/page-client.tsx
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/news/alerts/page.tsx [11 lines] (root)
  - AlertsNewsPageClient -> src/app/news/alerts/page-client.tsx [79 lines] (imported-file)
```

### Route: /news/companies
- Parent file: src/app/news/companies/page.tsx
- Direct child components: CompaniesNewsPageClient -> src/app/news/companies/page-client.tsx
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/news/companies/page.tsx [11 lines] (root)
  - CompaniesNewsPageClient -> src/app/news/companies/page-client.tsx [73 lines] (imported-file)
```

### Route: /news/economy
- Parent file: src/app/news/economy/page.tsx
- Direct child components: EconomyNewsPageClient -> src/app/news/economy/page-client.tsx
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/news/economy/page.tsx [11 lines] (root)
  - EconomyNewsPageClient -> src/app/news/economy/page-client.tsx [73 lines] (imported-file)
```

### Route: /news/markets
- Parent file: src/app/news/markets/page.tsx
- Direct child components: MarketsNewsPageClient -> src/app/news/markets/page-client.tsx
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/news/markets/page.tsx [11 lines] (root)
  - MarketsNewsPageClient -> src/app/news/markets/page-client.tsx [73 lines] (imported-file)
```

### Route: /news/trending
- Parent file: src/app/news/trending/page.tsx
- Direct child components: TrendingNewsPageClient -> src/app/news/trending/page-client.tsx
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/news/trending/page.tsx [11 lines] (root)
  - TrendingNewsPageClient -> src/app/news/trending/page-client.tsx [78 lines] (imported-file)
```

### Route: /notifications
- Parent file: src/app/notifications/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, form, h1, h2, input, option, p, pre, select
- Tab systems: -
- Nested component tree:
```txt
- src/app/notifications/page.tsx [239 lines] (root)
```

### Route: /portfolio
- Parent file: src/app/portfolio/page.tsx
- Direct child components: PortfolioDashboard -> src/components/portfolio/PortfolioDashboard.tsx
- Internal child components: -
- Intrinsic UI elements: -
- Tab systems: -
- Nested component tree:
```txt
- src/app/portfolio/page.tsx [8 lines] (root)
  - PortfolioDashboard -> src/components/portfolio/PortfolioDashboard.tsx [774 lines] (imported-file)
```

### Route: /privacy
- Parent file: src/app/privacy/page.tsx
- Direct child components: PageBackground -> src/components/layout/PageBackground.tsx
- Internal child components: -
- Intrinsic UI elements: br, div, h1, h2, h3, li, main, p, section, span, strong, ul
- Tab systems: -
- Nested component tree:
```txt
- src/app/privacy/page.tsx [429 lines] (root)
  - PageBackground -> src/components/layout/PageBackground.tsx [23 lines] (imported-file)
```

### Route: /settings
- Parent file: src/app/settings/page.tsx
- Direct child components: SettingsPageShell -> src/components/settings/SettingsPageShell.tsx
- Internal child components: SettingsPageFallback
- Intrinsic UI elements: div
- Tab systems: -
- Nested component tree:
```txt
- src/app/settings/page.tsx [20 lines] (root)
  - SettingsPageShell -> src/components/settings/SettingsPageShell.tsx [184 lines] (imported-file)
    - LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx [19 lines] (imported-file)
      - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
    - SettingsSidebar -> src/components/settings/SettingsSidebar.tsx [144 lines] (imported-file)
      - SidebarContent -> src/components/settings/SettingsSidebar.tsx [144 lines] (internal-component)
    - BasicDetails -> src/components/settings/BasicDetails.tsx [381 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
      - Input -> src/components/ui/input.tsx [24 lines] (imported-file)
      - LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx [19 lines] (imported-file)
        - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
      - EditableRow -> src/components/settings/BasicDetails.tsx [381 lines] (internal-component)
    - Reports -> src/components/settings/Reports.tsx [168 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
      - LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx [19 lines] (imported-file)
        - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
    - ActiveDevices -> src/components/settings/ActiveDevices.tsx [197 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
      - LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx [19 lines] (imported-file)
        - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
    - ChangePassword -> src/components/settings/ChangePassword.tsx [294 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
      - Input -> src/components/ui/input.tsx [24 lines] (imported-file)
      - LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx [19 lines] (imported-file)
        - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
      - PasswordInput -> src/components/settings/ChangePassword.tsx [294 lines] (internal-component)
    - TradingDetails -> src/components/settings/TradingDetails.tsx [232 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
      - Input -> src/components/ui/input.tsx [24 lines] (imported-file)
      - LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx [19 lines] (imported-file)
        - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
      - Field -> src/components/settings/TradingDetails.tsx [232 lines] (internal-component)
      - ToggleRow -> src/components/settings/TradingDetails.tsx [232 lines] (internal-component)
    - SuspiciousActivity -> src/components/settings/SuspiciousActivity.tsx [192 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
      - LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx [19 lines] (imported-file)
        - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
      - SummaryTile -> src/components/settings/SuspiciousActivity.tsx [192 lines] (internal-component)
    - SectionSkeleton -> src/components/settings/SettingsPageShell.tsx [184 lines] (internal-component)
  - SettingsPageFallback -> src/app/settings/page.tsx [20 lines] (internal-component)
```

### Route: /signup
- Parent file: src/app/signup/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, form, h1, h2, input, label, p, path, span, svg
- Tab systems: -
- Nested component tree:
```txt
- src/app/signup/page.tsx [333 lines] (root)
```

### Route: /sitemap
- Parent file: src/app/sitemap/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: div, h1, h2, header, li, main, p, section, ul
- Tab systems: -
- Nested component tree:
```txt
- src/app/sitemap/page.tsx [38 lines] (root)
```

### Route: /stock-search
- Parent file: src/app/stock-search/page.tsx
- Direct child components: Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; EnhancedStockCard -> src/components/stocks/EnhancedStockCard.tsx; SearchBar -> src/app/components/SearchBar.tsx
- Internal child components: -
- Intrinsic UI elements: button, div, h1, h2, p
- Tab systems: -
- Nested component tree:
```txt
- src/app/stock-search/page.tsx [166 lines] (root)
  - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - EnhancedStockCard -> src/components/stocks/EnhancedStockCard.tsx [284 lines] (imported-file)
  - SearchBar -> src/app/components/SearchBar.tsx [339 lines] (imported-file)
    - StockLogo -> src/app/components/StockLogo.tsx [67 lines] (imported-file)
```

### Route: /stocks
- Parent file: src/app/stocks/page.tsx
- Direct child components: Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; CursiveLoader -> src/components/ui/CursiveLoader.tsx; EnhancedStockCard -> src/components/stocks/EnhancedStockCard.tsx; GlowCard -> src/components/spotlight-card.tsx
- Internal child components: StocksSurfaceCard
- Intrinsic UI elements: button, canvas, div, h1, h2, h3, h4, p, section, span, table, tbody, td, th, thead, tr
- Tab systems: -
- Nested component tree:
```txt
- src/app/stocks/page.tsx [2322 lines] (root)
  - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
  - EnhancedStockCard -> src/components/stocks/EnhancedStockCard.tsx [284 lines] (imported-file)
  - GlowCard -> src/components/spotlight-card.tsx [83 lines] (imported-file)
  - StocksSurfaceCard -> src/app/stocks/page.tsx [2322 lines] (internal-component)
```

### Route: /stocks/[symbol]
- Parent file: src/app/stocks/[symbol]/page.tsx
- Direct child components: CursiveLoader -> src/components/ui/CursiveLoader.tsx; ESGMetrics -> src/components/stocks/ESGMetrics.tsx; FundamentalAnalysis -> src/components/stocks/FundamentalAnalysis.tsx; FutureGrowthPotential -> src/components/stocks/FutureGrowthPotential.tsx; IndustryAnalysis -> src/components/stocks/IndustryAnalysis.tsx; InstitutionalInvestment -> src/components/stocks/InstitutionalInvestment.tsx; MacroeconomicIndicators -> src/components/stocks/MacroeconomicIndicators.tsx; ManagementGovernance -> src/components/stocks/ManagementGovernance.tsx; MetricCard -> src/components/stocks/MetricCard.tsx; Overview -> src/components/stocks/Overview.tsx; RiskAssessment -> src/components/stocks/RiskAssessment.tsx; SentimentAnalysis -> src/components/stocks/SentimentAnalysis.tsx; TechnicalAnalysis -> src/components/stocks/TechnicalAnalysis.tsx
- Internal child components: -
- Intrinsic UI elements: button, div, h1, h2, h3, p, span
- Tab systems: Tabs
- Nested component tree:
```txt
- src/app/stocks/[symbol]/page.tsx [1150 lines] (root)
  - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
  - ESGMetrics -> src/components/stocks/ESGMetrics.tsx [534 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - FundamentalAnalysis -> src/components/stocks/FundamentalAnalysis.tsx [128 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CursiveLoader -> src/components/ui/CursiveLoader.tsx [64 lines] (imported-file)
    - FinancialStatements -> src/components/stocks/FinancialStatements.tsx [177 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
      - Table -> src/components/ui/table.tsx [117 lines] (imported-file)
      - TableBody -> src/components/ui/table.tsx [117 lines] (imported-file)
      - TableCell -> src/components/ui/table.tsx [117 lines] (imported-file)
      - TableHead -> src/components/ui/table.tsx [117 lines] (imported-file)
      - TableHeader -> src/components/ui/table.tsx [117 lines] (imported-file)
      - TableRow -> src/components/ui/table.tsx [117 lines] (imported-file)
      - Tabs -> src/components/ui/tabs.tsx [53 lines] (imported-file)
      - TabsContent -> src/components/ui/tabs.tsx [53 lines] (imported-file)
      - TabsList -> src/components/ui/tabs.tsx [53 lines] (imported-file)
      - TabsTrigger -> src/components/ui/tabs.tsx [53 lines] (imported-file)
  - FutureGrowthPotential -> src/components/stocks/FutureGrowthPotential.tsx [664 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - IndustryAnalysis -> src/components/stocks/IndustryAnalysis.tsx [509 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - InstitutionalInvestment -> src/components/stocks/InstitutionalInvestment.tsx [510 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - MacroeconomicIndicators -> src/components/stocks/MacroeconomicIndicators.tsx [392 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - ManagementGovernance -> src/components/stocks/ManagementGovernance.tsx [564 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - MetricCard -> src/components/stocks/MetricCard.tsx [73 lines] (imported-file)
  - Overview -> src/components/stocks/Overview.tsx [153 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardDescription -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
    - FinancialHighlights -> src/components/stocks/FinancialHighlights.tsx [172 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
    - ManagementInfo -> src/components/stocks/ManagementInfo.tsx [182 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
    - StockNewsSection -> src/components/stocks/StockNewsSection.tsx [119 lines] (imported-file)
      - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
      - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - RiskAssessment -> src/components/stocks/RiskAssessment.tsx [315 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - SentimentAnalysis -> src/components/stocks/SentimentAnalysis.tsx [431 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
  - TechnicalAnalysis -> src/components/stocks/TechnicalAnalysis.tsx [376 lines] (imported-file)
    - Card -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardContent -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardHeader -> src/components/ui/card.tsx [82 lines] (imported-file)
    - CardTitle -> src/components/ui/card.tsx [82 lines] (imported-file)
```

### Route: /terms
- Parent file: src/app/terms/page.tsx
- Direct child components: PageBackground -> src/components/layout/PageBackground.tsx
- Internal child components: -
- Intrinsic UI elements: br, div, h1, h2, h3, li, main, p, section, strong, ul
- Tab systems: -
- Nested component tree:
```txt
- src/app/terms/page.tsx [227 lines] (root)
  - PageBackground -> src/components/layout/PageBackground.tsx [23 lines] (imported-file)
```

### Route: /watchlists
- Parent file: src/app/watchlists/page.tsx
- Direct child components: -
- Internal child components: -
- Intrinsic UI elements: button, div, form, h1, h2, input, p
- Tab systems: -
- Nested component tree:
```txt
- src/app/watchlists/page.tsx [351 lines] (root)
```

## 6. Sub-pages and sub-tabs matrix (news categories, settings tabs, dynamic routes)
| Category | Entries |
| --- | --- |
| News related routes | /news, /news/alerts, /news/companies, /news/economy, /news/markets, /news/trending |
| News category tabs (from component) | All News -> /news; Markets -> /news/markets; Economy -> /news/economy; Companies -> /news/companies; Trending -> /news/trending; Alerts -> /news/alerts |
| Settings related routes | /settings |
| Settings query tabs (from config) | Basic details -> /settings?tab=basic; Reports -> /settings?tab=reports; Active devices -> /settings?tab=devices; Change password -> /settings?tab=password; Trading details -> /settings?tab=trading; Suspicious activity -> /settings?tab=suspicious |
| Dynamic routes | /ipo/[ipoId], /stocks/[symbol] |

## 7. Route handler audit (src/app/**/route.*)
| Handler route | File | Lines | Methods |
| --- | --- | --- | --- |
| /api/health | src/app/api/health/route.ts | 10 | GET |

## 8. Module audit (src/components and src/app/components)
| Module file | Direct child components | Intrinsic tags | Reachable from any route | Tab systems |
| --- | --- | --- | --- | --- |
| src/app/components/CommoditiesTable.tsx | Badge -> src/components/ui/badge.tsx; Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; CursiveLoader -> src/components/ui/CursiveLoader.tsx; Table -> src/components/ui/table.tsx; TableBody -> src/components/ui/table.tsx; TableCell -> src/components/ui/table.tsx; TableHead -> src/components/ui/table.tsx; TableHeader -> src/components/ui/table.tsx; TableRow -> src/components/ui/table.tsx; Tabs -> src/components/ui/tabs.tsx; TabsContent -> src/components/ui/tabs.tsx; TabsList -> src/components/ui/tabs.tsx; TabsTrigger -> src/components/ui/tabs.tsx | div | no | Tabs, TabsList, TabsTrigger, TabsContent |
| src/app/components/CompanyHeader.tsx | StockLogo -> src/app/components/StockLogo.tsx | div, h1, span | no | - |
| src/app/components/CompanyProfileCard.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | button, div, h3, p, span | no | - |
| src/app/components/DataSummaryCard.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, p | no | - |
| src/app/components/FinancialStatementsSection.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Tabs -> src/components/ui/tabs.tsx; TabsList -> src/components/ui/tabs.tsx; TabsTrigger -> src/components/ui/tabs.tsx | button, div, input, label, span, table, tbody, td, th, thead, tr | no | Tabs, TabsList, TabsTrigger |
| src/app/components/Footer.tsx | - | a, div, footer, p, span | no | - |
| src/app/components/HighLowTable.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; CursiveLoader -> src/components/ui/CursiveLoader.tsx; Table -> src/components/ui/table.tsx; TableBody -> src/components/ui/table.tsx; TableCell -> src/components/ui/table.tsx; TableHead -> src/components/ui/table.tsx; TableHeader -> src/components/ui/table.tsx; TableRow -> src/components/ui/table.tsx; Tabs -> src/components/ui/tabs.tsx; TabsContent -> src/components/ui/tabs.tsx; TabsList -> src/components/ui/tabs.tsx; TabsTrigger -> src/components/ui/tabs.tsx | div, h3 | no | Tabs, TabsList, TabsTrigger, TabsContent |
| src/app/components/ManagementTeamSection.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | button, div, h3, p, span | no | - |
| src/app/components/Navigation.tsx | Button -> src/components/ui/button.tsx; SearchBar -> src/app/components/SearchBar.tsx | div, nav, span | no | - |
| src/app/components/PeerComparisonTable.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; StockLogo -> src/app/components/StockLogo.tsx | div, span, table, tbody, td, th, thead, tr | no | - |
| src/app/components/SearchBar.tsx | StockLogo -> src/app/components/StockLogo.tsx | button, div, form, input, li, p, span, ul | yes | - |
| src/app/components/StockLogo.tsx | - | div | yes | - |
| src/app/components/StockTechnicalChart.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | button, div, p | no | - |
| src/app/components/TargetPriceAnalysis.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; CursiveLoader -> src/components/ui/CursiveLoader.tsx; Progress -> src/components/ui/progress.tsx | div, span | no | - |
| src/components/dashboard/CommoditiesTable.tsx | Badge -> src/components/ui/badge.tsx; Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Table -> src/components/ui/table.tsx; TableBody -> src/components/ui/table.tsx; TableCell -> src/components/ui/table.tsx; TableHead -> src/components/ui/table.tsx; TableHeader -> src/components/ui/table.tsx; TableRow -> src/components/ui/table.tsx | div, p, span | no | - |
| src/components/dashboard/PortfolioList.tsx | - | button, div, h2, h3, p | no | - |
| src/components/dashboard/WatchlistSection.tsx | LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx | button, div, h2, p, table, tbody, td, th, thead, tr | no | - |
| src/components/ErrorBoundary.tsx | - | button, details, div, h2, p, summary | yes | - |
| src/components/home/AnalysisFeatures.tsx | - | div, g, h2, h3, li, line, p, span, svg, ul | yes | - |
| src/components/home/CtaSection.tsx | Button -> src/components/ui/button.tsx | div, h2, p, section, span | yes | - |
| src/components/home/FeaturedStocks.tsx | Button -> src/components/ui/button.tsx | div, h3, p, span | yes | - |
| src/components/home/HeroSection.tsx | Button -> src/components/ui/button.tsx | circle, defs, div, g, h1, h2, linearGradient, p, path, section, span, stop, svg | yes | - |
| src/components/home/IpoSection.tsx | Button -> src/components/ui/button.tsx | a, button, div, p, span | yes | - |
| src/components/home/LatestNews.tsx | - | - | no | - |
| src/components/home/MarketOverview.tsx | - | div, h3, polyline, span, svg | yes | - |
| src/components/home/SectorPerformance.tsx | - | div, h3 | yes | - |
| src/components/IPO/IPOTable.tsx | Badge -> src/components/ui/badge.tsx; Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Table -> src/components/ui/table.tsx; TableBody -> src/components/ui/table.tsx; TableCell -> src/components/ui/table.tsx; TableHead -> src/components/ui/table.tsx; TableHeader -> src/components/ui/table.tsx; TableRow -> src/components/ui/table.tsx | div, p | no | - |
| src/components/KeepAlive.tsx | - | - | yes | - |
| src/components/layout/AppShell.tsx | Footer -> src/components/layout/Footer.tsx; Header -> src/components/layout/Header.tsx | main | yes | - |
| src/components/layout/ClientScrollProgressIndicator.jsx | ErrorBoundary -> src/components/ErrorBoundary.tsx; ScrollProgressIndicator -> src/components/layout/ScrollProgressIndicator.jsx | - | no | - |
| src/components/layout/Footer.tsx | - | a, div, footer, h3, li, p, span, ul | yes | - |
| src/components/layout/Header.tsx | SearchBar -> src/app/components/SearchBar.tsx; ThemeToggle -> src/components/ui/ThemeToggle.tsx | button, div, header, nav, p, span | yes | - |
| src/components/layout/PageBackground.tsx | - | div | yes | - |
| src/components/layout/ScrollProgressIndicator.jsx | - | div | no | - |
| src/components/market/HeatMap.tsx | - | - | no | - |
| src/components/market/HighLowTable.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Table -> src/components/ui/table.tsx; TableBody -> src/components/ui/table.tsx; TableCell -> src/components/ui/table.tsx; TableRow -> src/components/ui/table.tsx; Tabs -> src/components/ui/tabs.tsx; TabsContent -> src/components/ui/tabs.tsx; TabsList -> src/components/ui/tabs.tsx; TabsTrigger -> src/components/ui/tabs.tsx | button, div, p | no | Tabs, TabsList, TabsTrigger, TabsContent |
| src/components/market/MarketBreadth.tsx | - | - | no | - |
| src/components/market/MarketIndices.tsx | - | - | no | - |
| src/components/market/MostActive.tsx | - | - | no | - |
| src/components/market/SectorPerformance.tsx | - | - | no | - |
| src/components/market/TopMovers.tsx | - | - | no | - |
| src/components/News/FeaturedNews.new.tsx | - | a, button, div, h1, img, p, span | no | - |
| src/components/News/FeaturedNews.tsx | - | a, button, div, h1, img, p, span | yes | - |
| src/components/News/MarketNews.new.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | a, div, h3, img, p, span | no | - |
| src/components/News/MarketNews.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | a, button, div, h3, img, p, span | yes | - |
| src/components/News/news.tsx | - | div, h1, h2, h3, img, p, span | no | - |
| src/components/News/NewsCategoryTabs.tsx | - | button, div | yes | Tabs, NewsCategoryTabs |
| src/components/News/SectorNews.new.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx | a, button, div, h3, img, p, span | no | Tabs |
| src/components/News/SectorNews.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx | a, button, div, h3, img, p, span | yes | Tabs |
| src/components/News/TrendingTopics.tsx | - | a, div, li, span, ul | yes | - |
| src/components/portfolio/PortfolioDashboard.tsx | - | button, circle, details, div, form, h1, h3, input, option, p, pre, select, span, summary, svg, table, tbody, td, th, thead, tr | yes | - |
| src/components/portfolio/PortfolioForm.tsx | - | button, div, form, h1, h2, h3, input, label, li, p, strong, table, tbody, td, th, thead, tr, ul | no | - |
| src/components/portfolio/PortfolioList.tsx | - | button, div, h2, h3, p | no | - |
| src/components/providers/AppQueryProvider.tsx | - | - | yes | - |
| src/components/providers/HotToastProvider.tsx | - | - | yes | - |
| src/components/settings/ActiveDevices.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx | button, div, h3, p | yes | - |
| src/components/settings/BasicDetails.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Input -> src/components/ui/input.tsx; LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx | button, div, form, h3, option, p, section, select, span, textarea | yes | - |
| src/components/settings/ChangePassword.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Input -> src/components/ui/input.tsx; LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx | button, div, form, h3, label, p, section, span | yes | - |
| src/components/settings/Reports.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx | a, button, div, h3, h4, p | yes | - |
| src/components/settings/settings-config.ts | - | - | no | Tabs, settingsTabs |
| src/components/settings/SettingsPageShell.tsx | LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx; SettingsSidebar -> src/components/settings/SettingsSidebar.tsx; BasicDetails -> src/components/settings/BasicDetails.tsx; Reports -> src/components/settings/Reports.tsx; ActiveDevices -> src/components/settings/ActiveDevices.tsx; ChangePassword -> src/components/settings/ChangePassword.tsx; TradingDetails -> src/components/settings/TradingDetails.tsx; SuspiciousActivity -> src/components/settings/SuspiciousActivity.tsx | button, div, h1, header, main, p | yes | SettingsSidebar, query param tab= |
| src/components/settings/SettingsSidebar.tsx | - | aside, button, div, h2, nav, p, span | yes | Tabs, SettingsSidebar, settingsTabs |
| src/components/settings/SuspiciousActivity.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx | button, div, h3, p, span | yes | - |
| src/components/settings/TradingDetails.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Input -> src/components/ui/input.tsx; LoadingSkeleton -> src/components/ui/LoadingSkeleton.tsx | button, div, form, h3, input, label, option, p, section, select, span, textarea | yes | - |
| src/components/spotlight-card.tsx | - | div | yes | - |
| src/components/stocks/AboutCompany.tsx | - | - | no | - |
| src/components/stocks/CompanyInfo.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | a, div, h2, h3, p, span | no | - |
| src/components/stocks/CompanyProfileCard.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | button, div, h3, p, span | no | - |
| src/components/stocks/DataSummaryCard.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, p | no | - |
| src/components/stocks/EnhancedStockCard.tsx | - | button, div, h3, span | yes | - |
| src/components/stocks/ESGMetrics.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h3, p, span | yes | - |
| src/components/stocks/FinancialHighlights.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h3, p, span | yes | - |
| src/components/stocks/FinancialMetricsGrid.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, p, span | no | - |
| src/components/stocks/FinancialStatements.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; Table -> src/components/ui/table.tsx; TableBody -> src/components/ui/table.tsx; TableCell -> src/components/ui/table.tsx; TableHead -> src/components/ui/table.tsx; TableHeader -> src/components/ui/table.tsx; TableRow -> src/components/ui/table.tsx; Tabs -> src/components/ui/tabs.tsx; TabsContent -> src/components/ui/tabs.tsx; TabsList -> src/components/ui/tabs.tsx; TabsTrigger -> src/components/ui/tabs.tsx | div, p, span | yes | Tabs, TabsList, TabsTrigger, TabsContent |
| src/components/stocks/FundamentalAnalysis.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; CursiveLoader -> src/components/ui/CursiveLoader.tsx; FinancialStatements -> src/components/stocks/FinancialStatements.tsx | div, p, span | yes | - |
| src/components/stocks/FutureGrowthPotential.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h3, p, span, table, tbody, td, th, thead, tr | yes | - |
| src/components/stocks/IndustryAnalysis.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h4, p, span, table, tbody, td, th, thead, tr | yes | - |
| src/components/stocks/InstitutionalInvestment.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h4, span, table, tbody, td, th, thead, tr | yes | - |
| src/components/stocks/MacroeconomicIndicators.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h4, p, span | yes | - |
| src/components/stocks/ManagementGovernance.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h4, p, span | yes | - |
| src/components/stocks/ManagementInfo.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | button, div, h3, p, span | yes | - |
| src/components/stocks/ManagementTeamSection.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | button, div, h3, p, span | no | - |
| src/components/stocks/MetricCard.tsx | - | div, h3, p, span | yes | - |
| src/components/stocks/NewsCard.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardFooter -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx | div, h3, img, p, span | no | - |
| src/components/stocks/NewsGrid.tsx | NewsCard -> src/components/stocks/NewsCard.tsx | a, div, h2, p | no | - |
| src/components/stocks/Overview.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; FinancialHighlights -> src/components/stocks/FinancialHighlights.tsx; ManagementInfo -> src/components/stocks/ManagementInfo.tsx; StockNewsSection -> src/components/stocks/StockNewsSection.tsx | canvas, div, span | yes | - |
| src/components/stocks/RiskAssessment.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, span | yes | - |
| src/components/stocks/SentimentAnalysis.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h4, p, span | yes | - |
| src/components/stocks/StockLogo.tsx | - | div | no | - |
| src/components/stocks/StockNewsSection.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | a, div, h3, img, p, span | yes | - |
| src/components/stocks/TargetPriceAnalysis.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardDescription -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx; CursiveLoader -> src/components/ui/CursiveLoader.tsx; Progress -> src/components/ui/progress.tsx | div, span | no | - |
| src/components/stocks/TechnicalAnalysis.tsx | Card -> src/components/ui/card.tsx; CardContent -> src/components/ui/card.tsx; CardHeader -> src/components/ui/card.tsx; CardTitle -> src/components/ui/card.tsx | div, h4, p, span | yes | - |
| src/components/ui/accordion.tsx | - | div | yes | - |
| src/components/ui/animated-underline-text-one.tsx | - | div, h1, path, svg | no | - |
| src/components/ui/badge.tsx | - | div | no | - |
| src/components/ui/button.tsx | - | - | yes | - |
| src/components/ui/CacheStatus.tsx | - | button, div, h3, h4, span | no | - |
| src/components/ui/card.tsx | - | div, h3, p | yes | - |
| src/components/ui/CursiveLoader.tsx | - | div, span | yes | - |
| src/components/ui/infinite-slider.tsx | - | div | yes | - |
| src/components/ui/input.tsx | - | input | yes | - |
| src/components/ui/LoadingSkeleton.tsx | CursiveLoader -> src/components/ui/CursiveLoader.tsx | div | yes | - |
| src/components/ui/market-entity-ticker.tsx | InfiniteSlider -> src/components/ui/infinite-slider.tsx; ProgressiveBlur -> src/components/ui/progressive-blur.tsx | div, img, p, span | yes | - |
| src/components/ui/market-network-section.tsx | MarketEntityTicker -> src/components/ui/market-entity-ticker.tsx | div, h2, span | yes | - |
| src/components/ui/ModalContainer.tsx | - | button, div, h2 | yes | - |
| src/components/ui/neon-button.tsx | - | button | no | - |
| src/components/ui/progress.tsx | - | div | no | - |
| src/components/ui/progressive-blur.tsx | - | div | yes | - |
| src/components/ui/SectionReveal.tsx | - | div | yes | - |
| src/components/ui/table.tsx | - | caption, div, table, tbody, td, tfoot, th, thead, tr | yes | - |
| src/components/ui/tabs.tsx | - | - | yes | Tabs, TabsList, TabsTrigger, TabsContent |
| src/components/ui/text-rotate.tsx | - | div, span | no | - |
| src/components/ui/ThemeProvider.tsx | - | - | yes | - |
| src/components/ui/ThemeToggle.tsx | - | button, div | yes | - |
| src/components/ui/Toasts.tsx | - | button, div | no | - |

## 9. Orphan/unreachable components list
- src/app/components/CommoditiesTable.tsx
- src/app/components/CompanyHeader.tsx
- src/app/components/CompanyProfileCard.tsx
- src/app/components/DataSummaryCard.tsx
- src/app/components/FinancialStatementsSection.tsx
- src/app/components/Footer.tsx
- src/app/components/HighLowTable.tsx
- src/app/components/ManagementTeamSection.tsx
- src/app/components/Navigation.tsx
- src/app/components/PeerComparisonTable.tsx
- src/app/components/StockTechnicalChart.tsx
- src/app/components/TargetPriceAnalysis.tsx
- src/components/dashboard/CommoditiesTable.tsx
- src/components/dashboard/PortfolioList.tsx
- src/components/dashboard/WatchlistSection.tsx
- src/components/home/LatestNews.tsx
- src/components/IPO/IPOTable.tsx
- src/components/layout/ClientScrollProgressIndicator.jsx
- src/components/layout/ScrollProgressIndicator.jsx
- src/components/market/HeatMap.tsx
- src/components/market/HighLowTable.tsx
- src/components/market/MarketBreadth.tsx
- src/components/market/MarketIndices.tsx
- src/components/market/MostActive.tsx
- src/components/market/SectorPerformance.tsx
- src/components/market/TopMovers.tsx
- src/components/News/FeaturedNews.new.tsx
- src/components/News/MarketNews.new.tsx
- src/components/News/news.tsx
- src/components/News/SectorNews.new.tsx
- src/components/portfolio/PortfolioForm.tsx
- src/components/portfolio/PortfolioList.tsx
- src/components/settings/settings-config.ts
- src/components/stocks/AboutCompany.tsx
- src/components/stocks/CompanyInfo.tsx
- src/components/stocks/CompanyProfileCard.tsx
- src/components/stocks/DataSummaryCard.tsx
- src/components/stocks/FinancialMetricsGrid.tsx
- src/components/stocks/ManagementTeamSection.tsx
- src/components/stocks/NewsCard.tsx
- src/components/stocks/NewsGrid.tsx
- src/components/stocks/StockLogo.tsx
- src/components/stocks/TargetPriceAnalysis.tsx
- src/components/ui/animated-underline-text-one.tsx
- src/components/ui/badge.tsx
- src/components/ui/CacheStatus.tsx
- src/components/ui/neon-button.tsx
- src/components/ui/progress.tsx
- src/components/ui/text-rotate.tsx
- src/components/ui/Toasts.tsx

## 10. Risks and recommendations
- Risk: orphan components increase maintenance cost and dead code exposure.
- Risk: deep route trees can hide UI inconsistencies across nested pages.
- Recommendation: enforce route-level ownership and remove or document orphan modules.
- Recommendation: consolidate tab systems to shared primitives for consistent behavior.
- Recommendation: add CI checks for route coverage and redirect alias validation.
