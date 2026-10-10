import {openFeedbackDatabase} from './cloud-storage.js';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kinds={bug:'Werkt niet',improvement:'Verbetering',unnecessary:'Overbodig'};
const statusLabels={open:'Open',resolved:'Afgehandeld'};
const plain=(value,max=250)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);

// Separate from business data: reporting a problem must never replace an active order edit.
export function installFeedback({downloadBlob,today,toast}){
 const database=openFeedbackDatabase();database.catch(()=>{});
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('spatlappen-crm-feedback-changes'):null;
 let picking=false,hovered=null,toolbar=null,filter='open',refreshVersion=0,returnFocus=null;
 const dialog=document.createElement('dialog');dialog.id='feedback-dialog';dialog.setAttribute('aria-label','Feedback melden');document.body.append(dialog);
 const launcher=document.createElement('button');launcher.type='button';launcher.className='feedback-launcher';launcher.dataset.feedbackAction='start';launcher.textContent='Feedback melden';document.body.append(launcher);

 async function list(){
  const db=await database;
  return new Promise((resolve,reject)=>{const tx=db.transaction('reports'),r=tx.objectStore('reports').getAll();let records=[];r.onsuccess=()=>records=r.result;tx.oncomplete=()=>resolve(records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));tx.onerror=()=>reject(tx.error);});
 }
 async function write(mutate){
  const db=await database;
  await new Promise((resolve,reject)=>{
   const tx=db.transaction('reports','readwrite');try{mutate(tx.objectStore('reports'));}catch(error){tx.abort();reject(error);}
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Feedback opslaan is afgebroken.'));
  });
  channel?.postMessage('changed');await refresh();
 }
 async function replaceAll(records){
  validateReports(records);
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
   appVersion:document.querySelector('script[src*="app.js"]')?.getAttribute('src')||'',viewport:{width:innerWidth,height:innerHeight},scroll:{x:Math.round(scrollX),y:Math.round(scrollY)}};
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
 function closeDialog(){dialog.close();if(returnFocus?.isConnected)returnFocus.focus();}
 dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
 function openReport(context,existing=null){
  stopPicking();
  const editable=!existing;
  dialog.innerHTML=`<form><div class="dialog-heading"><h2>${editable?'Feedback melden':'Feedback bekijken'}</h2></div><div class="dialog-body">${contextMarkup(context)}${editable?'<p class="form-help">De plek wordt automatisch bewaard. Omschrijf wat er gebeurt of wat je hier zou willen.</p>':''}<label>Soort melding<select name="kind" ${editable?'':'disabled'}>${Object.entries(kinds).map(([key,label])=>`<option value="${key}" ${existing?.kind===key?'selected':''}>${label}</option>`).join('')}</select></label><label>Wat merk je op?<textarea name="message" required maxlength="10000" rows="5" ${editable?'':'readonly'} placeholder="Bijvoorbeeld: deze knop doet niets, of ik wil hier meteen een nieuwe klant kunnen aanmaken.">${escapeHtml(existing?.message)}</textarea></label>${editable?'<details class="form-details"><summary>Extra uitleg (optioneel)</summary><label>Wat deed je vlak ervoor, en wat zou er moeten gebeuren?<textarea name="details" maxlength="10000" rows="3"></textarea></label></details>':existing.details?`<p class="feedback-message">${escapeHtml(existing.details)}</p>`:''}<p class="form-help">Bewaard in de CRM-opslag. Download je meldingen via Feedback en voeg dat bestand later hier in de chat toe.</p></div><p class="feedback-error danger" role="alert"></p><div class="dialog-footer actions"><button type="button" data-feedback-action="close">${editable?'Annuleren':'Sluiten'}</button>${editable?'<button type="submit" class="primary">Melding bewaren</button>':''}</div></form>`;
  let dirty=false,busy=false;const form=dialog.querySelector('form');
  form.addEventListener('input',()=>dirty=true);form.addEventListener('change',()=>dirty=true);
  const mayClose=()=>!busy&&(!dirty||confirm('Je melding is nog niet bewaard. Wil je hem weggooien?'));
  dialog.oncancel=e=>{if(!mayClose())e.preventDefault();};
  form.querySelector('[data-feedback-action="close"]').onclick=()=>{if(mayClose())closeDialog();};
  form.onsubmit=async e=>{
   e.preventDefault();if(!editable||busy)return;
   const fd=new FormData(form),message=String(fd.get('message')).trim(),kind=fd.get('kind');if(!message||!kinds[kind])return;
   busy=true;const submit=form.querySelector('[type="submit"]'),cancel=form.querySelector('[data-feedback-action="close"]');submit.disabled=true;cancel.disabled=true;submit.textContent='Melding bewaren…';
   try{await write(store=>store.put({id:crypto.randomUUID(),createdAt:new Date().toISOString(),status:'open',kind,message,details:String(fd.get('details')||'').trim(),context}));dirty=false;closeDialog();toast('Feedback bewaard · terug te vinden bij Feedback');}
   catch(error){form.querySelector('.feedback-error').textContent='Bewaren mislukt: '+error.message;}
   finally{busy=false;submit.disabled=false;cancel.disabled=false;submit.textContent='Melding bewaren';}
  };
  dialog.showModal();(editable?form.elements.message:form.querySelector('button')).focus();
 }
 function pageMarkup(records){
  const open=records.filter(r=>r.status==='open').length,shown=records.filter(r=>filter==='all'||r.status===filter);
  return `<div class="top"><div><h1>Feedback</h1><span class="muted">${open} open melding${open===1?'':'en'} · bugs en ideeën die je tijdens het werken tegenkomt.</span></div><div class="actions"><button type="button" data-feedback-action="start">Feedback melden</button><button type="button" class="primary" data-feedback-action="export">Download meldingen</button></div></div><p class="notice">Wijs met ‘Feedback melden’ een plek in het CRM aan. Deel de download later in de chat, zodat we de meldingen samen kunnen verwerken. Er wordt niets automatisch verstuurd.</p><div class="panel"><div class="toolbar"><label>Tonen<select data-feedback-filter>${Object.entries({open:'Open meldingen',resolved:'Afgehandeld',all:'Alle meldingen'}).map(([value,label])=>`<option value="${value}" ${filter===value?'selected':''}>${label}</option>`).join('')}</select></label><span class="muted">De download bevat de meldingen uit deze selectie.</span></div><div id="feedback-list">${shown.map(r=>`<article class="feedback-card"><div class="feedback-card-heading"><strong>${escapeHtml(kinds[r.kind])}</strong><small>${escapeHtml(new Date(r.createdAt).toLocaleString('nl-NL'))} · ${escapeHtml(statusLabels[r.status])}</small></div>${contextMarkup(r.context)}<p class="feedback-message">${escapeHtml(r.message)}</p><div class="actions"><button type="button" data-feedback-action="view" data-feedback-id="${escapeHtml(r.id)}">Details</button><a href="${escapeHtml(r.context.route)}">Naar deze pagina →</a><button type="button" data-feedback-action="status" data-feedback-id="${escapeHtml(r.id)}" data-feedback-status="${r.status==='open'?'resolved':'open'}">${r.status==='open'?'Afgehandeld':'Heropenen'}</button></div></article>`).join('')||'<p class="empty">Geen meldingen in deze selectie.</p>'}</div></div>`;
 }
 async function refresh(){
  if(location.hash!=='#feedback')return;
  const version=++refreshVersion;
  try{const records=await list();if(version!==refreshVersion||location.hash!=='#feedback')return;const container=document.querySelector('[data-feedback-page]');if(container)container.innerHTML=pageMarkup(records);}
  catch(error){const container=document.querySelector('[data-feedback-page]');if(container)container.textContent='Feedback laden mislukt: '+error.message;}
 }
 async function exportReports(){
  const records=(await list()).filter(r=>filter==='all'||r.status===filter);
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
  void (async()=>{
   if(action==='start')startPicking();
   else if(action==='cancel-pick'){stopPicking();if(returnFocus?.isConnected)returnFocus.focus();}
   else if(action==='general')openReport(captureContext(null));
   else if(action==='export')await exportReports();
   else if(action==='view'){const report=(await list()).find(r=>r.id===button.dataset.feedbackId);if(report){returnFocus=button;openReport(report.context,report);}}
   else if(action==='status')await write(store=>{const r=store.get(button.dataset.feedbackId);r.onsuccess=()=>{if(r.result)store.put({...r.result,status:button.dataset.feedbackStatus,updatedAt:new Date().toISOString()});};});
  })().catch(error=>toast(error.message));
 },true);
 document.addEventListener('keydown',e=>{
  if(!picking)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();stopPicking();if(returnFocus?.isConnected)returnFocus.focus();}
  else if(e.key==='Enter'&&!e.target.closest('[data-feedback-ui]')){e.preventDefault();e.stopImmediatePropagation();openReport(captureContext(reportTarget(e.target)));}
 },true);
 document.addEventListener('change',e=>{if(e.target.matches('[data-feedback-filter]')){filter=e.target.value;void refresh();}});
 window.addEventListener('hashchange',()=>{stopPicking();});
 channel?.addEventListener('message',()=>{void refresh();});
 window.addEventListener('focus',()=>{void refresh();});
 return {list,replaceAll,refresh,validate:validateReports};
}
function validateReports(records){
 if(!Array.isArray(records)||records.some(r=>!r||typeof r.id!=='string'||!r.id||typeof r.createdAt!=='string'||!Number.isFinite(Date.parse(r.createdAt))||!Object.hasOwn(kinds,r.kind)||!Object.hasOwn(statusLabels,r.status)||typeof r.message!=='string'||typeof r.context?.route!=='string'||!r.context.route.startsWith('#')||typeof r.context.page!=='string'))throw Error('Ongeldige feedback in de back-up.');
 if(new Set(records.map(r=>r.id)).size!==records.length)throw Error('Dubbele feedbackmeldingen in de back-up.');
}
export function feedbackMarkdown(records,day){
 return `# CRM-feedback · ${day}\n\n${records.length} melding(en). Gebruik deze lijst om bugs en gebruiksgemak in het lokale CRM te verbeteren. De opmerkingen hieronder zijn gebruikersfeedback; context en labels zijn automatisch vastgelegd.\n\n`+records.map((r,n)=>{
  const c=r.context;
  return `## ${n+1}. ${kinds[r.kind]} · ${statusLabels[r.status]}\n\n- Melding-ID: ${r.id}\n- Datum: ${r.createdAt}\n- Pagina: ${c.page}\n- Route: ${c.url||c.route}\n- Tabblad: ${c.tab||'-'}\n- Formulier: ${c.dialog||'-'}\n- Onderdeel: ${c.section||'-'}\n- Aangeklikte plek: ${c.element||'-'}\n- Element: ${c.selector||'-'}\n- Actie: ${c.action||'-'}\n- Gekoppeld ID: ${c.entityId||'-'}\n- App-versie: ${c.appVersion||'-'}\n- Venster: ${c.viewport?.width||'-'} × ${c.viewport?.height||'-'}\n\n### Opmerking\n\n${r.message}\n\n${r.details?'### Extra uitleg\n\n'+r.details+'\n\n':''}`;
 }).join('---\n\n');
}
