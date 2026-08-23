/**
 * Top-to-bottom visual walk: visit every audited route, scroll in viewport steps,
 * flag legacy UI signals and layout issues. Requires dev server on :3000.
 */
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const repoRoot = process.cwd();
const baselineFile = path.join(repoRoot, 'docs/design-audit/design-route-baseline.json');
const outDir = path.join(repoRoot, 'docs/design-audit/visual-walk');
const reportFile = path.join(outDir, 'VISUAL_WALK_REPORT.md');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORT = { width: 1440, height: 900 };

const LEGACY_SELECTORS = [
  { id: 'page-background', sel: '[class*="PageBackground"], .auth-shell' },
  { id: 'neon-accent', sel: '[class*="neon-400"], [class*="bg-neon"]' },
  { id: 'glass-card', sel: '.glass-card, [class*="glass-card"]' },
  { id: 'legacy-news-dark', sel: '.bg-gray-900\\/90, [class*="bg-gray-900/90"]' },
  { id: 'purple-gradient-auth', sel: '[class*="from-purple"], [class*="via-purple"]' },
];

async function setTheme(page, theme) {
  await page.evaluate((mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
  }, theme);
}

async function walkPage(page, capturePath, theme) {
  const url = `${BASE_URL}${capturePath}`;
  const issues = [];

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (err) {
    return { ok: false, issues: [`navigation failed: ${err.message}`] };
  }

  await setTheme(page, theme);
  await page.waitForTimeout(600);

  const tabMatch = capturePath.match(/[?&]tab=([^&]+)/);
  if (tabMatch && capturePath.includes('/stocks/')) {
    const tabId = tabMatch[1];
    const tabButton = page.locator(`[id="stock-tab-${tabId}"], [aria-controls="stock-tabpanel-${tabId}"]`).first();
    if (await tabButton.count()) {
      await tabButton.click();
      await page.waitForTimeout(400);
    }
  }

  const settingsTab = capturePath.match(/[?&]tab=([^&]+)/);
  if (settingsTab && capturePath.startsWith('/settings')) {
    await page.goto(`${BASE_URL}/settings?tab=${settingsTab[1]}`, { waitUntil: 'networkidle', timeout: 60000 });
    await setTheme(page, theme);
    await page.waitForTimeout(400);
  }

  const dims = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  if (dims.scrollWidth > dims.clientWidth + 2) {
    issues.push(`horizontal overflow (${dims.scrollWidth}px > ${dims.clientWidth}px)`);
  }

  for (const { id, sel } of LEGACY_SELECTORS) {
    const count = await page.locator(sel).count();
    if (count > 0) issues.push(`legacy signal: ${id} (${count} nodes)`);
  }

  const hasChrome = !capturePath.startsWith('/login') &&
    !capturePath.startsWith('/signup') &&
    !capturePath.startsWith('/settings') &&
    !capturePath.startsWith('/auth/');

  if (hasChrome) {
    const headerBand = await page.evaluate(() => {
      const main = document.querySelector('main');
      const header = document.querySelector('header');
      if (!main || !header) return { ok: true };

      const isTransparent = (bg) =>
        !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)';

      const mainBg = getComputedStyle(main).backgroundColor;
      const headerBg = getComputedStyle(header).backgroundColor;
      const pill = document.querySelector('.header-pill');
      let pillSolid = false;
      if (pill) {
        const pillBg = getComputedStyle(pill).backgroundColor;
        pillSolid = pillBg === 'rgb(15, 23, 42)' || pillBg === 'rgb(255, 255, 255)';
      }

      return {
        ok: isTransparent(mainBg) && isTransparent(headerBg) && !pillSolid,
        mainBg,
        headerBg,
        pillSolid,
      };
    });

    if (!headerBand.ok) {
      issues.push(
        `header-foreground-mismatch (main=${headerBand.mainBg}, header=${headerBand.headerBg}, pillSolid=${headerBand.pillSolid})`
      );
    }
  }

  const step = Math.max(VIEWPORT.height - 100, 400);
  let y = 0;
  const maxY = dims.scrollHeight;
  let steps = 0;
  while (y <= maxY && steps < 40) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(150);
    y += step;
    steps += 1;
  }
  await page.evaluate(() => window.scrollTo(0, 0));

  const slug = capturePath.replace(/^\//, '').replace(/[/?=&[\]]+/g, '-').replace(/-+/g, '-').replace(/-$/, '') || 'home';
  const shotDir = path.join(outDir, theme);
  fs.mkdirSync(shotDir, { recursive: true });
  const shotPath = path.join(shotDir, `${slug}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });

  return {
    ok: true,
    issues,
    scrollHeight: dims.scrollHeight,
    screenshot: path.relative(repoRoot, shotPath),
  };
}

const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
const targets = baseline.routes.filter((r) => r.status !== 'skip-visual');
const seen = new Set();
const unique = targets.filter((r) => {
  const key = `${r.capturePath}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// 404 check
unique.push({ route: '/__404__', capturePath: '/this-route-does-not-exist-404-test', status: 'implemented' });

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
const results = [];

for (const route of unique) {
  for (const theme of ['light', 'dark']) {
    const walk = await walkPage(page, route.capturePath, theme);
    results.push({ route: route.route, capturePath: route.capturePath, theme, ...walk });
    const flag = walk.issues?.length ? 'ISSUES' : 'OK';
    console.log(`${flag} ${theme} ${route.capturePath}${walk.issues?.length ? ' — ' + walk.issues.join('; ') : ''}`);
  }
}

await browser.close();

const withIssues = results.filter((r) => r.issues?.length);
const failed = results.filter((r) => !r.ok);

let md = `# Visual Walk Report\n\n> Generated: ${new Date().toISOString()}\n> Base URL: ${BASE_URL}\n> Routes walked: ${unique.length} × 2 themes = ${results.length} captures\n\n`;
md += `## Summary\n\n| Metric | Count |\n| --- | ---: |\n| Total captures | ${results.length} |\n| Clean (no issues) | ${results.length - withIssues.length} |\n| With legacy/overflow flags | ${withIssues.length} |\n| Navigation failures | ${failed.length} |\n\n`;

md += `## Issues by route\n\n`;
if (withIssues.length === 0) {
  md += `_No automated legacy/overflow flags detected._\n\n`;
} else {
  for (const r of withIssues) {
    md += `- **${r.capturePath}** (${r.theme}): ${r.issues.join('; ')}\n`;
  }
  md += '\n';
}

md += `## Full route checklist\n\n`;
md += `| Route | Light | Dark | Scroll H (light) |\n| --- | --- | --- | ---: |\n`;
for (const route of unique) {
  const light = results.find((r) => r.capturePath === route.capturePath && r.theme === 'light');
  const dark = results.find((r) => r.capturePath === route.capturePath && r.theme === 'dark');
  const lStatus = light?.ok ? (light.issues?.length ? '⚠️' : '✅') : '❌';
  const dStatus = dark?.ok ? (dark.issues?.length ? '⚠️' : '✅') : '❌';
  md += `| \`${route.route}\` | ${lStatus} | ${dStatus} | ${light?.scrollHeight ?? '—'} |\n`;
}

md += `\nScreenshots: \`docs/design-audit/visual-walk/{light,dark}/\`\n`;

fs.writeFileSync(reportFile, md);
console.log(`Wrote ${path.relative(repoRoot, reportFile)}`);
