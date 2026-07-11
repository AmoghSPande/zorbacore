import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, daysAgoStr, getProfile } from '../db';
import type { Meal, MealSlot, Profile } from '../types';
import { FOODS, type FoodItem } from '../data/foods';
import BackLink from '../components/BackLink';
import { BarChart, VIZ } from '../components/charts';
import { Stepper } from '../components/inputs';

const SLOTS: { id: MealSlot; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️' },
  { id: 'snacks', label: 'Snacks', emoji: '🍵' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙' },
];

export default function Food() {
  const [adding, setAdding] = useState<MealSlot | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, 1 = yesterday…
  const since = daysAgoStr(6);
  const meals = useLiveQuery(() => db.meals.where('date').aboveOrEqual(since).toArray(), []) ?? [];
  useEffect(() => { getProfile().then(setProfile); }, []);

  const day = daysAgoStr(dayOffset);
  const dayLabel = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Yesterday' : day;
  const dayMeals = meals.filter((m) => m.date === day);
  const kcal = Math.round(dayMeals.reduce((a, m) => a + m.kcal, 0));
  const protein = Math.round(dayMeals.reduce((a, m) => a + (m.protein ?? 0), 0));
  const kcalTarget = profile?.calorieTarget;
  const proteinTarget = profile?.proteinTarget;

  const weekChart = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = daysAgoStr(6 - i);
      const dayKcal = meals.filter((m) => m.date === d).reduce((a, m) => a + m.kcal, 0);
      return { label: d.slice(5).replace('-', '/'), values: [Math.round(dayKcal)] };
    });
  }, [meals]);
  const daysLogged = weekChart.filter((d) => d.values[0] > 0).length;
  const weekAvg = daysLogged ? Math.round(weekChart.reduce((a, d) => a + d.values[0], 0) / daysLogged) : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <BackLink />
          <h1>Food</h1>
          <div className="sub">Typical Indian home servings — log in two taps.</div>
        </div>
      </div>

      {/* day switcher — view or fix past days too */}
      <div className="row-between card pad-sm">
        <button className="btn sm ghost" disabled={dayOffset >= 6} onClick={() => setDayOffset(dayOffset + 1)}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{dayLabel}</span>
        <button className="btn sm ghost" disabled={dayOffset === 0} onClick={() => setDayOffset(dayOffset - 1)}>›</button>
      </div>

      {/* day totals */}
      <div className="card">
        <div className="grid-2">
          <div className="stat">
            <span className="v">{kcal}<small>{kcalTarget ? ` / ${kcalTarget}` : ''} kcal</small></span>
            <span className="k">{dayLabel.toLowerCase()}</span>
          </div>
          <div className="stat">
            <span className="v">{protein}<small>{proteinTarget ? ` / ${proteinTarget}` : ''} g</small></span>
            <span className="k">protein</span>
          </div>
        </div>
        {kcalTarget && (
          <div className="progressbar" style={{ marginTop: 10 }}>
            <div style={{ width: `${Math.min(100, (kcal / kcalTarget) * 100)}%`, background: kcal > kcalTarget ? 'var(--danger)' : 'var(--accent)' }} />
          </div>
        )}
        {proteinTarget && (
          <div className="progressbar" style={{ marginTop: 6 }}>
            <div style={{ width: `${Math.min(100, (protein / proteinTarget) * 100)}%`, background: 'var(--run)' }} />
          </div>
        )}
        {!kcalTarget && (
          <div className="tag-note" style={{ marginTop: 8 }}>Set calorie/protein targets in Settings to get the progress bars.</div>
        )}
      </div>

      {/* meals by slot */}
      {SLOTS.map((slot) => {
        const items = dayMeals.filter((m) => m.meal === slot.id);
        const slotKcal = Math.round(items.reduce((a, m) => a + m.kcal, 0));
        return (
          <div key={slot.id} className="card pad-sm">
            <div className="row-between" style={{ marginBottom: items.length ? 4 : 0 }}>
              <div className="card-title" style={{ margin: 0 }}>{slot.emoji} {slot.label}{slotKcal ? ` · ${slotKcal} kcal` : ''}</div>
              <button className="btn sm" onClick={() => setAdding(slot.id)}>+ Add</button>
            </div>
            {items.map((m) => (
              <div key={m.id} className="li">
                <div className="li-main">
                  <div className="li-title" style={{ fontSize: '0.9rem' }}>{m.name}{m.qty !== 1 ? ` ×${m.qty}` : ''}</div>
                  <div className="li-sub">{Math.round(m.kcal)} kcal{m.protein ? ` · ${Math.round(m.protein)}g protein` : ''}</div>
                </div>
                <button className="btn sm ghost" onClick={() => m.id != null && db.meals.delete(m.id)}>✕</button>
              </div>
            ))}
          </div>
        );
      })}

      {/* week chart */}
      {meals.length > 0 && (
        <div className="card">
          <div className="row-between">
            <div className="card-title" style={{ margin: 0 }}>Last 7 days</div>
            {weekAvg > 0 && <span className="badge info">avg {weekAvg} kcal/day</span>}
          </div>
          <div style={{ marginTop: 8 }}>
            <BarChart data={weekChart} series={['kcal']} colors={[VIZ.yellow]} height={120} />
          </div>
          <div className="tag-note" style={{ marginTop: 4 }}>
            Fat loss ≈ a modest daily deficit held for months. Protein + vegetables first; drinks and fried snacks are where calories hide.
          </div>
        </div>
      )}

      {adding && <AddMeal slot={adding} date={day} meals={meals} onClose={() => setAdding(null)} />}
    </div>
  );
}

