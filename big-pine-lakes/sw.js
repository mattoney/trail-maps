const TILE_CACHE = 'bp-tiles-v1';
const APP_CACHE = 'bp-app-v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // normalize tile subdomains a/b/c to the cached 'a' key
  const tileKey = url.replace(/https:\/\/[abc]\.tile\.opentopomap\.org/, 'https://a.tile.opentopomap.org');
  e.respondWith((async () => {
    const cached = await caches.match(tileKey !== url ? tileKey : e.request);
    if (cached) return cached;
    try {
      return await fetch(e.request);
    } catch (err) {
      // offline navigation fallback: serve the cached page shell
      if (e.request.mode === 'navigate') {
        const shell = await caches.match(new URL('./', self.registration.scope).pathname);
        if (shell) return shell;
        const app = await caches.open(APP_CACHE);
        const keys = await app.keys();
        const page = keys.find(k => new URL(k.url).origin === self.location.origin);
        if (page) return app.match(page);
      }
      throw err;
    }
  })());
});
