import {createPacksTracking} from './packs-tracking.js?v=packs-workflow-20261102';
import {supplierLogisticsMail} from '../../shared/supplier-logistics-mail.js?v=packs-worker-v3-20261102';
import {settleSupplierWorkspace} from './supplier-inline.js?v=packs-workflow-20261102';
import {clearSupplierWorkspaceProblem,showSupplierWorkspaceProblem} from './supplier-workspace-status.js?v=packs-workflow-20261102';
import {recordFeedbackActionError} from '../feedback-diagnostics.js?v=feedback30-batch1';
import {supplierOrderTextInfo} from '../../shared/supplier-order-text.js?v=supplier-workflow-ui-20261101';
import {createPacksFinalReview} from './packs-final-review.js?v=packs-worker-v3-20261102';
import {createSupplierTrial} from './supplier-trial.js?v=packs-worker-v3-20261102';
import {kunststofbaas,supplierFulfilmentAvailable,supplierFulfilmentInfo,confirmSupplierReference,recordSupplierOrder,supplierMailTag,assertSupplierMail,supplierOwnOrderReference,supplierOrderDescription,supplierLabelMetadata} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {validateBusinessState} from '../../shared/state-validation.js?v=packs-workflow-20261102';
import {openMailAttachment} from '../mail/attachments.js';
import {createPacksPreparation} from './packs-preparation.js?v=packs-workflow-20261102';

