import {createGmailPhaseAuto,phaseAutoConfirmation,phaseResolveConfirmation} from '../shared/gmail-phase-auto.js';
import {gmailPhaseContext} from '../shared/gmail-phase-context.js';
import {authenticated} from './auth.js';
import {salesFunnel} from '../shared/sales-funnel.js?v=maat-cleanup-20261021';
import {createGmailPhaseSync,gmailModifyScope} from '../shared/gmail-phase-sync.js';
import {gmailLabels} from '../shared/gmail-labels.js';
import {parseGoogleWebClient} from '../shared/google-oauth-client.js';
import {gmailAttachment} from '../shared/gmail-attachment.js?v=footer-inline-20261027';
import {gmailMessage} from '../shared/gmail-message.js?v=footer-inline-20261027';
import {integrationStore,integrationError as fail,random,sha256} from './integration-store.js';
import {sessionFingerprint} from './auth.js';
const scope='https://www.googleapis.com/auth/gmail.readonly';
const address=v=>typeof v==='string'&&v.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(v);
const googleId=v=>typeof v==='string'&&/^[a-fA-F0-9]{1,100}$/.test(v);
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const base64url=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function provider(url,options={},fetcher=fetch){
 let response;try{response=await fetcher(url,{...options,redirect:'manual',signal:AbortSignal.timeout(15000)});}catch{throw fail('Google is niet bereikbaar. Probeer later opnieuw.',502);}
 let text='';if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8_000_000){await reader.cancel();throw fail('Dit bericht is te groot. Bekijk het in Gmail.',413);}chunks.push(value);}}finally{reader.releaseLock();}const all=new Uint8Array(size);let offset=0;for(const part of chunks){all.set(part,offset);offset+=part.length;}text=new TextDecoder().decode(all);}else text=await response.text();
 if(text.length>8_000_000)throw fail('Dit bericht is te groot. Bekijk het in Gmail.',413);
 let result;try{result=JSON.parse(text);}catch{throw fail('Google gaf geen bruikbaar antwoord.',502);}
 if(!response.ok){if(response.status===401||result.error==='invalid_grant')throw fail('De Gmail-toestemming is verlopen of ingetrokken. Klik op Gmail opnieuw koppelen.',401);if(response.status===403)throw fail('Google geeft geen leestoegang. Controleer Gmail API en de toestemming voor dit account.',403);throw fail('Google kon dit verzoek niet verwerken. Controleer je koppeling.',502);}return result;
}
export function createCloudGmail(env,{fetcher=fetch,now=Date.now}={}){
 const store=integrationStore(env);
 function callback(origin){const u=new URL(origin);if(u.protocol!=='https:'||u.username||u.password)throw fail('Gebruik de beveiligde online CRM-URL.');return u.origin+'/__local/assistant/gmail-callback';}
 const status=(record,origin)=>({configured:!!record.value?.config,connected:!!record.value?.connection?.refreshToken,expectedAccount:record.value?.config?.expectedAccount||'',mailbox:record.value?.connection?.mailbox||'',pending:false,phaseLabelsAllowed:!!record.value?.connection?.scopes?.includes(gmailModifyScope),clientType:'web',redirectUri:callback(origin)});
 const api=(auth,endpoint)=>provider('https://gmail.googleapis.com/gmail/v1/users/me/'+endpoint,{headers:{Authorization:'Bearer '+auth.token}},fetcher);
 async function access(){
  const record=await store.read('gmail'),{config,connection:t} = record.value||{};
  if(!config||!t?.refreshToken)throw fail('Koppel eerst Gmail bij Instellingen & back-up.');
  if(t.expiresAt>now()+60000)return {token:t.accessToken,mailbox:t.mailbox};
  const result=await provider('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,refresh_token:t.refreshToken,grant_type:'refresh_token'}).toString()},fetcher);
  if(typeof result.access_token!=='string'||!Number.isFinite(result.expires_in)||result.scope&&!result.scope.split(' ').includes(scope))throw fail('Google gaf geen geldige Gmail-toegang. Koppel Gmail opnieuw.');
  const connection={...t,accessToken:result.access_token,refreshToken:result.refresh_token||t.refreshToken,expiresAt:now()+result.expires_in*1000};await store.write('gmail',{config,connection},record.version);return {token:connection.accessToken,mailbox:connection.mailbox};
 }
 const phaseSync=createGmailPhaseSync({
  inspect:async(company,input)=>{const chunks=await env.DB.prepare("SELECT payload FROM crm_records WHERE store='state' AND record_key='main' ORDER BY part").all(),state=JSON.parse(chunks.results.map(row=>row.payload).join('')),order=state.orders.find(o=>o.id===input.orderId);if(!order||salesFunnel(state,order,company).displayPhase!==input.phase||!state.mailThreads?.some(t=>t.orderId===input.orderId&&t.mailbox===input.mailbox&&t.gmailThreadId===input.threadId))throw fail('De orderfase of gesprekskoppeling is veranderd. Open een nieuw voorstel.');const auth=await access(),record=await store.read('gmail'),token=record.value?.connection;if(auth.mailbox!==input.mailbox||!googleId(input.threadId))throw fail('Het gekoppelde Gmail-account of gesprek is gewijzigd.');const labels=gmailLabels(await api(auth,'labels')),thread=await api(auth,'threads/'+input.threadId+'?format=metadata&metadataHeaders=Subject');if(thread.id!==input.threadId||!Array.isArray(thread.messages)||!thread.messages.length||thread.messages.length>100||thread.messages.some(m=>m.threadId!==input.threadId||!googleId(m.id)))throw fail('Geen geldig Gmail-gesprek.');return {mailbox:auth.mailbox,revision:token.revision||'',scopes:token.scopes||[scope],labels,messages:thread.messages.map(m=>gmailMessage(m,auth.mailbox))};},
  modify:async(company,p)=>{const auth=await access(),record=await store.read('gmail');if(auth.mailbox!==p.mailbox||record.value?.connection?.revision!==p.connectionRevision||!record.value?.connection?.scopes?.includes(gmailModifyScope))throw fail('De vereiste Gmail-toestemming ontbreekt.');return provider('https://gmail.googleapis.com/gmail/v1/users/me/threads/'+p.threadId+'/modify',{method:'POST',headers:{Authorization:'Bearer '+auth.token,'Content-Type':'application/json'},body:JSON.stringify({addLabelIds:p.addLabelIds,removeLabelIds:p.removeLabelIds})},fetcher);},
  load:async session=>(await store.read('gmail-phase-sync-'+session)).value,
  save:async(session,value)=>{const name='gmail-phase-sync-'+session,record=await store.read(name);await store.write(name,value,record.version);},now
 });
 const phaseAuto=createGmailPhaseAuto({
  identity:async()=>{const record=await store.read('gmail'),token=record.value?.connection;return {connected:!!token?.refreshToken,mailbox:token?.mailbox||'',revision:token?.revision||'',scopes:token?.scopes||[]};},
  catalog:async(company,account)=>gmailLabels(await api(await autoAccess(account),'labels')),
  thread:async(company,account,id)=>{const data=await api(await autoAccess(account),'threads/'+id+'?format=metadata&fields=id,messages(id,threadId,labelIds)');if(data.id!==id||!Array.isArray(data.messages)||!data.messages.length||data.messages.length>100||data.messages.some(m=>!googleId(m.id)||m.threadId!==id||m.labelIds!==undefined&&(!Array.isArray(m.labelIds)||m.labelIds.some(l=>typeof l!=='string'||!/^[-a-zA-Z0-9_]{1,200}$/.test(l)))))throw fail('Geen geldig Gmail-gesprek.');return data.messages.map(m=>({...m,labelIds:m.labelIds||[]}));},
  modify:async(company,account,p)=>{const auth=await autoAccess(account),data=await provider('https://gmail.googleapis.com/gmail/v1/users/me/threads/'+p.threadId+'/modify',{method:'POST',headers:{Authorization:'Bearer '+auth.token,'Content-Type':'application/json'},body:JSON.stringify({addLabelIds:p.addLabelIds,removeLabelIds:p.removeLabelIds})},fetcher);if(data.id!==p.threadId)throw fail('Geen geldige Google-bevestiging ontvangen.');},
  load:async(company,name)=>(await store.read('gmail-phase-auto-'+name)).value,
  save:async(company,name,value)=>{const slot='gmail-phase-auto-'+name,record=await store.read(slot);await store.write(slot,value,record.version);},
  crmContext:async(company,input)=>{const chunks=await env.DB.prepare("SELECT payload FROM crm_records WHERE store='state' AND record_key='main' ORDER BY part").all(),state=JSON.parse(chunks.results.map(row=>row.payload).join('')),context=gmailPhaseContext(state,input.orderId,company);if(JSON.stringify(context)!==JSON.stringify({orderId:input.orderId,signal:input.signal,links:input.links}))throw fail('Het dossier of de gesprekskoppeling is gewijzigd. Lees het CRM opnieuw.',409);return context;},now
 });
 async function autoAccess(expected){const auth=await access(),record=await store.read('gmail'),token=record.value?.connection;if(auth.mailbox!==expected.mailbox||token?.revision!==expected.revision||!token?.scopes?.includes(gmailModifyScope))throw fail('De Gmail-koppeling is veranderd. Activeer synchronisatie opnieuw.');return auth;}
 const service={
  async phaseAuto(action,input={}){if(!['status','configure','sync'].includes(action))throw fail('Onbekende faseactie.');return store.exclusive('gmail-phase-sync',()=>phaseAuto[action](store.company,input));},
  async phaseSync(session,action,input){return store.exclusive('gmail-phase-sync',()=>phaseSync(store.company,session,action,input));},
  async status(origin){return status(await store.read('gmail'),origin);},
  async configure(input,origin){
   if(!address(input.expectedAccount))throw fail('Vul een geldig Gmail-account in.',400,'expectedAccount');
   const redirectUri=callback(origin),client=parseGoogleWebClient(input.credentials,redirectUri),config={...client,expectedAccount:input.expectedAccount.trim().toLowerCase(),redirectUri},old=await store.read('gmail');
   const connection=JSON.stringify(old.value?.config)===JSON.stringify(config)?old.value?.connection:null;
   return status(await store.write('gmail',{config,connection},old.version),origin);
  },
  async start(origin,session,{enablePhaseLabels=false}={}){
   
   if(env.CRM_RELEASE_ENV==='preview')throw fail('Koppel Gmail via de productie-URL.',403);
   const record=await store.read('gmail'),config=record.value?.config;if(!config)throw fail('Sla eerst je Google Web-app-instellingen op.');
   if(config.redirectUri!==callback(origin))throw fail('Open de CRM-URL waarvoor de Google-client is ingesteld.');
   const state=random(),verifier=base64url(crypto.getRandomValues(new Uint8Array(48))),id=await sha256(state);
   const encrypted=await store.seal('gmail-oauth:'+id,{verifier,redirectUri:config.redirectUri,enablePhaseLabels:enablePhaseLabels===true});
   await store.db.batch([store.db.prepare('DELETE FROM crm_oauth_requests WHERE expires_at<=? OR (company_id=? AND session_hash=?)').bind(now(),store.company,session),store.db.prepare('INSERT INTO crm_oauth_requests(id,company_id,session_hash,config_version,ciphertext,expires_at) VALUES(?,?,?,?,?,?)').bind(id,store.company,session,record.version,encrypted,now()+600000)]);
   const challenge=base64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))),url=new URL('https://accounts.google.com/o/oauth2/v2/auth');
   url.search=new URLSearchParams({client_id:config.clientId,redirect_uri:config.redirectUri,response_type:'code',scope:enablePhaseLabels===true?scope+' '+gmailModifyScope:scope,access_type:'offline',prompt:'consent',state,code_challenge:challenge,code_challenge_method:'S256',login_hint:config.expectedAccount}).toString();return {url:url.href};
  },
  async finish(params,origin,session){
   const state=params.get('state');if(!/^[a-f0-9]{64}$/.test(state||''))throw fail('Deze aanmelding is ongeldig. Begin opnieuw vanuit het CRM.');
   const id=await sha256(state),pending=await store.db.prepare('DELETE FROM crm_oauth_requests WHERE id=? AND company_id=? AND session_hash=? AND expires_at>? RETURNING config_version,ciphertext').bind(id,store.company,session,now()).first();
   if(!pending)throw fail('Deze aanmelding is verlopen of hoort bij een andere sessie. Begin opnieuw vanuit het CRM.');
   const record=await store.read('gmail'),config=record.value?.config;if(!config||record.version!==pending.config_version||config.redirectUri!==callback(origin))throw fail('De Google-instellingen zijn gewijzigd. Begin de aanmelding opnieuw.');
   if(params.has('error'))throw fail('Gmail koppelen is geannuleerd. Je bestaande verbinding is behouden.');
   const code=params.get('code');if(!code||code.length>4000)throw fail('Google gaf geen geldige aanmeldcode.');
   const context=await store.open('gmail-oauth:'+id,pending.ciphertext);
   const result=await provider('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,code,code_verifier:context.verifier,redirect_uri:context.redirectUri,grant_type:'authorization_code'}).toString()},fetcher);
   if(!result.scope?.split(' ').includes(scope)||context.enablePhaseLabels&&!result.scope.split(' ').includes(gmailModifyScope)||typeof result.access_token!=='string'||typeof result.refresh_token!=='string'||!Number.isFinite(result.expires_in))throw fail('Google gaf geen blijvende Gmail-leestoegang. Probeer de aanmelding opnieuw.');
   const profile=await api({token:result.access_token},'profile');if(!address(profile.emailAddress)||profile.emailAddress.toLowerCase()!==config.expectedAccount)throw fail('Je koos een ander Gmail-account. Meld je aan met het account dat voor dit bedrijf is ingesteld.');
   await store.write('gmail',{config,connection:{mailbox:profile.emailAddress.toLowerCase(),accessToken:result.access_token,refreshToken:result.refresh_token,expiresAt:now()+result.expires_in*1000,revision:random(),scopes:result.scope.split(' ')}},record.version);return {ok:true};
  },
  async disconnect(origin){const record=await store.read('gmail');if(record.value){const saved=await store.write('gmail',{config:record.value.config,connection:null},record.version);return status(saved,origin);}return status(record,origin);},
  async list(input={}){
   const days=Number(input.days||30);if(![7,30,90,365].includes(days))throw fail('Kies een geldige periode.');const folder=input.folder||'all';if(!['all','inbox','sent'].includes(folder))throw fail('Kies een geldige map.');
   if(input.pageToken&&(typeof input.pageToken!=='string'||input.pageToken.length>1000||!/^[a-zA-Z0-9_+=\/-]+$/.test(input.pageToken)))throw fail('Ongeldige volgende pagina.');
   const auth=await access(),query=new URLSearchParams({q:'newer_than:'+days+'d -in:spam -in:trash -in:drafts'+(folder==='inbox'?' in:inbox':folder==='sent'?' in:sent':''),maxResults:'20',...(input.pageToken?{pageToken:input.pageToken}:{})}),listed=await api(auth,'messages?'+query),ids=listed.messages||[];
   if(!Array.isArray(ids)||ids.length>20||ids.some(m=>!googleId(m.id)))throw fail('Google gaf geen geldige berichtenlijst.',502);
   const messages=[];for(let i=0;i<ids.length;i+=4){const batch=await Promise.all(ids.slice(i,i+4).map(m=>api(auth,'messages/'+m.id+'?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Reply-To&metadataHeaders=Subject&metadataHeaders=Message-ID&metadataHeaders=References&metadataHeaders=In-Reply-To&metadataHeaders=Authentication-Results&metadataHeaders=X-CRM-Form-Version&metadataHeaders=X-CRM-Lead-ID&metadataHeaders=X-CRM-Source&metadataHeaders=X-CRM-Internal&metadataHeaders=X-CRM-UTM-Source&metadataHeaders=X-CRM-UTM-Medium&metadataHeaders=X-CRM-UTM-Campaign')));if(batch.some((data,n)=>data.id!==ids[i+n].id))throw fail('Google gaf een ander bericht terug.',502);messages.push(...batch.map(data=>gmailMessage(data,auth.mailbox)));}return {mailbox:auth.mailbox,messages,nextPageToken:listed.nextPageToken||''};
  },
  async message(input){if(!googleId(input.messageId))throw fail('Ongeldig bericht.');const auth=await access();if(input.mailbox!==auth.mailbox)throw fail('Het gekoppelde Gmail-account is gewijzigd. Werk de lijst bij.');const data=await api(auth,'messages/'+input.messageId+'?format=full');if(data.id!==input.messageId)throw fail('Google gaf een ander bericht terug.',502);return gmailMessage(data,auth.mailbox,{full:true});},
  async attachment(input){try{return await gmailAttachment(await access(),input,api);}catch(error){if(error.status)throw error;throw fail(error.message,400);}},
  async labels(input){const auth=await access();if(input.mailbox!==auth.mailbox)throw fail('Het gekoppelde Gmail-account is gewijzigd. Open het gesprek opnieuw.');return {mailbox:auth.mailbox,labels:gmailLabels(await api(auth,'labels'))};},
  async thread(input){if(!googleId(input.threadId))throw fail('Ongeldig gesprek.');const auth=await access();if(input.mailbox!==auth.mailbox)throw fail('Het gekoppelde Gmail-account is gewijzigd. Werk de lijst bij.');const data=await api(auth,'threads/'+input.threadId+'?format=full');if(data.id!==input.threadId||!Array.isArray(data.messages)||!data.messages.length||data.messages.length>100||data.messages.some(m=>!googleId(m.id)||m.threadId!==input.threadId))throw fail('Google gaf geen geldig gesprek terug.',502);const messages=data.messages.filter(m=>!m.labelIds?.some(label=>['SPAM','TRASH'].includes(label))).map(m=>gmailMessage(m,auth.mailbox,{full:true}));if(!messages.length)throw fail('Dit gesprek bevat alleen spam of verwijderde mails.');return {threadId:data.id,mailbox:auth.mailbox,messages,excluded:data.messages.length-messages.length};}
 };
 for(const name of ['configure','finish','disconnect']){const action=service[name];service[name]=(...args)=>store.exclusive('gmail-phase-sync',()=>action(...args));}
 return service;
}
export async function handleGmail({request,env},{fetcher=fetch}={}){
 let callback=false;
 try{
  const url=new URL(request.url),action=url.pathname.replace('/__local/assistant/gmail-','');callback=action==='callback';
  const session=await sessionFingerprint(request,env),service=createCloudGmail(env,{fetcher});
  if(callback&&request.method==='GET'){await service.finish(url.searchParams,url.origin,session);return callbackPage('Gmail gekoppeld','Je kunt nu je mailbox openen in het CRM. De verleende toegang wordt uitsluitend via de daarvoor gebouwde CRM-acties gebruikt.');}
  if(action==='phase-auto-status'&&request.method==='GET'){const user=await authenticated(request,env);if(!user||user.local)throw fail('Log in op het beveiligde CRM.',401);return json(await service.phaseAuto('status'));}
  if(action==='status'&&request.method==='GET')return json(await service.status(url.origin));
  if(request.method!=='POST'||request.headers.get('Origin')!==url.origin||!request.headers.get('Content-Type')?.startsWith('application/json'))throw fail('Ongeldig koppelverzoek.',403);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>(action.startsWith('phase-auto-')?100000:30000))throw fail('Het verzoek is te groot.',413);let input;try{input=JSON.parse(raw);}catch{throw fail('Geen geldig JSON-verzoek.');}if(!input||typeof input!=='object'||Array.isArray(input))throw fail('Geen geldig verzoek.');
  if(['phase-auto-configure','phase-auto-sync'].includes(action)){const user=await authenticated(request,env);if(!user||user.local)throw fail('Log in op het beveiligde CRM.',401);if(action==='phase-auto-configure'&&input.enabled===true&&(input.confirmation!==phaseAutoConfirmation||request.headers.get('X-CRM-Gmail-Confirm')!=='phase-auto-settings'))throw fail('Bevestig eerst de automatische faselabels.',403);if(input.confirmation===phaseResolveConfirmation&&request.headers.get('X-CRM-Gmail-Confirm')!=='phase-auto-resolution')throw fail('Bevestig eerst de conflictoplossing.',403);return json(await service.phaseAuto(action==='phase-auto-configure'?'configure':'sync',input));}
  if(action==='configure')return json(await service.configure(input,url.origin));
  if(action==='login')return json(await service.start(url.origin,session,input));
  if(action==='disconnect')return json(await service.disconnect(url.origin));
  if(['phase-review','phase-apply'].includes(action)){const user=await authenticated(request,env);if(!user||user.local)throw fail('Log in op het beveiligde online CRM.',401);if(action==='phase-apply'&&request.headers.get('X-CRM-Gmail-Confirm')!=='phase-labels')throw fail('Expliciete gebruikersbevestiging ontbreekt.',403);return json(await service.phaseSync(session,action==='phase-review'?'review':'apply',input));}
  if(['list','message','thread','attachment','labels'].includes(action))return json(await service[action](input));
  throw fail('Deze Gmail-actie is niet beschikbaar. Alleen leestoegang is actief.',404);
 }catch(e){if(callback)return callbackPage('Gmail nog niet gekoppeld',e.status?e.message:'De verbinding kon niet veilig worden afgerond. Begin opnieuw vanuit het CRM.',e.status||503);return json({error:e.status||e.field?e.message:'De online Gmail-dienst is tijdelijk niet beschikbaar.',...(e.field?{field:e.field}:{})},e.status||(e.field?400:503));}
}
function callbackPage(title,message,status=200){const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));return new Response('<!doctype html><html lang="nl"><meta charset="utf-8"><title>'+esc(title)+'</title><body><h1>'+esc(title)+'</h1><p>'+esc(message)+'</p><a href="/admin/#mail">Terug naar je mailbox</a></body></html>',{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'}});}
