const CACHE="vgs-mobile-v2";
const CORE=["./","./index.html","./styles.css?v=2","./fix.css?v=2","./app.js?v=2","./install.js?v=2","./manifest.webmanifest?v=2","../vgs-app-icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();if(new URL(event.request.url).origin===location.origin)caches.open(CACHE).then(c=>c.put(event.request,copy));return response}).catch(()=>caches.match("./index.html"))))});
