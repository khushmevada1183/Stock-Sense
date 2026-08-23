# Unified Page Background — Remove Header Foreground Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the misaligned header/footer foreground backgrounds so the dynamic-island nav, body, and footer all share one continuous page background on every route.

**Architecture:** Treat `html`/`body` (`--app-bg` + fixed radial accents) as the **only** page canvas. Make `AppShell` `<main>`, `<header>`, and `<footer>` transparent. Keep the header pill and footer as **border + blur glass** using `--app-bg-elevated` at low opacity — not opaque `#0f172a` / `#ffffff` blocks. Delete the `globals.css` “Dynamic-island glassmorphism” `!important` overrides that force a solid rectangle behind the pill.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS, CSS custom properties in `src/app/globals.css`, `AppShell`, `Header`, `Footer`.

## Global Constraints

- Frontend project root: `Stock-Sense-main/` (run all commands from there).
- Use `npm` (not pnpm).
- Do not add new dependencies.
- Preserve existing header pill shape, nav items, search, account menu — layout/behavior only; background alignment fix.
- Auth routes (`/login`, `/signup`, `/settings`, `/auth/*`) must keep chrome hidden via `AppShell`.
- Panel/card surfaces (`panelShellClass`, `contentCardClass`) stay elevated — only **page chrome** becomes transparent.
- Dark `--app-bg`: `#0b1117`; light `--app-bg`: `#f4f7f8` (from `globals.css` `:root` / `.dark`).
- Visual walk baseline: 108/108 clean (`docs/design-audit/visual-walk/VISUAL_WALK_REPORT.md`).

---

## File Map

| File | Responsibility |
| --- | --- |
| `src/app/globals.css` | Page bg tokens; `.header-pill` styles; **remove** forced solid header overrides (~L1454–1514) |
| `src/components/layout/AppShell.tsx` | Remove competing `bg-slate-50` / `dark:bg-slate-950` on `<main>` |
| `src/components/layout/Header.tsx` | Ensure `<header>` wrapper stays transparent; pill uses shared chrome class |
| `src/components/layout/Footer.tsx` | Remove footer surface fill; border-only separation |
| `src/app/layout.tsx` | Optional: drop redundant `z-20` wrapper if it causes stacking artifacts |
| `src/styles/design-tokens.ts` | Add `pageChromeClass` / `chromeGlassClass` for header pill reuse |
| `scripts/design-audit/visual-walk-routes.mjs` | Add DOM check: no opaque header band mismatched from body |
| `docs/design-audit/visual-walk/MANUAL_VISUAL_AUDIT.md` | Note unified-bg acceptance criteria |

---

## Root Cause (for implementers)

Three different dark backgrounds render at once:

1. **Body:** `--app-bg` → `#0b1117`
2. **Main (`AppShell`):** `dark:bg-slate-950` → `#020617` ← visible seam under header
3. **Header pill (`globals.css`):** forced `#0f172a !important` ← the “foreground layer” rectangle in screenshots

Footer adds a fourth: `bg-[color:var(--app-surface)]/80`.

---

### Task 1: Add shared chrome glass token

**Files:**
- Modify: `src/styles/design-tokens.ts`
- Test: `scripts/design-audit/__tests__/design-heuristics.test.mjs` (optional token export smoke — skip if no test harness for tokens; verify via `npm run lint`)

**Interfaces:**
- Produces: `chromeGlassClass: string` — used by Header pill and mobile menu dropdown

- [ ] **Step 1: Add token**

```typescript
export const chromeGlassClass =
  'border border-[color:var(--app-border)] bg-[color:var(--app-bg-elevated)]/55 shadow-[var(--app-shadow)] backdrop-blur-xl';
```

Place after `contentCardClass` in `src/styles/design-tokens.ts`.

- [ ] **Step 2: Lint**

Run: `cd Stock-Sense-main && npm run lint`
Expected: PASS (no unused export warnings once Task 2 imports it)

- [ ] **Step 3: Commit**

```bash
git add src/styles/design-tokens.ts
git commit -m "feat: add chromeGlassClass for unified header/footer glass"
```

---

### Task 2: Make AppShell main transparent

**Files:**
- Modify: `src/components/layout/AppShell.tsx:35-49`

