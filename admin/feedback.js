import {invoiceImportReport} from '../shared/invoice-import-feedback.js?v=supplier-batches35-20261101';
import {feedbackTarget as reportTarget,feedbackLabel as labelFor,feedbackSelector as selectorFor} from './feedback-target.js?v=feedback30-batch1';
import {saveLocalFeedback} from './feedback-save.js?v=feedback30-batch1';
import {installFeedbackDiagnostics} from './feedback-diagnostics.js?v=feedback30-batch1';
import {feedbackBuildLabels,feedbackDeliveryLabels} from '../shared/feedback-development.js?v=feedback-five-20261029';
import {installViewport} from './workspace/viewport.js?v=feedback29-restpunten';
import {saveFeedbackDraft,readFeedbackDraft,clearFeedbackDraft} from './offline/review-store.js';
import {isReviewMode} from './offline/review.js';
import {pendingFeedback,reviewReports,addOfflineFeedback,syncOfflineFeedback,appendFeedbackReport} from './offline/feedback-outbox.js';
import {dictationMarkup,installFieldDictation} from './field-dictation.js';
import {openFeedbackDatabase,storageRuntime} from './cloud-storage.js?v=crm-code-review-20261027';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kinds={bug:'Werkt niet',improvement:'Verbetering',unnecessary:'Overbodig'};
const statusLabels={open:'Open',resolved:'Afgehandeld'};
const plain=(value,max=250)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);

