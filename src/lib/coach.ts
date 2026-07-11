import type { Exercise, TrainingStyle, WorkoutType } from '../types';

export const STYLES: Record<TrainingStyle, { label: string; emoji: string; desc: string; dayA: string; dayB: string }> = {
  hybrid: {
    label: 'Hybrid athlete', emoji: '⚡',
    desc: 'Strength + running + mobility. Lean, strong, durable.',
    dayA: 'Day 1 · Full Body Strength + Core',
    dayB: 'Day 3 · Strength + Conditioning',
  },
  trek: {
    label: 'Trek expedition prep', emoji: '🏔️',
    desc: 'Legs, carries, incline endurance — built for long days on the trail.',
    dayA: 'Trail Strength + Core',
    dayB: 'Endurance + Carries',
  },
  bodybuilding: {
    label: 'Bodybuilding + functional', emoji: '💪',
    desc: 'Classic muscle building with carries and real-world strength.',
    dayA: 'Upper Body',
    dayB: 'Lower Body + Functional',
  },
  bodyweight: {
    label: 'Bodyweight', emoji: '🤸',
    desc: 'No equipment needed — strength and conditioning anywhere.',
    dayA: 'Full Body Push + Core',
    dayB: 'Full Body + Conditioning',
  },
  yoga: {
    label: 'Yoga & flexibility', emoji: '🧘',
    desc: 'Flows, balance and deep mobility. Strength through stillness.',
    dayA: 'Morning Flow',
    dayB: 'Strength & Balance Flow',
  },
  senior: {
    label: 'Senior / gentle fitness', emoji: '🌿',
    desc: 'Strength, balance and mobility for staying active and independent.',
    dayA: 'Strength & Balance',
    dayB: 'Mobility & Endurance',
  },
};

export interface Symptoms {
  knee: number; // 1-10 discomfort
  back: number; // 1-10 stiffness
  energy: number; // 1-10 (10 = fresh)
}

export interface PlannedBlock {
  exerciseId: string;
  sets: number;
  reps: string; // display target, e.g. "8–12" or "30–45s"
  note?: string;
  section: 'warmup' | 'strength' | 'core' | 'conditioning';
  /** smallest time budget that includes this block: 1=30min, 2=45, 3=60, 4=90 */
  tier: 1 | 2 | 3 | 4;
}

export interface SessionPlan {
  type: WorkoutType;
  title: string;
  blocks: PlannedBlock[];
  adaptations: string[];
  estMinutes: number;
}

export interface SessionOptions {
  /** available time today; sessions are composed to fit (default 60) */
  minutes?: number;
  /** days since the last gym session — long gaps ease the plan back in */
  gapDays?: number;
}

/**
 * Symptom-driven exercise substitution. Returns the exercise to actually do
 * plus a human-readable note when a swap happened.
 */
