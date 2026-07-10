export interface RoutineItem {
  exerciseId: string;
  seconds: number;
  note?: string;
}

export interface Routine {
  id: string;
  name: string;
  minutes: number;
  when: string;
  items: RoutineItem[];
}

export const ROUTINES: Routine[] = [
  {
    id: 'morning',
    name: 'Morning back reset',
    minutes: 6,
    when: 'Right after waking — erase overnight stiffness',
    items: [
      { exerciseId: 'cat-cow', seconds: 60 },
      { exerciseId: 'child-pose', seconds: 45 },
      { exerciseId: 'open-book', seconds: 45, note: 'per side' },
      { exerciseId: 'hip-flexor-stretch', seconds: 45, note: 'per side' },
      { exerciseId: 'glute-bridge', seconds: 60, note: '10 slow reps' },
      { exerciseId: 'active-slr', seconds: 45, note: 'per side' },
    ],
  },
  {
    id: 'desk-break',
    name: 'Desk-break reset',
    minutes: 3,
    when: 'Every 2–3 hours of sitting',
    items: [
      { exerciseId: 'hip-flexor-stretch', seconds: 40, note: 'per side' },
      { exerciseId: 'cat-cow', seconds: 40, note: 'standing version ok' },
      { exerciseId: 'calf-stretch', seconds: 30, note: 'per side' },
      { exerciseId: 'mudgal-halo', seconds: 40, note: 'or arm circles at the office' },
    ],
  },
  {
    id: 'pre-workout',
    name: 'Pre-workout warm-up',
    minutes: 6,
    when: 'Before every gym session',
    items: [
      { exerciseId: 'cat-cow', seconds: 45 },
      { exerciseId: 'glute-bridge', seconds: 60, note: '12 reps + 2s squeeze' },
      { exerciseId: 'ankle-rock', seconds: 45, note: 'per side' },
      { exerciseId: 'bird-dog', seconds: 60, note: '5 slow per side' },
      { exerciseId: 'ninety-ninety', seconds: 60 },
    ],
  },
  {
    id: 'post-workout',
    name: 'Post-workout wind-down',
    minutes: 5,
    when: 'After training or a run',
    items: [
      { exerciseId: 'hip-flexor-stretch', seconds: 45, note: 'per side' },
      { exerciseId: 'pigeon-stretch', seconds: 60, note: 'per side' },
      { exerciseId: 'calf-stretch', seconds: 40, note: 'per side' },
      { exerciseId: 'child-pose', seconds: 60, note: 'slow breaths' },
    ],
  },
  {
    id: 'full',
    name: 'Full mobility session',
    minutes: 15,
    when: 'Day 2 (run day) or any rest day',
    items: [
      { exerciseId: 'cat-cow', seconds: 60 },
      { exerciseId: 'bench-tspine-extension', seconds: 60 },
      { exerciseId: 'open-book', seconds: 60, note: 'per side' },
      { exerciseId: 'hip-flexor-stretch', seconds: 60, note: 'per side' },
      { exerciseId: 'ninety-ninety', seconds: 90 },
      { exerciseId: 'pigeon-stretch', seconds: 60, note: 'per side' },
      { exerciseId: 'active-slr', seconds: 60, note: 'per side' },
      { exerciseId: 'ankle-rock', seconds: 60, note: 'per side' },
      { exerciseId: 'calf-stretch', seconds: 45, note: 'per side' },
      { exerciseId: 'glute-bridge', seconds: 60, note: '12 slow reps' },
      { exerciseId: 'bird-dog', seconds: 60, note: '5 per side' },
      { exerciseId: 'child-pose', seconds: 60 },
    ],
  },
];
