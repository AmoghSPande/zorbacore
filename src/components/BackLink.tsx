import { useNavigate } from 'react-router-dom';

export default function BackLink({ label = 'Back' }: { label?: string }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(-1)}
      style={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600, padding: '0 0 4px' }}
    >
      ‹ {label}
    </button>
  );
}
