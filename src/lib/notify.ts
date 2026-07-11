import { db, getProfile, todayStr } from '../db';
import { computeDayStatus } from './readiness';

export async function requestNotifyPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

function notify(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/icon.svg' });
      return;
    } catch { /* fall through to in-app */ }
  }
}

/**
 * In-app reminder engine (no backend, so it runs while the app is open):
 * on load and then every few minutes, check whether an encouraging nudge
 * is due. Returns the banner text for the UI, if any.
 */
export async function dueNudge(): Promise<string | null> {
  const profile = await getProfile();
  if (!profile.remindersEnabled) return null;

  const today = todayStr();
  const now = new Date();
  const [hh, mm] = (profile.reminderTime || '07:30').split(':').map(Number);
  const reminderPassed = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
  if (!reminderPassed) return null;

  const KEY = 'hc-last-nudge';
  if (localStorage.getItem(KEY) === today) return null;

  const [checkin, workouts, runs] = await Promise.all([
    db.checkins.where('date').equals(today).first(),
    db.workouts.where('date').equals(today).toArray(),
    db.runs.where('date').equals(today).toArray(),
  ]);

  let msg: string | null = null;
  if (!checkin) {
    msg = '☀️ 30-second check-in: it tunes today\'s plan to your knee, back and energy.';
  } else if (workouts.length === 0 && runs.length === 0) {
    const status = await computeDayStatus();
    msg =
      status.readiness?.level === 'recovery'
        ? '🌿 Recovery day — a 10-minute mobility session still moves you forward.'
        : `💪 ${status.nextSession.title} is on the menu — even a short version counts.`;
  }

  if (msg) {
    localStorage.setItem(KEY, today);
    notify('Zorbacore', msg.replace(/^[^\w]+\s/, ''));
    return msg;
  }
  return null;
}
