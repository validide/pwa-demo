'use strict';

const APP_PREFIX = 'pwa-demo';
const APP_VERSION = 'v1';
const CACHE_PREFIX = `${APP_PREFIX}/${APP_PREFIX}`;
const STATIC_CACHE_NAME = `${CACHE_PREFIX}/static-cache/`;
const API_CACHE_NAME = `${CACHE_PREFIX}/api-cache/`;
const URLS_TO_CACHE = [
  '/',
  '/index.html',
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');

  // Remove previous cached data from disk
  evt.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(URLS_TO_CACHE);
    })
  );


  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');

  // Remove previous cached data from disk
  evt.waitUntil(
    caches.keys().then((keyList) => {
      // `keyList` contains all cache names under your site `xxx.contoso.com`
      // filter out ones that have this app prefix to create white list
      const cacheWhitelist = [
        STATIC_CACHE_NAME,
        API_CACHE_NAME
      ];

      return Promise.all(keyList.map((key) => {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

});

self.addEventListener('fetch', (evt) => {
  console.log('[Service Worker] Fetch', evt.request.url);

  var isApiCall = evt.request.url.includes('/api-data/');
  if (isApiCall) {
    console.log('[Service Worker] Fetch API call', evt.request.url);
    evt.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
          .then((response) => {
            // If the response was good, clone it and store it in the cache
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          }).catch((err) => {
            // Network request failed, try to get it from the cache
            return cache.match(evt.request);
          });
      }));
  } else {
    console.log('[Service Worker] Fetch STATIC call', evt.request.url);
    evt.respondWith(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.match(evt.request)
          .then((response) => {
            return response || fetch(evt.request);
          });
      })
    );
  }

});
