import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, todayStr } from '../db';
import type { Exercise, SetLog, Workout, WorkoutType } from '../types';
import { buildSession, alternativesFor, type SessionPlan, type Symptoms } from '../lib/coach';
import { detectPRs, fmtDuration, lastPerformance, suggestNext, type LastPerf } from '../lib/stats';
import { Scale10, Stepper, RestTimer } from '../components/inputs';
import ExerciseAnim from '../components/ExerciseAnim';

type Stage =
  | { name: 'idle' }
  | { name: 'checkin'; type: WorkoutType }
  | { name: 'active'; workoutId: number; plan: SessionPlan }
  | { name: 'done'; workoutId: number; prCount: number };

const PLAN_KEY = 'hc-active-plan';

export default function Train() {
  const [stage, setStage] = useState<Stage>({ name: 'idle' });
  const active = useLiveQuery(
    () => db.workouts.filter((w) => w.endedAt === undefined).first(),
    [],
  );

  // resume an in-progress workout after reload
  useEffect(() => {
    if (stage.name === 'idle' && active?.id != null) {
      const saved = localStorage.getItem(PLAN_KEY);
      if (saved) {
        try {
          const plan = JSON.parse(saved) as SessionPlan;
          setStage({ name: 'active', workoutId: active.id, plan });
          return;
        } catch { /* fall through */ }
      }
      setStage({ name: 'active', workoutId: active.id, plan: { type: active.type, title: 'Workout', blocks: [], adaptations: [] } });
    }
  }, [active, stage.name]);

  if (stage.name === 'checkin') {
    return (
      <PreCheckin
        onCancel={() => setStage({ name: 'idle' })}
        onDone={async (sym) => {
          const plan = buildSession(stage.type, sym);
          const id = await db.workouts.add({
            date: todayStr(),
            type: stage.type,
            startedAt: Date.now(),
            preBack: sym.back,
            preKnee: sym.knee,
            preEnergy: sym.energy,
            sets: [],
            adaptations: plan.adaptations,
          });
          localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
          setStage({ name: 'active', workoutId: id as number, plan });
        }}
      />
    );
  }

  if (stage.name === 'active') {
    return (
      <ActiveWorkout
        workoutId={stage.workoutId}
        plan={stage.plan}
        onFinish={async (prCount) => {
          localStorage.removeItem(PLAN_KEY);
          setStage({ name: 'done', workoutId: stage.workoutId, prCount });
        }}
      />
    );
  }

  if (stage.name === 'done') {
    return <Summary workoutId={stage.workoutId} prCount={stage.prCount} onClose={() => setStage({ name: 'idle' })} />;
  }

  return <StartScreen onStart={(type) => setStage({ name: 'checkin', type })} />;
}

// ---------------- start screen ----------------

