import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getProfile, todayStr } from '../db';
import type { BodyMetric, Profile } from '../types';
import { e1rm, weeklyVolumes, type WeekVolume } from '../lib/stats';
import { computeRunStats, type RunStats } from '../lib/running';
import { LineChart, BarChart, VIZ, type Pt } from '../components/charts';
import { Stepper } from '../components/inputs';

function shortDate(d: string): string {
  return d.slice(5).replace('-', '/');
}

/** Least-squares slope per day over (dayIndex, value) points. */
function linearTrend(points: { day: number; v: number }[]): { slopePerDay: number; intercept: number } | null {
  if (points.length < 3) return null;
  const n = points.length;
  const sx = points.reduce((a, p) => a + p.day, 0);
  const sy = points.reduce((a, p) => a + p.v, 0);
  const sxy = points.reduce((a, p) => a + p.day * p.v, 0);
  const sxx = points.reduce((a, p) => a + p.day * p.day, 0);
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const slope = (n * sxy - sx * sy) / denom;
  return { slopePerDay: slope, intercept: (sy - slope * sx) / n };
}

export default function Progress() {
  const [showLog, setShowLog] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vols, setVols] = useState<WeekVolume[]>([]);
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [liftId, setLiftId] = useState<string | null>(null);

  const metrics = useLiveQuery(() => db.bodyMetrics.orderBy('date').toArray(), []) ?? [];
  const workouts = useLiveQuery(() => db.workouts.toArray(), []) ?? [];
  const prs = useLiveQuery(() => db.prs.orderBy('date').reverse().limit(12).toArray(), []) ?? [];
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];

  useEffect(() => { getProfile().then(setProfile); }, [showLog]);
  useEffect(() => {
    weeklyVolumes(8).then(setVols);
    computeRunStats(8).then(setRunStats);
  }, [workouts.length]);

  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  // ---- body series ----
  const weightPts: Pt[] = metrics.filter((m) => m.weightKg != null).map((m) => ({ label: shortDate(m.date), y: m.weightKg! }));
  const waistPts: Pt[] = metrics.filter((m) => m.waistCm != null).map((m) => ({ label: shortDate(m.date), y: m.waistCm! }));
  const bfPts: Pt[] = metrics.filter((m) => m.bodyFatPct != null).map((m) => ({ label: shortDate(m.date), y: m.bodyFatPct! }));
  const armPts: Pt[] = metrics.filter((m) => m.armCm != null).map((m) => ({ label: shortDate(m.date), y: m.armCm! }));

  // visceral proxy: waist-to-height ratio
  const latestWaist = [...metrics].reverse().find((m) => m.waistCm != null)?.waistCm;
  const whtr = latestWaist && profile?.heightCm ? latestWaist / profile.heightCm : null;
  const whtrCat = whtr == null ? null : whtr < 0.5 ? { label: 'healthy zone', tone: 'ok' } : whtr < 0.6 ? { label: 'elevated — trending target: below 0.5', tone: 'warn' } : { label: 'high — priority to bring down', tone: 'bad' };

  // projection to target weight
  const projection = useMemo(() => {
    const wm = metrics.filter((m) => m.weightKg != null);
    if (wm.length < 3 || !profile?.targetWeightKg) return null;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 56);
    const recent = wm.filter((m) => m.date >= todayStr(cutoff));
    if (recent.length < 3) return null;
    const day0 = new Date(recent[0].date).getTime();
    const t = linearTrend(recent.map((m) => ({ day: (new Date(m.date).getTime() - day0) / 86400000, v: m.weightKg! })));
    if (!t || t.slopePerDay >= -0.001) return { rate: t?.slopePerDay ?? 0, eta: null };
    const current = recent[recent.length - 1].weightKg!;
    const daysLeft = (current - profile.targetWeightKg) / -t.slopePerDay;
    if (daysLeft < 0 || daysLeft > 1000) return { rate: t.slopePerDay, eta: null };
    const eta = new Date(); eta.setDate(eta.getDate() + Math.round(daysLeft));
    return { rate: t.slopePerDay, eta };
  }, [metrics, profile]);

  // ---- strength progress: e1RM over time for pickable lifts ----
  const liftOptions = useMemo(() => {
    const freq = new Map<string, number>();
    for (const w of workouts) for (const s of w.sets) {
      if (s.weightKg > 0) freq.set(s.exerciseId, (freq.get(s.exerciseId) ?? 0) + 1);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id);
  }, [workouts]);
  const lift = liftId ?? liftOptions[0] ?? null;

  const liftPts: Pt[] = useMemo(() => {
    if (!lift) return [];
    const byDate = new Map<string, number>();
    for (const w of workouts) {
      if (!w.endedAt) continue;
      const best = Math.max(0, ...w.sets.filter((s) => s.exerciseId === lift).map((s) => e1rm(s.weightKg, s.reps)));
      if (best > 0) byDate.set(w.date, Math.max(byDate.get(w.date) ?? 0, best));
    }
    return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([d, v]) => ({ label: shortDate(d), y: v }));
  }, [lift, workouts]);

  // consistency: sessions per week
  const consistency = vols.map((v, i) => ({
    label: shortDate(v.week),
    values: [v.workouts + (runStats?.weeklyKm ? (runStats.weeklyKm.find((w) => w.week === v.week)?.runs ?? 0) : 0)],
    _i: i,
  }));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Progress</h1>
          <div className="sub">Fat loss · strength · running · consistency</div>
        </div>
        <button className="btn sm primary" onClick={() => setShowLog(true)}>+ Measure</button>
      </div>

      {/* fat-loss dashboard */}
      <div className="card">
        <div className="card-title">Weight (kg)</div>
        {weightPts.length >= 2 ? (
          <LineChart points={weightPts.slice(-30)} color={VIZ.blue} unit="kg"
            targetY={profile?.targetWeightKg} targetLabel={profile?.targetWeightKg ? `target ${profile.targetWeightKg}` : undefined} />
        ) : (
          <div className="empty">Log your weight in the daily check-in or with + Measure.</div>
        )}
        {projection && (
          <div className="tag-note" style={{ marginTop: 6 }}>
            {projection.rate < -0.001
              ? <>Losing ~{Math.abs(Math.round(projection.rate * 7 * 100) / 100)} kg/week.{projection.eta ? <> At this rate you reach {profile?.targetWeightKg}kg around <b>{projection.eta.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</b>.</> : ''} Sustainable pace is 0.25–0.75 kg/week.</>
              : 'Weight is flat over the recent weeks — tighten nutrition slightly; training is only half the equation.'}
          </div>
        )}
      </div>

      <div className="card">
        <div className="row-between">
          <div className="card-title" style={{ margin: 0 }}>Waist (cm) — visceral-fat proxy</div>
          {whtrCat && <span className={`badge ${whtrCat.tone}`}>{whtrCat.label}</span>}
        </div>
        {waistPts.length >= 2 ? (
          <div style={{ marginTop: 8 }}>
            <LineChart points={waistPts.slice(-30)} color={VIZ.green} unit="cm"
              targetY={profile?.targetWaistCm} targetLabel={profile?.targetWaistCm ? `target ${profile.targetWaistCm}` : undefined} />
          </div>
        ) : (
          <div className="empty">Measure your waist at the navel weekly — it tracks visceral fat far better than the scale.</div>
        )}
        {whtr != null && (
          <div className="tag-note" style={{ marginTop: 6 }}>
            Waist-to-height ratio: <b>{Math.round(whtr * 100) / 100}</b> — below 0.5 is the evidence-based marker of low visceral fat.
          </div>
        )}
      </div>

      {bfPts.length >= 2 && (
        <div className="card">
          <div className="card-title">Body fat %</div>
          <LineChart points={bfPts.slice(-30)} color={VIZ.yellow} unit="%"
            targetY={profile?.targetBodyFatPct} targetLabel={profile?.targetBodyFatPct ? `target ${profile.targetBodyFatPct}%` : undefined} />
        </div>
      )}

      {armPts.length >= 2 && (
        <div className="card">
          <div className="card-title">Arm circumference (cm) — bicep goal</div>
          <LineChart points={armPts.slice(-30)} color={VIZ.green} unit="cm" />
        </div>
      )}

      {/* consistency */}
      {consistency.some((c) => c.values[0] > 0) && (
        <div className="card">
          <div className="card-title">Consistency — sessions per week</div>
          <BarChart data={consistency} series={['sessions']} colors={[VIZ.blue]} height={130} />
          <div className="tag-note" style={{ marginTop: 4 }}>Target: 2–3 gym + 1–2 runs + daily mobility. Showing up is the program.</div>
        </div>
      )}

      {/* training volume */}
      {vols.some((v) => v.totalSets > 0) && (
        <div className="card">
          <div className="card-title">Priority volume — weekly sets</div>
          <BarChart
            data={vols.map((v) => ({ label: shortDate(v.week), values: [v.gluteSets, v.bicepSets] }))}
            series={['glute sets', 'bicep sets']}
            colors={[VIZ.green, VIZ.blue]}
            height={140}
          />
          <div className="tag-note" style={{ marginTop: 4 }}>Glute target: 10–20 · Bicep target: 6–12 quality sets.</div>
        </div>
      )}

      {/* running */}
      {runStats && runStats.weeklyKm.some((w) => w.km > 0) && (
        <div className="card">
          <div className="card-title">Running — weekly km</div>
          <BarChart
            data={runStats.weeklyKm.slice(-8).map((w) => ({ label: shortDate(w.week), values: [Math.round(w.km * 10) / 10] }))}
            series={['km']} colors={[VIZ.blue]} height={130}
          />
        </div>
      )}

      {/* strength progress */}
      {liftOptions.length > 0 && (
        <div className="card">
          <div className="card-title">Strength — estimated 1RM</div>
          <div className="chip-row scroll" style={{ margin: '0 0 8px' }}>
            {liftOptions.map((id) => (
              <button key={id} className={`chip ${lift === id ? 'on' : ''}`} onClick={() => setLiftId(id)}>
                {exMap.get(id)?.name ?? id}
              </button>
            ))}
          </div>
          {liftPts.length >= 2 ? (
            <LineChart points={liftPts.slice(-20)} color={VIZ.green} unit="kg" />
          ) : (
            <div className="empty">Two or more sessions of this lift will draw the trend.</div>
          )}
        </div>
      )}

      {/* PRs */}
      <div className="card pad-sm">
        <div className="card-title">🏆 Personal records</div>
        {prs.length === 0 && <div className="empty">PRs appear automatically when you beat your best.</div>}
        {prs.map((p) => (
          <div key={p.id} className="li">
            <div className="li-main">
              <div className="li-title">{exMap.get(p.exerciseId)?.name ?? p.exerciseId}</div>
              <div className="li-sub">{p.date}</div>
            </div>
            <div className="li-end" style={{ color: 'var(--warn)', fontWeight: 700 }}>{p.detail}</div>
          </div>
        ))}
      </div>

      {showLog && <MeasureModal onClose={() => setShowLog(false)} last={metrics[metrics.length - 1]} />}
    </div>
  );
}

