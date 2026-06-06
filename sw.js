const CACHE_NAME = 'lec-flix-v123';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './js/main.js',
  './js/generadorLlibre.js',
  './js/loadBancs.js',
  './data/banco_generes.json',
  './data/banco_estructura.json',
  './data/banco_personatge.json',
  './data/banco_escenarios.json',
  './data/banco_lectura.json',
  './data/banco_emocions.json',
  './data/banco_olors.json',
  './data/banco_sons.json',
  './data/banco_ubicacion.json'
];

// INSTALAR: cachear todo + forzar activación inmediata
self.addEventListener('install', event => {
  console.log('SW V8.2 Installing... Cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cachejant arxius V8.2');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW Install error:', err))
  );
});

// ACTIVAR: borrar cachés vells V117, V116, etc
self.addEventListener('activate', event => {
  console.log('SW V8.2 Activating... Borrant cachés vells');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Borrant caché vell:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: cache first, si falla va a xarxa
self.addEventListener('fetch', event => {
  // Ignorar peticions que no són GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(res => {
        if (res) {
          // console.log('SW: Servint des de caché', event.request.url);
          return res;
        }
        return fetch(event.request).then(response => {
          // Només cachejar responses OK i del mateix origen
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // Fallback: si no hi ha xarxa ni caché, torna index
        return caches.match('./index.html');
      })
  );
});
