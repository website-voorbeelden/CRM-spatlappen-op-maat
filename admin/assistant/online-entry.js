// Visible cloud entry without pretending the laptop-only agent service is hosted.
// No provider request, credential storage or automatic export of CRM records.
export function installOnlineAgentEntry({company,getContext=()=>null,openAiExport,toast}){
 const mobile=window.matchMedia?.('(max-width:760px)');
 const modifier=/Mac|iPhone|iPad/i.test(navigator.platform||'')?'⌘':'Ctrl';
 let root=null,host=null,dock=null,launcher=null,parking=null,opened=false,page='',returnFocus=null;
 const element=selector=>host?.querySelector(selector);
 function markup(){return '<div data-ai-page-anchor></div>';}
 function paintContext(){
  const context=getContext();
  element('[data-agent-company]').textContent=company.name;
  element('[data-agent-context]').textContent=context?.selected?.label||context?.reference?.label||context?.label||'Huidige pagina';
 }
 function place(){
  const slot=root?.querySelector(mobile?.matches?'[data-ai-mobile-launcher-slot]':'[data-ai-launcher-slot]')||root?.querySelector('[data-ai-launcher-slot]');
  (slot||parking).append(launcher);
  const feedback=document.querySelector('.feedback-launcher'),feedbackSlot=root?.querySelector(mobile?.matches?'[data-feedback-mobile-launcher-slot]':'[data-ai-feedback-slot]');
  if(feedback&&feedbackSlot)feedbackSlot.append(feedback);
  const shell=root?.querySelector('.shell');if(shell)shell.inert=!!mobile?.matches&&opened;
  dock.setAttribute('aria-modal',String(!!mobile?.matches&&opened));
 }
 function initialize(){
  if(host)return;
  parking=document.createElement('div');parking.hidden=true;document.body.append(parking);
  dock=document.createElement('section');dock.id='crm-online-agent-dock';dock.className='assistant-dock';dock.hidden=true;dock.setAttribute('role','dialog');dock.setAttribute('aria-label','Agent');document.body.append(dock);
  host=document.createElement('div');host.className='assistant-view online-agent-view';
  host.innerHTML=`<div class="assistant-heading"><div class="assistant-title"><span class="assistant-mark" aria-hidden="true">✦</span><div><h1>Agent</h1><span class="assistant-connection-state">Online agent nog niet gekoppeld</span></div></div><div class="assistant-header-actions"><button type="button" data-agent-close aria-label="Agent sluiten">✕</button></div></div><div class="assistant-scroll"><section class="online-agent-status"><h2>Agentverbinding</h2><p>De geïntegreerde agent draait momenteel in het lokale CRM op je laptop. Deze online versie heeft nog geen eigen agentdienst.</p><p>Je kunt wel gegevens van deze pagina klaarzetten voor een AI. Je kiest zelf welke informatie je kopieert of downloadt; er wordt hier niets automatisch naar een AI gestuurd.</p><button type="button" class="primary" data-agent-export>Gegevens voor AI klaarzetten</button></section><section class="online-agent-question"><label>Vraag of opdracht<textarea data-agent-question rows="6" maxlength="12000" placeholder="Schrijf je vraag of bekijk hier de geselecteerde mailtekst…"></textarea></label><div class="actions"><button type="button" data-agent-copy>Vraag kopiëren</button></div><p class="form-help">Dit kopieert alleen de tekst hierboven. Klantgegevens voeg je bewust toe via Gegevens voor AI klaarzetten.</p><p data-agent-status role="status"></p></section></div><div class="assistant-context"><strong data-agent-company></strong><span data-agent-context></span></div>`;
  dock.append(host);
  launcher=document.createElement('button');launcher.type='button';launcher.className='assistant-launcher';launcher.innerHTML='<span>✦ Agent</span><kbd></kbd>';launcher.querySelector('kbd').textContent=modifier+' O';launcher.title='Agent openen · online koppeling nog niet ingericht';launcher.setAttribute('aria-controls',dock.id);launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-expanded','false');launcher.onclick=()=>opened?close():open();parking.append(launcher);
  element('[data-agent-close]').onclick=close;
  element('[data-agent-export]').onclick=()=>{close();if(openAiExport)openAiExport();else toast('Gebruik Exporteren voor AI bovenaan de pagina.');};
  element('[data-agent-copy]').onclick=async()=>{
   const input=element('[data-agent-question]'),status=element('[data-agent-status]'),button=element('[data-agent-copy]');
   if(!input.value.trim()){status.textContent='Vul eerst een vraag in.';input.focus();return;}
   button.disabled=true;button.textContent='Kopiëren…';
   try{await navigator.clipboard.writeText(input.value);status.textContent='Vraag gekopieerd. Plak hem zelf in je AI.';}
   catch{input.focus();input.select();status.textContent='Automatisch kopiëren lukt niet. De tekst is geselecteerd; kopieer met '+modifier+' C.';}
   finally{button.disabled=false;button.textContent='Vraag kopiëren';}
  };
 }
 function open(){
  if(document.querySelector('dialog[open]')){toast('Rond je geopende formulier eerst af of sluit het.');return false;}
  initialize();returnFocus=document.activeElement;
  if(page!=='assistant'){opened=true;dock.hidden=false;if(host.parentElement!==dock)dock.append(host);document.body.classList.add('assistant-open');launcher.setAttribute('aria-expanded','true');}
  paintContext();place();element(page==='assistant'?'[data-agent-question]':'[data-agent-close]').focus({preventScroll:true});return true;
 }
 function close(){
  if(!dock)return;opened=false;dock.hidden=true;document.body.classList.remove('assistant-open');launcher.setAttribute('aria-expanded','false');place();
  if(page==='assistant')root?.querySelector('[data-ai-page-anchor]')?.append(host);
  (returnFocus?.isConnected?returnFocus:launcher).focus();
 }
 function mount(nextRoot,newPage){
  root=nextRoot;page=newPage;initialize();
  if(page==='assistant'){opened=false;dock.hidden=true;document.body.classList.remove('assistant-open');root.querySelector('[data-ai-page-anchor]')?.append(host);element('[data-agent-close]').hidden=true;}
  else{element('[data-agent-close]').hidden=false;if(host.parentElement!==dock)dock.append(host);dock.hidden=!opened;document.body.classList.toggle('assistant-open',opened);}
  place();paintContext();
 }
 function beforeRender(){if(root?.querySelector('.shell'))root.querySelector('.shell').inert=false;if(host&&page==='assistant')parking.append(host);}
 window.addEventListener('keydown',event=>{
  if(event.defaultPrevented||document.body.classList.contains('feedback-picking'))return;
  if(event.key==='Escape'&&opened){event.preventDefault();close();return;}
  if(event.key.toLowerCase()==='o'&&(event.metaKey||event.ctrlKey)&&!event.altKey&&!event.shiftKey&&!event.repeat){if(document.querySelector('dialog[open]'))return;event.preventDefault();opened?close():open();return;}
  if(event.key==='Tab'&&opened&&mobile?.matches){const controls=[...host.querySelectorAll('button,textarea')].filter(c=>!c.disabled&&!c.hidden);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
 mobile?.addEventListener?.('change',()=>{if(host)place();});
 return {enabled:true,connected:false,markup,mount,beforeRender,open,openPrompt(text){if(!open())return;element('[data-agent-question]').value=String(text).slice(0,12000);element('[data-agent-status]').textContent='Tekst staat klaar. De online agent is nog niet gekoppeld; er is niets verstuurd.';}};
}
