// sw.js - Service Worker V9.9.9 lec-flix policial
// Cachea tots els arxius + 19 bancs data per funcionar offline

const CACHE_NAME = 'lec-flix-v9.12.12';

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
  
  // 19 BANCS JSON COMPLETS V9.9.9
  './data/banco_generes.json',
  './data/banco_estructura.json',
  './data/banco_personatge.json',
  './data/banco_personatges_generals.json',
  './data/banco_escenarios.json',
  './data/banco_escenarios_policial.json',
  './data/banco_lectura.json',
  './data/banco_lectura_aux.json', // NOU V9.9
  './data/banco_emocions.json',
  './data/banco_olors.json',
  './data/banco_sons.json',
  './data/banco_ubicacion.json',
  './data/banco_climax_polical.json',
  './data/banco_dialogos_policial.json', // NOU V9.9
  './data/banco_giros_policial.json', // NOU V9.9
  './data/banco_situaciones_diarias.json',
  './data/banco_temps.json' // NOU V9.9.7: temps any/mes/dia/event
  // './data/banco_terror.json' EXCLÒS per ara
];

// INSTAL·LAR: cachear tot + forçar activació
self.addEventListener('install', event => {
  console.log('SW V9.9.9 Installing... Cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cachejant arxius V9.9.9 - 19 bancs + JS nous');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW Install error:', err))
  );
});

// ACTIVAR: borrar cachés vells V9.22, V9.9, etc
self.addEventListener('activate', event => {
  console.log('SW V9.9.9 Activating... Borrant cachés vells');
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
 