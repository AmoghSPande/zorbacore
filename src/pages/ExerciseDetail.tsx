import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import ExerciseAnim from '../components/ExerciseAnim';
import BackLink from '../components/BackLink';

function Bullets({ title, items, tone }: { title: string; items: string[]; tone?: 'ok' | 'warn' | 'bad' }) {
  if (!items?.length) return null;
  const color = tone === 'warn' ? 'var(--warn)' : tone === 'bad' ? 'var(--danger)' : tone === 'ok' ? 'var(--accent)' : 'var(--text-dim)';
  return (
    <div className="card">
      <div className="card-title" style={{ color }}>{title}</div>
      <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((c, i) => (
          <li key={i} style={{ fontSize: '0.9rem' }}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ExerciseDetail() {
  const { id } = useParams();
  const e = useLiveQuery(() => db.exercises.get(id ?? ''), [id]);
  const history = useLiveQuery(async () => {
    if (!id) return [];
    const workouts = await db.workouts.orderBy('date').reverse().limit(60).toArray();
    const rows: { date: string; best: string }[] = [];
    for (const w of workouts) {
      const sets = w.sets.filter((s) => s.exerciseId === id);
      if (!sets.length) continue;
      const best = sets.reduce((a, b) => (b.weightKg * b.reps > a.weightKg * a.reps ? b : a));
      rows.push({ date: w.date, best: best.weightKg > 0 ? `${best.weightKg}kg × ${best.reps}` : `${best.reps} reps` });
      if (rows.length >= 8) break;
    }
    return rows;
  }, [id]);

  if (!e) return <div className="page"><div className="empty">Exercise not found.</div></div>;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <BackLink label="Library" />
          <h1>{e.name}</h1>
          <div className="sub">
            {e.muscles.join(', ')}
            {e.secondaryMuscles.length > 0 && ` · also: ${e.secondaryMuscles.join(', ')}`}
          </div>
        </div>
      </div>

      <div className="chip-row">
        {e.gluteFocus && <span className="badge ok">glute builder</span>}
        {e.bicepFocus && <span className="badge ok">bicep builder</span>}
        {e.kneeTherapeutic && <span className="badge info">knee therapy</span>}
        {e.backTherapeutic && <span className="badge info">back therapy</span>}
        {e.kneeRisk === 2 && <span className="badge warn">care: right knee</span>}
        {e.backRisk === 2 && <span className="badge warn">care: lower back</span>}
      </div>

      <div className="card" style={{ padding: 6 }}>
        <ExerciseAnim animId={e.animation} className="anim-hero" />
      </div>

      <Bullets title="Setup" items={e.setup} />
      <Bullets title="Technique cues" items={e.cues} tone="ok" />
      <Bullets title="Common mistakes" items={e.mistakes} tone="warn" />
      <Bullets title="Joint protection & safety" items={e.safety} tone="bad" />

      {e.kneeMod && (
        <div className="card">
          <div className="card-title" style={{ color: 'var(--run)' }}>Right-knee modification</div>
          <p style={{ fontSize: '0.9rem' }}>{e.kneeMod}</p>
        </div>
      )}
      {e.backMod && (
        <div className="card">
          <div className="card-title" style={{ color: 'var(--mobility)' }}>Lower-back modification</div>
          <p style={{ fontSize: '0.9rem' }}>{e.backMod}</p>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="card pad-sm">
          <div className="card-title">Recent history (best set)</div>
          {history.map((h) => (
            <div key={h.date} className="li">
              <div className="li-main"><div className="li-sub">{h.date}</div></div>
              <div className="li-end" style={{ color: 'var(--text)' }}>{h.best}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
