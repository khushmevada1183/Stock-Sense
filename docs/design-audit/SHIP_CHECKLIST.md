# Ship Checklist — 2026-08-23

## Design rollout

- [x] Design matrix remaining routes: **0** (53 implemented user-facing)
- [x] `npm run lint` — pass
- [x] `npx tsc --noEmit` — pass
- [x] `npm run build` — pass
- [x] Design audit heuristics tests — 6/6 pass
- [x] safeRedirect tests — 4/4 pass
- [x] Unified page background: header/main/footer transparent, single `--app-bg` canvas (Tasks 1–7)
- [x] Visual walk: **108/108 clean** (54 routes × light/dark) — `docs/design-audit/visual-walk/VISUAL_WALK_REPORT.md`

## Manual smoke (recommended before deploy)

- [ ] Light/dark toggle on `/`, `/portfolio`, `/login`, `/stocks/RELIANCE`, `/settings?tab=basic`
- [ ] Login → redirect; `?redirect=https://evil` → `/`
- [ ] Mobile header menu + settings drawer
- [ ] `NODE_ENV=production npm start` — `/api-test` returns 404

## Performance (record after Lighthouse run)

| Metric | Target | Recorded |
| --- | --- | --- |
| LCP `/` | ≤ 2.5s | _pending_ |
| LCP `/portfolio` | ≤ 2.5s | _pending_ |
| INP | ≤ 200ms | _pending_ |
| CLS | ≤ 0.1 | _pending_ |

## Commits (Tasks 13–22)

- Task 13: `f0b4dbd` — auth/content layout shells
- Task 14: `1fcf454` — AppShell background
- Task 15: `e2839a6` — settings cluster
- Task 16: `280c710` — news shell
- Task 17: `cb0b69b`, `78d4afb` — auth flows + safeRedirect
- Task 18: `a657f3c` — content pages
- Task 19: `dede2da` — stock detail tabs
- Task 20–21: `9849f33` — misc + dev gate
- Task 22: news category pages + 0 remaining
