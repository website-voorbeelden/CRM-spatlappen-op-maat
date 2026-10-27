import {openInlineFormTask} from '../inline-tasks.js?v=crm-code-review-20261027';
import {customerContactKeys,customerContactSignature,customerContactValues,updateCustomerContact} from '../../shared/customer-contact.js?v=batch3-workflow-20261023';
export function createCustomerContactEditor(context){
 function prepare(customerId,{orderId='',focus='contact'}={}){
  const customer=context.customer(customerId);if(!customer)throw Error('Klant niet gevonden.');
  const expected=customerContactSignature(customer);
  const html=`<p class="form-help">Dit zijn de standaardgegevens van het klantdossier. Wijzigingen gelden ook voor andere orders van deze klant. Extra contactpersonen en de contactkeuze van een order blijven behouden.</p><div class="fields">${context.field('company','Klant / bedrijf',customer.company,'text','required maxlength="200"')}${context.field('contact','Standaard contactpersoon',customer.contact,'text','maxlength="200"')}${context.field('email','E-mailadres klant',customer.email,'email','maxlength="200"')}${context.field('phone','Telefoon',customer.phone,'tel','maxlength="100"')}${context.field('invoiceEmail','Factuurmail · leeg = gewoon e-mailadres',customer.invoiceEmail,'email','maxlength="200"')}</div>`;
  async function save(fd){
   let values;try{values=customerContactValues(Object.fromEntries(fd));}catch(error){throw context.formProblem(error.message,{field:error.field});}
   let result;await context.mergeStoredState(next=>{result=updateCustomerContact(next,customerId,expected,values,{orderId});if(result.changed)next.activities.unshift({id:context.uid(),message:'Standaard contactgegevens klant bijgewerkt',time:new Date().toISOString()});});
   context.toast(result.changed?'Contactgegevens opgeslagen':'Geen contactgegevens gewijzigd');return {customerId,...result};
  }
  return {html,save,focus:customerContactKeys.includes(focus)?focus:'contact',customer};
 }
 function openForOrder(orderId,focus='contact'){
  const order=context.order(orderId);if(!order)throw Error('Order niet gevonden.');const fields=prepare(order.customerId,{orderId,focus});
  context.openForm('Klantgegevens bij deze order',fields.html,fields.save,{focus:fields.focus,afterSave:()=>context.renderOrder(orderId)});
  context.markFormSources(context.$('#dialog form'),fields.customer);
 }
 async function openInline(customerId,options={}){
  const fields=prepare(customerId,options),promise=openInlineFormTask({title:'Klantgegevens aanpassen',html:fields.html,focus:fields.focus,submitLabel:'Opslaan & terug naar mijn mail',onSubmit:fields.save});
  const form=document.querySelector('.inline-task-dialog form');if(form)context.markFormSources(form,fields.customer);return promise;
 }
 return {openForOrder,openInline};
}
