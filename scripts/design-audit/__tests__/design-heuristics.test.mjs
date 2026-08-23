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

test('ToolPageLayout route scores as implemented', () => {
  const sample = `import { ToolPageLayout, ToolPanel } from '@/components/tools/ToolPageLayout';`;
  const result = classifyRouteDesign(sample, 'src/app/watchlists/page.tsx');
  assert.equal(result.status, DESIGN_STATUS.IMPLEMENTED);
  assert.ok(result.signals.includes('tool-shell'));
});

test('AuthPageLayout route scores as implemented', () => {
  const sample = `import { AuthPageLayout } from '@/components/auth/AuthPageLayout';`;
  const result = classifyRouteDesign(sample, 'src/app/login/page.tsx');
  assert.equal(result.status, DESIGN_STATUS.IMPLEMENTED);
  assert.ok(result.signals.includes('auth-shell'));
});

test('ContentPageLayout route scores as implemented', () => {
  const sample = `import { ContentPageLayout } from '@/components/content/ContentPageLayout';`;
  const result = classifyRouteDesign(sample, 'src/app/faq/page.tsx');
  assert.equal(result.status, DESIGN_STATUS.IMPLEMENTED);
  assert.ok(result.signals.includes('content-shell'));
});
