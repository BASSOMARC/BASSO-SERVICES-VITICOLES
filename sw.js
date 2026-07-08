const CACHE = 'basso-erp-v2';
const ASSETS = [
  '/BASSO-SERVICES-VITICOLES/',
  '/BASSO-SERVICES-VITICOLES/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Borrar caches antiguas automáticamente
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('Borrando cache antigua:', k);
        return caches.delete(k);
      }))
    )
  );
  // Tomar control inmediatamente de todas las pestañas
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('supabase.co')) return;

  e.respondWith(
    // Network first: siempre intenta la red primero
    fetch(e.request)
      .then(res => {
        // Guardar en cache la versión más reciente
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // Solo si falla la red, usar cache
        return caches.match(e.request);
      })
  );
});

// Notificar a los clientes cuando hay actualización
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
