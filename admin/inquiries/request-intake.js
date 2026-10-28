import {customerEmailMatches} from '../../shared/inquiry-customer.js';
import {recognizeRequest,requestMissing,requestReviewBasis,saveRecognizedRequest,requestNumericFields} from '../../shared/request-recognition.js?v=feedback-followup-20261028';
import {specLabels} from '../../shared/inquiries.js?v=feedback-followup-20261028';
import {emailAddresses} from '../../shared/mail-inbox.js?v=crm-code-review-20261027';
import {formProblem} from '../form-guidance.js?v=crm-code-review-20261027';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createRequestIntakeUI({company,getState,mergeStoredState,openForm,render,toast}){
 return function reviewRequest(thread,message){
  if(!message||message.direction==='outgoing')throw Error('Kies een ontvangen aanvraag van de klant.');
  const linked=getState().mailThreads?.find(t=>t.mailbox===thread.mailbox&&t.gmailThreadId===thread.threadId&&t.orderId);
  if(linked){location.hash='orders/'+linked.orderId+'/mail';return;}
  const detected=recognizeRequest(message,company.id),expected=requestReviewBasis(getState(),thread,message);
  let form,nextRow=0;
  const keys=['quantity',...(company.id==='maatwerkkunststof'?['material']:[]),'shape','width','height','diameter','holeDiameter','thickness',...(company.id==='spatlappen'?['printing']:[])];
  function productMarkup(product){
   const index=nextRow++,specs=product.specs||{},field=key=>`<label>${esc(specLabels[key])}${key==='shape'?`<select name="p${index}_shape" data-spec="shape"><option value="">Nog onbekend / andere vorm</option><option value="rectangle" ${specs.shape==='rectangle'?'selected':''}>Rechthoek</option><option value="round" ${specs.shape==='round'?'selected':''}>Rond / ring / pakking</option></select>`:`<input name="p${index}_${key}" data-spec="${key}" value="${esc(specs[key])}" ${requestNumericFields.has(key)?'type="number" step="any" min="0"':'type="text" maxlength="200"'} placeholder="Nog onbekend">`}</label>`;
   return `<fieldset class="form-section" data-request-product><legend>Product ${index+1}</legend><label class="check-row"><input type="checkbox" data-include checked>Dit product meenemen</label><label>Productomschrijving<input name="p${index}_product" data-product-label required maxlength="200" value="${esc(product.product)}"></label><div class="fields">${keys.map(field).join('')}</div><details><summary>Meer productgegevens en bron</summary><div class="fields">${['color',...(company.id==='spatlappen'?['material','design']:[])].map(field).join('')}</div>${product.originalText?'<pre>'+esc(product.originalText)+'</pre>':''}${(product.warnings||[]).map(w=>'<p class="form-help">'+esc(w)+'</p>').join('')}</details></fieldset>`;
  }
  function values(){
   const products=[...form.querySelectorAll('[data-request-product]')].filter(row=>row.querySelector('[data-include]').checked).map(row=>{
    const specs=Object.fromEntries([...row.querySelectorAll('[data-spec]')].map(field=>[field.dataset.spec,field.value===''?null:requestNumericFields.has(field.dataset.spec)?Number(field.value):field.value.trim()]));
    if(specs.shape==='round'){specs.width=null;specs.height=null;}else if(specs.shape==='rectangle'){specs.diameter=null;specs.holeDiameter=null;}
    return {product:row.querySelector('[data-product-label]').value.trim(),specs};
   });
   return {companyId:company.id,customer:Object.fromEntries(['company','contact','email','phone'].map(key=>[key,form.elements[key].value.trim()])),product:products.length>1?products.length+' producten: '+products.map(p=>p.product).join(' · ').slice(0,170):products[0]?.product||'',specs:products.length===1?products[0].specs:{},...(products.length>1?{products}:{})};
  }
  function summary(){
   for(const row of form.querySelectorAll('[data-request-product]')){
    const included=row.querySelector('[data-include]').checked,shape=row.querySelector('[data-spec=shape]').value;
    for(const input of row.querySelectorAll('input:not([data-include]),select'))input.disabled=!included;
    for(const key of ['width','height','diameter','holeDiameter'])row.querySelector('[data-spec='+key+']').closest('label').hidden=shape==='round'?['width','height'].includes(key):shape==='rectangle'?['diameter','holeDiameter'].includes(key):false;
   }
   const input=values(),box=form.querySelector('[data-request-missing]');
   try{const missing=requestMissing(input,company.id);box.innerHTML=missing.length?'<strong>Nog nodig voor een passende offerte</strong><ul>'+missing.map(label=>'<li>'+esc(label)+'</li>').join('')+'</ul><small>Onbekende prijzen blijven onbekend. Bij meerdere producten is per product een aantal nodig voordat er productregels worden aangemaakt.</small>':'<strong>✓ De benodigde aanvraaggegevens zijn ingevuld.</strong><p>Controleer ze tegen de mail. Dit is nog geen prijsafspraak.</p>';}catch{box.textContent='Controleer de ingevoerde aantallen en maten.';}
   const addresses=emailAddresses(input.customer.email),matches=addresses.length===1?getState().customers.filter(c=>customerEmailMatches(c,addresses[0])):[];
   form.querySelector('[data-request-customer]').textContent=matches.length===1?'Bestaande klant: '+matches[0].company+'. Bestaande klantgegevens blijven behouden.':matches.length>1?'Dit adres hoort bij meerdere klanten. Koppel eerst het juiste dossier.':'Na bevestiging maken we een nieuwe klant en aanvraag aan.';
   form.elements.confirmed.checked=false;
  }
  const products=detected.products.length?detected.products:[{product:detected.product,specs:detected.specs,originalText:detected.originalText}];
  openForm('Aanvraag uit e-mail herkennen',`<p>Controleer klant en producten tegen de mail. Maten worden alleen uit het eigen productblok overgenomen; er wordt niets tussen producten gekopieerd.</p>${products.length>1?'<p class="notice">'+products.length+' afzonderlijke productblokken gevonden. Controleer ieder product; zet Meenemen uit als een blok geen product is.</p>':detected.warnings.map(w=>'<p class="notice">'+esc(w)+'</p>').join('')}<section class="request-recognition-summary" data-request-missing aria-live="polite"></section><h3>Klant</h3><div class="fields">${[['company','Klant- of bedrijfsnaam'],['contact','Contactpersoon'],['email','E-mailadres klant'],['phone','Telefoon']].map(([key,label])=>`<label>${label}<input name="${key}" ${key==='email'?'type="email"':'type="text"'} ${['company','email'].includes(key)?'required':''} maxlength="${key==='phone'?100:200}" value="${esc(detected.customer[key])}"></label>`).join('')}</div><p class="form-help" data-request-customer></p><div data-request-products>${products.map(productMarkup).join('')}</div><button type="button" data-request-add>Product toevoegen</button><details class="request-recognition-source"><summary>Oorspronkelijke mail</summary><pre>${esc(detected.originalText)}</pre><p class="form-help">Herkenning gebruikt vaste regels. Geciteerde historie en bijlagen worden niet als nieuwe productinformatie gelezen.</p></details><label class="check-row"><input type="checkbox" name="confirmed" required>Ik heb de klant en alle geselecteerde producten gecontroleerd.</label><p class="form-help">Dit bewaart één aanvraagconcept met de gekozen productregels en het gesprek. Het verstuurt niets en wijzigt Gmail niet.</p>`,async()=>{
   const rows=[...form.querySelectorAll('[data-request-product]')].filter(row=>row.querySelector('[data-include]').checked);
   if(!rows.length)throw formProblem('Kies minstens één product.',{field:'p0_product'});
   if(rows.length>1)for(const row of rows){const quantity=row.querySelector('[data-spec=quantity]');if(!Number.isInteger(Number(quantity.value))||Number(quantity.value)<1)throw formProblem('Vul het aantal bij dit product in; er wordt geen aantal gegokt.',{field:quantity.name});}
   const input=values();let result;
   await mergeStoredState(next=>{result=saveRecognizedRequest(next,thread,message,input,company.id,{approved:form.elements.confirmed.checked,expected});});
   location.hash='orders/'+result.orderId+'/mail';render();toast(result.reused?'Deze aanvraag stond al klaar':'Aanvraag en productregels bewaard. Ontbrekende gegevens staan bij de order.');
  });
  form=document.querySelector('#dialog form');form.querySelector('[type=submit]').textContent='Gecontroleerde aanvraag bewaren';
  form.querySelector('[data-request-add]').onclick=()=>{if(form.querySelectorAll('[data-request-product]').length>=40){toast('Maximaal veertig producten per aanvraag.');return;}const host=form.querySelector('[data-request-products]');host.insertAdjacentHTML('beforeend',productMarkup({product:'',specs:{}}));summary();host.lastElementChild.querySelector('[data-product-label]').focus();form.dispatchEvent(new Event('input',{bubbles:true}));};
  form.addEventListener('input',event=>{if(event.target.name!=='confirmed')summary();});form.addEventListener('change',event=>{if(event.target.name!=='confirmed')summary();});summary();
 };
}
