// Incoming messages are source data, never instructions or financial facts.
const normal=value=>String(value||'').normalize('NFKC').trim().replace(/^#/,'').toLowerCase();
export const supplierMailSender='noreply@kunststofbaas.nl';
export function supplierMailDay(value){if(typeof value!=='string'||!value.trim()||value.length>40)return '';const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');}
export function supplierMailFacts(message){
 const sender=message?.from?.emailAddress?.address;
 if(typeof sender!=='string'||sender.toLowerCase()!==supplierMailSender)throw Error('Dit is geen bericht van de ingestelde leveranciersafzender.');
 if(message.body?.contentType?.toLowerCase()!=='text'||typeof message.body.content!=='string'||message.body.content.length>200000)throw Error('De leveranciermail kon niet als begrensde gewone tekst worden gelezen.');
 const text=message.body.content,subject=String(message.subject||'').slice(0,300);
 const references=[...new Set([...text.matchAll(/\b(?:bestelling|bestelnummer|ordernummer)\s*[:#]?\s*([a-z0-9][a-z0-9._/-]{0,79})/gi)].map(m=>m[1]).filter(v=>/\d/.test(v)))].slice(0,20);
 const ownNumbers=[...new Set([...text.matchAll(/\b(?:Maatwerkkunststof\s+order|onze\s+order|orderreferentie|order)\s*[:#]\s*(\d{1,20})(?!\d)/gi)].map(m=>m[1]))].slice(0,20);
 return {subject,text,sender:supplierMailSender,references,ownNumbers};
}
export function supplierMailMatches(state,facts){
 const orders=(state.orders||[]).filter(o=>!o.mergedIntoOrderId&&(!o.supplier||/^kunststofbaas(?:\.nl)?(?:\s+b\.?v\.?)?$/i.test(String(o.supplier).trim()))),references=new Set((facts.references||[]).map(normal)),own=new Set(facts.ownNumbers||[]);
 const supplier=orders.filter(o=>o.supplierOrderReference&&references.has(normal(o.supplierOrderReference))),internal=orders.filter(o=>own.has(String(o.number)));
 const intersection=supplier.filter(o=>internal.some(other=>other.id===o.id));
 const candidates=supplier.length?intersection.length?intersection:supplier:internal;
 const conflict=supplier.length>0&&internal.length>0&&!intersection.length;
 return {reason:conflict?'conflict':supplier.length?'supplier-reference':internal.length?'own-reference':'unmatched',ambiguous:conflict||candidates.length!==1,orderIds:candidates.map(o=>o.id)};
}
