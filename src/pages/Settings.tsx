import { useEffect, useRef, useState } from 'react';
import { db, exportAll, getProfile, importAll, updateProfile } from '../db';
import type { Profile, TrainingStyle } from '../types';
import { STYLES } from '../lib/coach';
import { requestNotifyPermission } from '../lib/notify';
import { cloudEnabled, signInGoogle, signOutGoogle, syncNow, useCloud } from '../lib/cloud';
import { Slider } from '../components/inputs';
import BackLink from '../components/BackLink';

function CloudCard() {
  const cloud = useCloud();
  const [err, setErr] = useState<string | null>(null);

  if (!cloudEnabled) {
    return (
      <div className="card">
        <div className="card-title">Account & cloud sync</div>
        <p style={{ fontSize: '0.88rem' }}>
          Google sign-in isn't set up yet. Once the Firebase project is connected
          (see <b>docs/FIREBASE_SETUP.md</b> in the repo — a one-time, 5-minute step),
          you and your family can each sign in with Google to get a private,
          cross-device fitness diary.
        </p>
      </div>
    );
  }

  const act = async (fn: () => Promise<void>) => {
    setErr(null);
    try { await fn(); } catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="card">
      <div className="card-title">Account & cloud sync</div>
      {!cloud.user ? (
        <>
          <button className="btn primary big" disabled={!cloud.ready} onClick={() => act(signInGoogle)}>
            Continue with Google
          </button>
          <div className="tag-note" style={{ marginTop: 8 }}>
            Signing in backs up your diary to your own private cloud space and syncs it
            across your devices. Only your Google account can access it — not other users,
            not visitors to the site. Without signing in, everything stays on this device only.
          </div>
        </>
      ) : (
        <>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 650, fontSize: '0.92rem' }}>{cloud.user.name ?? 'Signed in'}</div>
              <div className="tag-note">{cloud.user.email}</div>
            </div>
            <span className="badge ok">private sync on</span>
          </div>
          {cloud.conflict && (
            <div className="card pad-sm" style={{ borderColor: 'var(--warn)', marginBottom: 8 }}>
              <div style={{ fontSize: '0.86rem', marginBottom: 8 }}>
                This device has data from a different account. Which diary should win?
              </div>
              <div className="row">
                <button className="btn sm grow" onClick={() => act(() => syncNow(cloud.user!.uid, 'useCloud'))}>
                  Use my cloud data
                </button>
                <button className="btn sm grow" onClick={() => act(() => syncNow(cloud.user!.uid, 'useLocal'))}>
                  Keep this device's data
                </button>
              </div>
            </div>
          )}
          <div className="row">
            <button className="btn grow" disabled={cloud.syncing} onClick={() => act(() => syncNow(cloud.user!.uid))}>
              {cloud.syncing ? 'Syncing…' : 'Sync now'}
            </button>
            <button className="btn ghost" onClick={() => act(signOutGoogle)}>Sign out</button>
          </div>
          <div className="tag-note" style={{ marginTop: 8 }}>
            {cloud.lastSyncAt ? `Last synced ${new Date(cloud.lastSyncAt).toLocaleString()}` : 'Not synced yet'} · syncs automatically while the app is open
          </div>
        </>
      )}
      {(err || cloud.error) && <div className="tag-note" style={{ color: 'var(--danger)', marginTop: 6 }}>{err ?? cloud.error}</div>}
    </div>
  );
}

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

      <CloudCard />

      <div className="card">
        <div className="card-title">Profile & targets</div>
        <div className="grid-2" style={{ marginBottom: 10 }}>
          <label className="field"><span className="lbl">Name</span>
            <input className="input" value={p.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <label className="field"><span className="lbl">Height</span>
            <Slider value={p.heightCm ?? 170} onChange={(v) => set({ heightCm: v })} min={130} max={210} unit="cm" />
          </label>
        </div>
        <label className="field" style={{ marginBottom: 10 }}><span className="lbl">Target weight</span>
          <Slider value={p.targetWeightKg ?? 70} onChange={(v) => set({ targetWeightKg: v })} min={40} max={140} step={0.5} unit="kg" />
        </label>
        <div className="grid-2">
          <label className="field"><span className="lbl">Target waist</span>
            <Slider value={p.targetWaistCm ?? 90} onChange={(v) => set({ targetWaistCm: v })} min={60} max={130} step={0.5} unit="cm" />
          </label>
          <label className="field"><span className="lbl">Target body fat</span>
            <Slider value={p.targetBodyFatPct ?? 20} onChange={(v) => set({ targetBodyFatPct: v })} min={8} max={45} step={0.5} unit="%" />
          </label>
        </div>
        <div className="tag-note" style={{ marginTop: 8 }}>
          Height unlocks the waist-to-height visceral-fat gauge; targets draw goal lines on Progress charts.
        </div>
        <div className="divider" />
        <div className="card-title">Health flags (personalize the coaching)</div>
        <div className="chip-row" style={{ marginBottom: 10 }}>
          <button className={`chip ${p.kneeIssue ? 'on' : ''}`} onClick={() => set({ kneeIssue: !p.kneeIssue })}>
            {p.kneeIssue ? '✓ ' : ''}Knee issue
          </button>
          <button className={`chip ${p.backIssue ? 'on' : ''}`} onClick={() => set({ backIssue: !p.backIssue })}>
            {p.backIssue ? '✓ ' : ''}Lower-back issue
          </button>
        </div>
        <input className="input" placeholder="Other conditions (optional)"
          value={p.conditionsNote ?? ''} onChange={(e) => set({ conditionsNote: e.target.value || undefined })} />
      </div>

      <div className="card">
        <div className="card-title">Training style</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(Object.keys(STYLES) as TrainingStyle[]).map((id) => (
            <button
              key={id}
              className="row"
              style={{
                textAlign: 'left', padding: '8px 10px', borderRadius: 10,
                border: `1px solid ${(p.trainingStyle ?? 'hybrid') === id ? 'var(--accent)' : 'var(--border)'}`,
                background: (p.trainingStyle ?? 'hybrid') === id ? 'var(--accent-dim)' : 'var(--surface-2)',
              }}
              onClick={() => set({ trainingStyle: id })}
            >
              <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{STYLES[id].emoji}</span>
              <div className="grow">
                <div style={{ fontWeight: 650, fontSize: '0.9rem' }}>{STYLES[id].label}</div>
                <div className="tag-note">{STYLES[id].desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Nutrition targets (for the calorie tracker)</div>
        <label className="field" style={{ marginBottom: 10 }}><span className="lbl">Calories per day</span>
          <Slider value={p.calorieTarget ?? 2000} onChange={(v) => set({ calorieTarget: v })} min={1200} max={3500} step={50} unit="kcal" />
        </label>
        <label className="field"><span className="lbl">Protein per day</span>
          <Slider value={p.proteinTarget ?? 100} onChange={(v) => set({ proteinTarget: v })} min={40} max={220} step={5} unit="g" />
        </label>
        <div className="tag-note" style={{ marginTop: 8 }}>
          Rough starting points for fat loss: bodyweight (kg) × 24–26 kcal, protein 1.6–2 g per kg.
        </div>
      </div>

      <div className="card">
        <div className="card-title">Schedule & reminders</div>
        <label className="field" style={{ marginBottom: 10 }}><span className="lbl">Training days per week</span>
          <Slider value={p.trainingDaysPerWeek ?? 3} onChange={(v) => set({ trainingDaysPerWeek: v })} min={1} max={7}
            format={(v) => `${v} day${v > 1 ? 's' : ''} / week`} />
        </label>
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
        HybridCoach · your data stays on this device, plus your own private cloud space if you sign in
      </div>
    </div>
  );
}
