import {fulfilmentMethods,setFulfilmentMethod} from '../../shared/inbound-readiness.js?v=feedback-followup-20261028';
export function fulfilmentMarkup(o,{esc}){
 const label=fulfilmentMethods.find(([id])=>id===o.fulfilmentMethod)?.[1]||'Nog afspreken';
 return `<section class="order-surface"><div class="section-heading"><div><h2>Leverafspraak</h2><p>${esc(label)}</p></div><button type="button" data-action="fulfilment-method" data-id="${esc(o.id)}">Leverwijze kiezen</button></div><p class="form-help">Afhalen, verzenden of bezorgen spreek je afzonderlijk af. Een verzendbedrag bepaalt de leverwijze niet.</p></section>`;
}
export function installFulfilment({getState,openForm,mergeStoredState,render,toast,esc}){
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action="fulfilment-method"]');if(!button)return;
  const o=getState().orders.find(o=>o.id===button.dataset.id);if(!o)return;
  const expected=o.fulfilmentMethod||'';
  openForm('Leverwijze afspreken',`<label>Leverwijze<select name="method">${fulfilmentMethods.map(([id,label])=>`<option value="${id}" ${id===expected?'selected':''}>${esc(label)}</option>`).join('')}</select></label><p class="form-help">Dit bewaart alleen de afspraak. Adressen, prijzen, betaling en voortgang blijven apart.</p>`,async fd=>{
   await mergeStoredState(state=>setFulfilmentMethod(state,o.id,fd.get('method'),expected));toast('Leverwijze opgeslagen');
  },{afterSave:render});
 });
}
