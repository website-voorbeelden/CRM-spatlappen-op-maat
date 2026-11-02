import {supplierPackingReferenceEnabled,supplierFulfilmentSignature,setSupplierOrderReference,confirmSupplierReference} from './supplier-fulfilment.js?v=packs-worker-v3-20261102';

// A reference on its own is not evidence of a placed order or shipment.
export function recordSupplierReference(state,orderId,reference,expected,companyId,{placed=false}={}){
 const order=state.orders.find(o=>o.id===orderId);
 if(!order||order.archived||order.mergedIntoOrderId||!supplierPackingReferenceEnabled(state,order,companyId))throw Error('Open een actieve Maatwerkkunststof-order bij Kunststofbaas.');
 if(typeof reference!=='string'||!reference.trim()||reference.length>200||/[\r\n\0]/.test(reference))throw Error('Vul het Kunststofbaas-bestelnummer in op één regel, maximaal 200 tekens.');
 reference=reference.trim();
 if(order.supplierOrderReference===reference&&!placed)return {alreadySaved:true};
 if(supplierFulfilmentSignature(state,order)!==expected)throw Error('De order, klant of inkoop is intussen gewijzigd. Je nummer blijft in het formulier staan; open de actuele order opnieuw.');
 setSupplierOrderReference(order,reference);
 if(placed)confirmSupplierReference(state,orderId,supplierFulfilmentSignature(state,order),companyId);
 return {alreadySaved:false};
}

export function validateSupplierControlDocuments(state){
 for(const doc of state.documents)if(doc.supplierControlDocument!==undefined){
  const m=doc.supplierControlDocument;
  if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).some(k=>!['supplierKey','kind','reference','sha256'].includes(k))||m.supplierKey!=='kunststofbaas'||!['invoice','packing','confirmation'].includes(m.kind)||typeof m.reference!=='string'||m.reference.length>200||/[\r\n\0]/.test(m.reference)||!/^([a-f0-9]{64})$/.test(m.sha256)||doc.category!=='other'||doc.type!=='application/pdf'||!Number.isSafeInteger(doc.size)||doc.size<=0||doc.size>15*1024*1024||!state.orders.some(o=>o.id===doc.ownerId)||doc.generated||doc.shippingLabel||doc.supplierDocument||doc.manualDelivery)throw Error('Controleer het Kunststofbaas-controledocument bij de order.');
 }
}

const normal=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function supplierDocumentTextHints(text,data,reference){
 if(typeof text!=='string'||text.length>200000)throw Error('Gebruik maximaal 200.000 tekens documenttekst.');
 const refs=[...text.matchAll(/\b(?:bestelnummer|bestelnr\.?|ordernummer|ordernr\.?|order\s*(?:number|no\.?))\s*[:#]?\s*([a-z0-9][a-z0-9._\/-]{0,79})\b/gi)].map(m=>m[1]).filter(value=>/\d/.test(value));
 const unique=[...new Set(refs.map(normal))],ref=normal(reference).replace(/^#/,''),body=normal(text),dims=[...text.matchAll(/\b(\d+(?:[.,]\d+)?)\s*(?:mm\s*)?[x×]\s*(\d+(?:[.,]\d+)?)\s*mm\b/gi)].map(m=>[Number(m[1].replace(',','.')),Number(m[2].replace(',','.'))]);
 return {references:[...new Set(refs)],referenceStatus:!ref?'missing':unique.includes(ref)?unique.length===1?'mentioned':'multiple':unique.length?'different':'unreadable',ownNumberMentioned:body.includes(normal('Maatwerkkunststof order #'+data.number)),dimensions:data.items.map(item=>({itemId:item.id,mentioned:!!item.width&&!!item.height&&dims.some(([w,h])=>w===item.width&&h===item.height||h===item.width&&w===item.height)}))};
}
