import {temporaryPrice} from '../../shared/temporary-price.js';
import {estimateErturkPrice} from '../../shared/erturk-price-estimate.js';
const money=cents=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(cents/100);

export function temporaryPricingMarkup(item){
 if(item.price!=null)return '';
 // No name/id fields: temporary input must never enter FormData or CRM state.
 return `<details class="form-details" data-temporary-price><summary>Verkoopprijs bepalen · tijdelijke prijshulp</summary><p class="form-help">Alleen om nu een verkoopprijs te kiezen. Deze indicatie wordt niet als kostprijs of in het dossier bewaard.</p><div data-price-history><p data-price-history-status role="status">Vergelijkbare Erturk-inkoopprijzen zoeken…</p><button type="button" data-price-history-use disabled>Indicatie gebruiken</button></div><div class="fields"><label>Inkoopindicatie per stuk (€)<input type="text" inputmode="decimal" data-price-estimate autocomplete="off" placeholder="Zelf invullen of indicatie gebruiken"></label><label>Opslag bovenop indicatie (%)<input type="text" inputmode="decimal" data-price-markup autocomplete="off" placeholder="Zelf kiezen"></label></div><p class="form-help">Bedragen excl. btw, per fysieke spatlap. Transport, invoer en andere batchkosten zitten niet in de historische productprijs. Voeg die zelf toe als je ze in je prijs wilt meenemen.</p><p data-price-result role="status">Vul de indicatie en je gewenste opslag in.</p><button type="button" data-price-use disabled>Voorstel als verkoopprijs invullen</button><p class="form-help">Alleen de gekozen verkoopprijs gaat naar het gewone prijsveld. De order bewaar je daarna zelf.</p></details>`;
}

export function installTemporaryPricing(form,{getState=()=>({orders:[],purchases:[]}),getTarget=()=>({})}={}){
 if(form.dataset.temporaryPricingInstalled)return;
 form.dataset.temporaryPricingInstalled='true';
 const sessions=new WeakMap();
 function clear(panel){
  for(const input of panel.querySelectorAll('input'))input.value='';
  panel.querySelector('[data-price-result]').textContent='';
  panel.querySelector('[data-price-history-status]').textContent='';
  panel.querySelector('[data-price-history-use]').disabled=true;
  panel.querySelector('[data-price-use]').disabled=true;
  sessions.delete(panel);panel.open=false;panel.hidden=true;
 }
 function active(panel){
  const price=panel.closest('.item')?.querySelector('[name=price]');
  if(!price)return false;
  if(price.value.trim()!==''||form.querySelector('[name=packagePrice]')?.value.trim()){clear(panel);return false;}
  return panel.open&&!panel.hidden;
 }
 function history(panel){
  const target=getTarget(panel.closest('.item')),signature=JSON.stringify(target),previous=sessions.get(panel);
  const result=estimateErturkPrice(getState(),target),basis=JSON.stringify(result);
  // Changed product, supplier or source prices invalidate a chosen automatic estimate.
  const sameBasis=previous?.signature===signature&&previous?.basis===basis;
  if(previous?.automatic&&!sameBasis)panel.querySelector('[data-price-estimate]').value='';
  const session={signature,basis,automatic:!!previous?.automatic&&sameBasis,result};sessions.set(panel,session);
  const status=panel.querySelector('[data-price-history-status]');
  if(!result.available)status.textContent=result.reason;
  else{
   const notes=[result.exact?'Gelijke maat en hetzelfde aantal.':'Vergelijkbare maat en aantallen; geen exact tarief.',result.limited?'Weinig voorbeelden: voorlopige indicatie.':'',result.unknownExecution?'Gaten of oppervlak zijn niet bij alle voorbeelden bekend.':'',result.oldest?`Brondata: ${result.oldest}${result.newest!==result.oldest?' t/m '+result.newest:''}.`:''];
   status.textContent=`Erturk-indicatie: ${money(result.unit)} per stuk. ${result.count} productvoorbeeld${result.count===1?'':'en'} · gevonden prijzen ${money(result.low)}–${money(result.high)}. ${notes.filter(Boolean).join(' ')}`;
  }
  panel.querySelector('[data-price-history-use]').disabled=!result.available;
  return session;
 }
 function calculate(panel){
  if(!active(panel))return null;
  history(panel);
  try{
   const result=temporaryPrice({estimate:panel.querySelector('[data-price-estimate]').value,markup:panel.querySelector('[data-price-markup]').value,quantity:panel.closest('.item').querySelector('[name=quantity]').value});
   panel.querySelector('[data-price-result]').textContent=`Voorstel: ${money(result.unit)} per stuk · ${money(result.total)} totaal excl. btw. Dit is een prijsvoorstel, geen vastgelegde kostprijs of marge.`;
   panel.querySelector('[data-price-use]').disabled=false;return result;
  }catch(error){panel.querySelector('[data-price-result]').textContent=error.message;panel.querySelector('[data-price-use]').disabled=true;return null;}
 }
 function changed(event){
  if(event.target.matches('[data-price-estimate]')){const session=sessions.get(event.target.closest('[data-temporary-price]'));if(session)session.automatic=false;}
  if(event.target.matches('[name=packagePrice],[name=purchaseId],[name=newPurchaseSupplier],[name=isSample]')){for(const panel of form.querySelectorAll('[data-temporary-price]'))calculate(panel);return;}
  const panel=event.target.closest('.item')?.querySelector('[data-temporary-price]');if(panel)calculate(panel);
 }
 form.addEventListener('input',changed);form.addEventListener('change',changed);
 form.addEventListener('toggle',event=>{if(event.target.matches('[data-temporary-price]')&&event.target.open)calculate(event.target);},true);
 form.addEventListener('click',event=>{
  const historical=event.target.closest('[data-price-history-use]');
  if(historical){
   const panel=historical.closest('[data-temporary-price]');if(!active(panel))return;
   const session=history(panel);if(!session.result.available)return;
   panel.querySelector('[data-price-estimate]').value=(session.result.unit/100).toFixed(2);session.automatic=true;
   calculate(panel);panel.querySelector('[data-price-markup]').focus();return;
  }
  const action=event.target.closest('[data-price-use]');if(!action)return;
  const panel=action.closest('[data-temporary-price]'),result=calculate(panel);if(!result)return;
  const input=panel.closest('.item').querySelector('[name=price]');input.value=(result.unit/100).toFixed(2);clear(panel);
  input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));input.focus();
 });
}
