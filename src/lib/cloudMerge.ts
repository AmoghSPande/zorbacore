// Pure merge logic for cloud sync (no Firebase imports — unit-testable).

export type Rec = Record<string, unknown>;

export const SYNC_TABLES = [
  'profile', 'exercises', 'workouts', 'runs', 'checkins', 'bodyMetrics', 'prs', 'chat',
  'habits', 'habitLogs', 'meals', 'plans',
] as const;
export type SyncTable = (typeof SYNC_TABLES)[number];

/** Tables whose primary key is a device-local auto-increment (stripped for cloud). */
export const AUTOID_TABLES: SyncTable[] = ['workouts', 'runs', 'checkins', 'bodyMetrics', 'prs', 'chat', 'habitLogs', 'meals'];

/** Natural identity of a record, stable across devices. */
export function keyOf(table: SyncTable, r: Rec): string {
  switch (table) {
    case 'profile': return 'me';
    case 'exercises': return String(r.id);
    case 'workouts': return String(r.startedAt);
    case 'runs': return `${r.date}|${r.distanceKm}|${r.durationSec}`;
    case 'checkins': return String(r.date);
    case 'bodyMetrics': return `${r.date}|${r.weightKg ?? ''}|${r.waistCm ?? ''}|${r.bodyFatPct ?? ''}|${r.armCm ?? ''}`;
    case 'prs': return `${r.exerciseId}|${r.kind}|${r.date}|${r.value}`;
    case 'chat': return String(r.at);
    case 'habits': return String(r.id);
    case 'habitLogs': return `${r.habitId}|${r.date}`;
    case 'meals': return String(r.at);
    case 'plans': return String(r.id);
  }
}

/** Strip device-local ids + undefined values (Firestore rejects undefined). */
export function forCloud(table: SyncTable, records: Rec[]): Rec[] {
  const cleaned = records.map((r) => {
    const c: Rec = { ...r };
    if (AUTOID_TABLES.includes(table)) delete c.id;
    return c;
  });
  return JSON.parse(JSON.stringify(cleaned));
}

/** Pick the record that should win when both sides have the same key. */
function newer(a: Rec, b: Rec): Rec {
  const ta = Number(a.updatedAt ?? a.endedAt ?? a.at ?? 0);
  const tb = Number(b.updatedAt ?? b.endedAt ?? b.at ?? 0);
  return tb > ta ? b : a; // ties → first argument (local)
}

export interface MergeResult {
  /** records to insert into the local DB (not present locally) */
  addLocally: Rec[];
  /** full record set to store in the cloud snapshot */
  cloudSet: Rec[];
  /** keys where the cloud version replaced a local record (profile only) */
  replaceLocally: Rec[];
}

/** Union-by-natural-key merge; same key → newer record wins. */
export function mergeTable(table: SyncTable, local: Rec[], cloud: Rec[]): MergeResult {
  const byKey = new Map<string, { rec: Rec; source: 'local' | 'cloud' }>();
  for (const r of local) byKey.set(keyOf(table, r), { rec: r, source: 'local' });
  const addLocally: Rec[] = [];
  const replaceLocally: Rec[] = [];
  for (const c of cloud) {
    const k = keyOf(table, c);
    const existing = byKey.get(k);
    if (!existing) {
      byKey.set(k, { rec: c, source: 'cloud' });
      addLocally.push(c);
    } else {
      const winner = newer(existing.rec, c);
      if (winner === c) {
        byKey.set(k, { rec: { ...existing.rec, ...c }, source: 'cloud' });
        replaceLocally.push({ ...existing.rec, ...c });
      }
    }
  }
  return {
    addLocally,
    replaceLocally,
    cloudSet: forCloud(table, [...byKey.values()].map((v) => v.rec)),
  };
}
