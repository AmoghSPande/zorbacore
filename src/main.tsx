import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';
import { seedIfNeeded } from './data/seed';
import { startCloud } from './lib/cloud';

const updateSW = registerSW({
  onNeedRefresh() {
    if (document.querySelector('.update-toast')) return;
    const toast = document.createElement('div');
    toast.className = 'update-toast';
    toast.innerHTML = '<span>A new version is ready.</span>';
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.textContent = 'Update';
    btn.onclick = () => updateSW(true);
    const later = document.createElement('button');
    later.className = 'btn ghost';
    later.textContent = 'Later';
    later.onclick = () => toast.remove();
    toast.append(btn, later);
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
