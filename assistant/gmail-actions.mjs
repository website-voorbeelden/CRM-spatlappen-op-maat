import {randomBytes,randomUUID,createHash,timingSafeEqual} from 'node:crypto';
import {mkdir,chmod,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {companyFor} from '../shared/companies.js';
import {gmailCapability,gmailCapabilities,gmailBlockedCapabilities,hasGmailScope} from '../shared/gmail-capabilities.js';
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
function exact(value,keys){if(!object(value)||Object.keys(value).some(k=>!keys.includes(k)))throw Error('Onbekend veld in het Gmail-voorstel.');}
function text(value,max=200,empty=false){if(typeof value!=='string'||value.length>max||(!empty&&!value.trim())||/[\0\r]/.test(value))throw Error('Ongeldige tekst in het Gmail-voorstel.');return value;}
function header(value,max=500){const result=text(value,max,true);if(result.includes('\n'))throw Error('Een mailkop mag geen nieuwe regel bevatten.');return result;}
function id(value){if(typeof value!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(value))throw Error('Ongeldige Gmail-verwijzing.');return value;}
function labelIds(value){if(!Array.isArray(value)||value.length>50||new Set(value).size!==value.length)throw Error('Ongeldige Gmail-labels.');return value.map(id);}
function recipients(values){if(!Array.isArray(values)||values.length>20)throw Error('Ongeldige ontvangers.');return values.map(v=>{if(typeof v!=='string'||v.length>254||!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(v))throw Error('Ongeldig e-mailadres.');return v;});}
// No raw MIME, URL, HTTP method, arbitrary setting or unbounded bulk operation.
export function normalizeGmailAction(operation,input){
 const capability=gmailCapability(operation);let payload;
 if(['messages.send','messages.reply','drafts.create','drafts.update'].includes(operation)){
  exact(input,['to','cc','bcc','subject','text','threadId','replyMessageId','draftId']);
  payload={to:recipients(input.to),cc:recipients(input.cc||[]),bcc:recipients(input.bcc||[]),subject:header(input.subject),text:text(input.text,50000,true)};
  if(!payload.to.length&&['messages.send','messages.reply'].includes(operation))throw Error('Kies ten minste één ontvanger.');
  if(input.threadId)payload.threadId=id(input.threadId);
  if(operation==='messages.reply'){payload.threadId=id(input.threadId);if(typeof input.replyMessageId!=='string'||!/^<[^<>\s]{1,250}>$/.test(input.replyMessageId))throw Error('Het oorspronkelijke bericht ontbreekt.');payload.replyMessageId=input.replyMessageId;}
  if(operation==='drafts.update')payload.draftId=id(input.draftId);
  if(operation!=='drafts.update'&&input.draftId)throw Error('Geen concept-ID bij deze actie.');
 }else if(operation.endsWith('.modify')){
  exact(input,['id','addLabelIds','removeLabelIds']);payload={id:id(input.id),addLabelIds:labelIds(input.addLabelIds||[]),removeLabelIds:labelIds(input.removeLabelIds||[])};
  if(!payload.addLabelIds.length&&!payload.removeLabelIds.length||payload.addLabelIds.some(l=>payload.removeLabelIds.includes(l)))throw Error('Kies een geldige labelwijziging.');
  if([...payload.addLabelIds,...payload.removeLabelIds].some(l=>['SENT','DRAFT','TRASH','SPAM'].includes(l)))throw Error('Gebruik voor verwijderen/herstellen een afzonderlijk voorstel. Systeemlabels kunnen niet zo worden aangepast.');
 }else if(['labels.create','labels.update'].includes(operation)){
  exact(input,['id','name']);payload={name:text(input.name)};if(/[\n]/.test(payload.name))throw Error('Een labelnaam mag geen nieuwe regel bevatten.');if(operation==='labels.update')payload.id=id(input.id);else if(input.id)throw Error('Geen label-ID bij aanmaken.');
 }else if(operation==='filters.create'){
  exact(input,['from','to','subject','query','addLabelIds','removeLabelIds']);payload={from:text(input.from||'',254,true),to:text(input.to||'',254,true),subject:header(input.subject||''),query:text(input.query||'',1000,true),addLabelIds:labelIds(input.addLabelIds||[]),removeLabelIds:labelIds(input.removeLabelIds||[])};
  if(![payload.from,payload.to,payload.subject,payload.query].some(Boolean))throw Error('Een filter moet een zoekvoorwaarde hebben.');
 }else if(operation==='settings.vacation'){
  exact(input,['enabled','subject','text']);if(typeof input.enabled!=='boolean')throw Error('Kies of het vakantieantwoord aan staat.');payload={enabled:input.enabled,subject:header(input.subject||''),text:text(input.text||'',10000,true)};
 }else if(['settings.imap','settings.pop'].includes(operation)){
  exact(input,['enabled']);if(typeof input.enabled!=='boolean')throw Error('Kies aan of uit.');payload={enabled:input.enabled};
 }else{exact(input,['id']);payload={id:id(input.id)};}
 return {capability,payload};
}
// The only production construction supplies NO executor. Nothing can activate
// writes through HTTP, an OAuth token, a model argument or a stored approval.
// A future fixed provider adapter must be supplied in code after a separate review.
export function createGmailActions({directory,getIdentity,executor=null,readTarget=null,now=Date.now}){
 const proposals=new Map(),reviews=new Map(),locks=new Map();
 function actor(company,context){companyFor(company);if(!context||typeof context.session!=='string'||context.session.length<32)throw Error('Een gecontroleerde CRM-sessie ontbreekt.');return context.session;}
 const exclusive=(company,fn)=>{const next=(locks.get(company)||Promise.resolve()).catch(()=>{}).then(fn);locks.set(company,next);return next;};
 async function identity(company){const value=await getIdentity(company);if(!value?.connected||!value.mailbox||!value.revision)throw Error('Koppel eerst het Gmail-account van dit bedrijf.');return value;}
 function publicProposal(p){return structuredClone({id:p.id,companyId:p.companyId,mailbox:p.mailbox,operation:p.operation,label:p.label,risk:p.risk,reason:p.reason,payload:p.payload,revision:p.revision,expiresAt:p.expiresAt,status:p.status,statement:p.statement,executionEnabled:!!executor,requiredScope:p.scope});}
 function prune(){for(const [key,p] of proposals)if(p.expiresAt<=now()){proposals.delete(key);reviews.delete(key);}if(proposals.size>=100)throw Error('Te veel openstaande voorstellen. Annuleer een voorstel of wacht tot het verloopt.');}
 function find(company,input,context){const p=proposals.get(input.id);if(!p||p.companyId!==company||p.actor!==actor(company,context)||p.expiresAt<=now())throw Error('Dit voorstel is verlopen of hoort bij een andere sessie.');if(input.revision!==p.revision)throw Error('Het voorstel is gewijzigd. Bekijk het opnieuw.');return p;}
 async function audit(p,status){
  const folder=path.join(directory,p.companyId);await mkdir(folder,{recursive:true,mode:0o700});await chmod(folder,0o700);
  const file=path.join(folder,p.id+'.json'),temp=file+'.'+randomUUID()+'.tmp';
  const value={id:p.id,companyId:p.companyId,operation:p.operation,digest:p.revision,status,time:new Date(now()).toISOString()};
  await writeFile(temp,JSON.stringify(value),{mode:0o600});await rename(temp,file);await chmod(file,0o600);
 }
 async function checkIdentity(company,p){const current=await identity(company);if(current.mailbox!==p.mailbox||current.revision!==p.connectionRevision)throw Error('Het Gmail-account of de toestemming is gewijzigd. Maak een nieuw voorstel.');return current;}
 return {
  capabilities(){return {executionEnabled:!!executor,approvalRequired:true,criticalActionsEnabled:false,capabilities:gmailCapabilities,blocked:gmailBlockedCapabilities};},
  list(company,context){const session=actor(company,context);return [...proposals.values()].filter(p=>p.companyId===company&&p.actor===session&&p.expiresAt>now()).map(publicProposal);},
  propose(company,input,context){return exclusive(company,async()=>{
   prune();exact(input,['operation','payload','reason']);const session=actor(company,context),{capability:c,payload}=normalizeGmailAction(input.operation,input.payload),who=await identity(company);
   const target=readTarget?await readTarget(company,c.operation,payload):null;
   const p={id:randomUUID(),companyId:company,actor:session,mailbox:who.mailbox,connectionRevision:who.revision,operation:c.operation,label:c.label,risk:c.risk,scope:c.scope,reason:text(input.reason,2000),payload,targetDigest:digest(target),expiresAt:now()+600000,status:'proposed'};
   p.statement=c.risk==='sensitive'?'BEVESTIG '+c.label.toUpperCase():'';p.revision=digest(p);proposals.set(p.id,p);await audit(p,'proposed');return publicProposal(p);
  });},
  review(company,input,context){return exclusive(company,async()=>{
   if(context.channel!=='human')throw Error('Alleen de CRM-bevestigingsinterface kan een voorstel ter controle openen.');exact(input,['id','revision']);const p=find(company,input,context);if(p.status!=='proposed')throw Error('Dit voorstel is al afgehandeld.');await checkIdentity(company,p);
   const nonce=randomBytes(32).toString('base64url');reviews.set(p.id,{hash:digest(nonce),expiresAt:now()+120000});return {...publicProposal(p),reviewNonce:nonce,reviewExpiresAt:now()+120000};
  });},
  confirm(company,input,context){return exclusive(company,async()=>{
   if(context.channel!=='human')throw Error('Een AI mag niet zelf toestemming geven.');exact(input,['id','revision','reviewNonce','statement']);const p=find(company,input,context),review=reviews.get(p.id);
   if(p.status!=='proposed'||!review||review.expiresAt<=now()||!equal(review.hash,digest(input.reviewNonce)))throw Error('Bekijk het volledige voorstel opnieuw voordat je bevestigt.');
   if(p.risk==='critical')throw Error('Deze gevoelige instelling blijft geblokkeerd totdat extra identiteitscontrole is ingericht.');
   if(p.statement&&input.statement!==p.statement)throw Error('Typ de bevestiging precies over om deze actie toe te staan.');
   const who=await checkIdentity(company,p);
   if(!executor){reviews.delete(p.id);p.status='reviewed-only';await audit(p,p.status);return {status:p.status,executed:false,message:'Bevestiging vastgelegd voor dit voorstel. Gmail-wijzigingen zijn nog uitgeschakeld. Dit voorstel wordt nooit later automatisch uitgevoerd.'};}
   if(!hasGmailScope(who.scopes,p.scope))throw Error('De benodigde Google-toestemming ontbreekt. Er is niets uitgevoerd.');
   if(!readTarget||digest(await readTarget(company,p.operation,p.payload))!==p.targetDigest)throw Error('De oorspronkelijke mail of instelling is gewijzigd. Maak een nieuw voorstel.');
   reviews.delete(p.id);p.status='executing';await audit(p,p.status); // durable intent BEFORE network I/O
   try{await executor({companyId:company,mailbox:p.mailbox,operation:p.operation,payload:structuredClone(p.payload),idempotencyKey:p.id});p.status='completed';await audit(p,p.status);return {status:p.status,executed:true};}
   catch{p.status='uncertain';await audit(p,p.status);throw Error('De uitkomst is onzeker. Controleer Gmail; voer deze actie niet opnieuw uit.');}
  });},
  cancel(company,input,context){return exclusive(company,async()=>{exact(input,['id','revision']);const p=find(company,input,context);if(!['proposed','reviewed-only'].includes(p.status))throw Error('Een lopende of afgehandelde actie kan niet worden geannuleerd.');reviews.delete(p.id);p.status='cancelled';await audit(p,p.status);return {cancelled:true,executed:false};});}
 };
}
