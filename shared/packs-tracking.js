import {packsId,validatePacksPlanning,packsLogisticsDay,packsDay} from './packs-preparation.js?v=packs-worker-v3-20261102';
const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const integer=v=>Number.isSafeInteger(v)&&v>0;
const line=(v,max=500)=>typeof v==='string'&&v.length<=max&&!/[\x00-\x1f\x7f]/.test(v);
const fail=()=>{throw Error('De PACKS-tracking past niet bij deze geboekte zending. Bestaande gegevens blijven behouden.');};
const optional=v=>v===null||v===undefined?'':line(v)?v:fail();
export function packsTrackingUrl(value){
 if(!value)return '';
 if(typeof value!=='string'||value.length>2000)fail();
 let url;try{url=new URL(value);}catch{fail();}
 if(url.protocol!=='https:'||url.username||url.password||url.port||!(url.hostname==='packs.nl'||url.hostname.endsWith('.packs.nl')))fail();
 return url.href;
}
function day(value){if(value===null||value===undefined||value==='')return '';if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(value)||!packsDay(value.slice(0,10))||!Number.isFinite(Date.parse(value)))fail();return /(?:Z|[+-]\d{2}:\d{2})$/.test(value)?packsLogisticsDay(new Date(value)):value.slice(0,10);}
function details(value){if(!Array.isArray(value)||value.length>100)fail();return value.map(v=>{if(!object(v)||!Number.isSafeInteger(v.statusId))fail();return {at:optional(v.statusDateTime),statusId:v.statusId,text:optional(v.statusText)};});}
export function packsTrackingObservation(shipment,changes,{attempt,environment,now=new Date().toISOString()}){
 if(!attempt||attempt.status!=='booked'||!packsId(attempt.attemptId)||!integer(attempt.shipmentId)||!['test','live'].includes(environment)||shipment?.shipmentId!==attempt.shipmentId||changes?.shipmentId!==attempt.shipmentId)fail();
 if(!Array.isArray(shipment.items)||shipment.items.length!==attempt.items.length||shipment.items.some((v,n)=>v.shipmentItemId!==attempt.items[n].shipmentItemId||v.barcode!==attempt.items[n].barcode)||!Array.isArray(changes.updates)||changes.updates.length>100)fail();
 const updates=changes.updates.map(v=>{if(!object(v)||v.traceId!==null&&!integer(v.traceId)||v.shipmentStatus!==null&&!object(v.shipmentStatus))fail();const s=v.shipmentStatus;return {traceId:v.traceId,deliveredDate:day(v.deliveredDate),statusText:optional(s?.text),extraInfo:optional(s?.extraInfo),statusAt:optional(s?.shipmentStatusDateTime),details:details(v.statusDetails)};});
 const result={schemaVersion:1,environment,attemptId:attempt.attemptId,shipmentId:attempt.shipmentId,checkedAt:now,bookingStatus:optional(shipment.bookingStatus),logisticsStatus:optional(shipment.logisticsStatus),url:packsTrackingUrl(shipment.trackAndTraceUrl),planning:validatePacksPlanning({loadDate:day(shipment.loadDate),deliveryDate:day(shipment.deliveryDate)}),items:attempt.items.map(v=>({shipmentItemId:v.shipmentItemId,barcode:v.barcode})),updates};
 validatePacksTracking(result);return result;
}
export function validatePacksTracking(value){
 const keys=['schemaVersion','environment','attemptId','shipmentId','checkedAt','bookingStatus','logisticsStatus','url','planning','items','updates'];
 if(!object(value)||Object.keys(value).length!==keys.length||Object.keys(value).some(k=>!keys.includes(k))||value.schemaVersion!==1||!['test','live'].includes(value.environment)||!packsId(value.attemptId)||!integer(value.shipmentId)||!line(value.checkedAt,40)||!Number.isFinite(Date.parse(value.checkedAt))||!line(value.bookingStatus)||!line(value.logisticsStatus)||packsTrackingUrl(value.url)!==value.url||!Array.isArray(value.items)||!value.items.length||value.items.length>20||new Set(value.items.map(v=>v.shipmentItemId)).size!==value.items.length||value.items.some(v=>!object(v)||Object.keys(v).length!==2||!integer(v.shipmentItemId)||!line(v.barcode,200)||!v.barcode)||!Array.isArray(value.updates)||value.updates.length>100)fail();
 validatePacksPlanning(value.planning);
 for(const v of value.updates){if(!object(v)||Object.keys(v).some(k=>!['traceId','deliveredDate','statusText','extraInfo','statusAt','details'].includes(k))||v.traceId!==null&&!integer(v.traceId)||!line(v.deliveredDate,10)||v.deliveredDate&&!packsDay(v.deliveredDate)||!line(v.statusText)||!line(v.extraInfo)||!line(v.statusAt,40)||!Array.isArray(v.details)||v.details.length>100||v.details.some(d=>!object(d)||Object.keys(d).some(k=>!['at','statusId','text'].includes(k))||!line(d.at,40)||!Number.isSafeInteger(d.statusId)||!line(d.text)))fail();}
}
export function validatePacksTrackingState(state){
 for(const order of state.orders){if(order.packsTracking===undefined)continue;validatePacksTracking(order.packsTracking);const t=order.packsTracking,bundle=state.documents.find(d=>d.ownerId===order.id&&d.packsLabelBundle?.attemptId===t.attemptId&&d.packsLabelBundle.shipmentId===t.shipmentId&&d.packsLabelBundle.environment===t.environment);if(!bundle||t.items.length!==bundle.packsLabelBundle.originalIds.length)fail();for(const item of t.items)if(!bundle.packsLabelBundle.originalIds.some(id=>{const original=state.documents.find(d=>d.id===id);return original?.packsLabelSource?.shipmentItemId===item.shipmentItemId&&original.packsLabelSource.barcode===item.barcode;}))fail();}
}
export function recordPacksTracking(state,orderId,value,{expectedLabelId,expectedCheckedAt='',companyId}){
 if(companyId!=='maatwerkkunststof')fail();validatePacksTracking(value);const order=state.orders.find(o=>o.id===orderId);
 if(!order||order.supplierFulfilment?.labelDocumentId!==expectedLabelId||(order.packsTracking?.checkedAt||'')!==expectedCheckedAt)throw Error('De order, het label of de tracking is gewijzigd. Haal de actuele tracking opnieuw op.');
 order.packsTracking=structuredClone(value);validatePacksTrackingState(state);
 // Observation only. Never set order.deliveredDate, carrier, costs or phases.
 return order;
}
