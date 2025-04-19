
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker, checkForUpdates } from './utils/pwa';

// Register service worker
registerServiceWorker().then(() => {
  // Once the service worker is registered, check for updates
  checkForUpdates();
});

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
