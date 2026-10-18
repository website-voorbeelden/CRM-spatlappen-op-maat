import {openCrmDatabase} from './cloud-storage.js';
import {supplierInvoices,physicalQuantity} from './supplier-costs.js';

export function productDesignUrl(o,item,mode='local') {
  const query=new URLSearchParams({orderId:o.id,itemId:item.id,unit:'cm'});
  if (item.width) query.set('w',String(item.width/10));
  if (item.height) query.set('h',String(item.height/10));
  query.set('qty',String(item.quantity));
  if (mode==='cloud') query.set('storage','cloud');
  return '../spatlap-preview.html?'+query;
}
export const productDesignSignature=item=>JSON.stringify([item.id,item.width,item.height,item.quantity,item.designDocumentId||'',item.designUpdatedAt||'']);
export function designMeasurements(flap) {
  const width=Math.round(Number(flap.w)*10),height=Math.round(Number(flap.h)*10),quantity=String(flap.qty??'').trim()===''?null:Number(flap.qty);
  if (!Number.isSafeInteger(width)||width<1||!Number.isSafeInteger(height)||height<1) throw Error('Vul geldige afmetingen in centimeters in.');
  if (quantity!==null&&(!Number.isSafeInteger(quantity)||quantity<1)) throw Error('Vul een heel aantal van minimaal 1 in.');
  return {width,height,quantity};
}
function read(db,name,key) {
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(name),request=tx.objectStore(name).get(key);let value;
    request.onsuccess=()=>value=request.result;tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
export async function loadProductDesign(orderId,itemId) {
  const db=await openCrmDatabase(),data=await read(db,'state','main');
  const o=data?.orders.find(o=>o.id===orderId),item=o?.items.find(i=>i.id===itemId);
  if (!o||!item) throw Error('Dit product bestaat niet meer. Open de ontwerptool opnieuw vanuit de order.');
  const binding={orderId,itemId,customerId:o.customerId,number:o.sourceNumber||o.number,description:item.description,company:data.customers.find(c=>c.id===o.customerId)?.company||'',signature:productDesignSignature(item),width:item.width,height:item.height,quantity:item.quantity,designId:item.designId||crypto.randomUUID()};
  if (item.designDocumentId) {
    const file=await read(db,'files',item.designDocumentId);
    if (!file) throw Error('Het opgeslagen ontwerp ontbreekt. Er is geen leeg ontwerp overheen opgeslagen.');
    const record=JSON.parse(await file.blob.text());
    if (!record.payload||record.context?.orderId!==orderId||record.context?.itemId!==itemId) throw Error('Het opgeslagen ontwerp hoort niet bij dit product. Open de order opnieuw.');
    binding.record=record;binding.designId=record.id;
  }
  return binding;
}
export async function saveProductDesign(binding,record,preview) {
  if (!(preview instanceof Blob)||preview.type!=='image/png'||!preview.size) throw Error('Het ontwerpvoorbeeld kon niet worden gemaakt. Er is nog niets opgeslagen.');
  const measurements=designMeasurements(record.payload.f),db=await openCrmDatabase();
  const now=new Date().toISOString(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Makassar'}).format(new Date());
  const designDocumentId=crypto.randomUUID(),designPreviewId=crypto.randomUUID();
  const stored={...record,context:{customerId:binding.customerId,orderId:binding.orderId,itemId:binding.itemId,designId:record.id}};
  // Keep the saved artwork and PNG on the same whole-millimetre dimensions.
  stored.payload.f.w=measurements.width/10;stored.payload.f.h=measurements.height/10;stored.payload.f.qty=measurements.quantity===null?'':String(measurements.quantity);
  const designBlob=new Blob([JSON.stringify(stored)],{type:'application/json'});
  let savedItem;
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),request=ss.get('main');
    tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Ontwerp opslaan afgebroken.'));
    request.onsuccess=()=>{try {
      const next=request.result,o=next?.orders.find(o=>o.id===binding.orderId),item=o?.items.find(i=>i.id===binding.itemId);
      if (!item) throw Error('Dit product is intussen verwijderd. Het ontwerp is niet opgeslagen.');
      if (productDesignSignature(item)!==binding.signature) throw Error('Dit product of ontwerp is intussen gewijzigd. Bewaar zo nodig een ontwerpbestand via Download en open het product opnieuw.');
      if (measurements.quantity!==null&&item.costSource==='supplierInvoice'&&measurements.quantity!==item.quantity) {
        const lines=(next.purchases||[]).flatMap(p=>supplierInvoices(p).flatMap(inv=>(inv.lines||[]).filter(l=>l.itemId===item.id)));
        const quantity=lines.reduce((sum,line)=>sum+physicalQuantity(line),0);
        if (measurements.quantity<quantity) throw Error('Er zijn al '+quantity+' stuks gekoppeld aan leveranciersfacturen. Pas eerst die inkoopregels aan voordat je het aantal verlaagt.');
        item.purchaseCostQuantity=quantity;item.purchaseCostTotal=lines.reduce((sum,l)=>sum+l.quantity*l.price,0);
        if (measurements.quantity!==quantity) item.cost=null;
      }
      const removable=new Set([item.designDocumentId,...next.documents.filter(d=>d.id===item.designPreviewId&&d.productDesignPreview&&d.imageRole!=='approved').map(d=>d.id)].filter(Boolean));
      next.documents=next.documents.filter(d=>!removable.has(d.id));
      const metadata={ownerId:o.id,itemId:item.id,category:'other',date:day,createdAt:now};
      next.documents.push({...metadata,id:designDocumentId,name:'Ontwerp_'+o.number+'_'+item.id+'.json',type:designBlob.type,size:designBlob.size,internalDesign:true},
        {...metadata,id:designPreviewId,name:'Ontwerpvoorbeeld_'+o.number+'_'+item.id+'.png',type:'image/png',size:preview.size,imageRole:'reference',productDesignPreview:true});
      if(removable.has(item.primaryImageId))item.primaryImageId=designPreviewId;
      Object.assign(item,{width:measurements.width,height:measurements.height,...(measurements.quantity===null?{}:{quantity:measurements.quantity})},{designId:record.id,designDocumentId,designPreviewId,designUpdatedAt:now});
      next.activities.unshift({id:crypto.randomUUID(),message:'Ontwerp en voorbeeld bewaard bij '+item.description+' · order #'+(o.sourceNumber||o.number),time:now});
      const fs=tx.objectStore('files');for(const id of removable)fs.delete(id);
      fs.put({id:designDocumentId,blob:designBlob});fs.put({id:designPreviewId,blob:preview});ss.put(next,'main');savedItem=structuredClone(item);
    } catch(error) {tx.abort();reject(error);}};
    tx.oncomplete=resolve;
  });
  binding.signature=productDesignSignature(savedItem);binding.width=savedItem.width;binding.height=savedItem.height;binding.quantity=savedItem.quantity;
  const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('spatlappen-crm-changes'):null;
  channel?.postMessage('changed');channel?.close();
  return {record:stored,item:savedItem};
}
