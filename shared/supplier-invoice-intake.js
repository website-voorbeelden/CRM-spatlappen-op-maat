import {invoiceHeaderLines,invoiceDate} from './invoice-header.js?v=supplier-logistics-review-20261101';
import {allocateCents} from './money-allocation.js?v=feedback-five-20261029';
import {supplierInvoices} from './supplier-invoices.js';
import {validProvenance,markProvenance} from './provenance.js?v=invoice-link-review-20261101';
const clone=v=>structuredClone(v),same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
const id=v=>typeof v==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(v);
const money=v=>Number.isSafeInteger(v)&&v>=0&&v<=1e12;
const day=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const norm=v=>String(v||'').trim().toLowerCase().replace(/^#/,'');
export const isKunststofbaas=v=>/^kunststofbaas(?:\.nl)?(?:\s+b\.?v\.?)?$/i.test(String(v||'').trim());
const costLabel=reference=>'Factuur '+reference.slice(0,45)+' · overige kosten / niet-aftrekbare btw';
const fail=message=>{throw Error(message);};
function keys(v,allowed){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!allowed.includes(k)))fail('Onverwachte velden in het factuurvoorstel.');}
export function invoiceOrderChoices(state){const purchases=new Map((state.purchases||[]).map(p=>[p.id,p]));return state.orders.filter(o=>!o.mergedIntoOrderId&&(!o.supplier&&!o.purchaseId||isKunststofbaas(purchases.get(o.purchaseId)?.supplier||o.supplier)));}
export function invoiceReferenceMatches(state,references){return references.map(reference=>({reference,orders:invoiceOrderChoices(state).filter(o=>norm(o.supplierOrderReference)===norm(reference))}));}
export function invoiceIntakeBasis(state){return JSON.stringify([state.orders,state.customers,state.purchases||[],state.supplierInvoiceImports||[],state.businessExpenses||[],state.documents]);}
export function validateInvoiceData(data){
 keys(data,['reference','date','currency','supplierOrderReferences','orderIds','netCents','vatCents','deductibleVatCents','grossCents','allocation','notes','lines','provenance']);
 if(data.provenance!==undefined&&!validProvenance(data.provenance))fail('Ongeldige herkomst bij de factuurgegevens.');
 if(typeof data.reference!=='string'||!data.reference.trim()||data.reference.length>200||!day(data.date)||data.currency!=='EUR')fail('Controleer factuurnummer, factuurdatum en EUR als valuta.');
 if(!Array.isArray(data.supplierOrderReferences)||data.supplierOrderReferences.length>100||data.supplierOrderReferences.some(r=>typeof r!=='string'||!r.trim()||r.length>200))fail('Controleer de bestelnummers op de leveranciersfactuur.');
 if(!Array.isArray(data.orderIds)||!data.orderIds.length||data.orderIds.length>100||new Set(data.orderIds).size!==data.orderIds.length||data.orderIds.some(v=>!id(v)))fail('Kies de klantorders waar deze factuur bij hoort.');
 for(const k of ['netCents','vatCents','grossCents'])if(!money(data[k]))fail('Vul netto, btw en bruto in gehele eurocenten in.');
 if(data.netCents+data.vatCents!==data.grossCents)fail('Netto plus btw moet exact aansluiten op het factuurtotaal.');
 if(data.deductibleVatCents!==null&&(!money(data.deductibleVatCents)||data.deductibleVatCents>data.vatCents))fail('Controleer het expliciet aftrekbare deel van de btw.');
 if(!['equal','cost'].includes(data.allocation)||typeof data.notes!=='string'||data.notes.length>6000)fail('Controleer kostenverdeling en toelichting.');
 if(!Array.isArray(data.lines)||!data.lines.length||data.lines.length>100||new Set(data.lines.map(l=>l?.id)).size!==data.lines.length)fail('Vul 1 tot 100 unieke factuurregels in.');
 for(const l of data.lines){keys(l,['id','kind','description','quantity','netCents','orderId','itemId','provenance']);if(l.provenance!==undefined&&!validProvenance(l.provenance))fail('Ongeldige herkomst bij een factuurregel.');if(!id(l.id)||!['product','extra'].includes(l.kind)||l.kind==='product'&&(!l.orderId||!l.itemId)||l.kind==='extra'&&l.itemId||typeof l.description!=='string'||!l.description.trim()||l.description.length>2000||!Number.isSafeInteger(l.quantity)||l.quantity<1||l.quantity>1000000||!money(l.netCents)||typeof l.orderId!=='string'||typeof l.itemId!=='string'||l.kind==='product'&&!!l.orderId!==!!l.itemId||l.orderId&&!data.orderIds.includes(l.orderId)||l.itemId&&!id(l.itemId))fail('Controleer omschrijving, aantal, nettoregelbedrag en productkoppeling.');}
 if(data.lines.reduce((sum,l)=>sum+l.netCents,0)!==data.netCents)fail('De som van alle nettoregelbedragen moet exact gelijk zijn aan netto op de factuur. Neem korting/transport mee in de nettoregelbedragen; tel ze niet opnieuw op.');
}
export function invoiceExtraAllocations(record){
 const d=record.data,weights=d.orderIds.map(orderId=>({id:orderId,weight:d.allocation==='cost'?d.lines.filter(l=>l.kind==='product'&&l.orderId===orderId).reduce((n,l)=>n+l.netCents,0):1}));
 const extra=d.lines.filter(l=>l.kind==='extra'&&!l.orderId).reduce((n,l)=>n+l.netCents,0),unknown=d.vatCents>0&&d.deductibleVatCents===null;
 const amounts=allocateCents(extra+(unknown?0:d.vatCents-(d.deductibleVatCents??0)),weights);
 return new Map([...amounts].map(([key,value])=>[key,unknown?null:value+d.lines.filter(l=>l.kind==='extra'&&l.orderId===key).reduce((n,l)=>n+l.netCents,0)]));
}
const costKeys=['cost','costSource','purchaseCostTotal','purchaseCostQuantity','calculatedCostTotal','supplierInvoiceImportIds'];
const costSnapshot=item=>Object.fromEntries(costKeys.filter(k=>Object.hasOwn(item,k)).map(k=>[k,clone(item[k])]));
function productProjection(state){
 const products=new Map();
 for(const r of state.supplierInvoiceImports||[])for(const l of r.data.lines)if(l.itemId){const key=l.orderId+'/'+l.itemId,row=products.get(key)||{orderId:l.orderId,itemId:l.itemId,quantity:0,total:0,ids:new Set()};row.quantity+=l.quantity;row.total+=l.netCents;row.ids.add(r.id);products.set(key,row);}
 return products;
}
export function invoiceIntakeReferencesDocument(state,documentId){return (state.supplierInvoiceImports||[]).some(r=>r.documentId===documentId||r.history.some(h=>h.before.documentId===documentId));}
export function validateInvoiceIntakes(state){
 const records=state.supplierInvoiceImports===undefined?[]:state.supplierInvoiceImports;
 if(!Array.isArray(records)||records.length>1000||new Set(records.map(r=>r?.id)).size!==records.length)fail('Ongeldige leveranciersfactuurregistraties.');
 const references=new Set(),proofs=new Set(),orders=new Map(state.orders.map(o=>[o.id,o])),documents=new Map(state.documents.map(d=>[d.id,d])),legacyItems=new Set((state.purchases||[]).flatMap(p=>supplierInvoices(p).flatMap(i=>(i.lines||[]).map(l=>l.itemId))));
 for(const r of records){
  keys(r,['id','supplier','data','documentId','sha256','createdAt','updatedAt','revision','history','priorItems','payments']);validateInvoiceData(r.data);
  if(!id(r.id)||r.supplier!=='kunststofbaas'||!id(r.documentId)||!documents.has(r.documentId)||!/^[a-f0-9]{64}$/.test(r.sha256)||!Number.isFinite(Date.parse(r.createdAt))||!Number.isFinite(Date.parse(r.updatedAt))||!Number.isSafeInteger(r.revision)||r.revision<1)fail('Ongeldige factuurbron of revisie.');
  const proof=documents.get(r.documentId);if(proof.supplierControlDocument&&(proof.supplierControlDocument.kind!=='invoice'||proof.supplierControlDocument.sha256!==r.sha256)||proof.generated||proof.internalDesign||proof.invoiceId||proof.shippingLabel||! /\.pdf$/i.test(proof.name||'')||!Number.isSafeInteger(proof.size)||proof.size<=0||proof.size>15*1024*1024||(state.businessExpenses||[]).some(e=>e.documentIds.includes(r.documentId)||(e.history||[]).some(h=>h.before.documentIds.includes(r.documentId))))fail('Kies één oorspronkelijke leveranciers-PDF, zonder andere kosten- of documentclaim.');
  if(records.some(other=>other.id!==r.id&&(other.documentId===r.documentId||other.history.some(h=>h.before.documentId===r.documentId||h.before.sha256===r.sha256))))fail('Dit bewijs hoort al bij een andere factuur of haar historie.');
  if((state.businessExpenses||[]).some(e=>isKunststofbaas(e.counterparty)&&norm(e.reference)===norm(r.data.reference))||(state.purchases||[]).some(p=>isKunststofbaas(p.supplier)&&supplierInvoices(p).some(i=>norm(i.reference)===norm(r.data.reference))))fail('Deze factuur heeft ook een kostenregistratie bij Inkoop of Bedrijfskosten. Behoud één financiële bron.');
  const identity=norm(r.data.reference);if(references.has(identity)||proofs.has(r.sha256))fail('Deze Kunststofbaas-factuur of hetzelfde bestand is al geregistreerd.');references.add(identity);proofs.add(r.sha256);
  if(!Array.isArray(r.payments)||r.payments.length>100||new Set(r.payments.map(p=>p?.id)).size!==r.payments.length||r.payments.some(p=>!p||!id(p.id)||!money(p.amount)||p.amount<=0||!day(p.date)||typeof p.reference!=='string'||p.reference.length>200||Object.keys(p).some(k=>!['id','amount','date','reference'].includes(k))))fail('Controleer de werkelijke leveranciersbetalingen.');
  if(!money(r.payments.reduce((n,p)=>n+p.amount,0)))fail('De som van werkelijke betalingen is te groot.');
  if(!Array.isArray(r.priorItems)||r.priorItems.length>1000||r.priorItems.some(p=>!p||!id(p.orderId)||!id(p.itemId)||!p.before||Object.keys(p.before).some(k=>!costKeys.includes(k))))fail('Ongeldige oorspronkelijke productkosten.');
  if(!Array.isArray(r.history)||r.history.length>50||r.revision!==r.history.length+1||r.history.some(h=>!h||typeof h.reason!=='string'||!h.reason.trim()||h.reason.length>2000||!Number.isFinite(Date.parse(h.at))||!h.before||!documents.has(h.before.documentId)))fail('Ongeldige factuurhistorie.');
  for(const p of r.priorItems){keys(p,['orderId','itemId','before']);keys(p.before,costKeys);}
  for(const h of r.history){keys(h,['at','reason','before']);keys(h.before,['data','documentId','sha256','payments']);validateInvoiceData(h.before.data);if(!/^[a-f0-9]{64}$/.test(h.before.sha256)||!Array.isArray(h.before.payments)||h.before.payments.length>100||h.before.payments.some(p=>!p||!id(p.id)||!money(p.amount)||p.amount<=0||!day(p.date)||typeof p.reference!=='string'||p.reference.length>200||Object.keys(p).some(k=>!['id','amount','date','reference'].includes(k))))fail('Ongeldige historische factuurbron.');}
  const extras=invoiceExtraAllocations(r);for(const orderId of r.data.orderIds){const o=orders.get(orderId);if(!o)fail('Een gekoppelde factuurorder ontbreekt.');const amount=extras.get(orderId),row=o.namedCosts?.find(c=>c.supplierInvoiceImportId===r.id);if(!row||row.id!==r.id||row.amount!==amount||row.label!==costLabel(r.data.reference))fail('Gekoppelde factuurkosten pas je aan via Factuur inlezen; dezelfde kosten worden één keer opgenomen.');}
 }
 const projected=productProjection(state);
 for(const row of projected.values()){
  const o=orders.get(row.orderId),item=o?.items.find(i=>i.id===row.itemId);
  if(!item||item.productionSource==='local'||row.quantity>item.quantity||!money(row.total)||item.costSource!=='supplierInvoiceImport'||item.purchaseCostTotal!==row.total||item.purchaseCostQuantity!==row.quantity||item.cost!==(row.quantity===item.quantity?Math.round(row.total/row.quantity):null)||!same(item.supplierInvoiceImportIds,[...row.ids].sort()))fail('Productkosten sluiten niet aan op de ingelezen leveranciersfactuur. Corrigeer de bronfactuur, niet een losse kostprijs.');
  const purchase=(state.purchases||[]).find(p=>p.id===o.purchaseId);if(purchase?.freightIncludedInProductCosts===true&&purchase.freight>0)fail('Ingelezen productregels gebruiken hun exacte nettobron. Controleer de inbegrepen-transportbasis van deze zending voordat je die wijzigt.');
  if(legacyItems.has(row.itemId))fail('Dit product heeft al regels op een leveranciersdocument bij Inkoop. Gebruik die bestaande factuurwerkplek.');
 }
 for(const o of state.orders)for(const i of o.items)if(i.costSource==='supplierInvoiceImport'&&!projected.has(o.id+'/'+i.id))fail('De bronfactuur achter deze productkosten ontbreekt.');
 for(const o of state.orders)for(const row of o.namedCosts||[])if(row.supplierInvoiceImportId&&!records.some(r=>r.id===row.supplierInvoiceImportId&&r.data.orderIds.includes(o.id)))fail('De factuur achter de gekoppelde extra kosten ontbreekt.');
}
export function saveInvoiceIntake(state,input,expected,{companyId,confirmed=false,replaceCosts=false,reason='',today}={}){
 if(companyId!=='maatwerkkunststof')fail('Deze Kunststofbaas-factuurroute is alleen voor Maatwerkkunststof.');
 const rows=state.supplierInvoiceImports||[],old=rows.find(r=>r.id===input.id);
 const sameContent=r=>JSON.stringify([r.data,r.documentId,r.sha256,r.payments]);
 if(old&&sameContent(old)===sameContent(input)){validateInvoiceIntakes(state);return {alreadySaved:true};}
 if(invoiceIntakeBasis(state)!==expected)fail('Orders, factuurgegevens of bewijs zijn intussen gewijzigd. Je invoer blijft staan; open de actuele factuurcontrole opnieuw.');
 if(!confirmed)fail('Controleer en bevestig de factuur, bedragen en elke regelkoppeling.');
 validateInvoiceData(input.data);
 const control=state.documents.find(d=>d.id===input.documentId)?.supplierControlDocument;if(control&&control.kind!=='invoice')fail('Een leverancierspakbon of bevestiging is geen factuur. Kies de originele factuur voor kostenverwerking.');
 const duplicatePayment=input.payments.some(payment=>payment.reference.trim()&&((state.businessExpenses||[]).some(e=>isKunststofbaas(e.counterparty)&&e.payments.some(p=>p.amount===payment.amount&&p.date===payment.date&&norm(p.reference)===norm(payment.reference)))||(state.purchases||[]).some(p=>isKunststofbaas(p.supplier)&&supplierInvoices(p).some(i=>i.payments?.some(other=>other.amount===payment.amount&&other.date===payment.date&&norm(other.reference)===norm(payment.reference))))||rows.some(r=>r.id!==input.id&&r.payments.some(p=>p.amount===payment.amount&&p.date===payment.date&&norm(p.reference)===norm(payment.reference)))));
 if(duplicatePayment)fail('Dit bedrag, deze datum en dit betaalreferentiekenmerk staan al bij een andere Kunststofbaas-betaling. Controleer die bron.');
 if(input.payments.some(p=>p.date>today))fail('Registreer alleen betalingen die werkelijk al zijn gedaan.');
 if(old&&(!reason.trim()||reason.length>2000||old.history.length>=50))fail('Vul een wijzigingsreden in; maximaal 50 revisies.');
 const eligible=new Set(invoiceOrderChoices(state).map(o=>o.id)),d=input.data,selected=d.orderIds.map(orderId=>state.orders.find(o=>o.id===orderId));
 if(selected.some(o=>!o||o.archived&&!old?.data.orderIds.includes(o.id)||o.mergedIntoOrderId||!eligible.has(o.id)))fail('Kies bestaande, passende Kunststofbaas-orders. Heropen een gearchiveerde order voordat je een nieuwe factuur koppelt.');
 if(selected.some(o=>{const p=(state.purchases||[]).find(p=>p.id===o.purchaseId);return p?.freightIncludedInProductCosts===true&&p.freight>0;}))fail('Deze zending trekt inbegrepen transport uit productkosten. Controleer eerst bij Inkoop of deze factuurregels transport bevatten; leg de juiste transportbasis vast vóór het inlezen.');
 if(d.supplierOrderReferences.length&&selected.some(o=>!d.supplierOrderReferences.some(ref=>norm(ref)===norm(o.supplierOrderReference)))&&!d.notes.trim())fail('Een gekozen order mist een passend leveranciersbestelnummer. Licht de afwijkende handmatige koppeling toe bij Eigen toelichting, of kies de juiste order.');
 if(old&&!same([...old.data.orderIds].sort(),[...d.orderIds].sort()))fail('Orders van een bewaarde factuur verplaatsen vraagt een afzonderlijke financiële correctie. De bestaande koppeling blijft behouden.');
 if((state.businessExpenses||[]).some(e=>isKunststofbaas(e.counterparty)&&norm(e.reference)===norm(d.reference))||(state.purchases||[]).some(p=>isKunststofbaas(p.supplier)&&supplierInvoices(p).some(i=>norm(i.reference)===norm(d.reference))))fail('Deze factuur staat al bij Bedrijfskosten of Inkoop. Werk die bestaande bron bij om dubbel tellen te voorkomen.');
 if(state.documents.some(doc=>doc.id!==input.documentId&&doc.supplierDocument&&isKunststofbaas(doc.supplierDocument.supplier)&&norm(doc.supplierDocument.reference)===norm(d.reference)&&!invoiceIntakeReferencesDocument(state,doc.id)))fail('Er staat al een bestand met dit factuurnummer bij een order. Kies dat bestaande bewijs in plaats van een tweede upload.');
 const beforeProjection=productProjection(state),prior=clone(old?.priorItems||[]);
 for(const l of d.lines)if(l.itemId){const o=state.orders.find(o=>o.id===l.orderId),item=o?.items.find(i=>i.id===l.itemId);if(!item||item.productionSource==='local')fail('Een gekozen leveranciersproduct ontbreekt of wordt lokaal gemaakt.');if(!beforeProjection.has(o.id+'/'+item.id)&&!replaceCosts&&(item.cost!=null||item.calculatedCostTotal!=null||item.purchaseCostTotal!=null))fail('De factuur vervangt bestaande productkosten. Controleer het verschil en bevestig die vervanging apart.');if(!prior.some(p=>p.orderId===o.id&&p.itemId===item.id))prior.push({orderId:o.id,itemId:item.id,before:costSnapshot(item)});}
 const record={...clone(input),supplier:'kunststofbaas',createdAt:old?.createdAt||input.createdAt,revision:(old?.revision||0)+1,priorItems:prior,history:[...(old?.history||[]),...(old?[{at:input.updatedAt,reason:reason.trim(),before:{data:clone(old.data),documentId:old.documentId,sha256:old.sha256,payments:clone(old.payments)}}]:[])]};
 if(old)rows[rows.indexOf(old)]=record;else rows.push(record);state.supplierInvoiceImports=rows;
 const afterProjection=productProjection(state);
 for(const row of beforeProjection.values())if(!afterProjection.has(row.orderId+'/'+row.itemId)){
  const item=state.orders.find(o=>o.id===row.orderId)?.items.find(i=>i.id===row.itemId),original=rows.flatMap(r=>r.priorItems).find(p=>p.orderId===row.orderId&&p.itemId===row.itemId);if(!item||!original)fail('Oorspronkelijke kosten voor een correctie ontbreken.');for(const k of costKeys)delete item[k];Object.assign(item,clone(original.before));delete item.provenance?.cost;delete item.provenance?.purchaseCostTotal;delete item.provenance?.purchaseCostQuantity;
 }
 for(const row of afterProjection.values()){
  const item=state.orders.find(o=>o.id===row.orderId)?.items.find(i=>i.id===row.itemId);if(!item)fail('Een gekoppeld product ontbreekt.');Object.assign(item,{costSource:'supplierInvoiceImport',purchaseCostTotal:row.total,purchaseCostQuantity:row.quantity,cost:row.quantity===item.quantity?Math.round(row.total/row.quantity):null,supplierInvoiceImportIds:[...row.ids].sort()});delete item.calculatedCostTotal;delete item.provenance?.cost;markProvenance(item,['cost','purchaseCostTotal','purchaseCostQuantity'],'calculator');
 }
 const extras=invoiceExtraAllocations(record);for(const o of state.orders){const index=o.namedCosts?.findIndex(c=>c.supplierInvoiceImportId===record.id)??-1,amount=extras.get(o.id);if(amount===undefined)continue;const value={id:record.id,supplierInvoiceImportId:record.id,label:costLabel(d.reference),amount};o.namedCosts??=[];if(index>=0)o.namedCosts[index]=value;else o.namedCosts.push(value);}
 validateInvoiceIntakes(state);return {alreadySaved:false};
}

