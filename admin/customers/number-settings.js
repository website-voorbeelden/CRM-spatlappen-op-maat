import {changeCustomerNumber,setCustomerNumberPreferences} from '../../shared/customer-number-settings.js?v=feedback29-batch2-followup';
export function installCustomerNumberSettings({getState,openForm,mergeStoredState,render,toast,esc}){
 document.addEventListener('click',event=>{const button=event.target.closest('[data-customer-number],[data-customer-number-settings]');if(!button)return;
 const state=getState(),id=button.dataset.customerNumber;
 if(id){const c=state.customers.find(c=>c.id===id);if(!c)return;const expected=c.number||'';
  openForm('Klantnummer aanpassen',`<p>${esc(c.company)}. Interne dossierkoppelingen en historische documenten blijven behouden.</p><label>Klantnummer<input name="number" required maxlength="40" value="${esc(expected)}"></label>`,async fd=>{await mergeStoredState(next=>changeCustomerNumber(next,id,fd.get('number'),expected));toast('Klantnummer opgeslagen');},{afterSave:render});
 }else {const expected=JSON.stringify([state.customerNumberStart??1,state.customerNumberPadding??0]);
  openForm('Nummering nieuwe klanten',`<label>Startnummer<input name="start" type="number" required min="1" max="999999999" step="1" value="${state.customerNumberStart??1}"></label><label>Minimaal aantal cijfers (0 = geen voorloopnullen)<input name="padding" type="number" required min="0" max="8" step="1" value="${state.customerNumberPadding??0}"></label><p class="form-help">Nieuwe nummers krijgen KL- als voorvoegsel. De teller gaat nooit terug voorbij eerder gebruikte nummers. Bestaande klanten en documenten worden niet hernummerd.</p>`,async fd=>{await mergeStoredState(next=>setCustomerNumberPreferences(next,{start:Number(fd.get('start')),padding:Number(fd.get('padding'))},expected));toast('Nummering opgeslagen');},{afterSave:render});
 }
 });
}
