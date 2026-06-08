// sw.js - Service Worker V9.9 lec-flix policial
// Cachea tots els arxius + 15 bancs data per funcionar offline

const CACHE_NAME = 'lec-flix-v9.17';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './generaparagraf.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  
  // JS data loader
  './data/loadBancs.js',
  
  // 15 BANCS JSON COMPLETS V9.9
  './data/banco_generes.json',
  './data/banco_estructura.json',
  './data/banco_personatge.json',
  './data/banco_personatges_generals.json',
  './data/banco_escenarios.json',
  './data/banco_escenarios_policial.json',
  './data/banco_lectura.json',
  './data/banco_emocions.json',
  './data/banco_olors.json',
  './data/banco_sons.json',
  './data/banco_ubicacion.json',
  './data/banco_climax_polical.json',
  './data/banco_dialogos_policial.json',
  './data/banco_giros_policial.json',
  './data/banco_situaciones_diarias.json'
];

// INSTAL·LAR: cachear tot + forçar activació
self.addEventListener('install', event => {
  console.log('SW V9.9 Installing... Cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cachejant arxius V9.9 - 15 bancs + JS nous');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW Install error:', err))
  );
});

// ACTIVAR: borrar cachés vells V139, V117, V116, etc
self.addEventListener('activate', event => {
  console.log('SW V9.9 Activating... Borrant cachés vells');
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