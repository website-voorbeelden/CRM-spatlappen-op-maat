import {createWorkspaceNotifications} from './workspace/notifications.js?v=payment-alerts-20261027';
import {captureMailPhaseUndo,undoMailPhase} from '../shared/funnel-phase-undo.js?v=ui-batch234-20261027';
import {createPhaseNoticePreference} from './workspace/phase-notice-preference.js?v=central-overview-20261027';
import {orderReadiness} from '../shared/order-readiness.js?v=ui-batch234-20261027';
import {taskListMarkup} from './workspace/task-list.js?v=excel-style-20261027';
import {workQueue} from '../shared/work-queue.js?v=ui-batch234-20261027';
import {funnelPhasesFor,funnelPhaseLabel,salesFunnel,registerFunnel,funnelMail,pendingFunnelMail,reviewFunnelMail} from '../shared/sales-funnel.js?v=ui-batch234-20261027';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createSalesFunnelUI({getState,company,openForm,mergeStoredState,render,toast,compose,requestSpecs,calculate,documentMail,payment,editOrder,releaseProduction,syncGmailPhase,isAutoPhaseSync}){
 const phaseNotice=createPhaseNoticePreference(company.id);
 const notifications=createWorkspaceNotifications({companyId:company.id,toast});
 let filter='';const funnelPhases=funnelPhasesFor(company.id);
 const syncOption=o=>!isAutoPhaseSync?.()&&company.id==='maatwerkkunststof'&&getState().mailThreads?.some(t=>t.orderId===o.id&&t.gmailThreadId)?'<label class="check-row"><input type="checkbox" name="syncGmail">Hierna ook het Gmail-verkoopfaselabel controleren en bijwerken</label>':'';
 const phaseMarkup=f=>f.gmail||f.automaticPricing||f.automaticMail?`<span class="source-mark source-automatic" data-source-kind="automatic" tabindex="0" title="${f.gmail?'Automatisch gelijkgehouden met Gmail; dit is geen betaal- of leverbewijs':f.automaticMail?'Automatisch uit een aangeboden mail; geen aflever-, betaal- of leverbewijs':'Automatisch: benodigde aanvraaggegevens zijn aanwezig; nog geen prijsafspraak'}">${esc(f.label)}</span>`:esc(f.label);
 const info=o=>salesFunnel(getState(),o,company.id);
 const button=(action,label,id,primary=false)=>`<button type="button" ${primary?'class="primary" ':''}data-funnel-action="${action}" data-id="${esc(id)}">${label}</button>`;
 function reviewMail(id,{automatic=false}={}){
  const o=getState().orders.find(o=>o.id===id);if(!o)return;
  const pending=pendingFunnelMail(getState(),o,company.id);if(!pending||automatic&&phaseNotice.hidden())return;
  // A late completion may not replace another open editor.
  if(document.querySelector('#dialog')?.open)return;
  let sync=false,form;const expected=JSON.stringify(o),label=funnelPhaseLabel(pending.phase,company.id);
  const savePreference=()=>!form||phaseNotice.setHidden(form.elements.hidePhaseNotice.checked);
  openForm('Door naar de volgende fase?',`<p>Van <strong>${esc(info(o).label)}</strong> naar <strong>${esc(label)}</strong>.</p><p>De mail is aangeboden. Deze keuze wijzigt alleen de verkoopfase.</p><input type="hidden" name="decision" value="confirm"><label class="check-row"><input type="checkbox" name="hidePhaseNotice" ${phaseNotice.hidden()?'checked':''}>Niet meer automatisch tonen in deze browser</label><p class="form-help">Je kunt het voorstel later nog openen bij Volgende stap. Verbergen bevestigt geen fase en registreert geen betaling of levering.</p>${syncOption(o)}`,async fd=>{
   sync=fd.has('syncGmail');const decision=fd.get('decision');form.elements.decision.value='confirm';
   if(!['confirm','keep'].includes(decision))throw Error('Kies of je de fase wilt aanpassen.');
   await mergeStoredState(next=>reviewFunnelMail(next,id,pending.id,decision==='confirm',{expected,companyId:company.id}));
   const saved=savePreference();toast((decision==='confirm'?'Fase bijgewerkt':'Huidige fase behouden')+(saved?'':' · meldingskeuze alleen voor dit tabblad'));
  },{afterSave:()=>{render();if(sync)syncGmailPhase?.(o.id).catch(error=>toast(error.message));},afterCancel:()=>{if(!savePreference())toast('Deze meldingskeuze geldt alleen voor dit tabblad; bewaren in de browser is niet gelukt.');},trackChanges:false});
  form=document.querySelector('#dialog form');form.querySelector('[type=submit]').textContent='Door naar '+label;
  form.querySelector('#cancel').textContent='Later';
  const keep=document.createElement('button');keep.type='button';keep.textContent='Huidige fase behouden';
  keep.onclick=()=>{if(form.inert)return;form.elements.decision.value='keep';form.requestSubmit();};
  form.querySelector('.dialog-footer').prepend(keep);
 }

 // Accepted mail supplies the phase; this non-modal notice never gates it.
 function notifyMailPhase(id,{draftId,beforePhase}){
  if(phaseNotice.hidden())return;
  const state=getState(),o=state.orders.find(order=>order.id===id);if(!o)return;
  const undo=captureMailPhaseUndo(state,o,{draftId,beforePhase,companyId:company.id});if(!undo)return;
  notifications.add('phase:'+id+':'+draftId,{
   title:'Fase bijgewerkt',group:'phase:'+id,
   label:'Order #'+(o.sourceNumber||o.number)+' · '+funnelPhaseLabel(undo.beforePhase,company.id)+' → '+funnelPhaseLabel(undo.afterPhase,company.id),
   href:'#orders/'+encodeURIComponent(id)+'/overview',openLabel:'Bekijken',keepOnOpen:true,
   onOpen:()=>{if(!getState().orders.some(order=>order.id===id))throw Error('Dit dossier bestaat niet meer.');},
   actions:[{label:'Terugdraaien',run:async()=>{
    await mergeStoredState(next=>undoMailPhase(next,undo,{companyId:company.id}));
    render();toast('Fase teruggedraaid naar '+funnelPhaseLabel(undo.beforePhase,company.id));
   }}]
  });
 }

 function noticeSettings(){
  if(document.querySelector('#dialog')?.open)return;
  openForm('Fase-meldingen',`<label class="check-row"><input type="checkbox" name="showPhaseNotices" ${phaseNotice.hidden()?'':'checked'}>Automatische fasemeldingen tonen</label><p>Alleen de meldingen in dit bedrijf en deze browser. Fases blijven bekende gegevens volgen.</p>`,async fd=>{if(!phaseNotice.setHidden(!fd.has('showPhaseNotices')))toast('Meldingskeuze alleen voor dit tabblad; bewaren in de browser is niet gelukt.');},{trackChanges:false});
 }

 function priorities(){return taskListMarkup(workQueue(getState(),company.id));}
 function navigation(){const counts=Object.fromEntries(funnelPhases.map(([id])=>[id,0]));for(const o of getState().orders)counts[info(o).displayPhase]++;return `<details class="sidebar-funnel" open><summary>Fases <span>${getState().orders.length}</span></summary><div>${[['','Alle aanvragen & orders'],...funnelPhases,['followup','Opvolging nodig']].map(([id,label])=>`<button type="button" data-funnel-select="${id}" class="${filter===id?'selected':''}">${esc(label)} <small>${id==='followup'?getState().orders.filter(o=>info(o).followup).length:id?counts[id]:getState().orders.length}</small></button>`).join('')}</div></details>`;}
 function controls(){const counts=Object.fromEntries(funnelPhases.map(([id])=>[id,0]));for(const o of getState().orders)counts[info(o).displayPhase]++;return `<div class="funnel-filters"><label>Fase in de funnel<select data-funnel-filter><option value="">Alle fases</option>${funnelPhases.map(([id,label])=>`<option value="${id}" ${filter===id?'selected':''}>${label} (${counts[id]})</option>`).join('')}<option value="followup" ${filter==='followup'?'selected':''}>Opvolging nodig</option></select></label><p>Elke aanvraag blijft één dossier, van eerste contact tot levering. ${company.id==='maatwerkkunststof'?'08 Afgerond':'Geleverd / gearchiveerd'} toont ook afgeronde dossiers.</p></div>`;}
 function row(o,{compact=false}={}){const f=info(o);return `<div class="funnel-row"><span>${phaseMarkup(f)}</span><small>${f.missing.length?f.missing.length+' specificaties nog nodig':'Specificaties aanwezig'}${f.daysSinceContact!=null?' · '+f.daysSinceContact+' dagen sinds laatste registratie/verzending':''}</small>${compact?'<details class="order-row-next"><summary>Volgende actie</summary>':''}<div class="actions">${button(f.followup?'followup':f.next[0],f.followup?'Opvolgmail voorbereiden':f.next[1],o.id)}</div>${f.followup?'<small>Geen nieuw opgeslagen antwoord. Controleer ook het mailgesprek.</small>':''}${compact?'</details>':''}</div>`;}
 function compactPanel(o,f,readiness,next,showPhase){
  const reason=readiness.inbound&&!readiness.gaps.length?'De belangrijke levergegevens zijn aanwezig. Registreer levering pas wanneer die werkelijk heeft plaatsgevonden.':(readiness.inbound||readiness.paid)&&readiness.gaps.length?'Nog te controleren: '+readiness.gaps.map(c=>esc(c.label)).join(', '):f.missing.length?'Nog nodig: '+f.fields.filter(v=>!v.complete).map(v=>esc(v.label)).join(', '):'De benodigde aanvraaggegevens zijn ingevuld.';
  const history=f.events.length?f.events.slice(-12).reverse().map(e=>'<p>'+esc(e.phase==='invoice'?'Factuur verstuurd':e.phase==='followup'?'Opvolgmail':funnelPhaseLabel(e.phase,company.id))+' · '+esc(e.at.slice(0,10))+' · '+esc(e.note||'')+'</p>').join(''):'<p>Nog geen verzending of faseovergang geregistreerd.</p>';
  const linked=getState().mailThreads?.some(t=>t.orderId===o.id&&t.gmailThreadId);
  return `<section class="sales-funnel sales-funnel-compact" aria-label="Volgende stap">
   <div class="funnel-next-row"><div><h2>Volgende stap</h2>${showPhase?'<strong>'+phaseMarkup(f)+'</strong>':''}<p>${reason}</p>${f.missing.length?'<button type="button" class="funnel-fill-details" data-inquiry-edit="'+esc(o.id)+'">Zelf gegevens aanvullen →</button>':''}</div>
    <div class="actions">${pendingFunnelMail(getState(),o,company.id)?button('review','Fase na mail bevestigen',o.id):''}${button(next[0],next[1],o.id,true)}
     <details class="quiet-menu"><summary>Meer</summary><div>${showPhase?button('phase','Fase bijwerken',o.id):''}${f.followup?button('followup','Opvolgmail opstellen',o.id):''}${button('indication','Prijsindicatie opstellen',o.id)}${button('phase-notices','Fase-meldingen',o.id)}<a href="#orders/${esc(o.id)}/mail">Mailgesprek openen →</a>
      <details class="funnel-context"><summary>Toelichting & historie</summary>${f.daysSinceContact!=null?'<p>'+f.daysSinceContact+' dagen sinds de laatste geregistreerde verzending'+(f.hasSavedReply?' · er is een opgeslagen antwoord':' · controleer het gesprek op nieuwe reacties')+'.</p>':''}${linked?'<div class="actions"><button type="button" data-phase-auto-review="'+esc(o.id)+'">Gmail-fase controleren / conflict oplossen</button><button type="button" data-phase-auto-settings>Synchronisatie instellen</button></div>':''}<div class="funnel-history"><h3>Fasehistorie</h3>${history}</div></details>
     </div></details>
    </div>
   </div><p data-phase-auto-order="${esc(o.id)}" hidden></p>
  </section>`;
 }
 function panel(o,{showPhase=true,compact=false}={}){const f=info(o),readiness=orderReadiness(getState(),o,company.id,{funnel:f}),next=readiness.inbound?(readiness.next?[readiness.next.action,readiness.next.cta]:['delivery','Levering registreren']):readiness.paid&&readiness.next?[readiness.next.action,readiness.next.cta]:f.next;if(compact)return compactPanel(o,f,readiness,next,showPhase);return `<section class="order-surface sales-funnel"><div class="section-heading"><div><h2>Volgende stap</h2>${showPhase?'<strong>'+phaseMarkup(f)+'</strong>':''}</div>${showPhase?button('phase','Fase bijwerken',o.id):''}</div><p data-phase-auto-order="${esc(o.id)}" hidden></p>${getState().mailThreads?.some(t=>t.orderId===o.id&&t.gmailThreadId)?'<details class="quiet-menu"><summary>Gmail-fase</summary><div><button type="button" data-phase-auto-review="'+esc(o.id)+'">Synchronisatie controleren / conflict oplossen</button><button type="button" data-phase-auto-settings>Synchronisatie instellen</button></div></details>':''}<p>${readiness.inbound&&!readiness.gaps.length?'De belangrijke levergegevens zijn aanwezig. Registreer levering pas wanneer die werkelijk heeft plaatsgevonden.':(readiness.inbound||readiness.paid)&&readiness.gaps.length?'Nog te controleren: '+readiness.gaps.map(c=>esc(c.label)).join(', '):f.missing.length?'Nog nodig: '+f.fields.filter(v=>!v.complete).map(v=>esc(v.label)).join(', '):'De benodigde aanvraaggegevens zijn ingevuld.'}</p>${f.daysSinceContact!=null?'<p>'+f.daysSinceContact+' dagen sinds de laatste geregistreerde verzending'+(f.hasSavedReply?' · er is een opgeslagen antwoord':' · controleer het gesprek op nieuwe reacties')+'.</p>':''}<div class="actions">${pendingFunnelMail(getState(),o,company.id)?button('review','Fase na mail bevestigen',o.id):''}${button(next[0],next[1],o.id)}${f.followup?button('followup','Opvolgmail opstellen',o.id):''}<details class="quiet-menu"><summary>Meer acties</summary><div>${button('indication','Prijsindicatie opstellen',o.id)}${button('phase-notices','Fase-meldingen',o.id)}<a href="#orders/${esc(o.id)}/mail">Mailgesprek openen →</a></div></details></div><details><summary>Fasehistorie</summary>${f.events.length?f.events.slice(-12).reverse().map(e=>'<p>'+esc(e.phase==='invoice'?'Factuur verstuurd':e.phase==='followup'?'Opvolgmail':funnelPhaseLabel(e.phase,company.id))+' · '+esc(e.at.slice(0,10))+' · '+esc(e.note||'')+'</p>').join(''):'<p>Nog geen verzending of faseovergang geregistreerd.</p>'}</details></section>`;}
 function register(o,target='',afterSave){let sync=false;const current=info(o),expected=JSON.stringify(o);openForm('Fase van dit dossier bijwerken',`<p>Registreer alleen wat werkelijk is gebeurd. Een fase kiezen verstuurt geen mail en registreert geen betaling.</p><label>Fase<select name="phase">${funnelPhases.map(([id,label])=>`<option value="${id}" ${(target||current.displayPhase)===id?'selected':''}>${label}</option>`).join('')}</select></label>${afterSave?'':syncOption(o)}<label>Datum<input type="date" name="date" required value="${new Date().toISOString().slice(0,10)}"></label><label>Opvolgen na (dagen)<input name="followupDays" type="number" min="1" max="365" required value="${o.salesFunnel?.followupDays||7}"></label><label>Toelichting<textarea name="note" maxlength="2000"></textarea></label><label class="check-row"><input name="confirm" type="checkbox" required>Ik bevestig dat dit is gebeurd. Bij geleverd wordt het dossier gearchiveerd; ${company.tool==='design'?'productie vereist een gecontroleerde productievrijgave of volledige betaling met een verstuurde factuur.':'uitvoering vereist geregistreerde betaling en de benodigde factuur.'}</label>`,async fd=>{sync=fd.has('syncGmail');if(!fd.has('confirm'))throw Error('Bevestig eerst de registratie.');await mergeStoredState(next=>registerFunnel(next,o.id,{phase:fd.get('phase'),at:fd.get('date')+'T12:00:00.000Z',note:fd.get('note'),expected,followupDays:Number(fd.get('followupDays'))},{companyId:company.id}));toast('Fase bijgewerkt');},{afterSave:()=>{render();if(sync)syncGmailPhase?.(o.id).catch(error=>toast(error.message));else afterSave?.();}});}
 async function act(action,id,suggestedPhase=''){const o=getState().orders.find(o=>o.id===id);if(!o)throw Error('Dit dossier bestaat niet meer.');
 if(action==='production-release')return releaseProduction(id);
 if(action==='review')return reviewMail(id);
 if(action==='phase-notices')return noticeSettings();
 if(action==='delivery-details'){location.hash='orders/'+o.id+'/delivery';return;}
 if(action==='order-edit')return editOrder(o.id);
 if(action==='mail'){location.hash='orders/'+o.id+'/mail';return;}
 if(action==='phase'||action==='production'||action==='delivery')return register(o,action==='production'?'production':action==='delivery'?'delivered':suggestedPhase);
 if(action==='specs')return requestSpecs(o.id,{seed:{newMail:true},onUse:mail=>compose(o.id,'','','',{...mail,newMail:true,funnelPurpose:'specs'})});
 if(action==='calculate')return calculate(o.id);
 if(['quote','confirmation','invoice'].includes(action))return documentMail(o.id,action);
 if(action==='payment')return payment(o.id);
 if(action==='view'){location.hash='orders/'+o.id;return;}
 if(action==='documents'){location.hash='orders/'+o.id+'/documents';return;}
 if(action==='purchase'){location.hash='orders/'+o.id+'/costs';return;}
 if(['indication','followup'].includes(action)){const seed=funnelMail(getState(),o,company.id,action);return compose(o.id,'','','',{...seed,newMail:true,funnelPurpose:action});}
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-funnel-action]');if(b)Promise.resolve().then(()=>act(b.dataset.funnelAction,b.dataset.id,b.dataset.funnelPhase||'')).catch(e=>toast(e.message));});
 return {queue:()=>workQueue(getState(),company.id),priorities,reviewMail,notifyMailPhase,summary:()=>filter?'<p class="form-help">Fase: '+esc(filter==='followup'?'Opvolging nodig':funnelPhases.find(([id])=>id===filter)?.[1]||'Alle aanvragen')+' · kies een andere fase via Menu → Aanvragen & orders.</p>':'',navigation,controls,row,panel,info,matches:o=>!filter||(filter==='followup'?info(o).followup:info(o).displayPhase===filter),get filter(){return filter;},reset(){filter='';},install(root){for(const b of root.querySelectorAll('[data-funnel-select]'))b.onclick=()=>{filter=b.dataset.funnelSelect;location.hash='orders';render();};const select=root.querySelector('[data-funnel-filter]');if(select)select.onchange=()=>{filter=select.value;render();};}};
}
