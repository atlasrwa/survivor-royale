// Service Worker for Survivor Royale PWA
// Provides offline caching for game assets (sprites, audio, code bundles)

const CACHE_NAME = 'survivor-royale-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API/HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and external resources
  if (event.request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin)) return;

  // Cache-first for static assets (sprites, audio, fonts, JS bundles)
  if (
    url.pathname.startsWith('/sprites/') ||
    url.pathname.startsWith('/audio/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.ogg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML/API
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && url.pathname === '/') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