function StartScreen({ onStart }: { onStart: (t: WorkoutType) => void }) {
  const recent = useLiveQuery(
    () => db.workouts.orderBy('date').reverse().limit(5).toArray(),
    [],
  ) ?? [];
  const lastStrength = recent.find((w) => w.type === 'strength-core' || w.type === 'strength-conditioning');
  const suggested: WorkoutType = lastStrength?.type === 'strength-core' ? 'strength-conditioning' : 'strength-core';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Train</h1>
          <div className="sub">One tap to start — the plan adapts to how you feel today.</div>
        </div>
      </div>

      <button className="btn primary big" onClick={() => onStart(suggested)}>
        Start {suggested === 'strength-core' ? 'Day 1 · Strength + Core' : 'Day 3 · Strength + Conditioning'}
      </button>
      <div className="grid-2">
        <button className="btn" onClick={() => onStart(suggested === 'strength-core' ? 'strength-conditioning' : 'strength-core')}>
          {suggested === 'strength-core' ? 'Day 3 · Str + Cond' : 'Day 1 · Str + Core'}
        </button>
        <button className="btn mobility" onClick={() => onStart('mobility')}>Mobility session</button>
      </div>
      <button className="btn ghost" onClick={() => onStart('custom')}>Empty workout (pick exercises as you go)</button>

      {recent.length > 0 && (
        <div className="card pad-sm">
          <div className="card-title">Recent workouts</div>
          {recent.map((w) => (
            <div key={w.id} className="li">
              <div className="li-main">
                <div className="li-title">{typeLabel(w.type)}</div>
                <div className="li-sub">
                  {w.date} · {w.sets.length} sets
                  {w.endedAt ? ` · ${fmtDuration(w.endedAt - w.startedAt)}` : ' · in progress'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function typeLabel(t: WorkoutType): string {
  return t === 'strength-core' ? 'Day 1 · Strength + Core'
    : t === 'strength-conditioning' ? 'Day 3 · Strength + Conditioning'
    : t === 'mobility' ? 'Mobility' : 'Custom workout';
}

// ---------------- pre-workout check-in ----------------

function PreCheckin({ onDone, onCancel }: { onDone: (s: Symptoms) => void; onCancel: () => void }) {
  const [back, setBack] = useState<number>();
  const [knee, setKnee] = useState<number>();
  const [energy, setEnergy] = useState<number>();
  const ready = back != null && knee != null && energy != null;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Quick check-in</h1>
          <div className="sub">30 seconds — this shapes today's plan.</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Lower-back stiffness right now</div>
        <Scale10 value={back} onChange={setBack} />
        <div className="row-between" style={{ marginTop: 6 }}>
          <span className="tag-note">1 · loose</span><span className="tag-note">10 · very stiff</span>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Knee discomfort right now</div>
        <Scale10 value={knee} onChange={setKnee} />
        <div className="row-between" style={{ marginTop: 6 }}>
          <span className="tag-note">1 · quiet</span><span className="tag-note">10 · painful</span>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Energy level</div>
        <Scale10 value={energy} onChange={setEnergy} invert />
        <div className="row-between" style={{ marginTop: 6 }}>
          <span className="tag-note">1 · drained</span><span className="tag-note">10 · fresh</span>
        </div>
      </div>
      <button className="btn primary big" disabled={!ready} onClick={() => ready && onDone({ back: back!, knee: knee!, energy: energy! })}>
        Build today's workout
      </button>
      <button className="btn ghost" onClick={onCancel}>Cancel</button>
    </div>
  );
}

// ---------------- active workout ----------------

function ActiveWorkout({
  workoutId, plan, onFinish,
}: {
  workoutId: number;
  plan: SessionPlan;
  onFinish: (prCount: number) => void;
}) {
  const workout = useLiveQuery(() => db.workouts.get(workoutId), [workoutId]);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const [open, setOpen] = useState<string | null>(null);
  const [restFor, setRestFor] = useState<{ id: string; seconds: number; key: number } | null>(null);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(iv);
  }, []);

  if (!workout) return null;

  const sym: Symptoms = { back: workout.preBack ?? 1, knee: workout.preKnee ?? 1, energy: workout.preEnergy ?? 7 };
  const planIds = plan.blocks.map((blk) => blk.exerciseId);
  const loggedIds = [...new Set(workout.sets.map((s) => s.exerciseId))];
  const extraShown = [...new Set([...extraIds, ...loggedIds.filter((id) => !planIds.includes(id))])];

  const logSet = async (exId: string, set: Omit<SetLog, 'exerciseId' | 'at'>, restSec: number) => {
    await db.workouts.update(workoutId, {
      sets: [...workout.sets, { ...set, exerciseId: exId, at: Date.now() }],
    });
    if (restSec > 0) setRestFor({ id: exId, seconds: restSec, key: Date.now() });
  };

  const undoSet = async (exId: string) => {
    const idx = [...workout.sets].reverse().findIndex((s) => s.exerciseId === exId);
    if (idx === -1) return;
    const real = workout.sets.length - 1 - idx;
    await db.workouts.update(workoutId, { sets: workout.sets.filter((_, i) => i !== real) });
  };

  const finish = async () => {
    await db.workouts.update(workoutId, { endedAt: Date.now() });
    const w = await db.workouts.get(workoutId);
    const prs = w ? await detectPRs(w) : [];
    onFinish(prs.length);
  };

  const sections = [
    { id: 'warmup' as const, label: 'Warm-up' },
    { id: 'strength' as const, label: 'Strength' },
    { id: 'core' as const, label: 'Core' },
    { id: 'conditioning' as const, label: 'Conditioning' },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{plan.title}</h1>
          <div className="sub">
            {fmtDuration(now - workout.startedAt)} · {workout.sets.length} sets logged
          </div>
        </div>
        <button className="btn sm primary" onClick={finish}>Finish</button>
      </div>

      {plan.adaptations.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--warn)' }}>
          <div className="card-title" style={{ color: 'var(--warn)' }}>Adapted for today</div>
          {plan.adaptations.map((a, i) => (
            <div key={i} style={{ fontSize: '0.85rem', marginTop: i ? 4 : 0 }}>{a}</div>
          ))}
        </div>
      )}

      {sections.map((sec) => {
        const blocks = plan.blocks.filter((blk) => blk.section === sec.id);
        if (!blocks.length) return null;
        return (
          <div key={sec.id}>
            <div className="card-title" style={{ margin: '4px 0 6px 4px' }}>{sec.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {blocks.map((blk, i) => {
                const ex = exMap.get(blk.exerciseId);
                if (!ex) return null;
                return (
                  <ExerciseCard
                    key={blk.exerciseId + i}
                    ex={ex} block={blk} workout={workout} sym={sym}
                    open={open === blk.exerciseId}
                    onToggle={() => setOpen(open === blk.exerciseId ? null : blk.exerciseId)}
                    onLog={logSet} onUndo={undoSet}
                    rest={restFor?.id === blk.exerciseId ? restFor : null}
                    allExercises={exercises}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {extraShown.length > 0 && (
        <div>
          <div className="card-title" style={{ margin: '4px 0 6px 4px' }}>Added</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {extraShown.map((id) => {
              const ex = exMap.get(id);
              if (!ex) return null;
              return (
                <ExerciseCard
                  key={id} ex={ex}
                  block={{ exerciseId: id, sets: 3, reps: '8–12', section: 'strength' }}
                  workout={workout} sym={sym}
                  open={open === id}
                  onToggle={() => setOpen(open === id ? null : id)}
                  onLog={logSet} onUndo={undoSet}
                  rest={restFor?.id === id ? restFor : null}
                  allExercises={exercises}
                />
              );
            })}
          </div>
        </div>
      )}

      <button className="btn" onClick={() => setShowPicker(true)}>+ Add exercise</button>

      {showPicker && (
        <ExercisePicker
          exercises={exercises} sym={sym}
          onPick={(id) => { setExtraIds((x) => [...x, id]); setShowPicker(false); setOpen(id); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ---------------- per-exercise logging card ----------------

function ExerciseCard({
  ex, block, workout, sym, open, onToggle, onLog, onUndo, rest, allExercises,
}: {
  ex: Exercise;
  block: SessionPlan['blocks'][number];
  workout: Workout;
  sym: Symptoms;
  open: boolean;
  onToggle: () => void;
  onLog: (exId: string, set: Omit<SetLog, 'exerciseId' | 'at'>, restSec: number) => void;
  onUndo: (exId: string) => void;
  rest: { seconds: number; key: number } | null;
  allExercises: Exercise[];
}) {
  const [last, setLast] = useState<LastPerf | null>(null);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [rpe, setRpe] = useState<number | undefined>();
  const [showSwap, setShowSwap] = useState(false);
  const [swapped, setSwapped] = useState<Exercise | null>(null);
  const activeEx = swapped ?? ex;

  const sets = workout.sets.filter((s) => s.exerciseId === activeEx.id);
  const isTimed = activeEx.loadType === 'time';
  const isBw = activeEx.loadType === 'bodyweight' || isTimed;

  useEffect(() => {
    let alive = true;
    lastPerformance(activeEx.id).then((lp) => {
      if (!alive) return;
      setLast(lp);
      const sug = suggestNext(lp);
      if (sug) { setWeight(sug.weightKg); setReps(sug.reps); }
      else { setWeight(0); setReps(isTimed ? 30 : 10); }
    });
    return () => { alive = false; };
  }, [activeEx.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const suggestion = suggestNext(last);
  const done = sets.length >= block.sets;
  const heavyLower = activeEx.muscles.some((m) => ['quads', 'glutes', 'hamstrings', 'spinal-erectors'].includes(m));
  const restDefault = block.section === 'strength' ? (heavyLower ? 150 : 90) : 45;

  const logNow = () => {
    onLog(activeEx.id, { weightKg: isBw ? 0 : weight, reps, rpe }, restDefault);
  };

  return (
    <div className="card pad-sm" style={done ? { borderColor: 'var(--accent)' } : {}}>
      <button className="row" style={{ width: '100%', textAlign: 'left' }} onClick={onToggle}>
        <div style={{ width: 56, height: 40, flexShrink: 0 }}>
          <ExerciseAnim animId={activeEx.animation} />
        </div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="li-title">{activeEx.name}{swapped && <span className="badge info" style={{ marginLeft: 6 }}>swapped</span>}</div>
          <div className="li-sub">
            {block.sets} × {block.reps}{block.note ? ` · ${block.note}` : ''}
          </div>
        </div>
        <div className="li-end">
          <span style={{ fontWeight: 700, color: done ? 'var(--accent)' : 'var(--text-dim)' }}>
            {sets.length}/{block.sets}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {last && (
            <div className="tag-note">
              Last time ({last.date}): {last.sets.map((s) => (s.weightKg > 0 ? `${s.weightKg}×${s.reps}` : `${s.reps}`)).join(', ')}
            </div>
          )}
          {suggestion && suggestion.weightKg + suggestion.reps > 0 && (
            <div className="tag-note" style={{ color: 'var(--accent)' }}>
              Target: {suggestion.weightKg > 0 ? `${suggestion.weightKg}kg × ` : ''}{suggestion.reps}{isTimed ? 's' : ' reps'} — {suggestion.rationale}
            </div>
          )}

          {sets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {sets.map((s, i) => (
                <div key={i} className="row-between" style={{ fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Set {i + 1}</span>
                  <span style={{ fontWeight: 650 }}>
                    {s.weightKg > 0 ? `${s.weightKg}kg × ` : ''}{s.reps}{isTimed ? 's' : ''}
                    {s.rpe ? <span style={{ color: 'var(--text-faint)' }}> @{s.rpe}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          )}

          {rest && <RestTimer key={rest.key} seconds={rest.seconds} />}

          <div className="grid-2">
            {!isBw && (
              <label className="field">
                <span className="lbl">Weight (kg)</span>
                <Stepper value={weight} onChange={setWeight} step={2.5} />
              </label>
            )}
            <label className="field" style={isBw ? { gridColumn: '1 / -1' } : {}}>
              <span className="lbl">{isTimed ? 'Seconds' : 'Reps'}</span>
              <Stepper value={reps} onChange={setReps} step={isTimed ? 5 : 1} min={1} />
            </label>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: 5 }}>RPE (how hard?)</span>
            <div className="chip-row">
              {[6, 7, 8, 9, 10].map((v) => (
                <button key={v} className={`chip ${rpe === v ? 'on' : ''}`} onClick={() => setRpe(rpe === v ? undefined : v)}>{v}</button>
              ))}
            </div>
          </div>

          <div className="row">
            <button className="btn primary grow" onClick={logNow}>
              Log set {sets.length + 1}
            </button>
            {sets.length > 0 && <button className="btn sm ghost" onClick={() => onUndo(activeEx.id)}>Undo</button>}
          </div>

          <div className="row-between">
            <Link to={`/library/${activeEx.id}`} className="tag-note" style={{ color: 'var(--run)' }}>Form & cues →</Link>
            <button className="tag-note" style={{ color: 'var(--mobility)' }} onClick={() => setShowSwap(true)}>Swap exercise</button>
          </div>
        </div>
      )}

      {showSwap && (
        <div className="modal-back" onClick={() => setShowSwap(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Swap {activeEx.name}</h2>
            <div>
              {alternativesFor(activeEx, allExercises, sym).map((alt) => (
                <button key={alt.id} className="li" style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => { setSwapped(alt.id === ex.id ? null : alt); setShowSwap(false); }}>
                  <div style={{ width: 52, height: 38, flexShrink: 0 }}><ExerciseAnim animId={alt.animation} /></div>
                  <div className="li-main">
                    <div className="li-title">{alt.name}</div>
                    <div className="li-sub">{alt.muscles.join(', ')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- exercise picker ----------------

function ExercisePicker({
  exercises, sym, onPick, onClose,
}: {
  exercises: Exercise[];
  sym: Symptoms;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const list = exercises
    .filter((e) => !q.trim() || e.name.toLowerCase().includes(q.trim().toLowerCase()))
    .filter((e) => (sym.knee >= 7 ? e.kneeRisk < 2 : true))
    .filter((e) => (sym.back >= 7 ? e.backRisk < 2 : true))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 30);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add exercise</h2>
        <input className="input" autoFocus placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div>
          {list.map((e) => (
            <button key={e.id} className="li" style={{ width: '100%', textAlign: 'left' }} onClick={() => onPick(e.id)}>
              <div style={{ width: 52, height: 38, flexShrink: 0 }}><ExerciseAnim animId={e.animation} /></div>
              <div className="li-main">
                <div className="li-title">{e.name}</div>
                <div className="li-sub">{e.muscles.join(', ')}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- summary ----------------

function Summary({ workoutId, prCount, onClose }: { workoutId: number; prCount: number; onClose: () => void }) {
  const workout = useLiveQuery(() => db.workouts.get(workoutId), [workoutId]);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  if (!workout) return null;
  const exMap = new Map(exercises.map((e) => [e.id, e]));
  const byEx = new Map<string, SetLog[]>();
  for (const s of workout.sets) {
    if (!byEx.has(s.exerciseId)) byEx.set(s.exerciseId, []);
    byEx.get(s.exerciseId)!.push(s);
  }
  const tonnage = workout.sets.reduce((t, s) => t + s.weightKg * s.reps, 0);
  const gluteSets = workout.sets.filter((s) => exMap.get(s.exerciseId)?.gluteFocus).length;
  const bicepSets = workout.sets.filter((s) => exMap.get(s.exerciseId)?.bicepFocus).length;

  return (
    <div className="page">
      <div className="page-head"><h1>Workout complete 🎉</h1></div>
      <div className="card">
        <div className="grid-3">
          <div className="stat"><span className="v">{workout.endedAt ? fmtDuration(workout.endedAt - workout.startedAt) : '—'}</span><span className="k">duration</span></div>
          <div className="stat"><span className="v">{workout.sets.length}</span><span className="k">sets</span></div>
          <div className="stat"><span className="v">{Math.round(tonnage / 100) / 10}<small>t</small></span><span className="k">tonnage</span></div>
        </div>
        <div className="divider" />
        <div className="grid-3">
          <div className="stat"><span className="v" style={{ color: 'var(--accent)' }}>{gluteSets}</span><span className="k">glute sets</span></div>
          <div className="stat"><span className="v" style={{ color: 'var(--run)' }}>{bicepSets}</span><span className="k">bicep sets</span></div>
          <div className="stat"><span className="v" style={{ color: prCount ? 'var(--warn)' : undefined }}>{prCount}</span><span className="k">new PRs</span></div>
        </div>
      </div>
      {prCount > 0 && (
        <div className="card" style={{ borderColor: 'var(--warn)' }}>
          <div style={{ fontSize: '0.92rem' }}>🏆 {prCount} personal record{prCount > 1 ? 's' : ''} today — check the Progress tab.</div>
        </div>
      )}
      <div className="card pad-sm">
        <div className="card-title">What you did</div>
        {[...byEx.entries()].map(([id, sets]) => (
          <div key={id} className="li">
            <div className="li-main"><div className="li-title">{exMap.get(id)?.name ?? id}</div></div>
            <div className="li-end">{sets.map((s) => (s.weightKg > 0 ? `${s.weightKg}×${s.reps}` : s.reps)).join(', ')}</div>
          </div>
        ))}
      </div>
      <button className="btn primary big" onClick={onClose}>Done</button>
    </div>
  );
}
