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
 let picking=false,hovered=null,toolbar=null,filter='open',buildFilter='all',batchFilter='all',query='',refreshVersion=0,returnFocus=null,pageRecords=[];
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
 async function create(report){await ready;if(runtime.offlineReview){await addOfflineFeedback(report,runtime);await changed();return;}if(fileBacked){await migrate();await request('create',report);await changed();}else await write(store=>store.put(report));}
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
 function reportTarget(target){
  return target.closest('button,a,input,select,textarea,label,[role="tab"],summary')||target.closest('p,h1,h2,h3,td,.cost-detail-row,.payment-entry,.card')||target;
 }
 function labelFor(el){
  const label=el.labels?.[0]||el.closest('label');
  const labelText=label?[...label.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' '):'';
  return plain(el.getAttribute('aria-label')||labelText||el.getAttribute('title')||(['INPUT','TEXTAREA','SELECT'].includes(el.tagName)?el.getAttribute('name')||el.getAttribute('placeholder'):el.textContent));
 }
 function selectorFor(el){
  if(el.id)return '#'+CSS.escape(el.id);
  let selector=el.tagName.toLowerCase();
  for(const attr of ['data-action','data-id','data-order','data-item-id','name','role'])if(el.hasAttribute(attr))selector+=`[${attr}="${CSS.escape(el.getAttribute(attr))}"]`;
  if(selector===el.tagName.toLowerCase()){
   const parent=el.parentElement;
   selector+=`:nth-of-type(${parent?[...parent.children].filter(n=>n.tagName===el.tagName).indexOf(el)+1:1})`;
  }
  const root=el.parentElement?.closest('[id]');return root?'#'+CSS.escape(root.id)+' '+selector:selector;
 }
 function captureContext(target){
  const page=document.querySelector('main h1'),mainDialog=document.querySelector('#dialog[open]');
  const activeTab=document.querySelector('main [role="tab"][aria-selected="true"],main .order-tabs .active');
  const section=target?.closest('section,.panel,.item,.order-surface,.form-section');
  const route=location.hash||'#dashboard';
  return {route,url:location.pathname+route,page:plain(page?.textContent)||'CRM',tab:plain(activeTab?.textContent),dialog:plain(mainDialog?.querySelector('h2')?.textContent),
   element:target?labelFor(target):'Algemene melding over deze pagina',selector:target?selectorFor(target):'',section:plain(section?.querySelector('h2,h3')?.textContent),
   action:target?.getAttribute('data-action')||'',entityId:target?.getAttribute('data-id')||target?.getAttribute('data-order')||'',
   appVersion:document.querySelector('script[src*="app.js"]')?.getAttribute('src')||'',viewport:{width:innerWidth,height:innerHeight},scroll:{x:Math.round(scrollX),y:Math.round(scrollY)},...(contextOverride||{})};
 }
 function startPicking(){
  if(dialog.open||picking)return;
  returnFocus=document.activeElement;const owner=document.querySelector('#dialog[open]')||document.body;
  toolbar=document.createElement('div');toolbar.className='feedback-picker-toolbar';toolbar.dataset.feedbackUi='';toolbar.setAttribute('role','status');
  toolbar.innerHTML='<strong>Klik op de plek waarover je iets wilt melden.</strong><span>Je voert die knop daarmee niet uit. Esc = annuleren.</span><div><button type="button" data-feedback-action="general">Algemene melding</button><button type="button" data-feedback-action="cancel-pick">Annuleren</button></div>';
  owner.append(toolbar);picking=true;document.body.classList.add('feedback-picking');toolbar.querySelector('button').focus();
 }
 function contextMarkup(context){
  return `<div class="feedback-context"><strong>${escapeHtml(context.page)}${context.tab?' · '+escapeHtml(context.tab):''}</strong>${context.dialog?`<span>Formulier: ${escapeHtml(context.dialog)}</span>`:''}<span>Plek: ${escapeHtml(context.element)}</span>${context.section?`<span>Onderdeel: ${escapeHtml(context.section)}</span>`:''}</div>`;
 }
 function closeDialog(){speech?.dispose();speech=null;dialog.close();if(returnFocus?.isConnected)returnFocus.focus();}
 dialog.addEventListener('close',()=>{speech?.dispose();speech=null;if(returnFocus?.isConnected)returnFocus.focus();});
 function openReport(context,existing=null,draft=null){
  stopPicking();speech?.dispose();speech=null;window.dispatchEvent(new window.CustomEvent('crm-dictation-start',{detail:{owner:'feedback-open'}}));
  const editable=!existing;
  dialog.innerHTML=`<form><div class="dialog-heading"><h2>${editable?'Feedback melden':'Feedback bekijken'}</h2></div><div class="dialog-body">${contextMarkup(context)}${existing?developmentMarkup(existing):''}${editable?'<p class="form-help">De plek wordt automatisch bewaard. Omschrijf wat er gebeurt of wat je hier zou willen.</p>':''}<label>Soort melding<select name="kind" ${editable?'':'disabled'}>${Object.entries(kinds).map(([key,label])=>`<option value="${key}" ${(existing?.kind||draft?.kind||'improvement')===key?'selected':''}>${label}</option>`).join('')}</select></label><label>Wat merk je op?<textarea name="message" required maxlength="10000" rows="5" ${editable?'':'readonly'} placeholder="Bijvoorbeeld: deze knop doet niets, of ik wil hier meteen een nieuwe klant kunnen aanmaken.">${escapeHtml(existing?.message||draft?.message)}</textarea></label>${editable?`<details class="form-details"><summary>Extra uitleg (optioneel)</summary><label>Wat deed je vlak ervoor, en wat zou er moeten gebeuren?<textarea name="details" maxlength="10000" rows="3">${escapeHtml(draft?.details)}</textarea></label></details>`:existing.details?`<p class="feedback-message">${escapeHtml(existing.details)}</p>`:''}${editable&&!runtime.offlineReview?dictationMarkup():''}${editable&&runtime.offlineReview?'<p data-feedback-draft-status class="form-help" role="status">Je concept wordt tijdens typen op dit apparaat bewaard.</p>':''}<p class="form-help">${runtime.offlineReview?'Bewaard op dit apparaat. Zet je meldingen later online over via Feedback. Wis intussen geen browsergegevens.':fileBacked?'Bewaard in een vaste privémap op deze Mac. Nieuwe CRM-versies gebruiken dezelfde feedbacklijst; opnieuw meesturen is hier niet nodig.':'Bewaard in de online CRM-opslag. Download meldingen om ze lokaal voor ontwikkeling mee te nemen.'}</p></div><p class="feedback-error danger" role="alert"></p><div class="dialog-footer actions"><button type="button" data-feedback-action="close">${editable?'Annuleren':'Sluiten'}</button>${editable?'<button type="submit" class="primary">Melding bewaren</button>':''}</div></form>`;
  let dirty=Boolean(draft?.message||draft?.details),busy=false,draftWrite=Promise.resolve(),draftSaved=true,draftVersion=0;const form=dialog.querySelector('form');
  if(editable&&runtime.offlineReview)form.addEventListener('input',()=>{draftSaved=false;const version=++draftVersion,fd=new FormData(form),saved={kind:fd.get('kind'),message:String(fd.get('message')||''),details:String(fd.get('details')||''),context};draftWrite=draftWrite.catch(()=>{}).then(()=>saveFeedbackDraft(saved));draftWrite.then(()=>{if(version!==draftVersion)return;draftSaved=true;form.querySelector('[data-feedback-draft-status]').textContent='Concept op dit apparaat bewaard.';}).catch(e=>form.querySelector('[data-feedback-draft-status]').textContent=e.message);});
  form.addEventListener('input',()=>dirty=true);form.addEventListener('change',()=>dirty=true);
  const mayClose=()=>!busy&&(!(dirty||speech?.busy)||(runtime.offlineReview&&draftSaved)||confirm('Je melding is nog niet bewaard. Wil je hem weggooien?'));
  dialog.oncancel=e=>{if(!mayClose())e.preventDefault();else{speech?.dispose();speech=null;}};
  form.querySelector('[data-feedback-action="close"]').onclick=()=>{if(mayClose())closeDialog();};
  form.onsubmit=async e=>{
   e.preventDefault();if(!editable||busy||speech?.busy)return;
   const fd=new FormData(form),message=String(fd.get('message')).trim(),kind=fd.get('kind');if(!message||!kinds[kind])return;
   busy=true;const submit=form.querySelector('[type="submit"]'),cancel=form.querySelector('[data-feedback-action="close"]');submit.disabled=true;cancel.disabled=true;submit.textContent='Melding bewaren…';
   if(runtime.offlineReview)for(const el of form.querySelectorAll('textarea,select'))el.disabled=true;
   try{await draftWrite;await create({id:crypto.randomUUID(),createdAt:new Date().toISOString(),status:'open',kind,message,details:String(fd.get('details')||'').trim(),context});if(runtime.offlineReview)await clearFeedbackDraft();dirty=false;closeDialog();toast(runtime.offlineReview?'Feedback op dit apparaat bewaard · nog niet online':'Feedback bewaard · terug te vinden bij Feedback');}
   catch(error){form.querySelector('.feedback-error').textContent='Bewaren mislukt: '+error.message;}
   finally{busy=false;submit.disabled=false;cancel.disabled=false;submit.textContent='Melding bewaren';if(runtime.offlineReview)for(const el of form.querySelectorAll('textarea,select'))el.disabled=false;}
  };
  if(editable&&!runtime.offlineReview)speech=installFieldDictation(form,{runtime,companyId:runtime.companyId,onBusy:active=>{const submit=form.querySelector('[type=submit]');submit.disabled=busy||active;}});
  dialog.showModal();(editable?form.elements.message:form.querySelector('button')).focus();
 }
 function developmentMarkup(report){
  const d=report.development;
  return `<p class="form-help">Melding-ID: <code>${escapeHtml(report.id)}</code></p>${d?`<p class="notice">Batch ${d.batch} · ${escapeHtml(feedbackBuildLabels[d.status]||'Nog beoordelen')} · ${escapeHtml(feedbackDeliveryLabels[d.delivery]||'Niet vastgelegd')}<br>${escapeHtml(d.note)}<br>Gebruikersstatus: ${escapeHtml(statusLabels[report.status])}</p>`:'<p class="form-help">Bouwvoortgang nog niet vastgelegd. Gebruikersstatus: '+escapeHtml(statusLabels[report.status])+'.</p>'}`;
 }
 function cardsMarkup(records){
  return records.map(r=>`<article class="feedback-card"><div class="feedback-card-heading"><strong>${escapeHtml(kinds[r.kind])}</strong><small>${escapeHtml(new Date(r.createdAt).toLocaleString('nl-NL'))} · ${escapeHtml(statusLabels[r.status])}${r.offlinePending?' · Nog niet online':''}</small></div>${developmentMarkup(r)}${contextMarkup(r.context)}<p class="feedback-message">${escapeHtml(r.message)}</p>${r.resolution?`<p class="form-help">Afhandeling: ${escapeHtml(r.resolution)}</p>`:''}<div class="actions"><button type="button" data-feedback-action="view" data-feedback-id="${escapeHtml(r.id)}">Details</button><a href="${escapeHtml(r.context.route)}">Naar deze pagina →</a><button type="button" ${runtime.offlineReview||r.offlinePending||pendingStatuses.has(r.id)?'disabled':''} data-feedback-action="status" data-feedback-id="${escapeHtml(r.id)}" data-feedback-status="${r.status==='open'?'resolved':'open'}">${pendingStatuses.has(r.id)?'Bewaren…':r.status==='open'?'Afgehandeld':'Heropenen'}</button></div></article>`).join('')||'<p class="empty">Geen meldingen in deze selectie. Pas de filters aan of wis je zoekopdracht.</p>';
 }
 function pageMarkup(){
  return `<div class="top"><div><h1>Feedback</h1><span class="muted" data-feedback-summary></span></div><div class="actions"><button type="button" class="primary" data-feedback-action="start">Feedback melden</button><button type="button" data-feedback-action="sync" hidden></button><details class="quiet-menu"><summary>Meer</summary><div><button type="button" data-feedback-action="export">Download selectie</button><button type="button" data-feedback-action="refresh">Lijst bijwerken</button></div></details></div></div><p class="notice">${runtime.offlineReview?'Feedback die je hier bewaart staat op dit apparaat, ook na herladen zonder internet. Terug met internet? Ga naar Terug online & feedback overzetten. Wis intussen geen browsergegevens.':fileBacked?'Deze lijst staat in een vaste privémap op deze Mac, apart van klanten en orders. Codex kan de meldingen daar terugvinden, ook na een code-update.':'Deze online lijst blijft bij je bedrijfsopslag. Download meldingen om ze voor lokale ontwikkeling mee te nemen.'}</p><p class="form-help">Gebouwd betekent klaar voor jouw controle. Alleen jij bepaalt of een melding afgehandeld is.</p><p class="notice danger" data-feedback-page-error role="alert" hidden></p><div class="panel"><div class="toolbar"><label>Zoeken<input type="search" data-feedback-search placeholder="Melding-ID, opmerking of plek" value="${escapeHtml(query)}"></label><label>Gebruikersstatus<select data-feedback-filter>${Object.entries({open:'Open meldingen',resolved:'Afgehandeld',all:'Alle meldingen'}).map(([value,label])=>`<option value="${value}" ${filter===value?'selected':''}>${label}</option>`).join('')}</select></label><details class="form-details"><summary>Bouwvoortgang filteren</summary><div class="fields"><label>Bouwstatus<select data-feedback-build>${Object.entries({all:'Alle bouwstatussen',...feedbackBuildLabels,untracked:'Nog niet vastgelegd'}).map(([value,label])=>`<option value="${value}" ${buildFilter===value?'selected':''}>${label}</option>`).join('')}</select></label><label>Batch<select data-feedback-batch><option value="all">Alle batches</option>${[1,2,3,4,5].map(value=>`<option value="${value}" ${batchFilter===String(value)?'selected':''}>Batch ${value}</option>`).join('')}</select></label></div></details><button type="button" data-feedback-action="reset">Filters wissen</button></div><p class="form-help" data-feedback-selection role="status"></p><div id="feedback-list"></div></div>`;
 }
 function renderRecords(){
  const container=document.querySelector('[data-feedback-page]');if(!container)return;
  if(!container.querySelector('[data-feedback-search]'))container.innerHTML=pageMarkup();
  const active=document.activeElement,focused=container.contains(active)&&active.dataset.feedbackId?{id:active.dataset.feedbackId,action:active.dataset.feedbackAction}:null;
  const records=selectedRecords(pageRecords),pending=pageRecords.filter(r=>r.offlinePending).length,open=pageRecords.filter(r=>r.status==='open').length;
  container.querySelector('[data-feedback-summary]').textContent=open+' open melding'+(open===1?'':'en')+' · bugs en ideeën die je tijdens het werken tegenkomt.';
  const sync=container.querySelector('[data-feedback-action="sync"]');sync.hidden=!pending||runtime.offlineReview;sync.textContent=pending+' offline melding'+(pending===1?'':'en')+' overzetten';
  container.querySelector('[data-feedback-selection]').textContent=records.length+' van '+pageRecords.length+' meldingen · download gebruikt dezelfde selectie.';
  container.querySelector('#feedback-list').innerHTML=cardsMarkup(records);
  if(focused){const next=[...container.querySelectorAll('[data-feedback-id]')].find(button=>button.dataset.feedbackId===focused.id&&button.dataset.feedbackAction===focused.action&&!button.disabled);(next||container.querySelector('[data-feedback-search]')).focus({preventScroll:true});}
 }
 async function refresh(){
  if(location.hash!=='#feedback'||pendingStatuses.size)return;
  const version=++refreshVersion;
  try{const records=await list();if(version!==refreshVersion||location.hash!=='#feedback'||pendingStatuses.size)return;pageRecords=records;renderRecords();showPageError('');}
  catch(error){if(version!==refreshVersion||location.hash!=='#feedback')return;renderRecords();showPageError('Feedback laden mislukt: '+error.message+' Je huidige selectie blijft staan. Gebruik Meer → Lijst bijwerken om opnieuw te laden.');}
 }
 async function exportReports(){
  const records=selectedRecords(await list());
  if(!records.length){toast('Er zijn geen meldingen om te downloaden in deze selectie.');return;}
  const text=feedbackMarkdown(records,today());
  if(await downloadBlob(new Blob([text],{type:'text/markdown;charset=utf-8'}),`crm-feedback-${today()}.md`))toast('Meldingen downloaden gestart · voeg het bestand later toe in de chat');
 }
 document.addEventListener('pointermove',e=>{
  if(!picking||!(e.target instanceof Element))return;
  const target=e.target.closest('[data-feedback-ui],[data-feedback-action]')?null:reportTarget(e.target);
  if(target===hovered)return;hovered?.classList.remove('feedback-pick-highlight');hovered=target;hovered?.classList.add('feedback-pick-highlight');
 },true);
 document.addEventListener('pointerdown',e=>{if(picking&&!e.target.closest('[data-feedback-ui]'))e.preventDefault();},true);
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
   if(action==='start'){await ready;const draft=runtime.offlineReview?await readFeedbackDraft():null;if(draft){returnFocus=button;openReport(draft.context,null,draft);}else startPicking();}
   else if(action==='cancel-pick'){stopPicking();if(returnFocus?.isConnected)returnFocus.focus();}
   else if(action==='general')openReport(captureContext(null));
   else if(action==='export')await exportReports();
   else if(action==='refresh')await refresh();
   else if(action==='reset'){filter='open';buildFilter='all';batchFilter='all';query='';const page=document.querySelector('[data-feedback-page]');if(page){page.querySelector('[data-feedback-search]').value='';page.querySelector('[data-feedback-filter]').value='open';page.querySelector('[data-feedback-build]').value='all';page.querySelector('[data-feedback-batch]').value='all';}renderRecords();}
   else if(action==='sync'){button.disabled=true;try{const n=await syncOfflineFeedback({runtime,list:legacyList,put:async report=>appendFeedbackReport(await database,report)});await changed();toast(n+' offline melding(en) veilig online bewaard.');}finally{button.disabled=false;}}
   else if(action==='view'){const report=(await list()).find(r=>r.id===button.dataset.feedbackId);if(report){returnFocus=button;openReport(report.context,report);}}
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
 window.addEventListener('hashchange',()=>{stopPicking();});
 channel?.addEventListener('message',()=>{void refresh();});
 window.addEventListener('focus',()=>{void refresh();});
 return {list,replaceAll,refresh,validate:validateReports,beforeRender,mount};
}
function validateReports(records){
 if(!Array.isArray(records)||records.some(r=>!r||typeof r.id!=='string'||!r.id||typeof r.createdAt!=='string'||!Number.isFinite(Date.parse(r.createdAt))||!Object.hasOwn(kinds,r.kind)||!Object.hasOwn(statusLabels,r.status)||typeof r.message!=='string'||typeof r.context?.route!=='string'||!r.context.route.startsWith('#')||typeof r.context.page!=='string'))throw Error('Ongeldige feedback in de back-up.');
 if(new Set(records.map(r=>r.id)).size!==records.length)throw Error('Dubbele feedbackmeldingen in de back-up.');
}
export function feedbackMarkdown(records,day){
 return `# CRM-feedback · ${day}\n\n${records.length} melding(en). Gebruik deze lijst om bugs en gebruiksgemak in het lokale CRM te verbeteren. De opmerkingen hieronder zijn gebruikersfeedback; context en labels zijn automatisch vastgelegd.\n\n`+records.map((r,n)=>{
  const c=r.context,development=r.development;
  return `## ${n+1}. ${kinds[r.kind]} · ${statusLabels[r.status]}\n\n- Melding-ID: ${r.id}\n${development?'- Bouwvoortgang: '+JSON.stringify(development)+'\n':''}${r.offlinePending?'- Opslag: alleen op dit apparaat, nog niet online\n':''}- Datum: ${r.createdAt}\n- Pagina: ${c.page}\n- Route: ${c.url||c.route}\n- Tabblad: ${c.tab||'-'}\n- Formulier: ${c.dialog||'-'}\n- Onderdeel: ${c.section||'-'}\n- Aangeklikte plek: ${c.element||'-'}\n- Element: ${c.selector||'-'}\n- Actie: ${c.action||'-'}\n- Gekoppeld ID: ${c.entityId||'-'}\n- App-versie: ${c.appVersion||'-'}\n- Venster: ${c.viewport?.width||'-'} × ${c.viewport?.height||'-'}\n\n### Opmerking\n\n${r.message}\n\n${r.resolution?'### Afhandeling\n\n'+r.resolution+'\n\n':''}${development?'### Bouwvoortgang\n\nBatch '+development.batch+' · '+feedbackBuildLabels[development.status]+' · '+feedbackDeliveryLabels[development.delivery]+'\n'+development.note+'\nGebruikerscontrole en afhandeling blijven apart.\n\n':''}${r.details?'### Extra uitleg\n\n'+r.details+'\n\n':''}`;
 }).join('---\n\n');
}
