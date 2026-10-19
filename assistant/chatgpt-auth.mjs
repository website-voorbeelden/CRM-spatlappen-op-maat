import {randomBytes,randomUUID,createHash,createPublicKey,verify as verifySignature} from 'node:crypto';
import {readFile,writeFile,mkdir,rename,chmod} from 'node:fs/promises';
import path from 'node:path';
export const AUTH_ORIGIN='https://auth.openai.com',RESOURCE='https://api.openai.com/v1';
const scope='openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const random=()=>randomBytes(32).toString('base64url');
const error=(message,status=400)=>Object.assign(Error(message),{status});
export async function limitedJson(response,max=1_000_000){const text=await response.text();if(Buffer.byteLength(text)>max)throw error('Antwoord van de koppeling is te groot.',502);try{return JSON.parse(text);}catch{throw error('De koppeling gaf geen geldig antwoord.',502);}}
export function validateIdToken(jwt,jwks,{clientId,nonce,issuer=AUTH_ORIGIN,now=Date.now()}){
 if(typeof jwt!=='string'||jwt.length>30000)throw error('Identiteitsbewijs ontbreekt.',401);
 const parts=jwt.split('.');if(parts.length!==3)throw error('Ongeldig identiteitsbewijs.',401);
 let header,claims;try{header=JSON.parse(Buffer.from(parts[0],'base64url'));claims=JSON.parse(Buffer.from(parts[1],'base64url'));}catch{throw error('Ongeldig identiteitsbewijs.',401);}
 if(!['RS256','ES256'].includes(header.alg)||typeof header.kid!=='string'||header.crit)throw error('Niet-ondersteund identiteitsbewijs.',401);
 const jwk=jwks?.keys?.find(k=>k.kid===header.kid&&(!k.use||k.use==='sig')&&(!k.alg||k.alg===header.alg));
 if(!jwk||(header.alg==='RS256'&&jwk.kty!=='RSA')||(header.alg==='ES256'&&jwk.kty!=='EC'))throw error('De identiteit kan niet worden gecontroleerd.',401);
 let valid=false;try{valid=verifySignature('sha256',Buffer.from(parts[0]+'.'+parts[1]),{key:createPublicKey({key:jwk,format:'jwk'}),...(header.alg==='ES256'?{dsaEncoding:'ieee-p1363'}:{})},Buffer.from(parts[2],'base64url'));}catch{}
 const audience=Array.isArray(claims.aud)?claims.aud:[claims.aud],seconds=Math.floor(now/1000);
 if(!valid||claims.iss!==issuer||!audience.includes(clientId)||audience.length>1&&claims.azp!==clientId||!Number.isFinite(claims.exp)||claims.exp<=seconds||claims.nbf&&claims.nbf>seconds+60||claims.iat&&claims.iat>seconds+60||nonce!==undefined&&claims.nonce!==nonce||typeof claims.sub!=='string'||!claims.sub)throw error('De ChatGPT-identiteit is niet geldig. Log opnieuw in.',401);
 return claims;
}
export class ChatGPTConnection {
 constructor(directory,{fetchImpl=globalThis.fetch,clock=()=>Date.now()}={}){this.directory=directory;this.fetch=fetchImpl;this.clock=clock;this.pending=null;this.lastError='';this.refreshing=null;this.modelsCache=null;this.data={profiles:[],activeId:null};}
 async init(){await mkdir(this.directory,{recursive:true,mode:0o700});await chmod(this.directory,0o700);try{const d=JSON.parse(await readFile(path.join(this.directory,'connection.json'),'utf8'));if(Array.isArray(d.profiles)&&typeof d.hostId==='string')this.data=d;else throw Error('invalid');}catch(e){if(e.code!=='ENOENT')throw error('De lokale ChatGPT-configuratie kan niet veilig worden geopend.',503);}
  this.data.hostId??='urn:uuid:'+randomUUID();await this.save();return this;
 }
 async save(){const file=path.join(this.directory,'connection.json'),tmp=file+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(this.data),{mode:0o600});await rename(tmp,file);await chmod(file,0o600);}
 active(){return this.data.profiles.find(p=>p.id===this.data.activeId)||null;}
 status(){const p=this.active();return {connected:!!p?.accessToken,sharing:!!p?.scopes?.includes('chatgpt.tokens.use.direct')&&!!p?.accessToken,email:p?.email||'',profiles:this.data.profiles.map(p=>({id:p.id,email:p.email,active:p.id===this.data.activeId})),pending:!!this.pending&&this.pending.expiresAt>this.clock(),error:this.lastError};}
 async metadata(){if(this.discovery)return this.discovery;const response=await this.fetch(AUTH_ORIGIN+'/.well-known/openid-configuration',{redirect:'manual',signal:AbortSignal.timeout(20000)});if(!response.ok)throw error('ChatGPT-inlogdienst niet bereikbaar.',503);const data=await limitedJson(response);if(data.issuer!==AUTH_ORIGIN)throw error('Onverwachte inlogdienst.',503);
  for(const name of ['jwks_uri','revocation_endpoint'])if(data[name]){const u=new URL(data[name]);if(u.origin!==AUTH_ORIGIN||u.username||u.password)throw error('Onverwachte inlogdienst.',503);}if(!data.jwks_uri)throw error('Identiteitscontrole niet beschikbaar.',503);return this.discovery=data;
 }
 async start({redirectUri,returnUrl,newAccount=false}){
  if(this.pending&&this.pending.expiresAt>this.clock())throw error('Er staat al een inlogvenster open. Rond dit eerst af of annuleer het.',409);
  const callback=new URL(redirectUri);if(callback.protocol!=='http:'||callback.hostname!=='127.0.0.1'||callback.pathname!=='/auth/callback')throw error('Ongeldige lokale terugkeerroute.');
  const verifier=random(),state=random(),nonce=random(),p=newAccount?null:(this.active()||this.data.profiles.find(p=>!p.subject));
  this.pending={state,nonce,verifier,redirectUri,returnUrl,profileId:p?.id||null,clientId:p?.clientId||null,expiresAt:this.clock()+5*60*1000};this.lastError='';
  const q=new URLSearchParams({client_id:p?.clientId||'dynamic_agent_client',ext_agent_host_id:this.data.hostId,response_type:'code',redirect_uri:redirectUri,scope,resource:RESOURCE,state,nonce,code_challenge_method:'S256',code_challenge:createHash('sha256').update(verifier).digest('base64url')});
  if(!p?.clientId)q.set('agent_name_hint','CRM Assist');
  else {// Avoid exposing even ID tokens to the CRM browser; use the account selector.
   if(p.email)q.set('login_hint',p.email);}
  return {url:AUTH_ORIGIN+'/api/accounts/authorize?'+q.toString()};
 }
 cancel(){this.pending=null;this.lastError='';}
 async finish(query){
  const attempt=this.pending;
  if(!attempt||attempt.expiresAt<=this.clock()||query.get('state')!==attempt.state)throw error('Dit inlogverzoek is ongeldig of verlopen. Begin opnieuw.',401);
  this.pending=null;
  try{
   if(query.get('error'))throw error('Inloggen of toestemming geven is geannuleerd.',401);
   const clientId=attempt.clientId||query.get('client_id'),code=query.get('code');
   if(!clientId||clientId==='dynamic_agent_client'||!/^[-a-zA-Z0-9_.]{1,200}$/.test(clientId)||!code||code.length>10000)throw error('De clientregistratie is niet voltooid. Probeer opnieuw.',401);
   // Save issued registration before exchanging a one-use authorization code.
   let profile=attempt.profileId?this.data.profiles.find(p=>p.id===attempt.profileId):null;
   if(!profile){profile={id:randomUUID(),clientId,email:'',subject:null,scopes:[]};this.data.profiles.push(profile);}else if(profile.clientId!==clientId)throw error('De accountregistratie wijkt af.',401);
   await this.save();
   const response=await this.fetch(AUTH_ORIGIN+'/api/accounts/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:clientId,code,code_verifier:attempt.verifier,redirect_uri:attempt.redirectUri,resource:RESOURCE}),redirect:'manual',signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw error('ChatGPT-inloggen kon niet worden afgerond. Begin opnieuw.',401);
   const tokens=await limitedJson(response),metadata=await this.metadata(),keysResponse=await this.fetch(metadata.jwks_uri,{redirect:'manual',signal:AbortSignal.timeout(20000)});if(!keysResponse.ok)throw error('Identiteitscontrole tijdelijk niet beschikbaar.',503);
   const claims=validateIdToken(tokens.id_token,await limitedJson(keysResponse),{clientId,nonce:attempt.nonce,now:this.clock()});
   if(profile.subject&&profile.subject!==claims.sub)throw error('Dit is een ander account. Kies Account toevoegen om te wisselen.',401);
   if(typeof tokens.access_token!=='string'||!tokens.access_token||tokens.token_type?.toLowerCase()!=='bearer'||!Number.isFinite(tokens.expires_in)||tokens.expires_in<=0)throw error('ChatGPT heeft geen geldige toegang verleend.',401);
   const scopes=String(tokens.scope||'').split(/\s+/).filter(Boolean);
   Object.assign(profile,{subject:claims.sub,email:typeof claims.email==='string'?claims.email:'ChatGPT-account',idToken:tokens.id_token,accessToken:tokens.access_token,refreshToken:tokens.refresh_token||null,scopes,expiresAt:this.clock()+tokens.expires_in*1000});
   this.data.activeId=profile.id;this.modelsCache=null;await this.save();
   if(!scopes.includes('chatgpt.tokens.use.direct'))this.lastError='Je bent ingelogd, maar toestemming voor gebruik van je ChatGPT-plan ontbreekt. Verbind opnieuw met die toestemming.';
   return {returnUrl:attempt.returnUrl,status:this.status()};
  }catch(e){this.lastError=e.status?e.message:'ChatGPT-inloggen is tijdelijk niet bereikbaar. Probeer opnieuw.';throw error(this.lastError,e.status||503);}
 }
 async select(profileId){if(!this.data.profiles.some(p=>p.id===profileId))throw error('Onbekend account.');this.data.activeId=profileId;this.modelsCache=null;this.lastError='';await this.save();return this.status();}
 async token(){const p=this.active();if(!p?.accessToken)throw error('Verbind eerst je ChatGPT-account.',401);if(!p.scopes.includes('chatgpt.tokens.use.direct'))throw error('Geef eerst toestemming om je ChatGPT-plan te gebruiken.',403);
  if(p.expiresAt>this.clock()+60000)return p.accessToken;if(!p.refreshToken)throw error('Log opnieuw in bij ChatGPT.',401);
  if(!this.refreshing)this.refreshing=this.refresh(p).finally(()=>{this.refreshing=null;});await this.refreshing;
  if(this.active()?.id!==p.id)throw error('Het actieve account is intussen gewijzigd. Probeer opnieuw.',409);return p.accessToken;
 }
 async refresh(p){const r=await this.fetch(AUTH_ORIGIN+'/api/accounts/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',client_id:p.clientId,refresh_token:p.refreshToken,resource:RESOURCE}),redirect:'manual',signal:AbortSignal.timeout(20000)});if(!r.ok)throw error('Je ChatGPT-verbinding is verlopen. Verbind opnieuw.',401);const t=await limitedJson(r);if(typeof t.access_token!=='string'||!Number.isFinite(t.expires_in)||t.expires_in<=0)throw error('Je ChatGPT-verbinding kan niet worden vernieuwd.',401);p.accessToken=t.access_token;p.refreshToken=t.refresh_token||p.refreshToken;p.expiresAt=this.clock()+t.expires_in*1000;if(t.scope){p.scopes=String(t.scope).split(/\s+/);if(!p.scopes.includes('chatgpt.tokens.use.direct'))throw error('Toestemming voor je ChatGPT-plan is vervallen.',403);}await this.save();}
 async models(){const p=this.active();if(this.modelsCache?.profile===p?.id&&this.modelsCache.expires>this.clock())return this.modelsCache.models;
  const r=await this.fetch(RESOURCE+'/models',{headers:{Authorization:'Bearer '+await this.token()},redirect:'manual',signal:AbortSignal.timeout(20000)});if(!r.ok)throw error(r.status===429?'Je ChatGPT-gebruikslimiet is bereikt. Bekijk Gebruik beheren.':'Modeltoegang niet beschikbaar voor deze ChatGPT-verbinding.',r.status===429?429:403);
  const data=await limitedJson(r);const models=(Array.isArray(data.models)?data.models:[]).filter(m=>m.visibility==='list'&&typeof m.slug==='string'&&typeof m.display_name==='string').map(m=>({id:m.slug,name:m.display_name}));if(!models.length)throw error('Geen modellen beschikbaar voor dit account. Controleer toegang en toestemming in ChatGPT.',403);
  this.modelsCache={profile:p.id,expires:this.clock()+60000,models};return models;
 }
 async logout(){const p=this.active();this.cancel();let revoked=true;if(p?.refreshToken){try{const meta=await this.metadata();if(!meta.revocation_endpoint)throw Error('no revocation');const r=await this.fetch(meta.revocation_endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:p.refreshToken,token_type_hint:'refresh_token',client_id:p.clientId}),redirect:'manual',signal:AbortSignal.timeout(15000)});revoked=r.status===200;}catch{revoked=false;}}
  if(p){delete p.accessToken;delete p.refreshToken;delete p.idToken;delete p.expiresAt;}this.modelsCache=null;await this.save();this.lastError=revoked?'':'Lokaal losgekoppeld. Intrekken bij OpenAI is niet bevestigd; verbreek de toegang ook in ChatGPT-instellingen.';return this.status();
 }
}
