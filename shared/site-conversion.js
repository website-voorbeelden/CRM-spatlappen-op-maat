import {analyticsExclusionContext} from './analytics-exclusions.js';
// Source IDs are deliberately kept out of the general search and visitor reports.
export function websiteLeadId(text){
 const ids=[...String(text||'').replace(/\\n/g,'\n').matchAll(/(?:^|\n)\s*Aanvraag-ID:\s*([a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12})\s*(?=\n|$)/gi)].map(m=>m[1].toLowerCase());
 return new Set(ids).size===1?ids[0]:'';
}
export function websiteCohort(state,report,{totals}){
 const excluded=analyticsExclusionContext(state),ids=new Set((report.leadIds||[]).filter(id=>!excluded.leadIds.has(id))),groups=new Map();
 for(const o of state.orders||[]){if(!excluded.orderIds.has(o.id)&&ids.has(o.websiteLeadId)){if(!groups.has(o.websiteLeadId))groups.set(o.websiteLeadId,[]);groups.get(o.websiteLeadId).push(o);}}
 const paid=new Set(),quoted=new Set();
 for(const [id,orders] of groups)for(const o of orders){
  // A quote document or registered sending is evidence; a stage name alone is not.
  if(o.quoteSentDate||(state.documents||[]).some(d=>(d.orderId===o.id||d.ownerId===o.id)&&d.category==='quote'))quoted.add(id);
  const t=totals(o);if(t.priceKnown&&o.shippingKnown&&Number.isFinite(t.total)&&t.total>0&&t.paid>=t.total)paid.add(id);
 }
 return {linked:groups.size,quoted:quoted.size,paid:paid.size,unlinked:Math.max(0,(report.leads?.count||0)-groups.size),complete:report.leadIdsComplete===true};
}
