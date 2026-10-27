import {calculationRecord,calculationSignature,applyCalculation} from '../costing/crm-storage.js';
import {markProvenance} from '../../shared/provenance.js?v=provenance-colors-20261027';
export const orderContextSignature=order=>JSON.stringify({customerId:order.customerId,packagePrice:order.packagePrice,vat:order.vat,archived:order.archived});
export function orderTarget(state,orderId,itemId){
 const order=state?.orders?.find(o=>o.id===orderId),item=order?.items?.find(i=>i.id===itemId),customer=state?.customers?.find(c=>c.id===order?.customerId);
 if(!order||!item)throw Error('Deze productregel bestaat niet meer. Kies de order opnieuw.');
 if(order.archived)throw Error('Deze order is gearchiveerd. Heropen de order eerst in het CRM.');
 return {order,item,customer,binding:{orderId,itemId,signature:calculationSignature(item),orderSignature:orderContextSignature(order)}};
}
export function seedOrderCalculation(target,{Core,check,quote=null}){
 const {order,item}=target;
 if(item.costCalculation){
  const record=item.costCalculation;if(record.companyId!=='maatwerkkunststof'||![1,2].includes(record.version))throw Error('Deze orderberekening heeft een onbekende versie. De invoer is behouden.');
  return {inputs:check({...structuredClone(record.inputs),selectedScenarioId:record.selectedScenarioId}),stored:true,warning:'De bewaarde berekening is geladen. Controleer of de huidige ordermaten en aantallen nog overeenkomen.'};
 }
 if(item.costQuoteLink?.quoteId&&quote){
  const inputs=structuredClone(quote.inputs),p=inputs.pieces.find(p=>p.id===item.costQuoteLink.pieceId);if(!p)throw Error('Het gekoppelde product ontbreekt in de bronberekening.');
  if(inputs.pieces.length>1)for(const s of inputs.scenarios)if(s.costSource==='quote_total')s.quotedTotal=0;
  inputs.pieces=[p];inputs.selectedScenarioId=item.costQuoteLink.scenarioId||quote.selectedScenarioId;
  return {inputs:check(inputs),stored:false,warning:'De gekoppelde offerteberekening is geladen. Controleer de ordermaten, aantallen en leverancier voordat je overneemt.'};
 }
 const inputs=Core.defaultState(),p=inputs.pieces[0],spec={...(order.items.length===1?order.inquirySpecs:{})};
 // Empty product placeholders must not hide known request specifications.
 for(const [key,value] of Object.entries(item))if(value!=null&&value!=='')spec[key]=value;
 Object.assign(p,{name:String(item.description||order.inquiryProduct||''),quantity:Number(spec.quantity)||1,material:String(spec.material||''),thickness:Number(spec.thickness)||0,width:Number(spec.width)||0,height:Number(spec.height)||0,shape:'rect',process:'mill',opening:'none',holeMode:'coordinates',holeCoordinates:'',holes:0});
 if(['cad','polygon','lshape'].includes(spec.shape))throw Error('Deze productvorm heeft nog geen bewaarde contour. Importeer eerst de originele tekening en koppel daarna de order.');
 if(['circle','round','rond','cirkel','schijf','ring'].includes(spec.shape)||spec.diameter>0){p.shape='circle';p.outerDiameter=Number(spec.diameter)||Number(spec.width)||0;p.innerDiameter=Number(spec.holeDiameter)||0;p.opening=p.innerDiameter>0?'circle':'none';}
 else if(spec.shape==='manhole')p.shape='manhole';
 return {inputs:check(inputs),stored:false,warning:'Ordergegevens geladen. Vul ontbrekende materialen, dikte en leverancierstarieven aan.'};
}
export function orderCalculationRecord(snapshot,now=new Date().toISOString()){
 const record=calculationRecord(snapshot,{version:'local-v2',coreVersion:'CostingV2-20261015',now});record.version=2;return record;
}
export function applyOrderCalculation(state,binding,record,options={}){
 const target=orderTarget(state,binding.orderId,binding.itemId);
 if(target.binding.orderSignature!==binding.orderSignature)throw Error('De klant, totaalprijs of btw-instelling van deze order is intussen gewijzigd. Koppel de order opnieuw.');
 if(record.version!==2||record.companyId!=='maatwerkkunststof')throw Error('Gebruik een geldige V2-orderberekening.');
 const supplier=record.inputs.scenarios.find(s=>s.id===record.selectedScenarioId);if(!supplier)throw Error('Kies een leverancier.');
 if(supplier.costSource!=='calculated'&&!options.confirmSupplierQuote)throw Error('Bevestig dat de leveranciersofferte geldt voor deze maten en aantallen.');
 if(!options.copyProduct&&(options.copyCost||options.copySale)){
  const p=record.inputs.pieces[0],i=target.item;
  if(String(p.material||'').trim().toLowerCase()!==String(i.material||'').trim().toLowerCase()||Number(p.thickness)!==Number(i.thickness)||i.shape&&p.shape!==i.shape)throw Error('Materiaal, dikte of vorm wijkt af van de order. Neem ook de productgegevens over, of bewaar alleen de berekening.');
 }
 // Reuse existing invoice/quantity/package-price guards. Store V2 explicitly so
 // the original V1 bridge refuses to reinterpret CAD or coordinate geometry.
 const item=applyCalculation(state,binding,{...record,version:1},options);item.costCalculation=structuredClone(record);
 if(options.copyProduct)markProvenance(item,['width','height','quantity','shape','thickness','material','diameter','holeDiameter'],'calculator');
 if(options.copyCost)markProvenance(item,['cost'],'calculator');if(options.copySale)markProvenance(item,['price'],'calculator');
 return item;
}
export async function saveOrderCalculation(db,{binding,record,options={},isCurrent=()=>true}){
 let saved;await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite'),store=tx.objectStore('state'),r=store.get('main');let failure;
 r.onsuccess=()=>{try{if(!isCurrent())throw Error('De berekening is intussen gewijzigd. Controleer de uitkomst opnieuw.');const state=r.result;applyOrderCalculation(state,binding,record,options);saved=orderTarget(state,binding.orderId,binding.itemId);store.put(state,'main');}catch(e){failure=e;tx.abort();}};
 tx.oncomplete=resolve;tx.onerror=()=>reject(failure||tx.error);tx.onabort=()=>reject(failure||Error('Orderberekening opslaan afgebroken.'));
 });return saved;
}
