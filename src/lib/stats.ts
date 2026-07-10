import { db, weekStart, todayStr } from '../db';
import type { PR, SetLog, Workout } from '../types';

/** Epley estimated 1RM */
export function e1rm(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export interface LastPerf {
  date: string;
  sets: SetLog[];
  topSet: SetLog;
  avgRpe?: number;
}

/** Most recent performance of an exercise across workouts. */
export async function lastPerformance(exerciseId: string): Promise<LastPerf | null> {
  const workouts = await db.workouts.orderBy('date').reverse().limit(80).toArray();
  for (const w of workouts) {
    const sets = w.sets.filter((s) => s.exerciseId === exerciseId);
    if (!sets.length) continue;
    const topSet = sets.reduce((a, b) => (e1rm(b.weightKg, b.reps) > e1rm(a.weightKg, a.reps) ? b : a));
    const rpes = sets.map((s) => s.rpe).filter((r): r is number => r != null);
    return {
      date: w.date,
      sets,
      topSet,
      avgRpe: rpes.length ? rpes.reduce((a, b) => a + b, 0) / rpes.length : undefined,
    };
  }
  return null;
}

export interface Suggestion {
  weightKg: number;
  reps: number;
  rationale: string;
}

/**
 * Progressive overload: based on the last performance and its RPE,
 * suggest the next target using double progression (reps first, then load).
 */
export function suggestNext(last: LastPerf | null, repLow = 8, repHigh = 12): Suggestion | null {
  if (!last) return null;
  const { topSet, avgRpe } = last;
  if (topSet.weightKg === 0) {
    // bodyweight: add a rep
    return { weightKg: 0, reps: topSet.reps + 1, rationale: 'Add one rep to your last best.' };
  }
  const hardness = avgRpe ?? topSet.rpe ?? 8;
  if (hardness >= 9.5) {
    return { weightKg: topSet.weightKg, reps: topSet.reps, rationale: 'Last session was near max — repeat it and own the weight.' };
  }
  if (topSet.reps >= repHigh) {
    // conservative default: +2.5kg until the bar is genuinely heavy
    const inc = topSet.weightKg >= 80 ? 5 : 2.5;
    return {
      weightKg: topSet.weightKg + inc,
      reps: repLow,
      rationale: `You hit ${topSet.reps} reps — move up ${inc}kg and rebuild from ${repLow}.`,
    };
  }
  return {
    weightKg: topSet.weightKg,
    reps: Math.min(topSet.reps + 1, repHigh),
    rationale: `Same weight, aim for ${Math.min(topSet.reps + 1, repHigh)} reps (last: ${topSet.reps}).`,
  };
}

/** Detect and persist PRs for a finished workout. Returns new PRs. */
export async function detectPRs(workout: Workout): Promise<PR[]> {
  const newPRs: PR[] = [];
  const byExercise = new Map<string, SetLog[]>();
  for (const s of workout.sets) {
    if (!byExercise.has(s.exerciseId)) byExercise.set(s.exerciseId, []);
    byExercise.get(s.exerciseId)!.push(s);
  }
  for (const [exId, sets] of byExercise) {
    const prevPRs = await db.prs.where('exerciseId').equals(exId).toArray();
    const bestWeightPrev = Math.max(0, ...prevPRs.filter((p) => p.kind === 'weight').map((p) => p.value));
    const bestE1rmPrev = Math.max(0, ...prevPRs.filter((p) => p.kind === 'e1rm').map((p) => p.value));
    const bestRepsPrev = Math.max(0, ...prevPRs.filter((p) => p.kind === 'reps').map((p) => p.value));

    const topWeight = Math.max(...sets.map((s) => s.weightKg));
    const topE1 = Math.max(...sets.map((s) => e1rm(s.weightKg, s.reps)));
    const topReps = Math.max(...sets.map((s) => s.reps));
    const topSet = sets.reduce((a, b) => (e1rm(b.weightKg, b.reps) > e1rm(a.weightKg, a.reps) ? b : a));

    if (topWeight > bestWeightPrev && topWeight > 0) {
      newPRs.push({ exerciseId: exId, kind: 'weight', value: topWeight, detail: `${topWeight}kg × ${sets.find((s) => s.weightKg === topWeight)!.reps}`, date: workout.date });
    }
    if (topE1 > bestE1rmPrev && topE1 > 0 && topSet.weightKg > 0) {
      newPRs.push({ exerciseId: exId, kind: 'e1rm', value: topE1, detail: `est. 1RM ${topE1}kg (${topSet.weightKg}kg × ${topSet.reps})`, date: workout.date });
    }
    if (topSet.weightKg === 0 && topReps > bestRepsPrev) {
      newPRs.push({ exerciseId: exId, kind: 'reps', value: topReps, detail: `${topReps} reps`, date: workout.date });
    }
  }
  if (newPRs.length) await db.prs.bulkAdd(newPRs);
  return newPRs;
}

export interface WeekVolume {
  week: string;
  totalSets: number;
  gluteSets: number;
  bicepSets: number;
  workouts: number;
}

/** Weekly working-set volume for the last n weeks (including current). */
export async function weeklyVolumes(nWeeks = 8): Promise<WeekVolume[]> {
  const exercises = await db.exercises.toArray();
  const gluteIds = new Set(exercises.filter((e) => e.gluteFocus).map((e) => e.id));
  const bicepIds = new Set(exercises.filter((e) => e.bicepFocus).map((e) => e.id));

  const start = new Date();
  start.setDate(start.getDate() - nWeeks * 7);
  const workouts = await db.workouts.where('date').aboveOrEqual(todayStr(start)).toArray();

  const weeks = new Map<string, WeekVolume>();
  for (let i = 0; i < nWeeks; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const wk = weekStart(todayStr(d));
    weeks.set(wk, { week: wk, totalSets: 0, gluteSets: 0, bicepSets: 0, workouts: 0 });
  }
  for (const w of workouts) {
    const wk = weekStart(w.date);
    const entry = weeks.get(wk);
    if (!entry) continue;
    entry.workouts += 1;
    for (const s of w.sets) {
      entry.totalSets += 1;
      if (gluteIds.has(s.exerciseId)) entry.gluteSets += 1;
      if (bicepIds.has(s.exerciseId)) entry.bicepSets += 1;
    }
  }
  return [...weeks.values()].sort((a, b) => a.week.localeCompare(b.week));
}

export function fmtDuration(ms: number): string {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
