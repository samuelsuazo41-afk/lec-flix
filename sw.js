// sw.js - Service Worker V14.3.0 lec-flix policial HÍBRID
// Cachea TOTS els arxius + 23 bancs data per funcionar offline

const CACHE_NAME = 'lec-flix-v14.5.5';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './generarllibre.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  
  // JS data loader V14.3.0
  './data/loadBancs.js',
  
  // 23 BANCS JSON COMPLETS V14.3.0
  './data/banco_generes.json',
  './data/banco_estructura.json',
  './data/banco_personatge.json',
  './data/banco_personatges_generals.json',
  './data/banco_escenarios.json',
  './data/banco_escenarios_policial.json',
  './data/banco_ubicacion.json',
  './data/banco_ubicacion_policial.json',
  './data/banco_lectura.json',
  './data/banco_lectura_aux.json',
  './data/banco_lectura_policial.json',
  './data/banco_emocions.json',
  './data/banco_olors.json',
  './data/banco_sons.json',
  './data/banco_climax_polical.json',
  './data/banco_dialogos_policial.json',
  './data/banco_giros_policial.json',
  './data/banco_situaciones_diarias.json',
  './data/banco_temps.json',
  './data/banco_temps_policial.json',
  './data/banco_plantillas.json',
  './data/banco_ritmes.json',
  './data/banco_variables.json'
];

// INSTAL·LAR: cachear tot + forçar activació
self.addEventListener('install', event => {
  console.log('SW V14.3.0 Installing... Cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cachejant arxius V14.3.0 - 23 bancs + JS nous');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW Install error:', err))
  );
});

// ACTIVAR: borrar cachés vells
self.addEventListener('activate', event => {
  console.log('SW V14.3.0 Activating... Borrant cachés vells');
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