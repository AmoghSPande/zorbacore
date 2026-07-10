import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getProfile } from '../db';
import type { Profile } from '../types';
import { computeDayStatus, type DayStatus } from '../lib/readiness';
import { computeRunStats, fmtTime, type RunStats } from '../lib/running';
import DailyCheckin from '../components/DailyCheckin';
import { Sparkline, VIZ } from '../components/charts';
import { dueNudge } from '../lib/notify';

function ring(score: number): string {
  return score >= 72 ? 'var(--accent)' : score >= 48 ? 'var(--warn)' : 'var(--danger)';
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
          <Link to="/library" className="icon-btn" aria-label="Exercise library">📚</Link>
          <Link to="/settings" className="icon-btn" aria-label="Settings">⚙️</Link>
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
              <svg viewBox="0 0 80 80" width={74} height={74}>
                <circle cx={40} cy={40} r={34} fill="none" stroke="var(--surface-3)" strokeWidth={7} />
                <circle
                  cx={40} cy={40} r={34} fill="none" stroke={ring(status.readiness.score)} strokeWidth={7}
                  strokeLinecap="round" strokeDasharray={`${(status.readiness.score / 100) * 213.6} 213.6`}
                  transform="rotate(-90 40 40)"
                />
                <text x={40} y={46} textAnchor="middle" fontSize={20} fontWeight={750} fill="var(--text)">{status.readiness.score}</text>
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
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div className="card-title">Next session</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{status.nextSession.title}</div>
          <div className="tag-note" style={{ marginTop: 2 }}>{status.nextSession.why}</div>
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
