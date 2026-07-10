import { useEffect, useState } from 'react';

/** 1–10 scale picker with color feedback (green→red or custom). */
export function Scale10({
  value, onChange, invert = false,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  /** invert: 10 is good (energy) instead of bad (pain) */
  invert?: boolean;
}) {
  const colorFor = (v: number) => {
    const bad = invert ? 11 - v : v;
    if (bad <= 3) return 'var(--accent)';
    if (bad <= 6) return 'var(--warn)';
    return 'var(--danger)';
  };
  return (
    <div className="scale10">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
        <button
          key={v}
          className={value === v ? 'sel' : ''}
          style={value === v ? { background: colorFor(v), borderColor: colorFor(v) } : {}}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/** Number stepper for fast, low-typing logging. */
export function Stepper({
  value, onChange, step = 2.5, min = 0, suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!Number.isNaN(n) && n >= min) onChange(n);
    else setText(String(value));
  };
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}>−</button>
      <input
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit((e.target as HTMLInputElement).value)}
        aria-label={suffix}
      />
      <button onClick={() => onChange(Math.round((value + step) * 100) / 100)}>+</button>
    </div>
  );
}

/** Rest timer that counts down after a set is logged. */
export function RestTimer({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const iv = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(iv);
          onDone?.();
          if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [seconds]); // eslint-disable-line react-hooks/exhaustive-deps
  const pct = (left / seconds) * 100;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className="row" style={{ gap: 10 }}>
      <div className="progressbar grow"><div style={{ width: `${pct}%`, background: left === 0 ? 'var(--accent)' : 'var(--run)' }} /></div>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.9rem', color: left === 0 ? 'var(--accent)' : 'var(--text-dim)' }}>
        {left === 0 ? 'GO' : `${mm}:${ss}`}
      </span>
    </div>
  );
}
