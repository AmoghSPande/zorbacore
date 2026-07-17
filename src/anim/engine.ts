// Skeletal SVG animation engine.
// An animation = a list of poses (named 2D joint positions) that the renderer
// interpolates between. ViewBox is 0 0 200 140; floor sits at y=120; figures
// are drawn in side view facing right.

export type Pt = [number, number];

/** Named joint/prop anchor positions. Well-known keys drawn as the figure:
 * head, shoulder, hip, kneeR/ankleR/toeR, kneeL/ankleL/toeL,
 * elbowR/wristR, elbowL/wristL. Any other key (e.g. "bar") is a prop anchor. */
export type Pose = Record<string, Pt>;

export type PropDef =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; r?: number }
  | { kind: 'plate'; at: string; r?: number } // barbell viewed from the side
  | { kind: 'db'; at: string } // dumbbell at a joint
  | { kind: 'kb'; at: string } // club/mudgal head at a joint
  | { kind: 'cable'; from: Pt; to: string }
  | { kind: 'line'; from: string | Pt; to: string | Pt; w?: number; tone?: 'danger' }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'circle'; at: string | Pt; r: number; tone?: 'danger'; fill?: boolean; bg?: boolean };

/** Tiny cartoon face drawn inside the head circle (landing-page hero scenes). */
export interface FaceDef {
  /** which way the face points: side view facing right, lying face-up, or toward the viewer */
  view: 'right' | 'up' | 'front';
  /** grr: cute angry game-face · zen: closed eyes + soft smile · joy: wide eyes + big smile */
  mood: 'grr' | 'zen' | 'joy';
}

export interface AnimDef {
  frames: Pose[];
  /** pingpong: 0→1→0 with easing (reps). cycle: wrap around (gait). */
  mode?: 'pingpong' | 'cycle';
  /** ms for a full loop */
  duration?: number;
  props?: PropDef[];
  /** hide the floor line (e.g. floor-lying drills draw their own mat) */
  noFloor?: boolean;
  face?: FaceDef;
}

export function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Interpolate the pose for global phase p in [0,1). */
export function poseAt(def: AnimDef, phase: number): Pose {
  // normalize into [0,1) — rAF timestamps can lag the effect's start time
  const p = ((phase % 1) + 1) % 1;
  const frames = def.frames;
  if (frames.length === 1) return frames[0];
  const mode = def.mode ?? 'pingpong';

  let fIdx: number;
  let localT: number;
  if (mode === 'cycle') {
    const seg = p * frames.length;
    fIdx = Math.floor(seg) % frames.length;
    localT = seg - Math.floor(seg);
  } else {
    // pingpong across the frame list with a brief hold at each end
    const HOLD = 0.08;
    let q = p * 2; // 0..2
    if (q > 1) q = 2 - q; // 0..1..0
    q = Math.min(Math.max((q - HOLD) / (1 - 2 * HOLD), 0), 1);
    const seg = q * (frames.length - 1);
    fIdx = Math.min(Math.floor(seg), frames.length - 2);
    localT = easeInOut(seg - fIdx);
  }
  const a = frames[fIdx];
  const b = frames[(fIdx + 1) % frames.length];
  const out: Pose = {};
  for (const k of Object.keys(a)) {
    out[k] = b[k] ? lerpPt(a[k], b[k], localT) : a[k];
  }
  return out;
}

export function resolve(pose: Pose, ref: string | Pt): Pt {
  if (typeof ref === 'string') return pose[ref] ?? [0, 0];
  return ref;
}
