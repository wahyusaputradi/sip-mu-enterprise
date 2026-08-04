const CACHE_NAME = 'sip-mu-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/images/logo.png',
    '/favicon.ico',
    '/favicon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    // Network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Return response from network
                return response;
            })
            .catch(() => {
                // Network failed, return from cache
                return caches.match(event.request);
            })
    );
});