function AddMeal({ slot, date, meals, onClose }: { slot: MealSlot; date: string; meals: Meal[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState(1);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState(0);

  // frequent foods first (from the last 7 days), then the full list
  const frequent = useMemo(() => {
    const count = new Map<string, number>();
    for (const m of meals) if (m.foodId) count.set(m.foodId, (count.get(m.foodId) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => FOODS.find((f) => f.id === id)).filter(Boolean) as FoodItem[];
  }, [meals]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s ? FOODS.filter((f) => f.name.toLowerCase().includes(s)) : [...frequent, ...FOODS.filter((f) => !frequent.includes(f))];
    return base.slice(0, 25);
  }, [q, frequent]);

  const save = async () => {
    if (picked) {
      await db.meals.add({
        date, meal: slot, name: picked.name, foodId: picked.id,
        qty, kcal: picked.kcal * qty, protein: picked.protein * qty, at: Date.now(),
      });
    } else if (customName.trim() && customKcal > 0) {
      await db.meals.add({
        date, meal: slot, name: customName.trim(), qty: 1, kcal: customKcal, at: Date.now(),
      });
    } else return;
    if (navigator.vibrate) navigator.vibrate(20);
    onClose();
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add to {slot}</h2>
        {!picked ? (
          <>
            <input className="input" autoFocus placeholder="Search foods… (roti, dal, dosa, chai)" value={q} onChange={(e) => setQ(e.target.value)} />
            <div style={{ maxHeight: '38dvh', overflowY: 'auto' }}>
              {list.map((f) => (
                <button key={f.id} className="li" style={{ width: '100%', textAlign: 'left' }} onClick={() => { setPicked(f); setQty(1); }}>
                  <div className="li-main">
                    <div className="li-title" style={{ fontSize: '0.9rem' }}>{f.name}</div>
                    <div className="li-sub">{f.unit} · {f.kcal} kcal · {f.protein}g protein</div>
                  </div>
                  <span className="li-end">+</span>
                </button>
              ))}
              {list.length === 0 && <div className="empty">Nothing found — add it as a custom entry below.</div>}
            </div>
            <div className="divider" />
            <div className="card-title">Custom entry</div>
            <div className="row">
              <input className="input grow" placeholder="Name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              <div style={{ width: 130 }}>
                <Stepper value={customKcal} onChange={setCustomKcal} step={25} />
              </div>
            </div>
            <button className="btn primary" disabled={!customName.trim() || customKcal <= 0} onClick={save}>Add custom ({customKcal} kcal)</button>
          </>
        ) : (
          <>
            <div className="card pad-sm">
              <div className="li-title">{picked.name}</div>
              <div className="li-sub">{picked.unit} · {picked.kcal} kcal · {picked.protein}g protein</div>
            </div>
            <label className="field">
              <span className="lbl">Quantity ({picked.unit})</span>
              <Stepper value={qty} onChange={setQty} step={0.5} min={0.5} />
            </label>
            <div className="row-between card pad-sm">
              <span className="tag-note">Total</span>
              <span style={{ fontWeight: 750 }}>{Math.round(picked.kcal * qty)} kcal · {Math.round(picked.protein * qty)}g protein</span>
            </div>
            <div className="row">
              <button className="btn ghost" onClick={() => setPicked(null)}>Back</button>
              <button className="btn primary grow" onClick={save}>Log it</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
