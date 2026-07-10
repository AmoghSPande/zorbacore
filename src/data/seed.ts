import { db } from '../db';
import { EXERCISES, LIBRARY_VERSION } from './exercises';

const LIB_KEY = 'hc-library-version';

/**
 * Seed / refresh the built-in exercise library. Built-in entries are
 * re-put when LIBRARY_VERSION bumps; custom exercises are never touched.
 */
export async function seedIfNeeded(): Promise<void> {
  try {
    const current = localStorage.getItem(LIB_KEY);
    const count = await db.exercises.count();
    if (count > 0 && current === String(LIBRARY_VERSION)) return;
    await db.exercises.bulkPut(EXERCISES);
    localStorage.setItem(LIB_KEY, String(LIBRARY_VERSION));
  } catch (e) {
    console.error('seed failed', e);
  }
}
