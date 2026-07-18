const CACHE_PREFIX = "nri-office-tour-v2";
const CACHE_NAME = `${CACHE_PREFIX}-__CACHE_VERSION__`;
const PRECACHE_PATHS = ["./", "BUILD_PRECACHE_PLACEHOLDER"]
  .filter((path) => path !== "BUILD_PRECACHE_PLACEHOLDER");

const scopedUrl = (path) => new URL(path, self.registration.scope).toString();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_PATHS.map(scopedUrl)),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith("nri-office-tour-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

const networkFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const indexUrl = request.url.endsWith("/")
      ? new URL("index.html", request.url)
      : null;
    return (await cache.match(request)) ??
      (indexUrl ? await cache.match(indexUrl) : null) ??
      (await cache.match(scopedUrl("./index.html")));
  }
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const wantsHtml = event.request.mode === "navigate" ||
    event.request.headers.get("accept")?.includes("text/html");
  event.respondWith(wantsHtml ? networkFirst(event.request) : cacheFirst(event.request));
});
