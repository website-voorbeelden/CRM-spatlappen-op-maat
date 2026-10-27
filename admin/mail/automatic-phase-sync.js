import {gmailPhaseContext} from '../../shared/gmail-phase-context.js?v=ui-batch234-20261027';
import {funnelPhasesFor,funnelPhaseLabel} from '../../shared/sales-funnel.js?v=ui-batch234-20261027';
import {gmailPhaseSuggestions} from '../../shared/gmail-labels.js';
import {phaseAutoConfirmation,phaseResolveConfirmation} from '../../shared/gmail-phase-auto.js?v=ui-batch234-20261027';
import {markProvenance} from '../../shared/provenance.js?v=provenance-colors-20261027';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createAutomaticPhaseSync({company,runtime,getState,loadState,mergeStoredState,request,openForm,toast,render,isEditing}){
 const available=['local','cloud'].includes(runtime.mode)&&!runtime.offlineReview,issues=new Map(),checked=new Map();
 let configuration=null,busy=false,timer=null,queued=null,stopped=false,statusAt=0,lastProblem='',started=false;
 async function status(force=false){if(force||!configuration||Date.now()-statusAt>60000){configuration=await request('phase-auto-status',undefined,{background:true});statusAt=Date.now();paint();}return configuration;}
 async function apply(result,expected,reviewed=false){
  if(!result.phase||result.conflict||result.disabled)return false;
  const state=getState(),order=state.orders.find(o=>o.id===result.orderId);if(!reviewed&&isEditing())return false;
  const value={phase:result.phase,basis:result.signal.basis,mailbox:result.mailbox,threads:result.threads,at:result.at,source:result.source};
  if(order&&JSON.stringify(order.gmailSalesPhase)===JSON.stringify(value)&&JSON.stringify(gmailPhaseContext(state,result.orderId,company.id))===JSON.stringify(expected))return false;
  await mergeStoredState(next=>{if(!reviewed&&isEditing()||JSON.stringify(gmailPhaseContext(next,result.orderId,company.id))!==JSON.stringify(expected))throw Error('Het dossier is gewijzigd. Synchronisatie probeert het later opnieuw.');const current=next.orders.find(o=>o.id===result.orderId);current.gmailSalesPhase=value;markProvenance(current,['gmailSalesPhase.phase'],'gmailPhase',{mode:'automatic',at:result.at});});
  return true;
 }
 async function syncOrder(orderId,extra={}){
  const latest=await loadState(),context=gmailPhaseContext(latest,orderId,company.id);
  const result=await request('phase-auto-sync',{...context,...extra},{background:true,...(extra.confirmation?{phaseConfirmation:'phase-auto-resolution'}:{})});
  if(result.conflict)issues.set(orderId,result);else issues.delete(orderId);
  const changed=await apply(result,context,extra.confirmation===phaseResolveConfirmation);checked.set(orderId,{at:Date.now(),basis:context.signal.basis,links:JSON.stringify(context.links)});
  return {result,changed};
 }
 async function round(){
  if(stopped||busy||!available||document.hidden||isEditing())return;
  if(!navigator.locks){lastProblem='Deze browser ondersteunt geen veilige tabcoördinatie. Gebruik een recente browser voor automatische fasesynchronisatie.';paint();return;}
  busy=true;
  try{await navigator.locks.request('crm-gmail-phase-auto-'+company.id,{ifAvailable:true},async lock=>{
   if(!lock)return;const settings=await status();if(!settings.active){lastProblem=settings.reason||'';paint();return;}
   const snapshot=await loadState(),ids=[...new Set((snapshot.mailThreads||[]).filter(t=>t.orderId&&t.mailbox===settings.mailbox).map(t=>t.orderId))].filter(id=>snapshot.orders.some(o=>o.id===id));
   ids.sort((a,b)=>{const priority=id=>{try{const c=gmailPhaseContext(snapshot,id,company.id),old=checked.get(id);return old?.invalid?old.at:!old||old.basis!==c.signal.basis||old.links!==JSON.stringify(c.links)?0:old.at;}catch{return 0;}};return priority(a)-priority(b);});
   let changed=false;lastProblem='';
   for(const id of ids.slice(0,10)){
    if(document.hidden||isEditing()||stopped)break;
    try{const result=await syncOrder(id);changed||=result.changed;}
    catch(error){issues.set(id,{message:error.message,error:true,orderId:id});lastProblem=error.message;try{const context=gmailPhaseContext(snapshot,id,company.id);checked.set(id,{at:Date.now(),basis:context.signal.basis,links:JSON.stringify(context.links)});}catch{checked.set(id,{at:Date.now(),invalid:true});}if([401,403,404,503].includes(error.status))break;}
   }
   if(changed&&!isEditing())render();paint();
  });}catch(error){lastProblem=error.message;paint();}finally{busy=false;}
 }
 function schedule(){if(stopped||!started||busy)return;clearTimeout(queued);queued=setTimeout(()=>void round(),1200);}
 function paint(){if(!available)return;for(const element of document.querySelectorAll('[data-phase-auto-state]')){element.textContent=lastProblem||(!configuration?.active?'Automatische fasesynchronisatie staat uit.':issues.size?issues.size+' dossier(s) vragen aandacht bij fasesynchronisatie.':'Fasesynchronisatie aan · controleert op de achtergrond zolang het CRM open is.');}for(const element of document.querySelectorAll('[data-phase-auto-order]')){const issue=issues.get(element.dataset.phaseAutoOrder);element.textContent=issue?'Fasesynchronisatie: '+issue.message:'';element.hidden=!issue;}}
 async function settings(){
  if(!available)throw Error('Fasesynchronisatie is alleen beschikbaar in het gewone lokale of online CRM.');
  const current=await status(true),gmail=await request('status',undefined,{background:true});
  if(current.enabled&&(!gmail.connected||!gmail.phaseLabelsAllowed)){
   let off;openForm('Fasesynchronisatie gepauzeerd',`<p>${esc(current.reason||'De Gmail-toestemming moet opnieuw worden gecontroleerd.')}</p><label class="check-row"><input type="checkbox" name="disable" required>Automatische verkoopfases uitzetten</label><p>Je kunt daarna opnieuw koppelen en activeren via dezelfde instelling. Er worden nu geen Gmail-labels gewijzigd.</p>`,async fd=>{if(!fd.has('disable'))throw Error('Bevestig eerst het uitzetten.');off=await request('phase-auto-configure',{enabled:false,version:current.version},{phaseConfirmation:'phase-auto-settings'});},{trackChanges:false,afterSave:()=>{configuration=off;statusAt=Date.now();lastProblem='';issues.clear();paint();toast('Automatische fasesynchronisatie uitgezet');}});return;
  }
  if(!gmail.connected){openForm('Gmail-fases synchroniseren','<p>Koppel eerst Gmail voor dit bedrijf.</p><a href="#settings" data-phase-go-settings>Gmail-instellingen openen →</a>',async()=>{}, {trackChanges:false});document.querySelector('[data-phase-go-settings]').onclick=()=>document.querySelector('#dialog').close();return;}
  if(!gmail.phaseLabelsAllowed){
   let login;openForm('Google-toestemming voor faselabels','<p>Voor het aanpassen van verkoopfaselabels is aanvullende Google-toestemming nodig. Google noemt dit gmail.modify (mail lezen en wijzigen). Het CRM gebruikt deze route uitsluitend voor de verkoopfaselabels die je zelf kiest; geen mail versturen of verwijderen.</p><label class="check-row"><input type="checkbox" name="consent" required>Ik wil zelf de Google-aanmelding openen.</label>',async fd=>{if(!fd.has('consent'))throw Error('Bevestig eerst de aanvullende aanmelding.');login=await request('login',{enablePhaseLabels:true});},{trackChanges:false,afterSave:()=>{openForm('Toestemming bij Google afronden',`<p>Geef zelf toestemming bij Google. Kom daarna terug en open Fasesynchronisatie opnieuw om de labelkeuze te controleren en aan te zetten.</p><a href="${esc(login.url)}" target="_blank" rel="noopener noreferrer">Google openen →</a>`,async()=>{}, {trackChanges:false});}});return;
  }
  const data=await request('labels',{mailbox:gmail.mailbox},{background:true}),phases=funnelPhasesFor(company.id);
  let next;
  openForm('Gmail ↔ CRM · verkoopfases',`<p><strong>${esc(gmail.mailbox)}</strong></p><p>Alleen gesprekken die aan een order zijn gekoppeld. Gmail-wijzigingen worden de dossierfase. Een nieuwe CRM-fase, ontvangen/gecorrigeerde betaling, bevestigde mailfase of productie-/leverregistratie mag het label daarna bijwerken. Notities en gewone formulierwijzigingen tellen niet mee.</p><p>Bestaande Gmail-fases zijn bij de eerste koppeling leidend. Een gesprek zonder faselabel krijgt de huidige CRM-fase. Alle gekoppelde gesprekken van één order volgen dezelfde fase. Bij tegenstrijdige wijzigingen vraagt het CRM een keuze.</p><p>Een Gmail-fase boekt geen betaling, verzending, archivering of levering. De controle loopt stil op de achtergrond zolang dit CRM open en niet in bewerking is; maximaal tien dossiers per ronde.</p><label class="check-row"><input name="enabled" type="checkbox" ${current.enabled?'checked':''}>Verkoopfases automatisch gelijkhouden</label><details ${current.enabled?'':'open'}><summary>Fases en Gmail-labels</summary>${phases.map(([phase,name])=>{const saved=current.mapping.find(m=>m.phase===phase)?.labelId,match=data.labels.filter(l=>gmailPhaseSuggestions([l],company.id).includes(phase)),selected=saved|| (match.length===1?match[0].id:'');return `<label>${esc(name)}<select name="label_${phase}"><option value="">Kies bestaand Gmail-label</option>${data.labels.map(l=>`<option value="${esc(l.id)}" ${l.id===selected?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label>`;}).join('')}</details><label class="check-row"><input name="confirm" type="checkbox">Ik geef toestemming voor deze vaste automatische faselabels, ook zonder een mail te versturen. Uitzetten stopt volgende synchronisaties.</label><p class="form-help">Andere labels blijven staan. SMTP2GO en de AI-toestemming voor overige acties blijven ongewijzigd. Opnieuw Gmail koppelen pauzeert deze toestemming totdat je haar opnieuw activeert.</p>`,async fd=>{
   const enabled=fd.has('enabled');if(enabled&&!fd.has('confirm'))throw Error('Bevestig eerst deze vaste automatische faselabels.');
   next=await request('phase-auto-configure',{enabled,mailbox:gmail.mailbox,version:current.version,mapping:phases.map(([phase])=>({phase,labelId:fd.get('label_'+phase)})),...(enabled?{confirmation:phaseAutoConfirmation}:{})},{phaseConfirmation:'phase-auto-settings'});
  },{trackChanges:false,afterSave:()=>{configuration=next;statusAt=Date.now();checked.clear();issues.clear();lastProblem='';paint();toast(next.active?'Automatische verkoopfases aangezet':'Automatische verkoopfases uitgezet');schedule();}});
 }
 async function review(orderId){
  if(busy)throw Error('Er wordt al gesynchroniseerd. Probeer zo opnieuw.');
  const settings=await status(true);if(!settings.active)return void await api.settings();
  if(!navigator.locks)throw Error('Open dit CRM in een recente browser om veilig te synchroniseren.');
  let reply;
  await navigator.locks.request('crm-gmail-phase-auto-'+company.id,async()=>{reply=await syncOrder(orderId);});
  if(!reply.result.conflict){if(reply.changed)render();toast('Fase van dossier en gekoppelde gesprekken is bijgewerkt.');return;}
  const result=reply.result;let changed=false;
  openForm('Verschillende verkoopfases',`<p>${esc(result.message)}</p><p>CRM-registratie: <strong>${esc(funnelPhaseLabel(result.crmPhase,company.id))}</strong></p>${result.phases.map(t=>`<p>Gmail ${esc(t.threadId)}: ${t.phases.length?t.phases.map(p=>esc(funnelPhaseLabel(p,company.id))).join(', '):'geen verkoopfaselabel'}</p>`).join('')}<label>Te gebruiken fase<select name="phase">${result.candidates.map(p=>`<option value="${p}">${esc(funnelPhaseLabel(p,company.id))}</option>`).join('')}</select></label><label class="check-row"><input name="confirm" type="checkbox" required>Gebruik deze fase voor het dossier en alle gekoppelde gesprekken. Dit registreert geen betaling, verzending of levering.</label>`,async fd=>{
   if(!fd.has('confirm'))throw Error('Bevestig eerst welke fase klopt.');
   await navigator.locks.request('crm-gmail-phase-auto-'+company.id,async()=>{const response=await syncOrder(orderId,{phase:fd.get('phase'),confirmation:phaseResolveConfirmation,reviewToken:result.reviewToken});if(response.result.conflict)throw Error('De fases zijn weer gewijzigd. Open het conflict opnieuw.');changed=response.changed;});
  },{trackChanges:false,afterSave:()=>{if(changed)render();paint();toast('Fasekeuze verwerkt');}});
 }
 const api={settings,mount:paint,get active(){return !!configuration?.active;},start(){if(started||!available)return;started=true;timer=setInterval(()=>void round(),60000);schedule();},schedule};
 document.addEventListener('click',event=>{const button=event.target.closest('[data-phase-auto-settings],[data-phase-auto-review]');if(!button)return;const work=button.hasAttribute('data-phase-auto-review')?()=>review(button.dataset.phaseAutoReview):settings;button.disabled=true;Promise.resolve().then(work).catch(error=>toast(error.message)).finally(()=>button.disabled=false);});
 document.addEventListener('crm-data-changed',schedule);window.addEventListener('focus',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});document.addEventListener('close',schedule,true);window.addEventListener('pagehide',()=>{stopped=true;clearInterval(timer);clearTimeout(queued);});
 return api;
}
