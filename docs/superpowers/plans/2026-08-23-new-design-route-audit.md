# New Design Route Audit & Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a visual design coverage audit of every Stock Sense route (and subtabs) against the portfolio-page benchmark, then roll out the Apple-inspired design system from `docs/new_design.md` page by page.

**Architecture:** Phase 0 combines static heuristics (grep for `glass-card`, `PageBackground`, `panelShellClass`) with Playwright screenshots at `localhost:3000` for all 48+ capture targets from `docs/ui-screenshot-manifest.json`, plus stock-detail and settings/news subtabs. Outputs land in `docs/design-audit/` as JSON, markdown matrix, and a self-contained HTML gallery. Phase 1 extracts shared tokens from `PortfolioDashboard.tsx`; Phase 2+ refactors route clusters using those tokens without changing API behavior.

**Tech Stack:** Next.js 16 (App Router), React 18, Tailwind CSS 3, TypeScript 5, Node `node:test` for script checks, Playwright for screenshots, existing audit scripts in `scripts/generate-route-ui-audit.mjs`.

## Global Constraints

- Design brief: premium, minimal, Apple-inspired; emerald green accent; no noisy gradients; portfolio page is the quality reference (`docs/new_design.md`).
- Preserve all routes, API behavior, and business logic unless a UI refactor requires a safe layout adjustment.
- Run npm commands from `Stock-Sense-main/` (no workspace-root `package.json`).
- Use `npm` (not pnpm); verify scripts against `Stock-Sense-main/package.json`.
- Frontend has no test script today; use Node built-in `node --test` for audit-script unit checks.
- Quote paths containing spaces in shell commands.
- Light and dark mode must both be audited (design brief requires both).
- Accessibility: semantic structure, focus states, keyboard support, contrast (apply during Phase 2+ rollout, not Phase 0).

---

## File Structure (Phase 0 deliverables)

| File | Responsibility |
| --- | --- |
| `scripts/design-audit/classify-routes-design.mjs` | Static heuristic scorer per route file + component tree |
| `scripts/design-audit/capture-route-screenshots.mjs` | Playwright batch screenshot runner |
| `scripts/design-audit/generate-design-matrix.mjs` | Merge static + visual data into reports |
| `scripts/design-audit/design-heuristics.mjs` | Shared scoring constants and helpers |
| `scripts/design-audit/__tests__/design-heuristics.test.mjs` | Unit tests for classifier |
| `docs/design-audit/design-route-baseline.json` | Seed + merged per-route status |
| `docs/design-audit/screenshots/{light\|dark}/` | PNG captures per route/subtab |
| `docs/design-audit/DESIGN_COVERAGE_MATRIX.md` | Human-readable audit report |
| `docs/design-audit/design-coverage-gallery.html` | Visual side-by-side gallery |
| `docs/design-audit/design-coverage-data.json` | Machine-readable final artifact |

## Baseline Classification (static seed — verified 2026-08-23)

Only `/portfolio` uses `panelShellClass` / `dashboard-card` (14 occurrences, all in `PortfolioDashboard.tsx`). Everything else is legacy or partial.

| Status | Routes |
| --- | --- |
| **implemented** | `/portfolio` |
| **partial** | `/`, `/settings`, `/settings?tab=*`, `/news`, `/news/*` |
| **legacy** | All other user-facing routes including `/stocks`, `/stocks/[symbol]`, `/market`, `/ipo`, auth, content pages |
| **skip-visual** | `/auth/login` → `/login`, `/auth/register` → `/signup`, `/auth/profile` → `/settings?tab=basic`, `/api/health` (non-UI) |

Stock detail subtabs (all legacy `glass-card` shell): `overview`, `fundamental`, `technical`, `management`, `industry`, `sentiment`, `institutional`, `macroeconomic`, `esg`, `risk`, `growth`.

---

### Task 1: Design Heuristics Module + Static Route Classifier

**Files:**
- Create: `scripts/design-audit/design-heuristics.mjs`
- Create: `scripts/design-audit/classify-routes-design.mjs`
- Create: `scripts/design-audit/__tests__/design-heuristics.test.mjs`
- Modify: `Stock-Sense-main/package.json` (add scripts)
- Test: `scripts/design-audit/__tests__/design-heuristics.test.mjs`

