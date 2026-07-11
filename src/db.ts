import Dexie, { type Table } from 'dexie';
import type {
  BodyMetric,
  ChatMessage,
  Checkin,
  Exercise,
  Habit,
  HabitLog,
  Meal,
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
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, number>;
  meals!: Table<Meal, number>;

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
    this.version(2).stores({
      habits: 'id',
      habitLogs: '++id, date, &[habitId+date]',
      meals: '++id, date',
    });
  }
}

export const db = new HybridCoachDB();

export const DEFAULT_PROFILE: Profile = {
  id: 'me',
  name: '',
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

const BACKUP_TABLES = [
  'profile', 'exercises', 'workouts', 'runs', 'checkins',
  'bodyMetrics', 'prs', 'chat', 'habits', 'habitLogs', 'meals',
] as const;

export async function exportAll(): Promise<string> {
  const out: Record<string, unknown> = {
    app: 'hybridcoach', version: 2, exportedAt: new Date().toISOString(),
  };
  for (const t of BACKUP_TABLES) out[t] = await db.table(t).toArray();
  return JSON.stringify(out, null, 2);
}

export async function importAll(json: string): Promise<void> {
  const data = JSON.parse(json);
  if (data.app !== 'hybridcoach') throw new Error('Not a HybridCoach backup file');
  const tables = BACKUP_TABLES.map((t) => db.table(t));
  await db.transaction('rw', tables, async () => {
    for (const t of BACKUP_TABLES) {
      await db.table(t).clear();
      await db.table(t).bulkPut(data[t] ?? []);
    }
  });
}
