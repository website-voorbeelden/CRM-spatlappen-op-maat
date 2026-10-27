import {laptopOriginAllowed} from '../shared/laptop-origins.js';
import {randomBytes,createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,rename,chmod} from 'node:fs/promises';
import path from 'node:path';
const random=()=>randomBytes(32).toString('hex'),hash=value=>createHash('sha256').update(value).digest('hex');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function createBrowserBridge({directory,connection,run,signal}){
 const pending=new Map(),sessions=new Map();let grants={},saving=Promise.resolve(),unavailableReason='';
 const file=path.join(directory,'grants.json');
 // This file stores only hashed browser grants, not ChatGPT credentials or CRM records.
 try{grants=JSON.parse(await readFile(file,'utf8'));if(!grants||typeof grants!=='object'||Array.isArray(grants))throw Error();}catch(e){if(e.code!=='ENOENT')unavailableReason='De browsertoestemmingen kunnen niet veilig worden geopend. De gewone lokale CRM-functies blijven beschikbaar.';}
 async function save(){saving=saving.catch(()=>{}).then(async()=>{await mkdir(directory,{recursive:true,mode:0o700});await chmod(directory,0o700);const tmp=file+'.'+random()+'.tmp';await writeFile(tmp,JSON.stringify(grants),{mode:0o600});await rename(tmp,file);await chmod(file,0o600);});await saving;}
 function invalidate(){for(const s of sessions.values())for(const job of s.jobs.values())job.abort();sessions.clear();}
 signal?.addEventListener('abort',invalidate,{once:true});
 function prune(){const now=Date.now();for(const [k,p] of pending)if(p.expires<now)pending.delete(k);for(const [k,s] of sessions)if(s.expires<now){for(const job of s.jobs.values())job.abort();sessions.delete(k);}for(const [k,g] of Object.entries(grants))if(!g||g.expires<now)delete grants[k];}
 async function handle(req,res,url,readBody){
  if(!url.pathname.startsWith('/browser-bridge'))return false;
  const json=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{
   if(unavailableReason)throw fail(unavailableReason,503);
   prune();const local='http://127.0.0.1:'+req.socket.localPort;
   if(url.pathname==='/browser-bridge'&&req.method==='GET'){
    const company=url.searchParams.get('company'),origin=url.searchParams.get('origin');if(!laptopOriginAllowed(company,origin))throw fail('Dit CRM-adres is niet toegestaan.',403);
    if(pending.size>=100)throw fail('Te veel openstaande koppelvensters.',429);
    const old=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('crm_bridge_browser='))?.split('=')[1],browser=/^[a-f0-9]{64}$/.test(old||'')?old:random(),nonce=random(),scriptNonce=random();
    const grant=hash(browser+'|'+company+'|'+origin);pending.set(nonce,{company,origin,grant,expires:Date.now()+300000});
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Set-Cookie':'crm_bridge_browser='+browser+'; HttpOnly; SameSite=Strict; Path=/browser-bridge; Max-Age=2592000', 'Content-Security-Policy':`default-src 'none'; script-src 'nonce-${scriptNonce}'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'`});
    res.end(`<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRM · AI op deze laptop</title><style>body{font:16px system-ui;color:#203047;background:#f5f7fb;padding:24px;max-width:520px;margin:auto}button{font:inherit;padding:12px;margin:8px 0}p{line-height:1.6}[hidden]{display:none!important}</style><h1>AI op deze laptop</h1><p><strong>${escape(origin)}</strong> · ${escape(company)}</p><p>Dit CRM mag vragen en gekozen dossiercontext via je lokale ChatGPT-verbinding laten behandelen. De hulpdienst kan geen CRM-wijzigingen opslaan of mails versturen. Die bevestig je in het CRM.</p><p id="status" role="status">Wachten op het CRM-venster…</p><button id="approve" hidden>Deze browser koppelen</button><button id="stop" hidden>AI uitzetten</button><p>Laat dit venster open of minimaliseer het zolang je AI gebruikt. Sluiten verbreekt deze verbinding. De toestemming wordt maximaal 30 dagen onthouden voor dit CRM en deze browser.</p><script nonce="${scriptNonce}">${popupScript({origin,company,nonce})}</script></html>`);return true;
   }
   if(req.method!=='POST'||req.headers.origin!==local||req.headers['sec-fetch-site']==='cross-site'||!req.headers['content-type']?.startsWith('application/json'))throw fail('Ongeldige lokale aanvraag.',403);
   const body=await readBody(req),browser=String(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('crm_bridge_browser='))?.split('=')[1];
   if(url.pathname==='/browser-bridge/activate'){
    const p=pending.get(body.nonce);if(!p||hash(browser+'|'+p.company+'|'+p.origin)!==p.grant)throw fail('Het koppelverzoek is verlopen. Open opnieuw via het CRM.',403);
    if(!grants[p.grant]&&body.confirm!==true)return json({needsApproval:true}),true;
    if(body.confirm===true){grants[p.grant]={company:p.company,origin:p.origin,expires:Date.now()+30*86400000};await save();}
    if(sessions.size>=100)throw fail('Te veel actieve browserverbindingen.',429);
    pending.delete(body.nonce);const token=random();sessions.set(hash(token),{...p,expires:Date.now()+8*3600000,jobs:new Map(),cancelled:new Map()});json({token});return true;
   }
   if(url.pathname!=='/browser-bridge/invoke')throw fail('Onbekende browseractie.',404);
   const token=String(req.headers.authorization||'').replace(/^Bearer /,''),s=sessions.get(hash(token));
   if(!s||hash(browser+'|'+s.company+'|'+s.origin)!==s.grant||!grants[s.grant])throw fail('De laptopverbinding is verlopen. Zet AI opnieuw aan.',401);
   const {action,input={}}=body;if(!input||typeof input!=='object'||Array.isArray(input))throw fail('Ongeldige invoer.');
   if(['disconnect','forget'].includes(action)){for(const job of s.jobs.values())job.abort();sessions.delete(hash(token));if(action==='forget'){delete grants[s.grant];for(const [id,other] of sessions)if(other.grant===s.grant){for(const job of other.jobs.values())job.abort();sessions.delete(id);}await save();}json({disconnected:true});return true;}
   if(action==='status'){const status=connection.status();json({...status,profiles:status.profiles.filter(p=>p.active),pending:false,configured:true,mode:'laptop'});return true;}
   if(connection.pending?.expiresAt>Date.now()&&['models','chat'].includes(action))throw fail('Rond de lokale ChatGPT-aanmelding eerst af.',409);
   if(action==='models'){json({models:await connection.models()});return true;}
   if(!['chat','stop'].includes(action)||typeof input.requestId!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(input.requestId))throw fail('Deze actie is niet beschikbaar.');
   if(action==='stop'){if(s.cancelled.size>=100)s.cancelled.delete(s.cancelled.keys().next().value);s.cancelled.set(input.requestId,Date.now()+180000);s.jobs.get(input.requestId)?.abort();json({stopped:true});return true;}
   if(input.companyId!==s.company||typeof input.message!=='string'||!input.message.trim()||input.message.length>12000||input.task&&!['mail-reply'].includes(input.task))throw fail('Ongeldige AI-vraag.');
   if(s.cancelled.get(input.requestId)>Date.now())throw fail('Deze aanvraag is gestopt.',409);
   if(s.jobs.size)throw fail('Deze verbinding verwerkt al een vraag.',409);
   const controller=new AbortController();s.jobs.set(input.requestId,controller);res.on('close',()=>{if(!res.writableEnded)controller.abort();});
   try{const result=await run({...input,companyId:s.company},AbortSignal.any([controller.signal,signal,AbortSignal.timeout(110000)].filter(Boolean)));controller.signal.throwIfAborted();json(result);}finally{s.jobs.delete(input.requestId);}
   return true;
  }catch(e){json({error:e.status?e.message:e.name==='AbortError'?'AI-aanvraag gestopt.':'De laptopverbinding kon de aanvraag niet afronden.'},e.status||502);return true;}
 }
 return {handle,invalidate};
}
function popupScript({origin,company,nonce}){return `(()=>{
 const origin=${JSON.stringify(origin)},company=${JSON.stringify(company)},nonce=${JSON.stringify(nonce)},parent=window.opener;let token='',starting=false,ended=false;const status=document.getElementById('status'),approve=document.getElementById('approve'),stop=document.getElementById('stop');
 const send=value=>parent?.postMessage({bridge:'crm-laptop-v1',company,...value},origin);
 async function call(action,input={}){const r=await fetch('/browser-bridge/invoke',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action,input}),cache:'no-store'}),data=await r.json();if(!r.ok)throw Object.assign(Error(data.error||'Verbinding niet beschikbaar.'),{status:r.status});return data;}
 async function activate(confirm=false){if(starting||ended)return;starting=true;approve.disabled=true;try{const r=await fetch('/browser-bridge/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nonce,confirm}),cache:'no-store'}),data=await r.json();if(!r.ok)throw Error(data.error);if(data.needsApproval){status.textContent='Bevestig hieronder dat dit CRM deze browser mag koppelen.';approve.hidden=false;}else{token=data.token;approve.hidden=true;stop.hidden=false;status.textContent='Verbonden. Je kunt terug naar het CRM. Er wordt pas AI gebruikt wanneer je een vraag verstuurt.';send({type:'ready'});}}catch(error){status.textContent=error.message;send({type:'error',error:error.message});}finally{starting=false;approve.disabled=false;}}
 approve.onclick=()=>activate(true);stop.onclick=async()=>{ended=true;try{await call('disconnect');}finally{send({type:'closed'});token='';stop.hidden=true;status.textContent='AI uit. Sluit dit venster.';}};
 window.addEventListener('message',async event=>{if(event.source!==parent||event.origin!==origin||event.data?.bridge!=='crm-laptop-v1'||event.data.company!==company)return;const m=event.data;if(m.type==='hello'&&!token){await activate();return;}if(m.type!=='request'||!token||ended||typeof m.id!=='string'||!['status','models','chat','stop','disconnect','forget'].includes(m.action))return;try{const result=await call(m.action,m.input);send({type:'result',id:m.id,result});if(['disconnect','forget'].includes(m.action)){ended=true;token='';window.close();}}catch(error){send({type:'result',id:m.id,error:error.message,status:error.status});}});
 window.addEventListener('pagehide',()=>{ended=true;if(token)fetch('/browser-bridge/invoke',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'disconnect'}),keepalive:true}).catch(()=>{});send({type:'closed'});});
 setInterval(()=>{if(!ended&&parent?.closed){ended=true;if(token)void call('disconnect').catch(()=>{});window.close();}},1500);
 if(parent)send({type:'hello'});else status.textContent='Open dit venster met de AI-aan-knop in je CRM.';
})();`;}
