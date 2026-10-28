import {laptopContext} from '../shared/assistant-laptop-context.js?v=feedback-followup-20261028';
import {sessionFingerprint,authenticated} from './auth.js';
import {companyFromEnv} from '../shared/companies.js';
import {integrationStore,random,sha256,integrationError as fail} from './integration-store.js';
import {assistantTransportState,assistantSnapshot,prepareAssistantPlan,applyAssistantPlan} from '../shared/assistant-domain.js?v=feedback-followup-20261028';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
function endpoint(env){try{const u=new URL(env.CRM_AGENT_SERVICE_URL);if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash||!u.hostname.includes('.')||!/[a-z]$/i.test(u.hostname)||/\.(local|internal|localhost)$/i.test(u.hostname)||/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)||!/^[a-f0-9]{64}$/.test(env.CRM_AGENT_SERVICE_TOKEN||''))return null;return u.origin;}catch{return null;}}
export const hostedAgentReady=env=>!!endpoint(env);
async function boundedText(message,max){
 const reader=message.body?.getReader();if(!reader)return '';let size=0,text='';const decoder=new TextDecoder();
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw fail('Aanvraag of antwoord te groot.',413);}text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}finally{reader.releaseLock();}
}
async function input(request){if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw fail('JSON verwacht.',415);const body=JSON.parse(await boundedText(request,4_000_000));if(!body||typeof body!=='object'||Array.isArray(body))throw fail('Ongeldige aanvraag.');return body;}
export async function handleOnlineAssistant({request,env,loadSnapshot,loadCommit,commitState},{fetcher=fetch,now=()=>Date.now()}={}){
 try{
  const user=await authenticated(request,env);if(!user||user.local)throw fail('Log in op de beveiligde online CRM-versie.',401);
  const url=new URL(request.url),action=url.pathname.split('/assistant/')[1],company=companyFromEnv(env),session=await sessionFingerprint(request,env);
  if(!['GET','POST'].includes(request.method))throw fail('Onbekende methode.',405);
  if(request.method==='POST'&&(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site'))throw fail('Ongeldige herkomst.',403);
  if(action==='status'&&request.method==='GET'&&!endpoint(env))return json({configured:false,connected:false,sharing:false,email:'',profiles:[],pending:false,setupRequired:true,mode:'self-hosted',error:'De online AI-dienst moet nog door de beheerder worden aangesloten. Gebruik intussen Context kopiëren.'});
  if(!endpoint(env)&&['status','models','chat','stop'].includes(action))throw fail('De online AI-dienst is nog niet aangesloten.',503);
  async function remote(action,body={}){
   const response=await fetcher(endpoint(env)+'/invoke',{method:'POST',headers:{Authorization:'Bearer '+env.CRM_AGENT_SERVICE_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({companyId:company.id,sessionId:session,action,input:body}),redirect:'manual',signal:AbortSignal.any([request.signal,AbortSignal.timeout(action==='chat'?115000:25000)])});
   if(response.status>=300&&response.status<400)throw fail('De AI-dienst gaf een ongeldige doorverwijzing.',502);
   const text=await boundedText(response,2_000_000);let result;try{result=JSON.parse(text);}catch{throw fail('De AI-dienst gaf geen geldig antwoord.',502);}
   if(!response.ok)throw fail(response.status===403?'De dienstsleutel voor dit bedrijf wordt niet geaccepteerd.':result.error||'De AI-dienst is tijdelijk niet bereikbaar.',[400,401,403,409,429].includes(response.status)?response.status:502);
   return result;
  }
  if(['status','models'].includes(action)&&request.method==='GET')return json(await remote(action));
  if(request.method!=='POST'||!['chat','stop','review','approve','laptop-context','stage-local-plan'].includes(action))throw fail('Deze AI-actie is niet beschikbaar.',403);
  const body=await input(request);if(body.companyId&&body.companyId!==company.id)throw fail('Dit voorstel hoort bij een ander bedrijf.',403);
  if(action==='laptop-context'){const current=await loadSnapshot(),selected=laptopContext(current.state,company.id,body.context,{companyAccess:body.companyAccess===true});return json({...selected,companyId:company.id,revision:current.revision});}
  if(action==='stop'){if(!id(body.requestId))throw fail('Ongeldige aanvraag-ID.');return json(await remote('stop',{requestId:body.requestId}));}
  const store=integrationStore(env),slot='assistant-proposal-'+session;
  if(action==='stage-local-plan')return await store.exclusive(slot,async()=>{
   const current=await loadSnapshot();if(body.revision!==current.revision)throw fail('Het CRM is intussen gewijzigd. Vraag een nieuw voorstel.',409);
   try{applyAssistantPlan(current.state,body.plan,company.id,{approved:true,now:now()});}catch(e){throw fail(e.message,409);}
   const plan=prepareAssistantPlan(assistantSnapshot(current.state,company.id),body.plan.operations.map(op=>({entity:op.entity,operation:op.operation,id:op.id,fields:op.fields})),company.id,{preserveCreateIds:true,now:now()}),previous=await store.read(slot),proposalId=random();await store.write(slot,{proposalId,plan,baseRevision:current.revision,expiresAt:plan.expiresAt,status:'pending',source:'laptop'},previous.version);return json({plan,approval:{proposalId}});
  });
  if(action==='chat')return await store.exclusive('assistant-chat',async()=>{
   if(!id(body.requestId)||typeof body.message!=='string'||!body.message.trim()||body.message.length>12000||body.task&&!['mail-reply'].includes(body.task))throw fail('Ongeldige AI-vraag.');
   const current=await loadSnapshot();
   // Never trust browser-provided state/company. Data come from this authenticated company's database.
   const result=await remote('chat',{companyId:company.id,requestId:body.requestId,message:body.message,model:body.model,history:body.history,context:body.context,task:body.task||'',mailContext:body.mailContext,guidance:body.guidance,state:body.task==='mail-reply'?undefined:assistantTransportState(current.state)});
   request.signal.throwIfAborted();
   if(result.plan){
    if(body.task==='mail-reply'||!Array.isArray(result.plan.operations))throw fail('Ongeldig wijzigingsvoorstel.',502);
    // Recreate a trusted plan against the actual source, not a host/browser baseline.
    const plan=prepareAssistantPlan(assistantSnapshot(current.state,company.id),result.plan.operations.map(op=>({entity:op.entity,operation:op.operation,id:op.id,fields:op.fields})),company.id,{preserveCreateIds:true,now:now()});
    const previous=await store.read(slot),proposalId=random();await store.write(slot,{proposalId,plan,baseRevision:current.revision,expiresAt:plan.expiresAt,status:'pending'},previous.version);
    result.plan=plan;result.approval={proposalId};
   }
   return json(result);
  });
  return await store.exclusive(slot,async()=>{
   const stored=await store.read(slot),entry=stored.value;
   if(!entry||body.proposalId!==entry.proposalId||entry.expiresAt<now())throw fail('Het voorstel is verlopen of niet van deze sessie. Vraag een nieuw voorstel.',409);
   const commitId='ai-'+entry.proposalId;
   const applied=await loadCommit(commitId);if(applied)return json({applied:true,commitId,revision:applied.revision,replayed:true});
   if(!['pending','reviewed'].includes(entry.status))throw fail('Dit voorstel kan niet opnieuw worden uitgevoerd.',409);
   const current=await loadSnapshot();if(current.revision!==entry.baseRevision)throw fail('Het CRM is intussen gewijzigd. Vraag een nieuw voorstel.',409);
   const next=applyAssistantPlan(current.state,entry.plan,company.id,{approved:true,now:now()});
   if(action==='review'){
    const reviewToken=random();await store.write(slot,{...entry,status:'reviewed',reviewHash:await sha256(reviewToken),reviewExpires:now()+120000},stored.version);
    return json({proposalId:entry.proposalId,plan:entry.plan,reviewToken,expiresAt:now()+120000});
   }
   // Only this route writes, after the user has received the immutable server review.
   if(entry.status!=='reviewed'||entry.reviewExpires<now()||typeof body.reviewToken!=='string'||await sha256(body.reviewToken)!==entry.reviewHash||body.confirmation!=='Deze wijzigingen opslaan'||request.headers.get('X-CRM-Confirmation')!=='human-review')throw fail('Bekijk het exacte voorstel en bevestig de wijzigingen eerst expliciet.',403);
   const saved=await commitState(next,{id:commitId,revision:current.revision});
   // The CRM commit ID is stable and deduplicated by the existing transaction layer.
   await store.write(slot,{...entry,status:'applied',revision:saved.revision,reviewHash:null},stored.version).catch(()=>{});
   return json({applied:true,commitId,revision:saved.revision});
  });
 }catch(e){return json({error:e instanceof SyntaxError?'Ongeldige JSON.':e.status?e.message:e.name==='AbortError'?'Aanvraag gestopt.':'De online AI-dienst is tijdelijk niet beschikbaar. Er zijn geen wijzigingen bevestigd.'},e.status||503);}
}
