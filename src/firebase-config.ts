import type { FirebaseOptions } from 'firebase/app';

/**
 * Paste your Firebase web-app config here to enable Google sign-in + private
 * cloud sync (see docs/FIREBASE_SETUP.md for the 5-minute setup).
 *
 * These values are NOT secrets — they identify the project, they don't grant
 * access. Privacy is enforced by Firebase Auth + the Firestore security rules
 * in docs/FIREBASE_SETUP.md (each user can only ever read/write their own data).
 *
 * While this is null, the app runs exactly as before: fully local, on-device.
 */
export const FIREBASE_CONFIG: FirebaseOptions | null = null;
