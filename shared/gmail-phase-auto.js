import {funnelPhasesFor} from './sales-funnel.js?v=feedback-followup-20261028';
import {gmailModifyScope} from './gmail-phase-sync.js?v=feedback-followup-20261028';
const fail=message=>{throw Object.assign(Error(message),{status:409});};
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)))),n=>n.toString(16).padStart(2,'0')).join('');
const id=value=>typeof value==='string'&&/^[-a-zA-Z0-9_.]{1,160}$/.test(value);
const threadId=value=>typeof value==='string'&&/^[a-fA-F0-9]{1,100}$/.test(value);
export const phaseAutoConfirmation='Automatische verkoopfases voor gekoppelde gesprekken toestaan';
export const phaseResolveConfirmation='Deze verkoopfase voor dossier en gekoppelde gesprekken gebruiken';
// This executor has no mail-send/delete/settings tools. Settings are private,
// bound to one Google connection, and must be enabled through the human route.
// Adapters serialize all operations per company, including disable/reconnect.
export function createGmailPhaseAuto({identity,catalog,thread,modify,load,save,crmContext,now=Date.now}){
 async function publicStatus(company){
  const settings=await load(company,'settings'),account=await identity(company);
  const active=!!settings?.enabled&&account.connected&&settings.mailbox===account.mailbox&&settings.connectionRevision===account.revision&&account.scopes?.includes(gmailModifyScope);
  return {enabled:!!settings?.enabled,active:!!active,version:settings?.version||'',mailbox:account.mailbox||'',mapping:settings?.mapping||[],needsConsent:account.connected&&!account.scopes?.includes(gmailModifyScope),reason:settings?.enabled&&!active?'Gmail is opnieuw gekoppeld, losgekoppeld of mist wijzigtoestemming. Controleer de koppeling en activeer fasesynchronisatie opnieuw.':''};
 }
 async function configure(company,input){
  const old=await load(company,'settings');if(input.version!==(old?.version||''))fail('De synchronisatie-instelling is intussen gewijzigd. Open het venster opnieuw.');
  if(input.enabled===false){await save(company,'settings',{...old,enabled:false,version:random()});return publicStatus(company);}
  if(input.enabled!==true||input.confirmation!==phaseAutoConfirmation)fail('Geef eerst toestemming voor automatische verkoopfases.');
  const account=await identity(company);if(!account.connected||account.mailbox!==input.mailbox)fail('Koppel eerst de juiste Gmail-mailbox.');
  if(!account.scopes?.includes(gmailModifyScope))fail('Geef eerst aanvullende Google-toestemming voor faselabels.');
  const labels=await catalog(company,account),phases=funnelPhasesFor(company).map(([phase])=>phase),mapping=input.mapping;
  if(!Array.isArray(mapping)||mapping.length!==phases.length||new Set(mapping.map(m=>m?.phase)).size!==phases.length||new Set(mapping.map(m=>m?.labelId)).size!==phases.length||mapping.some(m=>!m||!phases.includes(m.phase)||!labels.some(l=>l.id===m.labelId)))fail('Kies voor iedere verkoopfase één verschillend bestaand Gmail-label.');
  const settings={enabled:true,version:random(),mailbox:account.mailbox,connectionRevision:account.revision,approvedAt:new Date(now()).toISOString(),mapping:mapping.map(m=>({phase:m.phase,labelId:m.labelId,name:labels.find(l=>l.id===m.labelId).name}))};
  await save(company,'settings',settings);return publicStatus(company);
 }
 async function sync(company,input){
  const settings=await load(company,'settings'),account=await identity(company);
  if(!settings?.enabled)return {disabled:true};
  if(!account.connected||account.mailbox!==settings.mailbox||account.revision!==settings.connectionRevision||!account.scopes?.includes(gmailModifyScope))fail('Fasesynchronisatie gepauzeerd. Controleer Gmail en activeer de koppeling opnieuw.');
  const context=await crmContext(company,input);
  if(!id(context.orderId)||typeof context.signal?.basis!=='string'||context.signal.basis.length>64000||!settings.mapping.some(m=>m.phase===context.signal.phase)||!Array.isArray(context.links)||!context.links.length||context.links.length>10||new Set(context.links.map(t=>t.threadId)).size!==context.links.length||context.links.some(t=>t.mailbox!==account.mailbox||!threadId(t.threadId)))fail('Koppel maximaal tien eenduidige gesprekken uit de eigen mailbox aan dit dossier.');
  const labels=await catalog(company,account);
  if(settings.mapping.some(m=>!labels.some(l=>l.id===m.labelId&&l.name===m.name)))fail('Een gekoppeld Gmail-label is verwijderd of hernoemd. Controleer de labelkeuze opnieuw.');
  const key='order-'+context.orderId,old=await load(company,key),binding=await digest([settings.version,context.orderId,context.links.map(t=>t.threadId).sort()]);
  const current=[];
  for(const link of context.links){
   const messages=await thread(company,account,link.threadId);
   if(!Array.isArray(messages)||!messages.length||messages.length>100||messages.some(m=>!Array.isArray(m.labelIds)||m.labelIds.some(l=>['SPAM','TRASH','DRAFT'].includes(l))))fail('Een gesprek bevat spam, verwijderde mail of een concept. Controleer het in Gmail.');
   const phases=[...new Set(messages.flatMap(m=>settings.mapping.filter(label=>m.labelIds.includes(label.labelId)).map(label=>label.phase)))].sort();
   current.push({threadId:link.threadId,phases,messages});
  }
  const observed=current.map(t=>[t.threadId,t.phases]).sort((a,b)=>a[0].localeCompare(b[0]));
  const observation=await digest([binding,context.signal,observed]);
  const stable=old?.binding===binding?old:null;
  const conflict=async message=>{
   const candidates=[...new Set([context.signal.phase,...current.flatMap(t=>t.phases)])];
   const review=stable?.review?.observation===observation&&stable.review.expiresAt>now()?stable.review:{token:random(),observation,expiresAt:now()+120000,candidates};
   await save(company,key,{...(old||{}),binding,review,status:'conflict',message});
   return {conflict:true,message,orderId:context.orderId,signal:context.signal,crmPhase:context.signal.phase,phases:current.map(t=>({threadId:t.threadId,phases:t.phases})),candidates,reviewToken:review.token,expiresAt:review.expiresAt};
  };
  let target,source='crm';
  const resolving=input.confirmation===phaseResolveConfirmation;
  if(resolving){
   if(!stable?.review||stable.review.token!==input.reviewToken||stable.review.expiresAt<now()||stable.review.observation!==observation||!stable.review.candidates.includes(input.phase))fail('Het faseconflict is gewijzigd of de bevestiging is verlopen. Lees opnieuw.');
   target=input.phase;source=target===context.signal.phase?'crm':'gmail';
  }else{
   if(stable?.status==='conflict'&&stable.review?.observation===observation)return conflict(stable.message);
   if(current.some(t=>t.phases.length>1))return conflict('Meerdere verkoopfaselabels in hetzelfde gesprek. Kies welke fase klopt.');
   if(stable?.status==='uncertain'||stable?.status==='applying'){
    if(!current.every(t=>t.phases.length===1&&t.phases[0]===stable.phase))return conflict('De vorige Google-wijziging is niet zeker afgerond. Kies de juiste fase na controle.');
    if(stable.basis!==context.signal.basis)return conflict('Tijdens de vorige labelwijziging is ook het dossier aangepast. Controleer welke fase klopt.');
    target=stable.phase;source=stable.source;
   }else if(!stable){
    const found=[...new Set(current.flatMap(t=>t.phases))];
    if(found.length>1)return conflict('De gekoppelde gesprekken hebben verschillende fases. Kies één fase voor dit dossier.');
    target=found[0]||context.signal.phase;source=found.length?'gmail':'crm';
   }else{
    const crmChanged=stable.basis!==context.signal.basis;
    const changed=current.filter(t=>t.phases.length!==1||t.phases[0]!==stable.phase);
    if(changed.length&&crmChanged)return conflict('Zowel Gmail als het CRM is sinds de vorige synchronisatie gewijzigd. Kies welke fase nu klopt.');
    if(changed.some(t=>!t.phases.length))return conflict('Het verkoopfaselabel is uit Gmail verwijderd. Kies een fase; het CRM zet niet stilzwijgend het oude label terug.');
    const found=[...new Set(changed.flatMap(t=>t.phases))];
    if(found.length>1)return conflict('Er zijn verschillende nieuwe Gmail-fases. Kies welke klopt.');
    target=crmChanged?context.signal.phase:found[0]||stable.phase;source=crmChanged?'crm':found.length?'gmail':stable.source;
   }
  }
  const selected=settings.mapping.find(m=>m.phase===target);if(!selected)fail('De gekozen fase heeft geen toegestaan Gmail-label.');
  // Re-read authoritative CRM and permission before the first provider mutation.
  const fresh=await crmContext(company,input),permission=await identity(company),latest=await load(company,'settings');
  if(JSON.stringify(fresh)!==JSON.stringify(context)||permission.revision!==account.revision||!permission.connected||!latest?.enabled||latest.version!==settings.version)fail('Dossier, koppeling of toestemming is veranderd. Er is nog niets bijgewerkt; probeer opnieuw.');
  const record={binding,basis:context.signal.basis,phase:target,source,at:stable?.status==='synced'&&stable.basis===context.signal.basis&&stable.phase===target&&stable.source===source?stable.at:new Date(now()).toISOString(),status:'applying'};
  const needsWrite=current.some(t=>t.messages.some(m=>!m.labelIds.includes(selected.labelId)||settings.mapping.some(l=>l.phase!==target&&m.labelIds.includes(l.labelId))));
  // Also re-read labels before writing. New messages are fine; a phase change is not.
  if(needsWrite)for(const item of current){
   const freshMessages=await thread(company,account,item.threadId),phases=[...new Set(freshMessages.flatMap(m=>settings.mapping.filter(l=>m.labelIds?.includes(l.labelId)).map(l=>l.phase)))];
   if(freshMessages.some(m=>m.labelIds?.some(l=>['SPAM','TRASH','DRAFT'].includes(l)))||JSON.stringify(phases.sort())!==JSON.stringify([...item.phases].sort()))fail('De Gmail-labels zijn tijdens het synchroniseren gewijzigd. Lees opnieuw om de huidige fase te controleren.');
   item.messages=freshMessages;
  }
  const changes=current.filter(t=>t.messages.some(m=>!m.labelIds.includes(selected.labelId)||settings.mapping.some(label=>label.phase!==target&&m.labelIds.includes(label.labelId))));
  if(changes.length){
   await save(company,key,record);
   try{
    for(const item of changes)await modify(company,account,{threadId:item.threadId,addLabelIds:[selected.labelId],removeLabelIds:settings.mapping.filter(m=>m.phase!==target).map(m=>m.labelId)});
   }catch{await save(company,key,{...record,status:'uncertain'}).catch(()=>{});fail('Google bevestigde de fasewijziging niet zeker. Geen automatische herhaling; controleer het conflict bij E-mail.');}
  }
  const saved={...record,status:'synced'};
  if(JSON.stringify(stable)!==JSON.stringify(saved))await save(company,key,saved);
  return {orderId:context.orderId,signal:context.signal,phase:target,source,mailbox:account.mailbox,threads:context.links.map(t=>t.threadId).sort(),at:saved.at,changed:changes.length};
 }
 return {status:publicStatus,configure,sync};
}
