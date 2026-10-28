import {addressParts} from './document-address.js';
import {documentSeriesKey,documentVersion} from './document-revisions.js';
import {inboundReadiness} from './inbound-readiness.js?v=feedback-followup-20261028';
import {customerExecutionDetails} from './product-specifications.js';

const packingPdf=d=>(d.generated?.kind||d.category)==='packing'&&(d.type==='application/pdf'||/\.pdf$/i.test(d.name||''));
export const batchPackingItems=o=>(o.items||[]).filter(i=>i.productionSource!=='local');
export function batchPackingAddress(o,c){return o.delivery?.source==='custom'?o.delivery:{recipient:c?.shippingRecipient||c?.contact||c?.company||'',address:c?.shippingAddress||'',country:c?.shippingCountry||c?.country||''};}
// A distinct partial delivery is a distinct series. Only revisions of that
// series collapse; never silently discard another saved packing slip.
function currentPackingPdfs(state,orderId){
 const latest=new Map();
 for(const d of (state.documents||[]).filter(d=>d.ownerId===orderId&&packingPdf(d))){const key=documentSeriesKey(d),old=latest.get(key);if(!old||documentVersion(d)>documentVersion(old)||documentVersion(d)===documentVersion(old)&&String(d.createdAt||d.date||'')>String(old.createdAt||old.date||''))latest.set(key,d);}
 return [...latest.values()].sort((a,b)=>String(a.generated?.number||a.name).localeCompare(String(b.generated?.number||b.name),'nl',{numeric:true}));
}
export function batchPackingReview(state,purchaseId){
 const purchase=(state.purchases||[]).find(p=>p.id===purchaseId);if(!purchase)throw Error('Deze bestelling bestaat niet meer.');
 const rows=(state.orders||[]).filter(o=>o.purchaseId===purchaseId).map(order=>{
  const customer=(state.customers||[]).find(c=>c.id===order.customerId),items=batchPackingItems(order),address=batchPackingAddress(order,customer),documents=currentPackingPdfs(state,order.id),warnings=[],blocked=[];
  const parts=addressParts(address.address,address.country);
  const excluded=order.archived?'Order gearchiveerd':order.deliveredDate||order.shippedDate||['Afgerond','Verzonden'].includes(order.stage)?'Al geleverd of verzonden':!items.length?'Geen leveranciersproducten in deze bestelling':'';
  if(!customer)blocked.push('Klantdossier ontbreekt');
  if(!documents.length){
   if(!items.length||items.length>40||items.some(i=>!Number.isSafeInteger(i.quantity)||i.quantity<1||i.quantity>100000||!i.description?.trim()||i.description.length>200))blocked.push('Vul geldige productomschrijvingen en aantallen in (maximaal 40 productregels)');
   if(order.items?.some(i=>i.productionSource==='local'))warnings.push('Lokale productie valt buiten deze pakbon; alleen leveranciersproducten worden opgenomen.');
   if(order.fulfilmentMethod!=='pickup'&&(!address.recipient?.trim()||!parts.street||!parts.postal||!address.country?.trim()))warnings.push('Aflevergegevens ontbreken. Na bewust doorgaan staat NIET INGEVULD op de ontbrekende adresvelden.');
  }
  if(!['pickup','shipping','delivery'].includes(order.fulfilmentMethod))warnings.push('Leverwijze nog afspreken.');
  if(!purchase.arrivedDate&&purchase.status!=='Binnen in Nederland')warnings.push('Ontvangst van deze bestelling is nog niet geregistreerd.');
  if(purchase.archived)warnings.push('Deze bestelling is gearchiveerd.');
  if(items.some(i=>!Number.isFinite(i.width)||i.width<=0||!Number.isFinite(i.height)||i.height<=0))warnings.push('Niet alle productmaten zijn ingevuld.');
  if(items.some(i=>i.printColors==null))warnings.push('Niet alle drukkleuren zijn vastgelegd.');
  for(const gap of inboundReadiness(state,order,'spatlappen').gaps)if(!['delivery-method','delivery-address','delivery-recipient'].includes(gap.key))warnings.push(gap.reason);
  if(documents.length>1)warnings.push('Meerdere afzonderlijke pakbonnen: controleer op deelleveringen. Kies hieronder de bestanden die mee moeten.');
  for(const d of documents){
   const payload=d.generated?.payload;
   if(!payload)warnings.push(d.name+': inhoud niet automatisch te vergelijken; controleer het bewaarde document.');
   else{
    if(payload.items?.length!==items.length||items.some((i,n)=>payload.items?.[n]?.quantity!==i.quantity||payload.items?.[n]?.description!==i.description||payload.items?.[n]?.deliveredQuantity!==i.quantity))warnings.push(d.name+': producten of geleverde aantallen wijken af van de volledige huidige leveranciersorder.');
    const savedAddress=[payload.fields?.shipping_street,payload.fields?.shipping_postal_city].filter(Boolean).join(' ').replace(/[\s,]+/g,' ').trim(),currentAddress=String(address.address||'').replace(/[\s,]+/g,' ').trim();
    if(order.fulfilmentMethod!=='pickup'&&(savedAddress!==currentAddress||payload.fields?.shipping_country!==address.country))warnings.push(d.name+': controleer het bewaarde afleveradres tegenover de huidige leverafspraak.');
   }
  }
  return {order,customer,items,address,documents,excluded,warnings:[...new Set(warnings)],blocked,ready:!excluded&&!blocked.length&&!warnings.length};
 });
 return {purchase,rows,applicable:rows.filter(r=>!r.excluded)};
}
// Include the live source documents and numbering series in the review basis.
// A later edit/addition must require a fresh review, never silently join a run.
export function batchPackingBasis(state,purchaseId){
 const review=batchPackingReview(state,purchaseId);
 return JSON.stringify([state.companyId,review.purchase,review.rows.map(r=>[r.order,r.customer]),(state.payments||[]).filter(payment=>review.rows.some(r=>r.order.id===payment.orderId)),(state.documents||[]).filter(d=>review.rows.some(r=>r.order.id===d.ownerId)&&packingPdf(d)),state.documentSequences||{},(state.documents||[]).filter(d=>d.generated?.number).map(d=>[d.id,d.generated.number])]);
}
export function batchPackingPayload(row,number,day,{splitAddress,dimensions}){
 if(row.documents.length||row.blocked.length||row.excluded)throw Error('Deze order moet eerst afzonderlijk worden gecontroleerd.');
 const {order,customer,items,address}=row,pickup=order.fulfilmentMethod==='pickup',parts=splitAddress(address.address,address.country);
 const missingAddress=!pickup&&(!address.recipient?.trim()||!parts.street||!parts.postal||!address.country?.trim());
 return {kind:'packing',number,fields:{document_date:day,delivery_date:'',order_number:String(order.number),customer_reference:String(order.sourceNumber||''),shipping_company:address.recipient||customer.company||customer.contact||'NIET INGEVULD',shipping_attention:'',shipping_street:pickup?'Afhalen':parts.street||'NIET INGEVULD',shipping_postal_city:pickup?'Geen verzendadres':parts.postal||'NIET INGEVULD',shipping_country:pickup?'':address.country||'NIET INGEVULD',delivery_notes:[missingAddress?'LET OP: aflevergegevens ontbreken; aanvullen vóór verzending.':'',order.documentDrafts?.packing?.delivery_notes||''].filter(Boolean).join('\n')},items:items.map(i=>({description:i.description,quantity:i.quantity,deliveredQuantity:i.quantity,details:[i.width&&i.height?'Afmeting: '+dimensions(i):'',...customerExecutionDetails(i,'spatlappen')].filter(Boolean)}))};
}
