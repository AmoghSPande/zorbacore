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

    // Every user can read/write ONLY the data under their own account id.
    // A verified-email check keeps unverified/spoofed identities out, and the
    // 1 MiB per-document limit stops a compromised client from ballooning a
    // synced doc to exhaust the project's free quota (a denial-of-wallet).
    match /users/{uid}/snapshot/{table} {
      allow read: if request.auth != null
                  && request.auth.uid == uid;
      allow write: if request.auth != null
                   && request.auth.uid == uid
                   && request.auth.token.email_verified == true
                   && request.resource.size() < 1024 * 1024;
    }

    // Everything else is denied by default — nothing outside a user's own
    // snapshot subcollection is readable or writable by anyone.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

This is the privacy guarantee: every user can only ever read and write the data
under their own account id, and only with a verified Google email. There is no
way to query — or even see the existence of — another user's diary.

*(Optional, stricter still — allow only specific people: create an `allowlist`
collection with one document whose ID is each permitted email, then add
`&& exists(/databases/$(database)/documents/allowlist/$(request.auth.token.email))`
to the `write` (and `read`) conditions. Now only invited family members can sync
at all, even though anyone can sign in with Google.)*

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