**Interfaces:**
- Consumes: `docs/route-ui-audit-data.json` (from existing `scripts/generate-route-ui-audit.mjs`)
- Produces: `classifyRouteDesign(sourceText, relFile) → { status, score, signals[] }`, writes `docs/design-audit/design-route-baseline.json`

- [ ] **Step 1: Write the failing test**

```javascript
// scripts/design-audit/__tests__/design-heuristics.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRouteDesign, DESIGN_STATUS } from '../design-heuristics.mjs';

test('portfolio route scores as implemented', () => {
  const sample = `
    const panelShellClass = 'dashboard-card rounded-[28px]';
    return <div className={panelShellClass} />;
  `;
  const result = classifyRouteDesign(sample, 'src/components/portfolio/PortfolioDashboard.tsx');
  assert.equal(result.status, DESIGN_STATUS.IMPLEMENTED);
  assert.ok(result.score >= 80);
});

test('glass-card route scores as legacy', () => {
  const sample = `<div className="glass-card rounded-xl p-6" />`;
  const result = classifyRouteDesign(sample, 'src/app/stocks/[symbol]/page.tsx');
  assert.equal(result.status, DESIGN_STATUS.LEGACY);
  assert.ok(result.signals.includes('glass-card'));
});

test('PageBackground route scores as legacy', () => {
  const sample = `import PageBackground from '@/components/layout/PageBackground';`;
  const result = classifyRouteDesign(sample, 'src/app/faq/page.tsx');
  assert.equal(result.status, DESIGN_STATUS.LEGACY);
  assert.ok(result.signals.includes('PageBackground'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/Users/khush/Desktop/Projects/stock-sense/Stock-Sense-main" && node --test scripts/design-audit/__tests__/design-heuristics.test.mjs`
Expected: FAIL with `Cannot find module '../design-heuristics.mjs'`

- [ ] **Step 3: Write minimal implementation**

```javascript
// scripts/design-audit/design-heuristics.mjs
export const DESIGN_STATUS = {
  IMPLEMENTED: 'implemented',
  PARTIAL: 'partial',
  LEGACY: 'legacy',
  SKIP: 'skip-visual',
  NOT_STARTED: 'not-started',
};

const IMPLEMENTED_SIGNALS = [
  { pattern: /panelShellClass|dashboard-card/, weight: 40, label: 'panel-shell' },
  { pattern: /rounded-\[28px\].*border-slate-200\/80/, weight: 20, label: 'premium-radius' },
  { pattern: /tracking-\[-0\.04em\]/, weight: 10, label: 'premium-type' },
];

const LEGACY_SIGNALS = [
  { pattern: /glass-card/, weight: -35, label: 'glass-card' },
  { pattern: /PageBackground/, weight: -30, label: 'PageBackground' },
  { pattern: /stock-details-page/, weight: -25, label: 'stock-details-page' },
  { pattern: /bg-neon-400/, weight: -15, label: 'neon-accent' },
  { pattern: /text-white font-bold text-3xl/, weight: -10, label: 'legacy-heading' },
];

const PARTIAL_SIGNALS = [
  { pattern: /rounded-\[22px\]/, weight: 15, label: 'settings-shell' },
  { pattern: /SectionReveal|SectionHeader/, weight: 10, label: 'home-section' },
  { pattern: /NewsPageClient|NewsCategoryTabs/, weight: 10, label: 'news-shell' },
];

export function classifyRouteDesign(sourceText, relFile) {
  const signals = [];
  let score = 50;

  for (const s of IMPLEMENTED_SIGNALS) {
    if (s.pattern.test(sourceText)) {
      score += s.weight;
      signals.push(s.label);
    }
  }
  for (const s of PARTIAL_SIGNALS) {
    if (s.pattern.test(sourceText)) {
      score += s.weight;
      signals.push(s.label);
    }
  }
  for (const s of LEGACY_SIGNALS) {
    if (s.pattern.test(sourceText)) {
      score += s.weight;
      signals.push(s.label);
    }
  }

  if (/src\/app\/portfolio\/page\.tsx$/.test(relFile)) {
    return { status: DESIGN_STATUS.IMPLEMENTED, score: 100, signals: ['portfolio-benchmark'] };
  }

  let status = DESIGN_STATUS.NOT_STARTED;
  if (score >= 80) status = DESIGN_STATUS.IMPLEMENTED;
  else if (score >= 55) status = DESIGN_STATUS.PARTIAL;
  else if (score < 45) status = DESIGN_STATUS.LEGACY;

  return { status, score: Math.max(0, Math.min(100, score)), signals };
}
```

