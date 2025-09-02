const CACHE_NAME = 'maplehub-v1';
const STATIC_CACHE = 'maplehub-static-v1';
const DYNAMIC_CACHE = 'maplehub-dynamic-v1';

// Get the base path for GitHub Pages
const getBasePath = () => {
  // Check if we're on GitHub Pages
  if (location.hostname.includes('github.io')) {
    return '/maplehub';
  }
  return '';
};

const BASE_PATH = getBasePath();

const STATIC_ASSETS = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/favicon.ico',
  BASE_PATH + '/maple-leaf.svg',
  BASE_PATH + '/placeholder.svg',
  BASE_PATH + '/404.html',
  BASE_PATH + '/_redirects'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;
  
  // Handle GitHub Pages routing
  if (request.url.includes('github.io') && !request.url.includes('?/')) {
    const url = new URL(request.url);
    if (url.pathname !== '/' && url.pathname !== '/index.html' && !url.pathname.includes('.')) {
      // This is a route, serve index.html
      event.respondWith(
        caches.match(BASE_PATH + '/index.html').then((response) => {
          return response || fetch(request);
        })
      );
      return;
    }
  }
  
  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }
      
      // Clone the request for fetch
      const fetchRequest = request.clone();
      
      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response for caching
        const responseToCache = response.clone();
        
        // Cache dynamic assets
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}
