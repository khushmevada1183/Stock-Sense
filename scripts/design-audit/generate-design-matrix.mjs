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
