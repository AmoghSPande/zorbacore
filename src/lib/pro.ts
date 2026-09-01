// Zorbacore Pro — client-side entitlement.
//
// Safety model:
// - When the paywall is OFF (PRO_CONFIG.enabled false or no permalink), proActive()
//   is false and isPro() is TRUE for everyone: no gate, no upgrade UI, all free.
// - When ON, Pro unlocks only via a Gumroad license key validated against Gumroad's
//   public API. Gumroad is the merchant of record — no card data ever touches this
//   app. The unlock is a low-stakes cosmetic/export gate (never health features),
//   so client-side validation is an acceptable honor-system boundary.

import { useSyncExternalStore } from 'react';
import { PRO_CONFIG } from '../pro-config';

const LICENSE_KEY = 'zc-pro-license';
const UNLOCKED_KEY = 'zc-pro-unlocked';

/** Is the paywall switched on at all? */
export function proActive(): boolean {
  return PRO_CONFIG.enabled && PRO_CONFIG.productPermalink.trim().length > 0;
}

function readUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCKED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Does this device have Pro? True for everyone when the paywall is off. */
export function isPro(): boolean {
  if (!proActive()) return true;
  return readUnlocked();
}

// --- reactive store so UI updates the moment a license is activated ---
const listeners = new Set<() => void>();
let snapshot = isPro();
function emit() {
  snapshot = isPro();
  listeners.forEach((l) => l());
}

export function useIsPro(): boolean {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => snapshot,
  );
}

export interface ActivateResult {
  ok: boolean;
  message: string;
}

/** Validate a Gumroad license key and, on success, unlock Pro on this device. */
export async function activateLicense(rawKey: string): Promise<ActivateResult> {
  const key = rawKey.trim();
  if (!key) return { ok: false, message: 'Enter your license key.' };
  if (!proActive()) return { ok: false, message: 'Pro is not configured yet.' };

  let res: Response;
  try {
    res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_permalink: PRO_CONFIG.productPermalink,
        license_key: key,
        // don't count a check as a use; we only read validity
        increment_uses_count: 'false',
      }),
    });
  } catch {
    return { ok: false, message: 'Could not reach the license server. Check your connection and try again.' };
  }

  if (!res.ok) {
    return { ok: false, message: 'That key was not recognized. Double-check it and try again.' };
  }

  let data: { success?: boolean; purchase?: { refunded?: boolean; chargebacked?: boolean; subscription_cancelled_at?: string | null } };
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: 'Unexpected response from the license server.' };
  }

  const p = data.purchase;
  if (!data.success || !p) {
    return { ok: false, message: 'That key was not recognized. Double-check it and try again.' };
  }
  if (p.refunded || p.chargebacked) {
    return { ok: false, message: 'This purchase was refunded, so Pro is not active.' };
  }
  if (p.subscription_cancelled_at) {
    return { ok: false, message: 'This subscription has ended. Renew to restore Pro.' };
  }

  try {
    localStorage.setItem(LICENSE_KEY, key);
    localStorage.setItem(UNLOCKED_KEY, '1');
  } catch { /* private mode — Pro holds for this session via the emit below */ }
  emit();
  return { ok: true, message: 'Pro unlocked — thank you for supporting Zorbacore! 🎉' };
}

export function deactivateLicense(): void {
  try {
    localStorage.removeItem(LICENSE_KEY);
    localStorage.removeItem(UNLOCKED_KEY);
  } catch { /* ignore */ }
  emit();
}

export function savedLicenseKey(): string {
  try {
    return localStorage.getItem(LICENSE_KEY) ?? '';
  } catch {
    return '';
  }
}
