
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

// Create a stable DOM node
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);

// Render with error boundary
try {
  root.render(<App />);
} catch (error) {
  console.error('Error rendering application:', error);
  root.render(
    <div className="p-4 text-red-600">
      <h1 className="text-xl font-bold">Error Loading Application</h1>
      <p>Something went wrong while loading the app. Please refresh the page and try again.</p>
      <pre className="mt-4 bg-gray-100 p-2 rounded text-sm overflow-auto">
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );
}
