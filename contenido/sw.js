/* Content OS — cache primero, para que el plan del mes abra sin internet.
   Al cambiar banco.json hay que subir la versión, si no el celular
   sigue mostrando el banco viejo. */
const CACHE = 'contentos-v1';
const ARCHIVOS = ['./', './index.html', './banco.json', './canva.json',
                  './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>Promise.all(ARCHIVOS.map(f=>c.add(f).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      /* Se devuelve lo cacheado enseguida y se refresca por detrás,
         así el banco se actualiza solo en la siguiente apertura. */
      const red = fetch(e.request).then(r=>{
        if(r && r.status === 200 && r.type === 'basic'){
          const copia = r.clone();
          caches.open(CACHE).then(c=>c.put(e.request, copia));
        }
        return r;
      }).catch(()=>hit);
      return hit || red;
    })
  );
});
