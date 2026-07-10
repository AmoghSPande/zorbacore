import { db, todayStr, weekStart } from '../db';
import type { Run, RunType } from '../types';

export function paceSecPerKm(r: Run): number {
  if (r.distanceKm <= 0) return 0;
  return r.durationSec / r.distanceKm;
}

export function fmtPace(secPerKm: number): string {
  if (!secPerKm || !Number.isFinite(secPerKm)) return '—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}/km`;
}

export function fmtTime(totalSec: number): string {
  if (!totalSec || !Number.isFinite(totalSec)) return '—';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

/** Daniels/Gilbert VO2max estimate from a race-effort performance. */
export function vo2maxFrom(distanceKm: number, durationSec: number): number {
  const tMin = durationSec / 60;
  const v = (distanceKm * 1000) / tMin; // m/min
  const pctMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);
  const vo2 = -4.6 + 0.182258 * v + 0.000104 * v * v;
  return Math.round((vo2 / pctMax) * 10) / 10;
}

export interface RunStats {
  pb5k?: { sec: number; date: string };
  pb10k?: { sec: number; date: string };
  bestPace?: { sec: number; date: string; distanceKm: number };
  vo2max?: number;
  weeklyKm: { week: string; km: number; runs: number }[];
  thisWeekKm: number;
  lastWeekKm: number;
  runsPerWeekAvg: number;
  current5kEstimateSec: number;
}

/** A run counts as a 5K/10K effort if distance is within tolerance. */
export async function computeRunStats(nWeeks = 10): Promise<RunStats> {
  const runs = await db.runs.orderBy('date').toArray();

  let pb5k: RunStats['pb5k'];
  let pb10k: RunStats['pb10k'];
  let bestPace: RunStats['bestPace'];
  let vo2max: number | undefined;

  for (const r of runs) {
    if (r.distanceKm >= 4.75 && r.distanceKm <= 5.6) {
      const t = (r.durationSec / r.distanceKm) * 5;
      if (!pb5k || t < pb5k.sec) pb5k = { sec: Math.round(t), date: r.date };
    }
    if (r.distanceKm >= 9.5 && r.distanceKm <= 11.2) {
      const t = (r.durationSec / r.distanceKm) * 10;
      if (!pb10k || t < pb10k.sec) pb10k = { sec: Math.round(t), date: r.date };
    }
    if (r.distanceKm >= 2) {
      const p = paceSecPerKm(r);
      if (!bestPace || p < bestPace.sec) bestPace = { sec: p, date: r.date, distanceKm: r.distanceKm };
    }
  }

  // VO2max from the best recent hard effort (≥3km, last 90 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const recentHard = runs.filter(
    (r) => r.distanceKm >= 3 && r.date >= todayStr(cutoff) && (r.type === 'tempo' || r.type === 'interval' || r.type === 'timetrial'),
  );
  const anyRecent = runs.filter((r) => r.distanceKm >= 3 && r.date >= todayStr(cutoff));
  const basis = (recentHard.length ? recentHard : anyRecent)
    .map((r) => ({ r, v: vo2maxFrom(r.distanceKm, r.durationSec) }))
    .sort((a, b) => b.v - a.v)[0];
  if (basis) vo2max = basis.v;

  // weekly mileage
  const weeks = new Map<string, { week: string; km: number; runs: number }>();
  for (let i = nWeeks - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const wk = weekStart(todayStr(d));
    weeks.set(wk, { week: wk, km: 0, runs: 0 });
  }
  for (const r of runs) {
    const wk = weekStart(r.date);
    const e = weeks.get(wk);
    if (e) { e.km += r.distanceKm; e.runs += 1; }
  }
  const weeklyKm = [...weeks.values()];
  const thisWeekKm = weeklyKm[weeklyKm.length - 1]?.km ?? 0;
  const lastWeekKm = weeklyKm[weeklyKm.length - 2]?.km ?? 0;
  const activeWeeks = weeklyKm.filter((w) => w.runs > 0);
  const runsPerWeekAvg = activeWeeks.length
    ? activeWeeks.reduce((a, w) => a + w.runs, 0) / activeWeeks.length
    : 0;

  // current 5K capability: PB in last 90 days, else scale best recent pace, else default
  let current5kEstimateSec = 33 * 60;
  const recent5k = runs.filter((r) => r.distanceKm >= 4.75 && r.distanceKm <= 5.6 && r.date >= todayStr(cutoff));
  if (recent5k.length) {
    current5kEstimateSec = Math.min(...recent5k.map((r) => Math.round((r.durationSec / r.distanceKm) * 5)));
  } else if (basis) {
    // rough: 5K time from VO2max via inverted Daniels (search)
    current5kEstimateSec = time5kForVo2(basis.v);
  } else if (bestPace) {
    current5kEstimateSec = Math.round(bestPace.sec * 5 * 1.03);
  }

  return { pb5k, pb10k, bestPace, vo2max, weeklyKm, thisWeekKm, lastWeekKm, runsPerWeekAvg, current5kEstimateSec };
}

