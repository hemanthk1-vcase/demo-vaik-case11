import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Dev-only: prevent a stale service worker / browser cache from serving
// mismatched Vite dep chunks (e.g. an old "react" chunk alongside a fresh
// "react-dom" chunk), which throws "Cannot read properties of null (reading 'useState')".
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((regs) =>
      Promise.all(regs.map((r) => r.unregister()))
    ).catch(() => {});
    if (window.caches) {
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('vite') || k.startsWith('workbox')).map((k) => caches.delete(k)))
      ).catch(() => {});
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)