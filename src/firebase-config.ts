import type { FirebaseOptions } from 'firebase/app';

/**
 * Firebase web-app config (see docs/FIREBASE_SETUP.md).
 *
 * These values are NOT secrets — they identify the project, they don't grant
 * access. Privacy is enforced by Firebase Auth + the Firestore security rules
 * in docs/FIREBASE_SETUP.md (each user can only ever read/write their own data).
 */
export const FIREBASE_CONFIG: FirebaseOptions | null = {
  apiKey: 'AIzaSyBixWSQIqdDfDnf4tO2POZ12Ee_YUAjnkc',
  authDomain: 'hcfirebase-85059.firebaseapp.com',
  projectId: 'hcfirebase-85059',
  storageBucket: 'hcfirebase-85059.firebasestorage.app',
  messagingSenderId: '530039609308',
  appId: '1:530039609308:web:43cf91d6f0e459c879e119',
};
