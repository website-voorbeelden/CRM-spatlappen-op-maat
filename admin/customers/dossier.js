// Feature implementation. context provides live dependencies from workspace composition.
// Keep state reads through context.state; never cache a separate dossier snapshot here.
export function createCustomerDossier(context){
function renderCustomersList(){const view=context.customerViews.list(context.state,context.customerSearch);context.shell(view.markup,'customers',view.details);}

function customerOrders(id){return context.state.orders.filter(o=>o.customerId===id);}

function customerAddressInfo(c){
 const list=customerOrders(c.id),single=list.length===1?list[0]:null;
 if(single)return {single,shipping:context.deliveryDetails(single,c),billing:context.billingDetails(single,c)};
 const shipping={recipient:c.shippingRecipient||c.contact||c.company||'',address:c.shippingAddress||'',country:c.shippingCountry||c.country||''};
 const billing=c.billingAddress?.trim()?{recipient:c.company||'',address:c.billingAddress,country:c.country||'',source:'customer'}:{...shipping,source:'delivery'};
 return {single:null,shipping,billing};
}

function syncSingleOrderDelivery(o){
 const c=context.customer(o.customerId);if(!c||customerOrders(c.id).length!==1||o.delivery?.source!=='custom')return ()=>{};
 const keys=['shippingAddress','shippingRecipient','shippingCountry','shippingAddressOrderId'];
 const previous=keys.map(key=>[key,Object.hasOwn(c,key),c[key]]);
 Object.assign(c,{shippingAddress:o.delivery.address||'',shippingRecipient:o.delivery.recipient||'',shippingCountry:o.delivery.country||'',shippingAddressOrderId:o.id});
 return ()=>{for(const [key,exists,value] of previous){if(exists)c[key]=value;else delete c[key];}};
}

function customerAddressSummary(c){
 const {single,shipping,billing}=customerAddressInfo(c);
 const entry=(title,d,label)=>`<section class="order-surface"><div class="section-heading"><h2>${title}</h2>${context.button('customer-tab','Aanpassen','addresses')}</div>${context.badge(label,'blue')}<address class="delivery-address billing-address">${d.recipient?`<strong>${context.esc(d.recipient)}</strong>`:''}<span>${context.esc(d.address)||'Nog niet ingevuld.'}</span>${d.address&&d.country?`<span>${context.esc(d.country)}</span>`:''}</address></section>`;
 return entry('Afleveradres',shipping,single?`Gekoppeld aan order #${single.sourceNumber||single.number}`:'Standaard klantadres')+entry('Factuuradres',billing,billing.source==='delivery'?'Overgenomen van afleveradres':billing.source==='custom'?'Afwijkend factuuradres bij order':'Apart factuuradres uit klantdossier');
}

function customerAddresses(c){
 const {single,shipping,billing}=customerAddressInfo(c);
 if(single)return `<div class="dossier-link-note"><div><strong>Adres gekoppeld aan order #${context.esc(single.sourceNumber||single.number)}</strong><p>Je hebt één order bij deze klant. Het afleveradres wordt hier en bij de order samen bijgewerkt.</p></div><a href="#orders/${single.id}/delivery">Order openen →</a></div><div class="customer-address-grid">${context.deliveryBlock(single,c)}${context.billingBlock(single,c)}</div>`;
 const standard=`<section class="order-surface"><div class="section-heading"><div><h2>Standaardadressen van de klant</h2><p>Nieuwe orders gebruiken het klantadres. Bestaande afwijkende orderadressen blijven apart.</p></div>${context.button('edit-customer','Bewerken',c.id)}</div><div class="customer-address-grid"><div><h3>Afleveradres</h3><address class="delivery-address"><strong>${context.esc(shipping.recipient)}</strong><span>${context.esc(shipping.address)||'Nog niet ingevuld.'}</span>${shipping.address?`<span>${context.esc(shipping.country)}</span>`:''}</address></div><div><h3>Factuuradres</h3>${context.badge(billing.source==='delivery'?'Overgenomen van afleveradres':'Apart factuuradres','blue')}<address class="delivery-address billing-address"><strong>${context.esc(billing.recipient)}</strong><span>${context.esc(billing.address)||'Nog niet ingevuld.'}</span></address></div></div></section>`;
 const perOrder=customerOrders(c.id).map(o=>{const d=context.deliveryDetails(o,c),b=context.billingDetails(o,c);return `<section class="order-surface"><div class="section-heading"><div><h2>Order #${context.esc(o.sourceNumber||o.number)}</h2><p>${context.esc(o.stage)}${o.archived?' · gearchiveerd':''}</p></div><a href="#orders/${o.id}/delivery">Adres aanpassen →</a></div><div class="customer-address-grid"><div><h3>Afleveradres</h3>${context.badge(o.delivery?.source==='custom'?'Eigen adres voor deze order':'Volgt klantadres','blue')}<address class="delivery-address billing-address"><strong>${context.esc(d.recipient)}</strong><span>${context.esc(d.address)||'Nog niet ingevuld.'}</span>${d.address?`<span>${context.esc(d.country)}</span>`:''}</address></div><div><h3>Factuuradres</h3>${context.badge(b.source==='delivery'?'Overgenomen van afleveradres':'Apart factuuradres','blue')}<address class="delivery-address billing-address"><strong>${context.esc(b.recipient)}</strong><span>${context.esc(b.address)||'Nog niet ingevuld.'}</span></address></div></div></section>`;}).join('');
 return standard+perOrder;
}

function renderCustomer(id){
 const c=context.customer(id);if(!c){location.hash='customers';return;}
 const view=context.customerViews.dossier(context.state,c,context.route()[2]);context.shell(view.markup,'customers',view.details);
 if(context.route()[2]==='website')context.websiteDossier.mount(context.$('#customer-content'));
}

function selectCustomerTab(tab){const id=context.route()[1];history.replaceState(null,'',`#customers/${id}/${tab}`);renderCustomer(id);}

function customerForm(id,prefill){
 if(!id)return context.orderForm(null,'__new_customer__',prefill||{});
 const c=context.customer(id)||prefill||{},info=customerAddressInfo(c),single=id?info.single:null;
 const customerBasis=JSON.stringify(c),singleBasis=JSON.stringify(single),orderIds=customerOrders(c.id).map(o=>o.id).sort().join(',');
 const billingInput=info.billing.source==='delivery'?'':info.billing.address;
 context.openForm(id?'Klant bewerken':'Nieuwe klant',`${single?`<p class="notice">Deze klant is gekoppeld aan één order (#${context.esc(single.sourceNumber||single.number)}). Afleveradreswijzigingen werken ook die order bij.</p>`:id?'<p class="form-help">Je bewerkt het klantdossier. Orders met een eigen afleveradres houden dat adres.</p>':''}<section class="form-section"><h3>Contact & bedrijf</h3><div class="fields">${context.field('company','Bedrijfsnaam / klantnaam',c.company,'text','required')}${context.field('contact','Contactpersoon',c.contact)}${context.field('email','E-mail',c.email,'email')}${context.field('invoiceEmail','Factuurmail',c.invoiceEmail,'email')}${context.field('phone','Telefoon',c.phone)}${context.field('vatNumber','Btw-nummer',c.vatNumber)}${context.field('country','Land (bedrijf)',c.country||'Nederland')}</div>${(c.contacts||[]).length?`<details class="form-details"><summary>Extra contactpersonen (${c.contacts.length})</summary>${c.contacts.map((person,index)=>`<div class="fields"><label>Naam<input name="contact_name_${index}" maxlength="200" required value="${context.esc(person.name)}"></label><label>E-mail<input name="contact_email_${index}" type="email" maxlength="200" value="${context.esc(person.email)}"></label><label>Telefoon<input name="contact_phone_${index}" maxlength="100" value="${context.esc(person.phone)}"></label></div>`).join('')}</details>`:''}</section><section class="form-section"><h3>Afleveradres</h3><div class="fields">${context.field('shippingRecipient','Ontvanger / contactpersoon',info.shipping.recipient)}${context.field('shippingCountry','Land van aflevering',info.shipping.country||c.country||'Nederland')}${context.area('shippingAddress','Straat, huisnummer, postcode en plaats',info.shipping.address)}</div></section><section class="form-section"><h3>Factuuradres</h3>${context.area('billingAddress','Afwijkend factuuradres (optioneel)',billingInput)}<p class="form-help">Leeg laten = automatisch het afleveradres gebruiken.${single?' Deze keuze geldt ook bij de gekoppelde order.':''}</p></section>${context.area('notes','Interne notities',c.notes)}`,async fd=>{
  const values=Object.fromEntries([...fd].filter(([key])=>!/^contact_(name|email|phone)_\d+$/.test(key)));for(const key of Object.keys(values))values[key]=values[key].trim();if(!values.company)throw context.formProblem('Vul een klantnaam in.',{field:'company'});
  const shippingChanged=values.shippingAddress!==(info.shipping.address||'')||values.shippingRecipient!==(info.shipping.recipient||'')||values.shippingCountry!==(info.shipping.country||c.country||'Nederland');
  const contacts=(c.contacts||[]).map((person,index)=>({...person,name:String(fd.get('contact_name_'+index)||'').trim(),email:String(fd.get('contact_email_'+index)||'').trim().toLowerCase(),phone:String(fd.get('contact_phone_'+index)||'').trim()}));
  if(contacts.some(person=>!person.name))throw context.formProblem('Vul de naam van iedere extra contactpersoon in.');
  const form=context.$('#dialog form'),message='Klant bijgewerkt'+(single?' · gekoppelde order bijgewerkt':'');
  await context.mergeStoredState(next=>{
   const current=next.customers.find(client=>client.id===id),orders=next.orders.filter(o=>o.customerId===id),linked=single?orders.find(o=>o.id===single.id):null;
   if(JSON.stringify(current)!==customerBasis||orders.map(o=>o.id).sort().join(',')!==orderIds||JSON.stringify(linked)!==singleBasis)throw Error('Deze klant of gekoppelde order is intussen gewijzigd. Je invoer blijft staan; open de bewerking opnieuw met de actuele gegevens.');
   Object.assign(current,values);if(current.contacts)current.contacts=contacts;context.formRecordProvenance(form,current);
   if(linked){
    if(shippingChanged)linked.delivery={source:'custom',address:values.shippingAddress,recipient:values.shippingRecipient,country:values.shippingCountry,instructions:linked.delivery?.instructions||''};
    if(values.billingAddress!==(billingInput||''))linked.billing=values.billingAddress?{source:'custom',address:values.billingAddress,recipient:values.company,country:values.country}:{source:'delivery'};
    if(linked.delivery?.source==='custom')Object.assign(current,{shippingAddress:linked.delivery.address||'',shippingRecipient:linked.delivery.recipient||'',shippingCountry:linked.delivery.country||'',shippingAddressOrderId:linked.id});
   }
   next.activities.unshift({id:context.uid(),message,time:new Date().toISOString()});
  });
  if(single&&shippingChanged)context.deliveryDrafts.delete(single.id);
  context.render();context.toast(message);
 });
 context.markFormSources(context.$('#dialog form'),context.customerWithSources(context.state,c,context.company.id));if(!c.country)context.markFormSources(context.$('#dialog form'),context.markProvenance({country:'Nederland'},['country'],'default'));
}
return {renderCustomersList,customerOrders,customerAddressInfo,syncSingleOrderDelivery,customerAddressSummary,customerAddresses,renderCustomer,selectCustomerTab,customerForm};
}
