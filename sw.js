(()=>{let e=[],a="";async function t(){let t=await caches.open(a);await t.addAll(e)}async function c(){let e=await caches.keys();await Promise.all(e.map(e=>e!==a&&caches.delete(e)))}e=["index.html","snime-1.e3f5ba4b.svg","index.d224530c.js","worker.c4b02452.js","index.4365186c.css","index.runtime.6619d80c.js"],a="ea25aa65",addEventListener("install",e=>e.waitUntil(t())),addEventListener("activate",e=>e.waitUntil(c()))})();