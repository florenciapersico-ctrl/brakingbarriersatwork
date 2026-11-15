/* AT WORK · Tu espacio — service worker.
   Guarda los archivos de la app para que abra rápido y, sin señal, muestre la
   pantalla en vez de un error. Estrategia: red primero (siempre la última
   versión), caché como respaldo. Solo toca archivos propios: Supabase, Flor AI
   y las tipografías de Google van directo a la red y nunca se guardan acá.
   Si agregás un archivo a app/, sumalo a SHELL y subí la versión de CACHE. */

const CACHE = 'at-work-app-v1';
const SHELL = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './config.js',
  './datos.js',
  './programa.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => {
          if (hit) return hit;
          if (req.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        })
      )
  );
});
