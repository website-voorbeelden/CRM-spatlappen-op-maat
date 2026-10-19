// Report filters only. Never delete dossiers, messages, payments or measurement rows.
const uuid=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const email=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export function analyticsExclusions(value){
 if(value===undefined)return {emails:[],leadIds:[]};
 if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.emails)||!Array.isArray(value.leadIds)||value.emails.length>50||value.leadIds.length>500||value.emails.some(e=>typeof e!=='string'||e.length>254||!email.test(e))||value.leadIds.some(id=>typeof id!=='string'||!uuid.test(id)))throw Error('Gebruik maximaal 50 volledige testadressen en 500 geldige aanvraag-ID’s.');
 return {emails:[...new Set(value.emails.map(e=>e.trim().toLowerCase()))],leadIds:[...new Set(value.leadIds.map(id=>id.toLowerCase()))]};
}
export function analyticsExclusionContext(state={}){
 const config=analyticsExclusions(state.analyticsExclusions),emails=new Set(config.emails),leadIds=new Set(config.leadIds),orderIds=new Set();
 const customers=new Set((state.customers||[]).filter(c=>[c.email,c.invoiceEmail].some(e=>emails.has(String(e||'').trim().toLowerCase()))).map(c=>c.id));
 for(const order of state.orders||[])if(order.analyticsInternal===true||customers.has(order.customerId)||leadIds.has(String(order.websiteLeadId||'').toLowerCase())){
  orderIds.add(order.id);if(uuid.test(order.websiteLeadId||''))leadIds.add(order.websiteLeadId.toLowerCase());
 }
 // Multiple orders from one exact lead must all share its reporting exclusion.
 for(const order of state.orders||[])if(leadIds.has(String(order.websiteLeadId||'').toLowerCase()))orderIds.add(order.id);
 return {config,leadIds,orderIds};
}
