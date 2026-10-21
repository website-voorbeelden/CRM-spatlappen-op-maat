// Personal, self-hosted AI runtime. No CRM database, mail/payment clients or tools that execute writes.
import {createServer} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {mkdir,chmod,open,unlink} from 'node:fs/promises';
import path from 'node:path';
import {ChatGPTConnection} from '../chatgpt-auth.mjs';
import {runAssistant} from '../engine.mjs';
const companies=['spatlappen','maatwerkkunststof'];
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export async function lockAgentDirectory(directory){
 await mkdir(directory,{recursive:true,mode:0o700});await chmod(directory,0o700);
 const file=path.join(directory,'runtime.lock');let handle;
 try{handle=await open(file,'wx',0o600);await handle.writeFile(String(process.pid));}catch{throw Error('De AI-accountmap is in gebruik of vergrendeld. Stop de dienst vóór accountimport. Verwijder een achtergebleven runtime.lock alleen nadat de oude dienst is gestopt.');}
 return async()=>{await handle.close();await unlink(file).catch(()=>{});};
}
async function readInput(req){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>4_000_000)throw Object.assign(Error('Aanvraag te groot.'),{status:413});chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw Object.assign(Error('Ongeldige JSON.'),{status:400});}}
export async function startHostedAgent({directory,keys,port=3040,host='127.0.0.1',connection:provided,fetchImpl=globalThis.fetch}={}){
 if(!directory||!companies.some(c=>/^[a-f0-9]{64}$/.test(keys?.[c]||'')))throw Error('Stel een eigen AI-accountmap en minimaal één bedrijfssleutel (64 hextekens) in.');
 for(const c of companies)if(keys[c]&&!/^[a-f0-9]{64}$/.test(keys[c]))throw Error('Ongeldige bedrijfssleutel.');
 if(keys.spatlappen&&equal(keys.spatlappen,keys.maatwerkkunststof))throw Error('Gebruik verschillende dienstsleutels voor de twee bedrijven.');
 const unlock=await lockAgentDirectory(directory),shutdown=new AbortController();let job=null;
 // This fetch adapter is exclusively the ChatGPT provider; redirect handling stays in the shared engine.
 const network=(url,options={})=>fetchImpl(url,{...options,signal:AbortSignal.any([options.signal,shutdown.signal].filter(Boolean))});
 let connection;try{connection=provided||await new ChatGPTConnection(directory,{fetchImpl:network}).init();}catch(e){await unlock();throw e;}
 const stopped=new Map();
 const server=createServer(async(req,res)=>{
  const json=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  if(req.url==='/health'&&req.method==='GET')return json({service:'crm-personal-agent',ready:true});
  if(req.url!=='/invoke'||req.method!=='POST')return json({error:'Onbekende dienstaanvraag.'},404);
  if(req.headers.origin)return json({error:'Gebruik de beveiligde CRM-serverroute.'},403);
  const companyId=companies.find(c=>keys[c]&&equal(req.headers.authorization,'Bearer '+keys[c]));if(!companyId)return json({error:'Geen toegang.'},403);
  let ownsJob=false;
  try{
   if(!req.headers['content-type']?.startsWith('application/json'))return json({error:'JSON verwacht.'},415);
   const body=await readInput(req);if(!body||typeof body!=='object'||Array.isArray(body)||body.input!==undefined&&(!body.input||typeof body.input!=='object'||Array.isArray(body.input)))return json({error:'Ongeldige aanvraag.'},400);const {action,input={},sessionId}=body;
   if(body.companyId!==companyId||!/^[a-f0-9]{64}$/.test(sessionId||''))return json({error:'Ongeldig bedrijf of sessie.'},403);
   if(action==='status'){const status=connection.status();return json({...status,pending:false,profiles:status.profiles.filter(p=>p.active),configured:true,mode:'self-hosted',setupRequired:!status.sharing});}
   const requestId=input.requestId,key=companyId+'|'+sessionId+'|'+requestId;
   if(action==='stop'){
    if(!/^[-a-zA-Z0-9_]{1,100}$/.test(requestId||''))return json({error:'Ongeldige aanvraag-ID.'},400);
    for(const [k,expiry] of stopped)if(expiry<Date.now())stopped.delete(k);if(stopped.size>=500)stopped.delete(stopped.keys().next().value);stopped.set(key,Date.now()+180000);
    if(job?.key===key)job.controller.abort();return json({stopped:true});
   }
   if(!['chat','models'].includes(action))return json({error:'Deze online dienst kan alleen antwoorden en voorstellen maken.'},403);
   if(job)return json({error:'De AI verwerkt een aanvraag. Probeer het straks opnieuw.'},409);
   if(action==='models')return json({models:await connection.models()});
   if(input.companyId!==companyId||!/^[-a-zA-Z0-9_]{1,100}$/.test(requestId||''))return json({error:'Ongeldige aanvraag.'},400);
   if(stopped.get(key)>Date.now())return json({error:'Deze aanvraag is gestopt.'},409);
   const controller=new AbortController();job={key,controller};ownsJob=true;
   req.on('aborted',()=>controller.abort());res.on('close',()=>{if(!res.writableEnded)controller.abort();});
   const result=await runAssistant({connection,companyId,state:input.state,message:input.message,history:input.history,model:input.model,context:input.context,task:input.task,mailContext:input.mailContext,guidance:input.guidance,requestId,signal:AbortSignal.any([controller.signal,AbortSignal.timeout(110000)]),fetchImpl:network});
   controller.signal.throwIfAborted();return json(result);
  }catch(e){return json({error:e.name==='AbortError'?'Aanvraag gestopt. Er is niets opgeslagen.':e.status&&e.status<500?e.message:'De AI kon de aanvraag niet afronden. Er is niets opgeslagen.'},e.status>=400&&e.status<=599?e.status:502);}
  finally{if(ownsJob)job=null;}
 });
 server.headersTimeout=15000;server.requestTimeout=130000;
 try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});}catch(e){await unlock();throw e;}
 return {port:server.address().port,close:async()=>{shutdown.abort();await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});await unlock();}};
}
