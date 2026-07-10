import type { Exercise, WorkoutType } from '../types';

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
}

export interface SessionPlan {
  type: WorkoutType;
  title: string;
  blocks: PlannedBlock[];
  adaptations: string[];
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

function b(section: PlannedBlock['section'], exerciseId: string, sets: number, reps: string, note?: string): PlannedBlock {
  return { section, exerciseId, sets, reps, note };
}

/** Build a session plan for a workout type, adapted to today's symptoms. */
export function buildSession(type: WorkoutType, s: Symptoms): SessionPlan {
  const adaptations: string[] = [];
  let title = '';
  let blocks: PlannedBlock[] = [];

  if (type === 'strength-core') {
    title = 'Day 1 · Full Body Strength + Core';
    blocks = [
      b('warmup', 'cat-cow', 1, '8 slow reps', 'Wake the spine up'),
      b('warmup', 'glute-bridge', 2, '12 + 2s squeeze', 'Turn the glutes on'),
      b('warmup', 'ankle-rock', 1, '10/side', 'Prep the knee'),
      b('strength', 'barbell-back-squat', 3, '6–10', 'Main squat pattern'),
      b('strength', 'dumbbell-bench-press', 3, '8–12', 'Horizontal push'),
      b('strength', 'barbell-rdl', 3, '8–10', 'Glute + hamstring priority'),
      b('strength', 'seated-cable-row', 3, '10–12', 'Posture builder'),
      b('strength', 'barbell-hip-thrust', 3, '8–12', 'Glute priority #1'),
      b('strength', 'machine-bicep-curl', 3, '10–15', 'Bicep volume'),
      b('core', 'mcgill-curl-up', 3, '10s holds ×5', 'McGill Big 3'),
      b('core', 'side-plank', 3, '10s ×3 per side', 'McGill Big 3'),
      b('core', 'bird-dog', 3, '10s ×5 per side', 'McGill Big 3'),
    ];
  } else if (type === 'strength-conditioning') {
    title = 'Day 3 · Strength + Conditioning';
    blocks = [
      b('warmup', 'cat-cow', 1, '8 slow reps'),
      b('warmup', 'mudgal-halo', 1, '5/direction', 'Open the shoulders'),
      b('warmup', 'hip-flexor-stretch', 1, '30s/side', 'Undo the desk'),
      b('strength', 'barbell-deadlift', 3, '4–6', 'Main hinge — crisp reps only'),
      b('strength', 'seated-db-shoulder-press', 3, '8–12', 'Vertical push'),
      b('strength', 'dumbbell-step-up', 3, '8–10/leg', 'Single-leg + glutes'),
      b('strength', 'lat-pulldown', 3, '8–12', 'Vertical pull (chin-up builder)'),
      b('strength', 'hammer-curl', 3, '10–12', 'Bicep width'),
      b('strength', 'cable-tricep-pushdown', 2, '12–15', 'Arm balance'),
      b('core', 'pallof-press', 3, '8/side', 'Anti-rotation'),
      b('conditioning', 'suitcase-carry', 3, '30m/side', 'Core wall + grip'),
      b('conditioning', 'tyre-push', 4, '20s hard / 90s rest', 'Engine work, zero impact'),
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

  return { type, title, blocks, adaptations };
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
