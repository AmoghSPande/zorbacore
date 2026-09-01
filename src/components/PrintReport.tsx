import { useEffect, useState } from 'react';
import { db, daysAgoStr, getProfile, todayStr } from '../db';
import { STYLES } from '../lib/coach';
import { fmtTime } from '../lib/running';

interface ReportData {
  name: string;
  style: string;
  from: string;
  to: string;
  sessions: number;
  totalSets: number;
  tonnage: number;
  gluteSets: number;
  avgPerWeek: number;
  runs: number;
  km: number;
  pb5k: string | null;
  pb10k: string | null;
  weightNow: number | null;
  weightDelta: number | null;
  prs: { name: string; detail: string; date: string }[];
  habitPct: number | null;
  kcalAvg: number | null;
}

const DAYS = 90;

/** Full-screen printable report — the flagship Pro export. Light theme for ink. */
export default function PrintReport({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const since = daysAgoStr(DAYS - 1);
      const [profile, exercises, workouts, runs, prs, metrics, habits, habitLogs, meals] = await Promise.all([
        getProfile(),
        db.exercises.toArray(),
        db.workouts.where('date').aboveOrEqual(since).toArray(),
        db.runs.where('date').aboveOrEqual(since).toArray(),
        db.prs.orderBy('date').reverse().toArray(),
        db.bodyMetrics.orderBy('date').toArray(),
        db.habits.toArray(),
        db.habitLogs.where('date').aboveOrEqual(since).toArray(),
        db.meals.where('date').aboveOrEqual(since).toArray(),
      ]);
      if (!alive) return;

      const exMap = new Map(exercises.map((e) => [e.id, e]));
      const finished = workouts.filter((w) => w.endedAt);
      const totalSets = finished.reduce((n, w) => n + w.sets.length, 0);
      const tonnage = finished.reduce((t, w) => t + w.sets.reduce((a, s) => a + s.weightKg * s.reps, 0), 0);
      const gluteSets = finished.reduce((n, w) => n + w.sets.filter((s) => exMap.get(s.exerciseId)?.gluteFocus).length, 0);

      const km = Math.round(runs.reduce((a, r) => a + r.distanceKm, 0) * 10) / 10;
      const fastest = (target: number) => {
        const near = runs.filter((r) => Math.abs(r.distanceKm - target) <= target * 0.08);
        if (!near.length) return null;
        return fmtTime(Math.min(...near.map((r) => r.durationSec)));
      };

      const weights = metrics.filter((m) => m.weightKg != null);
      const inRange = weights.filter((m) => m.date >= since);
      const weightNow = weights.length ? weights[weights.length - 1].weightKg! : null;
      const weightDelta = inRange.length >= 2
        ? Math.round((inRange[inRange.length - 1].weightKg! - inRange[0].weightKg!) * 10) / 10
        : null;

      const activeHabits = habits.filter((h) => !h.archived);
      const habitPct = activeHabits.length
        ? Math.round((habitLogs.length / (activeHabits.length * DAYS)) * 100)
        : null;

      const kcalByDay = new Map<string, number>();
      for (const m of meals) kcalByDay.set(m.date, (kcalByDay.get(m.date) ?? 0) + m.kcal);
      const kcalAvg = kcalByDay.size
        ? Math.round([...kcalByDay.values()].reduce((a, b) => a + b, 0) / kcalByDay.size)
        : null;

      setData({
        name: profile.name || 'Athlete',
        style: STYLES[profile.trainingStyle ?? 'hybrid'].label,
        from: since,
        to: todayStr(),
        sessions: finished.length,
        totalSets,
        tonnage: Math.round(tonnage),
        gluteSets,
        avgPerWeek: Math.round((finished.length / DAYS) * 7 * 10) / 10,
        runs: runs.length,
        km,
        pb5k: fastest(5),
        pb10k: fastest(10),
        weightNow,
        weightDelta,
        prs: prs.slice(0, 12).map((p) => ({ name: exMap.get(p.exerciseId)?.name ?? p.exerciseId, detail: p.detail, date: p.date })),
        habitPct,
        kcalAvg,
      });
    })();
    return () => { alive = false; };
  }, []);

  const Stat = ({ v, k }: { v: string | number; k: string }) => (
    <div style={{ border: '1px solid #dfe4ea', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#0b1b3a' }}>{v}</div>
      <div style={{ fontSize: 11, color: '#5b6472', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
    </div>
  );

  return (
    <div className="print-report" style={{
      position: 'fixed', inset: 0, zIndex: 200, background: '#fff', color: '#0b1b3a',
      overflow: 'auto', padding: 24, fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div className="no-print" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn" onClick={onClose} style={{ background: '#eef1f5', color: '#0b1b3a', border: '1px solid #dfe4ea' }}>Close</button>
        <button className="btn primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      {!data ? (
        <div style={{ color: '#5b6472' }}>Preparing your report…</div>
      ) : (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid #0b1b3a', paddingBottom: 10, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Zorbacore</div>
              <div style={{ fontSize: 13, color: '#5b6472' }}>Training &amp; Progress Report</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#5b6472' }}>
              <div><b style={{ color: '#0b1b3a' }}>{data.name}</b></div>
              <div>{data.style}</div>
              <div>{data.from} → {data.to}</div>
            </div>
          </div>

          <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b6472', margin: '0 0 8px' }}>Last 90 days</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            <Stat v={data.sessions} k="sessions" />
            <Stat v={data.avgPerWeek} k="per week" />
            <Stat v={data.totalSets} k="sets logged" />
            <Stat v={`${Math.round(data.tonnage / 100) / 10}t`} k="tonnage lifted" />
            <Stat v={data.gluteSets} k="glute sets" />
            <Stat v={`${data.km} km`} k="distance run" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            <Stat v={data.pb5k ?? '—'} k="5K best" />
            <Stat v={data.pb10k ?? '—'} k="10K best" />
            <Stat v={data.weightNow != null ? `${data.weightNow} kg` : '—'} k="current weight" />
            <Stat v={data.weightDelta != null ? `${data.weightDelta > 0 ? '+' : ''}${data.weightDelta} kg` : '—'} k="90-day change" />
            <Stat v={data.habitPct != null ? `${data.habitPct}%` : '—'} k="habit consistency" />
            <Stat v={data.kcalAvg != null ? `${data.kcalAvg}` : '—'} k="avg kcal/day" />
          </div>

          <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b6472', margin: '0 0 8px' }}>Personal records</h3>
          {data.prs.length === 0 ? (
            <div style={{ color: '#5b6472', fontSize: 13 }}>No records logged yet — they appear here as you beat your bests.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {data.prs.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eef1f5' }}>
                    <td style={{ padding: '6px 4px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>{p.detail}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#5b6472', width: 90 }}>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 24, paddingTop: 10, borderTop: '1px solid #eef1f5', fontSize: 11, color: '#8a93a0' }}>
            Generated by Zorbacore · zorbacore.com · This report reflects data stored on your device. Not medical advice.
          </div>
        </div>
      )}
    </div>
  );
}
