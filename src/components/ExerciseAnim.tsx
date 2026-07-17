import { useEffect, useRef, useState } from 'react';
import { ANIMS } from '../anim/anims';
import { poseAt, resolve, type AnimDef, type FaceDef, type Pose, type Pt } from '../anim/engine';

const STROKE = '#e8edf2';
const FAR = '#64748b';
const PROP = '#3b82f6';
const ACCENT = '#34d399';
const DANGER = '#f87171'; // The Slump's color

const toneColor = (tone?: 'danger') => (tone === 'danger' ? DANGER : PROP);

function Limb({ pts, color, w = 4.5 }: { pts: (Pt | undefined)[]; color: string; w?: number }) {
  const valid = pts.filter(Boolean) as Pt[];
  if (valid.length < 2) return null;
  return (
    <polyline
      points={valid.map((p) => p.join(',')).join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Cute cartoon face inside the head circle. Offsets are relative to head center. */
function Face({ at, face }: { at: Pt; face: FaceDef }) {
  const [hx, hy] = at;
  const S = { stroke: STROKE, strokeWidth: 1.5, strokeLinecap: 'round' as const, fill: 'none' };
  if (face.view === 'front') {
    if (face.mood === 'zen') {
      return (
        <g {...S}>
          <line x1={hx - 3.2} y1={hy - 0.8} x2={hx - 1.2} y2={hy - 0.8} />
          <line x1={hx + 1.2} y1={hy - 0.8} x2={hx + 3.2} y2={hy - 0.8} />
          <path d={`M ${hx - 2.2} ${hy + 2.2} Q ${hx} ${hy + 3.8} ${hx + 2.2} ${hy + 2.2}`} />
        </g>
      );
    }
    if (face.mood === 'joy') {
      return (
        <g {...S}>
          <circle cx={hx - 2.2} cy={hy - 1} r={1} fill={STROKE} stroke="none" />
          <circle cx={hx + 2.2} cy={hy - 1} r={1} fill={STROKE} stroke="none" />
          <path d={`M ${hx - 2.6} ${hy + 1.6} Q ${hx} ${hy + 4.4} ${hx + 2.6} ${hy + 1.6}`} />
        </g>
      );
    }
    // grr, facing the viewer: angry brows slanting in, dot eyes
    return (
      <g {...S}>
        <line x1={hx - 3.6} y1={hy - 3.3} x2={hx - 1} y2={hy - 2} />
        <line x1={hx + 1} y1={hy - 2} x2={hx + 3.6} y2={hy - 3.3} />
        <circle cx={hx - 2.1} cy={hy - 0.2} r={0.9} fill={STROKE} stroke="none" />
        <circle cx={hx + 2.1} cy={hy - 0.2} r={0.9} fill={STROKE} stroke="none" />
      </g>
    );
  }
  if (face.view === 'up') {
    // lying face-up (bench): the 'right' face rotated to look at the ceiling
    return (
      <g {...S}>
        <line x1={hx - 3.9} y1={hy - 0.6} x2={hx - 2.3} y2={hy - 4.3} />
        <circle cx={hx - 0.9} cy={hy - 2.6} r={1} fill={STROKE} stroke="none" />
      </g>
    );
  }
  // side view facing right: one determined brow + eye
  return (
    <g {...S}>
      <line x1={hx + 0.6} y1={hy - 3.9} x2={hx + 4.3} y2={hy - 2.3} />
      <circle cx={hx + 2.6} cy={hy - 0.9} r={1} fill={STROKE} stroke="none" />
    </g>
  );
}

function Figure({ pose, face }: { pose: Pose; face?: FaceDef }) {
  const p = pose;
  return (
    <g>
      {/* far-side limbs first, dimmed */}
      <Limb pts={[p.hip, p.kneeL, p.ankleL, p.toeL]} color={FAR} />
      <Limb pts={[p.shoulder, p.elbowL, p.wristL]} color={FAR} w={4} />
      {/* trunk (optional midback point lets the spine flex, e.g. cat-cow) */}
      <Limb pts={[p.hip, p.midback, p.shoulder]} color={STROKE} w={5.5} />
      {/* head */}
      {p.head && <circle cx={p.head[0]} cy={p.head[1]} r={6.5} fill="none" stroke={STROKE} strokeWidth={4} />}
      {p.head && face && <Face at={p.head} face={face} />}
      {/* near-side limbs */}
      <Limb pts={[p.hip, p.kneeR, p.ankleR, p.toeR]} color={STROKE} />
      <Limb pts={[p.shoulder, p.elbowR, p.wristR]} color={STROKE} w={4} />
    </g>
  );
}

function Props({ def, pose }: { def: AnimDef; pose: Pose }) {
  return (
    <g>
      {(def.props ?? []).map((pr, i) => {
        switch (pr.kind) {
          case 'rect':
            return (
              <rect key={i} x={pr.x} y={pr.y} width={pr.w} height={pr.h} rx={pr.r ?? 2}
                fill="#26303d" stroke="#3a4654" strokeWidth={1.5} />
            );
          case 'plate': {
            const at = resolve(pose, pr.at);
            return (
              <g key={i}>
                <circle cx={at[0]} cy={at[1]} r={pr.r ?? 13} fill="#1c242f" stroke={PROP} strokeWidth={3} />
                <circle cx={at[0]} cy={at[1]} r={2.5} fill={PROP} />
              </g>
            );
          }
          case 'db': {
            const at = resolve(pose, pr.at);
            return (
              <g key={i} stroke={PROP} strokeWidth={3.5} strokeLinecap="round">
                <line x1={at[0] - 6} y1={at[1] - 4} x2={at[0] - 6} y2={at[1] + 4} />
                <line x1={at[0] + 6} y1={at[1] - 4} x2={at[0] + 6} y2={at[1] + 4} />
                <line x1={at[0] - 6} y1={at[1]} x2={at[0] + 6} y2={at[1]} strokeWidth={2.5} />
              </g>
            );
          }
          case 'kb': {
            const at = resolve(pose, pr.at);
            return <circle key={i} cx={at[0]} cy={at[1]} r={6} fill={PROP} opacity={0.9} />;
          }
          case 'cable': {
            const to = resolve(pose, pr.to);
            return (
              <g key={i}>
                <line x1={pr.from[0]} y1={pr.from[1]} x2={to[0]} y2={to[1]}
                  stroke={PROP} strokeWidth={2} strokeDasharray="1 4" strokeLinecap="round" />
                <circle cx={pr.from[0]} cy={pr.from[1]} r={3.5} fill={PROP} />
              </g>
            );
          }
          case 'line': {
            const a = resolve(pose, pr.from);
            const b = resolve(pose, pr.to);
            return (
              <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
                stroke={toneColor(pr.tone)} strokeWidth={pr.w ?? 3.5} strokeLinecap="round" />
            );
          }
          case 'ellipse':
            return (
              <ellipse key={i} cx={pr.cx} cy={pr.cy} rx={pr.rx} ry={pr.ry}
                fill="#1c242f" stroke={PROP} strokeWidth={3} />
            );
          case 'circle': {
            const at = resolve(pose, pr.at);
            const c = toneColor(pr.tone);
            if (pr.bg) return <circle key={i} cx={at[0]} cy={at[1]} r={pr.r} fill="#1c242f" stroke={c} strokeWidth={3} />;
            return pr.fill
              ? <circle key={i} cx={at[0]} cy={at[1]} r={pr.r} fill={c} />
              : <circle key={i} cx={at[0]} cy={at[1]} r={pr.r} fill="none" stroke={c} strokeWidth={3} />;
          }
        }
      })}
    </g>
  );
}

export default function ExerciseAnim({ animId, className }: { animId: string; className?: string }) {
  const def = ANIMS[animId];
  const [phase, setPhase] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!def) return;
    const dur = def.duration ?? 2600;
    const start = performance.now();
    const tick = (now: number) => {
      setPhase(((now - start) % dur) / dur);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [animId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!def) {
    return (
      <svg viewBox="0 0 200 140" className={className}>
        <circle cx={100} cy={55} r={10} fill="none" stroke={FAR} strokeWidth={4} />
        <line x1={100} y1={66} x2={100} y2={100} stroke={FAR} strokeWidth={5} strokeLinecap="round" />
        <text x={100} y={128} textAnchor="middle" fill={FAR} fontSize={10}>demo coming soon</text>
      </svg>
    );
  }

  const pose = poseAt(def, phase);
  return (
    <svg viewBox="0 0 200 140" className={className}>
      {!def.noFloor && <line x1={8} y1={120} x2={192} y2={120} stroke="#2a3441" strokeWidth={2.5} strokeLinecap="round" />}
      <Props def={def} pose={pose} />
      <Figure pose={pose} face={def.face} />
      <circle cx={188} cy={10} r={3} fill={ACCENT} opacity={0.35 + 0.65 * Math.sin(phase * Math.PI * 2) ** 2} />
    </svg>
  );
}
