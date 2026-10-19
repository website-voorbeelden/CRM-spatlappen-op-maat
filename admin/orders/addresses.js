// Feature implementation. context provides live dependencies from workspace composition.
// Keep state reads through context.state; never cache a separate dossier snapshot here.
export function createOrderAddresses(context){
function deliveryDetails(o,c){return o.delivery?.source==='custom'?{address:o.delivery.address,recipient:o.delivery.recipient,country:o.delivery.country}:{address:c?.shippingAddress||'',recipient:c?.shippingRecipient||c?.contact||c?.company||'',country:c?.shippingCountry||c?.country||''};}

function billingDetails(o,c){
 if(o.billing?.source==='custom'&&o.billing.address?.trim())return {...o.billing,source:'custom'};
 if(o.billing?.source!=='delivery'&&c?.billingAddress?.trim())return {source:'customer',recipient:c.company||c.contact||'',address:c.billingAddress,country:c.country||''};
 return {...deliveryDetails(o,c),source:'delivery'};
}

function orderContactBlock(o,c){
 return `<section class="order-surface"><div class="section-heading"><h2>Contactgegevens klant</h2>${context.button('edit-customer','Contactgegevens aanpassen',o.customerId)}</div>${context.orderSummaryRows([['Contactpersoon',context.esc(c?.contact||c?.company||'Nog niet ingevuld')],['E-mail',context.esc(c?.email||'Nog niet ingevuld')],['Telefoon',context.esc(c?.phone||'Nog niet ingevuld')]])}<p class="form-help">Deze gegevens horen bij het klantdossier en gelden ook voor andere orders van deze klant.</p></section>`;
}

function billingBlock(o,c){
 const b=billingDetails(o,c),inherited=b.source==='delivery';
 return `<section class="order-surface"><div class="section-heading"><h2>Factuuradres</h2>${context.button('billing-address',inherited?'Afwijkend adres invullen':'Bewerken',o.id)}</div>${context.badge(inherited?'Overgenomen van afleveradres':b.source==='customer'?'Apart factuuradres uit klantdossier':'Afwijkend factuuradres voor deze order',inherited?'blue':'')}<address class="delivery-address billing-address">${b.recipient?`<strong>${context.esc(b.recipient)}</strong>`:''}<span>${context.esc(b.address)||(inherited?'Nog geen afleveradres ingevuld. Vul dat hierboven in en sla het op.':'Nog geen factuuradres ingevuld.')}</span>${b.country&&b.address?`<span>${context.esc(b.country)}</span>`:''}</address><p class="form-help">${inherited?'Het factuuradres volgt automatisch het opgeslagen afleveradres van deze order.':b.source==='customer'?'Er is al een apart factuuradres ingevuld bij deze klant.':'Dit factuuradres geldt alleen voor deze order.'}</p>${context.orderSummaryRows([['Factuurmail',context.esc(c?.invoiceEmail||c?.email||'Nog niet ingevuld')]])}${!c?.invoiceEmail&&c?.email?'<p class="form-help">Gebruikt nu het gewone e-mailadres van de klant.</p>':''}<div class="section-footer">${context.button('edit-customer','Factuurmail aanpassen',o.customerId)}${!inherited?context.button('billing-use-delivery','Afleveradres gebruiken',o.id):''}</div></section>`;
}

function billingForm(id){
 const o=context.order(id),c=context.customer(o.customerId),b=billingDetails(o,c);
 context.openForm('Factuuradres voor deze order',`<p class="form-help">Vul alleen een apart factuuradres in als het afwijkt. Laat het adres leeg om automatisch het afleveradres te gebruiken.</p><div class="fields">${context.field('recipient','Naam / bedrijf',b.recipient)}${context.field('country','Land',b.country)}${context.area('address','Straat, huisnummer, postcode en plaats',b.address)}</div>`,async fd=>{
  const address=fd.get('address').trim(),previous=o.billing;
  o.billing=address?{source:'custom',recipient:fd.get('recipient').trim(),country:fd.get('country').trim(),address}:{source:'delivery'};
  try{await context.save(address?'Factuuradres voor deze order opgeslagen':'Factuuradres volgt het afleveradres');}catch(error){o.billing=previous;throw error;}
 });
}

function deliveryValues(o,c){return {...deliveryDetails(o,c),instructions:o.delivery?.instructions||''};}

function deliveryBlock(o,c){
 const draft=context.deliveryDrafts.get(o.id),d=draft||deliveryValues(o,c),shared=context.customerOrders(o.customerId).length===1;
 return `${context.company.id==='spatlappen'?context.fulfilmentMarkup(o,{esc: context.esc}):''}<section class="order-surface"><div class="section-heading"><div><h2>Afleveradres</h2><p>${shared?'Dit afleveradres wordt ook bij de klantgegevens bijgewerkt.':'Pas het adres hier aan voor deze specifieke order.'}</p></div>${context.badge(shared?'Klant & gekoppelde order':'Alleen deze order','blue')}</div><form id="delivery-address-form" data-order-id="${context.esc(o.id)}"><div class="fields">${context.field('recipient','Ontvanger / contactpersoon',d.recipient)}${context.field('country','Land',d.country)}${context.area('address','Straat, huisnummer, postcode en plaats',d.address)}${context.area('instructions','Afleverinstructies (optioneel)',d.instructions)}</div><p class="form-help" data-delivery-status role="status">${draft?'Wijzigingen nog niet opgeslagen.':o.delivery?.source==='custom'?shared?'Dit adres is opgeslagen bij de klant en de gekoppelde order.':'Dit adres is opgeslagen bij deze order.':d.address?shared?'Het klantadres is alvast ingevuld. Wijzigingen werken ook de klantgegevens bij.':'Het klantadres is alvast ingevuld. Een wijziging wordt alleen bij deze order opgeslagen.':'Vul het afleveradres hier in.'}</p><p class="danger" data-delivery-error role="alert"></p><div class="section-footer"><button type="submit" class="primary" ${draft?'':'disabled'}>Adres opslaan</button><button type="button" data-action="delivery-use-customer" data-id="${context.esc(o.id)}" ${c?.shippingAddress?'':'disabled'}>Klantadres overnemen</button><button type="button" data-action="delivery-cancel" data-id="${context.esc(o.id)}" ${draft?'':'hidden'}>Annuleren</button></div></form></section>`;
}

function deliveryForm(id){context.orderView={id,tab:'delivery'};history.replaceState(null,'',`#orders/${id}/delivery`);context.renderOrder(id);context.$('#delivery-address-form [name=address]').focus();}

function updateDeliveryDraft(form){
 const o=context.order(form.dataset.orderId);if(!o)return;
 const values=Object.fromEntries(new FormData(form)),saved=deliveryValues(o,context.customer(o.customerId));
 const dirty=['recipient','country','address','instructions'].some(key=>(values[key]||'')!==(saved[key]||''));
 if(dirty)context.deliveryDrafts.set(o.id,values);else context.deliveryDrafts.delete(o.id);
 form.querySelector('[type=submit]').disabled=!dirty;
 form.querySelector('[data-action=delivery-cancel]').hidden=!dirty;
 form.querySelector('[data-delivery-status]').textContent=dirty?'Wijzigingen nog niet opgeslagen.':'Geen onopgeslagen wijzigingen.';
 form.querySelector('[data-delivery-error]').textContent='';
}
return {deliveryDetails,billingDetails,orderContactBlock,billingBlock,billingForm,deliveryValues,deliveryBlock,deliveryForm,updateDeliveryDraft};
}
