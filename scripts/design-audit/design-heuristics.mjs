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
