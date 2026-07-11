import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getProfile, todayStr } from '../db';
import type { Profile } from '../types';
import { computeDayStatus, type DayStatus } from '../lib/readiness';
import { computeRunStats, fmtTime, type RunStats } from '../lib/running';
import DailyCheckin from '../components/DailyCheckin';
import { Sparkline, VIZ } from '../components/charts';
import { dueNudge } from '../lib/notify';

function ring(score: number): string {
  return score >= 72 ? 'var(--accent)' : score >= 48 ? 'var(--warn)' : 'var(--danger)';
}

function HabitsFoodTiles() {
  const today = todayStr();
  const habits = (useLiveQuery(() => db.habits.toArray(), []) ?? []).filter((h) => !h.archived);
  const habitLogs = useLiveQuery(() => db.habitLogs.where('date').equals(today).toArray(), []) ?? [];
  const meals = useLiveQuery(() => db.meals.where('date').equals(today).toArray(), []) ?? [];
  const kcal = Math.round(meals.reduce((a, m) => a + m.kcal, 0));
  const habitsDone = habitLogs.filter((l) => habits.some((h) => h.id === l.habitId)).length;

  return (
    <div className="grid-2">
      <Link to="/habits" className="card pad-sm stat" style={{ display: 'flex' }}>
        <span className="v" style={{ color: habits.length && habitsDone === habits.length ? 'var(--accent)' : undefined }}>
          {habits.length ? `${habitsDone}/${habits.length}` : '＋'}
        </span>
        <span className="k">habits today</span>
      </Link>
      <Link to="/food" className="card pad-sm stat" style={{ display: 'flex' }}>
        <span className="v">{kcal > 0 ? kcal : '＋'}<small>{kcal > 0 ? ' kcal' : ''}</small></span>
        <span className="k">food today</span>
      </Link>
    </div>
  );
}

function TrendBadge({ trend, goodWhenDown = true }: { trend: 'up' | 'down' | 'flat'; goodWhenDown?: boolean }) {
  if (trend === 'flat') return <span className="badge info">steady</span>;
  const improving = (trend === 'down') === goodWhenDown;
  return <span className={`badge ${improving ? 'ok' : 'warn'}`}>{trend === 'down' ? '↓ easing' : '↑ rising'}</span>;
}

