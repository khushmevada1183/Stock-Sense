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
  '/api-test',
  '/api-docs',
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

// Settings subtabs — inherit shell classification from SettingsPageShell
const settingsSource = readSource('src/components/settings/SettingsPageShell.tsx');
const settingsClassified = classifyRouteDesign(settingsSource, 'src/components/settings/SettingsPageShell.tsx');
for (const tab of audit.matrices.settingsTabs) {
  routes.push({
    route: tab.route,
    capturePath: tab.route,
    status: settingsClassified.status,
    score: settingsClassified.score,
    signals: settingsClassified.signals,
    file: 'src/components/settings/SettingsPageShell.tsx',
    parentRoute: '/settings',
  });
}

// News category routes are covered by audit.routes (page.tsx + page-client tree); no duplicate rows.

// Stock detail subtabs — inherit shell classification from page + tab components
const STOCK_TABS = [
  'overview', 'fundamental', 'technical', 'management', 'industry',
  'sentiment', 'institutional', 'macroeconomic', 'esg', 'risk', 'growth',
];
const stockRoute = audit.routes.find((r) => r.route === '/stocks/[symbol]');
const stockSources = stockRoute
  ? [stockRoute.file, ...collectTreeSources(stockRoute.tree)]
  : ['src/app/stocks/[symbol]/page.tsx'];
const stockMerged = stockSources.map(readSource).join('\n');
const stockClassified = classifyRouteDesign(stockMerged, 'src/app/stocks/[symbol]/page.tsx');
for (const tabId of STOCK_TABS) {
  routes.push({
    route: `/stocks/RELIANCE?tab=${tabId}`,
    capturePath: `/stocks/RELIANCE?tab=${tabId}`,
    status: stockClassified.status,
    score: stockClassified.score,
    signals: stockClassified.signals,
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
    notStarted: routes.filter((r) => r.status === 'not-started').length,
    skipVisual: routes.filter((r) => r.status === 'skip-visual').length,
    total: routes.length,
    remaining: routes.filter((r) => r.status === 'legacy' || r.status === 'not-started' || r.status === 'partial').length,
  },
  routes,
};

fs.writeFileSync(outFile, JSON.stringify(artifact, null, 2));
console.log(`Wrote ${path.relative(repoRoot, outFile)} (${artifact.summary.total} entries)`);
