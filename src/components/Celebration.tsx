import { useMemo } from 'react';

const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#c084fc', '#fb7185', '#22d3ee'];

/** Confetti burst for PR moments — pure CSS, ~2.4s, non-interactive. */
export default function Celebration() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.6 + Math.random() * 1.1,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
        drift: (Math.random() - 0.5) * 140,
        spin: 360 + Math.random() * 540,
      })),
    [],
  );
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: -16,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.55),
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            animation: `confetti-fall ${p.duration}s ${p.delay}s cubic-bezier(0.25, 0.8, 0.6, 1) forwards`,
            ['--drift' as string]: `${p.drift}px`,
            ['--spin' as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
