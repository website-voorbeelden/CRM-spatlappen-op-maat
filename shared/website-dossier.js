// Explicit received contacts are CRM facts, never proof of an anonymous visitor's identity.
export const websiteUuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);
export const contactChannels={email:'E-mail',whatsapp:'WhatsApp',phone:'Telefoon',other:'Overig'};
export function validateWebsiteContacts(value){
 if(value===undefined)return;
 if(!Array.isArray(value)||value.length>100||new Set(value.map(v=>v?.id)).size!==value.length||value.some(v=>!v||!websiteUuid(v.id)||!Object.hasOwn(contactChannels,v.channel)||!Number.isFinite(Date.parse(v.receivedAt))||!Number.isFinite(Date.parse(v.createdAt))||typeof v.reference!=='string'||v.reference.trim().length<3||v.reference.length>300))throw Error('Controleer het ontvangen contact: kanaal, datum en korte bronverwijzing zijn verplicht (maximaal 100 per dossier).');
}
export function receivedContact(input,now=new Date().toISOString()){
 const receivedAt=new Date(input.receivedAt).toISOString();
 if(Date.parse(receivedAt)>Date.parse(now)+60000)throw Error('Een ontvangen contact kan niet in de toekomst liggen.');
 const value={id:input.id,channel:input.channel,receivedAt,createdAt:now,reference:String(input.reference||'').trim()};validateWebsiteContacts([value]);return value;
}
export function orderWebsiteFacts(state,order){
 const leadId=websiteUuid(order.websiteLeadId)?order.websiteLeadId.toLowerCase():'';
 const payments=(state.payments||[]).filter(p=>p.orderId===order.id);
 return {leadId,sourcePage:order.inquirySourcePage||'',contacts:order.websiteContacts||[],
  // These are business dates, not invented visitor events or a current phase history.
  timeline:[{at:order.date,label:'Dossier geregistreerd',basis:'CRM-datum · geen exact formuliermoment'},
   ...(order.quoteSentDate?[{at:order.quoteSentDate,label:'Offerte als verstuurd geregistreerd',basis:'CRM-registratie'}]:[]),
   ...payments.map(p=>({at:p.date,label:'Betaling geregistreerd',basis:'Betaalregistratie · geen bewijs van websitebezoek'})),
   ...(order.deliveredDate?[{at:order.deliveredDate,label:'Geleverd geregistreerd',basis:'CRM-registratie'}]:[])]
   .filter(e=>e.at&&Number.isFinite(Date.parse(e.at))).sort((a,b)=>String(a.at).localeCompare(String(b.at)))};
}
