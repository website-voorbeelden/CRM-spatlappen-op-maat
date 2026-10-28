import {laptopOriginAllowed} from '../../shared/laptop-origins.js';
import {laptopContext} from '../../shared/assistant-laptop-context.js?v=feedback-followup-20261028';
const instances=new Map(),marker='crm-laptop-v1';
export function assistantTransport({companyId,runtime}){
 const key=runtime.mode+'|'+companyId;if(instances.has(key))return instances.get(key);
 const online=runtime.mode==='cloud',events=new EventTarget(),pending=new Map(),jobs=new Map();
 let enabled=!online,popup=null,connected=false,connecting=null,watch=null,epoch=0,companyAccess=false;
 try{if(!online&&localStorage.getItem(companyId+':assistant-enabled')==='false')enabled=false;}catch{}
 const remember=value=>{try{localStorage.setItem(companyId+':assistant-enabled',String(value));}catch{}};
 const localOrigin='http://127.0.0.1:3030';
 const notify=()=>events.dispatchEvent(new Event('change'));
 function unavailable(){return {configured:true,connected:false,sharing:false,pending:false,profiles:[],email:'',disabled:!enabled,mode:online?'laptop':'local',error:enabled?'Klik op AI aan om deze browser met je laptop te verbinden.':'AI staat uit. Het CRM blijft beschikbaar.'};}
 function rejectPending(message){for(const entry of pending.values()){clearTimeout(entry.timer);entry.reject(Error(message));}pending.clear();}
 function close(){connected=false;if(online)enabled=false;connecting?.reject(Error('De laptopverbinding is gesloten. Zet AI opnieuw aan.'));connecting=null;rejectPending('De laptopverbinding is gesloten.');if(watch){clearInterval(watch);watch=null;}notify();}
 function raw(action,input={},signal){
  if(!connected||!popup||popup.closed)return Promise.reject(Error('Zet eerst de laptopverbinding aan bij Agent.'));
  const id=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
   if(signal?.aborted){reject(new DOMException('Gestopt','AbortError'));return;}
   const cleanup=()=>{const entry=pending.get(id);clearTimeout(entry?.timer);pending.delete(id);signal?.removeEventListener('abort',abort);};
   const abort=()=>{cleanup();if(input.requestId&&action==='chat')popup?.postMessage({bridge:marker,company:companyId,type:'request',id:crypto.randomUUID(),action:'stop',input:{requestId:input.requestId}},localOrigin);reject(new DOMException('Gestopt','AbortError'));};
   const timer=setTimeout(()=>{abort();},action==='chat'?120000:30000);
   pending.set(id,{timer,resolve:value=>{cleanup();resolve(value);},reject:error=>{cleanup();reject(error);}});signal?.addEventListener('abort',abort,{once:true});
   popup.postMessage({bridge:marker,company:companyId,type:'request',id,action,input},localOrigin);
  });
 }
 window.addEventListener('message',event=>{
  if(event.origin!==localOrigin||event.source!==popup||event.data?.bridge!==marker||event.data.company!==companyId)return;
  const data=event.data;
  if(data.type==='hello'){if(connecting)connecting.hello=true;popup.postMessage({bridge:marker,company:companyId,type:'hello'},localOrigin);}
  else if(data.type==='ready'){connected=true;connecting?.resolve();connecting=null;notify();}
  else if(data.type==='closed')close();
  else if(data.type==='error'){connecting?.reject(Error(data.error));connecting=null;close();}
  else if(data.type==='result'){const entry=pending.get(data.id);if(entry)data.error?entry.reject(Error(data.error)):entry.resolve(data.result);if(data.status===401)close();}
 });
 async function enable(){
  if(!online){enabled=true;remember(true);notify();return;}
  if(!laptopOriginAllowed(companyId,location.origin))throw Error('Dit adres is niet gekoppeld aan dit bedrijf. Open het CRM op het eigen crm-domein.');
  if(connected&&!popup?.closed){enabled=true;notify();return;}
  if(connecting)throw Error('Rond het openstaande koppelvenster eerst af.');
  // This call is deliberately synchronous with the user's click, before any await.
  if(popup&&!popup.closed)popup.close();const connectingEpoch=++epoch;
  popup=window.open(localOrigin+'/browser-bridge?'+new URLSearchParams({company:companyId,origin:location.origin}),'crm-laptop-'+companyId+'-'+crypto.randomUUID(),'popup,width=600,height=650');
  if(!popup)throw Error('Sta het lokale koppelvenster toe in je browser en klik opnieuw op AI aan.');
  enabled=true;notify();
  const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{connecting=null;close();reject(Error('Koppelen duurt te lang. Start de lokale hulpdienst en open opnieuw.'));},300000);connecting={resolve:()=>{clearTimeout(timer);resolve();},reject:error=>{clearTimeout(timer);reject(error);}};});
  watch=setInterval(()=>{if(popup?.closed)close();},1500);
  const contactTimer=setTimeout(()=>{if(connecting&&!connecting.hello){connecting.reject(Error('De lokale hulpdienst reageert niet. Start beide CRM-diensten op je laptop en zet AI opnieuw aan.'));connecting=null;close();}},8000);
  try{await ready;}catch(error){if(epoch===connectingEpoch)enabled=false;notify();throw error;}finally{clearTimeout(contactTimer);}
 }
 async function disable({forget=false}={}){
  epoch++;enabled=false;remember(false);
  for(const [id,controller] of jobs){controller.abort();if(!online)fetch('/__local/assistant/stop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:id}),keepalive:true}).catch(()=>{});}
  if(online&&connected){try{await raw(forget?'forget':'disconnect');}finally{popup?.close();close();}}
  else if(online){connecting?.reject(Error('Koppelen geannuleerd.'));connecting=null;popup?.close();close();}
  notify();
 }
 async function cloud(action,body,signal){const response=await fetch('/api/crm/assistant/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal});const result=await response.json();if(!response.ok)throw Error(result.error||'De CRM-koppeling is niet beschikbaar.');return result;}
 async function request(action,body,signal){
  if(action==='status'&&(!enabled||online&&!connected))return unavailable();
  if(!enabled)throw Error('AI staat uit. Zet de verbinding aan bij Agent.');
  const version=epoch,controller=new AbortController(),combined=AbortSignal.any([signal,controller.signal,AbortSignal.timeout(['chat','transcribe'].includes(action)?120000:30000)].filter(Boolean));
  if(action==='chat')jobs.set(body.requestId,controller);
  try{
   if(!online){
    let input=body;if(action==='chat'&&body.task!=='mail-reply')input={...body,...laptopContext(body.state,companyId,body.context,{companyAccess})};
    const response=await fetch('/__local/assistant/'+action,{method:input===undefined?'GET':'POST',headers:input===undefined?{}:{'Content-Type':'application/json'},body:input===undefined?undefined:JSON.stringify(input),cache:'no-store',signal:combined}),result=await response.json();if(!response.ok)throw Error(result.error||'De lokale assistent reageert niet.');return result;
   }
   if(action==='chat'&&body.task!=='mail-reply'){
    const context=await cloud('laptop-context',{context:body.context,companyAccess},combined);if(!enabled||epoch!==version)throw new DOMException('AI uit','AbortError');
    const result=await raw('chat',{...body,state:context.state,context:context.context},combined);
    if(!enabled||epoch!==version)throw new DOMException('AI uit','AbortError');
    if(result.plan){const staged=await cloud('stage-local-plan',{plan:result.plan,revision:context.revision},combined);result.plan=staged.plan;result.approval=staged.approval;}return result;
   }
   if(!['status','models','chat','stop'].includes(action))throw Error('Deze handeling doe je in het lokale CRM op je laptop.');
   return await raw(action,body||{},combined);
  }finally{if(action==='chat')jobs.delete(body.requestId);}
 }
 const api={request,enable,disable,subscribe:fn=>{events.addEventListener('change',fn);return()=>events.removeEventListener('change',fn);},get enabled(){return enabled;},get connected(){return !online?enabled:connected&&enabled;},get online(){return online;},set companyAccess(value){companyAccess=value===true;},get companyAccess(){return companyAccess;}};
 window.addEventListener('pagehide',()=>{void disable().catch(()=>{});});instances.set(key,api);return api;
}
