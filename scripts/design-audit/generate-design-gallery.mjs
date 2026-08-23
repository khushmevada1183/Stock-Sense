// scripts/design-audit/generate-design-gallery.mjs
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('docs/design-audit/design-coverage-data.json', 'utf8'));

/** Paths relative to docs/design-audit/ so file:// gallery works without a server */
function galleryPath(p) {
  if (!p) return '';
  return p.replace(/\\/g, '/').replace(/^docs\/design-audit\//, '');
}

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
          <img loading="lazy" src="${galleryPath(r.screenshots?.light)}" alt="light ${r.route}" />
        </figure>
        <figure>
          <figcaption>Dark</figcaption>
          <img loading="lazy" src="${galleryPath(r.screenshots?.dark)}" alt="dark ${r.route}" />
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
