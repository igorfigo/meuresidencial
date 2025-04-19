
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, checkForUpdates } from './utils/pwa';

// Register service worker
registerServiceWorker().then((registration) => {
  if (registration) {
    // Check for updates every 1 hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
    
    // Listen for new service worker installation
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          // When the new service worker is installed and waiting
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Force the page to reload to activate the new service worker
            window.location.reload();
          }
        });
      }
    });
  }
});

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
