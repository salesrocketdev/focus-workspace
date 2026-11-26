// Vite production build injects the exact immutable app-shell inventory.
// Development worker still supports notifications, but never caches Vite/HMR.
const BUILD = null;
const SCOPE = self.registration.scope;
const PREFIX = 'focora-shell:'+SCOPE+':';
const CACHE = BUILD ? PREFIX+BUILD.version : null;
const shell = new URL('index.html',SCOPE).href;
const files = new Set(BUILD ? BUILD.files.map(path=>new URL(path,SCOPE).href) : []);
self.addEventListener('install',event=>{
 if(!BUILD)return;
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try{
   await cache.addAll([...files].map(url=>new Request(url,{cache:'reload',credentials:'same-origin'})));
  }catch(error){await caches.delete(CACHE);throw error}
 })());
 // Do not force an update into tabs using a previous version.
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 if(BUILD){
  for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
 }
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(!BUILD||event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(SCOPE))return;
 const navigation=event.request.mode==='navigate'&&(url.pathname===new URL(SCOPE).pathname||url.pathname===new URL(shell).pathname);
 if(navigation){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const cached=await cache.match(shell);
   if(cached)return cached;
   return fetch(event.request);
  })());
  return;
 }
 if(!files.has(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  return await cache.match(url.href)||fetch(event.request);
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='FOCORA_OFFLINE_STATUS'||!event.ports[0])return;
 const port=event.ports[0];
 event.waitUntil((async()=>{
  try{
   const cache=BUILD&&await caches.has(CACHE)?await caches.open(CACHE):null;
   const complete=!!cache&&(await Promise.all([...files].map(url=>cache.match(url)))).every(Boolean);
   port.postMessage({ready:complete,version:complete?BUILD.version:null});
  }catch{port.postMessage({ready:false,version:null})}
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL(SCOPE);
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const existing=windows.find(client=>client.url.startsWith(target.href));
  if(existing){await existing.focus();return}
  await self.clients.openWindow(target.href);
 })());
});