export function applyGates(
  exerciseId: string,
  s: Symptoms,
): { exerciseId: string; swap?: string } {
  const knee = s.knee ?? 1;
  const back = s.back ?? 1;

  const kneeSwaps: Record<string, string> = {
    'barbell-back-squat': 'box-squat',
    'dumbbell-split-squat': 'dumbbell-step-up',
    'rfe-split-squat': 'dumbbell-step-up',
    'leg-extension': 'seated-leg-curl',
    'treadmill-sprint': 'spin-bike-intervals',
    'tyre-flip': 'tyre-push',
    'reverse-lunge': 'sit-to-stand',
    'bodyweight-squat': 'sit-to-stand',
    'burpee': 'mountain-climber',
    'chair-pose': 'glute-bridge',
  };
  const kneeSwapsSevere: Record<string, string> = {
    'barbell-back-squat': 'barbell-hip-thrust',
    'box-squat': 'barbell-hip-thrust',
    'goblet-squat': 'glute-bridge',
    'dumbbell-step-up': 'seated-leg-curl',
    'dumbbell-split-squat': 'seated-leg-curl',
    'rfe-split-squat': 'seated-leg-curl',
    'leg-extension': 'seated-leg-curl',
    'treadmill-sprint': 'spin-bike-z2',
    'tyre-flip': 'tyre-push',
    'reverse-lunge': 'glute-bridge',
    'bodyweight-squat': 'glute-bridge',
    'burpee': 'march-in-place',
    'mountain-climber': 'march-in-place',
    'chair-pose': 'glute-bridge',
    'sit-to-stand': 'glute-bridge',
  };
  const backSwaps: Record<string, string> = {
    'barbell-deadlift': 'dumbbell-rdl',
    'barbell-rdl': 'dumbbell-rdl',
    'barbell-row': 'chest-supported-db-row',
    'overhead-press': 'seated-db-shoulder-press',
    'tyre-flip': 'tyre-push',
    'barbell-back-squat': 'goblet-squat',
  };
  const backSwapsSevere: Record<string, string> = {
    'barbell-deadlift': 'cable-pull-through',
    'barbell-rdl': 'cable-pull-through',
    'dumbbell-rdl': 'glute-bridge',
    'barbell-row': 'chest-supported-db-row',
    'overhead-press': 'seated-db-shoulder-press',
    'seated-cable-row': 'chest-supported-db-row',
    'barbell-back-squat': 'glute-bridge',
    'box-squat': 'glute-bridge',
    'goblet-squat': 'glute-bridge',
    'barbell-hip-thrust': 'glute-bridge',
    'tyre-flip': 'tyre-push',
    'barbell-curl': 'machine-bicep-curl',
  };

  let id = exerciseId;
  let swap: string | undefined;

  if (back >= 7 && backSwapsSevere[id]) {
    swap = `back ${back}/10`;
    id = backSwapsSevere[id];
  } else if (back >= 5 && backSwaps[id]) {
    swap = `back ${back}/10`;
    id = backSwaps[id];
  }
  if (s.knee >= 7 && kneeSwapsSevere[id]) {
    swap = swap ? `${swap} + knee ${knee}/10` : `knee ${knee}/10`;
    id = kneeSwapsSevere[id];
  } else if (s.knee >= 4 && kneeSwaps[id]) {
    swap = swap ? `${swap} + knee ${knee}/10` : `knee ${knee}/10`;
    id = kneeSwaps[id];
  }
  return { exerciseId: id, swap };
}

function b(
  section: PlannedBlock['section'], exerciseId: string, sets: number, reps: string,
  note?: string, tier: PlannedBlock['tier'] = 3,
): PlannedBlock {
  return { section, exerciseId, sets, reps, note, tier };
}

/** Rough time cost of a block (minutes), including rests. */
function blockMinutes(blk: PlannedBlock): number {
  const superset = blk.note?.toLowerCase().includes('superset') ? 0.62 : 1;
  switch (blk.section) {
    case 'warmup': return blk.sets * 1.5;
    case 'strength': return blk.sets * 2.6 * superset;
    case 'core': return blk.sets * 1.3;
    case 'conditioning': return blk.sets * 1.8 + 2;
  }
}

export function estimateMinutes(blocks: PlannedBlock[]): number {
  return Math.round(blocks.reduce((m, blk) => m + blockMinutes(blk), 3)); // +3 setup/transition
}

