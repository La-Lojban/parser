(()=>{let e=[],a="";async function t(){let t=await caches.open(a);await t.addAll(e)}async function c(){let e=await caches.keys();await Promise.all(e.map(e=>e!==a&&caches.delete(e)))}e=["index.html","snime-1.e3f5ba4b.svg","index.891a97b7.js","worker.fdbc65ab.js","index.a4bc6c04.css","index.runtime.2501fd3d.js"],a="5c725df7",addEventListener("install",e=>e.waitUntil(t())),addEventListener("activate",e=>e.waitUntil(c()))})();