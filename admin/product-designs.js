import {openCrmDatabase} from './cloud-storage.js?v=crm-code-review-20261027';
import {supplierInvoices,physicalQuantity} from './purchases/costs.js';
import {productDesignVariants,currentFinalVariant,designVariantBasis,variantMatchesProduct} from '../shared/product-design-variants.js?v=batch1-variants-20261026';

export function productDesignUrl(o,item,mode='local',variantId=''){
 const query=new URLSearchParams({orderId:o.id,itemId:item.id,unit:'cm'});
 if(item.width)query.set('w',String(item.width/10));if(item.height)query.set('h',String(item.height/10));query.set('qty',String(item.quantity));
 if(mode==='cloud')query.set('storage','cloud');if(variantId)query.set('variant',variantId);return '../spatlap-preview.html?'+query;
}
export const productDesignSignature=item=>JSON.stringify([item.id,item.width,item.height,item.quantity,item.designDocumentId||'',item.designUpdatedAt||'',item.designVariants||null,item.designFinalVariantId||'',item.designFinalUpdatedAt||'',item.designFinalBasis||'']);
export function designMeasurements(flap){
 if(!flap||typeof flap!=='object')throw Error('De maatvoering van het ontwerp ontbreekt. Open het ontwerp opnieuw.');
 const width=Math.round(Number(flap.w)*10),height=Math.round(Number(flap.h)*10),quantity=String(flap.qty??'').trim()===''?null:Number(flap.qty);
 if(!Number.isSafeInteger(width)||width<1||!Number.isSafeInteger(height)||height<1)throw Error('Vul geldige afmetingen in centimeters in.');
 if(quantity!==null&&(!Number.isSafeInteger(quantity)||quantity<1))throw Error('Vul een heel aantal van minimaal 1 in.');return {width,height,quantity};
}
function read(db,name,key){return new Promise((resolve,reject)=>{const tx=db.transaction(name),request=tx.objectStore(name).get(key);let value;request.onsuccess=()=>value=request.result;tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
async function readProductDesignRecord(db,orderId,itemId,documentId){
 const file=await read(db,'files',documentId);if(!file?.blob)throw Error('Het opgeslagen ontwerp ontbreekt. Er is niets overschreven.');
 const record=JSON.parse(await file.blob.text());
 if(!record.payload||record.context?.orderId!==orderId||record.context?.itemId!==itemId)throw Error('Het opgeslagen ontwerp hoort niet bij dit product.');
 return record;
}
export async function readProductDesignSourceBasis(orderId,itemId,variant){
 if(!variant.previewId)throw Error('Het opgeslagen ontwerpvoorbeeld ontbreekt. Open en bewaar deze variant opnieuw.');
 const db=await openCrmDatabase(),record=await readProductDesignRecord(db,orderId,itemId,variant.documentId),preview=await read(db,'files',variant.previewId);
 if(!preview?.blob||preview.blob.type!=='image/png'||!preview.blob.size)throw Error('Het opgeslagen ontwerpvoorbeeld ontbreekt. Open en bewaar deze variant opnieuw.');
 return designMeasurements(record.payload.f);
}
function nextVariantName(variants){
 const names=new Set(variants.map(v=>v.name.toLocaleLowerCase('nl')));
 for(let index=0;;index++){const name='Ontwerp '+(index<26?String.fromCharCode(65+index):index+1);if(!names.has(name.toLocaleLowerCase('nl')))return name;}
}
export async function loadProductDesign(orderId,itemId,{variantId='',copyVariantId='',revisionDocumentId=''}={}){
 const db=await openCrmDatabase(),data=await read(db,'state','main'),o=data?.orders.find(o=>o.id===orderId),item=o?.items.find(i=>i.id===itemId);
 if(!item)throw Error('Dit product bestaat niet meer. Open de ontwerptool opnieuw vanuit de order.');
 if(variantId&&variantId!=='new'&&!productDesignVariants(item).some(v=>v.id===variantId))throw Error('Deze ontwerpvariant bestaat niet meer. Open de order opnieuw.');
 const variants=productDesignVariants(item),isNew=variantId==='new'||!variants.length;
 const chosen=isNew?null:variantId?variants.find(v=>v.id===variantId):currentFinalVariant(item)||variants.find(v=>v.documentId===item.designDocumentId)||variants[0];
 if(!isNew&&!chosen)throw Error('Deze ontwerpvariant bestaat niet meer. Open de order opnieuw.');
 if(copyVariantId&&!isNew)throw Error('Kies een nieuwe variant voor een ontwerpkopie.');
 const source=copyVariantId?variants.find(v=>v.id===copyVariantId):chosen;
 if(copyVariantId&&!source)throw Error('Het bronontwerp voor de kopie ontbreekt.');
 const binding={requiresFinalChoice:Boolean(item.designVariants?.length&&!currentFinalVariant(item)),orderId,itemId,customerId:o.customerId,number:o.sourceNumber||o.number,description:item.description,company:data.customers.find(c=>c.id===o.customerId)?.company||'',signature:productDesignSignature(item),legacyDocumentId:item.designVariants?null:item.designDocumentId||null,width:item.width,height:item.height,quantity:item.quantity,designId:isNew?crypto.randomUUID():chosen.designId,variantId:isNew?crypto.randomUUID():chosen.id,variantNew:isNew,variantName:isNew?nextVariantName(variants):chosen.name};
 if(revisionDocumentId&&(!isNew||!source?.revisions?.some(r=>r.documentId===revisionDocumentId)))throw Error('Kies een bewaarde revisie van deze variant als nieuwe kopie.');
 if(source?.documentId){
  const record=await readProductDesignRecord(db,orderId,itemId,revisionDocumentId||source.documentId);
  binding.sourceNeedsReview=!variantMatchesProduct(item,{sourceBasis:designMeasurements(record.payload.f)});
  binding.record={...record,...(isNew?{id:binding.designId,name:binding.variantName}:{})};
 }
 return binding;
}
export async function saveProductDesign(binding,record,preview){
 if(!(preview instanceof Blob)||preview.type!=='image/png'||!preview.size)throw Error('Het ontwerpvoorbeeld kon niet worden gemaakt. Er is nog niets opgeslagen.');
 const measurements=designMeasurements(record.payload.f),db=await openCrmDatabase(),now=new Date().toISOString(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Makassar'}).format(new Date()),designDocumentId=crypto.randomUUID(),designPreviewId=crypto.randomUUID();
 const stored={...structuredClone(record),id:binding.designId,context:{customerId:binding.customerId,orderId:binding.orderId,itemId:binding.itemId,designId:binding.designId,variantId:binding.variantId}};
 stored.payload.f.w=measurements.width/10;stored.payload.f.h=measurements.height/10;stored.payload.f.qty=measurements.quantity===null?'':String(measurements.quantity);
 const name=String(record.name||binding.variantName).trim();if(!name||name.length>100)throw Error('Geef het ontwerp een naam van maximaal 100 tekens.');stored.name=name;
 const designBlob=new Blob([JSON.stringify(stored)],{type:'application/json'});let savedItem;
 // Read legacy artwork before opening the write transaction. The signature is
 // checked inside that transaction; no asynchronous file reads go inside it.
 let legacySourceBasis;
 if(binding.legacyDocumentId){const previous=await readProductDesignRecord(db,binding.orderId,binding.itemId,binding.legacyDocumentId);legacySourceBasis=designMeasurements(previous.payload.f);}
 await new Promise((resolve,reject)=>{
  const tx=db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),request=ss.get('main');tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Ontwerp opslaan afgebroken.'));
  request.onsuccess=()=>{try{
   const next=request.result,o=next?.orders.find(o=>o.id===binding.orderId),item=o?.items.find(i=>i.id===binding.itemId);
   if(!item)throw Error('Dit product is intussen verwijderd. Het ontwerp is niet opgeslagen.');
   if(o.customerId!==binding.customerId)throw Error('Deze order hoort intussen bij een andere klant. Bewaar een ontwerpkopie en open de tool opnieuw vanuit de order.');
   if(productDesignSignature(item)!==binding.signature)throw Error('Dit product of een ontwerp is intussen gewijzigd. Bewaar een ontwerpkopie en open het product opnieuw.');
   const variants=structuredClone(productDesignVariants(item)),old=variants.find(v=>v.id===binding.variantId);
   if(legacySourceBasis&&variants[0])variants[0].sourceBasis={...legacySourceBasis};
   if(binding.variantNew?old||variants.length>=100:!old)throw Error('De ontwerpkeuze is gewijzigd of er zijn al 100 varianten. Open de order opnieuw.');
   if(variants.some(v=>v.id!==binding.variantId&&v.name.toLocaleLowerCase('nl')===name.toLocaleLowerCase('nl')))throw Error('Deze ontwerpnaam bestaat al bij het product. Kies een andere naam.');
   if((item.designVariants?.length||binding.variantNew&&variants.length)&&(measurements.width!==item.width||measurements.height!==item.height||measurements.quantity!==null&&measurements.quantity!==item.quantity))throw Error('Varianten delen dezelfde productmaat en hetzelfde aantal. Pas die zo nodig eerst bij de order aan en open de variant opnieuw.');
   if(measurements.quantity!==null&&item.costSource==='supplierInvoice'&&measurements.quantity!==item.quantity){const lines=(next.purchases||[]).flatMap(p=>supplierInvoices(p).flatMap(inv=>(inv.lines||[]).filter(l=>l.itemId===item.id))),quantity=lines.reduce((sum,line)=>sum+physicalQuantity(line),0);if(measurements.quantity<quantity)throw Error('Er zijn al '+quantity+' stuks gekoppeld aan leveranciersfacturen. Pas eerst de inkoopregels aan.');item.purchaseCostQuantity=quantity;item.purchaseCostTotal=lines.reduce((sum,l)=>sum+l.quantity*l.price,0);if(measurements.quantity!==quantity)item.cost=null;}
   if(!item.designVariants&&variants.length){const legacy=variants[0],preview=next.documents.find(d=>d.id===legacy.previewId);if(preview?.imageRole==='approved'&&preview.productDesignPreview&&legacy.updatedAt&&variantMatchesProduct(item,legacy)){item.designFinalVariantId=legacy.id;item.designFinalUpdatedAt=legacy.updatedAt;item.designFinalBasis=designVariantBasis(item,legacy);}}
   const revisions=old?[...(old.revisions||[]),{documentId:old.documentId,previewId:old.previewId,updatedAt:old.updatedAt,...(old.legacy?{legacy:true}:{}),...(old.sourceBasis?{sourceBasis:{...old.sourceBasis}}:{})}]:[];
   if(revisions.length>500)throw Error('Deze variant heeft 500 revisies. Maak een nieuwe variant; bestaande versies blijven bewaard.');
   const variant={id:binding.variantId,name,designId:binding.designId,documentId:designDocumentId,previewId:designPreviewId,updatedAt:now,sourceBasis:{...measurements},revisions};
   if(old)variants[variants.indexOf(old)]=variant;else variants.push(variant);item.designVariants=variants;
   if(item.designFinalVariantId===variant.id){delete item.designFinalUpdatedAt;const prior=next.documents.find(d=>d.id===old?.previewId);if(prior?.imageRole==='approved'){prior.imageRole='reference';prior.approvalSupersededAt=now;}}
   const metadata={ownerId:o.id,itemId:item.id,category:'other',date:day,createdAt:now,designVariantId:variant.id};
   next.documents.push({...metadata,id:designDocumentId,name:name+'_'+item.id+'.json',type:designBlob.type,size:designBlob.size,internalDesign:true},{...metadata,id:designPreviewId,name:name+'_'+item.id+'.png',type:'image/png',size:preview.size,imageRole:'reference',productDesignPreview:true});
   if(!currentFinalVariant(item)){const previous=item.designPreviewId;Object.assign(item,{designId:binding.designId,designDocumentId,designPreviewId,designUpdatedAt:now});if(!item.primaryImageId||item.primaryImageId===previous)item.primaryImageId=designPreviewId;}
   Object.assign(item,{width:measurements.width,height:measurements.height,...(measurements.quantity===null?{}:{quantity:measurements.quantity})});
   next.activities.unshift({id:crypto.randomUUID(),message:name+' bewaard bij '+item.description+' · order #'+(o.sourceNumber||o.number),time:now});
   const fs=tx.objectStore('files');fs.put({id:designDocumentId,blob:designBlob});fs.put({id:designPreviewId,blob:preview});ss.put(next,'main');savedItem=structuredClone(item);
  }catch(error){tx.abort();reject(error);}};tx.oncomplete=resolve;
 });
 binding.signature=productDesignSignature(savedItem);binding.width=savedItem.width;binding.height=savedItem.height;binding.quantity=savedItem.quantity;binding.variantNew=false;binding.variantName=name;binding.record=stored;binding.sourceNeedsReview=false;binding.legacyDocumentId=null;
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('spatlappen-crm-changes'):null;channel?.postMessage('changed');channel?.close();return {record:stored,item:savedItem};
}
