import { useMemo, useRef, useState } from 'react';

// Chart series tokens — validated for the dark surface (#141a22):
// worst adjacent CVD ΔE 41.3, all ≥3:1 contrast, OKLCH L in dark band.
export const VIZ = {
  blue: '#3987e5',
  green: '#199e70',
  yellow: '#c98500',
  grid: '#2a3441',
  text: '#9aa7b4',
  faint: '#64748b',
};

export interface Pt {
  label: string; // x label (e.g. date)
  y: number;
}

function niceTicks(min: number, max: number): number[] {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const step = Math.pow(10, Math.floor(Math.log10(span / 2)));
  const err = span / 2 / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const s = mult * step;
  const lo = Math.ceil(min / s) * s;
  const ticks: number[] = [];
  for (let v = lo; v <= max + 1e-9; v += s) ticks.push(Math.round(v * 100) / 100);
  return ticks.slice(0, 5);
}

/** Tiny trend line for stat tiles — no axes, no tooltip (stat-tile exception). */
export function Sparkline({ data, color = VIZ.blue, w = 96, h = 30 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const px = (i: number) => 2 + (i / (data.length - 1)) * (w - 8);
  const py = (v: number) => h - 4 - ((v - min) / span) * (h - 8);
  const d = data.map((v, i) => `${px(i)},${py(v)}`).join(' ');
  const last = data[data.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(data.length - 1)} cy={py(last)} r={3} fill={color} />
    </svg>
  );
}

/**
 * Single-series line chart with grid, ticks, crosshair tooltip and
 * an accessible fallback (title + values via tooltip).
 */
export function LineChart({
  points, color = VIZ.blue, unit = '', height = 150, targetY, targetLabel,
}: {
  points: Pt[];
  color?: string;
  unit?: string;
  height?: number;
  targetY?: number;
  targetLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const W = 340, H = height, padL = 34, padR = 10, padT = 12, padB = 20;

  const { ticks, px, py } = useMemo(() => {
    const ys = points.map((p) => p.y);
    let min = Math.min(...ys, targetY ?? Infinity);
    let max = Math.max(...ys, targetY ?? -Infinity);
    if (min === max) { min -= 1; max += 1; }
    const pad = (max - min) * 0.12;
    min -= pad; max += pad;
    const ticks = niceTicks(min, max);
    const px = (i: number) => padL + (points.length === 1 ? 0.5 : i / (points.length - 1)) * (W - padL - padR);
    const py = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
    return { ticks, px, py };
  }, [points, targetY, H]);

  if (points.length === 0) return <div className="empty">No data yet.</div>;

  const move = (e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bd = Infinity;
    points.forEach((_, i) => { const d = Math.abs(px(i) - x); if (d < bd) { bd = d; best = i; } });
    setHover(best);
  };

  const hp = hover != null ? points[hover] : null;

  return (
    <svg
      ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', touchAction: 'pan-y' }}
      onPointerMove={move} onPointerLeave={() => setHover(null)}
      role="img" aria-label={points.map((p) => `${p.label}: ${p.y}${unit}`).join(', ')}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={py(t)} y2={py(t)} stroke={VIZ.grid} strokeWidth={1} />
          <text x={padL - 5} y={py(t) + 3} textAnchor="end" fontSize={9} fill={VIZ.faint}>{t}</text>
        </g>
      ))}
      {targetY != null && (
        <g>
          <line x1={padL} x2={W - padR} y1={py(targetY)} y2={py(targetY)} stroke={VIZ.yellow} strokeWidth={1.5} strokeDasharray="5 4" />
          {targetLabel && <text x={W - padR} y={py(targetY) - 4} textAnchor="end" fontSize={9} fill={VIZ.yellow}>{targetLabel}</text>}
        </g>
      )}
      <polyline
        points={points.map((p, i) => `${px(i)},${py(p.y)}`).join(' ')}
        fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
      {points.length <= 20 && points.map((p, i) => (
        <circle key={i} cx={px(i)} cy={py(p.y)} r={hover === i ? 4 : 2.5} fill={color} stroke="#141a22" strokeWidth={hover === i ? 2 : 0} />
      ))}
      {/* first/last x labels only — recessive axis */}
      <text x={padL} y={H - 6} fontSize={9} fill={VIZ.faint}>{points[0].label}</text>
      <text x={W - padR} y={H - 6} textAnchor="end" fontSize={9} fill={VIZ.faint}>{points[points.length - 1].label}</text>

      {hp && hover != null && (
        <g pointerEvents="none">
          <line x1={px(hover)} x2={px(hover)} y1={padT} y2={H - padB} stroke={VIZ.text} strokeWidth={1} strokeDasharray="2 3" />
          <Tooltip x={px(hover)} y={py(hp.y) - 10} W={W} lines={[`${hp.label}`, `${hp.y}${unit}`]} />
        </g>
      )}
    </svg>
  );
}

