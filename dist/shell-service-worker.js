'use strict';

const APP_PREFIX = 'pwa-demo';
const APP_VERSION = 'v1';
const CACHE_PREFIX = `${APP_PREFIX}/${APP_PREFIX}`;
const STATIC_CACHE_NAME = `${CACHE_PREFIX}/static-cache/`;
const API_CACHE_NAME = `${CACHE_PREFIX}/api-cache/`;
const CDN_CACHE_NAME = `${APP_PREFIX}/v1/cdn-cache/`;
const URLS_TO_CACHE = [
  './',
  './favicon.ico',
  './index.html',
  './styles/shell.css',
  './scripts/shell.js',
  './images/icons/icon-72x72.png',
  './images/icons/icon-96x96.png',
  './images/icons/icon-128x128.png',
  './images/icons/icon-144x144.png',
  './images/icons/icon-152x152.png',
  './images/icons/icon-192x192.png',
  './images/icons/icon-384x384.png',
  './images/icons/icon-512x512.png',
  './pages/vuejs/index.html',
  './pages/reactjs/index.html',
  './pages/about/index.html'
];
const CDN_URLS_TO_CACHE = [
  'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js',
  'https://code.jquery.com/jquery-3.4.1.slim.min.js',
  'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
  'https://cdn.jsdelivr.net/npm/react@16.12.0/umd/react.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-dom@16.12.0/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/babel-standalone@6.26.0/babel.min.js'
];

const cacheItems = function (cacheName, urls) {
  console.log(`[ServiceWorker] Pre-caching "${cacheName}" items`);
  return caches
    .open(cacheName)
    .then(cache => cache.addAll(urls));
}
const fetchFromCache = function(evt, cacheName) {
  evt.respondWith(caches.open(cacheName).then((cache) => {
    return cache.match(evt.request)
      .then((response) => {
        return response || fetch(evt.request);
      });
  }));
}
const isApiCall = (request) => request.url.includes('/my-future-api/');
const isStaticResourceCall = (request) => URLS_TO_CACHE.indexOf(request.url) !== -1;
const isCdnResourceCall = (request) => CDN_URLS_TO_CACHE.indexOf(request.url) !== -1;

self.addEventListener('install', (evt) => {
  // The promise that skipWaiting() returns can be safely ignored
  self.skipWaiting();

  console.log('[ServiceWorker] Install');

  evt.waitUntil(Promise.all(
    [
      cacheItems(STATIC_CACHE_NAME, URLS_TO_CACHE),
      cacheItems(CDN_CACHE_NAME, CDN_URLS_TO_CACHE)
    ]
  ));

});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');

  // Remove previous cached data from disk
  evt.waitUntil(
    caches.keys().then((keyList) => {
      // `keyList` contains all cache names under your site `xxx.contoso.com`
      // filter out ones that have this app prefix to create white list
      const cacheWhitelist = [
        CDN_CACHE_NAME,
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

  if (isApiCall(evt.request)) {
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
      return;
  }

  if (isCdnResourceCall(evt.request)) {
    fetchFromCache(evt, STATIC_CACHE_NAME);
    return;
  }

  fetchFromCache(evt, STATIC_CACHE_NAME);
});
