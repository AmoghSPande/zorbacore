import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, daysAgoStr, todayStr, weekStart } from '../db';
import type { Habit } from '../types';
import BackLink from '../components/BackLink';
import { BarChart, VIZ } from '../components/charts';

const SUGGESTED: { name: string; emoji: string }[] = [
  { name: '8k+ steps', emoji: '🚶' },
  { name: '2L+ water', emoji: '💧' },
  { name: 'Morning mobility', emoji: '🧘' },
  { name: 'Walk after dinner', emoji: '🌙' },
  { name: 'In bed by 11pm', emoji: '😴' },
  { name: 'No sugary drinks', emoji: '🚫' },
  { name: 'Protein every meal', emoji: '🥚' },
  { name: 'Read 20 min', emoji: '📖' },
];

function newHabitId(): string {
  return 'h-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

export default function Habits() {
  const [showAdd, setShowAdd] = useState(false);
  const [manage, setManage] = useState(false);
  const habits = (useLiveQuery(() => db.habits.toArray(), []) ?? []).filter((h) => !h.archived);
  const today = todayStr();

  // last 35 days of logs cover today, the week grid and the monthly stats
  const since = daysAgoStr(34);
  const logs = useLiveQuery(() => db.habitLogs.where('date').aboveOrEqual(since).toArray(), []) ?? [];
  const done = useMemo(() => {
    const s = new Set<string>();
    for (const l of logs) s.add(`${l.habitId}|${l.date}`);
    return s;
  }, [logs]);

  const toggle = async (habitId: string, date: string) => {
    const existing = await db.habitLogs.where('[habitId+date]').equals([habitId, date]).first();
    if (existing?.id != null) await db.habitLogs.delete(existing.id);
    else await db.habitLogs.add({ habitId, date, at: Date.now() });
    if (navigator.vibrate) navigator.vibrate(20);
  };

  // this week (Mon..Sun)
  const weekDates = useMemo(() => {
    const start = weekStart(today);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start + 'T12:00:00');
      d.setDate(d.getDate() + i);
      return todayStr(d);
    });
  }, [today]);

  // monthly (last 30 days) completion per habit
  const monthly = habits.map((h) => {
    let n = 0;
    for (let i = 0; i < 30; i++) if (done.has(`${h.id}|${daysAgoStr(i)}`)) n++;
    return { habit: h, pct: Math.round((n / 30) * 100), days: n };
  });

  // weekly totals for the chart: habits completed per day, last 7 days
  const weeklyChart = weekDates.map((d) => ({
    label: d.slice(5).replace('-', '/'),
    values: [habits.filter((h) => done.has(`${h.id}|${d}`)).length],
  }));

  const todayDone = habits.filter((h) => done.has(`${h.id}|${today}`)).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <BackLink />
          <h1>Daily habits</h1>
          <div className="sub">{habits.length ? `${todayDone}/${habits.length} done today` : 'Small daily wins, compounded'}</div>
        </div>
        <div className="row">
          {habits.length > 0 && (
            <button className="btn sm ghost" onClick={() => setManage(!manage)}>{manage ? 'Done' : 'Edit'}</button>
          )}
          <button className="btn sm primary" onClick={() => setShowAdd(true)}>+ Add</button>
        </div>
      </div>

      {habits.length === 0 && (
        <div className="card">
          <div className="card-title">Start with one or two</div>
          <p className="tag-note" style={{ marginBottom: 10 }}>
            Habits move the needle more than workouts — pick ones you can hit even on a bad day.
          </p>
          <div className="chip-row">
            {SUGGESTED.map((s) => (
              <button key={s.name} className="chip" onClick={() =>
                db.habits.add({ id: newHabitId(), name: s.name, emoji: s.emoji, createdAt: Date.now() })
              }>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* today's checklist */}
      {habits.length > 0 && (
        <div className="card pad-sm">
          <div className="card-title">Today</div>
          {habits.map((h) => {
            const isDone = done.has(`${h.id}|${today}`);
            return (
              <div key={h.id} className="li">
                <button
                  className="row grow"
                  style={{ textAlign: 'left', gap: 12 }}
                  onClick={() => toggle(h.id, today)}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    border: `2px solid ${isDone ? 'var(--accent)' : 'var(--border)'}`,
                    background: isDone ? 'var(--accent)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#052e1c', fontWeight: 800, fontSize: '0.9rem',
                  }}>
                    {isDone ? '✓' : ''}
                  </span>
                  <span style={{ fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.65 : 1 }}>
                    {h.emoji ? `${h.emoji} ` : ''}{h.name}
                  </span>
                </button>
                {manage && (
                  <button className="btn sm danger" onClick={() => db.habits.update(h.id, { archived: true })}>
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* week grid */}
      {habits.length > 0 && (
        <div className="card pad-sm" style={{ overflowX: 'auto' }}>
          <div className="card-title">This week</div>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: 'var(--text-faint)', fontWeight: 600, paddingBottom: 6 }}>Habit</th>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <th key={i} style={{ color: weekDates[i] === today ? 'var(--accent)' : 'var(--text-faint)', fontWeight: 700, paddingBottom: 6 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  <td style={{ padding: '4px 6px 4px 0', color: 'var(--text-dim)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.emoji ? `${h.emoji} ` : ''}{h.name}
                  </td>
                  {weekDates.map((d) => {
                    const isDone = done.has(`${h.id}|${d}`);
                    const future = d > today;
                    return (
                      <td key={d} style={{ textAlign: 'center', padding: 3 }}>
                        <button
                          disabled={future}
                          onClick={() => toggle(h.id, d)}
                          style={{
                            width: 22, height: 22, borderRadius: 6,
                            background: isDone ? 'var(--accent)' : future ? 'transparent' : 'var(--surface-3)',
                            border: future ? '1px dashed var(--border)' : 'none',
                            opacity: future ? 0.4 : 1,
                          }}
                          aria-label={`${h.name} on ${d}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="tag-note" style={{ marginTop: 6 }}>Tap any past day to fix a missed tick.</div>
        </div>
      )}

      {/* weekly chart */}
      {habits.length > 0 && logs.length > 0 && (
        <div className="card">
          <div className="card-title">Habits completed per day (this week)</div>
          <BarChart data={weeklyChart} series={['habits done']} colors={[VIZ.green]} height={120} />
        </div>
      )}

      {/* monthly dashboard */}
      {habits.length > 0 && (
        <div className="card pad-sm">
          <div className="card-title">Last 30 days</div>
          {monthly.map(({ habit, pct, days }) => (
            <div key={habit.id} style={{ padding: '7px 0' }}>
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>{habit.emoji ? `${habit.emoji} ` : ''}{habit.name}</span>
                <span className="tag-note">{days}/30 · {pct}%</span>
              </div>
              <div className="progressbar">
                <div style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--accent)' : pct >= 40 ? 'var(--warn)' : 'var(--danger)' }} />
              </div>
            </div>
          ))}
          <div className="tag-note" style={{ marginTop: 6 }}>70%+ is habit-formed territory. Consistency beats perfection.</div>
        </div>
      )}

      {showAdd && <AddHabit onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddHabit({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const save = async () => {
    if (!name.trim()) return;
    const habit: Habit = { id: newHabitId(), name: name.trim(), emoji: emoji.trim() || undefined, createdAt: Date.now() };
    await db.habits.add(habit);
    onClose();
  };
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New habit</h2>
        <div className="chip-row">
          {SUGGESTED.map((s) => (
            <button key={s.name} className="chip" onClick={() => { setName(s.name); setEmoji(s.emoji); }}>
              {s.emoji} {s.name}
            </button>
          ))}
        </div>
        <div className="row">
          <input className="input" style={{ width: 64, textAlign: 'center' }} placeholder="🙂" maxLength={4}
            value={emoji} onChange={(e) => setEmoji(e.target.value)} aria-label="Emoji" />
          <input className="input grow" autoFocus placeholder="Habit name" value={name}
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
        </div>
        <button className="btn primary big" disabled={!name.trim()} onClick={save}>Add habit</button>
      </div>
    </div>
  );
}
