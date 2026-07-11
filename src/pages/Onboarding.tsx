import { useState } from 'react';
import { updateProfile } from '../db';
import type { TrainingStyle } from '../types';
import { STYLES } from '../lib/coach';
import { cloudEnabled, signInGoogle, useCloud } from '../lib/cloud';
import { Stepper } from '../components/inputs';

/**
 * First-run intake. Shown until profile.onboarded is true.
 * If the visitor signs in and their cloud profile already exists, sync pulls it
 * and this screen disappears on its own (App watches profile.onboarded).
 */
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const cloud = useCloud();

  const [name, setName] = useState('');
  const [heightCm, setHeightCm] = useState(0);
  const [knee, setKnee] = useState<boolean | null>(null);
  const [back, setBack] = useState<boolean | null>(null);
  const [conditionsNote, setConditionsNote] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState(0);
  const [gymDays, setGymDays] = useState<2 | 3>(3);
  const [goalsNote, setGoalsNote] = useState('');
  const [style, setStyle] = useState<TrainingStyle | null>(null);
  const [signErr, setSignErr] = useState<string | null>(null);

  const TOTAL = 6;

  const finish = async () => {
    await updateProfile({
      name: name.trim() || 'Athlete',
      heightCm: heightCm || undefined,
      kneeIssue: knee ?? false,
      backIssue: back ?? false,
      conditionsNote: conditionsNote.trim() || undefined,
      targetWeightKg: targetWeightKg || undefined,
      trainingDaysPerWeek: gymDays,
      goalsNote: goalsNote.trim() || undefined,
      trainingStyle: style ?? 'hybrid',
      onboarded: true,
    });
    if (cloud.user) {
      const { syncNow } = await import('../lib/cloud');
      void syncNow(cloud.user.uid).catch(() => undefined);
    }
  };

  const Dots = () => (
    <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 4 }}>
      {Array.from({ length: TOTAL }, (_, i) => (
        <span key={i} style={{
          width: i === step ? 20 : 7, height: 7, borderRadius: 99, transition: 'all .2s',
          background: i <= step ? 'var(--accent)' : 'var(--surface-3)',
        }} />
      ))}
    </div>
  );

  const Nav = ({ nextLabel = 'Continue', canNext = true, onNext }: { nextLabel?: string; canNext?: boolean; onNext?: () => void }) => (
    <div className="row" style={{ marginTop: 'auto', paddingTop: 16 }}>
      {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
      <button className="btn primary grow big" disabled={!canNext}
        onClick={() => (onNext ? onNext() : setStep(step + 1))}>
        {nextLabel}
      </button>
    </div>
  );

  return (
    <div className="page" style={{ minHeight: '100dvh', paddingBottom: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minHeight: '85dvh' }}>

        {step === 0 && (
          <>
            <div style={{ textAlign: 'center', marginTop: '8dvh' }}>
              <img src="/icon.svg" alt="" width={84} height={84} style={{ borderRadius: 22 }} />
              <h1 style={{ fontSize: '1.7rem', marginTop: 14 }}>Your personal training space</h1>
              <p className="sub" style={{ marginTop: 8, color: 'var(--text-dim)' }}>
                Strength, running, mobility and recovery — coached around <i>your</i> body,
                your goals and how you feel each day. Everything you record is private to you.
              </p>
            </div>
            {cloudEnabled && !cloud.user && (
              <button className="btn big" style={{ marginTop: '4dvh' }} disabled={!cloud.ready}
                onClick={async () => { setSignErr(null); try { await signInGoogle(); } catch (e) { setSignErr((e as Error).message); } }}>
                Continue with Google · syncs across your devices
              </button>
            )}
            {cloud.user && (
              <div className="card pad-sm" style={{ textAlign: 'center', borderColor: 'var(--accent)' }}>
                Signed in as <b>{cloud.user.email}</b> — your space will follow you on any device.
              </div>
            )}
            {signErr && <div className="tag-note" style={{ color: 'var(--danger)', textAlign: 'center' }}>{signErr}</div>}
            <Nav nextLabel="Set up my space" />
            {cloudEnabled && !cloud.user && (
              <div className="tag-note" style={{ textAlign: 'center' }}>
                You can also continue without an account — your data then lives only on this device.
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h1>First, the basics</h1>
            <label className="field">
              <span className="lbl">What should your coach call you?</span>
              <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="field">
              <span className="lbl">Height (cm) — unlocks body-composition tracking (optional)</span>
              <Stepper value={heightCm} onChange={setHeightCm} step={1} />
            </label>
            <Nav canNext={name.trim().length > 0} />
          </>
        )}

        {step === 2 && (
          <>
            <h1>Anything your coach should protect?</h1>
            <p className="tag-note">Workouts adapt automatically around these — swapping exercises and adjusting intensity when symptoms rise.</p>
            <div className="card">
              <div className="card-title">Knee trouble (pain, past injury, cartilage issues)?</div>
              <div className="row">
                <button className={`chip ${knee === true ? 'on' : ''}`} onClick={() => setKnee(true)}>Yes</button>
                <button className={`chip ${knee === false ? 'on' : ''}`} onClick={() => setKnee(false)}>No</button>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Lower-back stiffness or pain?</div>
              <div className="row">
                <button className={`chip ${back === true ? 'on' : ''}`} onClick={() => setBack(true)}>Yes</button>
                <button className={`chip ${back === false ? 'on' : ''}`} onClick={() => setBack(false)}>No</button>
              </div>
            </div>
            <label className="field">
              <span className="lbl">Anything else (shoulder, ankle, condition…) — optional</span>
              <input className="input" value={conditionsNote} onChange={(e) => setConditionsNote(e.target.value)} placeholder="e.g. left shoulder impingement" />
            </label>
            <Nav canNext={knee !== null && back !== null} />
          </>
        )}

        {step === 3 && (
          <>
            <h1>How do you want to train?</h1>
            <p className="tag-note">This shapes every session the coach builds. You can change it anytime in Settings.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(Object.keys(STYLES) as TrainingStyle[]).map((id) => (
                <button
                  key={id}
                  className="card pad-sm row"
                  style={{ textAlign: 'left', borderColor: style === id ? 'var(--accent)' : 'var(--border)' }}
                  onClick={() => setStyle(id)}
                >
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{STYLES[id].emoji}</span>
                  <div className="grow">
                    <div className="li-title">{STYLES[id].label}</div>
                    <div className="li-sub" style={{ whiteSpace: 'normal' }}>{STYLES[id].desc}</div>
                  </div>
                  {style === id && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
                </button>
              ))}
            </div>
            <Nav canNext={style !== null} />
          </>
        )}

        {step === 4 && (
          <>
            <h1>Your targets</h1>
            <label className="field">
              <span className="lbl">Target body weight (kg) — optional, guides the fat-loss dashboard</span>
              <Stepper value={targetWeightKg} onChange={setTargetWeightKg} step={0.5} />
            </label>
            <div className="card">
              <div className="card-title">Gym sessions you can realistically do per week</div>
              <div className="row">
                {[2, 3].map((n) => (
                  <button key={n} className={`chip ${gymDays === n ? 'on' : ''}`} onClick={() => setGymDays(n as 2 | 3)}>{n} days</button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="lbl">In your own words, what are you chasing? — optional</span>
              <textarea className="textarea" rows={3} value={goalsNote} onChange={(e) => setGoalsNote(e.target.value)}
                placeholder="e.g. lose belly fat, run a 5K without stopping, get stronger without hurting my back" />
            </label>
            <Nav />
          </>
        )}

        {step === 5 && (
          <>
            <h1>Ready, {name.trim() || 'athlete'} 👊</h1>
            <div className="card">
              <div className="card-title">Your space is set up with</div>
              <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.92rem' }}>
                <li>{STYLES[style ?? 'hybrid'].emoji} {STYLES[style ?? 'hybrid'].label} training, {gymDays} sessions/week</li>
                <li>{knee ? 'Knee-protective exercise choices and pre-workout knee checks' : 'Full exercise menu (no knee restrictions)'}</li>
                <li>{back ? 'A lower-back recovery program woven into every week' : 'Core stability work to keep your back healthy'}</li>
                <li>Daily readiness check-ins that shape each session</li>
                <li>{cloud.user ? 'Private cloud sync on — your diary follows you across devices' : 'Data stored privately on this device (sign in later in Settings to sync)'}</li>
              </ul>
            </div>
            <Nav nextLabel="Enter my space" onNext={finish} />
          </>
        )}

        <Dots />
      </div>
    </div>
  );
}
