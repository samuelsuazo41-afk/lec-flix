// sw.js - Service Worker V12.1.2 lec-flix policial
// Cachea tots els arxius + 19 bancs data per funcionar offline

const CACHE_NAME = 'lec-flix-v12.4.4';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './generaparagraf.js',
  './generarLlibre.js', // <- AFEGIT: motor híbrid
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  
  // JS data loader
  './data/loadBancs.js',
  
  // 19 BANCS JSON COMPLETS V9.9.9
  './data/banco_generes.json',
  './data/banco_estructura.json',
  './data/banco_personatge.json',
  './data/banco_personatges_generals.json',
  './data/banco_escenarios.json',
  './data/banco_escenarios_policial.json',
  './data/banco_lectura.json',
  './data/banco_lectura_aux.json',
  './data/banco_emocions.json',
  './data/banco_olors.json',
  './data/banco_sons.json',
  './data/banco_ubicacion.json',
  './data/banco_climax_polical.json',
  './data/banco_dialogos_policial.json',
  './data/banco_giros_policial.json',
  './data/banco_situaciones_diarias.json',
  './data/banco_temps.json'
];

// INSTAL·LAR: cachear tot + forçar activació
self.addEventListener('install', event => {
  console.log('SW V12.1.2 Installing... Cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cachejant arxius V12.1.2 - 19 bancs + JS nous');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW Install error:', err))
  );
});

// ACTIVAR: borrar cachés vells
self.addEventListener('activate', event => {
  console.log('SW V12.1.2 Activating... Borrant cachés vells');
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

// FETCH: servir des de cache, fallback a network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
