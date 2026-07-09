import { NavLink } from 'react-router-dom';

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    to: '/train',
    label: 'Train',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M7 12h10" /><rect x="3" y="8" width="3" height="8" rx="1" /><rect x="18" y="8" width="3" height="8" rx="1" />
        <rect x="5.5" y="6" width="2" height="12" rx="1" /><rect x="16.5" y="6" width="2" height="12" rx="1" />
      </svg>
    ),
  },
  {
    to: '/run',
    label: 'Run',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="4.5" r="1.8" />
        <path d="M12.5 8.5 15 7l3 2.5 2.5-.5" /><path d="m15 7-4.5 3L12 13l-3.5 4.5" /><path d="M12 13l3 2 1 4.5" /><path d="M4 13.5 8 13" />
      </svg>
    ),
  },
  {
    to: '/coach',
    label: 'Coach',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7z" /><path d="m9 12 2 2 4-4.5" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" />
      </svg>
    ),
  },
];

export default function Nav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
          {t.icon}
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
