import Dexie, { type Table } from 'dexie';
import type {
  BodyMetric,
  ChatMessage,
  Checkin,
  Exercise,
  PR,
  Profile,
  Run,
  Workout,
} from './types';
import { DEFAULT_EQUIPMENT } from './data/equipment';

class HybridCoachDB extends Dexie {
  profile!: Table<Profile, string>;
  exercises!: Table<Exercise, string>;
  workouts!: Table<Workout, number>;
  runs!: Table<Run, number>;
  checkins!: Table<Checkin, number>;
  bodyMetrics!: Table<BodyMetric, number>;
  prs!: Table<PR, number>;
  chat!: Table<ChatMessage, number>;

  constructor() {
    super('hybridcoach');
    this.version(1).stores({
      profile: 'id',
      exercises: 'id, category, *muscles',
      workouts: '++id, date, type',
      runs: '++id, date, type',
      checkins: '++id, &date',
      bodyMetrics: '++id, date',
      prs: '++id, exerciseId, date',
      chat: '++id, at',
    });
  }
}

export const db = new HybridCoachDB();

export const DEFAULT_PROFILE: Profile = {
  id: 'me',
  name: 'Amogh',
  trainingDaysPerWeek: 3,
  gymDays: [1, 5], // Mon, Fri gym; Wed run — adjustable in Settings
  runDays: [3],
  equipment: DEFAULT_EQUIPMENT,
  remindersEnabled: false,
  reminderTime: '07:30',
  onboarded: false,
  createdAt: Date.now(),
};

export async function getProfile(): Promise<Profile> {
  const p = await db.profile.get('me');
  if (p) return p;
  await db.profile.put(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const p = await getProfile();
  await db.profile.put({ ...p, ...patch, updatedAt: Date.now() });
}

// ---------- date helpers used everywhere ----------

export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayStr(d);
}

/** ISO week start (Monday) for a YYYY-MM-DD date */
export function weekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = (d.getDay() + 6) % 7; // Mon=0
  d.setDate(d.getDate() - dow);
  return todayStr(d);
}

// ---------- backup ----------

export async function exportAll(): Promise<string> {
  const [profile, exercises, workouts, runs, checkins, bodyMetrics, prs, chat] =
    await Promise.all([
      db.profile.toArray(),
      db.exercises.toArray(),
      db.workouts.toArray(),
      db.runs.toArray(),
      db.checkins.toArray(),
      db.bodyMetrics.toArray(),
      db.prs.toArray(),
      db.chat.toArray(),
    ]);
  return JSON.stringify(
    { app: 'hybridcoach', version: 1, exportedAt: new Date().toISOString(),
      profile, exercises, workouts, runs, checkins, bodyMetrics, prs, chat },
    null,
    2,
  );
}

export async function importAll(json: string): Promise<void> {
  const data = JSON.parse(json);
  if (data.app !== 'hybridcoach') throw new Error('Not a HybridCoach backup file');
  await db.transaction(
    'rw',
    [db.profile, db.exercises, db.workouts, db.runs, db.checkins, db.bodyMetrics, db.prs, db.chat],
    async () => {
      await Promise.all([
        db.profile.clear(), db.exercises.clear(), db.workouts.clear(), db.runs.clear(),
        db.checkins.clear(), db.bodyMetrics.clear(), db.prs.clear(), db.chat.clear(),
      ]);
      await Promise.all([
        db.profile.bulkPut(data.profile ?? []),
        db.exercises.bulkPut(data.exercises ?? []),
        db.workouts.bulkPut(data.workouts ?? []),
        db.runs.bulkPut(data.runs ?? []),
        db.checkins.bulkPut(data.checkins ?? []),
        db.bodyMetrics.bulkPut(data.bodyMetrics ?? []),
        db.prs.bulkPut(data.prs ?? []),
        db.chat.bulkPut(data.chat ?? []),
      ]);
    },
  );
}
