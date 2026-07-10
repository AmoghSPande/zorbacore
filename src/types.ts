// ---------- Exercise library ----------

export type ExerciseCategory =
  | 'strength'
  | 'core'
  | 'mobility'
  | 'conditioning'
  | 'cardio';

export type Muscle =
  | 'glutes'
  | 'hamstrings'
  | 'quads'
  | 'calves'
  | 'back'
  | 'lats'
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'hip-flexors'
  | 'spinal-erectors'
  | 'full-body';

/** 0 = safe/therapeutic, 1 = fine with care, 2 = needs caution when symptomatic */
export type RiskLevel = 0 | 1 | 2;

export type LoadType = 'weight' | 'bodyweight' | 'time' | 'distance';

export interface Exercise {
  id: string; // slug
  name: string;
  category: ExerciseCategory;
  muscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: string[]; // equipment ids; empty = none needed
  loadType: LoadType;
  gluteFocus: boolean;
  bicepFocus: boolean;
  kneeRisk: RiskLevel;
  backRisk: RiskLevel;
  /** actively therapeutic for the knee / lower back */
  kneeTherapeutic?: boolean;
  backTherapeutic?: boolean;
  animation: string; // AnimId, '' = generic diagram
  setup: string[];
  cues: string[];
  mistakes: string[];
  safety: string[];
  kneeMod?: string;
  backMod?: string;
  custom?: boolean;
}

// ---------- Logging ----------

export interface SetLog {
  exerciseId: string;
  weightKg: number; // 0 for bodyweight
  reps: number; // for time-based exercises: seconds
  rpe?: number;
  restSec?: number;
  note?: string;
  at: number; // epoch ms
}

export type WorkoutType =
  | 'strength-core' // Day 1
  | 'strength-conditioning' // Day 3
  | 'mobility'
  | 'custom';

export interface Workout {
  id?: number;
  date: string; // YYYY-MM-DD
  type: WorkoutType;
  startedAt: number;
  endedAt?: number;
  preBack?: number; // 1-10 stiffness
  preKnee?: number; // 1-10 discomfort
  preEnergy?: number; // 1-10
  sets: SetLog[];
  note?: string;
  adaptations?: string[]; // human-readable adaptation notes applied
}

export type RunType = 'easy' | 'zone2' | 'tempo' | 'interval' | 'recovery' | 'timetrial';

export interface Run {
  id?: number;
  date: string;
  type: RunType;
  distanceKm: number;
  durationSec: number;
  avgHr?: number;
  preKnee?: number;
  preBack?: number;
  preEnergy?: number;
  note?: string;
  indoor?: boolean; // treadmill
}

export interface Checkin {
  id?: number;
  date: string; // unique, YYYY-MM-DD
  sleep: number; // 1-10 quality
  energy: number; // 1-10
  soreness: number; // 1-10 (10 = very sore)
  knee: number; // 1-10 discomfort
  back: number; // 1-10 stiffness
}

export interface BodyMetric {
  id?: number;
  date: string;
  weightKg?: number;
  waistCm?: number;
  bodyFatPct?: number;
  armCm?: number;
  hipCm?: number;
}

export interface PR {
  id?: number;
  exerciseId: string;
  kind: 'weight' | 'e1rm' | 'reps' | 'volume';
  value: number;
  detail: string; // e.g. "80kg x 5"
  date: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'coach';
  content: string;
  at: number;
}

// ---------- Profile / settings ----------

export interface EquipmentItem {
  id: string;
  name: string;
  custom?: boolean;
}

export interface Profile {
  id: string; // always 'me'
  name: string;
  trainingDaysPerWeek: 2 | 3;
  gymDays: number[]; // 0=Sun..6=Sat preferred gym days
  runDays: number[];
  heightCm?: number;
  birthYear?: number;
  targetWeightKg?: number;
  targetWaistCm?: number;
  targetBodyFatPct?: number;
  equipment: EquipmentItem[];
  remindersEnabled: boolean;
  reminderTime: string; // "07:30"
  anthropicApiKey?: string;
  onboarded: boolean;
  createdAt: number;
  updatedAt?: number;
}