```javascript
// scripts/design-audit/classify-routes-design.mjs
import fs from 'fs';
import path from 'path';
import { classifyRouteDesign, DESIGN_STATUS } from './design-heuristics.mjs';

const repoRoot = process.cwd();
const auditJson = path.join(repoRoot, 'docs', 'route-ui-audit-data.json');
const outDir = path.join(repoRoot, 'docs', 'design-audit');
const outFile = path.join(outDir, 'design-route-baseline.json');

const SKIP_ROUTES = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/profile',
  '/api/health',
]);

const DYNAMIC_SAMPLES = {
  '/stocks/[symbol]': '/stocks/RELIANCE',
  '/ipo/[ipoId]': '/ipo/sample-ipo',
};

function readSource(relFile) {
  const full = path.join(repoRoot, relFile);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

function collectTreeSources(tree, acc = []) {
  if (!tree?.file) return acc;
  acc.push(tree.file);
  for (const child of tree.children || []) collectTreeSources(child, acc);
  return acc;
}

if (!fs.existsSync(auditJson)) {
  console.error('Missing docs/route-ui-audit-data.json — run: node scripts/generate-route-ui-audit.mjs');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditJson, 'utf8'));
const routes = [];

for (const r of audit.routes) {
  if (SKIP_ROUTES.has(r.route)) {
    routes.push({ route: r.route, capturePath: r.route, status: DESIGN_STATUS.SKIP, score: null, signals: ['redirect-or-non-ui'], file: r.file });
    continue;
  }

  const sources = [r.file, ...collectTreeSources(r.tree)];
  const merged = sources.map(readSource).join('\n');
  const classified = classifyRouteDesign(merged, r.file);

  routes.push({
    route: r.route,
    capturePath: DYNAMIC_SAMPLES[r.route] || r.route,
    status: classified.status,
    score: classified.score,
    signals: classified.signals,
    file: r.file,
    lineCount: r.lineCount,
  });
}

// Settings subtabs
for (const tab of audit.matrices.settingsTabs) {
  routes.push({
    route: tab.route,
    capturePath: tab.route,
    status: DESIGN_STATUS.PARTIAL,
    score: 60,
    signals: ['settings-shell'],
    file: 'src/components/settings/SettingsPageShell.tsx',
    parentRoute: '/settings',
  });
}

// News category tabs (same shell, verify visually)
for (const tab of audit.matrices.newsCategoryTabs) {
  routes.push({
    route: tab.route,
    capturePath: tab.route,
    status: DESIGN_STATUS.PARTIAL,
    score: 58,
    signals: ['news-shell'],
    file: 'src/components/News/NewsCategoryTabs.tsx',
    parentRoute: '/news',
  });
}

// Stock detail subtabs
const STOCK_TABS = [
  'overview', 'fundamental', 'technical', 'management', 'industry',
  'sentiment', 'institutional', 'macroeconomic', 'esg', 'risk', 'growth',
];
for (const tabId of STOCK_TABS) {
  routes.push({
    route: `/stocks/RELIANCE?tab=${tabId}`,
    capturePath: `/stocks/RELIANCE?tab=${tabId}`,
    status: DESIGN_STATUS.LEGACY,
    score: 30,
    signals: ['glass-card', 'stock-details-page'],
    file: 'src/app/stocks/[symbol]/page.tsx',
    parentRoute: '/stocks/[symbol]',
  });
}

fs.mkdirSync(outDir, { recursive: true });
const artifact = {
  generatedAt: new Date().toISOString(),
  benchmark: 'src/components/portfolio/PortfolioDashboard.tsx',
  designBrief: 'docs/new_design.md',
  summary: {
    implemented: routes.filter((r) => r.status === 'implemented').length,
    partial: routes.filter((r) => r.status === 'partial').length,
    legacy: routes.filter((r) => r.status === 'legacy').length,
    skipVisual: routes.filter((r) => r.status === 'skip-visual').length,
    total: routes.length,
  },
  routes,
};

fs.writeFileSync(outFile, JSON.stringify(artifact, null, 2));
console.log(`Wrote ${path.relative(repoRoot, outFile)} (${artifact.summary.total} entries)`);
```

