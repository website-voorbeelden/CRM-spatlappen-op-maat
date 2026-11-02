// DOM-scoped callbacks only; no constructor access to company/runtime/state.
const workspaceSettlers=new WeakMap();
export const registerSupplierWorkspace=(root,settle)=>workspaceSettlers.set(root,settle);
export async function settleSupplierWorkspace(button){const settle=workspaceSettlers.get(button.closest('.supplier-order-workspace'));if(settle)await settle();}
import {supplierFulfilmentSignature} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {recordSupplierReference} from '../../shared/supplier-order-review.js?v=packs-worker-v3-20261102';
import {installFormGuidance,markFormClean,validateForm} from '../form-guidance.js?v=crm-code-review-20261027';
import {guideSupplierInput} from './supplier-workspace-status.js?v=packs-workflow-20261102';

// No timer/keystroke writes. One completed field edit is one guarded save.
export function installSupplierReference(context,root,order,{onSaved=()=>{}}={}){
 const form=root.querySelector('[data-supplier-reference-form]'),input=form.elements.supplierReference,status=form.querySelector('[data-supplier-reference-status]'),revert=form.querySelector('[data-supplier-reference-revert]');let expected=supplierFulfilmentSignature(context.state,order),pending=null;
 installFormGuidance(form);
 async function save(){
  if(pending)return pending;if(!form.isConnected)throw Error('Open de actuele Kunststofbaas-tab.');
  const value=input.value.trim();if(value===(context.order(order.id)?.supplierOrderReference||'')){markFormClean(form);revert.hidden=true;status.textContent=value?'Bestelnummer bewaard.':'Vul het nummer van Kunststofbaas in.';return;}
  if(!validateForm(form,{toast:context.toast})){status.textContent='Nog niet bewaard · controleer het bestelnummer.';throw Error('Controleer eerst het Kunststofbaas-bestelnummer.');}
  input.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Bestelnummer bewaren…';
  pending=(async()=>{let beforeOrder;const activityId=context.uid();
   try{
    try{await context.mergeStoredState(next=>{const current=next.orders.find(o=>o.id===order.id);beforeOrder=current?structuredClone(current):null;const result=recordSupplierReference(next,order.id,value,expected,context.company.id,{placed:true});if(!result.alreadySaved)next.activities.unshift({id:activityId,message:'Kunststofbaas-bestelnummer bij order bijgewerkt',time:new Date().toISOString()});});}
    catch(error){if(!context.state.activities.some(a=>a.id===activityId)||context.order(order.id)?.supplierOrderReference!==value)throw error;}
    const current=context.order(order.id);expected=supplierFulfilmentSignature(context.state,current);
    if(!form.isConnected)return;input.value=value;markFormClean(form);revert.hidden=true;form.querySelector('[data-form-error]')?.replaceChildren();status.textContent='Bewaard.';
    try{await onSaved(beforeOrder);}catch{status.textContent='Bestelnummer bewaard. Open deze tab opnieuw om de overige weergave bij te werken; bestaande invoer is behouden.';}
   }catch(error){if(form.isConnected){status.textContent='Niet bewaard · '+error.message;}throw error;}
   finally{input.disabled=false;form.removeAttribute('aria-busy');pending=null;}
  })();return pending;
 }
 revert.onclick=()=>{if(pending)return;input.value=context.order(order.id)?.supplierOrderReference||'';input.dispatchEvent(new Event('input',{bubbles:true}));markFormClean(form);revert.hidden=true;form.querySelector('[data-form-error]')?.replaceChildren();status.textContent='Bewaarde nummer teruggezet.';};
 input.addEventListener('input',()=>{revert.hidden=false;status.textContent='Nog niet bewaard · verlaat dit veld of druk op Enter.';});
 input.addEventListener('change',()=>{void save().catch(()=>{});});form.addEventListener('submit',event=>{event.preventDefault();void save().catch(()=>{});});
 input.addEventListener('keydown',event=>{if(event.key==='Escape'&&!pending){event.preventDefault();revert.click();return;}if(event.key==='Enter'){event.preventDefault();void save().catch(()=>{});}});
 function rebase(beforeOrder,beforeCustomer){const latest=context.state,prior={...latest,orders:latest.orders.map(o=>o.id===beforeOrder.id?beforeOrder:o),customers:latest.customers.map(c=>c.id===beforeCustomer?.id?beforeCustomer:c)};if(supplierFulfilmentSignature(prior,beforeOrder)!==expected)return false;expected=supplierFulfilmentSignature(latest,context.order(order.id));return true;}
 return {settle:save,rebase};
}

export function installSupplierDraftGuard(context){
 // Factory installation happens before company/runtime/state initialization.
 // Only the Maat supplier workspace renders these forms; inspect the DOM lazily.
 const draft=()=>[...document.querySelectorAll('.supplier-order-workspace form')].find(f=>f.dataset.unsavedEdit==='true'||f.dataset.pickingFile==='true'||f.getAttribute('aria-busy')==='true');
 const message=form=>{guideSupplierInput(form);context.toast('Je open invoer staat nu in beeld. Kies daar Bewaren of Invoer wissen.');};
 document.addEventListener('click',event=>{
  const form=draft();if(!form||event.target.closest('[data-supplier-invoice-inline],[data-supplier-reference-form],[data-supplier-delivery-form],[data-supplier-website-copy],[data-supplier-operation],[data-packs-identity],#dialog[data-packs-identity-dialog],[data-supplier-mail-inbox] button,.mail-attachment-dialog,#feedback-dialog,[data-feedback-action],[data-supplier-packs-copy],[data-sidebar-toggle],[data-mobile-menu],[data-mobile-close],[data-mobile-backdrop]'))return;
  const action=event.target.closest('a[href],button');if(!action||action.closest('[data-supplier-input-help]')||action.matches('a')&&(action.target==='_blank'||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey))return;event.preventDefault();event.stopImmediatePropagation();message(form);
 },true);
 window.addEventListener('hashchange',event=>{const form=draft(),route=form?.closest('[data-supplier-current-route]')?.dataset.supplierCurrentRoute;if(!route||location.hash===route)return;event.stopImmediatePropagation();history.replaceState(null,'',route);message(form);},true);
 window.addEventListener('beforeunload',event=>{if(draft()){event.preventDefault();event.returnValue='';}});
}
