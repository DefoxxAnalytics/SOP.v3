/**
 * Service Worker for Versatex SOP Platform
 * Handles offline functionality, caching, and background sync
 */

const CACHE_NAME = 'versatex-sop-v3.0.5';
const RUNTIME_CACHE = 'versatex-runtime-v6';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './config.json',
    './manifest.json',
    
    // Styles
    './styles/base.css',
    './styles/theme.css',
    './styles/layout.css',
    './styles/progress.css',
    './styles/mobile-responsive.css',
    
    // Core JavaScript
    './core/app.js',
    './core/loader.js',
    './core/navigation.js',
    './core/sections.js',
    './core/search.js',
    './core/storage.js',
    './core/state.js',
    './core/progress.js',
    './core/pwa.js',
    './core/router.js',
    
    // Content JSON files
    './content/overview.json',
    './content/prerequisites.json',
    './content/data-collection.json',
    './content/quality-assessment.json',
    './content/data-cleansing.json',
    './content/categorization.json',
    './content/dashboard.json',
    './content/delivery.json',
    './content/quality.json',
    './content/risks.json',
    './content/appendices.json',
    
    // Images
    './assets/images/vtx_logo_white.png',
    './assets/images/icon-192x192.png',
    './assets/images/icon-512x512.png',
    
    // External dependencies (with fallback to CDN)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS.map(url => {
                    // Handle external URLs
                    if (url.startsWith('http')) {
                        return url;
                    }
                    // For relative URLs, just return as-is
                    return url;
                }));
            })
            .then(() => {
                console.log('[Service Worker] Static assets cached successfully');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[Service Worker] Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Delete old cache versions
                            return cacheName.startsWith('versatex-') && 
                                   cacheName !== CACHE_NAME && 
                                   cacheName !== RUNTIME_CACHE;
                        })
                        .map(cacheName => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated and old caches cleared');
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Handle API calls differently
    if (url.pathname.includes('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }
    
    // Network-first strategy for HTML (to get latest content)
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }
    
    // Cache-first strategy for static assets
    event.respondWith(cacheFirstStrategy(request));
});

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Return from cache but also update cache in background
            updateCache(request, cache);
            return cachedResponse;
        }
        
        // Not in cache, fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        
        // Return offline page if available
        const cache = await caches.open(CACHE_NAME);
        const offlineResponse = await cache.match('./index.html');
        return offlineResponse || new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network-first strategy (for HTML and dynamic content)
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to main cached page
        const staticCache = await caches.open(CACHE_NAME);
        return staticCache.match('./index.html') || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Handle API requests with offline queue
async function handleApiRequest(request) {
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        // Queue for background sync if it's a POST/PUT request
        if (request.method === 'POST' || request.method === 'PUT') {
            await queueRequest(request);
            return new Response(JSON.stringify({
                queued: true,
                message: 'Request queued for sync when online'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Return cached data for GET requests
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        
        return cachedResponse || new Response(JSON.stringify({
            error: 'Offline - No cached data available'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Update cache in background
async function updateCache(request, cache) {
    try {
        const freshResponse = await fetch(request);
        if (freshResponse && freshResponse.status === 200) {
            cache.put(request, freshResponse);
        }
    } catch (error) {
        // Silent fail - we already returned from cache
    }
}

// Queue requests for background sync
async function queueRequest(request) {
    const queue = await getQueue();
    queue.push({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        timestamp: Date.now()
    });
    await saveQueue(queue);
}

// Get sync queue from IndexedDB
async function getQueue() {
    // Simplified - in production, use IndexedDB
    try {
        const data = await self.registration.sync.getTags();
        return JSON.parse(data[0] || '[]');
    } catch {
        return [];
    }
}

// Save sync queue
async function saveQueue(queue) {
    // Simplified - in production, use IndexedDB
    try {
        await self.registration.sync.register('sync-queue');
    } catch (error) {
        console.error('[Service Worker] Failed to register sync:', error);
    }
}

// Background sync event
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-queue') {
        event.waitUntil(processQueue());
    }
});

// Process queued requests
async function processQueue() {
    const queue = await getQueue();
    const failed = [];
    
    for (const item of queue) {
        try {
            await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.body
            });
        } catch (error) {
            failed.push(item);
        }
    }
    
    await saveQueue(failed);
}

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ cleared: true });
            })
        );
    }
});

// Periodic background sync for checking updates
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-updates') {
        event.waitUntil(checkForUpdates());
    }
});

// Check for content updates
async function checkForUpdates() {
    try {
        const response = await fetch('/api/version');
        const data = await response.json();
        
        if (data.version !== CACHE_NAME) {
            // Notify clients about update
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'UPDATE_AVAILABLE',
                    version: data.version
                });
            });
        }
    } catch (error) {
        console.log('[Service Worker] Update check failed:', error);
    }
}

console.log('[Service Worker] Loaded and ready');