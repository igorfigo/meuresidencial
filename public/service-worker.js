// Service Worker version for cache management
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `meu-residencial-cache-${CACHE_VERSION}`;

// Resources to pre-cache
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/login',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/e14c91d4-7977-4bf3-b197-04e6f56dfed2.png'
];

// Install event - pre-cache essential resources
self.addEventListener('install', (event) => {
  // Skip waiting to force the new service worker to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service worker installing cache:', CACHE_NAME);
      return cache.addAll(INITIAL_CACHED_RESOURCES);
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Service worker removing old cache:', key);
            return caches.delete(key);
          }
        }));
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip non-HTTP requests and requests to Supabase API
  if (!event.request.url.startsWith('http') || 
      event.request.url.includes('kcbvdcacgbwigefwacrk.supabase.co')) {
    return;
  }
  
  // Cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // If response is valid, add it to cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If both cache and network fail, return a fallback for HTML requests
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/login');
          }
        });
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  // Check for update command
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log('Service worker checking for updates...');
    self.registration.update();
  }
});
