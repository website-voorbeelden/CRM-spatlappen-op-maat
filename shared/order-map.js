import {orderExecution,executionStages} from './order-progress.js?v=feedback-followup-20261028';

export const mapPhases=[['preparation','Voorbereiding'],['ordered','Besteld bij leverancier'],['production','In productie'],['transit','Onderweg'],['arrived','Binnen / te leveren'],['shipped','Verzonden'],['delivered','Afgerond']];
export const mapPhaseColors={preparation:'#7185bf',ordered:'#b57b20',production:'#255ce5',transit:'#147d91',arrived:'#167b60',shipped:'#52756c',delivered:'#6d7c8c'};
const phaseKeys=['ordered','production','transit','arrived','shipped','delivered'];
const dated=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value));
export function mapDeliveryAddress(order,customer){
 return order.delivery?.source==='custom'?{recipient:order.delivery.recipient||'',address:order.delivery.address||'',country:order.delivery.country||''}:{recipient:customer?.shippingRecipient||customer?.contact||customer?.company||'',address:customer?.shippingAddress||'',country:customer?.shippingCountry||customer?.country||''};
}
export function mapExecution(order,purchase){
 const own=orderExecution(order),ownRank=executionStages.indexOf(own.stage);
 // A batch can explain supplier progress, never erase a registered customer
 // dispatch/delivery or imply that all items of a mixed order were received.
 let batchRank=-1;
 if(purchase&&(order.items||[]).some(item=>item.productionSource!=='local')){
  if(dated(purchase.arrivedDate)||purchase.status==='Binnen in Nederland')batchRank=3;
  else if(dated(purchase.shippedDate)||purchase.status==='Onderweg')batchRank=2;
  else if(purchase.status==='In productie')batchRank=1;
  else if(dated(purchase.orderedDate)||purchase.status==='Besteld')batchRank=0;
 }
 const rank=Math.max(ownRank,batchRank),key=phaseKeys[rank]||'preparation',fromBatch=batchRank>ownRank;
 return {key,label:mapPhases.find(([id])=>id===key)[1],color:mapPhaseColors[key],fromBatch,
  note:fromBatch?'Voortgang uit gekoppelde levering; controleer of deze order compleet is.':''};
}
export function orderMapEntries(state){
 const customers=new Map(state.customers.map(customer=>[customer.id,customer])),purchases=new Map((state.purchases||[]).map(purchase=>[purchase.id,purchase]));
 return state.orders.filter(order=>!order.archived).map(order=>{const customer=customers.get(order.customerId),purchase=purchases.get(order.purchaseId);return {order,customer,purchase,progress:mapExecution(order,purchase),...mapDeliveryAddress(order,customer)};});
}
export function filterOrderMap(entries,{phase='production',purchaseId='',method='',search=''}={}){
 const query=String(search).trim().toLocaleLowerCase('nl-NL');
 return entries.filter(row=>(!purchaseId||row.order.purchaseId===purchaseId)&&(!method||(row.order.fulfilmentMethod||'')===(method==='unknown'?'':method))&&
  (phase==='all'||phase==='open'&&row.progress.key!=='delivered'||row.progress.key===phase)&&
  (!query||[row.order.number,row.order.sourceNumber,row.customer?.company,row.recipient,row.address,row.country,row.purchase?.name].join(' ').toLocaleLowerCase('nl-NL').includes(query)));
}
export function mapRouteIssue(row){
 if(!row||row.order.archived||['shipped','delivered'].includes(row.progress.key))return 'Al verzonden of afgerond';
 if(row.progress.key==='preparation')return 'Nog niet besteld of in productie';
 if(row.order.fulfilmentMethod==='pickup')return 'Afhalen afgesproken';
 if(!['shipping','delivery'].includes(row.order.fulfilmentMethod))return 'Leverwijze nog afspreken';
 if(!row.address.trim()||!row.country.trim()||!row.recipient.trim())return 'Afleveradres, land of ontvanger aanvullen';
 return '';
}

function directionsUrl(points){
 const params=new URLSearchParams({api:'1',travelmode:'driving',origin:points[0],destination:points.at(-1)});
 if(points.length>2)params.set('waypoints',points.slice(1,-1).join('|'));
 return 'https://www.google.com/maps/dir/?'+params;
}
// Only constructs links; opening one is an explicit browser action. Three
// intermediate stops per link also fits mobile Maps URLs; parts share an end.
export function drivingRouteLinks(start,stops,{roundTrip=true}={}){
 const addressText=value=>String(value||'').replace(/\s*\|\s*|[\r\n]+/g,', ').replace(/\s+/g,' ').trim();
 const origin=addressText(start);if(!origin)throw Error('Vul je vertrekadres in, inclusief plaats en land.');
 if(!Array.isArray(stops)||!stops.length)throw Error('Kies minstens één order als stop.');
 const points=[origin,...stops.map(row=>{const issue=mapRouteIssue(row);if(issue)throw Error('Order #'+(row.order.sourceNumber||row.order.number)+': '+issue+'.');return addressText([row.address.trim(),row.country.trim()].join(', '));}),...(roundTrip?[origin]:[])];
 const links=[];let index=0;
 while(index<points.length-1){
  let end=Math.min(index+4,points.length-1),url=directionsUrl(points.slice(index,end+1));
  while(url.length>2048&&end>index+1){end--;url=directionsUrl(points.slice(index,end+1));}
  if(url.length>2048)throw Error('Een adres is te lang voor een routelink. Kort het vertrekadres of afleveradres in.');
  links.push({url,from:index,to:end});index=end;
 }
 return links;
}
