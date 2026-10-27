/* Generated public code bundle. API/auth/files and provider requests are never cached. */
const ASSETS=__CRM_OFFLINE_ASSETS__,CACHE='crm-offline-code-'+__CRM_OFFLINE_VERSION__;
const paths=new Set(ASSETS.map(a=>a.path));
async function cacheCode(){
 const cache=await caches.open(CACHE);
 for(let n=0;n<ASSETS.length;n+=12)await Promise.all(ASSETS.slice(n,n+12).map(async asset=>{const response=await fetch(asset.path,{cache:'reload',redirect:'error'});if(!response.ok)throw Error('Offline asset unavailable');const bytes=await response.clone().arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==asset.sha256)throw Error('Offline release mismatch');await cache.put(asset.path,response);}));
}
self.addEventListener('install',event=>event.waitUntil(cacheCode().then(()=>self.skipWaiting())));
self.addEventListener('message',event=>{if(event.data?.type==='prepare-offline-code')event.waitUntil(cacheCode().then(()=>event.ports[0]?.postMessage({ready:true})).catch(()=>event.ports[0]?.postMessage({ready:false})));});
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();for(const key of await caches.keys())if(key.startsWith('crm-offline-code-')&&key!==CACHE)await caches.delete(key);})()));
async function ready(){return new Promise(resolve=>{const r=indexedDB.open('crm-offline-workspace-v1',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('workspace'))r.result.createObjectStore('workspace');};r.onerror=()=>resolve(false);r.onsuccess=()=>{const db=r.result,tx=db.transaction('workspace'),q=tx.objectStore('workspace').get('pack');q.onsuccess=()=>{const p=q.result;resolve(p?.schema===1&&!p.locked&&p.grant?.expiresAt>Date.now());};q.onerror=()=>resolve(false);tx.oncomplete=()=>db.close();};});}
async function reviewReady(){return new Promise(resolve=>{const r=indexedDB.open('crm-offline-review-v1',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('meta'))r.result.createObjectStore('meta');if(!r.result.objectStoreNames.contains('outbox'))r.result.createObjectStore('outbox',{keyPath:'id'});};r.onerror=()=>resolve(false);r.onsuccess=()=>{const db=r.result,tx=db.transaction('meta'),q=tx.objectStore('meta').get('pack');q.onsuccess=()=>{const p=q.result;resolve(p?.schema===1&&!p.locked&&p.grant?.expiresAt>Date.now());};q.onerror=()=>resolve(false);tx.oncomplete=()=>db.close();};});}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(url.pathname==='/admin/offline/index.html')url.pathname='/admin/offline/';
 const root=['/admin/','/admin','/admin/index.html'].includes(url.pathname),reviewNavigation=root&&url.searchParams.get('offline')==='review';
 const legacy=paths.has(url.pathname)&&(url.pathname.startsWith('/admin/offline/')||url.pathname==='/shared/offline-state.js'||url.pathname==='/shared/companies.js'&&event.request.referrer&&new URL(event.request.referrer).pathname.startsWith('/admin/offline/'));
 // Existing limited workspace keeps its public-code-only cache contract.
 if(legacy&&event.request.method==='GET'){event.respondWith((async()=>{const saved=await (await caches.open(CACHE)).match(url.pathname);return saved||fetch(event.request);})());return;}
 if(reviewNavigation&&event.request.mode==='navigate'&&event.request.method==='GET'){event.respondWith((async()=>{if(!await reviewReady())return new Response('Offline kopie niet beschikbaar. Open /admin/ met internet en klik op Offline-modus. Bewaarde feedback blijft behouden.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});return (await (await caches.open(CACHE)).match('/admin/'))||fetch(event.request);})());return;}
 if(root&&event.request.mode==='navigate'&&event.request.method==='GET'){event.respondWith((async()=>{try{return await fetch(event.request);}catch(error){if(await reviewReady())return Response.redirect(self.location.origin+'/admin/?offline=review',302);if(!await ready())throw error;const cached=await (await caches.open(CACHE)).match('/admin/offline/');if(!cached)throw error;return cached;}})());return;}
 if(paths.has(url.pathname)&&event.request.method==='GET'&&!url.pathname.startsWith('/shared/')){event.respondWith((async()=>{const client=event.clientId&&await self.clients.get(event.clientId),review=client&&new URL(client.url).searchParams.get('offline')==='review';if(review){const saved=await(await caches.open(CACHE)).match(url.pathname);if(saved)return saved;}return fetch(event.request);})());return;}
 // Only intercept remaining requests from an explicit review tab. This blocks mail/payment mutations even while connected.
 if(event.clientId)event.respondWith((async()=>{const client=await self.clients.get(event.clientId),review=client&&new URL(client.url).searchParams.get('offline')==='review';if(!review)return fetch(event.request);if(paths.has(url.pathname)&&event.request.method==='GET')return (await(await caches.open(CACHE)).match(url.pathname))||fetch(event.request);if(url.pathname==='/api/crm/offline-grant'&&event.request.method==='GET')return fetch(event.request);return Response.json({error:'Offline-modus: alleen rondkijken en feedback op dit apparaat bewaren.'},{status:503,headers:{'Cache-Control':'no-store'}});})());
});

// Push shares the existing root registration; it never replaces offline protection.
const PUSH_COMPANY=__CRM_NOTIFICATION_COMPANY__;
self.addEventListener('message',event=>{
 if(event.data?.type==='crm-report-capabilities'&&typeof event.data.nonce==='string'&&event.data.nonce.length<=100)event.ports[0]?.postMessage({nonce:event.data.nonce,companyId:PUSH_COMPANY,reportProtocol:1});
});
const reportId=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value&&new Date(value+'T12:00:00Z').getUTCDay()===5;
self.addEventListener('push',event=>event.waitUntil((async()=>{
 let message;try{message=event.data?.json();}catch{}
 const common=message?.companyId===PUSH_COMPANY&&/^[a-f0-9]{64}$/.test(message?.eventId||'')&&Number.isSafeInteger(message?.createdAt)&&Math.abs(Date.now()/1000-message.createdAt)<86400;
 const report=common&&message.version===2&&message.kind==='weekly-report'&&reportId(message.reportId);
 const payment=common&&message.version===1&&/^[a-zA-Z0-9._-]{1,160}$/.test(message.orderId||'');
 const options={body:report?'Je vrijdagrapport staat klaar. Tik om het rapport in het CRM te bekijken.':payment?'Open het CRM om de betaling en de bijbehorende order te bekijken.':'Open het CRM om je meldingen te bekijken.',icon:'/admin/icons/'+PUSH_COMPANY+'-192.png',tag:report?'crm-report-'+message.eventId:payment?'crm-payment-'+message.eventId:'crm-message',data:{href:report?'/admin/#analytics/reports/'+message.reportId:payment?'/admin/#orders/'+encodeURIComponent(message.orderId)+'/payments':'/admin/#dashboard'}};
 // Action buttons are optional platform UI. Tapping the notification itself
 // always opens the same safe report link, including on phones without actions.
 if(report&&typeof Notification!=='undefined'&&Notification.maxActions>0)options.actions=[{action:'view-report',title:'Rapport bekijken'}];
 await self.registration.showNotification(report?'Vrijdagrapport klaar':payment?'Betaling geregistreerd':'CRM-melding',options);
})()));
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const raw=typeof event.notification.data?.href==='string'?event.notification.data.href:'',payment=/^\/admin\/#orders\/[a-zA-Z0-9._-]{1,160}\/payments$/.test(raw),report=raw.startsWith('/admin/#analytics/reports/')&&reportId(raw.slice('/admin/#analytics/reports/'.length));
 const href=payment||report?raw:'/admin/#dashboard';
 // A new window preserves unsaved work. The existing CRM login stays required.
 event.waitUntil(self.clients.openWindow(self.location.origin+href));
});
