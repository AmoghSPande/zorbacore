import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getProfile, todayStr } from '../db';
import type { CustomPlan, Exercise, SetLog, TrainingStyle, Workout, WorkoutType } from '../types';
import { buildSession, alternativesFor, applyGates, estimateMinutes, STYLES, type PlannedBlock, type SessionPlan, type Symptoms } from '../lib/coach';
import { Slider } from '../components/inputs';
import { detectPRs, fmtDuration, lastPerformance, suggestNext, type LastPerf } from '../lib/stats';
import { Scale10, Stepper, RestTimer } from '../components/inputs';
import ExerciseAnim from '../components/ExerciseAnim';
import Celebration from '../components/Celebration';
import AnimatedNumber from '../components/AnimatedNumber';

type Stage =
  | { name: 'idle' }
  | { name: 'checkin'; type: WorkoutType; planId?: string }
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
      setStage({ name: 'active', workoutId: active.id, plan: { type: active.type, title: 'Workout', blocks: [], adaptations: [], estMinutes: 0 } });
    }
  }, [active, stage.name]);

  if (stage.name === 'checkin') {
    return (
      <PreCheckin
        onCancel={() => setStage({ name: 'idle' })}
        onDone={async (sym, minutes) => {
          // days since the last finished gym session — lets the plan ease back in
          const finished = await db.workouts
            .filter((w) => w.endedAt !== undefined && (w.type === 'strength-core' || w.type === 'strength-conditioning'))
            .toArray();
          const lastDate = finished.map((w) => w.date).sort().pop();
          const gapDays = lastDate
            ? Math.floor((Date.now() - new Date(lastDate + 'T12:00:00').getTime()) / 86400000)
            : 0;
          const profile = await getProfile();
          let plan: SessionPlan;
          if (stage.planId) {
            const custom = await db.plans.get(stage.planId);
            const adaptations: string[] = [];
            const blocks: PlannedBlock[] = (custom?.blocks ?? []).map((blk) => {
              const gated = applyGates(blk.exerciseId, sym);
              if (gated.swap && gated.exerciseId !== blk.exerciseId) {
                adaptations.push(`Swapped ${blk.exerciseId.replace(/-/g, ' ')} → ${gated.exerciseId.replace(/-/g, ' ')} (${gated.swap})`);
              }
              return { exerciseId: gated.exerciseId, sets: blk.sets, reps: blk.reps, section: 'strength', tier: 1 };
            });
            plan = {
              type: 'custom',
              title: custom?.name ?? 'My plan',
              blocks,
              adaptations,
              estMinutes: estimateMinutes(blocks),
            };
          } else {
            plan = buildSession(stage.type, sym, { minutes, gapDays }, profile.trainingStyle ?? 'hybrid');
          }
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

  return <StartScreen onStart={(type, planId) => setStage({ name: 'checkin', type, planId })} />;
}

// ---------------- start screen ----------------

function StartScreen({ onStart }: { onStart: (t: WorkoutType, planId?: string) => void }) {
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const myPlans = useLiveQuery(() => db.plans.toArray(), []) ?? [];
  const recent = useLiveQuery(
    () => db.workouts.orderBy('date').reverse().limit(5).toArray(),
    [],
  ) ?? [];
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const profile = useLiveQuery(() => db.profile.get('me'), []);
  const style: TrainingStyle = profile?.trainingStyle ?? 'hybrid';
  const lastStrength = recent.find((w) => w.type === 'strength-core' || w.type === 'strength-conditioning');
  const suggested: WorkoutType = lastStrength?.type === 'strength-core' ? 'strength-conditioning' : 'strength-core';
  const other: WorkoutType = suggested === 'strength-core' ? 'strength-conditioning' : 'strength-core';
  const dayName = (t: WorkoutType) => (t === 'strength-core' ? STYLES[style].dayA : STYLES[style].dayB);

  const exMap = new Map(exercises.map((e) => [e.id, e.name]));
  const preview = buildSession(suggested, { knee: 1, back: 1, energy: 8 }, {}, style)
    .blocks.filter((b) => b.section === 'strength')
    .map((b) => exMap.get(b.exerciseId))
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Train</h1>
          <div className="sub">{STYLES[style].emoji} {STYLES[style].label} — the plan adapts to how you feel today.</div>
        </div>
      </div>

      <button className="btn primary big" onClick={() => onStart(suggested)}>
        Start {dayName(suggested)}
      </button>
      {preview.length > 0 && (
        <div className="tag-note" style={{ marginTop: -4, textAlign: 'center' }}>
          {preview.join(' · ')}{preview.length >= 5 ? ' + more' : ''}
        </div>
      )}
      <div className="grid-2">
        <button className="btn" onClick={() => onStart(other)}>{dayName(other)}</button>
        <button className="btn mobility" onClick={() => onStart('mobility')}>Mobility session</button>
      </div>
      <button className="btn ghost" onClick={() => onStart('custom')}>Empty workout (pick exercises as you go)</button>

      <div className="card pad-sm">
        <div className="row-between" style={{ marginBottom: myPlans.length ? 2 : 0 }}>
          <div className="card-title" style={{ margin: 0 }}>My workout plans</div>
          <button className="btn sm" onClick={() => setShowPlanEditor(true)}>+ Create</button>
        </div>
        {myPlans.length === 0 && (
          <div className="tag-note" style={{ marginTop: 6 }}>
            Build your own plan — pick the exercises, sets and reps, and start it any day.
            Symptom checks and safety swaps still apply.
          </div>
        )}
        {myPlans.map((pl) => (
          <div key={pl.id} className="li">
            <div className="li-main">
              <div className="li-title">{pl.name}</div>
              <div className="li-sub">{pl.blocks.length} exercises · ~{estimateMinutes(pl.blocks.map((b) => ({ ...b, section: 'strength' as const, tier: 1 as const })))} min</div>
            </div>
            <button className="btn sm ghost" onClick={() => db.plans.delete(pl.id)}>✕</button>
            <button className="btn sm primary" onClick={() => onStart('custom', pl.id)}>Start</button>
          </div>
        ))}
      </div>

      {showPlanEditor && <PlanEditor onClose={() => setShowPlanEditor(false)} />}

      {recent.length > 0 && (
        <div className="card pad-sm">
          <div className="card-title">Recent workouts</div>
          {recent.map((w) => (
            <button key={w.id} className="li" style={{ width: '100%', textAlign: 'left' }} onClick={() => setDetailId(w.id!)}>
              <div className="li-main">
                <div className="li-title">{typeLabel(w.type)}</div>
                <div className="li-sub">
                  {w.date} · {w.sets.length} sets
                  {w.endedAt ? ` · ${fmtDuration(w.endedAt - w.startedAt)}` : ' · in progress'}
                </div>
              </div>
              <div className="li-end" style={{ color: 'var(--text-faint)' }}>›</div>
            </button>
          ))}
        </div>
      )}

      {detailId != null && <WorkoutDetail workoutId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}

/** History detail: review a past workout, fix a mislogged set, or delete the whole session. */
function WorkoutDetail({ workoutId, onClose }: { workoutId: number; onClose: () => void }) {
  const workout = useLiveQuery(() => db.workouts.get(workoutId), [workoutId]);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const [confirmDel, setConfirmDel] = useState(false);
  if (!workout) return null;
  const exMap = new Map(exercises.map((e) => [e.id, e]));

  const groups: { exerciseId: string; entries: { set: SetLog; idx: number }[] }[] = [];
  workout.sets.forEach((set, idx) => {
    const g = groups.find((x) => x.exerciseId === set.exerciseId);
    if (g) g.entries.push({ set, idx });
    else groups.push({ exerciseId: set.exerciseId, entries: [{ set, idx }] });
  });

  const deleteSet = (idx: number) =>
    db.workouts.update(workoutId, { sets: workout.sets.filter((_, i) => i !== idx) });

  const deleteWorkout = async () => {
    // remove PRs credited to this session so records stay honest
    const exIds = new Set(workout.sets.map((s) => s.exerciseId));
    await db.prs.where('date').equals(workout.date).filter((p) => exIds.has(p.exerciseId)).delete();
    await db.workouts.delete(workoutId);
    onClose();
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{typeLabel(workout.type)}</h2>
        <div className="tag-note" style={{ marginTop: -6 }}>
          {workout.date}
          {workout.endedAt ? ` · ${fmtDuration(workout.endedAt - workout.startedAt)}` : ' · in progress'}
          {` · ${workout.sets.length} sets`}
        </div>

        {groups.length === 0 && <div className="tag-note">No sets were logged in this session.</div>}
        {groups.map((g) => {
          const ex = exMap.get(g.exerciseId);
          const timed = ex?.loadType === 'time';
          return (
            <div key={g.exerciseId} className="card pad-sm">
              <div className="li-title" style={{ fontSize: '0.9rem', marginBottom: 4 }}>{ex?.name ?? g.exerciseId}</div>
              {g.entries.map(({ set, idx }, n) => (
                <div key={idx} className="row-between" style={{ fontSize: '0.86rem', padding: '3px 0' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Set {n + 1}</span>
                  <span style={{ fontWeight: 650 }}>
                    {set.weightKg > 0 ? `${set.weightKg}kg × ` : ''}{set.reps}{timed ? 's' : ''}
                    {set.rpe ? <span style={{ color: 'var(--text-faint)' }}> @{set.rpe}</span> : null}
                  </span>
                  <button className="btn sm ghost" aria-label="Delete set" onClick={() => deleteSet(idx)}>✕</button>
                </div>
              ))}
            </div>
          );
        })}

        {!confirmDel ? (
          <button className="btn danger" onClick={() => setConfirmDel(true)}>Delete this workout…</button>
        ) : (
          <div className="row">
            <button className="btn danger grow" onClick={deleteWorkout}>Yes, delete it</button>
            <button className="btn grow" onClick={() => setConfirmDel(false)}>Keep it</button>
          </div>
        )}
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/** Plates per side for a 20 kg bar, e.g. 100 → "20 kg bar + 20 + 15 + 5 per side". */
function plateBreakdown(total: number): string | null {
  const BAR = 20;
  if (total < BAR) return null;
  if (total === BAR) return 'empty 20 kg bar';
  let per = (total - BAR) / 2;
  const plates: number[] = [];
  for (const p of [20, 15, 10, 5, 2.5, 1.25]) {
    while (per >= p - 1e-9) { plates.push(p); per -= p; }
  }
  if (per > 1e-9) return null; // not loadable with standard plates
  return `20 kg bar + ${plates.join(' + ')} per side`;
}

export function typeLabel(t: WorkoutType): string {
  return t === 'strength-core' ? 'Day 1 · Strength + Core'
    : t === 'strength-conditioning' ? 'Day 3 · Strength + Conditioning'
    : t === 'mobility' ? 'Mobility' : 'Custom workout';
}

// ---------------- pre-workout check-in ----------------

function PreCheckin({ onDone, onCancel }: { onDone: (s: Symptoms, minutes: number) => void; onCancel: () => void }) {
  const [back, setBack] = useState<number>();
  const [knee, setKnee] = useState<number>();
  const [energy, setEnergy] = useState<number>();
  const [minutes, setMinutes] = useState(60);
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
        <div className="card-title">How much time do you have?</div>
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[30, 45, 60, 90].map((m) => (
            <button
              key={m}
              className="btn sm"
              style={minutes === m ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#052e1c' } : {}}
              onClick={() => setMinutes(m)}
            >
              {m === 90 ? '90+' : m} min
            </button>
          ))}
        </div>
        <div className="tag-note" style={{ marginTop: 8 }}>
          The session is composed to fit — short on time still moves you forward.
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
      <button className="btn primary big" disabled={!ready} onClick={() => ready && onDone({ back: back!, knee: knee!, energy: energy! }, minutes)}>
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
  const style = useLiveQuery(async () => (await db.profile.get('me'))?.trainingStyle ?? 'hybrid', []);
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
    if (navigator.vibrate) navigator.vibrate(25);
    if (restSec > 0) setRestFor({ id: exId, seconds: restSec, key: Date.now() });

    // auto-advance: when this exercise hits its planned sets, open the next unfinished one
    const ordered = [
      ...plan.blocks.map((b) => ({ id: b.exerciseId, target: b.sets })),
      ...extraShown.map((id) => ({ id, target: 3 })),
    ];
    const counts = new Map<string, number>();
    for (const s of workout.sets) counts.set(s.exerciseId, (counts.get(s.exerciseId) ?? 0) + 1);
    counts.set(exId, (counts.get(exId) ?? 0) + 1);
    const cur = ordered.find((o) => o.id === exId);
    if (cur && (counts.get(exId) ?? 0) >= cur.target) {
      const next = ordered.find((o) => o.id !== exId && (counts.get(o.id) ?? 0) < o.target);
      if (next) setTimeout(() => setOpen(next.id), 1000);
    }
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
    { id: 'warmup' as const, label: style === 'yoga' ? 'Arrive' : 'Warm-up' },
    { id: 'strength' as const, label: style === 'yoga' ? 'Flow' : style === 'senior' ? 'Main work' : 'Strength' },
    { id: 'core' as const, label: style === 'yoga' ? 'Wind down' : style === 'senior' ? 'Balance & core' : 'Core' },
    { id: 'conditioning' as const, label: 'Conditioning' },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{plan.title}</h1>
          <div className="sub">
            {fmtDuration(now - workout.startedAt)} · {workout.sets.length} sets logged
            {plan.estMinutes ? ` · target ~${plan.estMinutes} min` : ''}
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
                  block={{ exerciseId: id, sets: 3, reps: '8–12', section: 'strength', tier: 1 }}
                  workout={workout} sym={sym}
                  open={open === id}
                  onToggle={() => setOpen(open === id ? null : id)}
                  onLog={logSet} onUndo={undoSet}
                  allExercises={exercises}
                />
              );
            })}
          </div>
        </div>
      )}

      <button className="btn" onClick={() => setShowPicker(true)}>+ Add exercise</button>

      {/* rest timer stays visible wherever you are in the session */}
      {restFor && (
        <div
          className="card pad-sm"
          style={{ position: 'sticky', bottom: 'calc(var(--nav-h) + var(--sab) + 10px)', zIndex: 40, boxShadow: '0 6px 22px rgba(0,0,0,0.45)' }}
        >
          <div className="row" style={{ gap: 10 }}>
            <span className="tag-note" style={{ flexShrink: 0 }}>Rest</span>
            <div className="grow">
              <RestTimer key={restFor.key} seconds={restFor.seconds} onDone={() => setTimeout(() => setRestFor(null), 4000)} />
            </div>
            <button className="btn sm ghost" onClick={() => setRestFor(null)}>Skip</button>
          </div>
        </div>
      )}

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
  ex, block, workout, sym, open, onToggle, onLog, onUndo, allExercises,
}: {
  ex: Exercise;
  block: SessionPlan['blocks'][number];
  workout: Workout;
  sym: Symptoms;
  open: boolean;
  onToggle: () => void;
  onLog: (exId: string, set: Omit<SetLog, 'exerciseId' | 'at'>, restSec: number) => void;
  onUndo: (exId: string) => void;
  allExercises: Exercise[];
}) {
  const [last, setLast] = useState<LastPerf | null>(null);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [rpe, setRpe] = useState<number | undefined>();
  const [showSwap, setShowSwap] = useState(false);
  const [swapped, setSwapped] = useState<Exercise | null>(null);
  const [holdKey, setHoldKey] = useState<number | null>(null);
  const activeEx = swapped ?? ex;

  // best-ever for this exercise (weight/e1RM PR, or reps for bodyweight)
  const pr = useLiveQuery(async () => {
    const prs = await db.prs.where('exerciseId').equals(activeEx.id).toArray();
    if (!prs.length) return null;
    const byKind = (k: string) => prs.filter((p) => p.kind === k).sort((a, b) => b.value - a.value)[0];
    return byKind('e1rm') ?? byKind('weight') ?? byKind('reps') ?? null;
  }, [activeEx.id]);

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

  const isBarbell = activeEx.equipment.includes('barbell');
  const plates = !isBw && isBarbell ? plateBreakdown(weight) : null;

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
          {pr && (
            <div className="tag-note" style={{ color: 'var(--warn)' }}>
              🏆 Your best: {pr.detail} ({pr.date})
            </div>
          )}
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

          {plates && (
            <div className="tag-note">🏋️ Load the bar: {plates}</div>
          )}

          {isTimed && (
            holdKey != null ? (
              <div className="row" style={{ gap: 10 }}>
                <span className="tag-note" style={{ flexShrink: 0 }}>Hold</span>
                <div className="grow">
                  <RestTimer key={holdKey} seconds={reps} onDone={() => { setHoldKey(null); logNow(); }} />
                </div>
                <button className="btn sm ghost" onClick={() => setHoldKey(null)}>Cancel</button>
              </div>
            ) : (
              <button className="btn" onClick={() => setHoldKey(Date.now())}>
                ⏱ Time the {reps}s hold — logs itself when done
              </button>
            )
          )}

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
  useEffect(() => {
    if (prCount > 0 && navigator.vibrate) navigator.vibrate([90, 50, 90, 50, 220]);
  }, [prCount]);
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
      {prCount > 0 && <Celebration />}
      <div className="page-head"><h1>{prCount > 0 ? 'New record! 🏆' : 'Workout complete 🎉'}</h1></div>
      <div className="card">
        <div className="grid-3">
          <div className="stat"><span className="v">{workout.endedAt ? fmtDuration(workout.endedAt - workout.startedAt) : '—'}</span><span className="k">duration</span></div>
          <div className="stat"><span className="v"><AnimatedNumber value={workout.sets.length} /></span><span className="k">sets</span></div>
          <div className="stat"><span className="v"><AnimatedNumber value={Math.round(tonnage / 100) / 10} decimals={1} /><small>t</small></span><span className="k">tonnage</span></div>
        </div>
        <div className="divider" />
        <div className="grid-3">
          <div className="stat"><span className="v" style={{ color: 'var(--accent)' }}><AnimatedNumber value={gluteSets} /></span><span className="k">glute sets</span></div>
          <div className="stat"><span className="v" style={{ color: 'var(--run)' }}><AnimatedNumber value={bicepSets} /></span><span className="k">bicep sets</span></div>
          <div className="stat"><span className="v" style={{ color: prCount ? 'var(--warn)' : undefined }}><AnimatedNumber value={prCount} /></span><span className="k">new PRs</span></div>
        </div>
      </div>
      {prCount > 0 && (
        <div className="card pr-banner">
          <div style={{ fontSize: '0.95rem', fontWeight: 650 }}>
            🏆 {prCount} personal record{prCount > 1 ? 's' : ''} today — stronger than you've ever been. Details in Progress.
          </div>
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

// ---------------- custom plan editor ----------------

function PlanEditor({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [blocks, setBlocks] = useState<CustomPlan['blocks']>([]);
  const [picking, setPicking] = useState(false);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const exMap = new Map(exercises.map((e) => [e.id, e]));

  const save = async () => {
    if (!name.trim() || blocks.length === 0) return;
    await db.plans.put({
      id: 'plan-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      blocks,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create your plan</h2>
        <input
          className="input" autoFocus placeholder="Plan name — e.g. Push Day, Leg Blast"
          value={name} onChange={(e) => setName(e.target.value)}
        />

        {blocks.map((blk, i) => {
          const ex = exMap.get(blk.exerciseId);
          return (
            <div key={i} className="card pad-sm">
              <div className="row" style={{ marginBottom: 8 }}>
                <div style={{ width: 48, height: 34, flexShrink: 0 }}>
                  <ExerciseAnim animId={ex?.animation ?? ''} />
                </div>
                <div className="grow li-title" style={{ fontSize: '0.9rem' }}>{ex?.name ?? blk.exerciseId}</div>
                <button className="btn sm ghost" onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}>✕</button>
              </div>
              <div className="row" style={{ gap: 12 }}>
                <div className="grow">
                  <Slider
                    value={blk.sets} min={1} max={6}
                    format={(v) => `${v} set${v > 1 ? 's' : ''}`}
                    onChange={(v) => setBlocks(blocks.map((b, j) => (j === i ? { ...b, sets: v } : b)))}
                  />
                </div>
                <input
                  className="input" style={{ width: 88, textAlign: 'center' }} aria-label="Reps"
                  value={blk.reps}
                  onChange={(e) => setBlocks(blocks.map((b, j) => (j === i ? { ...b, reps: e.target.value } : b)))}
                />
              </div>
            </div>
          );
        })}

        <button className="btn" onClick={() => setPicking(true)}>+ Add exercise</button>

        <div className="row">
          <button className="btn ghost grow" onClick={onClose}>Cancel</button>
          <button className="btn primary grow" disabled={!name.trim() || blocks.length === 0} onClick={save}>
            Save plan{blocks.length ? ` (${blocks.length})` : ''}
          </button>
        </div>

        {picking && (
          <ExercisePicker
            exercises={exercises}
            sym={{ knee: 1, back: 1, energy: 8 }}
            onPick={(id) => { setBlocks([...blocks, { exerciseId: id, sets: 3, reps: '8-12' }]); setPicking(false); }}
            onClose={() => setPicking(false)}
          />
        )}
      </div>
    </div>
  );
}
