import {integrationStore,integrationError as fail,random,sha256} from './integration-store.js';
import {outlookFetch,outlookGraph,outlookBase64Url} from './outlook-http.js?v=supplier-batches35-20261101';
const scope='offline_access https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.Read';
const guid=value=>typeof value==='string'&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value);
const mailbox='info@bouwmarktxl.nl';
export async function outlookEnvironment(env){
 if(env.CRM_COMPANY_ID!=='maatwerkkunststof'||env.CRM_LOCAL_DEV==='true'||env.CRM_LOCAL_SERVICES||!['preview','production'].includes(env.CRM_RELEASE_ENV)||env.CRM_OUTLOOK_SUPPLIER_ENABLED!=='true')throw fail('De aparte Outlook-leeskoppeling is nog niet ingericht.',503);
 const origin=new URL(env.CRM_PUBLIC_URL);if(origin.protocol!=='https:'||origin.origin!==String(env.CRM_PUBLIC_URL).replace(/\/$/,''))throw fail('De beveiligde CRM-URL ontbreekt.',503);
 const tenant=env.CRM_OUTLOOK_TENANT_ID,client=env.CRM_OUTLOOK_CLIENT_ID,secret=env.CRM_OUTLOOK_CLIENT_SECRET;
 if(!(guid(tenant)||tenant==='organizations')||!guid(client)||typeof secret!=='string'||secret.length<16||secret.length>8192||!/^[a-f0-9]{64}$/.test(env.CRM_OUTLOOK_STORAGE_ID||''))throw fail('De Microsoft-app en afgescheiden mailopslag moeten nog worden ingericht.',503);
 let identity;try{identity=await env.DB.prepare('SELECT company_id,environment,storage_id FROM crm_mail_service_identity WHERE id=1').first();}catch{throw fail('De identiteit van de mailopslag is nog niet ingericht.',503);}
 const company=await env.DB.prepare('SELECT company_id FROM crm_company_identity WHERE id=1').first();
 if(company?.company_id!=='maatwerkkunststof'||identity?.company_id!=='maatwerkkunststof'||identity.environment!==env.CRM_RELEASE_ENV||identity.storage_id!==env.CRM_OUTLOOK_STORAGE_ID||!env.CRM_FILES)throw fail('De mailopslag hoort niet aantoonbaar bij deze CRM-omgeving.',503);
 const callback=origin.origin+'/api/crm/supplier-mail/callback',version=await sha256(JSON.stringify([tenant,client,origin.origin,mailbox,await sha256(secret)]));
 return {tenant,client,secret,callback,version,mailbox};
}
export function createOutlookConnection(env){
 const store=integrationStore(env);
 const postToken=(config,values)=>outlookFetch('https://login.microsoftonline.com/'+config.tenant+'/oauth2/v2.0/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.client,client_secret:config.secret,scope,...values}).toString()},100000);
 function validTokens(value,{refreshRequired=false}={}){
  const scopes=String(value.scope||'').toLowerCase().split(/\s+/).map(v=>v.replace('https://graph.microsoft.com/',''));
  if(typeof value.access_token!=='string'||value.access_token.length>30000||!value.access_token||!Number.isFinite(value.expires_in)||value.expires_in<60||value.expires_in>86400||!scopes.includes('mail.read')||scopes.some(v=>['mail.send','mail.readwrite','mail.readwrite.shared'].includes(v))||refreshRequired&&(typeof value.refresh_token!=='string'||!value.refresh_token)||value.refresh_token&&value.refresh_token.length>30000)throw fail('Microsoft heeft geen passende blijvende alleen-lezen toegang gegeven.',403);
 }
 async function identity(){const config=await outlookEnvironment(env),record=await store.read('supplier-outlook'),connection=record.value;return {config,record,connection:connection?.configVersion===config.version?connection:null};}
 async function status(){const {config,connection}=await identity();return {configured:true,connected:!!connection?.refreshToken,mailbox:config.mailbox,callbackUrl:config.callback,identity:connection?.identity||'',since:connection?.since||''};}
 async function start(session,since){
  const config=await outlookEnvironment(env);
  if(typeof since!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(since)||!Number.isFinite(Date.parse(since))||new Date(since).toISOString().slice(0,10)!==since||since>new Date().toISOString().slice(0,10))throw fail('Kies vanaf welke datum je leveranciersmails wilt ophalen.');
  const state=random(),id=await sha256(state),verifier=outlookBase64Url(crypto.getRandomValues(new Uint8Array(48))),sessionHash=await sha256('supplier-outlook|'+session);
  const encrypted=await store.seal('supplier-outlook-oauth:'+id,{verifier,since});
  await store.db.batch([store.db.prepare('DELETE FROM crm_oauth_requests WHERE expires_at<=? OR (company_id=? AND session_hash=?)').bind(Date.now(),store.company,sessionHash),store.db.prepare('INSERT INTO crm_oauth_requests(id,company_id,session_hash,config_version,ciphertext,expires_at) VALUES(?,?,?,?,?,?)').bind(id,store.company,sessionHash,config.version,encrypted,Date.now()+600000)]);
  const challenge=outlookBase64Url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))),url=new URL('https://login.microsoftonline.com/'+config.tenant+'/oauth2/v2.0/authorize');
  url.search=new URLSearchParams({client_id:config.client,response_type:'code',redirect_uri:config.callback,response_mode:'query',scope,state,code_challenge:challenge,code_challenge_method:'S256',login_hint:config.mailbox,prompt:'select_account'}).toString();return {url:url.href};
 }
 async function finish(params,session){
  const config=await outlookEnvironment(env),state=params.get('state');if(!/^[a-f0-9]{64}$/.test(state||''))throw fail('Begin de Microsoft-aanmelding opnieuw vanuit het CRM.');
  const id=await sha256(state),sessionHash=await sha256('supplier-outlook|'+session),pending=await store.db.prepare('DELETE FROM crm_oauth_requests WHERE id=? AND company_id=? AND session_hash=? AND expires_at>? RETURNING config_version,ciphertext').bind(id,store.company,sessionHash,Date.now()).first();
  if(!pending||pending.config_version!==config.version)throw fail('Deze aanmelding is verlopen, gewijzigd of hoort bij een andere sessie.');
  if(params.has('error'))throw fail('Microsoft koppelen is niet afgerond. De eerdere verbinding is behouden.');
  const code=params.get('code');if(!code||code.length>12000)throw fail('Microsoft gaf geen bruikbare aanmeldcode.');
  const intent=await store.open('supplier-outlook-oauth:'+id,pending.ciphertext),result=await postToken(config,{grant_type:'authorization_code',code,code_verifier:intent.verifier,redirect_uri:config.callback});validTokens(result,{refreshRequired:true});
  const profile=await outlookGraph(result.access_token,'me?$select=id,mail,userPrincipalName');
  if(typeof profile.id!=='string'||profile.id.length>200||String(profile.mail||profile.userPrincipalName||'').toLowerCase()!==config.mailbox)throw fail('Kies de ingestelde BouwmarktXL-mailbox. Gedeelde of andere mailboxen zijn niet automatisch dezelfde koppeling.',403);
  const old=await store.read('supplier-outlook');await store.write('supplier-outlook',{configVersion:config.version,identity:await sha256(profile.id+'|'+config.mailbox),graphId:profile.id,mailbox:config.mailbox,since:intent.since,accessToken:result.access_token,refreshToken:result.refresh_token,expiresAt:Date.now()+result.expires_in*1000},old.version);
  return {connected:true};
 }
 async function access(){return store.exclusive('supplier-outlook-token',async()=>{
  const {config,record,connection}=await identity();if(!connection?.refreshToken)throw fail('Koppel eerst je BouwmarktXL-mailbox met Microsoft.',409);
  if(connection.expiresAt>Date.now()+120000)return {token:connection.accessToken,connection};
  const result=await postToken(config,{grant_type:'refresh_token',refresh_token:connection.refreshToken});validTokens(result);
  const next={...connection,accessToken:result.access_token,refreshToken:result.refresh_token||connection.refreshToken,expiresAt:Date.now()+result.expires_in*1000};await store.write('supplier-outlook',next,record.version);return {token:next.accessToken,connection:next};
 });}
 async function disconnect(){const {record}=await identity();if(record.value)await store.write('supplier-outlook',null,record.version);return {disconnected:true};}
 return {store,status,start,finish,access,identity,disconnect};
}
