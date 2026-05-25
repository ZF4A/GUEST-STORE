import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize theme from store before render
const stored = localStorage.getItem('quest-store-app');
if (stored) {
  try {
    const data = JSON.parse(stored);
    if (data.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch { /* ignore */ }
}

// ─── Security Hardening ────────────────────────────────────────────────────────
// Disable right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Block DevTools keyboard shortcuts
document.addEventListener('keydown', (e) => {
  const isDevTools =
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'K')) ||
    (e.ctrlKey && e.key === 'U') ||
    (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'));
  if (isDevTools) e.preventDefault();
});

// Disable drag on images (prevents easy saving)
document.addEventListener('dragstart', (e) => {
  if ((e.target as HTMLElement).tagName === 'IMG') e.preventDefault();
});

// DevTools detection — desktop only (mobile browsers have large chrome that triggers false positives)
if (!/Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)) {
  let devtoolsOpen = false;
  const checkDevTools = () => {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const threshold  = 160;
    if ((widthDiff > threshold || heightDiff > threshold) && !devtoolsOpen) {
      devtoolsOpen = true;
      document.body.style.filter = 'blur(8px)';
    } else if (widthDiff <= threshold && heightDiff <= threshold && devtoolsOpen) {
      devtoolsOpen = false;
      document.body.style.filter = '';
    }
  };
  setInterval(checkDevTools, 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