/** Style-specific templates for the two gym-day slots. */
function styleBlocks(style: TrainingStyle, type: WorkoutType): PlannedBlock[] {
  const A = type === 'strength-core';
  switch (style) {
    case 'trek':
      return A
        ? [
            b('warmup', 'glute-bridge', 2, '12 + 2s squeeze', 'Turn the glutes on', 1),
            b('warmup', 'ankle-rock', 1, '10/side', 'Ankles carry the trail', 2),
            b('strength', 'dumbbell-step-up', 3, '8–10/leg', 'The trek movement', 1),
            b('strength', 'box-squat', 3, '6–10', 'Leg strength, knee-safe', 1),
            b('strength', 'dumbbell-rdl', 3, '8–10', 'Hinge for the pack', 1),
            b('strength', 'step-down', 2, '6/leg slow', 'Downhill protection', 2),
            b('strength', 'dumbbell-calf-raise', 3, '12–15', 'Ascent engine', 2),
            b('strength', 'seated-cable-row', 3, '10–12', 'Pack-carrying back', 3),
            b('core', 'mcgill-curl-up', 2, '10s holds ×5', 'Trail-proof core', 1),
            b('core', 'side-plank', 2, '10s ×3 per side', undefined, 2),
            b('conditioning', 'farmers-carry', 3, '40m', 'Loaded walking = trekking', 1),
            b('conditioning', 'tyre-push', 3, '20s hard / 90s rest', undefined, 3),
          ]
        : [
            b('warmup', 'glute-bridge', 2, '12', undefined, 1),
            b('warmup', 'hip-flexor-stretch', 1, '30s/side', undefined, 2),
            b('strength', 'dumbbell-rdl', 3, '8–10', 'Posterior chain', 1),
            b('strength', 'dumbbell-split-squat', 3, '8/leg', 'Single-leg stamina', 2),
            b('strength', 'seated-db-shoulder-press', 3, '8–12', 'Lifting the pack', 2),
            b('strength', 'dumbbell-calf-raise', 2, '15', undefined, 3),
            b('core', 'bird-dog', 2, '10s ×5 per side', undefined, 2),
            b('conditioning', 'treadmill-incline-walk', 1, '20–40 min · 8–12%', 'The trek simulator — weighted backpack optional', 1),
            b('conditioning', 'farmers-carry', 3, '40m', undefined, 1),
            b('conditioning', 'suitcase-carry', 2, '30m/side', 'Uneven-load core', 3),
          ];
    case 'bodybuilding':
      return A
        ? [
            b('warmup', 'mudgal-halo', 1, '5/direction', 'Shoulders first', 1),
            b('warmup', 'cat-cow', 1, '8 slow reps', undefined, 2),
            b('strength', 'dumbbell-bench-press', 3, '8–12', 'Superset with the row ↓', 1),
            b('strength', 'seated-cable-row', 3, '10–12', 'Superset with the press ↑', 1),
            b('strength', 'lat-pulldown', 3, '8–12', undefined, 1),
            b('strength', 'seated-db-shoulder-press', 3, '8–12', undefined, 2),
            b('strength', 'machine-chest-fly', 2, '12–15', 'Stretch + squeeze', 3),
            b('strength', 'lateral-raise', 3, '12–15', 'Shoulder width', 2),
            b('strength', 'machine-bicep-curl', 3, '10–15', undefined, 1),
            b('strength', 'cable-tricep-pushdown', 3, '12–15', undefined, 2),
            b('strength', 'incline-db-curl', 2, '10–12', 'Stretch-position biceps', 4),
            b('strength', 'seated-oh-tricep-extension', 2, '10–12', undefined, 4),
            b('strength', 'face-pull', 2, '12–15', 'Rear delts + posture', 3),
            b('strength', 'dumbbell-shrug', 2, '12–15', undefined, 4),
            b('core', 'front-plank', 2, '30s', undefined, 3),
          ]
        : [
            b('warmup', 'glute-bridge', 2, '12 + 2s squeeze', undefined, 1),
            b('warmup', 'ankle-rock', 1, '10/side', undefined, 2),
            b('strength', 'barbell-back-squat', 3, '6–10', 'The builder', 1),
            b('strength', 'barbell-rdl', 3, '8–10', 'Hamstrings + glutes', 1),
            b('strength', 'barbell-hip-thrust', 3, '8–12', 'Glute isolation-ish', 2),
            b('strength', 'seated-leg-curl', 3, '10–12', undefined, 2),
            b('strength', 'leg-extension', 2, '12–15 top-range', 'Light, controlled', 3),
            b('strength', 'dumbbell-calf-raise', 3, '12–15', undefined, 2),
            b('strength', 'rfe-split-squat', 2, '8/leg', 'Finisher', 4),
            b('core', 'pallof-press', 2, '8/side', undefined, 3),
            b('conditioning', 'farmers-carry', 2, '40m', 'The functional bit', 3),
            b('conditioning', 'tyre-push', 3, '20s hard / 90s rest', undefined, 4),
          ];
    case 'bodyweight':
      return A
        ? [
            b('warmup', 'cat-cow', 1, '8 slow reps', undefined, 1),
            b('warmup', 'glute-bridge', 2, '12', undefined, 1),
            b('strength', 'bodyweight-squat', 3, '12–20', 'Slow and deep as comfortable', 1),
            b('strength', 'push-up', 3, 'max −2 reps', 'Bench incline if needed', 1),
            b('strength', 'reverse-lunge', 3, '8–12/leg', undefined, 2),
            b('strength', 'single-leg-glute-bridge', 3, '10/side', 'Glute priority', 1),
            b('strength', 'wall-sit', 2, '20–45s', undefined, 2),
            b('strength', 'superman-hold', 2, '8×5s', 'Back line', 3),
            b('core', 'mcgill-curl-up', 2, '10s holds ×5', undefined, 1),
            b('core', 'front-plank', 2, '20–40s', undefined, 2),
            b('conditioning', 'mountain-climber', 3, '20s', undefined, 3),
            b('conditioning', 'burpee', 3, '8–10', 'Step-back style', 4),
          ]
        : [
            b('warmup', 'cat-cow', 1, '8 slow reps', undefined, 1),
            b('warmup', 'hip-flexor-stretch', 1, '30s/side', undefined, 2),
            b('strength', 'reverse-lunge', 3, '10/leg', undefined, 1),
            b('strength', 'incline-push-up', 3, '10–15', 'Or harder push-up variation', 1),
            b('strength', 'bodyweight-squat', 3, '15–20', '3s lowering', 2),
            b('strength', 'wall-sit', 2, '30s', undefined, 3),
            b('strength', 'superman-hold', 2, '8×5s', undefined, 2),
            b('core', 'dead-bug', 2, '8/side', undefined, 1),
            b('core', 'side-plank', 2, '10s ×3 per side', undefined, 2),
            b('conditioning', 'mountain-climber', 3, '20s', undefined, 2),
            b('conditioning', 'burpee', 3, '8–10', undefined, 3),
            b('conditioning', 'march-in-place', 1, '3 min brisk', 'Cool-down cardio', 4),
          ];
    case 'yoga':
      return A
        ? [
            b('warmup', 'cat-cow', 1, '10 slow breaths', 'Arrive on the mat', 1),
            b('strength', 'surya-namaskar', 4, 'rounds, breath-led', 'The spine of the practice', 1),
            b('strength', 'downward-dog', 2, '5 breaths', undefined, 1),
            b('strength', 'cobra-pose', 2, '5 breaths', undefined, 2),
            b('strength', 'warrior-2', 2, '5 breaths/side', undefined, 2),
            b('strength', 'triangle-pose', 2, '5 breaths/side', undefined, 3),
            b('strength', 'tree-pose', 2, '30s/side', undefined, 2),
            b('strength', 'standing-forward-fold', 2, '8 breaths', undefined, 3),
            b('core', 'child-pose', 1, '10 slow breaths', 'Seal the practice', 1),
          ]
        : [
            b('warmup', 'cat-cow', 1, '8 slow breaths', undefined, 1),
            b('strength', 'chair-pose', 3, '20–40s', 'Strength through stillness', 1),
            b('strength', 'warrior-2', 3, '5 breaths/side', undefined, 1),
            b('strength', 'tree-pose', 3, '30s/side', 'Balance work', 1),
            b('strength', 'single-leg-stand', 2, '30s/side', 'Eyes soft', 2),
            b('strength', 'bodyweight-squat', 2, '10 slow', 'Moving strength', 3),
            b('strength', 'downward-dog', 2, '5 breaths', undefined, 2),
            b('strength', 'pigeon-stretch', 2, '45s/side', undefined, 2),
            b('core', 'child-pose', 1, '10 breaths', undefined, 1),
          ];
    case 'senior':
      return A
        ? [
            b('warmup', 'march-in-place', 1, '2 min easy', 'Gentle warm-up', 1),
            b('warmup', 'cat-cow', 1, '6 slow reps', 'Chair version is fine', 2),
            b('strength', 'sit-to-stand', 3, '8–12', 'The independence exercise', 1),
            b('strength', 'wall-push-up', 3, '8–12', undefined, 1),
            b('strength', 'standing-side-leg-raise', 2, '10–15/side', 'Steady hips', 1),
            b('strength', 'dumbbell-calf-raise', 2, '10–12', 'Hold a support', 2),
            b('strength', 'hammer-curl', 2, '10–12 light', undefined, 3),
            b('core', 'single-leg-stand', 3, 'up to 30s/side', 'Balance = fall-proofing', 1),
            b('core', 'bird-dog', 2, '5/side slow', undefined, 2),
          ]
        : [
            b('warmup', 'march-in-place', 1, '2 min easy', undefined, 1),
            b('strength', 'sit-to-stand', 2, '8–10', undefined, 1),
            b('strength', 'glute-bridge', 2, '10 + 2s squeeze', undefined, 1),
            b('strength', 'wall-push-up', 2, '8–10', undefined, 2),
            b('strength', 'active-slr', 2, '8/side', undefined, 2),
            b('strength', 'open-book', 1, '6/side', undefined, 3),
            b('strength', 'calf-stretch', 1, '30s/side', undefined, 3),
            b('core', 'single-leg-stand', 2, 'up to 30s/side', undefined, 1),
            b('conditioning', 'treadmill-incline-walk', 1, '15–30 min gentle', 'Or a brisk outdoor walk', 2),
          ];
    default:
      return [];
  }
}

