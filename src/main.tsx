import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA auto-update and instant refresh on new deployment
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
    },
    onRegistered(r) {
      if (r) {
        setInterval(() => {
          r.update().catch(() => {});
        }, 60 * 1000);
      }
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);

