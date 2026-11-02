import {focusFormField} from '../form-guidance.js?v=crm-code-review-20261027';

export function guideSupplierInput(form){
 if(!form?.isConnected)return;
 for(let node=form.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
 const review=form.querySelector('[data-supplier-invoice-review]');if(review)review.open=true;
 let box=form.querySelector('[data-supplier-input-help]');
 if(!box){box=document.createElement('section');box.className='notice';box.dataset.supplierInputHelp='';box.tabIndex=-1;box.setAttribute('role','status');form.prepend(box);}
 box.replaceChildren();const text=document.createElement('p'),busy=form.inert||form.getAttribute('aria-busy')==='true'||form.dataset.pickingFile==='true',invoice=form.dataset.invoiceImportForm==='true';
 text.textContent=busy?'Hier is nog een actie bezig. Rond de bestandskeuze af of wacht tot het bewaren/inlezen klaar is.':invoice?'Hier staat je nog niet bewaarde factuurinvoer. Kies Kosten accepteren om te bewaren, of Invoer wissen om alleen deze begonnen invoer weg te doen.':'Hier staat je nog niet bewaarde '+(form.matches('[data-supplier-reference-form]')?'bestelnummer.':'afleveradres.');box.append(text);
 if(!busy){const actions=document.createElement('div');actions.className='actions';const save=document.createElement('button');save.type='button';save.textContent=invoice?'Kosten accepteren':'Invoer bewaren';save.onclick=()=>{box.remove();form.requestSubmit();};actions.append(save);const clear=form.querySelector('[data-inline-cancel],[data-address-revert],[data-supplier-reference-revert]');if(clear){const discard=document.createElement('button');discard.type='button';discard.textContent=invoice?'Invoer wissen':'Bewaarde invoer terugzetten';discard.onclick=()=>{clear.click();box.remove();};actions.append(discard);}box.append(actions);}
 box.focus();box.scrollIntoView?.({block:'center',behavior:'instant'});
}

// Only DOM status; never save fields or read company/state during construction.
export function clearSupplierWorkspaceProblem(root,area){
 const box=root?.querySelector(area==='copy'?'[data-supplier-copy-problem]':'[data-supplier-shipping-problem]');
 if(box){box.hidden=true;box.textContent='';}
}
export function showSupplierWorkspaceProblem(root,error,area){
 if(!root?.isConnected)return;
 const box=root.querySelector(area==='copy'?'[data-supplier-copy-problem]':'[data-supplier-shipping-problem]');
 if(box){box.textContent=error.message||'De stap kon niet worden geopend. Je invoer blijft staan.';box.hidden=false;}
 const scope=error.supplierInput==='invoice'?root.querySelector('[data-supplier-invoice-inline]'):root;
 const invalid=scope?.querySelector(error.supplierInput==='invoice'?'[aria-invalid="true"]':'[data-supplier-reference-form] [aria-invalid="true"],[data-supplier-delivery-form] [aria-invalid="true"]');
 if(invalid?.form&&focusFormField(invalid.form,invalid))return;
 if(error.supplierInput==='invoice'){
  const form=scope?.querySelector('form');if(form){guideSupplierInput(form);return;}
 }
 if(box){box.focus();box.scrollIntoView?.({block:'nearest'});}
}