export default function Home() {
  const nav = useNavigate();
  const [status, setStatus] = useState<DayStatus | null>(null);
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);

  useEffect(() => {
    dueNudge().then(setNudge);
    const iv = setInterval(() => dueNudge().then((n) => n && setNudge(n)), 5 * 60000);
    return () => clearInterval(iv);
  }, []);

  const checkins = useLiveQuery(() => db.checkins.toArray(), []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), []);
  const runs = useLiveQuery(() => db.runs.toArray(), []);
  const metrics = useLiveQuery(() => db.bodyMetrics.orderBy('date').toArray(), []) ?? [];

  useEffect(() => {
    computeDayStatus().then(setStatus);
    computeRunStats().then(setRunStats);
    getProfile().then(setProfile);
  }, [checkins?.length, workouts?.length, runs?.length]);

  const weights = metrics.filter((m) => m.weightKg != null);
  const latestWeight = weights[weights.length - 1]?.weightKg;
  const weightSpark = weights.slice(-14).map((m) => m.weightKg!);

  const hello = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{profile?.name ? `${hello}, ${profile.name}` : hello}</h1>
          <div className="sub">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
        <div className="row">
          <Link to="/library" className="icon-btn" aria-label="Exercise library">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
              <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
            </svg>
          </Link>
          <Link to="/settings" className="icon-btn" aria-label="Settings">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </div>

      {nudge && (
        <div className="card pad-sm row-between" style={{ borderColor: 'var(--run)' }}>
          <span style={{ fontSize: '0.88rem' }}>{nudge}</span>
          <button className="icon-btn" style={{ width: 28, height: 28, flexShrink: 0 }} onClick={() => setNudge(null)}>✕</button>
        </div>
      )}

      {/* readiness */}
      {status?.readiness ? (
        <div className="card">
          <div className="row" style={{ gap: 14 }}>
            <div style={{ position: 'relative', width: 74, height: 74, flexShrink: 0 }}>
              <svg viewBox="0 0 80 80" width={74} height={74} style={{ filter: `drop-shadow(0 0 10px ${ring(status.readiness.score)}44)` }}>
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={ring(status.readiness.score)} />
                    <stop offset="100%" stopColor="var(--run)" />
                  </linearGradient>
                </defs>
                <circle cx={40} cy={40} r={34} fill="none" stroke="var(--surface-3)" strokeWidth={7} />
                <circle
                  cx={40} cy={40} r={34} fill="none" stroke="url(#ringGrad)" strokeWidth={7}
                  strokeLinecap="round" strokeDasharray={`${(status.readiness.score / 100) * 213.6} 213.6`}
                  transform="rotate(-90 40 40)"
                />
                <text x={40} y={47} textAnchor="middle" fontSize={21} fontWeight={700} fill="var(--text)" fontFamily="Space Grotesk, Inter, sans-serif">{status.readiness.score}</text>
              </svg>
            </div>
            <div className="grow">
              <div className="card-title" style={{ marginBottom: 2 }}>Readiness</div>
              <div style={{ fontWeight: 650, fontSize: '0.95rem' }}>{status.readiness.label}</div>
              {status.readiness.reasons.length > 0 && (
                <div className="tag-note" style={{ marginTop: 2 }}>{status.readiness.reasons.join(' · ')}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button className="btn primary big" onClick={() => setShowCheckin(true)}>
          ☀️ Daily check-in (30 seconds)
        </button>
      )}

      {/* today's session */}
      {status && (
        <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)', boxShadow: '0 1px 2px rgba(0,0,0,0.35), 0 0 32px -14px color-mix(in srgb, var(--accent) 50%, transparent)' }}>
          <div className="card-title">Next session</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{status.nextSession.title}</div>
          <div className="tag-note" style={{ marginTop: 2 }}>{status.nextSession.why}</div>
          {status.gapDays != null && status.gapDays >= 4 && (
            <div className="tag-note" style={{ marginTop: 4, color: 'var(--warn)' }}>
              It's been {status.gapDays} days — no guilt, the session will ease you back in.
              You'll also pick how much time you have.
            </div>
          )}
          <div className="row" style={{ marginTop: 10 }}>
            {status.nextSession.kind === 'strength' && (
              <button className="btn primary grow" onClick={() => nav('/train')}>Start workout</button>
            )}
            {status.nextSession.kind === 'run' && (
              <button className="btn run grow" onClick={() => nav('/run')}>Go to Run</button>
            )}
            {(status.nextSession.kind === 'mobility' || status.nextSession.kind === 'rest') && (
              <button className="btn mobility grow" onClick={() => nav('/coach')}>Open mobility</button>
            )}
            <button className="btn" onClick={() => nav('/chat')}>Ask coach</button>
          </div>
        </div>
      )}

      {/* habits + food quick tiles */}
      <HabitsFoodTiles />

      {/* stats row */}
      <div className="grid-3">
        <div className="card pad-sm stat">
          <span className="v">{status?.streak ?? 0}<small>d</small></span>
          <span className="k">streak</span>
        </div>
        <div className="card pad-sm stat">
          <span className="v">{runStats?.pb5k ? fmtTime(runStats.pb5k.sec) : '—'}</span>
          <span className="k">5K best</span>
        </div>
        <div className="card pad-sm stat">
          <span className="v">{latestWeight ?? '—'}<small>{latestWeight ? 'kg' : ''}</small></span>
          <span className="k">weight</span>
        </div>
      </div>

      {/* weight trend */}
      {weightSpark.length >= 2 && (
        <div className="card pad-sm row-between">
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>Weight trend</div>
            <div className="tag-note">
              {weightSpark[weightSpark.length - 1] < weightSpark[0]
                ? `↓ ${Math.round((weightSpark[0] - weightSpark[weightSpark.length - 1]) * 10) / 10}kg over ${weightSpark.length} check-ins`
                : 'holding steady — consistency wins'}
            </div>
          </div>
          <Sparkline data={weightSpark} color={VIZ.blue} />
        </div>
      )}

      {/* knee & back status */}
      {status && (status.kneeAvg7 != null || status.backAvg7 != null) && (
        <div className="card pad-sm">
          <div className="card-title">Joint status (7-day avg)</div>
          <div className="li">
            <div className="li-main"><div className="li-title">Lower back</div></div>
            <span style={{ fontWeight: 700, marginRight: 8 }}>{status.backAvg7 ?? '—'}/10</span>
            <TrendBadge trend={status.backTrend} />
          </div>
          <div className="li">
            <div className="li-main"><div className="li-title">Knee</div></div>
            <span style={{ fontWeight: 700, marginRight: 8 }}>{status.kneeAvg7 ?? '—'}/10</span>
            <TrendBadge trend={status.kneeTrend} />
          </div>
        </div>
      )}

      {/* re-checkin access */}
      {status?.checkin && (
        <button className="btn ghost sm" style={{ alignSelf: 'center' }} onClick={() => setShowCheckin(true)}>
          Update today's check-in
        </button>
      )}

      {showCheckin && (
        <DailyCheckin
          onClose={() => {
            setShowCheckin(false);
            computeDayStatus().then(setStatus);
          }}
        />
      )}
    </div>
  );
}
