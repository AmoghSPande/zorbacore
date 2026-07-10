import { useEffect, useRef, useState } from 'react';
import { db, exportAll, getProfile, importAll, updateProfile } from '../db';
import type { Profile } from '../types';
import { requestNotifyPermission } from '../lib/notify';
import { Stepper } from '../components/inputs';
import BackLink from '../components/BackLink';

export default function Settings() {
  const [p, setP] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);
  const [newEquip, setNewEquip] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => { getProfile().then(setP); }, []);
  if (!p) return null;

  const set = (patch: Partial<Profile>) => setP({ ...p, ...patch });
  const save = async () => {
    await updateProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const doExport = async () => {
    const json = await exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hybridcoach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    try {
      await importAll(text);
      alert('Backup imported ✔');
      getProfile().then(setP);
    } catch (e) {
      alert('Import failed: ' + (e as Error).message);
    }
  };

  const wipe = async () => {
    await Promise.all([
      db.workouts.clear(), db.runs.clear(), db.checkins.clear(),
      db.bodyMetrics.clear(), db.prs.clear(), db.chat.clear(),
    ]);
    setConfirmWipe(false);
    alert('Training data cleared. Exercise library and profile kept.');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <BackLink />
          <h1>Settings</h1>
        </div>
        <button className="btn sm primary" onClick={save}>{saved ? '✓ Saved' : 'Save'}</button>
      </div>

      <div className="card">
        <div className="card-title">Profile & targets</div>
        <div className="grid-2" style={{ marginBottom: 10 }}>
          <label className="field"><span className="lbl">Name</span>
            <input className="input" value={p.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <label className="field"><span className="lbl">Height (cm)</span>
            <Stepper value={p.heightCm ?? 0} onChange={(v) => set({ heightCm: v || undefined })} step={1} />
          </label>
        </div>
        <div className="grid-3">
          <label className="field"><span className="lbl">Target weight</span>
            <Stepper value={p.targetWeightKg ?? 0} onChange={(v) => set({ targetWeightKg: v || undefined })} step={0.5} />
          </label>
          <label className="field"><span className="lbl">Target waist</span>
            <Stepper value={p.targetWaistCm ?? 0} onChange={(v) => set({ targetWaistCm: v || undefined })} step={0.5} />
          </label>
          <label className="field"><span className="lbl">Target BF %</span>
            <Stepper value={p.targetBodyFatPct ?? 0} onChange={(v) => set({ targetBodyFatPct: v || undefined })} step={0.5} />
          </label>
        </div>
        <div className="tag-note" style={{ marginTop: 8 }}>
          Height unlocks the waist-to-height visceral-fat gauge; targets draw goal lines on Progress charts.
        </div>
      </div>

      <div className="card">
        <div className="card-title">Schedule & reminders</div>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: '0.9rem' }}>Gym sessions per week</span>
          <div className="row">
            {[2, 3].map((n) => (
              <button key={n} className={`chip ${p.trainingDaysPerWeek === n ? 'on' : ''}`} onClick={() => set({ trainingDaysPerWeek: n as 2 | 3 })}>{n}</button>
            ))}
          </div>
        </div>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: '0.9rem' }}>Daily reminder</span>
          <button
            className={`chip ${p.remindersEnabled ? 'on' : ''}`}
            onClick={async () => {
              if (!p.remindersEnabled) await requestNotifyPermission();
              set({ remindersEnabled: !p.remindersEnabled });
            }}
          >
            {p.remindersEnabled ? 'On' : 'Off'}
          </button>
        </div>
        {p.remindersEnabled && (
          <label className="field"><span className="lbl">Reminder time</span>
            <input className="input" type="time" value={p.reminderTime} onChange={(e) => set({ reminderTime: e.target.value })} />
          </label>
        )}
        <div className="tag-note" style={{ marginTop: 8 }}>
          Reminders are encouraging, never guilt-based — and fire when the app is open or installed on your home screen.
        </div>
      </div>

      <div className="card">
        <div className="card-title">Equipment</div>
        <div className="chip-row">
          {p.equipment.map((eq) => (
            <button
              key={eq.id}
              className="chip on"
              title="Tap to remove"
              onClick={() => set({ equipment: p.equipment.filter((x) => x.id !== eq.id) })}
            >
              {eq.name} ✕
            </button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <input className="input grow" placeholder="Add equipment (e.g. Kettlebell)" value={newEquip} onChange={(e) => setNewEquip(e.target.value)} />
          <button
            className="btn"
            disabled={!newEquip.trim()}
            onClick={() => {
              const name = newEquip.trim();
              set({ equipment: [...p.equipment, { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, custom: true }] });
              setNewEquip('');
            }}
          >Add</button>
        </div>
        <div className="tag-note" style={{ marginTop: 8 }}>
          Add custom exercises for new equipment in Library → + Add.
        </div>
      </div>

      <div className="card">
        <div className="card-title">AI coach (optional)</div>
        <label className="field"><span className="lbl">Anthropic API key</span>
          <input
            className="input" type="password" placeholder="sk-ant-…"
            value={p.anthropicApiKey ?? ''}
            onChange={(e) => set({ anthropicApiKey: e.target.value || undefined })}
          />
        </label>
        <div className="tag-note" style={{ marginTop: 8 }}>
          Without a key, the chat coach answers from built-in coaching rules using your data. With a key (console.anthropic.com),
          it becomes a full AI coach. The key is stored only on this device.
        </div>
      </div>

      <div className="card">
        <div className="card-title">Your data</div>
        <div className="row">
          <button className="btn grow" onClick={doExport}>⬇ Export backup</button>
          <button className="btn grow" onClick={() => fileRef.current?.click()}>⬆ Import backup</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
        </div>
        <div className="tag-note" style={{ margin: '8px 0' }}>
          Everything lives on this device. Export a backup now and then — or before switching phones.
        </div>
        {!confirmWipe ? (
          <button className="btn danger" onClick={() => setConfirmWipe(true)}>Delete all training data…</button>
        ) : (
          <div className="row">
            <button className="btn danger grow" onClick={wipe}>Yes, delete everything</button>
            <button className="btn grow" onClick={() => setConfirmWipe(false)}>Cancel</button>
          </div>
        )}
      </div>

      <div className="tag-note" style={{ textAlign: 'center' }}>
        HybridCoach · your data never leaves this device (except AI chat, if enabled)
      </div>
    </div>
  );
}
