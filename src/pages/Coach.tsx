import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, daysAgoStr, weekStart, todayStr } from '../db';
import { ROUTINES, type Routine } from '../data/mobility';
import { weeklyVolumes, type WeekVolume } from '../lib/stats';
import { computeDayStatus, type DayStatus } from '../lib/readiness';
import MobilityPlayer from '../components/MobilityPlayer';
import ExerciseAnim from '../components/ExerciseAnim';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Coach() {
  const nav = useNavigate();
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [openRoutine, setOpenRoutine] = useState<string | null>(null);
  const [vol, setVol] = useState<WeekVolume | null>(null);
  const [status, setStatus] = useState<DayStatus | null>(null);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const workouts = useLiveQuery(() => db.workouts.toArray(), []) ?? [];
  const runs = useLiveQuery(() => db.runs.toArray(), []) ?? [];

  useEffect(() => {
    weeklyVolumes(1).then((v) => setVol(v[v.length - 1] ?? null));
    computeDayStatus().then(setStatus);
  }, [workouts.length, runs.length]);

  const exMap = new Map(exercises.map((e) => [e.id, e]));
  const wk = weekStart(todayStr());
  const doneThisWeek = workouts.filter((w) => w.endedAt && w.date >= wk);
  const strengthDone = doneThisWeek.filter((w) => w.type === 'strength-core' || w.type === 'strength-conditioning').length;
  const runsDone = runs.filter((r) => r.date >= wk).length;
  const mobilityDone = doneThisWeek.filter((w) => w.type === 'mobility').length;

  // lower-back therapy compliance: back-therapeutic sets this week
  const backTherapySets = doneThisWeek.reduce(
    (n, w) => n + w.sets.filter((s) => exMap.get(s.exerciseId)?.backTherapeutic).length,
    0,
  );

  const weekPlan = [
    {
      label: 'Day 1 · Full Body Strength + Core', done: strengthDone >= 1,
      hint: 'Squat pattern, push, hinge, row, hip thrust, biceps, McGill Big 3',
      action: () => nav('/train'),
    },
    {
      label: 'Day 2 · Run + Mobility', done: runsDone >= 1,
      hint: 'Easy/Zone 2 run + 15-min mobility session',
      action: () => nav('/run'),
    },
    {
      label: 'Day 3 · Strength + Conditioning', done: strengthDone >= 2,
      hint: 'Hinge, press, single-leg, pull, arms, carries, tyre work',
      action: () => nav('/train'),
    },
    {
      label: 'Daily · 5–15 min mobility', done: mobilityDone >= 3,
      hint: `${mobilityDone} session${mobilityDone === 1 ? '' : 's'} so far this week`,
      action: () => setOpenRoutine('morning'),
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Coach</h1>
          <div className="sub">Hybrid plan · lower-back recovery · glutes & biceps</div>
        </div>
        <Link to="/chat" className="btn sm primary">💬 Chat</Link>
      </div>

      {/* weekly hybrid plan */}
      <div className="card pad-sm">
        <div className="card-title">This week's hybrid plan</div>
        {weekPlan.map((d, i) => (
          <button key={i} className="li" style={{ width: '100%', textAlign: 'left' }} onClick={d.action}>
            <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{d.done ? '✅' : '⬜️'}</span>
            <div className="li-main">
              <div className="li-title">{d.label}</div>
              <div className="li-sub" style={{ whiteSpace: 'normal' }}>{d.hint}</div>
            </div>
            <span className="li-end">›</span>
          </button>
        ))}
        {status?.readiness && status.readiness.level === 'recovery' && (
          <div className="tag-note" style={{ padding: '8px 2px 2px', color: 'var(--warn)' }}>
            Readiness is low today — swap whatever was planned for mobility + an easy walk. The plan bends so you don't break.
          </div>
        )}
      </div>

      <WeeklyReview />

      {/* priorities */}
      {vol && (
        <div className="grid-2">
          <div className="card pad-sm">
            <div className="card-title" style={{ color: 'var(--accent)' }}>Glute priority</div>
            <div className="stat">
              <span className="v">{vol.gluteSets}<small>/10–20 sets</small></span>
              <span className="k">this week</span>
            </div>
            <div className="progressbar" style={{ marginTop: 8 }}>
              <div style={{ width: `${Math.min(100, (vol.gluteSets / 15) * 100)}%` }} />
            </div>
          </div>
          <div className="card pad-sm">
            <div className="card-title" style={{ color: 'var(--run)' }}>Bicep volume</div>
            <div className="stat">
              <span className="v">{vol.bicepSets}<small>/6–12 sets</small></span>
              <span className="k">this week</span>
            </div>
            <div className="progressbar" style={{ marginTop: 8 }}>
              <div style={{ width: `${Math.min(100, (vol.bicepSets / 9) * 100)}%`, background: 'var(--run)' }} />
            </div>
          </div>
        </div>
      )}

      {/* lower-back recovery system */}
      <div className="card">
        <div className="card-title" style={{ color: 'var(--mobility)' }}>Lower-back recovery system</div>
        <p style={{ fontSize: '0.88rem', marginBottom: 8 }}>
          The goal is elimination, not management. The system attacks the five usual causes:
          weak glutes → <b>hip thrusts & bridges</b>; poor core stability → <b>McGill Big 3</b>;
          tight hip flexors → <b>daily half-kneeling stretch</b>; poor hinge mechanics → <b>RDL & pull-through practice</b>;
          stiff upper back → <b>t-spine work</b>.
        </p>
        <div className="row-between" style={{ marginBottom: 6 }}>
          <span className="tag-note">Back-therapy sets this week</span>
          <span style={{ fontWeight: 750, color: backTherapySets >= 15 ? 'var(--accent)' : 'var(--text)' }}>{backTherapySets} / ~15</span>
        </div>
        <div className="progressbar"><div style={{ width: `${Math.min(100, (backTherapySets / 15) * 100)}%`, background: 'var(--mobility)' }} /></div>
        <div className="chip-row" style={{ marginTop: 10 }}>
          <Link to="/library/mcgill-curl-up" className="chip">McGill curl-up</Link>
          <Link to="/library/side-plank" className="chip">Side plank</Link>
          <Link to="/library/bird-dog" className="chip">Bird dog</Link>
          <Link to="/library/dead-bug" className="chip">Dead bug</Link>
          <Link to="/library/pallof-press" className="chip">Pallof press</Link>
        </div>
      </div>

      {/* mobility routines */}
      <div>
        <div className="card-title" style={{ margin: '4px 0 6px 4px' }}>Mobility sessions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROUTINES.map((r) => (
            <div key={r.id} className="card pad-sm">
              <div className="row" style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpenRoutine(openRoutine === r.id ? null : r.id)}>
                <div className="grow">
                  <div className="li-title">{r.name} <span className="badge purple">{r.minutes} min</span></div>
                  <div className="li-sub" style={{ whiteSpace: 'normal' }}>{r.when}</div>
                </div>
                <button className="btn sm mobility" onClick={(e) => { e.stopPropagation(); setPlaying(r); }}>▶ Start</button>
              </div>
              {openRoutine === r.id && (
                <div style={{ marginTop: 8 }}>
                  {r.items.map((it, i) => {
                    const ex = exMap.get(it.exerciseId);
                    return (
                      <Link key={i} to={`/library/${it.exerciseId}`} className="li">
                        <div style={{ width: 48, height: 34, flexShrink: 0 }}>
                          <ExerciseAnim animId={ex?.animation ?? ''} />
                        </div>
                        <div className="li-main">
                          <div className="li-title" style={{ fontSize: '0.88rem' }}>{ex?.name ?? it.exerciseId}</div>
                          {it.note && <div className="li-sub">{it.note}</div>}
                        </div>
                        <div className="li-end">{it.seconds}s</div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {playing && <MobilityPlayer routine={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

// ---------------- weekly review ----------------

/** Honest last-7-days summary with one concrete focus for next week. */
function WeeklyReview() {
  const since = daysAgoStr(6);
  const prevSince = daysAgoStr(13);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const workouts = useLiveQuery(() => db.workouts.where('date').aboveOrEqual(since).toArray(), []) ?? [];
  const runs = useLiveQuery(() => db.runs.where('date').aboveOrEqual(since).toArray(), []) ?? [];
  const habits = useLiveQuery(() => db.habits.toArray(), []) ?? [];
  const habitLogs = useLiveQuery(() => db.habitLogs.where('date').aboveOrEqual(since).toArray(), []) ?? [];
  const meals = useLiveQuery(() => db.meals.where('date').aboveOrEqual(since).toArray(), []) ?? [];
  const checkins = useLiveQuery(() => db.checkins.where('date').aboveOrEqual(prevSince).toArray(), []) ?? [];
  const metrics = useLiveQuery(() => db.bodyMetrics.orderBy('date').reverse().limit(20).toArray(), []) ?? [];
  const profile = useLiveQuery(() => db.profile.get('me'), []);

  const exMap = new Map(exercises.map((e) => [e.id, e]));
  const finished = workouts.filter((w) => w.endedAt);
  const strengthN = finished.filter((w) => w.type === 'strength-core' || w.type === 'strength-conditioning' || w.type === 'custom').length;
  const totalSets = finished.reduce((n, w) => n + w.sets.length, 0);
  const gluteSets = finished.reduce((n, w) => n + w.sets.filter((s) => exMap.get(s.exerciseId)?.gluteFocus).length, 0);
  const km = Math.round(runs.reduce((a, r) => a + r.distanceKm, 0) * 10) / 10;

  // a habit log's existence means it was done that day
  const habitPct = habits.length ? Math.round((habitLogs.length / (habits.length * 7)) * 100) : null;

  const kcalByDay = new Map<string, number>();
  for (const m of meals) kcalByDay.set(m.date, (kcalByDay.get(m.date) ?? 0) + m.kcal);
  const kcalAvg = kcalByDay.size ? Math.round([...kcalByDay.values()].reduce((a, b) => a + b, 0) / kcalByDay.size) : null;

  const weights = metrics.filter((m) => m.weightKg != null);
  const latestW = weights[0];
  const weekAgoW = weights.find((m) => m.date <= since);
  const wDelta = latestW && weekAgoW && latestW.date > weekAgoW.date
    ? Math.round((latestW.weightKg! - weekAgoW.weightKg!) * 10) / 10
    : null;

  const thisWeekC = checkins.filter((c) => c.date >= since);
  const prevWeekC = checkins.filter((c) => c.date < since);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const backNow = avg(thisWeekC.map((c) => c.back ?? 0).filter((v) => v > 0));
  const backPrev = avg(prevWeekC.map((c) => c.back ?? 0).filter((v) => v > 0));
  const kneeNow = avg(thisWeekC.map((c) => c.knee ?? 0).filter((v) => v > 0));
  const kneePrev = avg(prevWeekC.map((c) => c.knee ?? 0).filter((v) => v > 0));

  // nothing meaningful yet → stay quiet rather than show a wall of zeros
  if (finished.length === 0 && runs.length === 0) return null;

  const style = profile?.trainingStyle ?? 'hybrid';
  const runsMatter = style === 'hybrid' || style === 'trek';
  let focus: string;
  if (backNow != null && backPrev != null && backNow - backPrev >= 1) {
    focus = 'Back stiffness crept up this week — make the McGill Big 3 a daily non-negotiable and keep hinges light.';
  } else if (kneeNow != null && kneePrev != null && kneeNow - kneePrev >= 1) {
    focus = 'The knee grumbled more than last week — bike over runs for a few days and skip deep knee-bend work.';
  } else if (strengthN < 2) {
    focus = 'Aim for two strength sessions next week — even 30-minute versions count.';
  } else if (gluteSets < 10 && style !== 'yoga') {
    focus = `Glutes landed at ${gluteSets} sets (target 10–20) — add hip thrusts or bridges to each session.`;
  } else if (runsMatter && km === 0) {
    focus = 'No runs this week — one easy 20-minute run or brisk walk keeps the engine ticking.';
  } else if (habitPct != null && habitPct < 50) {
    focus = 'Habits slipped below half — pick the single most important one and protect just that next week.';
  } else {
    focus = 'Solid week — keep the same rhythm and nudge one main lift up a notch.';
  }

  const trendTxt = (now: number | null, prev: number | null) =>
    now == null ? '—' : prev == null ? now.toFixed(1) : `${prev.toFixed(1)} → ${now.toFixed(1)}`;

  return (
    <div className="card">
      <div className="card-title">Your week in review</div>
      <div className="grid-3">
        <div className="stat"><span className="v"><AnimatedNumber value={strengthN} /></span><span className="k">sessions</span></div>
        <div className="stat"><span className="v"><AnimatedNumber value={totalSets} /></span><span className="k">sets</span></div>
        <div className="stat"><span className="v"><AnimatedNumber value={km} decimals={km % 1 ? 1 : 0} /><small>km</small></span><span className="k">running</span></div>
      </div>
      <div className="divider" />
      <div className="grid-3">
        <div className="stat">
          <span className="v" style={{ color: gluteSets >= 10 ? 'var(--accent)' : undefined }}><AnimatedNumber value={gluteSets} /><small>/10–20</small></span>
          <span className="k">glute sets</span>
        </div>
        <div className="stat"><span className="v">{habitPct != null ? <><AnimatedNumber value={habitPct} />%</> : '—'}</span><span className="k">habits</span></div>
        <div className="stat">
          <span className="v">{kcalAvg != null ? <AnimatedNumber value={kcalAvg} /> : '—'}{kcalAvg && profile?.calorieTarget ? <small>/{profile.calorieTarget}</small> : null}</span>
          <span className="k">kcal avg</span>
        </div>
      </div>
      <div className="divider" />
      <div className="row-between" style={{ fontSize: '0.84rem' }}>
        <span className="tag-note">Weight {wDelta != null ? (wDelta > 0 ? `+${wDelta} kg` : `${wDelta} kg`) : '—'}</span>
        <span className="tag-note">Back {trendTxt(backNow, backPrev)}</span>
        <span className="tag-note">Knee {trendTxt(kneeNow, kneePrev)}</span>
      </div>
      <div className="card pad-sm" style={{ marginTop: 10, background: 'var(--surface-2)' }}>
        <span style={{ fontSize: '0.86rem' }}>🎯 <b>Next week:</b> {focus}</span>
      </div>
    </div>
  );
}
