import { useState } from 'react';
import { PRO_CONFIG } from '../pro-config';
import { activateLicense, deactivateLicense, savedLicenseKey, useIsPro } from '../lib/pro';

const PERKS = [
  { icon: '📄', title: 'PDF & print reports', note: 'Export a clean training + progress report to save, print, or share with a coach or doctor.' },
  { icon: '💙', title: 'Supporter badge', note: 'A small thank-you mark on your profile for keeping Zorbacore running.' },
  { icon: '🚀', title: 'First in line', note: 'New extras land for supporters first. Your family keeps every core feature free, always.' },
];

/** Pro upgrade + license activation. Used inline in Settings and inside ProModal. */
export default function ProUpgrade({ onDone }: { onDone?: () => void }) {
  const isPro = useIsPro();
  const [key, setKey] = useState(savedLicenseKey());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (isPro) {
    return (
      <div>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: '1.4rem' }}>💙</span>
          <div>
            <div style={{ fontWeight: 700 }}>Zorbacore Pro is active</div>
            <div className="tag-note">Thank you for supporting the project.</div>
          </div>
        </div>
        <button
          className="btn ghost sm"
          onClick={() => { deactivateLicense(); setKey(''); setMsg(null); }}
        >
          Remove Pro from this device
        </button>
      </div>
    );
  }

  const activate = async () => {
    setBusy(true);
    setMsg(null);
    const r = await activateLicense(key);
    setMsg({ ok: r.ok, text: r.message });
    setBusy(false);
    if (r.ok && onDone) setTimeout(onDone, 900);
  };

  return (
    <div>
      <div style={{ fontWeight: 750, fontSize: '1.05rem', marginBottom: 2 }}>Zorbacore Pro</div>
      <div className="tag-note" style={{ marginBottom: 12 }}>
        Everything your family uses stays free — Pro just unlocks a few extras and helps keep the project alive.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {PERKS.map((p) => (
          <div key={p.title} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{p.icon}</span>
            <div>
              <div style={{ fontWeight: 650, fontSize: '0.92rem' }}>{p.title}</div>
              <div className="tag-note">{p.note}</div>
            </div>
          </div>
        ))}
      </div>

      <a className="btn primary big" href={PRO_CONFIG.checkoutUrl || undefined} target="_blank" rel="noopener noreferrer">
        {PRO_CONFIG.priceHint ? `Get Pro — ${PRO_CONFIG.priceHint}` : 'Get Pro'}
      </a>
      <div className="tag-note" style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.74rem' }}>
        Secure checkout by Gumroad — they handle payment, tax & refunds. Zorbacore never sees your card.
      </div>

      <div className="divider" />
      <div className="card-title">Already bought? Enter your license key</div>
      <div className="row">
        <input
          className="input grow"
          placeholder="XXXXXXXX-XXXXXXXX-…"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="off"
        />
        <button className="btn" disabled={busy || !key.trim()} onClick={activate}>
          {busy ? '…' : 'Activate'}
        </button>
      </div>
      {msg && (
        <div className="tag-note" style={{ marginTop: 8, color: msg.ok ? 'var(--accent)' : 'var(--danger)' }}>
          {msg.text}
        </div>
      )}
    </div>
  );
}

export function ProModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <ProUpgrade onDone={onClose} />
        <button className="btn ghost" style={{ marginTop: 4 }} onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}
