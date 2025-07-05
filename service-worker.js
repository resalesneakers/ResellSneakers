const CACHE_NAME = 'resellsneakers-v1';
const urlsToCache = [
  '/',
  '/home.html',
  '/index.html',
  '/produtos.html',
  '/meu-perfil.html',
  '/favoritos.html',
  '/vender.html',
  '/produtos.js',
  '/meus-produtos.js',
  '/firebase-config.js',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/banner1.png',
  '/images/banner2.png',
  '/images/banner3.png',
  // Adicione outros assets importantes
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
}); 