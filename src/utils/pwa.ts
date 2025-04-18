
/**
 * PWA utility functions for managing the service worker and app installation
 */

/**
 * Register the service worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Check for service worker updates
 */
export const checkForUpdates = () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_UPDATE'
    });
  }
};

// A variable to store the deferred prompt
let deferredPrompt: any;

/**
 * Setup the install prompt event
 * @returns A function that can be used to prompt the user to install the app
 */
export const setupInstallPrompt = (): (() => Promise<boolean>) => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Store the event so it can be triggered later
    deferredPrompt = e;
    console.log('App can be installed');
  });

  // Function to show the install prompt
  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('App already installed or not installable');
      return false;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    return choiceResult.outcome === 'accepted';
  };

  return promptInstall;
};

/**
 * Check if the app is in standalone mode (installed)
 */
export const isAppInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         // @ts-ignore: navigator.standalone is not in the TypeScript types
         (navigator.standalone === true);
};
