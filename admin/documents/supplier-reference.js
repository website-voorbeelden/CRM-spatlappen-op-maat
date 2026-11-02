import {supplierPackingReferenceEnabled,supplierPackingNote,setSupplierOrderReference} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {packingDisplayNumber} from '../../shared/packing-display-number.js?v=packing-pb-reference-20261102';

// The supplier order number is one order field. customer_reference is only its
// presentation on this packing slip; the customer's own reference stays intact.
export function createPackingSupplierReference(context,{order,draft,supplier,resume}){
 const enabled=supplierPackingReferenceEnabled(context.state,order,context.company.id),reference=String(order.supplierOrderReference||''),linked=enabled&&(supplier?true:typeof resume.supplierReferenceLinked==='boolean'?resume.supplierReferenceLinked:draft.supplierReferenceLinked!==false);
 const previous=String(draft.customer_reference||''),ownReference=order.sourceNumber||'';
 let rememberedCustomerReference=typeof resume.manualCustomerReference==='string'?resume.manualCustomerReference:typeof draft.manualCustomerReference==='string'?draft.manualCustomerReference:draft.supplierReferenceLinked===false?previous:ownReference;
 const customerReference=linked&&reference?reference:rememberedCustomerReference;
 const proposal=enabled&&!supplier&&previous&&previous!==reference&&previous!==ownReference?previous:'';
 const markup=enabled?`<section class="form-section"><h3>Bestelnummer Kunststofbaas</h3>${context.field('supplier_order_reference','Bestelnummer bij Kunststofbaas',reference,'text',`maxlength="200" ${supplier?'readonly':''}`)}${supplier?'<input type="hidden" name="useSupplierReference" value="1"><p class="form-help">Dit bestelnummer komt op de pakbon. Je past het bovenaan de Kunststofbaas-tab aan.</p>':`<label class="check-row"><input type="checkbox" name="useSupplierReference" ${linked?'checked':''}>Gebruik dit bestelnummer als klantreferentie op de pakbon</label><p class="form-help">Dit nummer wordt bij deze order bewaard. Je CRM-ordernummer en de eigen referentie van de klant blijven apart. Zonder dit vinkje kun je de klantreferentie zelf invullen; het leveranciersnummer komt dan bij de opmerkingen op de pakbon.</p>`}${proposal?`<details class="form-details"><summary>Eerder ingevulde pakbonreferentie</summary><p>${context.esc(proposal)}</p><button type="button" data-packing-use-previous-reference>Dit is het Kunststofbaas-bestelnummer · overnemen</button><p class="form-help">Alleen overnemen als dit echt het nummer van Kunststofbaas is. Eerdere pakbonnen veranderen niet.</p></details>`:''}</section>`:'';
 function read(fd){
  if(!enabled)return '';
  const value=String(fd.get('supplier_order_reference')||'').trim();
  if(value.length>200||/[\r\n\0]/.test(value))throw context.formProblem('Gebruik een bestelnummer van maximaal 200 tekens op één regel.',{field:'supplier_order_reference'});
  if(supplier&&value!==supplier.reference)throw Error('Het bestelnummer wijkt af van het gekozen PACKS-label. Pas het eerst aan via Bestelling openen.');
  return value;
 }
 function fields(fd){
  if(!enabled)return {};
  const value=read(fd),customer=fd.has('useSupplierReference')&&value?value:String(fd.get('customer_reference')||'').trim(),notes=String(fd.get('delivery_notes')||'');
  return {...(value?{supplier_order_reference:value}:{}),customer_reference:customer,delivery_notes:value&&customer!==value?supplierPackingNote(value,notes):notes};
 }
 function install(form){
  if(!enabled)return;
  const number=form.elements.supplier_order_reference,check=form.elements.useSupplierReference,customer=form.elements.customer_reference,notes=form.elements.delivery_notes;
  check.checked=linked;let lastLinked='',manual=rememberedCustomerReference;
  if(!linked&&typeof resume.customer_reference==='string')manual=resume.customer_reference;
  function sync(){
   const value=number.value.trim(),active=check.checked&&!!value;
   if(active){if(!customer.readOnly&&customer.value!==value&&customer.value!==reference)manual=customer.value;customer.value=value;lastLinked=value;}
   else if(lastLinked&&customer.value===lastLinked)customer.value=manual;
   customer.readOnly=active;
   rememberedCustomerReference=manual;
   notes.maxLength=value&&customer.value.trim()!==value?Math.max(0,500-supplierPackingNote(value).length-1):500;
  }
  number.addEventListener('input',sync);check.addEventListener('change',sync);
  customer.addEventListener('input',()=>{if(!customer.readOnly)manual=customer.value;sync();});
  const previousButton=form.querySelector('[data-packing-use-previous-reference]');
  if(previousButton)previousButton.onclick=()=>{number.value=proposal;check.checked=true;number.dispatchEvent(new Event('input',{bubbles:true}));};
  sync();
 }
 function save(current,fd){if(enabled)setSupplierOrderReference(current,read(fd));}
 function draftFields(fd,fields){return {...fields,delivery_notes:String(fd.get('delivery_notes')||''),...(enabled?{supplierReferenceLinked:fd.has('useSupplierReference'),manualCustomerReference:rememberedCustomerReference}:{})};}
 function remember(form,values){return {...values,...(enabled?{supplierReferenceLinked:form.elements.useSupplierReference.checked,manualCustomerReference:rememberedCustomerReference}:{})};}
 const displayNumber=(number,fd)=>packingDisplayNumber(number,enabled?(fd?String(fd.get('supplier_order_reference')||''):reference):'');
 return {markup,customerReference,fields,install,save,draftFields,remember,displayNumber};
}
