export function financialGroups(state,orders,{dimension='month',metric='revenue',totals,economics}){
 if(!['month','customer','purchase','country'].includes(dimension)||!['count','revenue','margin'].includes(metric))throw Error('Kies een ondersteunde grafiek en eenheid.');
 const groups=new Map();for(const o of orders){const c=state.customers.find(c=>c.id===o.customerId),p=(state.purchases||[]).find(p=>p.id===o.purchaseId),key=dimension==='month'?(o.date||'').slice(0,7):dimension==='customer'?o.customerId:dimension==='purchase'?o.purchaseId||'':c?.country||'';
  const label=dimension==='month'?key||'Datum onbekend':dimension==='customer'?c?.company||'Klant onbekend':dimension==='purchase'?p?.name||'Geen batch':key||'Land onbekend';
  const row=groups.get(key)||{key,label,value:0,known:true,orderIds:[]},t=totals(o),e=metric==='margin'?economics(o):null;
  row.orderIds.push(o.id);row.value+=metric==='count'?1:metric==='revenue'?t.net:e.profit;
  if(metric!=='count')row.known&&=t.priceKnown&&o.shippingKnown===true&&(metric!=='margin'||!e.provisional);
  groups.set(key,row);
 }
 return [...groups.values()].sort((a,b)=>dimension==='month'?a.key.localeCompare(b.key):b.value-a.value||a.label.localeCompare(b.label,'nl'));
}
