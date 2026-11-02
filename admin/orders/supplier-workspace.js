import {recordFeedbackActionError} from '../feedback-diagnostics.js?v=feedback30-batch1';
import {packsIdentityMarkup,installPacksIdentity} from './packs-identity.js?v=packs-live-link-20261102';
import {installSupplierReference,installSupplierDraftGuard,registerSupplierWorkspace} from './supplier-inline.js?v=packs-workflow-20261102';
import {supplierWebsiteDescription} from '../../shared/supplier-order-text.js?v=supplier-workflow-ui-20261101';
import {supplierDeliveryMarkup,installSupplierDelivery} from './supplier-delivery.js?v=packs-worker-v3-20261102';
import {createSupplierDescription} from './supplier-description.js?v=packs-worker-v3-20261102';
import {kunststofbaas,supplierFulfilmentAvailable,supplierFulfilmentData} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {createSupplierProof} from './supplier-proof.js?v=packs-workflow-20261102';
import {clearSupplierWorkspaceProblem,showSupplierWorkspaceProblem} from './supplier-workspace-status.js?v=packs-workflow-20261102';
import {supplierMailMarkup,installSupplierMail} from './supplier-mail.js?v=supplier-batches35-20261101';

export function createSupplierOrderWorkspace(context,{fulfilment}){
 installSupplierDraftGuard(context);
 const description=createSupplierDescription(context),proof=createSupplierProof(context),esc=value=>context.esc(value);
 const available=order=>supplierFulfilmentAvailable(context.state,order,context.company.id);
 function moneyMarkup(order){try{const e=context.economics(order),t=context.totals(order);return `<div class="compact-facts">${context.orderSummaryRows([['Opgeslagen kostprijs',context.euro(e.cost)+(e.provisional?' · voorlopig':'')],['Opgeslagen marge',t.priceKnown&&order.shippingKnown===true?context.signedEuro(e.profit)+(e.provisional?' · voorlopig':''):'Nog niet volledig bekend']])}</div>`;}catch{return '<p>Het kostenoverzicht kon niet worden getoond. Open Inkoop & marge voor de details.</p>';}}
 function markup(order){
  if(!available(order))return '<p class="notice">Deze bestelstroom is alleen voor een losse Maatwerkkunststof-order bij Kunststofbaas.</p>';
  const data=supplierFulfilmentData(context.state,order);
  return `<div class="supplier-order-workspace" data-supplier-current-route="${esc('#orders/'+order.id+'/supplier')}">
   <section class="order-surface"><h2>1. Bestellen · onze order #${esc(data.number)}</h2><div class="supplier-order-entry"><div><label>Naam, afleveradres en ons ordernummer<textarea rows="6" readonly data-supplier-website-text>${esc(supplierWebsiteDescription(data))}</textarea></label><div class="actions"><button type="button" ${order.supplierOrderReference?'':'class="primary"'} data-supplier-website-copy>Beschrijving kopiëren</button><a class="button" href="${kunststofbaas.orderUrl}" target="_blank" rel="noopener noreferrer">Kunststofbaas openen ↗</a></div><p class="danger" role="alert" tabindex="-1" data-supplier-copy-problem hidden></p><div class="supplier-order-reference"><form data-supplier-reference-form><label>Bestelnummer Kunststofbaas<input name="supplierReference" value="${esc(order.supplierOrderReference||'')}" required maxlength="200" autocomplete="off" inputmode="numeric" placeholder="30268793"></label><button type="button" data-supplier-reference-revert hidden>Bewaard nummer terugzetten</button><p role="status" data-supplier-reference-status></p></form></div></div>${supplierDeliveryMarkup(context,order)}</div></section>

   <section class="order-surface"><h2>2. Factuur & kosten</h2>${supplierMailMarkup()}<div data-supplier-invoice-inline></div><div data-supplier-money>${moneyMarkup(order)}</div></section>
   <section class="order-surface"><h2>Producten controleren</h2><div class="tablewrap"><table><thead><tr><th>Aantal</th><th>Maat</th><th>Materiaal</th></tr></thead><tbody>${data.items.map(i=>'<tr><td>'+esc(i.quantity)+'</td><td>'+esc(i.width&&i.height?i.width+' × '+i.height+' mm':'Nog invullen')+'</td><td>'+esc([i.material,i.thickness?i.thickness+' mm':''].filter(Boolean).join(' · ')||'Nog invullen')+'</td></tr>').join('')}</tbody></table></div></section>
   <div data-supplier-shipping-actions>${fulfilment.actionsMarkup(order)}</div><p role="status" data-supplier-action-progress hidden>Stap openen…</p><p class="danger" role="alert" tabindex="-1" data-supplier-shipping-problem hidden></p>
   <details class="order-surface"><summary>Meer</summary><a href="#orders/${esc(order.id)}/documents">Alle documenten</a> · <a href="#orders/${esc(order.id)}/costs">Inkoop & marge</a><div data-supplier-proof-slot>${proof.markup(order)}</div><details><summary>Eerder verwerkte facturen</summary>${context.supplierInvoiceIntake.markup(order,{hideCreate:true})}</details><details><summary>Eerder bewaarde besteltekst / standaard</summary><div data-supplier-description-slot>${description.markup(order)}</div></details></details>${packsIdentityMarkup(context)}</div>`;
 }
 function install(root,order){
  if(!root||!available(order))return;const slot=root.querySelector('[data-supplier-invoice-inline]'),copy=root.querySelector('[data-supplier-website-text]');if(!slot)return;
  installPacksIdentity(context,root);
  let reference,delivery,invoicePending=false;
  function nextAction(){if(!root.isConnected)return;const current=context.order(order.id);if(!current)return;root.querySelector('[data-supplier-website-copy]').classList.toggle('primary',!invoicePending&&!current.supplierOrderReference);const actions=root.querySelector('[data-supplier-shipping-actions]');for(const button of actions.querySelectorAll('[data-supplier-main-action]'))button.classList.toggle('primary',!invoicePending);}
  root.addEventListener('crm-supplier-invoice-state',event=>{if(!slot.contains(event.target))return;invoicePending=event.detail?.pending===true;nextAction();});
  function refresh(beforeOrder,beforeCustomer){
   if(!root.isConnected)return;const current=context.order(order.id);
   clearSupplierWorkspaceProblem(root,'copy');clearSupplierWorkspaceProblem(root,'shipping');
   copy.value=supplierWebsiteDescription(supplierFulfilmentData(context.state,current));
   root.querySelector('[data-supplier-website-copy]').classList.toggle('primary',!current.supplierOrderReference);
   root.querySelector('[data-supplier-shipping-actions]').innerHTML=fulfilment.actionsMarkup(current);
   root.querySelector('[data-supplier-money]').innerHTML=moneyMarkup(current);
   root.querySelector('[data-supplier-proof-slot]').innerHTML=proof.markup(current);
   root.querySelector('[data-supplier-description-slot]').innerHTML=description.markup(current);
   nextAction();
   if(beforeOrder)context.supplierInvoiceIntake.refreshReference(slot,beforeOrder,beforeCustomer);
  }
  reference=installSupplierReference(context,root,order,{onSaved:before=>{if(before)delivery.rebase(before);refresh(before);}});
  delivery=installSupplierDelivery(context,root,order,{beforeSave:()=>reference.settle(),onPreview:data=>{copy.value=supplierWebsiteDescription(data);},onSaved:(before,customer)=>{reference.rebase(before,customer);refresh(before,customer);}});
  const mountInvoice=()=>{try{context.supplierInvoiceIntake.open({orderId:order.id,target:slot,beforeAction:async()=>{await reference.settle();await delivery.settle();}});}catch{recordFeedbackActionError(Error('Factuurvelden konden niet openen.'),'orders/supplier-workspace.js');slot.innerHTML='<p class="danger" role="alert">Factuurinvoer kon niet openen.</p><button type="button" data-invoice-retry>Opnieuw openen</button>';slot.querySelector('[data-invoice-retry]').onclick=mountInvoice;}};mountInvoice();
  installSupplierMail(context,root,order,{useFile:file=>context.supplierInvoiceIntake.useFile(slot,file),beforeEdit:()=>{if(context.hasActiveFormEdits(slot))throw Error('Rond eerst je begonnen factuurinvoer af. Je PDF en bedragen blijven staan.');}});
  registerSupplierWorkspace(root.querySelector('.supplier-order-workspace'),async()=>{const form=slot.querySelector('form');if(form&&(form.dataset.unsavedEdit==='true'||form.dataset.pickingFile==='true'||form.getAttribute('aria-busy')==='true')){throw Object.assign(Error('Accepteer eerst je factuurinvoer of kies Invoer wissen. Je PDF en bedragen blijven staan.'),{supplierInput:'invoice'});}await reference.settle();await delivery.settle();});
  root.querySelector('[data-supplier-website-copy]').onclick=async event=>{const b=event.currentTarget;if(b.disabled)return;b.disabled=true;clearSupplierWorkspaceProblem(root,'copy');try{await reference.settle();await delivery.settle();const state=await context.store('state','readonly',s=>s.get('main')),current=state?.orders.find(o=>o.id===order.id);if(!root.isConnected)return;if(!supplierFulfilmentAvailable(state,current,context.company.id))throw Error('Open de actuele order.');const value=supplierWebsiteDescription(supplierFulfilmentData(state,current));if(copy.value!==value)throw Error('Het adres is intussen gewijzigd. Open de actuele order.');if(!supplierFulfilmentData(state,current).recipient||!supplierFulfilmentData(state,current).address)throw Error('Vul naam en afleveradres in.');try{await navigator.clipboard.writeText(value);context.toast('Beschrijving gekopieerd');}catch{copy.focus();copy.select();context.toast('Tekst geselecteerd · kopieer met je toetsenbord');}}catch(error){showSupplierWorkspaceProblem(root,error,'copy');context.toast(error.message);}finally{b.disabled=false;}};
 }
 return {available,markup,install};
}