function time5kForVo2(vo2: number): number {
  // binary search duration where vo2maxFrom(5, t) == vo2
  let lo = 14 * 60, hi = 60 * 60;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (vo2maxFrom(5, mid) > vo2) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

export interface PaceTargets {
  easy: number; zone2: number; tempo: number; interval: number; recovery: number;
}

/** Training paces (sec/km) derived from current 5K capability. */
export function paceTargets(current5kSec: number): PaceTargets {
  const p5k = current5kSec / 5;
  return {
    recovery: p5k + 105,
    easy: p5k + 80,
    zone2: p5k + 65,
    tempo: p5k + 18,
    interval: p5k - 12,
  };
}

export interface PlannedRun {
  type: RunType;
  title: string;
  detail: string;
  paceSec?: number;
  priority: 1 | 2 | 3;
}

export interface RunGuidance {
  banner?: string;
  replaceWith?: string; // suggest bike / incline walk instead
  runs: PlannedRun[];
  goal: { name: string; targetSec: number; currentSec: number };
}

/**
 * Weekly run plan toward 5K<30 then 10K<60, adapted to fitness and symptoms.
 */
export function buildRunPlan(stats: RunStats, sym?: { knee: number; back: number; energy: number }): RunGuidance {
  const t = paceTargets(stats.current5kEstimateSec);
  const has5kGoal = !stats.pb5k || stats.pb5k.sec > 30 * 60;
  const goal = has5kGoal
    ? { name: '5K under 30:00', targetSec: 1800, currentSec: stats.pb5k?.sec ?? stats.current5kEstimateSec }
    : { name: '10K under 60:00', targetSec: 3600, currentSec: stats.pb10k?.sec ?? Math.round(stats.current5kEstimateSec * 2.085) };

  const base = Math.max(stats.thisWeekKm, stats.lastWeekKm);
  const lowMileage = base < 8;

  const runs: PlannedRun[] = [];
  if (lowMileage) {
    runs.push({
      type: 'easy', priority: 1,
      title: 'Easy run · 20–30 min',
      detail: 'Conversational pace, walk breaks welcome. Building the habit beats building speed.',
      paceSec: t.easy,
    });
    runs.push({
      type: 'zone2', priority: 2,
      title: 'Zone 2 · 30–40 min',
      detail: 'Nose-breathing effort. This is where the engine (and fat-burning) grows.',
      paceSec: t.zone2,
    });
    runs.push({
      type: 'recovery', priority: 3,
      title: 'Optional: recovery jog or incline walk · 20 min',
      detail: 'Only if the knee is quiet and life allows a third session.',
      paceSec: t.recovery,
    });
  } else if (has5kGoal) {
    runs.push({
      type: 'interval', priority: 1,
      title: 'Intervals · 6–8 × 400m',
      detail: `400m at ${fmtPace(t.interval)} with 90s walk/jog recovery. Warm up 10 min easy first.`,
      paceSec: t.interval,
    });
    runs.push({
      type: 'zone2', priority: 2,
      title: 'Zone 2 · 35–45 min',
      detail: 'The unglamorous base that makes race day possible.',
      paceSec: t.zone2,
    });
    runs.push({
      type: 'tempo', priority: 3,
      title: 'Tempo · 15–20 min comfortably hard',
      detail: `Around ${fmtPace(t.tempo)} — you can say short phrases, not sentences.`,
      paceSec: t.tempo,
    });
  } else {
    runs.push({
      type: 'zone2', priority: 1,
      title: 'Long Zone 2 · 50–70 min',
      detail: '10K success is mostly about time on feet. Slow is the point.',
      paceSec: t.zone2,
    });
    runs.push({
      type: 'tempo', priority: 2,
      title: 'Tempo · 2 × 12 min',
      detail: `At ${fmtPace(t.tempo)} with 3 min easy between. Builds 10K-specific strength.`,
      paceSec: t.tempo,
    });
    runs.push({
      type: 'easy', priority: 3,
      title: 'Easy run · 30 min',
      detail: 'Keep it genuinely easy.',
      paceSec: t.easy,
    });
  }

  const g: RunGuidance = { runs, goal };

  if (sym) {
    if (sym.knee >= 7) {
      g.replaceWith = 'spin-bike-z2';
      g.banner = `Knee at ${sym.knee}/10 — skip impact today. Do 30–45 min Zone 2 on the spin bike or a steep incline walk instead; it counts fully toward your engine.`;
    } else if (sym.knee >= 4) {
      g.banner = `Knee at ${sym.knee}/10 — easy run only today: shorten stride, cadence up ~5%, flat route, and stop if it climbs above ${Math.min(sym.knee + 1, 6)}/10. No tempo or intervals.`;
      g.runs = runs.filter((r) => r.type === 'easy' || r.type === 'zone2' || r.type === 'recovery');
    }
    if (sym.back >= 6) {
      g.banner = (g.banner ? g.banner + ' ' : '') + `Back at ${sym.back}/10 — do 5 min of cat–cow and hip-flexor stretch first, run tall, and keep it easy.`;
      g.runs = g.runs.filter((r) => r.type !== 'interval');
    }
    if (sym.energy <= 3) {
      g.banner = (g.banner ? g.banner + ' ' : '') + 'Energy is very low — a 20 min recovery jog or a full rest day will help you more than pushing.';
      g.runs = g.runs.filter((r) => r.type === 'recovery' || r.type === 'easy');
    }
  }

  return g;
}

export const RUN_TYPE_LABEL: Record<RunType, string> = {
  easy: 'Easy',
  zone2: 'Zone 2',
  tempo: 'Tempo',
  interval: 'Intervals',
  recovery: 'Recovery',
  timetrial: 'Time trial',
};
