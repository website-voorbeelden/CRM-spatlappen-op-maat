import {deliveryScenario} from '../../shared/batch-economics.js';
import {decimalNumber,decimalText} from '../../shared/decimal-input.js';

// Only a tab-local estimate. Never derive tariffs from customer shipping charges.
export function createRouteCostComparison({getRoute,esc,euro}){
 const fields=[['kilometres','Totale routeafstand (km)'],['hours','Totale rij- en stoptijd (uren)'],['perKm','Vervoerskosten per km (€ excl. btw)'],['perHour','Eigen tijd per uur (€ excl. btw)'],['parcelTotal','Losse verzending samen (€ excl. btw)']];
 const draft={values:Object.fromEntries(fields.map(([key])=>[key,''])),basis:null,open:false};
 let root;
 function markup(){return `<details data-map-route-costs ${draft.open?'open':''}><summary>Zelf bezorgen of verzenden vergelijken</summary><p class="form-help">Voor de gekozen stops in dit filter. Vul de totale afstand en tijd zelf in, inclusief terugrit als je daarvoor kiest. Gebruik voor alle kosten dezelfde basis: excl. btw. Het verzendbedrag is je eigen pakketkostenschatting, niet wat de klant betaalt.</p><div class="fields">${fields.map(([key,label])=>`<label>${label}<input data-map-cost="${key}" inputmode="decimal" autocomplete="off" maxlength="16" value="${esc(draft.values[key])}" placeholder="Eigen aanname"></label>`).join('')}</div><p class="form-help" data-map-cost-scope></p><p data-map-cost-result role="status"></p><button type="button" data-map-cost-confirm hidden>Aannames voor deze route gebruiken</button><p class="form-help">Alleen een schatting met je eigen tarieven en tijdwaardering. Ontbrekende toeslagen worden niet geraamd. De invoer blijft in dit tabblad; er wordt niets in orders of kosten opgeslagen.</p></details>`;}
 function refresh(){
  if(!root?.isConnected)return;
  const route=getRoute(),output=root.querySelector('[data-map-cost-result]'),confirm=root.querySelector('[data-map-cost-confirm]');
  root.querySelector('[data-map-cost-scope]').textContent=`Vergelijking voor ${route.rows.length} gekozen order(s) in de huidige stopvolgorde${route.roundTrip?', inclusief terugrit':', zonder terugrit'}. Meerdere orders op hetzelfde adres kunnen één afleverstop zijn.`;
  confirm.hidden=true;
  if(route.issue){output.textContent=route.issue;return;}
  const hasInput=Object.values(draft.values).some(value=>value.trim());
  if(hasInput&&draft.basis!==route.signature){
   output.textContent='De route is gewijzigd. Je invoer is behouden. Controleer afstand, tijd en totale pakketkosten voor deze stops en bevestig je aannames opnieuw.';
   confirm.hidden=false;return;
  }
  const input={};
  for(const [key]of fields){
   const raw=draft.values[key].trim(),value=decimalNumber(raw);
   if(!raw){output.textContent='Vul alle vijf aannames in om te vergelijken. Onbekend blijft onbekend; expliciet 0 is toegestaan.';return;}
   if(!Number.isFinite(value)||value<0){output.textContent='Gebruik niet-negatieve getallen met maximaal twee decimalen, met komma of punt en zonder duizendtallen.';return;}
   input[key]=['perKm','perHour','parcelTotal'].includes(key)?Math.round(value*100):value;
  }
  try{
   const result=deliveryScenario(input),difference=result.difference;
   output.textContent=`Schatting excl. btw: zelf bezorgen ${euro(result.self)}, losse verzending ${euro(result.parcel)}. `+(difference===0?'Beide kosten zijn in deze schatting gelijk.':`${euro(Math.abs(difference))} goedkoper met ${difference>0?'zelf bezorgen':'losse verzending'}.`);
  }catch(error){output.textContent=error.message;}
 }
 function mount(container){
  root=container.querySelector('[data-map-route-costs]');if(!root)return;
  root.ontoggle=()=>{draft.open=root.open;};
  root.oninput=event=>{
   const field=event.target.closest('[data-map-cost]');if(!field)return;
   draft.values[field.dataset.mapCost]=field.value;
   const route=getRoute();
   if(!Object.values(draft.values).some(value=>value.trim()))draft.basis=null;
   else if(draft.basis===null&&!route.issue)draft.basis=route.signature;
   refresh();
  };
  root.addEventListener('focusout',event=>{
   const field=event.target.closest('[data-map-cost]');if(!field)return;
   if(field.value.trim()&&Number.isFinite(decimalNumber(field.value))){field.value=decimalText(field.value);draft.values[field.dataset.mapCost]=field.value;}
  });
  root.querySelector('[data-map-cost-confirm]').onclick=()=>{
   const route=getRoute();if(!route.issue)draft.basis=route.signature;refresh();
  };
  refresh();
 }
 function setEstimate(kilometres,hours){
  const route=getRoute();if(route.issue)throw Error(route.issue);
  if(!Number.isFinite(kilometres)||!Number.isFinite(hours)||kilometres<0||hours<0)throw Error('Google Maps gaf geen bruikbare raming.');
  if((draft.values.kilometres.trim()||draft.values.hours.trim())&&!window.confirm('Je eigen afstand en tijd vervangen door de Google Maps-raming inclusief de ingevoerde aflevertijd? De tarieven blijven behouden.'))return false;
  draft.values.kilometres=kilometres.toFixed(2).replace('.',',');draft.values.hours=hours.toFixed(2).replace('.',',');draft.basis=route.signature;draft.open=true;
  if(root?.isConnected){root.open=true;for(const key of ['kilometres','hours'])root.querySelector('[data-map-cost="'+key+'"]').value=draft.values[key];refresh();}return true;
 }
 return {markup,mount,refresh,setEstimate};
}
