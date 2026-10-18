import {reviewRead,reviewAvailable,sameOwner,queueFeedback,acknowledgeFeedback} from './review-store.js';
import {onlineGrant,reviewPack} from './review.js';
export async function pendingFeedback(runtime){let {pack,pending}=await reviewRead();if(!runtime.offlineReview&&pending.length)pack=await reviewPack({verify:true});if(!pack||pack.grant.companyId!==runtime.companyId)return [];if(!reviewAvailable(pack))return [];return pending.filter(e=>sameOwner(e.grant,pack.grant));}
export async function reviewReports(runtime){const {pack}=await reviewRead();if(!reviewAvailable(pack)||pack.grant.companyId!==runtime.companyId)throw Error('Open de offline-modus opnieuw met internet. Je meldingen blijven bewaard.');return [...Object.values(pack.snapshot.records.reports||{}),...(await pendingFeedback(runtime)).map(e=>({...e.report,offlinePending:true}))].filter((r,i,all)=>all.findLastIndex(x=>x.id===r.id)===i);}
export async function addOfflineFeedback(report,runtime){const {pack}=await reviewRead();if(pack?.grant.companyId!==runtime.companyId)throw Error('Maak de offline-modus eerst beschikbaar voor dit bedrijf.');await queueFeedback(report);}
// Append-only, one stable report ID. A lost commit acknowledgement is checked by content on retry.
export async function syncOfflineFeedback({runtime,list,put}){
 const grant=await onlineGrant(),{pack,pending}=await reviewRead();if(!pack||!sameOwner(pack.grant,grant)||grant.companyId!==runtime.companyId)throw Error('Deze offline feedback hoort bij een andere aanmelding. Er is niets overgezet.');
 let count=0;
 for(const entry of pending){if(!sameOwner(entry.grant,grant))continue;const existing=(await list()).find(r=>r.id===entry.id);if(existing){if(JSON.stringify(existing)!==JSON.stringify(entry.report))throw Error('Deze melding is online anders bewaard. De offline versie blijft behouden; download de meldingen.');}else await put(entry.report);await acknowledgeFeedback(entry);count++;}
 return count;
}
export async function appendFeedbackReport(db,report){return new Promise((resolve,reject)=>{const tx=db.transaction('reports','readwrite'),store=tx.objectStore('reports'),r=store.get(report.id);let error;r.onsuccess=()=>{if(r.result){if(JSON.stringify(r.result)!==JSON.stringify(report)){error=Error('Deze melding is online intussen aangepast. De offline versie blijft behouden.');tx.abort();}}else store.put(report);};tx.oncomplete=resolve;tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error||Error('Feedback overzetten afgebroken.'));});}