/** Build a session plan for a workout type, adapted to style, today's symptoms, time and layoff. */
export function buildSession(type: WorkoutType, s: Symptoms, opts: SessionOptions = {}, style: TrainingStyle = 'hybrid'): SessionPlan {
  const minutes = opts.minutes ?? 60;
  const gapDays = opts.gapDays ?? 0;
  const tierCap: PlannedBlock['tier'] = minutes >= 90 ? 4 : minutes >= 60 ? 3 : minutes >= 45 ? 2 : 1;
  const adaptations: string[] = [];
  let title = '';
  let blocks: PlannedBlock[] = [];

  if ((type === 'strength-core' || type === 'strength-conditioning') && style !== 'hybrid') {
    title = type === 'strength-core' ? STYLES[style].dayA : STYLES[style].dayB;
    blocks = styleBlocks(style, type);
  } else if (type === 'strength-core') {
    title = 'Day 1 · Full Body Strength + Core';
    blocks = [
      b('warmup', 'glute-bridge', 2, '12 + 2s squeeze', 'Turn the glutes on', 1),
      b('warmup', 'cat-cow', 1, '8 slow reps', 'Wake the spine up', 2),
      b('warmup', 'ankle-rock', 1, '10/side', 'Prep the knee', 3),
      b('strength', 'barbell-back-squat', 3, '6–10', 'Main squat pattern', 1),
      b('strength', 'dumbbell-bench-press', 3, '8–12', 'Superset with the row ↓', 1),
      b('strength', 'seated-cable-row', 3, '10–12', 'Superset with the press ↑', 1),
      b('strength', 'barbell-rdl', 3, '8–10', 'Glute + hamstring priority', 2),
      b('strength', 'barbell-hip-thrust', 3, '8–12', 'Glute priority #1', 1),
      b('strength', 'machine-bicep-curl', 3, '10–15', 'Bicep volume', 2),
      b('strength', 'cable-pull-through', 2, '12–15', 'Bonus glute volume', 4),
      b('strength', 'face-pull', 2, '12–15', 'Posture insurance', 4),
      b('core', 'mcgill-curl-up', 2, '10s holds ×5', 'McGill Big 3', 1),
      b('core', 'bird-dog', 2, '10s ×5 per side', 'McGill Big 3', 2),
      b('core', 'side-plank', 2, '10s ×3 per side', 'McGill Big 3', 3),
    ];
  } else if (type === 'strength-conditioning') {
    title = 'Day 3 · Strength + Conditioning';
    blocks = [
      b('warmup', 'glute-bridge', 2, '12 + 2s squeeze', 'Wake the glutes before hinging', 1),
      b('warmup', 'cat-cow', 1, '8 slow reps', undefined, 2),
      b('warmup', 'hip-flexor-stretch', 1, '30s/side', 'Undo the desk', 3),
      b('strength', 'barbell-deadlift', 3, '4–6', 'Main hinge — crisp reps only', 1),
      b('strength', 'seated-db-shoulder-press', 3, '8–12', 'Superset with the pulldown ↓', 1),
      b('strength', 'lat-pulldown', 3, '8–12', 'Superset with the press ↑', 1),
      b('strength', 'dumbbell-step-up', 3, '8–10/leg', 'Single-leg + glutes', 2),
      b('strength', 'hammer-curl', 3, '10–12', 'Bicep width', 2),
      b('strength', 'cable-tricep-pushdown', 2, '12–15', 'Arm balance', 3),
      b('strength', 'machine-bicep-curl', 2, '12–15', 'Bonus bicep volume', 4),
      b('core', 'pallof-press', 2, '8/side', 'Anti-rotation', 2),
      b('conditioning', 'suitcase-carry', 2, '30m/side', 'Core wall + grip', 3),
      b('conditioning', 'tyre-push', 4, '20s hard / 90s rest', 'Engine work, zero impact', 3),
      b('conditioning', 'spin-bike-z2', 1, '12–15 min easy spin', 'Extra engine, zero impact', 4),
    ];
  } else if (type === 'mobility') {
    title = 'Mobility Session';
    blocks = [
      b('warmup', 'cat-cow', 1, '10 slow reps'),
      b('strength', 'hip-flexor-stretch', 1, '45s/side'),
      b('strength', 'ninety-ninety', 1, '8 switches'),
      b('strength', 'bench-tspine-extension', 1, '6 breaths ×2'),
      b('strength', 'open-book', 1, '8/side'),
      b('strength', 'active-slr', 1, '10/side'),
      b('strength', 'pigeon-stretch', 1, '45s/side'),
      b('core', 'child-pose', 1, '8 breaths'),
    ];
  } else {
    title = 'Custom Workout';
    blocks = [];
  }

  // fit the available time
  if (type === 'strength-core' || type === 'strength-conditioning') {
    blocks = blocks.filter((blk) => blk.tier <= tierCap);
    if (minutes < 45) {
      blocks = blocks.map((blk) =>
        blk.section === 'strength' && blk.sets > 2 ? { ...blk, sets: 2 } : blk,
      );
      adaptations.push(`${minutes}-minute session: essentials only — the main lift, one push–pull superset and glute work. Move briskly, rest ~90s.`);
    } else if (minutes < 60) {
      adaptations.push(`${minutes}-minute session: accessories trimmed, priorities kept. Supersets keep it moving.`);
    } else if (minutes >= 90) {
      adaptations.push('90-minute session: bonus glute/arm volume and extra conditioning added. Don\'t rush the rests.');
    }
  }

  // ease back in after a layoff
  if (gapDays >= 10 && (type === 'strength-core' || type === 'strength-conditioning')) {
    blocks = blocks.map((blk) =>
      blk.section === 'strength' && blk.sets > 2 ? { ...blk, sets: 2 } : blk,
    );
    blocks = blocks.filter((blk) => blk.section !== 'conditioning');
    adaptations.push(`First session after ~${gapDays} days off: volume trimmed and conditioning dropped. Use the suggested (lighter) loads — soreness now would cost you the next session.`);
  } else if (gapDays >= 4) {
    adaptations.push(`${gapDays}-day gap — no problem. Normal plan, but leave 2 reps in the tank on everything; don't chase soreness.`);
  }

  // symptom gates
  const gated: PlannedBlock[] = [];
  for (const blk of blocks) {
    const { exerciseId, swap } = applyGates(blk.exerciseId, s);
    if (swap && exerciseId !== blk.exerciseId) {
      adaptations.push(`Swapped ${blk.exerciseId.replace(/-/g, ' ')} → ${exerciseId.replace(/-/g, ' ')} (${swap})`);
      gated.push({ ...blk, exerciseId, note: blk.note });
    } else {
      gated.push(blk);
    }
  }
  blocks = gated;

  // extra back care when stiff
  if (s.back >= 5 && type !== 'mobility') {
    if (!blocks.some((x) => x.exerciseId === 'mcgill-curl-up')) {
      blocks.push(b('core', 'mcgill-curl-up', 2, '8s holds ×5', 'Added: back is stiff today'));
      blocks.push(b('core', 'bird-dog', 2, '8s ×5 per side', 'Added: back is stiff today'));
      adaptations.push('Added McGill work — back stiffness ≥5/10.');
    }
    blocks.push(b('core', 'child-pose', 1, '8 breaths', 'Decompress to finish'));
  }

  // low energy → trim volume
  if (s.energy <= 4) {
    blocks = blocks.map((blk) =>
      blk.section === 'strength' && blk.sets > 2 ? { ...blk, sets: blk.sets - 1 } : blk,
    );
    blocks = blocks.filter((blk) => blk.section !== 'conditioning');
    adaptations.push('Reduced volume and dropped conditioning — energy is low. Quality over quantity today.');
  }

  return { type, title, blocks, adaptations, estMinutes: estimateMinutes(blocks) };
}

/** Alternatives for the swap picker: same primary muscle, respecting gates. */
export function alternativesFor(ex: Exercise, all: Exercise[], s: Symptoms): Exercise[] {
  return all
    .filter((e) => e.id !== ex.id)
    .filter((e) => e.muscles.some((m) => ex.muscles.includes(m)))
    .filter((e) => (s.knee >= 5 ? e.kneeRisk < 2 : true))
    .filter((e) => (s.back >= 5 ? e.backRisk < 2 : true))
    .sort((a, b) => (b.kneeTherapeutic || b.backTherapeutic ? 1 : 0) - (a.kneeTherapeutic || a.backTherapeutic ? 1 : 0))
    .slice(0, 8);
}
