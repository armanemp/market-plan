const CACHE_NAME = "market-plan-shell-v1";
const BASE = new URL("./", self.registration.scope);
const SHELL = [
  new URL("./index.html", BASE).href,
  new URL("./manifest.webmanifest", BASE).href,
  new URL("./icons/market-plan.svg", BASE).href
];
const SHELL_PATHS = new Set(SHELL.map((url) => new URL(url).pathname));

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("market-plan-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !SHELL_PATHS.has(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        const fallback = await cache.match(new URL("./index.html", BASE).href);
        if (fallback) return fallback;
      }
      return new Response("این بخش در حالت آفلاین در دسترس نیست.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