Add to `package.json` scripts:

```json
"audit:routes": "node scripts/generate-route-ui-audit.mjs",
"audit:design:classify": "node scripts/design-audit/classify-routes-design.mjs",
"audit:design": "npm run audit:routes && npm run audit:design:classify"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "C:/Users/khush/Desktop/Projects/stock-sense/Stock-Sense-main" && node --test scripts/design-audit/__tests__/design-heuristics.test.mjs`
Expected: PASS (3 tests)

Run: `npm run audit:design`
Expected: `Wrote docs/design-audit/design-route-baseline.json (58+ entries)` with `summary.implemented === 1`

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/khush/Desktop/Projects/stock-sense/Stock-Sense-main"
git add scripts/design-audit/ docs/design-audit/design-route-baseline.json package.json
git commit -m "feat: add static design route classifier for new-design audit"
```

---

### Task 2: Playwright Screenshot Capture Runner

**Files:**
- Create: `scripts/design-audit/capture-route-screenshots.mjs`
- Create: `docs/design-audit/screenshot-manifest.local.json`
- Modify: `Stock-Sense-main/package.json` (devDependency + script)
- Test: manual run against `localhost:3000`

**Interfaces:**
- Consumes: `docs/design-audit/design-route-baseline.json`, env `BASE_URL` (default `http://localhost:3000`)
- Produces: PNG files at `docs/design-audit/screenshots/{light|dark}/{slug}.png`, `docs/design-audit/screenshot-index.json`

- [ ] **Step 1: Install Playwright**

```bash
cd "C:/Users/khush/Desktop/Projects/stock-sense/Stock-Sense-main"
npm install -D playwright@1.49.1
npx playwright install chromium
```

Add script:

```json
"audit:design:capture": "node scripts/design-audit/capture-route-screenshots.mjs"
```

- [ ] **Step 2: Write capture script**

```javascript
// scripts/design-audit/capture-route-screenshots.mjs
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const repoRoot = process.cwd();
const baselineFile = path.join(repoRoot, 'docs/design-audit/design-route-baseline.json');
const outRoot = path.join(repoRoot, 'docs/design-audit/screenshots');
const indexFile = path.join(repoRoot, 'docs/design-audit/screenshot-index.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORT = { width: 1440, height: 900 };

function slugify(route) {
  return route
    .replace(/^\//, '')
    .replace(/[/?=&[\]]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-$/, '') || 'home';
}

async function setTheme(page, theme) {
  await page.evaluate((mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
  }, theme);
}

async function captureRoute(page, capturePath, theme) {
  const url = capturePath.startsWith('http') ? capturePath : `${BASE_URL}${capturePath}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await setTheme(page, theme);
  await page.waitForTimeout(800);

  // Stock tab query param: click tab if present
  const tabMatch = capturePath.match(/[?&]tab=([^&]+)/);
  if (tabMatch && capturePath.includes('/stocks/')) {
    const tabId = tabMatch[1];
    const tabButton = page.locator(`[id="stock-tab-${tabId}"], [aria-controls="stock-tabpanel-${tabId}"]`).first();
    if (await tabButton.count()) {
      await tabButton.click();
      await page.waitForTimeout(500);
    }
  }

  const slug = slugify(capturePath);
  const dir = path.join(outRoot, theme);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return { capturePath, theme, file: path.relative(repoRoot, file) };
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const targets = baseline.routes.filter((r) => r.status !== 'skip-visual');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
const index = [];

for (const route of targets) {
  for (const theme of ['light', 'dark']) {
    try {
      const shot = await captureRoute(page, route.capturePath, theme);
      index.push({ ...shot, route: route.route, status: route.status });
      console.log(`OK ${theme} ${route.capturePath}`);
    } catch (err) {
      index.push({ route: route.route, capturePath: route.capturePath, theme, error: String(err) });
      console.error(`FAIL ${theme} ${route.capturePath}:`, err.message);
    }
  }
}