export function createSupplierFulfilment(context){
 const esc=value=>context.esc(value);
 const packs=createPacksPreparation(context,{back:open,addLabel:labelForm});
 const trial=createSupplierTrial(context),tracking=createPacksTracking(context);
 const finalReview=createPacksFinalReview(context,{back:open,prepare:id=>packs.open(id),trial:id=>trial.open(id)});
 function infoFor(id){const order=context.order(id);return {order,info:supplierFulfilmentInfo(context.state,order,context.company.id)};}
 function showSaved(id){
  let refreshError;try{context.render();}catch(error){refreshError=error;}
  try{open(id);}catch(error){context.toast('De wijziging is bewaard. Het besteloverzicht kon niet openen: '+error.message);return;}
  if(refreshError)context.toast('De wijziging is bewaard. De achterliggende pagina kon niet verversen: '+refreshError.message);
 }
 function step(info){return !info.current?'order':!info.label?'packs':!info.packing?'packing':context.runtime.packsTrialOnly?'trial':info.mail?'mail-existing':'mail';}
 const actionLabels={order:'Bestelling vastleggen',packs:'PACKS voorbereiden',label:'PACKS-label toevoegen',packing:'Pakbon maken',trial:'Proefmail voorbereiden',mail:'Mail voorbereiden','mail-existing':'Mail bekijken'};
 function markup(order){
  if(!supplierFulfilmentAvailable(context.state,order,context.company.id))return '';
  const info=supplierFulfilmentInfo(context.state,order,context.company.id),state=step(info);
  return `<section class="order-surface supplier-fulfilment-summary"><div><strong>Kunststofbaas</strong><p>${info.reference?'Bestelnummer '+esc(info.reference):'Bestelnummer nog invullen'} · ${info.workflow&&!info.current?'Bestelling opnieuw controleren':info.current?'Bestelling vastgelegd':'Nog niet als geplaatst bevestigd'}</p></div><a class="button" href="#orders/${esc(order.id)}/supplier">Bestelnummer & verzending →</a></section>`;
 }
 function actionsMarkup(order){
  if(!supplierFulfilmentAvailable(context.state,order,context.company.id))return '';
  const info=supplierFulfilmentInfo(context.state,order,context.company.id);if(!info.reference)return '<section class="order-surface"><h2>3. Pakbon, label & mail</h2><p>Vul eerst het bestelnummer van Kunststofbaas in bij stap 1.</p></section>';
  const ready=!!info.packing&&!!info.label,trialOnly=context.runtime.packsTrialOnly||info.label?.packsLabelBundle?.environment==='test',next=!info.packing?'packing':!info.label?'booking':trialOnly?'trial':'mail';
  const op=(action,label)=>`<button type="button" ${next===action?'class="primary" data-supplier-main-action':''} data-supplier-operation="${action}" data-supplier-order="${esc(order.id)}">${label}</button>`;
  return `<section class="order-surface"><h2>3. Pakbon, label & mail</h2><div class="actions">${info.packing?op('packing-view','Pakbon bekijken'):op('packing','Pakbon maken')}${info.packing?(info.label?op('label-view','Label bekijken'):op('booking','PACKS-label aanmaken')):''}${ready?op(trialOnly?'trial':'mail',trialOnly?(info.trialMail?'Proefmail bekijken':'Proefmail voorbereiden'):info.mail?'Mail bekijken':'Mail naar Kunststofbaas'):''}</div><div class="actions" aria-label="Documenten downloaden en verzendgegevens">${info.packing?op('packing','Nieuwe pakbon maken')+op('packing-download','Pakbon downloaden'):''}${info.label?op('label-download','Label downloaden'):''}${info.label?.packsLabelBundle?op('tracking','Track & Trace'):''}${op('prepare','Pakketgegevens invullen')}${op('label','Bestaand PACKS-label toevoegen')}${ready&&!trialOnly?op('trial',info.trialMail?'Proefmail bekijken':'Proefmail voorbereiden'):''}${ready&&info.trialMail?op('trial-new','Nieuwe proefmail / ander controleadres'):''}</div></section>`;
 }
 async function ensureCurrent(id){
  const {info}=infoFor(id);if(info.current)return;
  if(!info.data.recipient||!info.data.address||!info.data.country)throw Error('Vul bovenaan eerst naam, afleveradres en land in.');
  await context.mergeStoredState(next=>{confirmSupplierReference(next,id,info.signature,context.company.id);validateBusinessState(next);});
 }

 function orderText(data,reference='',description=supplierOrderDescription(data,reference)){return [description,...(data.customerReference&&data.customerReference!==data.number?['Aanvullende bestaande klantreferentie: '+data.customerReference]:[]),data.phone?'Telefoon ontvanger: '+data.phone:'',data.email?'E-mail ontvanger: '+data.email:''].filter(Boolean).join('\n');}
 function orderForm(id,{toTab=false}={}){
  const {order,info}=infoFor(id),data=info.data,description=supplierOrderTextInfo(context.state,order,data);if(!description.current)throw Error('Je eigen bestelbeschrijving hoort bij eerdere ordergegevens. Open de Kunststofbaas-tab en bevestig de beschrijving opnieuw.');
  context.openForm('Bestellen bij Kunststofbaas',`<p>Neem de gecontroleerde producten en het afleveradres over bij Kunststofbaas. Vul daarna het bestelnummer van hun bevestiging in.</p>${info.workflow&&!info.current?'<p class="notice danger">De producten, klant of aflevergegevens zijn gewijzigd sinds de vastgelegde bestelling. Controleer ook de bestelling bij Kunststofbaas. Eerdere bijlagen blijven bewaard.</p>':''}${order.fulfilmentMethod&&order.fulfilmentMethod!=='shipping'?'<p class="notice danger">De huidige leverafspraak is geen verzending. Controleer de leverwijze bij de order vóór je een verzendlabel aanmaakt.</p>':''}<section class="form-section"><h3>Beschrijving voor Kunststofbaas</h3><label>Onze orderreferentie<input name="ownOrderReference" readonly value="${esc(supplierOwnOrderReference(data))}"></label><label>Beschrijving om mee te sturen<textarea name="supplierOrderDescription" rows="6" readonly>${esc(description.text)}</textarea></label><div class="actions"><button type="button" data-copy-supplier-description>Beschrijving kopiëren</button><a class="button" target="_blank" rel="noopener noreferrer" href="${kunststofbaas.orderUrl}">Kunststofbaas openen ↗</a></div><p class="form-help">Je past deze beschrijving of de standaard aan via de Kunststofbaas-tab → Beschrijving voor deze order aanpassen / Meer → Standaardtekst aanpassen. Plak deze beschrijving bij de opmerkingen of omschrijving van je bestelling op Kunststofbaas. Gebruik onze orderreferentie ook in hun referentieveld als dat beschikbaar is. Zo kunnen zij de bestelling aan ons ordernummer koppelen.</p><details class="form-details"><summary>Alle producten en aflevergegevens</summary><label>Volledige bestelgegevens<textarea name="orderInformation" rows="12" readonly>${esc(orderText(data,info.reference,description.text))}</textarea></label><button type="button" data-copy-supplier-order>Alle bestelgegevens kopiëren</button></details><p class="form-help">Maten zijn millimeters. Controleer vorm, gaten, uitsparingen en andere bewerkingen in de gekoppelde berekening. Deze knop plaatst of betaalt zelf geen bestelling.</p>${order.items.some(item=>item.costCalculation||item.costQuoteLink)?'<details class="form-details"><summary>Berekeningen en bewerkingen bekijken</summary><div class="actions">'+order.items.filter(item=>item.costCalculation||item.costQuoteLink).map(item=>'<a class="button" target="_blank" rel="noopener noreferrer" href="'+esc(context.toolUrl(context.company,order,item,context.runtime))+'">'+esc(item.description)+' ↗</a>').join('')+'</div></details>':''}</section><section class="form-section"><h3>Bestelling geplaatst</h3><div class="fields">${context.field('supplierReference','Bestelnummer van Kunststofbaas',info.reference,'text','required maxlength="200"')}${context.field('supplierOrderedOn','Werkelijke besteldatum',order.supplierOrderedDate||context.today(),'date',`required max="${context.today()}"`)}${context.field('supplierEmail','Mailadres van Kunststofbaas',info.workflow?.recipientEmail||kunststofbaas.email,'email','required maxlength="200"')}</div><p class="form-help">Kunststofbaas vermeldt info@kunststofbaas.nl als contactadres. Controleer het adres voor deze bestelling; het wordt afzonderlijk van het klantadres bewaard.</p><label class="check-row"><input type="checkbox" name="shipDirectly" required>Deze bestelling rechtstreeks naar de klant verzenden; dit wordt de leverwijze bij deze order.</label><label class="check-row"><input type="checkbox" name="confirmSupplierOrder" required>Ik heb deze bestelling daadwerkelijk geplaatst en het nummer, de producten en het leveranciersadres gecontroleerd.</label></section>`,async fd=>{
   await context.mergeStoredState(next=>{recordSupplierOrder(next,id,{reference:String(fd.get('supplierReference')||''),orderedOn:String(fd.get('supplierOrderedOn')||''),recipientEmail:String(fd.get('supplierEmail')||''),confirmed:fd.has('confirmSupplierOrder'),shipDirectly:fd.has('shipDirectly')},info.signature,context.company.id,{today:context.today()});next.activities.unshift({id:context.uid(),message:'Kunststofbaas-bestelling vastgelegd bij order #'+order.number,time:new Date().toISOString()});validateBusinessState(next);});
   context.toast('Bestelnummer opgeslagen · nog geen label of mail verstuurd');
  },{afterSave:()=>toTab?context.render():showSaved(id)});
  const form=context.$('#dialog form');form.querySelector('[type=submit]').textContent='Bestelling bewaren & verder';
  for(const [selector,name,message] of [['[data-copy-supplier-description]','supplierOrderDescription','Beschrijving met ons ordernummer gekopieerd'],['[data-copy-supplier-order]','orderInformation','Alle bestelgegevens gekopieerd']])form.querySelector(selector).onclick=async()=>{
   try{const latest=await context.store('state','readonly',s=>s.get('main')),currentOrder=latest?.orders.find(o=>o.id===id);if(!form.isConnected||context.$('#dialog form')!==form)return;const current=supplierFulfilmentInfo(latest,currentOrder,context.company.id);if(supplierOrderTextInfo(latest,currentOrder,current.data).text!==description.text||current.signature!==info.signature)throw Error('De ordergegevens of beschrijving zijn intussen gewijzigd. Je invoer blijft staan; open Bestellen opnieuw voor de actuele beschrijving.');}
   catch(error){context.showFormProblem(form,error,{toast:context.toast});return;}
   if(description.reviewRequired&&!description.custom){context.showFormProblem(form,Error('Gegevens ontbreken. Vul de order aan of pas eerst de beschrijving aan bij de Kunststofbaas-tab.'),{toast:context.toast});return;}
   const input=form.elements.namedItem(name);
   try{await navigator.clipboard.writeText(input.value);context.toast(message);}
   catch{input.closest('details')?.setAttribute('open','');input.focus();input.select();context.toast('Selectie klaar · kopieer met je toetsenbord');}
  };
 }
 async function saveLabel(id,expected,blob){
  if(!blob?.size||blob.size>4000000||!/\.pdf$/i.test(blob.name)||blob.type&&blob.type!=='application/pdf')throw context.formProblem('Kies het PDF-label uit PACKS, maximaal 4 MB.',{field:'packsLabel'});
  const header=new TextDecoder().decode(await blob.slice(0,5).arrayBuffer());if(header!=='%PDF-')throw context.formProblem('Dit bestand is geen PDF-label.',{field:'packsLabel'});
  const fileId=context.uid();let next;
  context.beginLocalStateChange();
  await new Promise((resolve,reject)=>{
   const tx=context.db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),r=ss.get('main');
   r.onsuccess=()=>{try{
    next=r.result;const order=next?.orders.find(o=>o.id===id),info=supplierFulfilmentInfo(next,order,context.company.id);
    if(info.signature!==expected||!info.current)throw Error('De bestelling is gewijzigd. Je gekozen bestand blijft staan; open Bestelling opnieuw.');
    const shippingLabel=supplierLabelMetadata(info);
    next.documents.push({id:fileId,ownerId:id,category:'other',name:'PACKS_'+info.reference.replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,150)+'_'+fileId.slice(0,8)+'.pdf',type:'application/pdf',size:blob.size,date:context.today(),createdAt:new Date().toISOString(),shippingLabel});
    order.supplierFulfilment.labelDocumentId=fileId;validateBusinessState(next);tx.objectStore('files').put({id:fileId,blob:new Blob([blob],{type:'application/pdf'})});ss.put(next,'main');
   }catch(error){tx.abort();reject(error);}};
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Label bewaren afgebroken.'));
  });context.state=next;try{context.notifyDataChanged();}catch(error){context.toast('PACKS-label bewaard. Andere schermen konden niet worden bijgewerkt: '+error.message);}
 }
 function labelForm(id,{toTab=false}={}){
  const {order,info}=infoFor(id);if(!info.current)throw Error('Leg eerst de actuele bestelling vast.');
  if(order.fulfilmentMethod!=='shipping')throw Error('Kies eerst Verzenden als leverwijze bij Adres & levering.');
  supplierLabelMetadata(info);
  if(!info.data.recipient||!info.data.address||!info.data.country)throw Error('Vul eerst het volledige afleveradres en land bij de order in.');
  context.openForm('PACKS-label bij deze bestelling',`<p>Bestelnummer <strong>${esc(info.reference)}</strong> · aflevering aan ${esc(info.data.recipient)}</p><p class="notes">${esc(info.data.address)}\n${esc(info.data.country)}</p><p>Maak het label in je PACKS-portaal met Kunststofbaas als afhaallocatie en de klant als ontvanger. De zending gaat mee met de bestaande dagelijkse ronde; bestel geen extra Pickup. Controleer verpakking, gewicht, afmetingen en afhaaldatum daar.</p><p class="notice">Heb je het label al in het PACKS-portaal gemaakt? Bewaar hier die originele PDF. Een label toevoegen maakt geen nieuwe zending.</p>${info.workflow.packsPreparation?'<p class="notice">Er is een PACKS-voorbereiding bij deze order. Vergelijk dit echte label ook met het aantal pakketten, de verpakte maten, het gewicht en de drie adressen in die voorbereiding. Een wijziging vraagt opnieuw labelcontrole; oude bestanden blijven bewaard.</p>':''}<label>Verzendlabel (PDF)<input type="file" name="packsLabel" accept="application/pdf,.pdf" required></label><label class="check-row"><input type="checkbox" name="confirmLabel" required>Ik heb gecontroleerd dat dit PACKS-label voor dit bestelnummer, deze klant en dit afleveradres is, en bij een bewaarde voorbereiding ook bij de gecontroleerde pakketgegevens en afspraken past.</label>${info.label?'<p class="form-help">Het vorige label blijft bij de documenten bewaard. Dit annuleert geen bestaande zending bij PACKS.</p>':''}`,async fd=>{if(!fd.has('confirmLabel'))throw context.formProblem('Controleer en bevestig het label.',{field:'confirmLabel'});await saveLabel(id,info.signature,fd.get('packsLabel'));context.toast('PACKS-label bewaard · nog geen verzending geregistreerd');},{afterSave:()=>toTab?context.render():showSaved(id)});
  context.$('#dialog [type=submit]').textContent='Label bewaren & verder';
 }
 function packingForm(id,{toTab=false}={}){
  const {info}=infoFor(id);if(!info.current)throw Error('Leg eerst de actuele bestelling vast.');
  context.packingSlipForm(id,{}, {supplierFulfilment:true,download:false,afterSave:()=>toTab?context.render():showSaved(id),afterCancel:()=>{if(toTab)return;try{open(id);}catch(error){context.toast(error.message);}}});
 }
 async function prepareMail(id){
  const {order,info}=infoFor(id);if(!info.current||!info.label||!info.packing)throw Error('Bewaar eerst de actuele bestelling, het PACKS-label en de pakbon.');
  if(info.mail){if(['accepted','pending','uncertain'].includes(info.mail.status)){context.$('#dialog').close();location.hash='orders/'+id+'/mail';return;}await context.emailDraftForm(id,'','',info.mail.id);return;}
  const seed={newMail:true,funnelPurpose:'',templateId:'',to:info.workflow.recipientEmail,...supplierLogisticsMail(info),documentId:info.packing.id,paymentLinkId:'',attachmentIds:[info.label.id],supplierFulfilmentMail:supplierMailTag(info)};
  assertSupplierMail(context.state,id,seed,context.company.id);
  await context.emailDraftForm(id,'','','',seed);
 }
 function open(id){
  const {order,info}=infoFor(id),currentStep=step(info);
  if(currentStep==='order'){orderForm(id);return;}
  const label=info.label,packing=info.packing,mail=info.mail,trialMail=info.trialMail;
  context.openForm('Kunststofbaas · '+esc(info.reference),`<dl class="detail"><dt>Bestelnummer Kunststofbaas</dt><dd>${esc(info.reference)}</dd><dt>Onze orderreferentie</dt><dd>${esc(supplierOwnOrderReference(info.data))}</dd><dt>Leveranciersmail</dt><dd>${esc(info.workflow.recipientEmail)}</dd><dt>Aflevering</dt><dd class="notes">${esc(info.data.recipient)}\n${esc(info.data.address)}\n${esc(info.data.country)}</dd><dt>PACKS-label</dt><dd>${label?esc(label.name):'Nog toevoegen'}</dd><dt>Pakbon met leveranciersnummer</dt><dd>${packing?esc(packing.generated.number):'Nog maken'}</dd><dt>Mail</dt><dd>${mail?.status==='accepted'?'Aangeboden aan leverancier · aflevering niet bevestigd':mail?.status==='uncertain'?'Onzeker resultaat · eerst SMTP2GO Activity controleren':mail?'Concept bewaard · nog niet verstuurd':'Nog niet voorbereid'}</dd><dt>Proefmail</dt><dd>${trialMail?esc(trialMail.to)+' · '+(trialMail.status==='accepted'?'aangeboden voor jouw controle; geen leveranciersopdracht':trialMail.status==='pending'||trialMail.status==='uncertain'?'onzeker resultaat; controleer het verzendlog':'concept; nog niet verstuurd'):'Nog niet voorbereid'}</dd></dl>${order.fulfilmentMethod!=='shipping'?'<p class="notice">Kies eerst Verzenden bij Adres & levering voor het PACKS-label.</p>':''}<details class="form-details"><summary>Meer</summary><div class="actions"><button type="button" data-supplier-edit>Bestelgegevens bekijken / aanpassen</button><button type="button" data-supplier-final-review>Eindcontrole & lokaal / online vergelijken</button>${currentStep!=='trial'?'<button type="button" data-supplier-trial '+(label&&packing?'':'disabled')+'>Proefmail met label en pakbon</button>':''}${label?'<button type="button" data-supplier-label-view>Label bekijken</button><button type="button" data-supplier-label>Ander PACKS-label toevoegen</button>':''}${packing?'<button type="button" data-supplier-packing>Nieuwe pakbon maken</button>':''}<a href="#orders/${esc(id)}/documents" data-supplier-documents>Alle documenten</a></div>${!label||!packing?'<p class="form-help">De proefmail wordt beschikbaar zodra het actuele label en de pakbon zijn toegevoegd. Hij maakt geen label of zending aan.</p>':''}</details><p class="form-help">De pakbon bevat ook het bestelnummer van Kunststofbaas. De mail krijgt de pakbon-PDF en het PACKS-label als bijlagen. Alleen de uiteindelijke knop Versturen biedt de mail aan; dat markeert de klantorder niet als verzonden of geleverd.</p>`,async()=>{}, {trackChanges:false});
  const form=context.$('#dialog form');form.querySelector('[type=submit]').textContent=actionLabels[currentStep];
  form.onsubmit=event=>{event.preventDefault();run(currentStep,id,form);};
  const action=(selector,fn)=>{const button=form.querySelector(selector);if(button)button.onclick=()=>run(fn,id,form);};
  // The existing manual label route remains available while provider booking is off.
  const more=form.querySelector('.form-details .actions');
  const prepare=document.createElement('button');prepare.type='button';prepare.dataset.supplierPacks='';prepare.textContent='PACKS-voorbereiding bekijken / aanpassen';if(currentStep!=='packs')more.append(prepare);
  if(!label){const manual=document.createElement('button');manual.type='button';manual.dataset.supplierLabel='';manual.textContent='Echt PACKS-label toevoegen';more.append(manual);}
  action('[data-supplier-final-review]',()=>finalReview.open(id));
  action('[data-supplier-trial]',()=>trial.open(id));action('[data-supplier-edit]','order');action('[data-supplier-label]','label');action('[data-supplier-packing]','packing');action('[data-supplier-packs]','packs');
  action('[data-supplier-label-view]',async()=>{const stored=await context.store('files','readonly',s=>s.get(label.id));if(!stored?.blob)throw Error('Het labelbestand ontbreekt. Voeg het PDF-label opnieuw toe.');openMailAttachment(stored.blob,label.name);});
  const documents=form.querySelector('[data-supplier-documents]');documents.onclick=()=>context.$('#dialog').close();
 }
 async function run(action,id,form){
  if(form.inert)return;form.inert=true;form.setAttribute('aria-busy','true');
  try{if(typeof action==='function')await action();else if(action==='order')orderForm(id);else if(action==='packs')packs.review(id);else if(action==='label')labelForm(id);else if(action==='packing')packingForm(id);else if(action==='trial')await trial.open(id);else await prepareMail(id);}
  catch(error){form.inert=false;form.removeAttribute('aria-busy');context.showFormProblem(form,error,{toast:context.toast});}
  finally{form.inert=false;form.removeAttribute('aria-busy');}
 }
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-supplier-operation]');if(!button||button.disabled)return;const owner=button.closest('.supplier-order-workspace'),action=button.dataset.supplierOperation,id=button.dataset.supplierOrder;if(owner?.dataset.supplierActionBusy)return;if(owner)owner.dataset.supplierActionBusy='true';button.disabled=true;button.setAttribute('aria-busy','true');
  const actions=owner?.querySelector('[data-supplier-shipping-actions]'),progress=owner?.querySelector('[data-supplier-action-progress]');if(actions){actions.inert=true;actions.setAttribute('aria-busy','true');}if(progress)progress.hidden=false;
  clearSupplierWorkspaceProblem(owner,'shipping');try{
   if(document.querySelector('dialog[open]'))throw Error('Rond eerst je geopende formulier af.');
   const viewing=['packing-view','label-view','packing-download','label-download'].includes(action);
   // Looking at an existing original must not accept or discard invoice/address edits.
   if(!viewing)await settleSupplierWorkspace(button);if(!owner?.isConnected)return;
   const latest=await context.store('state','readonly',s=>s.get('main'));if(!owner?.isConnected)return;
   if(document.querySelector('dialog[open]'))throw Error('Rond eerst je geopende formulier af.');
   const order=latest?.orders.find(o=>o.id===id),currentInfo=supplierFulfilmentInfo(latest,order,context.company.id);
   if(viewing){const file=action.startsWith('packing')?currentInfo.packing:currentInfo.label;if(!file)throw Error('Dit bestand is niet meer actueel.');const stored=await context.store('files','readonly',s=>s.get(file.id));if(!owner.isConnected)return;if(!stored?.blob)throw Error('Het bestand ontbreekt. Open Documenten om dit te herstellen.');if(action.endsWith('download')){if(await context.downloadBlob(stored.blob,file.name)===false)throw Error('Download niet gestart. Probeer opnieuw of kies Bekijken.');}else openMailAttachment(stored.blob,file.name);return;}
   // Some browsers keep focus in a clean text field after a button click.
   // The workspace has just settled its actual edits; focus alone is no draft.
   const focused=document.activeElement,focusedForm=focused?.form;if(owner?.contains(focused)&&focused.matches('input,textarea,select')&&focusedForm&&focusedForm.dataset.unsavedEdit!=='true'&&focusedForm.dataset.pickingFile!=='true'&&focusedForm.getAttribute('aria-busy')!=='true'&&!focusedForm.inert)focused.blur();
   if(context.hasActiveFormEdits(document))throw Error('Bewaar of rond eerst je begonnen invoer af; die is behouden.');
   context.state=latest;
   if(['packing','label','prepare','booking'].includes(action))await ensureCurrent(id);
   if(action==='order')orderForm(id,{toTab:true});else if(action==='packing')packingForm(id,{toTab:true});else if(action==='label')labelForm(id,{toTab:true});else if(action==='prepare')packs.open(id);else if(action==='booking'){const info=infoFor(id).info,preparation=info.workflow.packsPreparation;if(!preparation||preparation.basis!==info.basis||preparation.reference!==info.reference)packs.open(id);else packs.book(id);}else if(action==='tracking')tracking.open(id);else if(action==='trial')await trial.open(id);else if(action==='trial-new')await trial.open(id,{newTrial:true});else if(action==='mail')await prepareMail(id);else throw Error('Onbekende leveranciersactie.');
  }catch(error){showSupplierWorkspaceProblem(owner,error,'shipping');recordFeedbackActionError(Error('Kunststofbaas-vervolgstap '+action+' kon niet openen.'),'orders/supplier-fulfilment.js');context.toast(error.message);}finally{button.disabled=false;button.removeAttribute('aria-busy');if(actions){actions.inert=false;actions.removeAttribute('aria-busy');}if(progress)progress.hidden=true;if(owner)delete owner.dataset.supplierActionBusy;}
 });
 document.addEventListener('click',async event=>{
  const review=event.target.closest('[data-supplier-final-review-order]'),button=review||event.target.closest('[data-supplier-fulfilment]');if(!button||button.disabled)return;
  try{if(document.querySelector('dialog[open]'))throw Error('Rond eerst je geopende formulier af.');if(review){button.disabled=true;button.setAttribute('aria-busy','true');await finalReview.open(button.dataset.supplierFinalReviewOrder);}else open(button.dataset.supplierFulfilment);}
  catch(error){context.toast(error.message);}
  finally{if(review){button.disabled=false;button.removeAttribute('aria-busy');}}
 });
 return {markup,open,actionsMarkup};
}
