var CACHE_NAME = 'ndt-calc-v1';
var urlsToCache = [
  '/ndt-calc/',
  '/ndt-calc/index.html',
  '/ndt-calc/manifest.json'
];

// 설치 시 캐시에 저장
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 활성화 시 오래된 캐시 삭제
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// 요청 시 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if(response) return response;
      return fetch(event.request).then(function(networkResponse) {
        if(!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(function() {
        return caches.match('/ndt-calc/index.html');
      });
    })
  );
});
