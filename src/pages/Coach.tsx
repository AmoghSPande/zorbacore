import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, weekStart, todayStr } from '../db';
import { ROUTINES, type Routine } from '../data/mobility';
import { weeklyVolumes, type WeekVolume } from '../lib/stats';
import { computeDayStatus, type DayStatus } from '../lib/readiness';
import MobilityPlayer from '../components/MobilityPlayer';
import ExerciseAnim from '../components/ExerciseAnim';

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
