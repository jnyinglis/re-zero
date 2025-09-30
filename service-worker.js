const CACHE_VERSION = "v3";
const CACHE_NAME = `rz-cache-${CACHE_VERSION}`;
const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "sw.skipWaiting") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const keysToDelete = cacheKeys.filter((key) => key !== CACHE_NAME);

      await Promise.all(keysToDelete.map((key) => caches.delete(key)));
      await self.clients.claim();

      if (keysToDelete.length > 0) {
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        clients.forEach((client) =>
          client.postMessage({ type: "sw.updated", version: CACHE_VERSION })
        );
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
