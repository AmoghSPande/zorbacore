import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getProfile } from '../db';
import { llmAnswer, ruleAnswer } from '../lib/chatCoach';
import BackLink from '../components/BackLink';

const SUGGESTIONS = [
  'What should I train today?',
  'My knee hurts today — what should I do?',
  'Give me a 30-minute workout',
  'How can I improve my 5K time?',
  'Why is my lower back stiff?',
  'How do I perform a Romanian deadlift?',
  'What should I do this week to reduce visceral fat?',
];

/** Minimal markdown: **bold** and bullet lines. */
function Md({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith('**') ? <b key={j}>{p.slice(2, -2)}</b> : p,
        );
        return <div key={i} style={{ minHeight: line.trim() ? undefined : 8 }}>{parts}</div>;
      })}
    </>
  );
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>();
  const messages = useLiveQuery(() => db.chat.orderBy('at').toArray(), []) ?? [];
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getProfile().then((p) => setApiKey(p.anthropicApiKey)); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    await db.chat.add({ role: 'user', content: q, at: Date.now() });
    let answer: string;
    try {
      if (apiKey) {
        answer = await llmAnswer(q, apiKey, messages.map((m) => ({ role: m.role, content: m.content })));
      } else {
        answer = await ruleAnswer(q);
      }
    } catch {
      answer = (await ruleAnswer(q)) + '\n\n_(AI request failed — answered from built-in coaching rules.)_';
    }
    await db.chat.add({ role: 'coach', content: answer, at: Date.now() });
    setBusy(false);
  };

  return (
    <div className="page" style={{ minHeight: '100dvh' }}>
      <div className="page-head">
        <div>
          <BackLink />
          <h1>Coach chat</h1>
          <div className="sub">{apiKey ? 'AI coach — knows your training data' : 'Built-in coach — answers from your data'}</div>
        </div>
        {messages.length > 0 && (
          <button className="btn sm ghost" onClick={() => db.chat.clear()}>Clear</button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="card">
          <div className="card-title">Ask me anything about your training</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="btn sm" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            className="card pad-sm"
            style={{
              maxWidth: '88%',
              fontSize: '0.9rem',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'var(--accent-dim)' : 'var(--surface)',
              borderColor: m.role === 'user' ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <Md text={m.content} />
          </div>
        ))}
        {busy && <div className="card pad-sm" style={{ alignSelf: 'flex-start', color: 'var(--text-dim)' }}>thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="row" style={{ position: 'sticky', bottom: 'calc(var(--nav-h) + var(--sab) + 8px)' }}>
        <input
          className="input grow"
          placeholder="Ask your coach…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
        />
        <button className="btn primary" onClick={() => send(input)} disabled={busy || !input.trim()}>Send</button>
      </div>
    </div>
  );
}
