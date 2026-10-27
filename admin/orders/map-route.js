import {createGoogleRouteUI} from './route-google.js?v=crm-code-review-20261027';
import {mapRouteIssue,drivingRouteLinks} from '../../shared/order-map.js?v=ui-batch234-20261027';
import {createRouteCostComparison} from './route-costs.js?v=open-fixes-20261027';

// A tab-local route draft, never an order update or a dispatch registration.
export function createMapRoutePlanner({getEntries,esc,euro,totals,toast}){
 const draft={ids:[],start:'',roundTrip:true,open:false};
 let preparedSignature='';
 const selected=()=>{const entries=new Map(getEntries().map(row=>[row.order.id,row]));return draft.ids.map(id=>entries.get(id)).filter(Boolean);};
 const signature=()=>JSON.stringify([draft.start,draft.roundTrip,draft.ids,selected().map(row=>[row.order.id,row.order.archived,row.progress,row.order.fulfilmentMethod,row.recipient,row.address,row.country,totals(row.order)])]);
 const costs=createRouteCostComparison({esc,euro,getRoute:()=>{
  const rows=selected();
  return {rows,signature:signature(),roundTrip:draft.roundTrip,issue:!rows.length?'Kies eerst geschikte orders voor je route.':rows.some(row=>mapRouteIssue(row))?'Herstel eerst de levergegevens of verwijder ongeschikte orders uit de route.':!draft.start.trim()?'Vul eerst het vertrekadres in.':''};
 }});
 let repaint=()=>{};
 const getRoute=()=>{const rows=selected();return {rows,start:draft.start,roundTrip:draft.roundTrip,signature:signature(),issue:!rows.length?'Kies eerst geschikte orders voor je route.':rows.some(row=>mapRouteIssue(row))?'Herstel eerst de levergegevens of je selectie.':!draft.start.trim()?'Vul eerst het vertrekadres in.':''};};
 const google=createGoogleRouteUI({getRoute,esc,toast,useEstimate:(km,hours)=>costs.setEstimate(km,hours),applyOrder:ids=>{const current=selected().map(row=>row.order.id);if(ids.length!==current.length||new Set(ids).size!==ids.length||ids.some(id=>!current.includes(id)))throw Error('De stopselectie is gewijzigd. Bereken opnieuw.');draft.ids=[...ids,...draft.ids.filter(id=>!current.includes(id))];repaint();}});
 const number=row=>row.order.sourceNumber||row.order.number;
 function markup(){return `<details class="order-surface map-route-planner" data-map-route ${draft.open?'open':''}><summary>Eigen bezorgroute plannen</summary><p class="form-help">Kies orders uit de huidige kaartselectie. Dit is alleen een routeschets: leverafspraken, kosten, betalingen en orderstatus veranderen niet.</p><div class="fields"><label>Vertrekadres · straat, huisnummer, plaats en land<input data-map-route-start value="${esc(draft.start)}" autocomplete="off" maxlength="500" placeholder="Vul je eigen vertrekadres in"></label><label class="check-row"><input type="checkbox" data-map-route-return ${draft.roundTrip?'checked':''}>Terug naar het vertrekadres</label></div><div class="actions"><button type="button" data-map-route-all>Geschikte orders kiezen</button><button type="button" data-map-route-clear>Selectie leegmaken</button></div><div data-map-route-choices></div><div data-map-route-stops></div><div data-map-route-links aria-live="polite"></div><p class="form-help">De routeschets blijft alleen in dit tabblad bewaard. Bij een routelink of een bewuste Google Maps-berekening gaan de gekozen adressen naar Google Maps. Controleer daar de precieze afleverpunten en rijtijden.</p></details>`;}
 function mount(container){
  const root=container.querySelector('[data-map-route]');if(!root)return;
  root.insertAdjacentHTML('beforeend',google.markup()+costs.markup());
  costs.mount(root);google.mount(root);
  const choices=root.querySelector('[data-map-route-choices]'),stops=root.querySelector('[data-map-route-stops]'),output=root.querySelector('[data-map-route-links]');
  root.ontoggle=()=>{draft.open=root.open;};
  function refreshLinks(){
   preparedSignature='';
   const rows=selected(),hidden=draft.ids.length-rows.length,blocked=rows.filter(row=>mapRouteIssue(row));
   const notes=[];
   if(hidden)notes.push(hidden+' gekozen order(s) buiten deze filters doen niet mee.');
   if(blocked.length)notes.push('Een gekozen order is niet meer geschikt. Pas je selectie of de leverafspraak aan.');
   if(rows.some(row=>row.progress.key!=='arrived'))notes.push('Niet alle stops staan als binnen geregistreerd; stem ontvangst en compleetheid af vóór vertrek.');
   if(rows.some(row=>row.progress.fromBatch))notes.push('De voortgang komt bij sommige orders uit de gekoppelde levering. Controleer of ook lokale producten en alle bestelde aantallen compleet zijn.');
   if(rows.some(row=>row.order.fulfilmentMethod==='shipping'))notes.push('Bij sommige stops is verzenden afgesproken. Stem zelf bezorgen eerst met de klant af.');
   if(rows.some(row=>{const total=totals(row.order);return !total.priceKnown||row.order.shippingKnown!==true||total.balance>0;}))notes.push('Controleer de prijs- en betaalafspraken vóór levering.');
   let links='';
   try{
    const parts=drivingRouteLinks(draft.start,rows,{roundTrip:draft.roundTrip});
    preparedSignature=signature();
    links=`<div class="actions">${parts.map((part,index)=>`<a class="map-order-open" data-map-route-link href="${esc(part.url)}" target="_blank" rel="noopener noreferrer">${parts.length===1?'Route openen in Google Maps':'Routedeel '+(index+1)+' van '+parts.length+' openen'}</a>`).join('')}</div>${parts.length>1?'<p class="form-help">Open de delen na elkaar. Elk volgend deel begint waar het vorige eindigt; alle gekozen stops blijven meegenomen.</p>':''}`;
   }catch(error){links='<p class="form-help">'+esc(error.message)+'</p>';}
   output.innerHTML=(notes.length?'<ul class="map-route-notes">'+notes.map(note=>'<li>'+esc(note)+'</li>').join('')+'</ul>':'')+links;
   costs.refresh();google.refresh();
  }
  function paint(){
   const entries=getEntries();
   choices.innerHTML=`<h3>Stops kiezen (${entries.length} orders in dit filter)</h3>`+entries.map(row=>{
    const issue=mapRouteIssue(row),needsMethod=issue==='Leverwijze nog afspreken',needsAddress=issue==='Afleveradres, land of ontvanger aanvullen';
    return `<div class="map-route-choice"><label class="check-row"><input type="checkbox" data-map-route-id="${esc(row.order.id)}" ${draft.ids.includes(row.order.id)?'checked':''} ${issue?'disabled':''}><span><strong>#${esc(number(row))} · ${esc(row.customer?.company||'Klant')}</strong><small>${esc(issue||[row.address,row.country].filter(Boolean).join(', '))}</small></span></label>${needsMethod?`<button type="button" data-action="fulfilment-method" data-id="${esc(row.order.id)}">Leverwijze afspreken</button>`:needsAddress?`<a href="#orders/${esc(row.order.id)}/delivery">Afleveradres invullen →</a>`:''}</div>`;
   }).join('')+(entries.length?'':'<p class="muted">Geen orders in dit filter. Kies een levering of pas de fase aan.</p>');
   const rows=selected();
   stops.innerHTML=rows.length?`<h3>Stopvolgorde · ${rows.length} orders</h3><ol class="map-route-stops">${rows.map((row,index)=>`<li><div><strong>#${esc(number(row))} · ${esc(row.customer?.company||'Klant')}</strong><small>${esc(row.address)} · ${esc(row.country)}</small><small>${esc(row.progress.label)}${row.progress.fromBatch?' · uit gekoppelde levering':''}</small></div><div class="actions"><button type="button" data-map-route-move="up" data-map-route-order="${esc(row.order.id)}" aria-label="Order ${esc(number(row))} eerder bezorgen" ${index===0?'disabled':''}>↑</button><button type="button" data-map-route-move="down" data-map-route-order="${esc(row.order.id)}" aria-label="Order ${esc(number(row))} later bezorgen" ${index===rows.length-1?'disabled':''}>↓</button><button type="button" data-map-route-remove="${esc(row.order.id)}" aria-label="Order ${esc(number(row))} uit route halen">×</button></div></li>`).join('')}</ol>`:'';
   refreshLinks();
  }
  repaint=paint;
  root.querySelector('[data-map-route-start]').oninput=event=>{draft.start=event.target.value;refreshLinks();};
  root.querySelector('[data-map-route-return]').onchange=event=>{draft.roundTrip=event.target.checked;refreshLinks();};
  root.onchange=event=>{const input=event.target.closest('[data-map-route-id]');if(!input)return;const id=input.dataset.mapRouteId;if(input.checked){const row=getEntries().find(row=>row.order.id===id);if(!row||mapRouteIssue(row)){toast('Deze order is gewijzigd. Controleer de selectie opnieuw.');paint();return;}if(!draft.ids.includes(id))draft.ids.push(id);}else draft.ids=draft.ids.filter(value=>value!==id);paint();root.querySelector('[data-map-route-id="'+CSS.escape(id)+'"]')?.focus();};
  root.onclick=event=>{
   if(event.target.closest('[data-map-route-link]')){if(preparedSignature!==signature()){event.preventDefault();paint();toast('Levergegevens of betalingen zijn gewijzigd. Controleer je route en open hem opnieuw.');}return;}
   if(event.target.closest('[data-map-route-all]')){for(const row of getEntries())if(!mapRouteIssue(row)&&!draft.ids.includes(row.order.id))draft.ids.push(row.order.id);paint();return;}
   if(event.target.closest('[data-map-route-clear]')){draft.ids=[];paint();return;}
   const remove=event.target.closest('[data-map-route-remove]');if(remove){draft.ids=draft.ids.filter(id=>id!==remove.dataset.mapRouteRemove);paint();return;}
   const move=event.target.closest('[data-map-route-move]');if(!move)return;
   const rows=selected(),index=rows.findIndex(row=>row.order.id===move.dataset.mapRouteOrder),target=index+(move.dataset.mapRouteMove==='up'?-1:1);if(index<0||target<0||target>=rows.length)return;
   const first=draft.ids.indexOf(rows[index].order.id),second=draft.ids.indexOf(rows[target].order.id);[draft.ids[first],draft.ids[second]]=[draft.ids[second],draft.ids[first]];paint();
   root.querySelector(`[data-map-route-move="${move.dataset.mapRouteMove}"][data-map-route-order="${CSS.escape(move.dataset.mapRouteOrder)}"]`)?.focus();
  };
  paint();
 }
 return {markup,mount};
}
