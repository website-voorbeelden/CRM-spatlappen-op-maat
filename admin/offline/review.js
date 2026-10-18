import {reviewRead,reviewWrite,reviewAvailable,sameOwner,lockReview} from './review-store.js';
export const isReviewMode=()=>typeof location!=='undefined'&&new URLSearchParams(location.search).get('offline')==='review';
export const readOnlyMessage='Offline-modus: je kunt rondkijken en feedback bewaren. Wijzigingen aan dossiers, mail en betalingen doe je weer online.';
export async function onlineGrant(){let response;try{response=await fetch('/api/crm/offline-grant',{cache:'no-store',signal:AbortSignal.timeout(10000)});}catch{throw Object.assign(Error('Geen verbinding. Je offline feedback blijft op dit apparaat.'),{network:true});}if(!response.ok){if([401,403].includes(response.status))await lockReview();throw Object.assign(Error('Log online opnieuw in om je offline kopie te openen.'),{status:response.status});}return response.json();}
export async function reviewPack({verify=false}={}){
 let {pack}=await reviewRead();
 if(verify){try{const grant=await onlineGrant();if(!sameOwner(pack?.grant,grant)){await lockReview();throw Error('Deze offline kopie hoort bij een andere aanmelding. Er is niets vervangen.');}pack=await reviewWrite((current,{meta})=>{if(!sameOwner(current?.grant,grant))throw Error('De offline aanmelding is intussen veranderd.');const next={...current,grant,locked:false};meta.put(next,'pack');return next;});}catch(e){if(!e.network)throw e;}}
 if(!reviewAvailable(pack))throw Error('De offline kopie is niet beschikbaar of verlopen. Open het CRM met internet en klik op Offline-modus. Bewaarde feedback blijft behouden.');return pack;
}
export async function reviewSnapshot(names){const p=await reviewPack();if(names.includes('files'))throw Error('Bestanden en voorbeelden zijn niet meegenomen in deze offline kopie.');return {revision:p.snapshot.revision,records:Object.fromEntries(names.map(name=>[name,p.snapshot.records[name]||{}])),files:[]};}
export async function installReviewCode(){
 if(!navigator.serviceWorker)throw Error('Deze browser ondersteunt offline werken niet.');
 const reg=await navigator.serviceWorker.register('/crm-offline-sw.js',{scope:'/',updateViaCache:'none'});await reg.update();
 const worker=reg.installing||reg.waiting||reg.active;if(!worker)throw Error('Offline bestanden installeren lukt niet.');
 if(worker.state!=='activated')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Offline installatie duurt te lang. Probeer opnieuw.')),45000);const changed=()=>{if(worker.state==='activated'){clearTimeout(timer);resolve();}else if(worker.state==='redundant'){clearTimeout(timer);reject(Error('Offline bestanden konden niet worden gecontroleerd.'));}};worker.addEventListener('statechange',changed);changed();});
 await new Promise((resolve,reject)=>{const c=new MessageChannel(),timer=setTimeout(()=>{c.port1.close();reject(Error('Offline bestanden controleren duurt te lang.'));},45000);c.port1.onmessage=e=>{clearTimeout(timer);c.port1.close();e.data?.ready?resolve():reject(Error('Niet alle offline bestanden zijn beschikbaar. Probeer opnieuw.'));};worker.postMessage({type:'prepare-offline-code'},[c.port2]);});
}
export async function prepareReview(runtime){
 const grant=await onlineGrant();if(runtime.mode!=='cloud'||grant.companyId!==runtime.companyId)throw Error('Offline-modus hoort bij de centrale opslag van dit bedrijf.');
 const old=await reviewRead();if(old.pack&&!sameOwner(old.pack.grant,grant))throw Error('Dit apparaat heeft een offline kopie van een andere aanmelding. Er is niets vervangen.');
 const response=await fetch('/api/crm/snapshot?stores=state,reports',{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('De CRM-kopie ophalen lukt niet. Log zo nodig opnieuw in.');const snapshot=await response.json();if(!snapshot.records?.state?.main)throw Error('De centrale CRM-gegevens ontbreken.');
 await installReviewCode();
 const pack=await reviewWrite((current,{meta})=>{if(current&&!sameOwner(current.grant,grant))throw Error('De offline aanmelding is intussen veranderd.');const p={schema:1,grant,runtime:{...runtime,offlineReview:true,authEnabled:false,localServices:false},snapshot,preparedAt:Date.now(),locked:false};meta.put(p,'pack');return p;});
 await navigator.storage?.persist?.().catch(()=>false);return pack;
}
export function reviewBannerMarkup(runtime={}){const until=runtime.offlineUntil?new Date(runtime.offlineUntil).toLocaleString('nl-NL'):'24 uur na voorbereiden';return '<section class="offline-review-banner" role="status"><strong>Offline-modus</strong><span>Rondkijken en feedback bewaren · overige wijzigingen doe je online.</span><small>Beschikbaar tot '+until+'. Feedback blijft daarna bewaard.</small><a href="/admin/#feedback">Terug online & feedback overzetten</a></section>';}
export function installReviewGuard(toast){
 // Block writes before any existing UI listener can act; reporting can still pick a disabled action.
 const allowed=new Set(['start','general','cancel-pick','view','export','close','sync']);
 document.addEventListener('submit',e=>{if(!isReviewMode()||e.target.closest('#feedback-dialog'))return;e.preventDefault();e.stopImmediatePropagation();toast(readOnlyMessage);},true);
 document.addEventListener('click',e=>{if(!isReviewMode()||document.body.classList.contains('feedback-picking'))return;const control=e.target.closest('button,a,input[type=file]');if(!control)return;
 if(control.closest('#feedback-dialog')||control.matches('[data-feedback-action]')&&allowed.has(control.dataset.feedbackAction)||control.matches('[data-mobile-menu],[data-mobile-close],[data-mobile-backdrop],[data-sidebar-toggle],[data-search-launcher],[data-search-close]')||control.closest('.workspace-search-dialog'))return;
 if(control.tagName==='A'&&control.getAttribute('href')?.startsWith('#'))return;if(control.tagName==='A'&&control.getAttribute('href')==='/admin/#feedback')return;
 // Read-only navigation/filters have no action attribute. Mutation buttons remain inspectable for feedback.
 if(control.tagName==='BUTTON'&&!control.dataset.action&&!control.dataset.feedbackAction&&!control.closest('[data-ai-launcher-slot],[data-ai-mobile-launcher-slot]'))return;
 e.preventDefault();e.stopImmediatePropagation();toast(readOnlyMessage);
 },true);
}
