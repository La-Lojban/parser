// The version of the cache.
// The name of the cache
const e="parser-v1",t=["/","/parser/","/parser/index.html","/index.html"];// On install, cache the static resources
self.addEventListener("install",a=>{a.waitUntil((async()=>{let a=await caches.open(e);a.addAll(t)})())}),// delete old caches on activate
self.addEventListener("activate",t=>{t.waitUntil((async()=>{let t=await caches.keys();await Promise.all(t.map(t=>{if(t!==e)return caches.delete(t)})),await clients.claim()})())}),// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch",t=>{// As a single page app, direct app to always go to cached home page.
if("navigate"===t.request.mode){t.respondWith(caches.match("/"));return}// For all other requests, go to the cache first, and then the network.
t.respondWith((async()=>{let a=await caches.open(e),s=await a.match(t.request.url);if(s)return s;let n=await fetch(t.request);return n?(a.put(t.request,n.clone()),n):new Response(null,{status:404})})())});/*
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(
      (registration) => {
        console.log("Service worker registration successful:", registration);
      },
      (error) => {
        console.error(`Service worker registration failed: ${error}`);
      },
    );
} else {
    console.error("Service workers are not supported.");
}
*/