await browser.close();
fs.writeFileSync(indexFile, JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE_URL, shots: index }, null, 2));
console.log(`Screenshot index: ${path.relative(repoRoot, indexFile)}`);
```

- [ ] **Step 3: Start dev server and capture**

Terminal A:

```bash
cd "C:/Users/khush/Desktop/Projects/stock-sense/Stock-Sense-main"
npm run dev
```

Terminal B (after `http://localhost:3000` responds):

```bash
cd "C:/Users/khush/Desktop/Projects/stock-sense/Stock-Sense-main"
BASE_URL=http://localhost:3000 npm run audit:design:capture
```

Expected: PNG files under `docs/design-audit/screenshots/light/` and `dark/`; index JSON with majority `OK` entries. Failures on `/ipo/sample-ipo` are acceptable until a real IPO slug is substituted from `GET /api/v1/ipos`.

- [ ] **Step 4: Fix dynamic IPO sample**

Run against backend:

```bash
curl -s "http://localhost:10000/api/v1/ipos?limit=1" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);const id=j?.data?.[0]?.id||j?.[0]?.id;console.log(id||'none');});"
```

Update `DYNAMIC_SAMPLES['/ipo/[ipoId]']` in `classify-routes-design.mjs` with the returned id, re-run classify + capture.

- [ ] **Step 5: Commit**

```bash
git add scripts/design-audit/capture-route-screenshots.mjs docs/design-audit/screenshots/ docs/design-audit/screenshot-index.json package.json package-lock.json
git commit -m "feat: capture light/dark route screenshots for design audit"
```

---

### Task 3: Design Coverage Matrix (Markdown + JSON)

**Files:**
- Create: `scripts/design-audit/generate-design-matrix.mjs`
- Create: `docs/design-audit/DESIGN_COVERAGE_MATRIX.md`
- Create: `docs/design-audit/design-coverage-data.json`

**Interfaces:**
- Consumes: `design-route-baseline.json`, `screenshot-index.json`
- Produces: merged `design-coverage-data.json`, markdown report with mermaid diagram

- [ ] **Step 1: Write matrix generator**

```javascript
// scripts/design-audit/generate-design-matrix.mjs
import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const baseline = JSON.parse(fs.readFileSync('docs/design-audit/design-route-baseline.json', 'utf8'));
const shots = JSON.parse(fs.readFileSync('docs/design-audit/screenshot-index.json', 'utf8'));

const shotMap = new Map();
for (const s of shots.shots) {
  if (!s.error) shotMap.set(`${s.capturePath}:${s.theme}`, s.file);
}

const merged = baseline.routes.map((r) => ({
  ...r,
  screenshots: {
    light: shotMap.get(`${r.capturePath}:light`) || null,
    dark: shotMap.get(`${r.capturePath}:dark`) || null,
  },
}));

const byStatus = (status) => merged.filter((r) => r.status === status);

const md = [];
md.push('# Design Coverage Matrix');
md.push('');
md.push(`> Generated: ${new Date().toISOString()}`);
md.push(`> Benchmark: \`src/components/portfolio/PortfolioDashboard.tsx\``);
md.push(`> Brief: \`docs/new_design.md\``);
md.push('');
md.push('## Summary');
md.push('');
md.push('| Status | Count | Meaning |');
md.push('| --- | ---: | --- |');
md.push(`| implemented | ${byStatus('implemented').length} | Matches portfolio \`panelShellClass\` language |`);
md.push(`| partial | ${byStatus('partial').length} | Some new patterns, inconsistent surfaces |`);
md.push(`| legacy | ${byStatus('legacy').length} | \`glass-card\`, \`PageBackground\`, or monolithic old UI |`);
md.push(`| skip-visual | ${byStatus('skip-visual').length} | Redirects or non-UI routes |`);
md.push('');
md.push('## Route Status (sorted by priority)');
md.push('');
md.push('| Route | Status | Score | Signals | Screenshot (light) |');
md.push('| --- | --- | ---: | --- | --- |');

const priority = { legacy: 0, partial: 1, 'not-started': 2, implemented: 3, 'skip-visual': 4 };
const sorted = [...merged].sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9) || a.route.localeCompare(b.route));

