// Google sign-in + private per-user cloud sync (Firebase Auth + Firestore).
// The app is fully usable without this; signing in adds cross-device sync
// and an off-device backup, gated by Firestore rules to the owner's uid.

import { useSyncExternalStore } from 'react';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup,
  signInWithRedirect, getRedirectResult, signOut, type User,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../firebase-config';
import { db } from '../db';
import { seedIfNeeded } from '../data/seed';
import { SYNC_TABLES, AUTOID_TABLES, mergeTable, forCloud, keyOf, type SyncTable, type Rec } from './cloudMerge';

export const cloudEnabled = FIREBASE_CONFIG != null;

const LAST_UID_KEY = 'hc-last-sync-uid';
const LAST_AT_KEY = 'hc-last-sync-at';
const CHAT_SYNC_LIMIT = 300;

export interface CloudState {
  ready: boolean;
  user: { uid: string; email: string | null; name: string | null } | null;
  syncing: boolean;
  lastSyncAt: number | null;
  /** a different Google account than the one last synced, with data on both sides */
  conflict: boolean;
  error: string | null;
}

let state: CloudState = {
  ready: !cloudEnabled,
  user: null,
  syncing: false,
  lastSyncAt: Number(localStorage.getItem(LAST_AT_KEY)) || null,
  conflict: false,
  error: null,
};
const listeners = new Set<() => void>();
function setState(patch: Partial<CloudState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useCloud(): CloudState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state,
  );
}

let app: FirebaseApp | null = null;
let started = false;

function fb() {
  if (!FIREBASE_CONFIG) throw new Error('Cloud sync is not configured');
  if (!app) app = initializeApp(FIREBASE_CONFIG);
  return { auth: getAuth(app), store: getFirestore(app) };
}

/** Call once at app start: wires auth state + periodic/visibility auto-sync. */
export function startCloud(): void {
  if (!cloudEnabled || started) return;
  started = true;
  const { auth } = fb();
  getRedirectResult(auth).catch(() => { /* no redirect pending */ });
  onAuthStateChanged(auth, async (u: User | null) => {
    setState({
      ready: true,
      user: u ? { uid: u.uid, email: u.email, name: u.displayName } : null,
    });
    if (u) void autoSync(u.uid);
  });
  setInterval(() => { if (state.user && !state.conflict) void autoSync(state.user.uid); }, 4 * 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && state.user && !state.conflict) void autoSync(state.user.uid);
  });
}

export async function signInGoogle(): Promise<void> {
  const { auth } = fb();
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const code = (e as { code?: string }).code ?? '';
    if (code.includes('popup')) await signInWithRedirect(auth, provider);
    else throw e;
  }
}

export async function signOutGoogle(): Promise<void> {
  const { auth } = fb();
  await signOut(auth);
}

async function localHasData(): Promise<boolean> {
  const counts = await Promise.all([db.workouts.count(), db.runs.count(), db.checkins.count(), db.bodyMetrics.count()]);
  return counts.some((c) => c > 0);
}

async function cloudHasData(uid: string): Promise<boolean> {
  const { store } = fb();
  const meta = await getDoc(doc(store, 'users', uid, 'snapshot', 'meta'));
  return meta.exists();
}

async function autoSync(uid: string): Promise<void> {
  try {
    const lastUid = localStorage.getItem(LAST_UID_KEY);
    if (lastUid && lastUid !== uid && (await localHasData()) && (await cloudHasData(uid))) {
      setState({ conflict: true });
      return;
    }
    await syncNow(uid, 'merge');
  } catch (e) {
    setState({ error: (e as Error).message });
  }
}

export type Resolution = 'merge' | 'useCloud' | 'useLocal';

async function readCloudTable(uid: string, table: SyncTable): Promise<Rec[]> {
  const { store } = fb();
  const snap = await getDoc(doc(store, 'users', uid, 'snapshot', table));
  return snap.exists() ? ((snap.data().records as Rec[]) ?? []) : [];
}

async function writeCloudTable(uid: string, table: SyncTable, records: Rec[]): Promise<void> {
  const { store } = fb();
  await setDoc(doc(store, 'users', uid, 'snapshot', table), { records, updatedAt: Date.now() });
}

function localTable(table: SyncTable) {
  return db.table(table);
}

/** Two-way sync. 'useCloud' replaces this device's data; 'useLocal' replaces the cloud copy. */
export async function syncNow(uid: string, resolution: Resolution = 'merge'): Promise<void> {
  if (!cloudEnabled || state.syncing) return;
  setState({ syncing: true, error: null });
  try {
    const { store } = fb();

    if (resolution === 'useCloud') {
      for (const t of SYNC_TABLES) await localTable(t).clear();
      localStorage.removeItem('hc-library-version');
    }

    for (const t of SYNC_TABLES) {
      let local = (await localTable(t).toArray()) as Rec[];
      if (t === 'chat' && local.length > CHAT_SYNC_LIMIT) local = local.slice(-CHAT_SYNC_LIMIT);
      const cloud = resolution === 'useLocal' ? [] : await readCloudTable(uid, t);

      if (resolution === 'useLocal') {
        await writeCloudTable(uid, t, forCloud(t, local));
        continue;
      }

      const { addLocally, replaceLocally, cloudSet } = mergeTable(t, local, cloud);
      for (const rec of addLocally) {
        const r: Rec = { ...rec };
        if (AUTOID_TABLES.includes(t)) delete r.id;
        await localTable(t).add(r);
      }
      for (const rec of replaceLocally) {
        // same natural key exists locally — update it in place
        const all = (await localTable(t).toArray()) as Rec[];
        const match = all.find((x) => keyOf(t, x) === keyOf(t, rec));
        if (match) await localTable(t).put({ ...rec, id: match.id ?? rec.id });
      }
      // only rewrite the cloud doc when something differs
      if (cloudSet.length !== cloud.length || addLocally.length || replaceLocally.length || cloud.length === 0) {
        await writeCloudTable(uid, t, cloudSet);
      }
    }

    await setDoc(doc(store, 'users', uid, 'snapshot', 'meta'), { updatedAt: Date.now() });
    await seedIfNeeded();

    const now = Date.now();
    localStorage.setItem(LAST_UID_KEY, uid);
    localStorage.setItem(LAST_AT_KEY, String(now));
    setState({ lastSyncAt: now, conflict: false });
  } finally {
    setState({ syncing: false });
  }
}
