(()=>{let e=[],a="";e=["index.html","snime-1.e3f5ba4b.svg","index.1f637eb1.js","index.f356cbfa.css"],a="4a3defa5",addEventListener("install",(c=>c.waitUntil(async function(){const c=await caches.open(a);await c.addAll(e)}()))),addEventListener("activate",(e=>e.waitUntil(async function(){const e=await caches.keys();await Promise.all(e.map((e=>e!==a&&caches.delete(e))))}())))})();