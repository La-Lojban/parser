(()=>{let e=[],a="";async function t(){let t=await caches.open(a);await t.addAll(e)}async function c(){let e=await caches.keys();await Promise.all(e.map(e=>e!==a&&caches.delete(e)))}e=["index.html","snime-1.e3f5ba4b.svg","index.f76b7fde.js","worker.db091acb.js","index.4365186c.css","index.runtime.14d54cc0.js"],a="becbde2a",addEventListener("install",e=>e.waitUntil(t())),addEventListener("activate",e=>e.waitUntil(c()))})();