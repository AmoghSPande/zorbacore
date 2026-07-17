import { useEffect, useRef, useState } from 'react';

/** Eases a number toward `value` with requestAnimationFrame — stats tick up instead of appearing. */
export function useCountUp(value: number, duration = 700): number {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = value;
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * eased;
      fromRef.current = v; // interrupted animations resume from here
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return shown;
}

export default function AnimatedNumber({ value, decimals = 0, duration }: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const shown = useCountUp(value, duration);
  return <>{shown.toFixed(decimals)}</>;
}