**Interfaces:**
- Consumes: none
- Produces: transparent `<main>` letting `body` background show through

- [ ] **Step 1: Replace main background classes**

```tsx
// Auth branch (hideChrome)
<main className="min-h-screen flex-grow bg-transparent text-[color:var(--app-text-1)]">

// Default branch
<main className="min-h-screen flex-grow bg-transparent text-[color:var(--app-text-1)]">
```

Remove `bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white` from both branches.

- [ ] **Step 2: Manual check**

Run: `npm run dev`
Open: `http://localhost:3000/`
Expected: Hero section background visually continues under the header area (no darker rectangular band between pill and hero).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppShell.tsx
git commit -m "fix: remove competing main background from AppShell"
```

---

### Task 3: Remove globals.css header foreground overrides

**Files:**
- Modify: `src/app/globals.css:343-354` (`.header-pill` block)
- Modify: `src/app/globals.css:1454-1514` (delete “Dynamic-island glassmorphism” forced solids)
- Modify: `src/app/globals.css:1509-1514` (duplicate dark `.header-pill` override — delete with block)

- [ ] **Step 1: Update base `.header-pill` to glass, not opaque surface**

Replace lines 343–354 with:

```css
/* ── HEADER PILL ── transparent page chrome; glass only on the pill ── */
.header-pill {
  background: color-mix(in srgb, var(--app-bg-elevated) 55%, transparent);
  border-color: var(--app-border);
  box-shadow: var(--app-shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}
```

Remove separate `.dark .header-pill { ... }` duplicate — one rule for both themes.

- [ ] **Step 2: Delete forced solid overrides**

Remove entire block starting at comment `/* Dynamic-island glassmorphism */` through the duplicate `html.dark body header .header-pill { background: #0f172a !important; ... }` (approx lines 1454–1514).

**Do not delete** account-menu-panel overrides below (~L1632+) — those are dropdown surfaces, not page chrome.

- [ ] **Step 3: Verify no other `header .header-pill` solid fills remain**

Run: `rg "header .header-pill|header-pill" src/app/globals.css`
Expected: Only the single glass rule from Step 1 (+ comparison-mode transparent rules).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: remove opaque header-pill foreground overrides"
```

---

### Task 4: Wire Header to chrome glass token

**Files:**
- Modify: `src/components/layout/Header.tsx:241-244, 331-332`

**Interfaces:**
- Consumes: `chromeGlassClass` from `@/styles/design-tokens`
- Produces: transparent `<header>`, pill + mobile menu use `chromeGlassClass`

- [ ] **Step 1: Import token**

```typescript
import { chromeGlassClass } from '@/styles/design-tokens';
```

- [ ] **Step 2: Keep header wrapper transparent**

Confirm / set:

```tsx
<header className="sticky top-0 z-50 w-full bg-transparent">
```

- [ ] **Step 3: Apply token to pill**

Replace:

```tsx
<div className="header-pill relative rounded-full border transition-all duration-300">
```

With:

```tsx
<div className={`header-pill relative rounded-full transition-all duration-300 ${chromeGlassClass}`}>
```

- [ ] **Step 4: Apply token to mobile dropdown**

Replace mobile menu container class:

```tsx
<div className={`header-pill absolute inset-x-2 top-[calc(100%+0.5rem)] z-[60] ... md:hidden ${chromeGlassClass}`}>
```

Remove duplicate `border` / shadow classes already covered by token.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "fix: align header pill with page chrome glass token"
```

---

### Task 5: Align Footer with page background

**Files:**
- Modify: `src/components/layout/Footer.tsx:45-46`

- [ ] **Step 1: Remove footer surface fill**

Replace:

```tsx
<footer className="relative mt-10 border-t border-[color:var(--app-border)] bg-[color:var(--app-surface)]/80 backdrop-blur-xl">
```

With:

```tsx
<footer className="relative mt-10 border-t border-[color:var(--app-border)] bg-transparent">
```

Keep the accent gradient hairline (`absolute ... h-px bg-gradient-to-r ...`).

- [ ] **Step 2: Visual check**

Scroll to footer on `/` in dark + light mode.
Expected: Footer content sits on same page bg as body; only top border separates — no lighter/darker footer band.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "fix: remove footer foreground surface layer"
```

---

### Task 6: Auth route fallbacks + layout wrapper cleanup

**Files:**
- Modify: `src/app/login/page.tsx` (Suspense fallback)
- Modify: `src/app/auth/verify-email/page.tsx` (Suspense fallback)
- Modify: `src/app/auth/verify-reset-code/page.tsx` (Suspense fallback)
- Modify: `src/app/layout.tsx:47` (optional z-index wrapper)

- [ ] **Step 1: Unify auth Suspense fallbacks**

Replace `min-h-screen bg-slate-50 dark:bg-slate-950` with:

```tsx
<div className="min-h-screen bg-transparent" />
```

In all three files.

- [ ] **Step 2: Simplify layout wrapper (optional but recommended)**

In `src/app/layout.tsx`, change:

```tsx
<div className="flex flex-col min-h-screen relative z-20">
```

To:

```tsx
<div className="relative flex min-h-screen flex-col">
```

Removes unnecessary stacking context that can make header bg look like a separate plane.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx src/app/auth/verify-email/page.tsx src/app/auth/verify-reset-code/page.tsx src/app/layout.tsx
git commit -m "fix: unify auth fallbacks and layout stacking with page bg"
```

---

### Task 7: Visual regression guard + full verification

**Files:**
- Modify: `scripts/design-audit/visual-walk-routes.mjs` (add header band check)
- Modify: `docs/design-audit/visual-walk/MANUAL_VISUAL_AUDIT.md`

- [ ] **Step 1: Add header alignment heuristic to visual walk**

In `visual-walk-routes.mjs`, after page load, evaluate:

```javascript
const headerBand = await page.evaluate(() => {
  const header = document.querySelector('header');
  const main = document.querySelector('main');
  if (!header || !main) return { ok: true };
  const hBg = getComputedStyle(header).backgroundColor;
  const mBg = getComputedStyle(main).backgroundColor;
  // transparent mains report rgba(0,0,0,0) or alpha 0
  const mainTransparent = hBg === mBg || getComputedStyle(main).backgroundColor === 'rgba(0, 0, 0, 0)';
  const pill = document.querySelector('.header-pill');
  const pillOpaque = pill && getComputedStyle(pill).backgroundColor.includes('rgb(15, 23, 42)');
  return { ok: mainTransparent && !pillOpaque, hBg, mBg };
});
```

Flag route if `!headerBand.ok` with id `header-foreground-mismatch`.

- [ ] **Step 2: Run lint + build**

```bash
cd Stock-Sense-main
npm run lint
npm run build
```

Expected: PASS

- [ ] **Step 3: Run visual walk**

```bash
node scripts/design-audit/visual-walk-routes.mjs
```

Expected: 108/108 clean, 0 `header-foreground-mismatch`

- [ ] **Step 4: Manual smoke (required)**

| URL | Check |
| --- | --- |
| `/` | No rectangular band behind dynamic island; hero gradient continuous to top |
| `/stocks` | Same unified bg header → content → footer |
| `/login` | Full-page bg, no header/footer, centered panel |
| `/settings?tab=basic` | Settings layout unchanged; sidebar panels still elevated |
| Toggle light/dark | No footer/header color jump |

- [ ] **Step 5: Update audit doc + commit**

```bash
git add scripts/design-audit/visual-walk-routes.mjs docs/design-audit/visual-walk/MANUAL_VISUAL_AUDIT.md docs/design-audit/SHIP_CHECKLIST.md
git commit -m "test: guard unified page background in visual walk"
```

---

## Self-Review Checklist

| Spec requirement | Task |
| --- | --- |
| Remove foreground layer behind dynamic island | Task 3 (delete `!important` solids), Task 4 |
| Same bg for header, body, footer | Tasks 2, 3, 5 |
| All pages aligned | Task 2 (AppShell), Task 6 (auth fallbacks) |
| Keep nav pill visual design | Task 1 + 4 (glass, not removed) |
| Production verification | Task 7 |

No placeholders remain — all steps include concrete paths and code.

---

## Out of Scope (YAGNI)

- Per-page hero radial gradients on `/` (decorative overlays — OK)
- Stock detail / settings **panel** interiors (`panelShellClass`) — stay elevated
- Rewriting all `dark:bg-slate-950` inside content cards across the repo

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-23-unified-page-background.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