for (const r of sorted) {
  md.push(`| \`${r.route}\` | ${r.status} | ${r.score ?? '-'} | ${(r.signals || []).join(', ')} | ${r.screenshots.light || '-'} |`);
}

md.push('');
md.push('## Visual flow — pages needing redesign');
md.push('');
md.push('```mermaid');
md.push('flowchart LR');
md.push('  benchmark["/portfolio ✅ benchmark"]');
md.push('  legacy["Legacy cluster"]');
md.push('  partial["Partial cluster"]');
md.push('  benchmark --> partial');
md.push('  partial --> legacy');
md.push('  legacy --> L1["/stocks + /stocks/RELIANCE tabs"]');
md.push('  legacy --> L2["/market /ipo /watchlists"]');
md.push('  legacy --> L3["auth + alerts + notifications"]');
md.push('  legacy --> L4["content: faq blog learn terms privacy contact"]');
md.push('  partial --> P1["/ home sections"]');
md.push('  partial --> P2["/settings tabs"]');
md.push('  partial --> P3["/news categories"]');
md.push('```');

md.push('');
md.push('## Not implemented with new design (action list)');
md.push('');
for (const r of sorted.filter((x) => x.status === 'legacy' || x.status === 'partial')) {
  md.push(`- [ ] \`${r.route}\` — ${r.status}; file: \`${r.file}\``);
}

const outJson = {
  generatedAt: new Date().toISOString(),
  summary: baseline.summary,
  routes: merged,
};
fs.writeFileSync('docs/design-audit/design-coverage-data.json', JSON.stringify(outJson, null, 2));
fs.writeFileSync('docs/design-audit/DESIGN_COVERAGE_MATRIX.md', md.join('\n'));
console.log('Wrote docs/design-audit/DESIGN_COVERAGE_MATRIX.md');
```

Add script: `"audit:design:matrix": "node scripts/design-audit/generate-design-matrix.mjs"`

- [ ] **Step 2: Run generator**

Run: `npm run audit:design:matrix`
Expected: markdown lists 1 implemented (`/portfolio`), ~40+ legacy/partial entries with checkbox action list

- [ ] **Step 3: Commit**

```bash
git add scripts/design-audit/generate-design-matrix.mjs docs/design-audit/DESIGN_COVERAGE_MATRIX.md docs/design-audit/design-coverage-data.json package.json
git commit -m "docs: add design coverage matrix for route audit"
```

---

### Task 4: HTML Visual Gallery

**Files:**
- Create: `scripts/design-audit/generate-design-gallery.mjs`
- Create: `docs/design-audit/design-coverage-gallery.html`

**Interfaces:**
- Consumes: `docs/design-audit/design-coverage-data.json`
- Produces: self-contained HTML gallery (opens in browser without a server)

- [ ] **Step 1: Write gallery generator**

```javascript
// scripts/design-audit/generate-design-gallery.mjs
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('docs/design-audit/design-coverage-data.json', 'utf8'));

