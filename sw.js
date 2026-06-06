const CACHE_NAME = 'lec-flix-test-v99';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './core/generadorLlibre.js', // 
  './manifest.json',
  './sw.js',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './data/loadBancs.js', // 
  './data/banco_emocions.json',
  './data/banco_escenarios.json',
  './data/banco_estructura.json',
  './data/banco_generes.json',
  './data/banco_lectura.json',
  './data/banco_olors.json',
  './data/banco_personatge.json',
  './data/banco_sons.json',
  './data/banco_ubicacion.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(res => res || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }))
      .catch(() => caches.match('./index.html'))
  );
});