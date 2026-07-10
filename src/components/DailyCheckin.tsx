import { useState } from 'react';
import { db, todayStr } from '../db';
import { Scale10, Stepper } from './inputs';

export default function DailyCheckin({ onClose }: { onClose: () => void }) {
  const [sleep, setSleep] = useState<number>();
  const [energy, setEnergy] = useState<number>();
  const [soreness, setSoreness] = useState<number>();
  const [knee, setKnee] = useState<number>();
  const [back, setBack] = useState<number>();
  const [weight, setWeight] = useState(0);

  const ready = sleep != null && energy != null && soreness != null && knee != null && back != null;

  const save = async () => {
    if (!ready) return;
    const date = todayStr();
    const existing = await db.checkins.where('date').equals(date).first();
    const data = { date, sleep: sleep!, energy: energy!, soreness: soreness!, knee: knee!, back: back! };
    if (existing?.id != null) await db.checkins.update(existing.id, data);
    else await db.checkins.add(data);
    if (weight > 0) {
      await db.bodyMetrics.add({ date, weightKg: weight });
    }
    onClose();
  };

  const Q = ({ title, hint, value, onChange, invert }: {
    title: string; hint: [string, string]; value?: number; onChange: (v: number) => void; invert?: boolean;
  }) => (
    <div>
      <div className="card-title">{title}</div>
      <Scale10 value={value} onChange={onChange} invert={invert} />
      <div className="row-between" style={{ marginTop: 4 }}>
        <span className="tag-note">1 · {hint[0]}</span><span className="tag-note">10 · {hint[1]}</span>
      </div>
    </div>
  );

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Daily check-in</h2>
        <Q title="Sleep quality last night" hint={['awful', 'amazing']} value={sleep} onChange={setSleep} invert />
        <Q title="Energy right now" hint={['drained', 'fresh']} value={energy} onChange={setEnergy} invert />
        <Q title="Muscle soreness" hint={['none', 'very sore']} value={soreness} onChange={setSoreness} />
        <Q title="Knee discomfort" hint={['quiet', 'painful']} value={knee} onChange={setKnee} />
        <Q title="Lower-back stiffness" hint={['loose', 'very stiff']} value={back} onChange={setBack} />
        <label className="field">
          <span className="lbl">Body weight (kg, optional — best measured in the morning)</span>
          <Stepper value={weight} onChange={setWeight} step={0.1} min={0} />
        </label>
        <button className="btn primary big" disabled={!ready} onClick={save}>Save check-in</button>
      </div>
    </div>
  );
}
