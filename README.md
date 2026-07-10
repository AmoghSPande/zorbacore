# HybridCoach — zorbacore.com

A personal hybrid-athlete training PWA: workout tracking, adaptive strength + running
coaching, lower-back recovery, glute & bicep development, mobility, readiness/recovery
management, fat-loss dashboard and an AI chat coach — mobile-first, dark, offline-capable.

Built for one athlete: 2–3 gym sessions/week + running, working around right-knee
chondromalacia and chronic lower-back stiffness, with a fixed equipment list.

## Run locally

```bash
npm install
npm run dev        # open the printed URL; add --host to test from your phone
npm run build      # production build to dist/
```

## Deploy (GitHub Pages → zorbacore.com)

1. Merge to `main`.
2. Repo **Settings → Pages → Source: GitHub Actions** (one-time).
3. The `Deploy to GitHub Pages` workflow builds and publishes automatically —
   the app goes live at **https://zorbacore.com** (CNAME is in `public/`).
4. On your phone, open the site and **Add to Home Screen** — it installs as an app
   and works offline.

## Data

Everything is stored on-device in IndexedDB (Dexie). Use **Settings → Export backup**
for a JSON backup / device migration. Nothing leaves the device unless you add an
Anthropic API key for the AI chat coach (Settings), which is also stored locally.

## Stack

React 18 + TypeScript + Vite · Dexie (IndexedDB) · vite-plugin-pwa ·
hand-built animated SVG exercise demos (`src/anim/`) · custom SVG charts.

## Structure

```
src/
  anim/        skeletal animation engine + ~60 pose-keyframed exercise demos
  components/  ExerciseAnim, charts, inputs, check-in, mobility player, nav
  data/        exercise library (seeded), equipment, mobility routines
  lib/         coach (session builder + symptom gates), readiness, running,
               stats/PRs/volume, chat coach, notifications
  pages/       Home, Train, Run, Coach, Progress, Library, Exercise, Chat, Settings
```

`#/animtest` is a hidden route that renders every exercise animation for QA.

## Phase 2 (planned, not built)

Apple Health / Health Connect / Watch / Garmin / Fitbit integrations — the Dexie data
layer is the sync target; nothing in the current design blocks them.
