import { db, daysAgoStr, todayStr } from '../db';
import type { Checkin, WorkoutType } from '../types';

export interface Readiness {
  score: number; // 0-100
  level: 'hard' | 'moderate' | 'recovery';
  label: string;
  reasons: string[];
}

/** Daily readiness from the morning check-in + recent training load. */
export function readinessFrom(c: Checkin, trainedYesterday: boolean, trainedDayBefore: boolean): Readiness {
  const norm = (v: number) => (v - 1) / 9; // 0..1
  const good =
    0.25 * norm(c.sleep) +
    0.25 * norm(c.energy) +
    0.2 * (1 - norm(c.soreness)) +
    0.15 * (1 - norm(c.back)) +
    0.15 * (1 - norm(c.knee));
  let score = Math.round(good * 100);

  const reasons: string[] = [];
  if (trainedYesterday && trainedDayBefore) {
    score -= 10;
    reasons.push('two training days in a row — recovery matters now');
  }
  if (c.sleep <= 4) reasons.push('poor sleep');
  if (c.soreness >= 7) reasons.push('high soreness');
  if (c.back >= 6) reasons.push(`back stiffness ${c.back}/10`);
  if (c.knee >= 6) reasons.push(`knee discomfort ${c.knee}/10`);
  if (c.energy >= 8 && c.sleep >= 7) reasons.push('well rested');

  score = Math.max(0, Math.min(100, score));
  const level = score >= 72 ? 'hard' : score >= 48 ? 'moderate' : 'recovery';
  const label =
    level === 'hard' ? 'Green light — train hard today'
    : level === 'moderate' ? 'Moderate — train, but leave a rep in the tank'
    : 'Recovery day — mobility, easy walk or spin, sleep';
  return { score, level, label, reasons };
}

export interface DayStatus {
  checkin?: Checkin;
  readiness?: Readiness;
  streak: number;
  kneeAvg7: number | null;
  backAvg7: number | null;
  kneeTrend: 'up' | 'down' | 'flat';
  backTrend: 'up' | 'down' | 'flat';
  nextSession: { kind: 'strength' | 'run' | 'mobility' | 'rest'; type?: WorkoutType; title: string; why: string };
}

async function activityDates(): Promise<Set<string>> {
  const [ws, rs] = await Promise.all([db.workouts.toArray(), db.runs.toArray()]);
  const set = new Set<string>();
  for (const w of ws) if (w.endedAt) set.add(w.date);
  for (const r of rs) set.add(r.date);
  return set;
}

function avg(xs: number[]): number | null {
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null;
}

export async function computeDayStatus(): Promise<DayStatus> {
  const today = todayStr();
  const checkin = await db.checkins.where('date').equals(today).first();
  const activity = await activityDates();

  // streak: consecutive days (ending today or yesterday) with a check-in or activity
  const checkins = await db.checkins.toArray();
  const engaged = new Set<string>([...activity, ...checkins.map((c) => c.date)]);
  let streak = 0;
  let cursor = engaged.has(today) ? 0 : 1;
  while (engaged.has(daysAgoStr(cursor))) { streak += 1; cursor += 1; }

  // 7-day symptom trends (check-ins + pre-workout/pre-run reports)
  const [workouts, runs] = await Promise.all([db.workouts.toArray(), db.runs.toArray()]);
  const kneeNow: number[] = [];
  const backNow: number[] = [];
  const kneePrev: number[] = [];
  const backPrev: number[] = [];
  const wk = daysAgoStr(7);
  const wk2 = daysAgoStr(14);
  const push = (date: string, knee?: number, back?: number) => {
    if (date >= wk) { if (knee != null) kneeNow.push(knee); if (back != null) backNow.push(back); }
    else if (date >= wk2) { if (knee != null) kneePrev.push(knee); if (back != null) backPrev.push(back); }
  };
  for (const c of checkins) push(c.date, c.knee, c.back);
  for (const w of workouts) push(w.date, w.preKnee, w.preBack);
  for (const r of runs) push(r.date, r.preKnee, r.preBack);

  const kneeAvg7 = avg(kneeNow);
  const backAvg7 = avg(backNow);
  const kneePrevAvg = avg(kneePrev);
  const backPrevAvg = avg(backPrev);
  const trend = (now: number | null, prev: number | null): 'up' | 'down' | 'flat' => {
    if (now == null || prev == null) return 'flat';
    if (now < prev - 0.4) return 'down';
    if (now > prev + 0.4) return 'up';
    return 'flat';
  };

  const trainedYesterday = activity.has(daysAgoStr(1));
  const trainedDayBefore = activity.has(daysAgoStr(2));
  const readiness = checkin ? readinessFrom(checkin, trainedYesterday, trainedDayBefore) : undefined;

  // next session: alternate Day1 / Run / Day3 based on the last 7 days
  const finished = workouts.filter((w) => w.endedAt).sort((a, b) => b.date.localeCompare(a.date));
  const lastStrength = finished.find((w) => w.type === 'strength-core' || w.type === 'strength-conditioning');
  const strengthThisWeek = finished.filter((w) => w.date >= wk && (w.type === 'strength-core' || w.type === 'strength-conditioning')).length;
  const ranToday = runs.some((r) => r.date === today);
  const trainedToday = activity.has(today);

  let nextSession: DayStatus['nextSession'];
  if (readiness?.level === 'recovery') {
    nextSession = { kind: 'mobility', title: '15-min mobility + easy walk', why: 'Readiness is low — recovery moves you forward today.' };
  } else if (trainedToday || ranToday) {
    nextSession = { kind: 'mobility', title: 'Evening mobility (5–10 min)', why: 'Session done — a short wind-down helps the back.' };
  } else if (trainedYesterday && lastStrength?.date === daysAgoStr(1)) {
    nextSession = { kind: 'run', title: 'Run + mobility day', why: 'Strength yesterday — today builds the engine and lets muscles recover.' };
  } else if (strengthThisWeek >= 3) {
    nextSession = { kind: 'run', title: 'Run or full recovery', why: 'Three gym sessions logged this week — that box is ticked.' };
  } else {
    const type: WorkoutType = lastStrength?.type === 'strength-core' ? 'strength-conditioning' : 'strength-core';
    nextSession = {
      kind: 'strength', type,
      title: type === 'strength-core' ? 'Day 1 · Full Body Strength + Core' : 'Day 3 · Strength + Conditioning',
      why: lastStrength ? `Alternates with your last gym session (${lastStrength.date}).` : 'Start of your hybrid cycle.',
    };
  }

  return {
    checkin, readiness, streak, kneeAvg7, backAvg7,
    kneeTrend: trend(kneeAvg7, kneePrevAvg),
    backTrend: trend(backAvg7, backPrevAvg),
    nextSession,
  };
}