// ---------------- measurement modal ----------------

function MeasureModal({ onClose, last }: { onClose: () => void; last?: BodyMetric }) {
  const [weight, setWeight] = useState(last?.weightKg ?? 0);
  const [waist, setWaist] = useState(last?.waistCm ?? 0);
  const [bf, setBf] = useState(last?.bodyFatPct ?? 0);
  const [arm, setArm] = useState(last?.armCm ?? 0);

  const save = async () => {
    const m: BodyMetric = { date: todayStr() };
    if (weight > 0) m.weightKg = weight;
    if (waist > 0) m.waistCm = waist;
    if (bf > 0) m.bodyFatPct = bf;
    if (arm > 0) m.armCm = arm;
    if (Object.keys(m).length > 1) await db.bodyMetrics.add(m);
    onClose();
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Log measurements</h2>
        <p className="tag-note">Fill what you measured — skip the rest. Best: same time of day, weekly for waist/arm.</p>
        <div className="grid-2">
          <label className="field"><span className="lbl">Weight (kg)</span><Stepper value={weight} onChange={setWeight} step={0.1} /></label>
          <label className="field"><span className="lbl">Waist (cm)</span><Stepper value={waist} onChange={setWaist} step={0.5} /></label>
          <label className="field"><span className="lbl">Body fat (%)</span><Stepper value={bf} onChange={setBf} step={0.5} /></label>
          <label className="field"><span className="lbl">Arm (cm, flexed)</span><Stepper value={arm} onChange={setArm} step={0.25} /></label>
        </div>
        <button className="btn primary big" onClick={save}>Save</button>
      </div>
    </div>
  );
}
