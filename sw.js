/*
 * React版で使用していた旧Service Workerから現行版へ移行するための
 * 互換ファイルです。新しいアプリ本体はservice-worker.jsを使用します。
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    const legacyCaches = cacheNames.filter((name) =>
      name.startsWith("workbox-") &&
      (name.includes("nri-office-tour") || name.includes(self.registration.scope)),
    );
    await Promise.all(legacyCaches.map((name) => caches.delete(name)));
    await self.registration.unregister();

    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    await Promise.all(windows.map((client) => client.navigate(client.url)));
  })());
});
