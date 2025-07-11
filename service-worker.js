// service-worker.js
// Service Worker para PWA - cache moderno e seguro
// Atualizado para melhores práticas em 2024

const CACHE_NAME = 'resellsneakers-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Adicione outros arquivos essenciais aqui
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
}); 