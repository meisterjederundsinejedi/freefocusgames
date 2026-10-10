/*
  MamahJong service worker: makes the collection work without internet.

  - Build files (/_next/static/...) never change under the same name: cache first.
  - Everything else (pages, games, pictures, sounds): ask the internet first, so a
    new version always wins when online; if the connection is slow or missing,
    use the saved copy. Nothing here ever asks Mama anything.
  - Her progress is NOT stored here. It lives in localStorage, which updates never touch.

  Bump VERSION only to throw away all saved copies on purpose.
*/
const VERSION = "v1";
const STATIC_CACHE = "mamahjong-static-" + VERSION;
const PAGES_CACHE = "mamahjong-pages-" + VERSION;
const SLOW_MS = 3000; // after this long, a saved copy is used instead of waiting
const MAX_STATIC_ENTRIES = 400; // old build files are tidied up beyond this

self.addEventListener("install", () => {
  // The new version takes over quietly, no "update available" step.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [STATIC_CACHE, PAGES_CACHE];
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("mamahjong-") && !keep.includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  // Audio and video are requested in pieces (Range); leave those to the browser.
  if (request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js" || url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request).then((response) => {
    // A redirected answer must not be saved: browsers refuse to show it for a page visit.
    if (response && response.status === 200 && !response.redirected) {
      cache.put(request, response.clone());
    }
    return response;
  });
  // If we stop waiting for it, a late failure must not become an error message.
  network.catch(() => {});

  try {
    if (!cached) return await network;
    return await Promise.race([
      network,
      new Promise((_, reject) => setTimeout(() => reject(new Error("slow")), SLOW_MS)),
    ]);
  } catch (error) {
    if (cached) return cached;
    if (request.mode === "navigate") {
      // A page we never saw, and no internet: show the start page instead of the browser's error.
      const home = await cache.match("/de/");
      if (home) return home;
    }
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

// The page sends a list of pages to save in the background, so the games work
// offline even if Mama has not opened them yet.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (data && data.type === "warm" && Array.isArray(data.urls)) {
    event.waitUntil(warm(data.urls));
  }
});

async function warm(urls) {
  const pages = await caches.open(PAGES_CACHE);
  const statics = await caches.open(STATIC_CACHE);

  for (const path of urls) {
    try {
      const response = await fetch(path, { credentials: "same-origin" });
      if (!response.ok || response.redirected) continue;
      const isHtml = (response.headers.get("content-type") || "").includes("text/html");
      const html = isHtml ? await response.clone().text() : "";
      await pages.put(path, response);

      // Also save the build files this page needs (scripts, styles, fonts).
      const found = new Set();
      const pattern = /static\/(?:chunks|css|media)\/[^"'\\\s<>]+?\.(?:js|css|woff2)/g;
      let match;
      while ((match = pattern.exec(html)) !== null) found.add("/_next/" + match[0]);
      for (const asset of found) {
        try {
          if (await statics.match(asset)) continue;
          const assetResponse = await fetch(asset);
          if (assetResponse.ok) await statics.put(asset, assetResponse);
        } catch (error) {
          // Best effort: it is saved later when the page is opened.
        }
      }
    } catch (error) {
      // Offline or page missing: try again on the next visit.
    }
  }

  // Tidy up: keep the newest build files only.
  const keys = await statics.keys();
  for (let i = 0; i < keys.length - MAX_STATIC_ENTRIES; i++) {
    await statics.delete(keys[i]);
  }
}
