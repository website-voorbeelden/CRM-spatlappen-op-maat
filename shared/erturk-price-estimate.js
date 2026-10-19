// Read-only comparison of existing supplier costs. Never store its result as a cost.
// Prices use CRM cents per physical piece; dimensions use CRM millimetres.
export function isErturk(value){
 const name=String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return /(^|[^a-z0-9])erturk([^a-z0-9]|$)/.test(name);
}
const positive=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
const euroRecord=record=>!record?.currency||String(record.currency).toUpperCase()==='EUR';
const companyRecord=record=>!record?.companyId||record.companyId==='spatlappen';
const ratio=(a,b)=>Math.max(a/b,b/a);
function productValid(item){return positive(item.width)&&positive(item.height)&&Number.isSafeInteger(item.quantity)&&item.quantity>0&&Number.isInteger(item.printColors)&&item.printColors>=0;}

export function erturkPriceExamples(state,{excludeOrderId='',excludeItemId=''}={}){
 const batches=new Map((state.purchases||[]).filter(companyRecord).map(p=>[p.id,p])),examples=[];
 for(const order of state.orders||[]){
  if(!companyRecord(order))continue;
  const batch=batches.get(order.purchaseId);
  // A linked batch is authoritative: do not fall back to an old supplier name.
  if(order.purchaseId&&!batch||!isErturk(batch?batch.supplier:order.supplier)||!euroRecord(batch))continue;
  for(const item of order.items||[]){
   if(order.id===excludeOrderId&&item.id===excludeItemId||!companyRecord(item)||item.productionSource==='local'||!euroRecord(item)||!productValid(item)||item.costSource==='calculator')continue;
   const linked=(Array.isArray(batch?.invoices)?batch.invoices:[]).flatMap(invoice=>(invoice.lines||[]).filter(line=>line.orderId===order.id&&line.itemId===item.id).map(line=>({invoice,line})));
   let unit,quantity=item.quantity,date=order.date||'',source='Ingevoerde inkoopprijs';
   if(linked.length){
    let cents=0,pieces=0;
    for(const {invoice,line}of linked){
     if(invoice.kind==='offer'||!euroRecord(invoice)||!euroRecord(line)||!Number.isSafeInteger(line.price)||line.price<=0||!Number.isSafeInteger(line.quantity)||line.quantity<1||!['piece','pair',undefined,''].includes(line.unit))continue;
     const count=line.quantity*(line.unit==='pair'?2:1),total=line.quantity*line.price;
     if(!Number.isSafeInteger(count)||!Number.isSafeInteger(total))continue;
     cents+=total;pieces+=count;
     if(invoice.date>date)date=invoice.date;
    }
    // Never use a cached price when linked documents are quotes or zero only.
    if(!pieces||!Number.isSafeInteger(cents)||!Number.isSafeInteger(pieces))continue;
    unit=cents/pieces;quantity=pieces;source='Leveranciersfactuur';
   }else{
    if(item.costSource==='supplierInvoice'||!Number.isSafeInteger(item.cost)||item.cost<=0)continue;
    unit=item.cost;
   }
   if(!positive(unit))continue;
   examples.push({orderId:order.id,itemId:item.id,width:item.width,height:item.height,quantity,printColors:item.printColors,holeFinish:item.holeFinish||'',surfaceFinish:item.surfaceFinish||'',isSample:!!order.isSample,unit,date,source});
  }
 }
 return examples;
}

export function estimateErturkPrice(state,target){
 if(target.productionSource==='local'||!isErturk(target.supplier)||!euroRecord(target))return {available:false,reason:'Automatische indicatie alleen voor producten via Erturk. Koppel een Erturk-inkoopbestelling.'};
 if(!productValid(target))return {available:false,reason:'Vul eerst breedte, hoogte, aantal en drukkleuren in om Erturk-prijzen te vergelijken.'};
 const examples=erturkPriceExamples(state,{excludeOrderId:target.orderId,excludeItemId:target.itemId});
 const matches=examples.filter(row=>row.printColors===target.printColors&&row.isSample===!!target.isSample&&ratio(row.width,target.width)<=1.35&&ratio(row.height,target.height)<=1.35&&ratio(row.quantity,target.quantity)<=2&&['holeFinish','surfaceFinish'].every(key=>!(row[key]&&target[key])||row[key]===target[key]));
 if(!matches.length)return {available:false,reason:'Nog geen vergelijkbare Erturk-inkoop boven € 0 gevonden voor deze maat, dit aantal en deze drukkleuren. Vul je eigen indicatie in of leg later een echte inkoopprijs vast.'};
 const distance=row=>Math.abs(Math.log(row.width/target.width))+Math.abs(Math.log(row.height/target.height))+.35*Math.abs(Math.log(row.quantity/target.quantity));
 const ranked=matches.map(row=>({...row,distance:distance(row)})).sort((a,b)=>a.distance-b.distance||String(b.date).localeCompare(String(a.date)));
 // Exact known dimensions and quantities take precedence over larger datasets.
 const exact=ranked.filter(row=>row.width===target.width&&row.height===target.height&&row.quantity===target.quantity);
 const selected=(exact.length?exact:ranked).slice(0,12).map(row=>({...row,weight:1/(.1+row.distance)}));
 const sorted=[...selected].sort((a,b)=>a.unit-b.unit),half=sorted.reduce((sum,row)=>sum+row.weight,0)/2;
 let cumulative=0,unit=sorted[sorted.length-1].unit;
 for(const row of sorted){cumulative+=row.weight;if(cumulative>=half){unit=row.unit;break;}}
 const unknownExecution=selected.some(row=>['holeFinish','surfaceFinish'].some(key=>!row[key]||!target[key]));
 return {available:true,unit:Math.max(1,Math.round(unit)),low:Math.max(1,Math.round(sorted[0].unit)),high:Math.max(1,Math.round(sorted[sorted.length-1].unit)),count:selected.length,exact:!!exact.length,limited:selected.length<3,unknownExecution,oldest:selected.map(row=>row.date).filter(Boolean).sort()[0]||'',newest:selected.map(row=>row.date).filter(Boolean).sort().at(-1)||''};
}
