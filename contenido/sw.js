/* Content OS — todo el contenido va dentro de index.html, así que con cachear
   la app alcanza para que abra sin internet.
   Al publicar contenido nuevo hay que subir la versión, si no el celular
   sigue mostrando la app vieja. */
const CACHE = 'contentos-v4';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest',
                  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(ARCHIVOS.map(f => c.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    /* Se muestra lo cacheado enseguida y se refresca por detrás:
       la próxima vez que abra ya tiene lo nuevo. */
    const red = fetch(e.request).then(r => {
      if (r && r.status === 200 && r.type === 'basic') {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return r;
    }).catch(() => hit);
    return hit || red;
  }));
});
