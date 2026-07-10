# Enable Google sign-in + private cloud sync (one-time, ~5 minutes)

When this is done, everyone in the family signs in with their own Google account and
gets a **private** diary: synced across their devices, backed up off-device, and
readable by no one else — enforced server-side by the security rules below.

## 1. Create the (free) Firebase project

1. Go to https://console.firebase.google.com → **Add project** (e.g. `hybridcoach`).
   Disable Analytics when asked (not needed).
2. In the project: **Build → Authentication → Get started → Sign-in method →
   Google → Enable** → Save.
3. Still in Authentication: **Settings → Authorized domains → Add domain** →
   add `zorbacore.com`.
4. **Build → Firestore Database → Create database** → production mode → pick the
   region closest to you.

## 2. Lock the data down (security rules)

In **Firestore → Rules**, replace everything with this and **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

This is the privacy guarantee: every user can only ever read and write the data
under their own account id. There is no way to query another user's diary.

*(Optional, stricter: to allow only specific people, add an `allowlist` collection
with one doc per allowed email and change the condition to
`request.auth.uid == uid && exists(/databases/$(database)/documents/allowlist/$(request.auth.token.email))`.
Then only listed emails can sync at all.)*

## 3. Connect the app

1. In Firebase: **Project settings (gear icon) → Your apps → Web (</>)** →
   register an app (name anything, no hosting) → copy the `firebaseConfig` object.
2. Edit `src/firebase-config.ts` in this repo (GitHub web editor is fine) so it reads:

```ts
export const FIREBASE_CONFIG: FirebaseOptions | null = {
  apiKey: '…',
  authDomain: '…',
  projectId: '…',
  storageBucket: '…',
  messagingSenderId: '…',
  appId: '…',
};
```

These values are safe to commit — they identify the project; access is controlled
by Authentication + the rules above.

3. Commit to `main`. The site redeploys itself and a **Continue with Google**
   button appears in Settings.

## How it behaves

- Not signed in → the app works exactly as before, all data on-device only.
- Signed in → the diary syncs automatically (on open, every few minutes, and when
  you leave the app), plus a manual **Sync now** in Settings.
- Same account on a new phone → sign in and the diary appears.
- A different account on a device that already has data → the app asks which diary
  should win instead of mixing them.
