import {orderPaymentWait} from '../../shared/order-payment-wait.js?v=payment-wait-20261028';
import {orderMapEntries,filterOrderMap,mapPhases} from '../../shared/order-map.js?v=feedback-followup-20261028';
import {fulfilmentMethods} from '../../shared/inbound-readiness.js?v=feedback-followup-20261028';
import {createMapRoutePlanner} from './map-route.js?v=feedback-followup-20261028';

export function createOrderMapWorkspace(context){
 let method='',search='',paintRevision=0,filtersOpen=false;
 const filters=()=>({phase:context.orderMapFilter,purchaseId:context.orderMapPurchase,method,search});
 const currentEntries=()=>filterOrderMap(orderMapEntries(context.state),filters());
 const planner=createMapRoutePlanner({getEntries:currentEntries,esc:value=>context.esc(value),euro:value=>context.euro(value),totals:order=>context.totals(order),toast:message=>context.toast(message)});
 function rowsFor(entries){return entries.map(row=>{
  const {order:o,customer:c,progress,purchase}=row,t=context.totals(o),amountKnown=t.priceKnown&&o.shippingKnown===true,wait=orderPaymentWait(context.state,o,{today:context.today()});
  return {id:o.id,number:o.sourceNumber||o.number,customer:c?.company||'Onbekende klant',stage:progress.label,phase:progress.key,color:progress.color,
   progressNote:progress.note,purchaseName:purchase?.name||'',method:fulfilmentMethods.find(([key])=>key===(o.fulfilmentMethod||''))?.[1]||'Nog afspreken',
   waitLabel:wait.label,wait:wait.value,
   amount:t.priceKnown?context.euro(t.net)+' excl. btw'+(o.shippingKnown===true?'':' · voorlopig'):'Nog te bepalen',
   balance:!amountKnown?'Nog te bepalen':t.balance<0?context.euro(-t.balance)+' incl. btw te veel ontvangen':context.euro(t.balance)+' incl. btw',
   recipient:row.recipient,address:row.address,country:row.country};
 });}
 function render(){
  const requested=context.route()[1];
  if(requested){context.orderMapPurchase=(context.state.purchases||[]).some(p=>p.id===requested)?requested:'';context.orderMapFilter=context.orderMapPurchase?'all':'production';method='';search='';history.replaceState(null,'','#order-map');}
  if(context.orderMapPurchase&&!(context.state.purchases||[]).some(p=>p.id===context.orderMapPurchase))context.orderMapPurchase='';
  const entries=orderMapEntries(context.state),visible=filterOrderMap(entries,filters()),purchaseIds=new Set(entries.map(row=>row.order.purchaseId)),purchases=(context.state.purchases||[]).filter(p=>!p.archived||p.id===context.orderMapPurchase||purchaseIds.has(p.id)).sort((a,b)=>(b.arrivedDate||b.orderedDate||'').localeCompare(a.arrivedDate||a.orderedDate||'')),p=purchases.find(p=>p.id===context.orderMapPurchase),batchRows=p?entries.filter(row=>row.order.purchaseId===p.id):[];
  const phaseOptions=[['production','In productie'],['ordered','Besteld bij leverancier'],['transit','Onderweg'],['arrived','Binnen / te leveren'],['open','Alle lopende orders'],['all','Alle fases'],['preparation','Voorbereiding'],['shipped','Verzonden'],['delivered','Afgerond']];
  const scope=filterOrderMap(entries,{...filters(),phase:'all'}),counts=new Map(mapPhases.map(([key])=>[key,0]));for(const row of scope)counts.set(row.progress.key,counts.get(row.progress.key)+1);
  const options=phaseOptions.map(([key,label])=>{const count=key==='all'?scope.length:key==='open'?[...counts].filter(([id])=>id!=='delivered').reduce((sum,[,n])=>sum+n,0):counts.get(key)||0;return `<option value="${key}" ${context.orderMapFilter===key?'selected':''}>${context.esc(label)} (${count})</option>`;}).join('');
  const batchFilter=purchases.length||context.company.id==='spatlappen'?`<label>Levering / inkoopbestelling<select id="order-map-purchase"><option value="">Alle leveringen</option>${purchases.map(p=>`<option value="${context.esc(p.id)}" ${context.orderMapPurchase===p.id?'selected':''}>${context.esc(p.name)} · ${context.esc(p.status||'Status onbekend')}${p.archived?' · archief':''}</option>`).join('')}</select></label>`:'';
  context.shell(context.heading('Orderkaart','Productie, binnenkomende leveringen en je eigen bezorgroute.',`<label>Uitvoering<select id="order-map-filter">${options}</select></label>${batchFilter}`).replace('class="top"','class="top map-page-heading"')+
   `<section class="order-surface map-filter-panel"><div class="section-heading"><div><h2>${visible.length} orders in deze selectie</h2><p>${context.orderMapPurchase?'Gefilterd op één levering.':context.orderMapFilter==='production'?'Alleen orders die als in productie geregistreerd staan.':'De gekozen uitvoeringsfase, los van ontwerp en offerte.'} Gearchiveerde dossiers staan buiten de kaart.</p></div><button type="button" data-map-reset>In productie tonen</button></div><details data-map-filters ${filtersOpen||search||method?'open':''}><summary>Zoeken & leverwijze</summary><div class="fields"><label>Klant, order, postcode of plaats<input data-map-search type="search" value="${context.esc(search)}" placeholder="Bijvoorbeeld een plaats of ordernummer"></label><label>Leverwijze<select data-map-method><option value="">Alle leverwijzen</option>${fulfilmentMethods.map(([id,label])=>`<option value="${id||'unknown'}" ${method===(id||'unknown')?'selected':''}>${context.esc(label)}</option>`).join('')}</select></label></div></details></section>`+
   (p?`<section class="order-surface map-batch-summary"><div class="section-heading"><div><h2>${context.esc(p.name)}</h2><p>${context.esc(p.status||'Status onbekend')}${p.arrivedDate?' · binnen op '+context.date(p.arrivedDate):''} · ${batchRows.length} gekoppelde orders, ${visible.length} in dit filter</p></div><a href="#purchases/${context.esc(p.id)}/orders">Levering openen →</a></div><p class="form-help">De kaart toont gekoppelde klantorders. Een levering die binnen is, bewijst niet dat iedere order of ieder product compleet is. Gearchiveerde klantorders staan buiten de kaart.</p></section>`:'')+
   `${!visible.length?'<p class="notice">Geen orders in deze selectie. Kies een andere fase of levering, of toon <button type="button" data-map-open>alle lopende orders</button>.</p>':''}${planner.markup()}<div id="orders-map"></div>`,'order-map',
   {filters:filters(),facts:{orderCount:visible.length},visible:{entity:'order',ids:visible.slice(0,20).map(row=>row.order.id),total:visible.length}});
  planner.mount(document.querySelector('main'));
  const root=document.querySelector('main'),map=context.$('#orders-map');let searchTimer;
  context.renderOrdersMap(map,rowsFor(visible));
  const moreFilters=root.querySelector('[data-map-filters]');moreFilters.ontoggle=()=>{filtersOpen=moreFilters.open;};
  root.querySelector('#order-map-filter').onchange=event=>{context.orderMapFilter=event.target.value;render();};
  const batch=root.querySelector('#order-map-purchase');if(batch)batch.onchange=event=>{context.orderMapPurchase=event.target.value;context.orderMapFilter=event.target.value?'all':'production';render();};
  root.querySelector('[data-map-method]').onchange=event=>{method=event.target.value;render();};
  // Search refreshes this feature while restoring the search input and caret.
  root.querySelector('[data-map-search]').oninput=event=>{
   search=event.target.value;filtersOpen=true;clearTimeout(searchTimer);const revision=++paintRevision;
   searchTimer=setTimeout(()=>{if(revision!==paintRevision||!map.isConnected)return;const active=root.querySelector('[data-map-search]'),position=active.selectionStart;render();const replacement=document.querySelector('[data-map-search]');replacement?.focus();replacement?.setSelectionRange(position,position);},250);
  };
  root.querySelector('[data-map-reset]').onclick=()=>{context.orderMapFilter='production';context.orderMapPurchase='';method='';search='';filtersOpen=false;render();};
  const showOpen=root.querySelector('[data-map-open]');if(showOpen)showOpen.onclick=()=>{context.orderMapFilter='open';context.orderMapPurchase='';method='';search='';filtersOpen=false;render();};
 }
 return {render};
}
