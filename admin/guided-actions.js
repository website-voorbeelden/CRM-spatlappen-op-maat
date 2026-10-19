import {loading} from './loading.js';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const busy=new WeakSet();
export function guidanceMarkup({title='',message='',actions=[],kind='empty'}={}){
 if(!['empty','error','info'].includes(kind))throw Error('Onbekende hulpweergave.');
 return `<div class="guided-state guided-state-${kind}">${title?`<strong>${escape(title)}</strong>`:''}<p class="guided-message">${escape(message)}</p>${actions.length?`<div class="actions guided-actions">${actions.map(a=>{if(!/^[a-z][a-z0-9-]{0,80}$/.test(a.id)||!a.label)throw Error('Ongeldige hulpactie.');return `<button type="button" data-guided-action="${a.id}" ${a.primary?'class="primary"':''}>${escape(a.label)}</button>`;}).join('')}</div>`:''}</div>`;
}
export async function runGuidedAction(button,fn,{isBusy=()=>false,pendingLabel='Bezig…',trackLoading=false,onError=()=>{}}={}){
 if(busy.has(button)||isBusy())return;busy.add(button);const disabled=button.disabled,label=button.textContent;
 button.disabled=true;button.setAttribute('aria-busy','true');button.textContent=pendingLabel;
 try{return await (trackLoading?loading.run(pendingLabel,fn):fn());}catch(e){onError(e);return undefined;}finally{busy.delete(button);button.disabled=disabled;button.removeAttribute('aria-busy');button.textContent=label;}
}
export function installGuidedActions(root,handlers,options={}){
 for(const button of root.querySelectorAll('[data-guided-action]')){const handler=handlers[button.dataset.guidedAction];if(typeof handler!=='function'){button.disabled=true;continue;}button.onclick=()=>runGuidedAction(button,()=>handler(button),options);}
}
export function showGuidance(root,config,handlers={},options={}){root.innerHTML=guidanceMarkup(config);installGuidedActions(root,handlers,options);}
