import { useEffect, useState } from 'react';
import { updateProfile } from '../db';
import type { TrainingStyle } from '../types';
import { STYLES } from '../lib/coach';
import { cloudEnabled, signInGoogle, useCloud } from '../lib/cloud';
import { Slider } from '../components/inputs';
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

/** Zorby's journey — a looping seven-beat story told by the app's stick figures. */
const HERO_SCENES = [
  { anim: 'hero-dream', line: 'This is Zorby. Zorby has a dream.' },
  { anim: 'hero-bench', line: 'So the grind begins.' },
  { anim: 'hero-run', line: 'Some days you fly…' },
  { anim: 'hero-box', line: '…some days you fight back.' },
  { anim: 'hero-yoga', line: 'Breathe. Recover. Repeat.' },
  { anim: 'hero-climb', line: 'Keep going long enough…' },
  { anim: 'hero-summit', line: '…and the view changes. Your turn.' },
];

function HeroCycler() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setI((x) => (x + 1) % HERO_SCENES.length), 3600);
    return () => clearInterval(iv);
  }, []);
  const scene = HERO_SCENES[i];
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="hero-stage">
        <div key={scene.anim} className="hero-scene">
          <ExerciseAnim animId={scene.anim} />
        </div>
      </div>
      <div key={scene.line} className="hero-caption">{scene.line}</div>
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
  const [heightCm, setHeightCm] = useState(170);
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionsNote, setConditionsNote] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState(70);
  const [targetTouched, setTargetTouched] = useState(false);
  const [gymDays, setGymDays] = useState(3);
  const [goalsNote, setGoalsNote] = useState('');
  const [style, setStyle] = useState<TrainingStyle | null>(null);
  const [signErr, setSignErr] = useState<string | null>(null);

  const knee = conditions.includes('Knee pain');
  const back = conditions.includes('Lower-back pain');
  const toggleCondition = (c: string) => {
    setConditions((prev) => {
      if (c === 'None of these') return prev.includes(c) ? [] : ['None of these'];
      const withoutNone = prev.filter((x) => x !== 'None of these');
      return withoutNone.includes(c) ? withoutNone.filter((x) => x !== c) : [...withoutNone, c];
    });
  };

  const TOTAL = 6;

  const finish = async () => {
    const otherConditions = conditions.filter((c) => !['Knee pain', 'Lower-back pain', 'None of these'].includes(c));
    const note = [otherConditions.join(', '), conditionsNote.trim()].filter(Boolean).join('; ');
    await updateProfile({
      name: name.trim() || 'Athlete',
      heightCm: heightCm || undefined,
      kneeIssue: knee,
      backIssue: back,
      conditionsNote: note || undefined,
      targetWeightKg: targetTouched ? targetWeightKg : undefined,
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

  // progress dots for steps 1–5 only — the welcome screen stays clean
  const Dots = () => (
    <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 4 }}>
      {Array.from({ length: TOTAL - 1 }, (_, i) => i + 1).map((i) => (
        <span key={i} style={{
          width: i === step ? 20 : 7, height: 7, borderRadius: 99, transition: 'all .2s',
          background: i <= step ? 'var(--accent)' : 'var(--surface-3)',
        }} />
      ))}
    </div>
  );

  const Nav = ({ nextLabel = 'Continue', canNext = true, onNext, onSkip }: {
    nextLabel?: string; canNext?: boolean; onNext?: () => void; onSkip?: () => void;
  }) => (
    <div style={{ marginTop: 'auto', paddingTop: 16 }}>
      <div className="row">
        {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
        <button className="btn primary grow big" disabled={!canNext}
          onClick={() => (onNext ? onNext() : setStep(step + 1))}>
          {nextLabel}
        </button>
      </div>
      {onSkip && (
        <button className="btn ghost" style={{ width: '100%', marginTop: 4 }}
          onClick={() => { onSkip(); setStep(step + 1); }}>
          Skip for now — the coach will use safe defaults
        </button>
      )}
    </div>
  );

  return (
    <div className="page" style={{ minHeight: '100dvh', paddingBottom: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minHeight: '85dvh' }}>

        {/* backdrop: deep vignette (all steps) + faint runner (welcome only) */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(120% 65% at 50% 0%, #0c1320 0%, #070b11 55%, #04060a 100%)' }} />
        {step === 0 && (
          <>
            {/* wordmark */}
            <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: '3dvh' }}>
              <img src="/icon.svg" alt="" width={30} height={30} style={{ borderRadius: 9 }} />
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
                letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Zorbacore
              </span>
            </div>

            {/* living hero — cycling aspirational figures; auto margins center the
                hero+headline group in the space between wordmark and actions */}
            <div style={{ marginTop: 'auto', paddingTop: '2dvh' }}>
              <HeroCycler />
            </div>

            {/* headline */}
            <div style={{ marginTop: '2dvh', textAlign: 'center' }}>
              <h1 style={{ fontSize: 'clamp(2rem, 8.5vw, 2.6rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                Train for the
                <br />
                <span style={{
                  background: 'linear-gradient(100deg, var(--accent), var(--run) 90%)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}>
                  body you want.
                </span>
              </h1>
              <p style={{ margin: '12px auto 0', color: 'var(--text-dim)', fontSize: '0.94rem', maxWidth: 320 }}>
                A coach that adapts every session to your body, your goals, your time.
              </p>
              <div style={{
                marginTop: 12, fontSize: '0.74rem', fontWeight: 650, letterSpacing: '0.08em',
                color: 'var(--text-faint)', textTransform: 'uppercase',
              }}>
                Strength · Running · Yoga · Habits · Nutrition
              </div>
            </div>

            {/* actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 20 }}>
              {cloud.user && (
                <div className="card pad-sm" style={{ textAlign: 'center', borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)' }}>
                  Signed in as <b>{cloud.user.email}</b> — your space follows you on any device.
                </div>
              )}
              <button className="btn primary big" onClick={() => setStep(1)}>Set up my space</button>
              {cloudEnabled && !cloud.user && (
                <button
                  className="btn ghost"
                  style={{ gap: 8, fontSize: '0.88rem' }}
                  disabled={!cloud.ready}
                  onClick={async () => { setSignErr(null); try { await signInGoogle(); } catch (e) { setSignErr((e as Error).message); } }}
                >
                  <GoogleG /> Already have a space? Continue with Google
                </button>
              )}
              {signErr && <div className="tag-note" style={{ color: 'var(--danger)', textAlign: 'center' }}>{signErr}</div>}
              <div className="tag-note" style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-faint)' }}>
                🔒 Private by design — your data stays yours.
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
              <span className="lbl">Height — unlocks body-composition tracking</span>
              <Slider value={heightCm} onChange={setHeightCm} min={130} max={210} unit="cm" />
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
              <div className="card-title">Select everything that applies</div>
              <div className="chip-row">
                {['Knee pain', 'Lower-back pain', 'Shoulder pain', 'Neck pain', 'Hip pain',
                  'Ankle / foot', 'Elbow / wrist', 'High blood pressure', 'Diabetes', 'Asthma',
                  'None of these'].map((c) => (
                  <button key={c} className={`chip ${conditions.includes(c) ? 'on' : ''}`} onClick={() => toggleCondition(c)}>
                    {conditions.includes(c) ? '✓ ' : ''}{c}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="lbl">Anything else the coach should know — optional</span>
              <input className="input" value={conditionsNote} onChange={(e) => setConditionsNote(e.target.value)} placeholder="e.g. recovering from ACL surgery, 6 months ago" />
            </label>
            <Nav
              canNext={conditions.length > 0}
              onSkip={() => setConditions([])}
            />
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
            <Nav canNext={style !== null} onSkip={() => setStyle(null)} />
          </>
        )}

        {step === 4 && (
          <>
            <StepHead n={4} title={<>Set your <Grad>targets.</Grad></>} />
            <div className="card">
              <div className="card-title">Training days you can realistically commit per week</div>
              <Slider value={gymDays} onChange={setGymDays} min={1} max={7}
                format={(v) => `${v} day${v > 1 ? 's' : ''} / week`} />
              <div className="tag-note" style={{ marginTop: 4 }}>
                {gymDays <= 2 ? 'Two focused sessions still transform a body — the plan makes each one count.'
                  : gymDays <= 4 ? 'The sweet spot for most people — strength plus cardio with full recovery.'
                  : 'Ambitious! The coach will balance hard days with easy ones so you don\u2019t burn out.'}
              </div>
            </div>
            <div className="card">
              <div className="card-title">Target body weight — guides the fat-loss dashboard</div>
              <Slider value={targetWeightKg} onChange={(v) => { setTargetWeightKg(v); setTargetTouched(true); }}
                min={40} max={140} step={0.5} unit="kg"
                format={(v) => targetTouched ? `${v} kg` : 'slide to set (optional)'} />
            </div>
            <label className="field">
              <span className="lbl">In your own words, what are you chasing? — optional</span>
              <textarea className="textarea" rows={3} value={goalsNote} onChange={(e) => setGoalsNote(e.target.value)}
                placeholder="e.g. lose belly fat, run a 5K without stopping, get stronger without hurting my back" />
            </label>
            <Nav onSkip={() => { setTargetTouched(false); setGymDays(3); setGoalsNote(''); }} />
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

        {step > 0 && <Dots />}
      </div>
    </div>
  );
}