const rows = data.routes
  .filter((r) => r.status !== 'skip-visual')
  .map((r) => {
    const badgeColor = {
      implemented: '#10b981',
      partial: '#f59e0b',
      legacy: '#ef4444',
      'not-started': '#64748b',
    }[r.status] || '#64748b';

    return `
    <article class="card" data-status="${r.status}">
      <header>
        <h2>${r.route}</h2>
        <span class="badge" style="background:${badgeColor}">${r.status}</span>
      </header>
      <p class="meta">${r.file} · score ${r.score ?? '—'} · ${(r.signals || []).join(', ')}</p>
      <div class="shots">
        <figure>
          <figcaption>Light</figcaption>
          <img loading="lazy" src="${r.screenshots?.light || ''}" alt="light ${r.route}" />
        </figure>
        <figure>
          <figcaption>Dark</figcaption>
          <img loading="lazy" src="${r.screenshots?.dark || ''}" alt="dark ${r.route}" />
        </figure>
      </div>
    </article>`;
  })
  .join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Stock Sense — Design Coverage Gallery</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #e2e8f0; }
    header.page { padding: 24px 32px; border-bottom: 1px solid #334155; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .filters button { background: #1e293b; color: #e2e8f0; border: 1px solid #475569; border-radius: 999px; padding: 6px 12px; cursor: pointer; }
    .filters button.active { background: #10b981; border-color: #10b981; color: #052e16; }
    main { display: grid; gap: 24px; padding: 24px 32px 80px; }
    .card { background: #111827; border: 1px solid #334155; border-radius: 20px; padding: 16px; }
    .card header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .card h2 { margin: 0; font-size: 1rem; word-break: break-all; }
    .badge { color: white; font-size: 12px; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; }
    .meta { color: #94a3b8; font-size: 13px; }
    .shots { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    figure { margin: 0; }
    figcaption { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
    img { width: 100%; border-radius: 12px; border: 1px solid #334155; background: #0b1220; min-height: 120px; object-fit: cover; object-position: top; }
    .card.hidden { display: none; }
  </style>
</head>
<body>
  <header class="page">
    <h1>Design Coverage Gallery</h1>
    <p>Benchmark: PortfolioDashboard · ${data.summary.implemented} implemented · ${data.summary.partial} partial · ${data.summary.legacy} legacy</p>
    <div class="filters">
      <button data-filter="all" class="active">All</button>
      <button data-filter="legacy">Legacy</button>
      <button data-filter="partial">Partial</button>
      <button data-filter="implemented">Implemented</button>
    </div>
  </header>
  <main>${rows}</main>
  <script>
    const buttons = document.querySelectorAll('.filters button');
    const cards = document.querySelectorAll('.card');
    buttons.forEach((btn) => btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach((c) => c.classList.toggle('hidden', f !== 'all' && c.dataset.status !== f));
    }));
  </script>
</body>
</html>`;

fs.writeFileSync('docs/design-audit/design-coverage-gallery.html', html);
console.log('Wrote docs/design-audit/design-coverage-gallery.html');
```

Add script: `"audit:design:gallery": "node scripts/design-audit/generate-design-gallery.mjs"`

- [ ] **Step 2: Run and open gallery**

Run: `npm run audit:design:gallery`
Expected: HTML file ~50+ route cards with light/dark thumbnails

Open: `docs/design-audit/design-coverage-gallery.html` in browser — filter "Legacy" should show `/stocks`, `/market`, content pages, stock subtabs.

- [ ] **Step 3: Commit**

```bash
git add scripts/design-audit/generate-design-gallery.mjs docs/design-audit/design-coverage-gallery.html
git commit -m "docs: add HTML visual gallery for design route audit"
```

---

### Task 5: Wire Full Audit Pipeline + Docs Index

**Files:**
- Modify: `Stock-Sense-main/package.json`
- Modify: `Stock-Sense-main/docs/INDEX.md`

**Interfaces:**
- Produces: single command `npm run audit:design:full`

- [ ] **Step 1: Add orchestration script to package.json**

```json
"audit:design:full": "npm run audit:design && npm run audit:design:capture && npm run audit:design:matrix && npm run audit:design:gallery"
```

- [ ] **Step 2: Update docs index**

Append to `docs/INDEX.md`:

```markdown
## Design audit (new_design.md rollout)

| Artifact | Path |
| --- | --- |
| Design brief | [new_design.md](./new_design.md) |
| Coverage matrix | [design-audit/DESIGN_COVERAGE_MATRIX.md](./design-audit/DESIGN_COVERAGE_MATRIX.md) |
| Visual gallery | [design-audit/design-coverage-gallery.html](./design-audit/design-coverage-gallery.html) |
| Machine-readable | [design-audit/design-coverage-data.json](./design-audit/design-coverage-data.json) |
| Run locally | `npm run audit:design:full` (requires `npm run dev` on port 3000) |
```

- [ ] **Step 3: Run full pipeline once**

Run: `npm run audit:design:full`
Expected: all four artifacts refreshed; matrix shows exactly **1 implemented**, **~6 partial**, **~50 legacy**

- [ ] **Step 4: Commit**

```bash
git add package.json docs/INDEX.md
git commit -m "chore: wire full design audit pipeline and docs index"
```

---

## Phase 1 — Design System Extraction (after audit sign-off)

### Task 6: Shared Panel Tokens + PanelShell Component

**Files:**
- Create: `src/styles/design-tokens.ts`
- Create: `src/components/ui/PanelShell.tsx`
- Modify: `src/components/portfolio/PortfolioDashboard.tsx` (import tokens instead of inline constants)

**Interfaces:**
- Produces: `panelShellClass`, `insetPanelClass`, `<PanelShell>` wrapper exported from `src/components/ui/PanelShell.tsx`

- [ ] **Step 1: Extract tokens**

```typescript
// src/styles/design-tokens.ts
export const panelShellClass =
  'dashboard-card rounded-[28px] border border-slate-200/80 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)]';

export const insetPanelClass =
  'rounded-[24px] border border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/5';

export const sectionEyebrowClass =
  'text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500';

export const sectionTitleClass =
  'text-[clamp(1.75rem,2.8vw,2.6rem)] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white';
```

- [ ] **Step 2: Create PanelShell**

```tsx
// src/components/ui/PanelShell.tsx
import { cn } from '@/lib/utils';
import { panelShellClass } from '@/styles/design-tokens';

type PanelShellProps = React.ComponentProps<'section'> & { inset?: boolean };

export function PanelShell({ className, inset = false, ...props }: PanelShellProps) {
  return (
    <section
      className={cn(panelShellClass, inset && 'shadow-none', className)}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Refactor PortfolioDashboard imports**

Replace inline `panelShellClass` / `insetPanelClass` with imports from `@/styles/design-tokens`.

- [ ] **Step 4: Verify**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: clean pass

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor: extract portfolio design tokens into shared module"
```

---

## Phase 2 — Route Rollout Order (post-audit)

Implement in this order (each route/task ends with screenshot diff in gallery + lint/build pass):

| Priority | Cluster | Routes | Primary files |
| ---: | --- | --- | --- |
| 1 | Stock detail | `/stocks/[symbol]` + 11 tabs | `src/app/stocks/[symbol]/page.tsx`, `src/components/stocks/*` |
| 2 | Stock list | `/stocks`, `/stock-search` | `src/app/stocks/page.tsx`, `src/app/stock-search/page.tsx` |
| 3 | Market | `/market`, `/market/institutional` | `src/app/market/page.tsx`, `src/app/market/institutional/page.tsx` |
| 4 | IPO | `/ipo`, `/ipo/[ipoId]` | `src/app/ipo/page.tsx`, `src/app/ipo/[ipoId]/page.tsx` |
| 5 | Home | `/` | `src/app/page.tsx`, `src/components/home/*` |
| 6 | User tools | `/watchlists`, `/alerts`, `/notifications` | respective `src/app/*/page.tsx` |
| 7 | Settings | `/settings` + 6 tabs | `src/components/settings/*` |
| 8 | News | `/news/*` | `src/components/News/*` |
| 9 | Auth | `/login`, `/signup`, `/auth/*` | `src/app/login/page.tsx`, etc. |
| 10 | Content | `/faq`, `/blog`, `/learn`, `/contact`, `/terms`, `/privacy`, `/about` | replace `PageBackground` with `PanelShell` layout |
| 11 | Shell | Header, Footer, AppShell | `src/components/layout/*` |

Each rollout task follows the same sub-steps: replace `glass-card` / `PageBackground` → `PanelShell`, apply `sectionEyebrowClass` / `sectionTitleClass`, re-run `npm run audit:design:full`, confirm route moves from `legacy` → `partial` → `implemented` in matrix.

---

## Self-Review Checklist

**1. Spec coverage**
- Full audit before redesign: Tasks 1–5 (`new_design.md` lines 37–39)
- Portfolio benchmark: Task 1 seed + Task 6 extraction
- Every major area listed in brief (home, stocks, market, IPOs, news, portfolio, watchlists, auth, forms, shell): Phase 2 priority table
- Light + dark mode: Task 2 captures both themes
- Visualization of unimplemented routes: Tasks 3–4 (matrix + HTML gallery)

**2. Placeholder scan:** No TBD/TODO steps; all code blocks are complete.

**3. Type consistency:** `classifyRouteDesign` returns `{ status, score, signals }` used consistently in baseline, matrix, and gallery generators.

**Gap:** Automated visual diff scoring (pixel comparison vs portfolio) is intentionally omitted — human review via gallery is Phase 0 acceptance gate. Add pixelmatch only if stakeholders require machine scoring.
