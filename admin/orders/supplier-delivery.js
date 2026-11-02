import {deliveryEditBasis,applyOrderDelivery,deliveryAddressProposal,deliveryAddressText,deliveryFieldLimits,deliveryCountryCode,validateStructuredDelivery} from '../../shared/order-delivery.js?v=supplier-workflow-ui-20261101';
import {supplierFulfilmentData} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {installFormGuidance,validateForm,markFormClean,showFormProblem} from '../form-guidance.js?v=crm-code-review-20261027';

export function supplierDeliveryMarkup(context,order){
 const data=supplierFulfilmentData(context.state,order),proposal=deliveryAddressProposal(data),esc=context.esc;
 const labels={street:'Straat',number:'Huisnummer',numberExt:'Toevoeging',zip:'Postcode',place:'Plaats',country:'Landcode'};
 return `<form data-supplier-delivery-form><div class="fields"><label>Naam klant / ontvanger<input name="recipient" value="${esc(data.recipient)}" maxlength="50" required autocomplete="shipping name"></label><label>Afleveradres<textarea name="address" rows="4" maxlength="2000" required autocomplete="shipping street-address" placeholder="Straat en huisnummer, postcode en plaats">${esc(data.address)}</textarea></label></div><fieldset class="supplier-address-fields"><legend>Adres voor PACKS · controleren</legend><div class="fields">${Object.entries(labels).map(([key,label])=>`<label>${label}<input name="address_${key}" value="${esc(proposal.fields[key])}" maxlength="${deliveryFieldLimits[key]}" ${key==='numberExt'?'':'required'} ${proposal.complete?'class="source-mark source-'+(proposal.source==='interpretation'?'inferred':'automatic')+'"':''} ${key==='country'?'placeholder="NL"':''}></label>`).join('')}</div></fieldset><p class="form-help" data-address-parse-status>${proposal.complete?'Controleer de losse velden.':'Plak het adres of vul de losse velden aan.'}</p><div class="actions"><button type="submit" data-address-save disabled>Adres opslaan</button><button type="button" data-address-revert hidden>Wijzigingen terugzetten</button></div><p role="status" data-address-status></p><p data-form-error role="alert" class="danger"></p></form>`;
}
export function installSupplierDelivery(context,root,order,{beforeSave=async()=>{},onSaved=()=>{},onPreview=()=>{}}={}){
 const form=root.querySelector('[data-supplier-delivery-form]'),status=form.querySelector('[data-address-status]'),parseStatus=form.querySelector('[data-address-parse-status]'),saveButton=form.querySelector('[data-address-save]'),revert=form.querySelector('[data-address-revert]');
 let expected=deliveryEditBasis(context.state,order),pending=null,splitEdited=false;installFormGuidance(form);
 const element=key=>form.elements.namedItem(key),fields=()=>Object.fromEntries(Object.keys(deliveryFieldLimits).map(k=>[k,element('address_'+k).value.trim()]));
 const preview=()=>onPreview({recipient:element('recipient').value.trim(),address:element('address').value.trim(),country:deliveryCountryCode(element('address_country').value),number:context.order(order.id)?.number||order.number});
 function changed(){saveButton.disabled=false;revert.hidden=false;status.textContent='Nog niet opgeslagen.';preview();}
 function split({preserveIncomplete=false}={}){const proposal=deliveryAddressProposal({address:element('address').value,country:element('address_country').value});if(preserveIncomplete&&!proposal.complete){parseStatus.textContent='Land gewijzigd · je losse adresvelden zijn behouden. Controleer ze hieronder.';return;}for(const [key,value] of Object.entries(proposal.fields)){const input=element('address_'+key);input.value=value;input.classList.remove('source-automatic','source-inferred','source-mark');if(value){input.classList.add('source-mark',proposal.source==='interpretation'?'source-inferred':'source-automatic');}}splitEdited=false;parseStatus.textContent=proposal.complete?'Adres verdeeld · controleer de losse velden.':'Adres niet volledig herkend · vul de losse velden aan.';}
 const edited=event=>{
  if(event.target.name==='address')split();
  else if(event.target.name?.startsWith('address_')){
   event.target.classList.remove('source-automatic','source-inferred','source-mark');
   if(event.target.name==='address_country'){event.target.value=event.target.value.toUpperCase();if(!splitEdited)split({preserveIncomplete:true});}
   else splitEdited=true;
   if(splitEdited)parseStatus.textContent='Losse adresvelden aangepast · controleer de volledige adresregel.';
   const value=fields();if(Object.entries(value).every(([k,v])=>k==='numberExt'||v))element('address').value=deliveryAddressText(value);
  }
  changed();
 };
 // One pass per edit: a following change event must not reinterpret manual fields.
 form.addEventListener('input',edited);
 async function save(){
  if(pending)return pending;if(!form.isConnected)throw Error('Open de actuele order.');
  if(form.dataset.unsavedEdit!=='true')return;
  if(!validateForm(form,{toast:context.toast}))throw Error('Controleer eerst het afleveradres.');
  const structuredAddress=fields(),value={recipient:element('recipient').value.trim(),country:structuredAddress.country,address:deliveryAddressText(structuredAddress),structuredAddress};
  try{validateStructuredDelivery(value);}catch(error){showFormProblem(form,error,{toast:context.toast});throw error;}
  form.inert=true;form.setAttribute('aria-busy','true');status.textContent='Adres opslaan…';
  pending=(async()=>{let beforeOrder,beforeCustomer,committed=false;const activityId=context.uid();
   try{
    await beforeSave();
    try{await context.mergeStoredState(next=>{const current=next.orders.find(o=>o.id===order.id);beforeOrder=structuredClone(current);beforeCustomer=structuredClone(next.customers.find(c=>c.id===current?.customerId));applyOrderDelivery(next,order.id,{...value,instructions:current?.delivery?.instructions||''},expected);next.activities.unshift({id:activityId,message:'Afleveradres van order bijgewerkt',time:new Date().toISOString()});});}catch(error){if(!context.state.activities.some(a=>a.id===activityId))throw error;}committed=true;
    expected=deliveryEditBasis(context.state,context.order(order.id));element('address').value=value.address;markFormClean(form);saveButton.disabled=true;revert.hidden=true;form.querySelector('[data-form-error]').textContent='';status.textContent='Adres opgeslagen.';preview();
    try{await onSaved(beforeOrder,beforeCustomer);}catch{status.textContent='Adres opgeslagen. Overige invoer is behouden; open de order opnieuw om alles te verversen.';}
   }catch(error){if(!committed){form.inert=false;showFormProblem(form,error,{toast:context.toast});status.textContent='Niet opgeslagen.';}throw error;}
   finally{form.inert=false;form.removeAttribute('aria-busy');pending=null;}
  })();return pending;
 }
 form.addEventListener('submit',event=>{event.preventDefault();void save().catch(()=>{});});
 revert.onclick=()=>{if(pending)return;const current=context.order(order.id),data=supplierFulfilmentData(context.state,current),proposal=deliveryAddressProposal(data);element('recipient').value=data.recipient;element('address').value=data.address;for(const [k,v] of Object.entries(proposal.fields)){const input=element('address_'+k);input.value=v;input.classList.remove('source-automatic','source-inferred','source-mark');if(v&&proposal.complete)input.classList.add('source-mark',proposal.source==='interpretation'?'source-inferred':'source-automatic');}splitEdited=false;parseStatus.textContent=proposal.complete?'Controleer de losse velden.':'Plak het adres of vul de losse velden aan.';expected=deliveryEditBasis(context.state,current);markFormClean(form);saveButton.disabled=true;revert.hidden=true;status.textContent='Bewaard adres teruggezet.';preview();};
 function rebase(beforeOrder,beforeCustomer){const latest=context.state,prior={...latest,orders:latest.orders.map(o=>o.id===beforeOrder.id?beforeOrder:o),customers:latest.customers.map(c=>c.id===beforeCustomer?.id?beforeCustomer:c)};if(deliveryEditBasis(prior,beforeOrder)!==expected)return false;expected=deliveryEditBasis(latest,context.order(order.id));return true;}
 return {settle:save,rebase};
}
