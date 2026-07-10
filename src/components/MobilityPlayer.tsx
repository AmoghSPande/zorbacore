import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, todayStr } from '../db';
import type { Routine } from '../data/mobility';
import ExerciseAnim from './ExerciseAnim';

/** Guided player: steps through a routine with a countdown per item. */
export default function MobilityPlayer({ routine, onClose }: { routine: Routine; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(routine.items[0].seconds);
  const [paused, setPaused] = useState(false);
  const [doneAll, setDoneAll] = useState(false);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const item = routine.items[idx];
  const ex = exMap.get(item.exerciseId);

  useEffect(() => {
    if (paused || doneAll) return;
    const iv = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          if (navigator.vibrate) navigator.vibrate(150);
          if (idx + 1 < routine.items.length) {
            setIdx(idx + 1);
            return routine.items[idx + 1].seconds;
          }
          setDoneAll(true);
          clearInterval(iv);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [idx, paused, doneAll, routine]);

  const finish = async () => {
    // log as a mobility workout so streaks/recovery see it
    await db.workouts.add({
      date: todayStr(),
      type: 'mobility',
      startedAt: Date.now() - routine.minutes * 60000,
      endedAt: Date.now(),
      sets: routine.items.map((it) => ({
        exerciseId: it.exerciseId, weightKg: 0, reps: it.seconds, at: Date.now(),
      })),
      note: routine.name,
    });
    onClose();
  };

  if (doneAll) {
    return (
      <div className="modal-back">
        <div className="modal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <h2>✨ {routine.name} done</h2>
          <p className="tag-note">{routine.minutes} minutes for your future back. Logged.</p>
          <button className="btn primary big" onClick={finish}>Finish & save</button>
        </div>
      </div>
    );
  }

  const total = routine.items.length;
  return (
    <div className="modal-back">
      <div className="modal">
        <div className="row-between">
          <h2>{routine.name}</h2>
          <span className="tag-note">{idx + 1}/{total}</span>
        </div>
        <div className="progressbar"><div style={{ width: `${((idx + (1 - left / item.seconds)) / total) * 100}%`, background: 'var(--mobility)' }} /></div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{ex?.name ?? item.exerciseId}</div>
          {item.note && <div className="tag-note">{item.note}</div>}
        </div>
        <ExerciseAnim animId={ex?.animation ?? ''} className="anim-hero" />
        <div style={{ textAlign: 'center', fontSize: '2.4rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--mobility)' }}>
          {left}s
        </div>
        {ex && ex.cues.length > 0 && (
          <div className="tag-note" style={{ textAlign: 'center' }}>{ex.cues[0]}</div>
        )}

        <div className="row">
          <button className="btn grow" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button>
          <button className="btn grow" onClick={() => {
            if (idx + 1 < total) { setIdx(idx + 1); setLeft(routine.items[idx + 1].seconds); }
            else setDoneAll(true);
          }}>Skip</button>
          <button className="btn ghost" onClick={onClose}>Exit</button>
        </div>
      </div>
    </div>
  );
}
