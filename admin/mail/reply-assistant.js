import {assistantTransport} from '../assistant/laptop-transport.js?v=laptop-bridge-20261021';
import {mailReplyContext,manualReplyPrompt,parseMailReplySuggestion,mailReplyHistory} from '../../shared/mail-reply-assistant.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const signature=value=>JSON.stringify(value);
// Provenance is regenerated with a fresh timestamp by mailSeed; compare the
// actual envelope/concept fields, not that incidental read-time metadata.
const seedSignature=value=>{const {provenance,...fields}=value;return signature(fields);};

// Conversation sessions live in this tab. Only explicitly saved working notes
// enter the existing company state; no second mail store or provider thread.
export function createReplyAssistant({company,runtime,getState,mergeStoredState,toast}){
 const sessions=new Map(),transport=assistantTransport({companyId:company.id,runtime});
 async function call(path,input,signal){return transport.request(path,input,AbortSignal.any([AbortSignal.timeout(input?.task==='mail-reply'?120000:10000),signal].filter(Boolean)));}
 function mount(host,{key,ownerId,subject,getMessages,getSeed,onUse}){
  if(!host)return;
  const saved=()=>getState().mailReplyGuidance?.find(entry=>entry.key===key);
  const sessionKey=company.id+'|'+ownerId+'|'+key;
  let session=sessions.get(sessionKey);
  if(!session){const entry=saved();session={guidance:entry?.ownerId===ownerId?String(entry.notes||''):'',savedGuidance:signature(entry??null),question:'',manual:'',history:[],result:null,prepared:null,includeDossier:true,includeNotes:false,open:false,status:'',model:'',models:[],job:null};sessions.set(sessionKey,session);}
  const local=!runtime.offlineReview&&['local','cloud'].includes(runtime.mode);
  host.innerHTML=`<details class="mail-reply-assistant" ${session.open?'open':''}><summary>✦ Antwoordhulp <span>met context van dit gesprek</span></summary><div class="mail-reply-assistant-body"><p class="form-help">Vraag om een antwoord of verfijn het samen. Alleen dit geladen gesprek gaat mee, met de hieronder gekozen dossiergegevens. Er wordt niets verstuurd.</p><label>Wat wil je antwoorden of uitzoeken?<textarea data-reply-question rows="2" maxlength="6000" placeholder="Bijvoorbeeld: reageer vriendelijk, vraag naar de gewenste dikte en beloof nog geen leverdatum.">${esc(session.question)}</textarea></label><div class="actions">${local?'<button type="button" class="primary" data-reply-generate>Antwoord maken</button><button type="button" data-reply-stop hidden>Stop</button>':''}<button type="button" ${local?'':'class="primary"'} data-reply-copy>Context kopiëren voor ChatGPT</button><a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT openen ↗</a></div>${local?'<label class="mail-reply-model">Model<select data-reply-model><option value="">Model wordt bij openen opgehaald</option></select></label><p data-reply-connection class="form-help"></p><a href="#assistant">Agent-verbinding instellen →</a>':'<p class="form-help">Rechtstreeks genereren via de online Agent is nog niet gekoppeld. Kopieer de context, plak die in ChatGPT en lees het antwoord hieronder in.</p>'}<p data-reply-status role="status"></p><details data-reply-context><summary>Context & werkinstructies</summary><p data-reply-context-summary></p><label class="check-row"><input type="checkbox" data-reply-dossier ${session.includeDossier?'checked':''}> Gekoppelde klant en order meenemen</label><label class="check-row"><input type="checkbox" data-reply-notes ${session.includeNotes?'checked':''}> Interne klant- en ordernotities ook meenemen</label><label>Werkinstructies voor dit gesprek<textarea data-reply-guidance rows="3" maxlength="6000" placeholder="Bijvoorbeeld: deze klant wil korte antwoorden; eerst akkoord op de tekening vragen.">${esc(session.guidance)}</textarea></label><button type="button" data-reply-save-guidance>Instructies bij gesprek bewaren</button><button type="button" data-reply-reload-guidance>Bewaarde instructies ophalen</button><p class="form-help">Alleen deze instructies worden na bewaren in het CRM opgeslagen. Vragen en AI-antwoorden blijven in dit tabblad. Bijlagen worden niet gelezen. Inkoopprijzen en providergegevens gaan niet mee.</p><button type="button" data-reply-show-context>Precies bekijken wat meegaat</button><pre data-reply-context-preview hidden></pre><label data-reply-prompt-label hidden>Prompt om zelf te kopiëren<textarea data-reply-prompt rows="8" readonly></textarea></label></details><details data-reply-manual><summary>Antwoord uit ChatGPT inlezen</summary><label>Plak het complete JSON-antwoord<textarea data-reply-import rows="4" maxlength="50000" spellcheck="false">${esc(session.manual)}</textarea></label><button type="button" data-reply-import-button>Antwoord inlezen</button></details><section class="mail-reply-suggestion" data-reply-result hidden><h4>Voorgesteld antwoord</h4><pre data-reply-body></pre><div data-reply-points></div><div class="actions"><button type="button" data-reply-use>Gebruik antwoord in concept</button><button type="button" data-reply-copy-answer>Antwoord kopiëren</button></div><p class="form-help">Alleen je antwoordtekst wordt vervangen. Afzender, ontvanger, onderwerp, bijlagen en replykoppeling blijven staan. Controleer het concept en bekijk daarna het verzendvoorbeeld.</p></section><details data-reply-history><summary data-reply-history-label>Vragen in dit gesprek</summary><div data-reply-history-content></div><button type="button" data-reply-clear>Nieuwe denksessie</button></details></div></details>`;
  const element=selector=>host.querySelector(selector),details=element('.mail-reply-assistant');
  function context(){return mailReplyContext({companyId:company.id,state:getState(),ownerId,key,subject,messages:getMessages(),draft:getSeed(),includeDossier:session.includeDossier,includeNotes:session.includeDossier&&session.includeNotes});}
  function paint(){
   if(!host.isConnected)return;
   element('[data-reply-status]').textContent=session.status;
   host.setAttribute('aria-busy',String(!!session.job||!!session.preparing));
   for(const button of host.querySelectorAll('button'))button.disabled=!!session.job||!!session.preparing;
   const generate=element('[data-reply-generate]');if(generate)generate.textContent=session.job?'Antwoord maken…':session.preparing?'Verbinding controleren…':'Antwoord maken';
   const stop=element('[data-reply-stop]');if(stop){stop.hidden=!session.job;stop.disabled=!session.job||session.job.stopping;}
   const result=session.result;element('[data-reply-result]').hidden=!result;
   element('[data-reply-save-guidance]').disabled=!!session.job||!ownerId;element('[data-reply-save-guidance]').title=ownerId?'':'Koppel dit gesprek eerst aan een klant om instructies blijvend te bewaren';
   if(result){element('[data-reply-body]').textContent=result.reply;element('[data-reply-use]').disabled=!!session.job||!result.reply||!ownerId;element('[data-reply-use]').title=ownerId?'':'Koppel het gesprek eerst aan een klant om hier een concept te gebruiken';element('[data-reply-copy-answer]').disabled=!!session.job||!result.reply;const points=element('[data-reply-points]');points.replaceChildren();for(const [title,values] of [['Let op',result.notes],['Nog aan jou te vragen',result.questions]])if(values.length){const heading=document.createElement('strong'),list=document.createElement('ul');heading.textContent=title;for(const value of values){const item=document.createElement('li');item.textContent=value;list.append(item);}points.append(heading,list);}}
   const log=element('[data-reply-history-content]');log.replaceChildren();element('[data-reply-history-label]').textContent='Vragen in dit gesprek ('+session.history.filter(entry=>entry.role==='user').length+')';
   for(const entry of session.history){const card=document.createElement('p');card.textContent=(entry.role==='user'?'Jij: ':'Antwoordhulp: ')+(entry.display||entry.content);log.append(card);}
   try{const current=context();element('[data-reply-context-summary]').textContent=current.messages.length+' geladen berichten'+(current.limits.omitted?' · '+current.limits.omitted+' oudere berichten weggelaten':'')+(current.limits.truncated?' · tekst ingekort':'')+' · '+company.name+(current.customer?' · '+current.customer.company:' · geen klantgegevens')+(current.order?' · order #'+(current.order.sourceNumber||current.order.number):'');}
   catch(error){element('[data-reply-context-summary]').textContent=error.message;}
  }
  session.paint=paint;
  function status(value){session.status=value;session.paint?.();}
  function prepare(){
   const current=context(),seed=getSeed();
   const prepared={id:crypto.randomUUID(),context:current,seed:seedSignature(seed),guidance:session.guidance,includeDossier:session.includeDossier,includeNotes:session.includeNotes,message:session.question.trim()||'Maak een passend antwoord op het laatste klantbericht. Vraag mij eerst wat nog nodig is.',history:mailReplyHistory(session.history)};
   session.prepared=prepared;return prepared;
  }
  function accept(proposal,prepared){
   session.result={...proposal,prepared};
   const sameScope=prepared.includeDossier===session.includeDossier&&prepared.includeNotes===session.includeNotes;
   if(sameScope)session.history.push({role:'user',content:prepared.message},{role:'assistant',content:JSON.stringify(proposal),display:[proposal.reply,...proposal.notes,...proposal.questions].filter(Boolean).join('\n')});
   session.history=session.history.slice(-16);session.manual='';element('[data-reply-import]').value='';
   status(!sameScope?'Dit voorstel gebruikt de eerdere contextkeuze. Maak een nieuw voorstel met je huidige keuze.':proposal.questions.length?'Voorstel klaar. Beantwoord de vragen hierboven in je volgende opdracht.':'Antwoord klaar. Controleer de tekst en kies Gebruik antwoord in concept.');
  }
  let refreshing=null;
  function refreshConnection(){
   if(!local||session.job)return Promise.resolve();if(refreshing)return refreshing;
   refreshing=(async()=>{
   try{const connection=await call('status');if(!host.isConnected)return;const profile=connection.profiles?.find(profile=>profile.active)?.id||'';
    if(session.profile&&session.profile!==profile){session.history=[];session.prepared=null;session.result=null;session.models=[];session.model='';}session.profile=profile;
    if(!connection.sharing||connection.pending){element('[data-reply-connection]').textContent=connection.error||(connection.pending?'Rond de ChatGPT-aanmelding af bij Agent.':'Verbind je ChatGPT-account via Agent. Kopiëren en terugplakken kan ook.');session.models=[];session.model='';}
    else{session.models=(await call('models')).models||[];if(!session.models.some(model=>model.id===session.model)){let preferred='';try{preferred=JSON.parse(localStorage.getItem(company.id+':assistant-preferences')||'{}').modelId||'';}catch{}session.model=session.models.some(model=>model.id===preferred)?preferred:session.models[0]?.id||'';}if(host.isConnected)element('[data-reply-connection]').textContent='Via je gekoppelde ChatGPT-account · '+connection.email;}
    if(host.isConnected){const select=element('[data-reply-model]');select.replaceChildren();for(const model of session.models){const option=document.createElement('option');option.value=model.id;option.textContent=model.name;select.append(option);}if(!session.models.length){const option=document.createElement('option');option.textContent='Verbind eerst bij Agent';option.value='';select.append(option);}select.value=session.model;session.paint?.();}
   }catch(error){if(host.isConnected)element('[data-reply-connection]').textContent=error.message;}
   finally{refreshing=null;}
   })();return refreshing;
  }
  details.addEventListener('toggle',()=>{session.open=details.open;if(details.open){paint();void refreshConnection();}});
  element('[data-reply-question]').oninput=event=>{session.question=event.target.value;};
  element('[data-reply-guidance]').oninput=event=>{session.guidance=event.target.value;};
  element('[data-reply-import]').oninput=event=>{session.manual=event.target.value;};
  element('[data-reply-dossier]').onchange=event=>{session.includeDossier=event.target.checked;session.history=[];session.prepared=null;status('Contextkeuze gewijzigd. Volgende vragen starten met deze selectie; je mailconcept blijft staan.');};
  element('[data-reply-notes]').onchange=event=>{session.includeNotes=event.target.checked;session.history=[];session.prepared=null;status('Contextkeuze gewijzigd. Eerdere AI-geschiedenis gaat niet opnieuw mee; je mailconcept blijft staan.');};
  element('[data-reply-model]')?.addEventListener('change',event=>{session.model=event.target.value;});
  element('[data-reply-show-context]').onclick=()=>{try{const preview=element('[data-reply-context-preview]');preview.textContent=JSON.stringify(context(),null,2);preview.hidden=false;}catch(error){status(error.message);}};
  element('[data-reply-reload-guidance]').onclick=()=>{const entry=saved(),notes=entry?.ownerId===ownerId?String(entry.notes||''):'';if(session.guidance!==notes&&!confirm('De instructies in dit veld vervangen door de bewaarde versie? Je vraag en antwoordconcept blijven staan.'))return;session.guidance=notes;session.savedGuidance=signature(entry??null);element('[data-reply-guidance]').value=notes;status('Bewaarde instructies opgehaald.');};
  element('[data-reply-save-guidance]').onclick=async()=>{
   const button=element('[data-reply-save-guidance]');button.disabled=true;button.textContent='Bewaren…';const notes=session.guidance.trim();
   try{await mergeStoredState(state=>{if(![...state.orders,...state.customers].some(record=>record.id===ownerId))throw Error('Het gekoppelde dossier bestaat niet meer.');const existing=state.mailReplyGuidance?.find(entry=>entry.key===key);if(signature(existing??null)!==session.savedGuidance)throw Error('De instructies zijn elders gewijzigd. Open het gesprek opnieuw voordat je ze vervangt.');state.mailReplyGuidance??=[];state.mailReplyGuidance=state.mailReplyGuidance.filter(entry=>entry.key!==key);if(notes){if(state.mailReplyGuidance.length>=1000)throw Error('Er zijn al instructies bij 1.000 gesprekken. Verwijder eerst oude instructies.');state.mailReplyGuidance.push({key,ownerId,notes,updatedAt:new Date().toISOString()});}});session.savedGuidance=signature(saved()??null);status('Werkinstructies bij dit gesprek bewaard. Er is geen mail opgeslagen of verstuurd.');}
   catch(error){status(error.message);}finally{button.disabled=false;button.textContent='Instructies bij gesprek bewaren';}
  };
  element('[data-reply-copy]').onclick=async()=>{
   try{const prepared=prepare(),prompt=manualReplyPrompt({companyId:company.id,requestId:prepared.id,context:prepared.context,message:prepared.message,guidance:prepared.guidance,history:prepared.history});element('[data-reply-prompt]').value=prompt;element('[data-reply-manual]').open=true;
    try{await navigator.clipboard.writeText(prompt);status('Context en opdracht gekopieerd. Plak in ChatGPT; plak daarna het JSON-antwoord hieronder terug.');}
    catch{element('[data-reply-context]').open=true;element('[data-reply-prompt-label]').hidden=false;element('[data-reply-prompt]').focus();element('[data-reply-prompt]').select();status('Automatisch kopiëren lukt niet. De complete prompt is geselecteerd; kopieer die zelf.');}
   }catch(error){status(error.message);}
  };
  element('[data-reply-import-button]').onclick=()=>{try{if(!session.prepared)throw Error('Kopieer eerst de context voor dit gesprek.');accept(parseMailReplySuggestion(session.manual,session.prepared.id),session.prepared);}catch(error){status(error.message);}};
  element('[data-reply-generate]')?.addEventListener('click',async()=>{
   if(session.job||session.preparing)return;
   session.preparing=true;paint();
   try{await refreshConnection();}finally{session.preparing=false;paint();}
   if(!session.model){status('Koppel eerst je ChatGPT-account bij Agent, of kies Context kopiëren.');return;}
   let prepared;try{prepared=prepare();}catch(error){status(error.message);return;}
   const job={id:prepared.id,controller:new AbortController(),stopping:false};session.job=job;status('Antwoord maken met de context van dit gesprek…');
   try{const result=await call('chat',{task:'mail-reply',requestId:job.id,companyId:company.id,model:session.model,message:prepared.message,guidance:prepared.guidance,history:prepared.history,mailContext:prepared.context},job.controller.signal);if(job.stopping)return;if(result.task!=='mail-reply')throw Error('De Agent gebruikt een oudere versie. Laat de dienst bijwerken; je concept blijft staan.');const checked=parseMailReplySuggestion(JSON.stringify(result.suggestion),job.id);accept(checked,prepared);}
   catch(error){status(job.stopping?'Gestopt. Je vraag en antwoordconcept blijven staan.':error.message);}
   finally{if(session.job===job)session.job=null;session.paint?.();}
  });
  element('[data-reply-stop]')?.addEventListener('click',async()=>{const job=session.job;if(!job||job.stopping)return;job.stopping=true;status('Antwoord stoppen…');try{await call('stop',{requestId:job.id});}catch{status('Stoppen op de server is niet bevestigd. Een later antwoord wordt hier genegeerd; gebruik kan nog doorlopen.');}finally{job.controller.abort();}});
  element('[data-reply-copy-answer]').onclick=async()=>{try{if(!session.result?.reply)throw Error('Er staat nog geen antwoord klaar.');await navigator.clipboard.writeText(session.result.reply);status('Antwoordtekst gekopieerd. Er is niets verstuurd.');}catch(error){status(error.message||'Kopieer de tekst uit het voorgestelde antwoord.');}};
  element('[data-reply-use]').onclick=()=>{
   try{const result=session.result;if(!result?.reply||!host.isConnected)throw Error('Maak eerst een antwoord voor dit gesprek.');if(signature(context())!==signature(result.prepared.context)||seedSignature(getSeed())!==result.prepared.seed||session.guidance!==result.prepared.guidance)throw Error('Je concept, context of instructies zijn intussen gewijzigd. Maak of kopieer een nieuw voorstel; je huidige antwoord blijft staan.');onUse(result.reply);status('Antwoord in je concept gezet. Nog niet opgeslagen of verstuurd.');toast('Antwoord overgenomen · controleer het concept');}
   catch(error){status(error.message);}
  };
  element('[data-reply-clear]').onclick=()=>{if(!confirm('De vragen en AI-antwoorden van deze denksessie wissen? Je mailconcept en bewaarde werkinstructies blijven staan.'))return;session.history=[];session.result=null;session.prepared=null;status('Nieuwe denksessie voor dit gesprek.');};
  paint();if(session.open)void refreshConnection();
 }
 return {mount};
}