// Separate from business data: reporting a problem must never replace an active order edit.
export function installFeedback({downloadBlob,today,toast,launcherHost=null,contextOverride=null}){
 installViewport();
 const database=openFeedbackDatabase();database.catch(()=>{});
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('crm-feedback-changes-'+location.host):null;
 let fileBacked=false,migration,runtime={mode:'cloud',companyId:''},speech=null;
 const ready=storageRuntime().then(r=>{runtime=r;fileBacked=r.mode!=='cloud';});ready.catch(()=>{});
 let picking=false,hovered=null,toolbar=null,openingReport=null,filter='open',buildFilter='all',batchFilter='all',query='',refreshVersion=0,returnFocus=null,pageRecords=[];
 const diagnostics=installFeedbackDiagnostics({picking:()=>picking,selectorFor,labelFor});
 const pendingStatuses=new Set();
 const statusBasis=report=>JSON.stringify([report.status,report.updatedAt||report.createdAt,report.resolution||'']);
 function selectedRecords(records){const words=query.trim().toLocaleLowerCase('nl-NL').split(/\s+/).filter(Boolean);return records.filter(r=>(filter==='all'||r.status===filter)&&(buildFilter==='all'||(buildFilter==='untracked'?!r.development:r.development?.status===buildFilter))&&(batchFilter==='all'||String(r.development?.batch)===batchFilter)&&words.every(word=>[r.id,r.message,r.details,r.resolution,r.development?.note,r.context?.page,r.context?.element,r.context?.section].filter(Boolean).join(' ').toLocaleLowerCase('nl-NL').includes(word)));}
 function showPageError(message){const error=document.querySelector('[data-feedback-page-error]');if(error){error.textContent=message;error.hidden=!message;}}
 const dialog=document.createElement('dialog');dialog.id='feedback-dialog';dialog.setAttribute('aria-label','Feedback melden');document.body.append(dialog);
 const launcher=document.createElement('button');launcher.type='button';launcher.className='feedback-launcher';launcher.dataset.feedbackAction='start';launcher.textContent='Feedback melden';(launcherHost||document.body).append(launcher);

 // Own the button reference: replacing the shell must never destroy our only launcher.
 const mobile=window.matchMedia?.('(max-width:760px)');let mountedRoot=null,layoutObserver=null;
 function placeLauncher(){
  if(launcherHost)return;
  const assistantSlot=mobile?.matches&&document.body.classList.contains('assistant-open')?[...document.querySelectorAll('[data-feedback-assistant-slot]')].find(slot=>!slot.closest('[hidden]')):null;
  const shellSlot=mountedRoot?.isConnected?mountedRoot.querySelector(mobile?.matches?'[data-feedback-mobile-launcher-slot]':'[data-ai-feedback-slot]'):null;
  const target=assistantSlot||shellSlot||document.body;
  launcher.hidden=false;if(launcher.parentElement!==target)target.append(launcher);
 }
 function beforeRender(){if(!launcherHost&&launcher.parentElement!==document.body)document.body.append(launcher);}
 function mount(root){
  if(launcherHost)return;
  if(mountedRoot!==root){layoutObserver?.disconnect();mountedRoot=root;layoutObserver=new MutationObserver(placeLauncher);layoutObserver.observe(root,{childList:true});}
  placeLauncher();
 }
 if(!launcherHost){mobile?.addEventListener?.('change',placeLauncher);window.addEventListener('crm-assistant-visibility',placeLauncher);window.addEventListener('focus',placeLauncher);}

 async function legacyList(){
  const db=await database;
  return new Promise((resolve,reject)=>{const tx=db.transaction('reports'),r=tx.objectStore('reports').getAll();let records=[];r.onsuccess=()=>records=r.result;tx.oncomplete=()=>resolve(records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));tx.onerror=()=>reject(tx.error);});
 }
 async function request(action,data){
  const response=await fetch('/__local/assistant/feedback-'+action,{cache:'no-store',...(data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})});
  const result=await response.json().catch(()=>({error:'Feedbackdienst niet beschikbaar. Start beide CRM’s opnieuw.'}));
  if(!response.ok)throw Error(result.error||'Feedback verwerken lukt niet.');return result;
 }
 async function migrate(){
  await ready;if(!fileBacked)return;
  if(!migration){migration=(async()=>{const reports=await legacyList();if(reports.length)await request('import',{reports});})();migration.catch(()=>{migration=null;});}
  await migration;
 }
 async function list(){await ready;if(!fileBacked){if(runtime.offlineReview)return (await reviewReports(runtime)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));const records=await legacyList(),pending=await pendingFeedback(runtime);return [...records.filter(r=>!pending.some(e=>e.id===r.id)),...pending.map(e=>({...e.report,offlinePending:true}))].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}await migrate();return (await request('list')).reports.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
 async function changed(){try{channel?.postMessage('changed');}catch{}await refresh();}
 async function create(report){await ready;if(runtime.offlineReview){await addOfflineFeedback(report,runtime);await changed();return;}if(fileBacked){await migrate();await saveLocalFeedback(report,request);await changed();}else{await appendFeedbackReport(await database,report);await changed();}}
 async function setStatus(id,status){
  if(isReviewMode())throw Error('Afhandelen doe je weer online. Je offline feedback blijft bewaard.');
  const report=pageRecords.find(r=>r.id===id);if(!report||report.offlinePending)throw Error('Deze melding is niet beschikbaar om af te handelen. Werk de lijst bij.');
  const expected=statusBasis(report);
  await ready;
  if(fileBacked){const saved=await request('status',{id,status,expectedVersion:report.updatedAt||report.createdAt,resolution:report.resolution||''});if(saved?.id!==id||saved.status!==status)throw Error('De opgeslagen status kon niet worden bevestigd. Werk de lijst bij.');return saved;}
  let saved;await write((store,fail)=>{const r=store.get(id);r.onsuccess=()=>{
   if(!r.result||statusBasis(r.result)!==expected){fail(Error('Deze melding is intussen gewijzigd. Werk de lijst bij en beoordeel de actuele status.'));return;}
   saved={...r.result,status,updatedAt:new Date().toISOString()};store.put(saved);
  };},{refreshAfter:false});return saved;
 }
 async function write(mutate,{refreshAfter=true}={}){
  const db=await database;
  await new Promise((resolve,reject)=>{
   const tx=db.transaction('reports','readwrite');let failure;
   const fail=error=>{failure=error;tx.abort();};
   tx.oncomplete=resolve;tx.onerror=()=>reject(failure||tx.error);tx.onabort=()=>reject(failure||tx.error||Error('Feedback opslaan is afgebroken.'));
   try{mutate(tx.objectStore('reports'),fail);}catch(error){fail(error);}
  });
  try{channel?.postMessage('changed');}catch{}if(refreshAfter)await refresh();
 }
 async function replaceAll(records){
  validateReports(records);
  await ready;if(fileBacked){await migrate();await request('import',{reports:records});await changed();return;}
  await write(store=>{store.clear();records.forEach(r=>store.put(r));});
 }
 function stopPicking(){
  picking=false;hovered?.classList.remove('feedback-pick-highlight');hovered=null;toolbar?.remove();toolbar=null;document.body.classList.remove('feedback-picking');
 }
 function captureContext(target){
  const page=document.querySelector('main h1'),mainDialog=document.querySelector('#dialog[open]');
  const activeTab=document.querySelector('main [role="tab"][aria-selected="true"],main .order-tabs .active');
  const section=target?.closest('section,.panel,.item,.order-surface,.form-section');
  const route=location.hash||'#dashboard';
  return {route,url:location.pathname+route,page:plain(page?.textContent)||'CRM',tab:plain(activeTab?.textContent),dialog:plain(mainDialog?.querySelector('h2')?.textContent),
   element:target?labelFor(target):'Algemene melding over deze pagina',selector:target?selectorFor(target):'',section:plain(section?.querySelector('h2,h3')?.textContent),
   diagnostics:diagnostics(target),companyId:runtime.companyId,action:target?.getAttribute('data-action')||[...(target?.attributes||[])].find(a=>/^data-(?:payment-shipping|stock-action|feedback-action|funnel-action)$/.test(a.name))?.name||'',entityId:target?.getAttribute('data-id')||target?.getAttribute('data-order')||target?.getAttribute('data-order-id')||target?.getAttribute('data-payment-shipping')||target?.getAttribute('data-stock-id')||target?.getAttribute('data-item-id')||'',
   appVersion:document.querySelector('script[src*="app.js"]')?.getAttribute('src')||'',viewport:{width:innerWidth,height:innerHeight},scroll:{x:Math.round(scrollX),y:Math.round(scrollY)},...(contextOverride||{})};
 }
 function startPicking(){
  if(dialog.open||picking)return;
  returnFocus=document.activeElement;const owner=document.querySelector('#dialog[open]')||document.body;
  toolbar=document.createElement('div');toolbar.className='feedback-picker-toolbar';toolbar.dataset.feedbackUi='';toolbar.setAttribute('role','status');
  toolbar.innerHTML='<strong>Klik op de plek waarover je iets wilt melden.</strong><span>Je voert die knop daarmee niet uit. Esc = annuleren.</span><div><button type="button" data-feedback-action="pick-hovered" disabled>Gemarkeerde plek kiezen</button><button type="button" data-feedback-action="general">Algemene melding</button><button type="button" data-feedback-action="cancel-pick">Annuleren</button></div>';
  owner.append(toolbar);picking=true;document.body.classList.add('feedback-picking');toolbar.querySelector('[data-feedback-action=general]').focus();
 }
 function contextMarkup(context){
  return `<div class="feedback-context"><strong>${escapeHtml(context.page)}${context.tab?' · '+escapeHtml(context.tab):''}</strong>${(context.dialog||context.form)?`<span>Formulier: ${escapeHtml(context.dialog||context.form)}</span>`:''}<span>Plek: ${escapeHtml(context.element||context.targetText||'Algemene melding')}</span>${context.section?`<span>Onderdeel: ${escapeHtml(context.section)}</span>`:''}</div>`;
 }
 function closeDialog(){speech?.dispose();speech=null;dialog.close();if(returnFocus?.isConnected)returnFocus.focus();}
 dialog.addEventListener('close',()=>{speech?.dispose();speech=null;if(returnFocus?.isConnected)returnFocus.focus();});
 function openReport(context,existing=null,draft=null){
  if(dialog.open){toast('Je feedbackformulier staat al open. Je huidige invoer blijft staan.');return;}
  stopPicking();speech?.dispose();speech=null;window.dispatchEvent(new window.CustomEvent('crm-dictation-start',{detail:{owner:'feedback-open'}}));
  const editable=!existing;let submissionId=draft?.id||crypto.randomUUID(),submittedAt=draft?.createdAt||new Date().toISOString();
  dialog.innerHTML=`<form><div class="dialog-heading"><h2>${editable?'Feedback melden':'Feedback bekijken'}</h2></div><div class="dialog-body">${contextMarkup(context)}${existing?developmentMarkup(existing):''}${context.diagnostics?`<details class="form-details"><summary>Automatisch vastgelegde foutcontext</summary><p class="form-help">${context.diagnostics.actions?.length||0} recente klikacties en ${context.diagnostics.errors?.length||0} recente fouten. Geen veldinhoud, berekening of schermopname.</p><pre>${escapeHtml(JSON.stringify(context.diagnostics,null,2))}</pre></details>`:''}${editable?'<p class="form-help">De plek wordt automatisch bewaard. Omschrijf wat er gebeurt of wat je hier zou willen.</p>':''}<label>Soort melding<select name="kind" ${editable?'':'disabled'}>${Object.entries(kinds).map(([key,label])=>`<option value="${key}" ${(existing?.kind||draft?.kind||'improvement')===key?'selected':''}>${label}</option>`).join('')}</select></label><label>Wat merk je op?<textarea name="message" required maxlength="10000" rows="5" ${editable?'':'readonly'} placeholder="Bijvoorbeeld: deze knop doet niets, of ik wil hier meteen een nieuwe klant kunnen aanmaken.">${escapeHtml(existing?.message||draft?.message)}</textarea></label>${editable?`<details class="form-details"><summary>Extra uitleg (optioneel)</summary><label>Wat deed je vlak ervoor, en wat zou er moeten gebeuren?<textarea name="details" maxlength="10000" rows="3">${escapeHtml(draft?.details)}</textarea></label></details>`:existing.details?`<p class="feedback-message">${escapeHtml(existing.details)}</p>`:''}${editable&&!runtime.offlineReview?dictationMarkup():''}${editable&&runtime.offlineReview?'<p data-feedback-draft-status class="form-help" role="status">Je concept wordt tijdens typen op dit apparaat bewaard.</p>':''}<p class="form-help">${runtime.offlineReview?'Bewaard op dit apparaat. Zet je meldingen later online over via Feedback. Wis intussen geen browsergegevens.':fileBacked?'Bewaard in een vaste privémap op deze Mac. Nieuwe CRM-versies gebruiken dezelfde feedbacklijst; opnieuw meesturen is hier niet nodig.':'Bewaard in de online CRM-opslag. Download meldingen om ze lokaal voor ontwikkeling mee te nemen.'}</p></div><div class="feedback-save-status"><p class="feedback-error danger" role="alert"></p><div class="actions" data-feedback-recovery hidden><a href="#feedback" data-feedback-existing>Opgeslagen meldingen bekijken</a><button type="button" data-feedback-separate>Deze tekst als aparte melding bewaren</button></div></div><div class="dialog-footer actions"><button type="button" data-feedback-action="close">${editable?'Annuleren':'Sluiten'}</button>${editable?'<button type="submit" class="primary">Melding bewaren</button>':''}</div></form>`;
  let dirty=Boolean(draft?.message||draft?.details),busy=false,draftWrite=Promise.resolve(),draftSaved=true,draftVersion=0;const form=dialog.querySelector('form');
  if(editable&&runtime.offlineReview)form.addEventListener('input',()=>{draftSaved=false;const version=++draftVersion,fd=new FormData(form),saved={id:submissionId,createdAt:submittedAt,kind:fd.get('kind'),message:String(fd.get('message')||''),details:String(fd.get('details')||''),context};draftWrite=draftWrite.catch(()=>{}).then(()=>saveFeedbackDraft(saved));draftWrite.then(()=>{if(version!==draftVersion)return;draftSaved=true;form.querySelector('[data-feedback-draft-status]').textContent='Concept op dit apparaat bewaard.';}).catch(e=>form.querySelector('[data-feedback-draft-status]').textContent=e.message);});
  form.addEventListener('input',()=>dirty=true);form.addEventListener('change',()=>dirty=true);
  const mayClose=()=>!busy&&(!(dirty||speech?.busy)||(runtime.offlineReview&&draftSaved)||confirm('Je melding is nog niet bewaard. Wil je hem weggooien?'));
  dialog.oncancel=e=>{if(!mayClose())e.preventDefault();else{speech?.dispose();speech=null;}};
  form.querySelector('[data-feedback-action="close"]').onclick=()=>{if(mayClose())closeDialog();};
  form.onsubmit=async e=>{
   e.preventDefault();if(!editable||busy||speech?.busy)return;
   const fd=new FormData(form),message=String(fd.get('message')).trim(),kind=fd.get('kind');if(!message||!kinds[kind])return;
   busy=true;const submit=form.querySelector('[type="submit"]'),cancel=form.querySelector('[data-feedback-action="close"]');submit.disabled=true;cancel.disabled=true;submit.textContent='Melding bewaren…';
   form.inert=true;form.querySelector('[data-feedback-recovery]').hidden=true;
   try{await draftWrite;await create({id:submissionId,createdAt:submittedAt,status:'open',kind,message,details:String(fd.get('details')||'').trim(),context});let cleanupNotice='';if(runtime.offlineReview)try{await clearFeedbackDraft();}catch{cleanupNotice=' · het oude concept blijft staan; hetzelfde meldingsnummer voorkomt een dubbele melding';}dirty=false;closeDialog();toast((runtime.offlineReview?'Feedback op dit apparaat bewaard · nog niet online':'Feedback bewaard · terug te vinden bij Feedback')+cleanupNotice);}
   catch(error){form.querySelector('.feedback-error').textContent='Bewaren niet bevestigd: '+error.message;form.querySelector('[data-feedback-recovery]').hidden=error.code!=='feedback-submission-conflict';}
   finally{busy=false;submit.disabled=false;cancel.disabled=false;submit.textContent='Melding bewaren';form.inert=false;}
  };
  form.querySelector('[data-feedback-separate]').onclick=()=>{submissionId=crypto.randomUUID();submittedAt=new Date().toISOString();form.querySelector('[data-feedback-recovery]').hidden=true;form.querySelector('.feedback-error').textContent='Nieuw meldingsnummer klaargezet. Klik op Melding bewaren om deze tekst apart te bewaren.';dirty=true;form.dispatchEvent(new Event('input',{bubbles:true}));};
  form.querySelector('[data-feedback-existing]').onclick=()=>{if(mayClose())closeDialog();else return false;};
  if(editable&&!runtime.offlineReview)speech=installFieldDictation(form,{runtime,companyId:runtime.companyId,onBusy:active=>{const submit=form.querySelector('[type=submit]');submit.disabled=busy||active;}});
  dialog.showModal();(editable?form.elements.message:form.querySelector('button')).focus();
 }
 function developmentMarkup(report){
  const d=report.development;
  return `<p class="form-help">Melding-ID: <code>${escapeHtml(report.id)}</code></p>${d?`<p class="notice">Batch ${d.batch} · ${escapeHtml(feedbackBuildLabels[d.status]||'Nog beoordelen')} · ${escapeHtml(feedbackDeliveryLabels[d.delivery]||'Niet vastgelegd')}<br>${escapeHtml(d.note)}<br>Gebruikersstatus: ${escapeHtml(statusLabels[report.status])}</p>`:'<p class="form-help">Bouwvoortgang nog niet vastgelegd. Gebruikersstatus: '+escapeHtml(statusLabels[report.status])+'.</p>'}`;
 }
 function cardsMarkup(records){
  return records.map(r=>`<article class="feedback-card"><div class="feedback-card-heading"><strong>${escapeHtml(kinds[r.kind])}</strong><small>${escapeHtml(new Date(r.createdAt).toLocaleString('nl-NL'))} · ${escapeHtml(statusLabels[r.status])}${r.offlinePending?' · Nog niet online':''}</small></div>${developmentMarkup(r)}${contextMarkup(r.context)}<p class="feedback-message">${escapeHtml(r.message)}</p>${r.resolution?`<p class="form-help">Afhandeling: ${escapeHtml(r.resolution)}</p>`:''}<div class="actions"><button type="button" data-feedback-action="view" data-feedback-id="${escapeHtml(r.id)}">Details</button><a href="${escapeHtml(r.context.sourcePath==='/tools/costing-v2/index.html'?r.context.sourcePath+r.context.route:r.context.route)}">Naar deze pagina →</a><button type="button" ${runtime.offlineReview||r.offlinePending||pendingStatuses.has(r.id)?'disabled':''} data-feedback-action="status" data-feedback-id="${escapeHtml(r.id)}" data-feedback-status="${r.status==='open'?'resolved':'open'}">${pendingStatuses.has(r.id)?'Bewaren…':r.status==='open'?'Afgehandeld':'Heropenen'}</button></div></article>`).join('')||'<p class="empty">Geen meldingen in deze selectie. Pas de filters aan of wis je zoekopdracht.</p>';
 }
 function pageMarkup(){
  return `<div class="top"><div><h1>Feedback</h1><span class="muted" data-feedback-summary></span></div><div class="actions"><button type="button" class="primary" data-feedback-action="start">Feedback melden</button><button type="button" data-feedback-action="sync" hidden></button><details class="quiet-menu"><summary>Meer</summary><div><button type="button" data-feedback-action="export-open">Download alleen openstaande</button><button type="button" data-feedback-action="export">Download huidige selectie</button><button type="button" data-feedback-action="export-all">Download alles</button><button type="button" data-feedback-action="refresh">Lijst bijwerken</button></div></details></div></div><p class="notice">${runtime.offlineReview?'Feedback die je hier bewaart staat op dit apparaat, ook na herladen zonder internet. Terug met internet? Ga naar Terug online & feedback overzetten. Wis intussen geen browsergegevens.':fileBacked?'Deze lijst staat in een vaste privémap op deze Mac, apart van klanten en orders. Codex kan de meldingen daar terugvinden, ook na een code-update.':'Deze online lijst blijft bij je bedrijfsopslag. Download meldingen om ze voor lokale ontwikkeling mee te nemen.'}</p><p class="form-help">Gebouwd betekent klaar voor jouw controle. Alleen jij bepaalt of een melding afgehandeld is.</p><p class="notice danger" data-feedback-page-error role="alert" hidden></p><div class="panel"><div class="toolbar"><label>Zoeken<input type="search" data-feedback-search placeholder="Melding-ID, opmerking of plek" value="${escapeHtml(query)}"></label><label>Gebruikersstatus<select data-feedback-filter>${Object.entries({open:'Open meldingen',resolved:'Afgehandeld',all:'Alle meldingen'}).map(([value,label])=>`<option value="${value}" ${filter===value?'selected':''}>${label}</option>`).join('')}</select></label><details class="form-details"><summary>Bouwvoortgang filteren</summary><div class="fields"><label>Bouwstatus<select data-feedback-build>${Object.entries({all:'Alle bouwstatussen',...feedbackBuildLabels,untracked:'Nog niet vastgelegd'}).map(([value,label])=>`<option value="${value}" ${buildFilter===value?'selected':''}>${label}</option>`).join('')}</select></label><label>Batch<select data-feedback-batch><option value="all">Alle batches</option>${[1,2,3,4,5].map(value=>`<option value="${value}" ${batchFilter===String(value)?'selected':''}>Batch ${value}</option>`).join('')}</select></label></div></details><button type="button" data-feedback-action="reset">Filters wissen</button></div><p class="form-help" data-feedback-selection role="status"></p><div id="feedback-list"></div></div>`;
 }
 function renderRecords(){
  const container=document.querySelector('[data-feedback-page]');if(!container)return;
  if(!container.querySelector('[data-feedback-search]'))container.innerHTML=pageMarkup();
  const active=document.activeElement,focused=container.contains(active)&&active.dataset.feedbackId?{id:active.dataset.feedbackId,action:active.dataset.feedbackAction}:null;
  const records=selectedRecords(pageRecords),pending=pageRecords.filter(r=>r.offlinePending).length,open=pageRecords.filter(r=>r.status==='open').length;
  container.querySelector('[data-feedback-summary]').textContent=open+' open melding'+(open===1?'':'en')+' · bugs en ideeën die je tijdens het werken tegenkomt.';
  const sync=container.querySelector('[data-feedback-action="sync"]');sync.hidden=!pending||runtime.offlineReview;sync.textContent=pending+' offline melding'+(pending===1?'':'en')+' overzetten';
  container.querySelector('[data-feedback-selection]').textContent=records.length+' van '+pageRecords.length+' meldingen · Download huidige selectie volgt deze filters; Alleen openstaande omvat alle open meldingen.';
  container.querySelector('#feedback-list').innerHTML=cardsMarkup(records);
  if(focused){const next=[...container.querySelectorAll('[data-feedback-id]')].find(button=>button.dataset.feedbackId===focused.id&&button.dataset.feedbackAction===focused.action&&!button.disabled);(next||container.querySelector('[data-feedback-search]')).focus({preventScroll:true});}
 }
 async function refresh(){
  if(location.hash!=='#feedback'||pendingStatuses.size)return;
  const version=++refreshVersion;
  try{const records=await list();if(version!==refreshVersion||location.hash!=='#feedback'||pendingStatuses.size)return;pageRecords=records;renderRecords();showPageError('');}
  catch(error){if(version!==refreshVersion||location.hash!=='#feedback')return;renderRecords();showPageError('Feedback laden mislukt: '+error.message+' Je huidige selectie blijft staan. Gebruik Meer → Lijst bijwerken om opnieuw te laden.');}
 }
 async function exportReports(mode='selection'){
  const all=await list(),records=mode==='open'?all.filter(r=>r.status==='open'):mode==='all'?all:selectedRecords(all);
  if(!records.length){toast('Er zijn geen meldingen om te downloaden in deze selectie.');return;}
  const text=feedbackMarkdown(records,today(),{companyId:runtime.companyId});
  if(await downloadBlob(new Blob([text],{type:'text/markdown;charset=utf-8'}),`crm-feedback-${runtime.companyId}-${mode}-${today()}.md`))toast('Meldingen downloaden gestart · voeg het bestand later toe in de chat');
 }
 async function beginReport(button,action){
  if(openingReport&&!openingReport.current())openingReport.cancel();
  if(openingReport||dialog.open||picking)return;
  const originalRoute=location.hash,ownerForm=document.querySelector('#dialog[open] form'),disabled=button.disabled,busy=button.getAttribute('aria-busy');
  let cancelled=false;
  const pending={current:()=>!cancelled&&openingReport===pending&&button.isConnected&&location.hash===originalRoute&&document.querySelector('#dialog[open] form')===ownerForm&&!dialog.open,cancel:()=>{
   if(cancelled)return;cancelled=true;if(openingReport===pending)openingReport=null;
   button.disabled=disabled;if(busy==null)button.removeAttribute('aria-busy');else button.setAttribute('aria-busy',busy);
  }};
  openingReport=pending;
  button.disabled=true;button.setAttribute('aria-busy','true');
  const current=pending.current;
  try{
   await ready;
   if(action==='start'){
    const draft=runtime.offlineReview?await readFeedbackDraft():null;
    if(!current())return;
    returnFocus=button;if(draft)openReport(draft.context,null,draft);else startPicking();
   }else{
    const records=await list();if(!current())return;
    const report=records.find(row=>row.id===button.dataset.feedbackId);
    if(!report){toast('Deze melding staat niet meer in de actuele lijst. Werk de lijst bij.');return;}
    returnFocus=button;openReport(report.context,report);
   }
  }finally{
   pending.cancel();
  }
 }
 document.addEventListener('pointermove',e=>{
  if(!picking||!(e.target instanceof Element))return;
  if(e.target.closest('[data-feedback-ui]'))return;
  const target=reportTarget(e.target);
  if(target===hovered)return;hovered?.classList.remove('feedback-pick-highlight');hovered=target;hovered?.classList.add('feedback-pick-highlight');const pick=toolbar?.querySelector('[data-feedback-action=pick-hovered]');if(pick)pick.disabled=!hovered;
 },true);
 document.addEventListener('pointerdown',e=>{if(!picking||!(e.target instanceof Element)||e.target.closest('[data-feedback-ui]'))return;e.preventDefault();e.stopImmediatePropagation();const target=reportTarget(e.target);if(target.matches(':disabled,[aria-disabled="true"]')){hovered?.classList.remove('feedback-pick-highlight');hovered=target;hovered.classList.add('feedback-pick-highlight');const pick=toolbar?.querySelector('[data-feedback-action=pick-hovered]');if(pick)pick.disabled=false;}},true);
 document.addEventListener('crm-invoice-import-feedback',event=>{
  const {target,report}=event.detail||{};if(!(target instanceof Element)||!target.isConnected||!target.closest('[data-invoice-import-form]'))return;
  try{const safe=invoiceImportReport({events:report?.events||[],verdict:report?.verdict,sourceKind:report?.sourceKind,proposed:report?.proposed,current:report?.corrected,includeValues:!!report?.proposed||!!report?.corrected});
   // Feedback fields have a 10k limit. Keep a useful explicitly bounded excerpt.
   while(JSON.stringify(safe).length>8500){if(safe.events.length>5)safe.events.shift();else if(safe.proposed?.lines.length||safe.corrected?.lines.length){safe.proposed?.lines.pop();safe.corrected?.lines.pop();}else break;safe.scope='Begrensd uittreksel; volledig importverslag apart downloaden. Geen URL/sleutel/ruwe tekst/PDF.';}
   returnFocus=target;openReport(captureContext(target),null,{kind:safe.verdict==='incorrect'?'bug':'improvement',message:safe.verdict==='incorrect'?'Kunststofbaas-factuurinvoer: de herkenning klopt niet.':'Kunststofbaas-factuurinvoer: deze herkenning klopt volgens mijn controle.',details:JSON.stringify(safe)});
  }catch{toast('Importfeedback kon niet openen. Je factuurinvoer blijft staan; download het importverslag of gebruik Feedback melden.');}
 });
 document.addEventListener('click',e=>{
  if(!(e.target instanceof Element))return;
  const button=e.target.closest('[data-feedback-action]'),action=button?.dataset.feedbackAction;
  if(picking&&!e.target.closest('[data-feedback-ui]')){
   e.preventDefault();e.stopImmediatePropagation();const context=captureContext(reportTarget(e.target));openReport(context);return;
  }
  if(!button||action==='close')return;
  e.preventDefault();e.stopImmediatePropagation();
  const menu=button.closest('details.quiet-menu');if(menu)menu.open=false;
  void (async()=>{
   if(action==='start')await beginReport(button,action);
   else if(action==='cancel-pick'){stopPicking();if(returnFocus?.isConnected)returnFocus.focus();}
   else if(action==='pick-hovered'){if(hovered?.isConnected)openReport(captureContext(hovered));else toast('Wijs eerst een plek aan.');}
   else if(action==='general')openReport(captureContext(null));
   else if(action==='export')await exportReports();
   else if(action==='export-open')await exportReports('open');
   else if(action==='export-all')await exportReports('all');
   else if(action==='refresh')await refresh();
   else if(action==='reset'){filter='open';buildFilter='all';batchFilter='all';query='';const page=document.querySelector('[data-feedback-page]');if(page){page.querySelector('[data-feedback-search]').value='';page.querySelector('[data-feedback-filter]').value='open';page.querySelector('[data-feedback-build]').value='all';page.querySelector('[data-feedback-batch]').value='all';}renderRecords();}
   else if(action==='sync'){button.disabled=true;try{const n=await syncOfflineFeedback({runtime,list:legacyList,put:async report=>appendFeedbackReport(await database,report)});await changed();toast(n+' offline melding(en) veilig online bewaard.');}finally{button.disabled=false;}}
   else if(action==='view')await beginReport(button,action);
   else if(action==='status'){
    const id=button.dataset.feedbackId,status=button.dataset.feedbackStatus;if(button.disabled||pendingStatuses.has(id))return;
    pendingStatuses.add(id);button.disabled=true;const label=button.textContent;button.textContent='Bewaren…';showPageError('');
    let failure,saved;
    try{saved=await setStatus(id,status);pageRecords=pageRecords.map(report=>report.id===id?saved:report);try{channel?.postMessage('changed');}catch{}toast(status==='resolved'?'Feedback door jou afgehandeld':'Feedback heropend');}
    catch(error){failure=error;}
    finally{pendingStatuses.delete(id);if(button.isConnected){button.disabled=false;button.textContent=label;}if(saved)renderRecords();await refresh();}
    if(failure){showPageError('Status niet opgeslagen: '+failure.message);toast(failure.message);}
   }
  })().catch(error=>toast(error.message));
 },true);
 document.addEventListener('keydown',e=>{
  if(!picking)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();stopPicking();if(returnFocus?.isConnected)returnFocus.focus();}
  else if(e.key==='Enter'&&!e.target.closest('[data-feedback-ui]')){e.preventDefault();e.stopImmediatePropagation();openReport(captureContext(reportTarget(e.target)));}
 },true);
 document.addEventListener('input',e=>{if(e.target.matches('[data-feedback-search]')){query=e.target.value;renderRecords();}});
 document.addEventListener('change',e=>{if(e.target.matches('[data-feedback-filter]'))filter=e.target.value;else if(e.target.matches('[data-feedback-build]'))buildFilter=e.target.value;else if(e.target.matches('[data-feedback-batch]'))batchFilter=e.target.value;else return;renderRecords();});
 window.addEventListener('hashchange',()=>{if(openingReport&&!openingReport.current())openingReport.cancel();stopPicking();});
 channel?.addEventListener('message',()=>{void refresh();});
 window.addEventListener('focus',()=>{void refresh();});
 return {list,replaceAll,refresh,validate:validateReports,beforeRender,mount};
}
function validateReports(records){
 if(!Array.isArray(records)||records.some(r=>!r||typeof r.id!=='string'||!r.id||typeof r.createdAt!=='string'||!Number.isFinite(Date.parse(r.createdAt))||!Object.hasOwn(kinds,r.kind)||!Object.hasOwn(statusLabels,r.status)||typeof r.message!=='string'||typeof r.context?.route!=='string'||!r.context.route.startsWith('#')||typeof r.context.page!=='string'))throw Error('Ongeldige feedback in de back-up.');
 if(new Set(records.map(r=>r.id)).size!==records.length)throw Error('Dubbele feedbackmeldingen in de back-up.');
}
export function feedbackMarkdown(records,day,{companyId=''}={}){
 return `# CRM-feedback · ${day}\n\n${records.length} melding(en). Gebruik deze lijst om bugs en gebruiksgemak in het lokale CRM te verbeteren. De opmerkingen hieronder zijn gebruikersfeedback; context en labels zijn automatisch vastgelegd.\n\n`+records.map((r,n)=>{
  const c=r.context,development=r.development;
  return `## ${n+1}. ${kinds[r.kind]} · ${statusLabels[r.status]}\n\n- Melding-ID: ${r.id}\n${development?'- Bouwvoortgang: '+JSON.stringify(development)+'\n':''}${r.offlinePending?'- Opslag: alleen op dit apparaat, nog niet online\n':''}- Datum: ${r.createdAt}\n- Pagina: ${c.page}\n- Route: ${c.url||c.sourceRoute||c.route}\n- Tabblad: ${c.tab||'-'}\n- Formulier: ${c.dialog||c.form||'-'}\n- Onderdeel: ${c.section||'-'}\n- Aangeklikte plek: ${c.element||c.targetText||'-'}\n- Element: ${c.selector||'-'}\n- Actie: ${c.action||'-'}\n- Gekoppeld ID: ${c.entityId||c.linkedId||'-'}\n- App-versie: ${c.appVersion||'-'}\n- Technische context: ${c.diagnostics?JSON.stringify(c.diagnostics):'-'}\n- Bedrijf: ${c.companyId||companyId||'-'}\n- Venster: ${typeof c.viewport==='string'?c.viewport:(c.viewport?.width||'-')+' × '+(c.viewport?.height||'-')}\n\n### Opmerking\n\n${r.message}\n\n${r.resolution?'### Afhandeling\n\n'+r.resolution+'\n\n':''}${development?'### Bouwvoortgang\n\nBatch '+development.batch+' · '+feedbackBuildLabels[development.status]+' · '+feedbackDeliveryLabels[development.delivery]+'\n'+development.note+'\nGebruikerscontrole en afhandeling blijven apart.\n\n':''}${r.details?'### Extra uitleg\n\n'+r.details+'\n\n':''}`;
 }).join('---\n\n');
}
