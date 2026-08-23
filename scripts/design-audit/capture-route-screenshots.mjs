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
