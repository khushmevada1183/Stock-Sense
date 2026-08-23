// scripts/design-audit/generate-design-gallery.mjs
import fs from 'fs';

const STATUS_META = {
  implemented: {
    label: 'Completed',
    hint: 'Uses portfolio panelShellClass language',
    color: '#10b981',
    icon: '✓',
    order: 3,
  },
  partial: {
    label: 'Partial',
    hint: 'Some new tokens — needs polish',
    color: '#f59e0b',
    icon: '◐',
    order: 2,
  },
  legacy: {
    label: 'Legacy',
    hint: 'glass-card / PageBackground — redesign needed',
    color: '#ef4444',
    icon: '!',
    order: 0,
  },
  'not-started': {
    label: 'Not started',
    hint: 'No design tokens detected yet',
    color: '#64748b',
    icon: '○',
    order: 1,
  },
};

function galleryPath(p) {
  if (!p) return '';
  return p.replace(/\\/g, '/').replace(/^docs\/design-audit\//, '');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const data = JSON.parse(fs.readFileSync('docs/design-audit/design-coverage-data.json', 'utf8'));
const routes = data.routes.filter((r) => r.status !== 'skip-visual');

const counts = {
  implemented: routes.filter((r) => r.status === 'implemented').length,
  partial: routes.filter((r) => r.status === 'partial').length,
  legacy: routes.filter((r) => r.status === 'legacy').length,
  notStarted: routes.filter((r) => r.status === 'not-started').length,
};
counts.remaining = counts.partial + counts.legacy + counts.notStarted;
counts.audited = routes.length;
counts.done = counts.implemented;
const progressPct = counts.audited ? Math.round((counts.done / counts.audited) * 100) : 0;

function checklistGroup(status, title) {
  const items = routes.filter((r) => r.status === status);
  if (!items.length) return '';

  const meta = STATUS_META[status];
  const lines = items
    .map(
      (r) =>
        `<li><code>${escapeHtml(r.route)}</code><span class="file">${escapeHtml(r.file)}</span></li>`,
    )
    .join('\n');

  return `
    <details class="checklist-group"${status === 'legacy' || status === 'not-started' ? ' open' : ''}>
      <summary style="--accent:${meta.color}">
        <span class="pill" style="background:${meta.color}">${items.length}</span>
        ${title}
      </summary>
      <ul>${lines}</ul>
    </details>`;
}

const sortedRoutes = [...routes].sort(
  (a, b) =>
    (STATUS_META[a.status]?.order ?? 9) - (STATUS_META[b.status]?.order ?? 9) ||
    a.route.localeCompare(b.route),
);

const cards = sortedRoutes
  .map((r) => {
    const meta = STATUS_META[r.status] || STATUS_META['not-started'];
    const isRemaining = r.status !== 'implemented';

    return `
    <article class="card ${isRemaining ? 'card-remaining' : 'card-done'}" data-status="${r.status}" data-remaining="${isRemaining}">
      <header>
        <div class="title-wrap">
          <span class="status-icon" style="color:${meta.color}">${meta.icon}</span>
          <h2>${escapeHtml(r.route)}</h2>
        </div>
        <span class="badge" style="background:${meta.color}" title="${escapeHtml(meta.hint)}">${meta.label}</span>
      </header>
      <p class="meta">${escapeHtml(r.file)} · score ${r.score ?? '—'} · ${escapeHtml((r.signals || []).join(', '))}</p>
      <div class="shots">
        <figure>
          <figcaption>Light</figcaption>
          <img loading="lazy" src="${galleryPath(r.screenshots?.light)}" alt="light ${escapeHtml(r.route)}" />
        </figure>
        <figure>
          <figcaption>Dark</figcaption>
          <img loading="lazy" src="${galleryPath(r.screenshots?.dark)}" alt="dark ${escapeHtml(r.route)}" />
        </figure>
      </div>
    </article>`;
  })
  .join('\n');

const generatedAt = data.generatedAt || new Date().toISOString();

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Stock Sense — Design Rollout Tracker</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #111827;
      --border: #334155;
      --muted: #94a3b8;
      --text: #e2e8f0;
    }
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; background: var(--bg); color: var(--text); }
    header.page { padding: 24px 32px; border-bottom: 1px solid var(--border); }
    header.page h1 { margin: 0 0 4px; font-size: 1.5rem; }
    header.page .sub { color: var(--muted); font-size: 14px; margin: 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 20px; }
    .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 14px 16px; }
    .stat .num { font-size: 1.75rem; font-weight: 700; line-height: 1; }
    .stat .label { font-size: 12px; color: var(--muted); margin-top: 6px; text-transform: uppercase; letter-spacing: 0.06em; }
    .stat.done .num { color: #10b981; }
    .stat.partial .num { color: #f59e0b; }
    .stat.remaining .num { color: #f87171; }
    .stat.not-started .num { color: #94a3b8; }
    .progress-wrap { margin-top: 16px; }
    .progress-label { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
    .progress-bar { height: 10px; background: #1e293b; border-radius: 999px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 999px; transition: width 0.3s; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
    .filters button { background: #1e293b; color: var(--text); border: 1px solid #475569; border-radius: 999px; padding: 6px 14px; cursor: pointer; font-size: 13px; }
    .filters button.active { background: #10b981; border-color: #10b981; color: #052e16; font-weight: 600; }
    .filters button[data-filter="remaining"].active { background: #ef4444; border-color: #ef4444; color: #fff; }
    .layout { display: grid; grid-template-columns: minmax(280px, 340px) 1fr; gap: 24px; padding: 24px 32px 80px; align-items: start; }
    @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
    .sidebar { position: sticky; top: 16px; max-height: calc(100vh - 32px); overflow: auto; }
    .sidebar h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 0 0 12px; }
    .checklist-group { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
    .checklist-group summary { cursor: pointer; padding: 10px 12px; font-weight: 600; font-size: 13px; list-style: none; display: flex; align-items: center; gap: 8px; }
    .checklist-group summary::-webkit-details-marker { display: none; }
    .checklist-group .pill { color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 999px; min-width: 24px; text-align: center; }
    .checklist-group ul { margin: 0; padding: 0 12px 12px; list-style: none; }
    .checklist-group li { font-size: 12px; padding: 6px 0; border-top: 1px solid #1e293b; display: flex; flex-direction: column; gap: 2px; }
    .checklist-group code { color: #a5f3fc; word-break: break-all; }
    .checklist-group .file { color: var(--muted); font-size: 11px; }
    main.cards { display: grid; gap: 20px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 16px; }
    .card-remaining { border-left: 3px solid #ef4444; }
    .card-done { border-left: 3px solid #10b981; }
    .card[data-status="partial"] { border-left-color: #f59e0b; }
    .card[data-status="not-started"] { border-left-color: #64748b; }
    .card header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .title-wrap { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
    .status-icon { font-size: 14px; margin-top: 2px; flex-shrink: 0; }
    .card h2 { margin: 0; font-size: 0.95rem; word-break: break-all; font-weight: 600; }
    .badge { color: white; font-size: 11px; padding: 4px 10px; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }
    .meta { color: var(--muted); font-size: 12px; margin: 8px 0 0; }
    .shots { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    @media (max-width: 640px) { .shots { grid-template-columns: 1fr; } }
    figure { margin: 0; }
    figcaption { font-size: 11px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em; }
    img { width: 100%; border-radius: 12px; border: 1px solid var(--border); background: #0b1220; min-height: 100px; object-fit: cover; object-position: top; }
    .card.hidden { display: none; }
    .empty-note { color: var(--muted); font-size: 13px; padding: 24px; text-align: center; }
  </style>
</head>
<body>
  <header class="page">
    <h1>Design Rollout Tracker</h1>
    <p class="sub">Benchmark: PortfolioDashboard · Updated ${escapeHtml(generatedAt)} · <code>npm run audit:design:refresh</code> to regenerate</p>

    <div class="stats">
      <div class="stat done">
        <div class="num">${counts.done}</div>
        <div class="label">Completed</div>
      </div>
      <div class="stat partial">
        <div class="num">${counts.partial}</div>
        <div class="label">Partial</div>
      </div>
      <div class="stat remaining">
        <div class="num">${counts.remaining}</div>
        <div class="label">Remaining work</div>
      </div>
      <div class="stat not-started">
        <div class="num">${counts.notStarted}</div>
        <div class="label">Not started</div>
      </div>
      <div class="stat">
        <div class="num" style="color:#ef4444">${counts.legacy}</div>
        <div class="label">Legacy</div>
      </div>
    </div>

    <div class="progress-wrap">
      <div class="progress-label">
        <span>Rollout progress</span>
        <span><strong>${counts.done}</strong> / ${counts.audited} routes complete (${progressPct}%)</span>
      </div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" style="width:${progressPct}%"></div>
      </div>
    </div>

    <div class="filters">
      <button data-filter="all" class="active">All (${counts.audited})</button>
      <button data-filter="remaining">Remaining (${counts.remaining})</button>
      <button data-filter="implemented">Completed (${counts.done})</button>
      <button data-filter="partial">Partial (${counts.partial})</button>
      <button data-filter="legacy">Legacy (${counts.legacy})</button>
      <button data-filter="not-started">Not started (${counts.notStarted})</button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar">
      <h2>Route checklist</h2>
      ${checklistGroup('legacy', 'Legacy — redesign needed')}
      ${checklistGroup('not-started', 'Not started')}
      ${checklistGroup('partial', 'Partial — in progress')}
      ${checklistGroup('implemented', 'Completed')}
    </aside>
    <main class="cards">${cards}</main>
  </div>

  <script>
    const buttons = document.querySelectorAll('.filters button');
    const cards = document.querySelectorAll('.card');

    function applyFilter(filter) {
      cards.forEach((card) => {
        const status = card.dataset.status;
        const isRemaining = card.dataset.remaining === 'true';
        let show = filter === 'all';
        if (!show && filter === 'remaining') show = isRemaining;
        else if (!show) show = status === filter;
        card.classList.toggle('hidden', !show);
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });

    // Default: show remaining work first
    const remainingBtn = document.querySelector('[data-filter="remaining"]');
    if (remainingBtn && ${counts.remaining} > 0) {
      buttons.forEach((b) => b.classList.remove('active'));
      remainingBtn.classList.add('active');
      applyFilter('remaining');
    }
  </script>
</body>
</html>`;

fs.writeFileSync('docs/design-audit/design-coverage-gallery.html', html);
console.log(`Wrote docs/design-audit/design-coverage-gallery.html (${counts.done} done, ${counts.remaining} remaining)`);
