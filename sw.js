// Sharecar Service Worker v4.0
const CACHE = 'sharecar-v5';
const STATIC = [
  '/',
  '/index.html',
  '/css/app.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/js/supabase.js',
  '/js/nav.js',
  '/js/unread.js',
  '/app/index.html',
  '/app/auth.html',
  '/app/profile.html',
  '/app/messages.html',
  '/app/chat.html',
  '/app/rating.html',
  '/app/event-card.html',
  '/app/car-card.html',
  '/app/add-car.html',
  '/app/search.html',
  '/app/partners.html',
  '/app/create-event.html',
  '/app/onboarding.html',
  '/app/user-profile.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API — всегда сеть
  if (url.hostname.includes('supabase.co')) return;

  // CDN — кэш первый
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('cdnjs')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }))
    );
    return;
  }

  // Навигация — сеть первая, fallback кэш
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request) || caches.match('/index.html'))
    );
    return;
  }

  // Всё остальное — кэш первый
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(response => {
      if (response && response.status === 200 && e.request.method === 'GET') {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return response;
    }))
  );
});
