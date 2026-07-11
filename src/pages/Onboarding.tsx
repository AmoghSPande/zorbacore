import { useState } from 'react';
import { updateProfile } from '../db';
import type { TrainingStyle } from '../types';
import { STYLES } from '../lib/coach';
import { cloudEnabled, signInGoogle, useCloud } from '../lib/cloud';
import { Stepper } from '../components/inputs';
import ExerciseAnim from '../components/ExerciseAnim';

function Grad({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: 'linear-gradient(100deg, var(--accent), var(--run) 90%)',
      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
    }}>
      {children}
    </span>
  );
}

function StepHead({ n, title, sub }: { n: number; title: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginTop: '2dvh', marginBottom: 4 }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.24em',
        color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 10,
      }}>
        Step {n} of 5
      </div>
      <h1 style={{ fontSize: 'clamp(1.7rem, 7vw, 2.1rem)', lineHeight: 1.12, letterSpacing: '-0.025em' }}>{title}</h1>
      {sub && <p style={{ marginTop: 10, color: 'var(--text-dim)', fontSize: '0.92rem', maxWidth: 340 }}>{sub}</p>}
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

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

        {/* backdrop: deep vignette (all steps) + faint runner (welcome only) */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(120% 65% at 50% 0%, #0c1320 0%, #070b11 55%, #04060a 100%)' }} />
        {step === 0 && (
          <>
            <div aria-hidden style={{ position: 'fixed', right: '-24%', bottom: '4%', width: '95%', opacity: 0.07, zIndex: -1, pointerEvents: 'none' }}>
              <ExerciseAnim animId="run-gait" />
            </div>

            {/* wordmark */}
            <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: '4dvh' }}>
              <img src="/icon.svg" alt="" width={30} height={30} style={{ borderRadius: 9 }} />
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
                letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Zorbacore
              </span>
            </div>

            {/* hero */}
            <div style={{ marginTop: '9dvh' }}>
              <h1 style={{ fontSize: 'clamp(2.1rem, 9vw, 2.7rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                Train for the
                <br />
                <span style={{
                  background: 'linear-gradient(100deg, var(--accent), var(--run) 90%)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}>
                  body you want.
                </span>
              </h1>
              <p style={{ marginTop: 14, color: 'var(--text-dim)', fontSize: '0.95rem', maxWidth: 320 }}>
                A coach that adapts every session to your joints, your goals,
                your time — and celebrates every record with you.
              </p>
              <div className="row" style={{ marginTop: 18, gap: 6, flexWrap: 'wrap' }}>
                {['Strength', 'Running', 'Yoga', 'Habits', 'Nutrition'].map((t) => (
                  <span key={t} style={{
                    fontSize: '0.72rem', fontWeight: 650, letterSpacing: '0.05em',
                    color: 'var(--text-faint)', border: '1px solid var(--border)',
                    borderRadius: 999, padding: '5px 11px',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 24 }}>
              {cloud.user && (
                <div className="card pad-sm" style={{ textAlign: 'center', borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)' }}>
                  Signed in as <b>{cloud.user.email}</b> — your space follows you on any device.
                </div>
              )}
              <button className="btn primary big" onClick={() => setStep(1)}>Set up my space</button>
              {cloudEnabled && !cloud.user && (
                <button
                  className="btn big"
                  style={{ background: 'var(--surface-2)', gap: 10 }}
                  disabled={!cloud.ready}
                  onClick={async () => { setSignErr(null); try { await signInGoogle(); } catch (e) { setSignErr((e as Error).message); } }}
                >
                  <GoogleG /> Continue with Google
                </button>
              )}
              {signErr && <div className="tag-note" style={{ color: 'var(--danger)', textAlign: 'center' }}>{signErr}</div>}
              <div className="tag-note" style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-faint)' }}>
                Private by design — sign in to sync across devices, or use it on this device only.
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <StepHead n={1} title={<>First, the <Grad>basics.</Grad></>} />
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
            <StepHead
              n={2}
              title={<>Anything your coach should <Grad>protect?</Grad></>}
              sub="Workouts adapt automatically around these — swapping exercises and easing intensity when symptoms rise."
            />
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
            <StepHead
              n={3}
              title={<>How do you want to <Grad>train?</Grad></>}
              sub="This shapes every session the coach builds — change it anytime in Settings."
            />
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
            <StepHead n={4} title={<>Set your <Grad>targets.</Grad></>} />
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
            <StepHead n={5} title={<>Ready, <Grad>{name.trim() || 'athlete'}.</Grad> 👊</>} />
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
