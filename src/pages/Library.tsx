import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Exercise, ExerciseCategory, Muscle } from '../types';
import ExerciseAnim from '../components/ExerciseAnim';
import BackLink from '../components/BackLink';

const CATS: { id: ExerciseCategory | 'all' | 'glutes' | 'biceps' | 'back-care'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'back-care', label: 'Back care' },
  { id: 'strength', label: 'Strength' },
  { id: 'core', label: 'Core' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'conditioning', label: 'Conditioning' },
  { id: 'cardio', label: 'Cardio' },
];

export default function Library() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<(typeof CATS)[number]['id']>('all');
  const [showAdd, setShowAdd] = useState(false);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []) ?? [];

  const filtered = useMemo(() => {
    let list = exercises;
    if (cat === 'glutes') list = list.filter((e) => e.gluteFocus);
    else if (cat === 'biceps') list = list.filter((e) => e.bicepFocus);
    else if (cat === 'back-care') list = list.filter((e) => e.backTherapeutic);
    else if (cat !== 'all') list = list.filter((e) => e.category === cat);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(s) || e.muscles.some((m) => m.includes(s)),
      );
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, q, cat]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <BackLink />
          <h1>Exercise Library</h1>
          <div className="sub">{exercises.length} exercises · all matched to your equipment</div>
        </div>
        <button className="btn sm" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      <input
        className="input"
        placeholder="Search exercises…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="chip-row scroll">
        {CATS.map((c) => (
          <button key={c.id} className={`chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="card pad-sm">
        {filtered.length === 0 && <div className="empty">No exercises match.</div>}
        {filtered.map((e) => (
          <Link key={e.id} to={`/library/${e.id}`} className="li">
            <div style={{ width: 64, height: 46, flexShrink: 0 }}>
              <ExerciseAnim animId={e.animation} />
            </div>
            <div className="li-main">
              <div className="li-title">{e.name}</div>
              <div className="li-sub">{e.muscles.join(', ')}</div>
            </div>
            <div className="li-end">
              {e.kneeRisk === 2 && <span className="badge warn">knee</span>}{' '}
              {e.backRisk === 2 && <span className="badge warn">back</span>}
              {(e.kneeTherapeutic || e.backTherapeutic) && <span className="badge ok">therapy</span>}
            </div>
          </Link>
        ))}
      </div>

      {showAdd && <AddExercise onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddExercise({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [muscle, setMuscle] = useState<Muscle>('full-body');
  const [cues, setCues] = useState('');

  const save = async () => {
    if (!name.trim()) return;
    const id = 'custom-' + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    const exercise: Exercise = {
      id, name: name.trim(), category, muscles: [muscle], secondaryMuscles: [],
      equipment: [], loadType: 'weight', gluteFocus: muscle === 'glutes', bicepFocus: muscle === 'biceps',
      kneeRisk: 1, backRisk: 1, animation: '',
      setup: [], cues: cues.split('\n').filter(Boolean),
      mistakes: [], safety: ['Custom exercise — apply the usual knee and back care.'],
      custom: true,
    };
    await db.exercises.add(exercise);
    onClose();
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add custom exercise</h2>
        <label className="field">
          <span className="lbl">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Farmer's Walk" />
        </label>
        <div className="grid-2">
          <label className="field">
            <span className="lbl">Category</span>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)}>
              <option value="strength">Strength</option>
              <option value="core">Core</option>
              <option value="mobility">Mobility</option>
              <option value="conditioning">Conditioning</option>
              <option value="cardio">Cardio</option>
            </select>
          </label>
          <label className="field">
            <span className="lbl">Main muscle</span>
            <select className="select" value={muscle} onChange={(e) => setMuscle(e.target.value as Muscle)}>
              {['full-body', 'glutes', 'hamstrings', 'quads', 'calves', 'back', 'lats', 'chest', 'shoulders', 'biceps', 'triceps', 'forearms', 'core', 'hip-flexors', 'spinal-erectors'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span className="lbl">Technique cues (one per line, optional)</span>
          <textarea className="textarea" rows={3} value={cues} onChange={(e) => setCues(e.target.value)} />
        </label>
        <div className="row">
          <button className="btn ghost grow" onClick={onClose}>Cancel</button>
          <button className="btn primary grow" onClick={save} disabled={!name.trim()}>Save</button>
        </div>
      </div>
    </div>
  );
}