// Conservative recognition: only labelled, unambiguous source values. Product
// lines and deduction remain explicit review/AI fields, never invented here.
export function invoiceTextProposal(text){
 if(typeof text!=='string'||text.length>200000)fail('Gebruik maximaal 200.000 tekens factuurtekst.');
 if(/(?:\bUSD\b|\bGBP\b|\bTRY\b|[$£])/i.test(text))fail('Mogelijk een andere valuta dan EUR. Deze route rekent geen valuta om; controleer het originele document.');
 const lines=invoiceHeaderLines(text),warnings=[];
 const unique=values=>[...new Set(values)],one=(values,label)=>{const v=unique(values);if(v.length!==1){warnings.push(label+' zelf controleren/invullen');return null;}return v[0];};
 const amount=s=>{if(/(?:^|[\s:])[-−]\s*(?:€\s*)?\d|€\s*[-−]\s*\d|\(\s*(?:€\s*)?\d/.test(s)){warnings.push('Negatief bronbedrag niet als positieve kosten overnemen; controleer credit/korting');return null;}const m=s.match(/(?:€\s*|EUR\s*)?((?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}|\d+\.\d{2})\s*(?:EUR|€)?\s*$/i);if(!m)return null;const raw=m[1],v=raw.includes(',')?Number(raw.replace(/\./g,'').replace(',','.')):Number(raw);return Math.round(v*100);};
 const values=pattern=>lines.filter(l=>pattern.test(l)).map(amount).filter(v=>v!==null);
 const reference=one(lines.flatMap(l=>{const m=l.match(/^(?:factuurnummer|factuur\s*(?:nr\.?|nummer)|invoice\s*(?:number|no\.?))\s*[:#]?\s*(\S+)$/i);return m?[m[1]]:[];}),'Factuurnummer');
 const supplierOrderReferences=unique(lines.flatMap(l=>{const m=l.match(/^(?:bestelnummer|ordernummer|order\s*(?:nr\.?|nummer|number))\s*[:#]?\s*#?([A-Za-z0-9._/-]+)$/i);return m?[m[1]]:[];}));
 const date=one(lines.flatMap(l=>{const m=l.match(/^(?:factuurdatum|invoice date)\s*:?\s*(.+)$/i),value=m?invoiceDate(m[1]):'';return value?[value]:[];}),'Factuurdatum');
 return {reference:reference||'',date:date&&day(date)?date:'',currency:'EUR',supplierOrderReferences,netCents:one(values(/^(?:netto|totaal\s*(?:excl\.?|exclusief)\s*(?:btw)?)/i),'Netto'),vatCents:one(values(/^(?:btw|vat)(?:\s|:)/i),'Btw'),grossCents:one(values(/^(?:totaal\s*(?:incl\.?|inclusief)|totaal\s*[:€]|total\s*[:€])/i),'Bruto'),warnings:[...warnings,...(!/kunststofbaas/i.test(text)?['Leverancier Kunststofbaas niet herkend: controleer het origineel.']:[]),...(/credit|pro\s*forma|offerte|quotation/i.test(text)?['Mogelijke credit/offerte/pro forma: deze route is voor gewone facturen.']:[])]};
}
