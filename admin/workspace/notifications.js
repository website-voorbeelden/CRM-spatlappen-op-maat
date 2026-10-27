import {hasActiveFormEdits} from '../form-guidance.js?v=crm-code-review-20261027';

// One session-only queue per company, shared by mail, phases and receipts.
// Neither notification content nor undo tokens are written to browser storage.
const queues=new Map();
export function createWorkspaceNotifications({companyId='',toast=()=>{}}={}){
 if(queues.has(companyId))return queues.get(companyId);
 const pending=new Map(),busy=new Set();let box;
 function blocked(){
  if(document.querySelector('dialog[open]')||hasActiveFormEdits(document)){
   toast('Bewaar of sluit eerst je huidige invoer. De melding blijft voor je klaarstaan.');return true;
  }
  return false;
 }
 function remove(key,item){if(pending.get(key)===item){pending.delete(key);paint();}}
 async function act(key,item,action){
  if(busy.has(key)||blocked())return;
  busy.add(key);item.error='';paint();
  try{if(await action.run()!==false)remove(key,item);}
  catch(error){item.error=error.message||'Deze actie is niet gelukt. Probeer opnieuw.';toast(item.error);}
  finally{busy.delete(key);paint();}
 }
 function paint(){
  if(!pending.size){box?.remove();box=null;return;}
  if(!box?.isConnected){box=document.createElement('section');box.className='workspace-notifications';box.setAttribute('aria-label','CRM-meldingen');document.body.append(box);}
  box.replaceChildren();
  const heading=document.createElement('strong');heading.setAttribute('role','status');heading.textContent=pending.size===1?'Nieuw in je CRM':pending.size+' nieuwe meldingen';box.append(heading);
  for(const [key,item] of [...pending].slice(-5)){
   const row=document.createElement('div'),link=document.createElement('a'),close=document.createElement('button');
   row.className=item.openLabel?'workspace-notification workspace-notification-actions':'workspace-notification';
   row.setAttribute('aria-busy',String(busy.has(key)));link.href=item.href;link.textContent=item.openLabel||item.label;link.setAttribute('aria-disabled',String(busy.has(key)));
   link.onclick=event=>{
    if(busy.has(key)||blocked()){event.preventDefault();return;}
    try{if(item.onOpen?.())event.preventDefault();if(!item.keepOnOpen)remove(key,item);}
    catch(error){event.preventDefault();item.error=error.message;toast(error.message);paint();}
   };
   close.type='button';close.textContent='×';close.setAttribute('aria-label','Melding sluiten');close.disabled=busy.has(key);close.onclick=()=>remove(key,item);
   if(item.openLabel){
    const message=document.createElement('div'),title=document.createElement('strong'),text=document.createElement('p'),actions=document.createElement('div');
    message.className='workspace-notification-message';title.textContent=item.title||'Fase bijgewerkt';text.textContent=item.label;message.append(title,text);
    actions.className='workspace-notification-buttons';link.className='download-button workspace-notification-open';actions.append(link);
    for(const action of item.actions||[]){const button=document.createElement('button');button.type='button';button.textContent=action.label;button.disabled=busy.has(key);button.onclick=()=>act(key,item,action);actions.append(button);}
    row.append(message,close,actions);
   }else row.append(link,close);
   if(item.error){const error=document.createElement('small');error.className='workspace-notification-error';error.setAttribute('role','alert');error.textContent=item.error;row.append(error);}
   box.append(row);
  }
 }
 const api={add(key,item){if(item.group)for(const [oldKey,oldItem] of pending)if(oldItem.group===item.group)pending.delete(oldKey);pending.set(key,item);paint();},paint,size:()=>pending.size};queues.set(companyId,api);return api;
}
