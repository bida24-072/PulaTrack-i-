// public/sw.js
// -----------------------------------------------------------------------
// Minimal service worker: caches the app shell so PulaTrack can install
// as a PWA and reopen instantly / show something when offline.
// Deliberately does NOT cache Firebase/Firestore network calls — those
// must always hit the network so your financial data stays live and accurate.
// -----------------------------------------------------------------------
const CACHE_NAME = "pulatrack-shell-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never intercept Firebase/Firestore/Google auth calls — always network.
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("accounts.google.com")
  ) {
    return;
  }

  // Only handle same-origin GET requests (app shell, icons, JS/CSS bundles)
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline fallback to cache if network fails

      return cached || networkFetch;
    })
  );
});
