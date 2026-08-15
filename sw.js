const CACHE_NAME = "vgs-app-v2";
const APP_SHELL = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/admin.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/vgs-app-icon.svg"
];

const CLIENT_DASHBOARD_FIX = `
<style id="vgs-client-dashboard-fix">
.vgs-app nav.vgs-bottom{position:fixed!important;top:auto!important;right:0!important;bottom:0!important;left:0!important;width:100vw!important;height:78px!important;min-height:78px!important;max-height:78px!important;display:flex!important;flex-direction:row!important;align-items:stretch!important;justify-content:center!important;box-sizing:border-box!important;margin:0!important;padding:8px 12px!important;border:0!important;border-top:1px solid rgba(212,175,55,.18)!important;border-radius:0!important;background:rgba(10,10,10,.97)!important;z-index:1000!important;overflow:hidden!important}
.vgs-app nav.vgs-bottom .vgs-bottom-inner{width:100%!important;max-width:720px!important;height:100%!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:4px!important;align-items:stretch!important;margin:0!important;padding:0!important}
.vgs-app nav.vgs-bottom .vgs-nav{width:auto!important;height:100%!important;min-height:0!important;max-height:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;transform:none!important;float:none!important;margin:0!important;padding:6px 2px!important;box-sizing:border-box!important;overflow:hidden!important}
.vgs-app nav.vgs-bottom .vgs-nav.active{background:#151515!important;border-radius:12px!important}
.vgs-float{display:none!important}
</style>`;

async function transformDashboard(response) {
  if (!response || !response.ok) return response;
  const html = await response.text();
  const patched = html
    .replace(/<button class="vgs-float"[\s\S]*?<\/button>\s*/i, "")
    .replace(/<\/head>/i, CLIENT_DASHBOARD_FIX + "</head>");
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  return new Response(patched, { status: response.status, statusText: response.statusText, headers });
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(async response => {
        const transformed = url.pathname.endsWith("/dashboard.html")
          ? await transformDashboard(response)
          : response;
        const copy = transformed.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return transformed;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("/index.html")))
  );
});
