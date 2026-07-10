import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, todayStr } from '../db';
import type { Run, RunType } from '../types';
import {
  buildRunPlan, computeRunStats, fmtPace, fmtTime, paceSecPerKm,
  RUN_TYPE_LABEL, type RunStats,
} from '../lib/running';
import { Scale10, Stepper } from '../components/inputs';

export default function RunPage() {
  const [stats, setStats] = useState<RunStats | null>(null);
  const [logging, setLogging] = useState(false);
  const runs = useLiveQuery(() => db.runs.orderBy('date').reverse().limit(10).toArray(), []) ?? [];

  useEffect(() => {
    computeRunStats().then(setStats);
  }, [runs.length]);

  if (logging) {
    return <LogRun onClose={() => setLogging(false)} stats={stats} />;
  }

  const plan = stats ? buildRunPlan(stats) : null;
  const goalPct = plan
    ? Math.max(0, Math.min(100, Math.round(
        ((plan.goal.currentSec - plan.goal.targetSec) <= 0)
          ? 100
          : 100 - ((plan.goal.currentSec - plan.goal.targetSec) / plan.goal.targetSec) * 100 * 5,
      )))
    : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Run</h1>
          <div className="sub">Toward 5K &lt; 30:00 and 10K &lt; 60:00</div>
        </div>
        <Link to="/library/running-form" className="btn sm">Form check</Link>
      </div>

      <button className="btn run big" onClick={() => setLogging(true)}>Log a run</button>

      {stats && (
        <div className="card">
          <div className="grid-3">
            <div className="stat">
              <span className="v">{stats.pb5k ? fmtTime(stats.pb5k.sec) : '—'}</span>
              <span className="k">5K best</span>
            </div>
            <div className="stat">
              <span className="v">{stats.pb10k ? fmtTime(stats.pb10k.sec) : '—'}</span>
              <span className="k">10K best</span>
            </div>
            <div className="stat">
              <span className="v">{stats.vo2max ?? '—'}</span>
              <span className="k">VO₂max est.</span>
            </div>
          </div>
          <div className="divider" />
          <div className="grid-3">
            <div className="stat">
              <span className="v">{Math.round(stats.thisWeekKm * 10) / 10}<small>km</small></span>
              <span className="k">this week</span>
            </div>
            <div className="stat">
              <span className="v">{Math.round(stats.lastWeekKm * 10) / 10}<small>km</small></span>
              <span className="k">last week</span>
            </div>
            <div className="stat">
              <span className="v">{fmtTime(stats.current5kEstimateSec)}</span>
              <span className="k">5K est. now</span>
            </div>
          </div>
        </div>
      )}

      {plan && (
        <div className="card">
          <div className="row-between">
            <div className="card-title" style={{ margin: 0 }}>Goal: {plan.goal.name}</div>
            <span className="badge info">{fmtTime(plan.goal.currentSec)} → {fmtTime(plan.goal.targetSec)}</span>
          </div>
          <div className="progressbar" style={{ marginTop: 10 }}><div style={{ width: `${goalPct}%`, background: 'var(--run)' }} /></div>
        </div>
      )}

      {plan && (
        <div className="card pad-sm">
          <div className="card-title">This week's running (pick by priority)</div>
          {plan.runs.map((r, i) => (
            <div key={i} className="li">
              <span className="badge purple" style={{ flexShrink: 0 }}>{i + 1}</span>
              <div className="li-main">
                <div className="li-title">{r.title}</div>
                <div className="li-sub" style={{ whiteSpace: 'normal' }}>{r.detail}</div>
              </div>
              {r.paceSec && <div className="li-end">{fmtPace(r.paceSec)}</div>}
            </div>
          ))}
          <div className="tag-note" style={{ padding: '8px 2px 2px' }}>
            Ramp rule: raise weekly distance by max ~10% — your knee sets the ceiling, not your lungs.
          </div>
        </div>
      )}

      {runs.length > 0 && (
        <div className="card pad-sm">
          <div className="card-title">Recent runs</div>
          {runs.map((r) => (
            <div key={r.id} className="li">
              <span className="badge run-on info" style={{ flexShrink: 0 }}>{RUN_TYPE_LABEL[r.type]}</span>
              <div className="li-main">
                <div className="li-title">{r.distanceKm} km · {fmtTime(r.durationSec)}</div>
                <div className="li-sub">
                  {r.date}{r.indoor ? ' · treadmill' : ''}{r.avgHr ? ` · ${r.avgHr} bpm` : ''}
                  {r.preKnee != null && r.preKnee >= 4 ? ` · knee ${r.preKnee}/10` : ''}
                </div>
              </div>
              <div className="li-end" style={{ color: 'var(--run)', fontWeight: 700 }}>{fmtPace(paceSecPerKm(r))}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- log run flow ----------------

function LogRun({ onClose, stats }: { onClose: () => void; stats: RunStats | null }) {
  const [knee, setKnee] = useState<number>();
  const [back, setBack] = useState<number>();
  const [energy, setEnergy] = useState<number>();
  const [checked, setChecked] = useState(false);

  const [type, setType] = useState<RunType>('easy');
  const [km, setKm] = useState(3);
  const [mins, setMins] = useState(20);
  const [secs, setSecs] = useState(0);
  const [hr, setHr] = useState(0);
  const [indoor, setIndoor] = useState(false);
  const [note, setNote] = useState('');

  const ready = knee != null && back != null && energy != null;
  const guidance = ready && stats ? buildRunPlan(stats, { knee: knee!, back: back!, energy: energy! }) : null;

  if (!checked) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Before you run</h1>
            <div className="sub">30 seconds — protects the knee, shapes the session.</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Right-knee discomfort</div>
          <Scale10 value={knee} onChange={setKnee} />
        </div>
        <div className="card">
          <div className="card-title">Lower-back stiffness</div>
          <Scale10 value={back} onChange={setBack} />
        </div>
        <div className="card">
          <div className="card-title">Energy level</div>
          <Scale10 value={energy} onChange={setEnergy} invert />
        </div>
        {guidance?.banner && (
          <div className="card" style={{ borderColor: 'var(--warn)' }}>
            <div style={{ fontSize: '0.88rem' }}>{guidance.banner}</div>
          </div>
        )}
        <button className="btn run big" disabled={!ready} onClick={() => setChecked(true)}>
          {guidance?.replaceWith ? 'Understood — log activity anyway' : 'Continue to log'}
        </button>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    );
  }

  const save = async () => {
    const run: Run = {
      date: todayStr(),
      type,
      distanceKm: km,
      durationSec: mins * 60 + secs,
      avgHr: hr > 0 ? hr : undefined,
      preKnee: knee, preBack: back, preEnergy: energy,
      indoor: indoor || undefined,
      note: note.trim() || undefined,
    };
    await db.runs.add(run);
    onClose();
  };

  const pace = km > 0 ? (mins * 60 + secs) / km : 0;

  return (
    <div className="page">
      <div className="page-head"><h1>Log run</h1></div>

      <div className="chip-row">
        {(Object.keys(RUN_TYPE_LABEL) as RunType[]).map((t) => (
          <button key={t} className={`chip ${type === t ? 'run-on' : ''}`} onClick={() => setType(t)}>
            {RUN_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="grid-2">
        <label className="field">
          <span className="lbl">Distance (km)</span>
          <Stepper value={km} onChange={setKm} step={0.5} min={0.5} />
        </label>
        <label className="field">
          <span className="lbl">Avg heart rate (opt.)</span>
          <Stepper value={hr} onChange={setHr} step={5} min={0} />
        </label>
      </div>
      <div className="grid-2">
        <label className="field">
          <span className="lbl">Minutes</span>
          <Stepper value={mins} onChange={setMins} step={1} min={0} />
        </label>
        <label className="field">
          <span className="lbl">Seconds</span>
          <Stepper value={secs} onChange={setSecs} step={5} min={0} />
        </label>
      </div>

      <div className="row-between card pad-sm">
        <span className="tag-note">Pace</span>
        <span style={{ fontWeight: 750, color: 'var(--run)' }}>{fmtPace(pace)}</span>
      </div>

      <button className={`chip ${indoor ? 'on' : ''}`} onClick={() => setIndoor(!indoor)} style={{ alignSelf: 'flex-start' }}>
        {indoor ? '✓ ' : ''}Treadmill
      </button>

      <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />

      <button className="btn run big" onClick={save} disabled={km <= 0 || mins * 60 + secs <= 0}>Save run</button>
      <button className="btn ghost" onClick={onClose}>Cancel</button>
    </div>
  );
}
