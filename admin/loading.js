// Track actual promises, not every click or all network traffic. Progress is
// indeterminate: it never claims a percentage or completes before the work.
export function createActivityTracker({delay=500,now=()=>Date.now(),schedule=setTimeout,cancel=clearTimeout,onChange=()=>{}}={}){
 const tasks=new Map();let timer,shown=false,cycle=0,failed=false;
 const publish=()=>{const list=[...tasks.values()];onChange({visible:shown,active:list.length>0,count:list.length,label:list.at(-1)?.label||'',elapsed:list.length?Math.max(0,now()-list[0].started):0,failed});};
 function begin(label='Even geduld…',{key,button}={}){
  const fresh=!tasks.size;
  if(fresh){cycle++;cancel(timer);shown=false;failed=false;const current=cycle;timer=schedule(()=>{if(current===cycle&&tasks.size){shown=true;publish();}},delay);}
  const previous=button?{disabled:button.disabled,busy:button.getAttribute('aria-busy'),className:button.classList.contains('is-loading')}:null;
  if(button){button.disabled=true;button.setAttribute('aria-busy','true');button.classList.add('is-loading');}
  const token=Symbol(),task={label,started:now(),key};tasks.set(token,task);if(shown||fresh)publish();
  let finished=false;
  return ({error=false}={})=>{if(finished)return;finished=true;
   if(button){button.disabled=previous.disabled;if(previous.busy===null)button.removeAttribute('aria-busy');else button.setAttribute('aria-busy',previous.busy);button.classList.toggle('is-loading',previous.className);}
   failed||=error;tasks.delete(token);if(!tasks.size){cancel(timer);cycle++;publish();shown=false;}else if(shown)publish();};
 }
 return {begin,isBusy:key=>[...tasks.values()].some(t=>t.key===key),async run(label,work,options){const finish=begin(label,options);try{const value=await work();finish();return value;}catch(error){finish({error:true});throw error;}}};
}
export function createLoadingUI({document=globalThis.document,schedule=setTimeout,cancel=clearTimeout}={}){
 let box,label,hint,hideTimer,revision=0;
 function ensure(){
  if(!document?.body)return false;
  if(!box){box=document.createElement('div');box.id='crm-loading';box.className='crm-loading';box.setAttribute('popover','manual');box.hidden=true;
   label=document.createElement('strong');label.setAttribute('role','status');label.setAttribute('aria-live','polite');label.setAttribute('aria-atomic','true');
   hint=document.createElement('span');hint.className='crm-loading-hint';
   const track=document.createElement('div');track.className='crm-loading-track';track.setAttribute('role','progressbar');track.setAttribute('aria-label','Actie wordt uitgevoerd');track.append(document.createElement('span'));
   box.append(label,hint,track);
  }
  if(!box.isConnected)document.body.append(box);return true;
 }
 function hide(){if(!box)return;box.hidden=true;box.classList.remove('is-complete','is-error');try{box.hidePopover?.();}catch{};}
 return state=>{
  revision++;cancel(hideTimer);if(!state.visible){hide();return;}if(!ensure())return;
  const current=revision;box.hidden=false;box.classList.toggle('is-complete',!state.active&&!state.failed);box.classList.toggle('is-error',!state.active&&state.failed);box.setAttribute('aria-busy',String(state.active));
  const text=state.active?state.label:state.failed?'Actie niet afgerond':'Klaar';if(label.textContent!==text)label.textContent=text;
  hint.textContent=state.active?(state.count>1?'Bezig met verwerken…':'Even geduld…'):state.failed?'Bekijk de melding bij de actie.':'';
  if(box.showPopover&&box.parentElement!==document.body){try{box.hidePopover?.();}catch{}document.body.append(box);}
  let aboveModal=false;try{if(box.showPopover&&!box.matches(':popover-open'))box.showPopover();aboveModal=!!box.showPopover&&box.matches(':popover-open');}catch{}
  // Fallback for browsers without popovers: keep it visible inside a modal.
  if(!aboveModal){const parent=document.querySelector('dialog[open]')||document.body;if(box.parentElement!==parent)parent.append(box);}
  if(!state.active)hideTimer=schedule(()=>{if(current===revision)hide();},state.failed?900:350);
 };
}
export const loading=createActivityTracker({onChange:createLoadingUI()});
