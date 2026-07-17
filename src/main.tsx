import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';
import { seedIfNeeded } from './data/seed';
import { startCloud } from './lib/cloud';

// Clickjacking guard: GitHub Pages can't send X-Frame-Options and a <meta> CSP
// can't set frame-ancestors, so refuse to run inside a frame we don't own.
if (window.top !== window.self) {
  try {
    if (window.top!.location.origin !== window.location.origin) {
      document.documentElement.textContent = '';
      window.top!.location.href = window.location.href;
    }
  } catch {
    // cross-origin framer blocks access — break out to our own top-level page
    window.top!.location.href = window.location.href;
  }
}

const updateSW = registerSW({
  onNeedRefresh() {
    if (document.querySelector('.update-toast')) return;
    const toast = document.createElement('div');
    toast.className = 'update-toast';
    // built with DOM APIs (no innerHTML) so no markup is ever parsed from a string
    const msg = document.createElement('span');
    msg.textContent = 'A new version is ready.';
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.textContent = 'Update';
    btn.onclick = () => updateSW(true);
    const later = document.createElement('button');
    later.className = 'btn ghost';
    later.textContent = 'Later';
    later.onclick = () => toast.remove();
    toast.append(msg, btn, later);
    document.body.appendChild(toast);
  },
});

startCloud();
seedIfNeeded().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <App />
        </HashRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  );
});
