if(!self.define){let e,i={};const r=(r,s)=>(r=new URL(r+".js",s).href,i[r]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=i,document.head.appendChild(e)}else e=r,importScripts(r),i()})).then((()=>{let e=i[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(s,n)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(i[c])return;let d={};const o=e=>r(e,c),f={module:{uri:c},exports:d,require:o};i[c]=Promise.all(s.map((e=>f[e]||o(e)))).then((e=>(n(...e),d)))}}define(["./workbox-9a84fccb"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"index.1a55a3d8.css",revision:"836dc563678f5e71eebc1589b48d5b6b"},{url:"index.35926f38.js",revision:"01fc02535118f52037adc62fb5d14fd6"},{url:"index.html",revision:"8a595e993bbc56e1201b158f29e414e9"},{url:"index.runtime.1e557104.js",revision:"28665484335b998af84ae7ec0cc9ed23"},{url:"pluka_lanci.54dadede.svg",revision:"fdc29f4abeeb4ac3c270aeb0694df693"},{url:"worker.0b3a4775.js",revision:"a1fa5fdc614bd91d03599bbf5fcbfbc1"}],{})}));