/** Grouped bar chart, ≤3 series, 2px gaps, rounded data ends, per-bar tooltip. */
export function BarChart({
  data, series, colors = [VIZ.blue, VIZ.green, VIZ.yellow], unit = '', height = 150, stacked = false,
}: {
  data: { label: string; values: number[] }[];
  series: string[];
  colors?: string[];
  unit?: string;
  height?: number;
  stacked?: boolean;
}) {
  const [hover, setHover] = useState<{ g: number; s: number } | null>(null);
  const W = 340, H = height, padL = 30, padR = 8, padT = 12, padB = 20;

  const maxV = Math.max(
    1,
    ...data.map((d) => (stacked ? d.values.reduce((a, b) => a + b, 0) : Math.max(...d.values))),
  );
  const ticks = niceTicks(0, maxV);
  const py = (v: number) => padT + (1 - v / (ticks[ticks.length - 1] ?? maxV)) * (H - padT - padB);
  const groupW = (W - padL - padR) / data.length;

  if (data.length === 0) return <div className="empty">No data yet.</div>;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
        aria-label={data.map((d) => `${d.label}: ${d.values.join('/')}`).join(', ')}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={py(t)} y2={py(t)} stroke={VIZ.grid} strokeWidth={1} />
            <text x={padL - 4} y={py(t) + 3} textAnchor="end" fontSize={9} fill={VIZ.faint}>{t}</text>
          </g>
        ))}
        {data.map((d, gi) => {
          const gx = padL + gi * groupW;
          const n = stacked ? 1 : d.values.length;
          const bw = Math.min(18, (groupW - 8) / n - 2);
          let stackY = py(0);
          return (
            <g key={gi}>
              {d.values.map((v, si) => {
                const x = stacked
                  ? gx + groupW / 2 - bw / 2
                  : gx + groupW / 2 - ((bw + 2) * n) / 2 + si * (bw + 2) + 1;
                let y0: number, y1: number;
                if (stacked) {
                  y1 = stackY;
                  y0 = y1 - (py(0) - py(v));
                  stackY = y0 - 2; // 2px surface gap between segments
                } else {
                  y0 = py(v);
                  y1 = py(0);
                }
                const h = Math.max(0, y1 - y0);
                const isH = hover?.g === gi && hover?.s === si;
                return (
                  <g key={si}>
                    <rect
                      x={x} y={y0} width={bw} height={h} rx={3}
                      fill={colors[si]} opacity={hover && !isH ? 0.55 : 1}
                      onPointerEnter={() => setHover({ g: gi, s: si })}
                      onPointerLeave={() => setHover(null)}
                    />
                  </g>
                );
              })}
              {(gi === 0 || gi === data.length - 1 || data.length <= 6) && (
                <text x={gx + groupW / 2} y={H - 6} textAnchor="middle" fontSize={8.5} fill={VIZ.faint}>{d.label}</text>
              )}
            </g>
          );
        })}
        {hover && (
          <Tooltip
            x={padL + hover.g * groupW + groupW / 2}
            y={py(stacked ? data[hover.g].values.reduce((a, b) => a + b, 0) : data[hover.g].values[hover.s]) - 8}
            W={W}
            lines={[`${data[hover.g].label}`, `${series[hover.s]}: ${Math.round(data[hover.g].values[hover.s] * 10) / 10}${unit}`]}
          />
        )}
      </svg>
      {series.length >= 2 && (
        <div className="row" style={{ gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
          {series.map((s, i) => (
            <span key={s} className="row" style={{ gap: 5, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: colors[i], display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Tooltip({ x, y, W, lines }: { x: number; y: number; W: number; lines: string[] }) {
  const w = Math.max(...lines.map((l) => l.length)) * 5.4 + 12;
  const tx = Math.min(Math.max(x - w / 2, 2), W - w - 2);
  const ty = Math.max(y - 14 * lines.length - 8, 2);
  return (
    <g pointerEvents="none">
      <rect x={tx} y={ty} width={w} height={lines.length * 13 + 8} rx={5} fill="#26303d" stroke="#3a4654" strokeWidth={1} />
      {lines.map((l, i) => (
        <text key={i} x={tx + 6} y={ty + 13 + i * 13} fontSize={9.5} fill={i === 0 ? '#9aa7b4' : '#e8edf2'} fontWeight={i === 0 ? 400 : 600}>
          {l}
        </text>
      ))}
    </g>
  );
}
