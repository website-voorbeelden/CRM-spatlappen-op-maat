import {invoiceReferenceMatches,invoiceExtraAllocations,validateInvoiceData} from './supplier-invoice-intake.js?v=supplier-batches35-20261101';
import {invoiceCostKind} from './supplier-invoice-recognition.js?v=supplier-batches35-20261101';
import {allocateCents} from './money-allocation.js';
const number=value=>Number(value.replace(',','.'));
export function invoiceLineDimensions(description){
 const text=String(description||''),pair=text.match(/\b(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*mm\b/i),length=text.match(/\blengte\s*:\s*(\d+(?:[.,]\d+)?)\s*mm\b/i),width=text.match(/\bbreedte\s*:\s*(\d+(?:[.,]\d+)?)\s*mm\b/i),thickness=text.match(/\bdikte\s*:\s*(\d+(?:[.,]\d+)?)\s*mm\b/i);
 return {pair:pair?[number(pair[1]),number(pair[2])]:length&&width?[number(length[1]),number(width[1])]:null,thickness:thickness?number(thickness[1]):null};
}
// Link suggestions only. Exact supplier reference, compatible physical quantity
// and one remaining product; duplicate/contradictory choices stay unassigned.
export function proposeInvoiceLineLinks(state,proposal,{excludeId=''}={}){
 const result=structuredClone(proposal),matches=invoiceReferenceMatches(state,result.supplierOrderReferences||[]);
 if(!matches.length||matches.some(m=>m.orders.length!==1||m.orders[0].archived))return result;
 const orders=[...new Map(matches.map(m=>[m.orders[0].id,m.orders[0]])).values()],used=new Map();
 for(const record of state.supplierInvoiceImports||[])if(record.id!==excludeId)for(const line of record.data.lines)if(line.itemId){const key=line.orderId+'/'+line.itemId;used.set(key,(used.get(key)||0)+line.quantity);}
 for(const line of result.lines||[]){
  if(line.kind==='extra'){if(!line.orderId&&orders.length===1)line.orderId=orders[0].id;continue;}
  if(line.orderId&&line.itemId){const key=line.orderId+'/'+line.itemId;used.set(key,(used.get(key)||0)+(line.quantity||0));continue;}
  if(invoiceCostKind(line.description)||!Number.isSafeInteger(line.quantity)||line.quantity<1)continue;
  const shape=invoiceLineDimensions(line.description),candidates=orders.flatMap(order=>order.items.filter(item=>{
   if(!shape.pair)return false;
   if(item.productionSource==='local'||!Number.isSafeInteger(item.quantity)||line.quantity>item.quantity-(used.get(order.id+'/'+item.id)||0))return false;
   if(shape.pair&&!((item.width===shape.pair[0]&&item.height===shape.pair[1])||(item.width===shape.pair[1]&&item.height===shape.pair[0])))return false;
   if(shape.thickness!==null&&item.thickness!==shape.thickness)return false;
   return true;
  }).map(item=>({order,item})));
  if(candidates.length!==1)continue;const {order,item}=candidates[0];Object.assign(line,{kind:'product',orderId:order.id,itemId:item.id});const key=order.id+'/'+item.id;used.set(key,(used.get(key)||0)+line.quantity);
 }
 return result;
}
// A read-only allocation of THIS invoice. It does not add another cost record,
// invent coverage of unbilled items or change the financial owner's rounding.
export function invoiceProductCostPreview(data){
 validateInvoiceData(data);const extras=invoiceExtraAllocations({data}),rows=[];
 for(const orderId of data.orderIds){
  const groups=new Map();for(const line of data.lines)if(line.kind==='product'&&line.orderId===orderId){const row=groups.get(line.itemId)||{orderId,itemId:line.itemId,netCents:0,quantity:0};row.netCents+=line.netCents;row.quantity+=line.quantity;groups.set(line.itemId,row);}
  const extra=extras.get(orderId);if(!groups.size){rows.push({orderId,itemId:'',quantity:null,netCents:0,extraCents:extra,totalCents:extra,unitCents:null});continue;}
  const allocation=extra===null?null:allocateCents(extra,[...groups.values()].map(r=>({id:r.itemId,weight:r.netCents})));
  for(const row of groups.values()){const extraCents=allocation?.get(row.itemId)??null,totalCents=extraCents===null?null:row.netCents+extraCents;rows.push({...row,extraCents,totalCents,unitCents:totalCents===null?null:Math.round(totalCents/row.quantity)});}
 }
 return rows;
}
