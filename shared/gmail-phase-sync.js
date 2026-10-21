import {gmailPhaseSuggestions} from './gmail-labels.js';
import {funnelPhasesFor} from './sales-funnel.js?v=maat-cleanup-20261021';
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)))),n=>n.toString(16).padStart(2,'0')).join('');
const failure=message=>Object.assign(Error(message),{status:409});
const validThread=id=>typeof id==='string'&&/^[a-fA-F0-9]{1,100}$/.test(id);
export const gmailModifyScope='https://www.googleapis.com/auth/gmail.modify';
const fingerprint=data=>({mailbox:data.mailbox,revision:data.revision,labels:data.labels.map(l=>[l.id,l.name]).sort((a,b)=>a[0].localeCompare(b[0])),messages:data.messages.map(m=>[m.gmailId,[...(m.labelIds||[])].sort()]).sort((a,b)=>a[0].localeCompare(b[0]))});
// All provider calls are supplied by fixed server adapters. No arbitrary URL/label payload.
// Callers serialize per company/session and keep proposals in private server storage.
export function createGmailPhaseSync({inspect,modify,load,save,now=Date.now}){
 return async function phaseSync(companyId,session,action,input){
  if(companyId!=='maatwerkkunststof'||typeof session!=='string'||session.length<32)throw failure('Faselabels zijn alleen voor de eigen Maatwerkkunststof-sessie beschikbaar.');
  if(action==='review'){
   if(typeof input.orderId!=='string'||!/^[-a-zA-Z0-9_.]{1,160}$/.test(input.orderId)||!validThread(input.threadId)||typeof input.mailbox!=='string'||!funnelPhasesFor(companyId).some(([id])=>id===input.phase))throw failure('Kies een geldig gesprek en een verkoopfase.');
   const data=await inspect(companyId,input),targets=data.labels.filter(label=>gmailPhaseSuggestions([label],companyId).includes(input.phase));
   if(targets.length!==1)throw failure('Het Gmail-label voor deze fase ontbreekt of komt dubbel voor. Maak of corrigeer het in Gmail en probeer opnieuw.');
   const target=targets[0],current=new Set(data.messages.flatMap(m=>m.labelIds||[])),remove=data.labels.filter(label=>label.id!==target.id&&current.has(label.id)&&gmailPhaseSuggestions([label],companyId).length),already=data.messages.length>0&&!remove.length&&data.messages.every(m=>m.labelIds?.includes(target.id));
   if(already)return {already:true,mailbox:data.mailbox,target:target.name};
   if(!data.scopes?.includes(gmailModifyScope))return {needsConsent:true,mailbox:data.mailbox,target:target.name};
   const token=random(),proposal={id:random(),companyId,mailbox:data.mailbox,threadId:input.threadId,orderId:input.orderId,phase:input.phase,connectionRevision:data.revision,target:target.name,subject:data.messages.at(-1)?.subject||'',addLabelIds:[target.id],removeLabelIds:remove.map(l=>l.id),removeNames:remove.map(l=>l.name),fingerprint:await digest(fingerprint(data)),tokenHash:await digest(token),expiresAt:now()+120000,status:'reviewed'};
   await save(session,proposal);return {id:proposal.id,reviewToken:token,mailbox:proposal.mailbox,subject:proposal.subject,target:proposal.target,removeNames:proposal.removeNames,expiresAt:proposal.expiresAt};
  }
  if(action!=='apply'||input.confirmation!=='Gmail-faselabels bijwerken'||typeof input.reviewToken!=='string')throw failure('Bekijk en bevestig eerst de exacte Gmail-labelwijziging.');
  const proposal=await load(session);
  if(!proposal||proposal.companyId!==companyId||proposal.id!==input.id||proposal.expiresAt<now()||proposal.tokenHash!==await digest(input.reviewToken))throw failure('De labelbevestiging is verlopen of hoort bij een andere sessie.');
  if(proposal.status==='applied')return {applied:true,replayed:true};
  if(proposal.status!=='reviewed')throw failure('Het vorige resultaat is onzeker. Lees de Gmail-labels opnieuw voordat je verdergaat.');
  const current=await inspect(companyId,proposal);
  if(!current.scopes?.includes(gmailModifyScope)||await digest(fingerprint(current))!==proposal.fingerprint)throw failure('Het gesprek, de labels of de toestemming is gewijzigd. Bekijk een nieuw voorstel.');
  await save(session,{...proposal,status:'applying'});
  try{await modify(companyId,proposal);await save(session,{...proposal,status:'applied'});return {applied:true};}
  catch{await save(session,{...proposal,status:'uncertain'}).catch(()=>{});throw failure('Geen zekere Google-bevestiging ontvangen. Lees de labels opnieuw; klik niet blind opnieuw op uitvoeren.');}
 };
}
