import {sanitizeSignature,htmlSignatureMessage,signatureText} from './mail-signature.js?v=signatures-20261021';
export const defaultSignatureId='default';
export const noSignatureId='none';
export const signatureProfilesLimit=12;
// Keep the whole signature set compact, also in the hex-encoded encrypted cloud record.
export const signatureCatalogLimit=800_000;
const fail=(message,signatureId)=>{throw Object.assign(Error(message),{field:'signatureHtml',signatureId});};
const profileId=id=>typeof id==='string'&&/^[a-zA-Z0-9._-]{1,100}$/.test(id)&&!['default','none','auto','__proto__','constructor','prototype'].includes(id);
export function signatureProfiles(config={}){
 return [{id:defaultSignatureId,name:'Standaardhandtekening',signature:config.signature||'',signatureHtml:config.signatureHtml||''},...(config.signatureProfiles||[])];
}
export function validateSignatureProfiles(profiles,defaults={}){
 if(!Array.isArray(profiles)||profiles.length>signatureProfilesLimit)fail('Bewaar maximaal twaalf extra handtekeningen.');
 const names=new Set(),ids=new Set();
 const result=profiles.map(profile=>{
  if(!profile||!profileId(profile.id)||ids.has(profile.id))fail('Een handtekening heeft een ongeldig of dubbel kenmerk.');ids.add(profile.id);
  const name=typeof profile.name==='string'?profile.name.trim():'';const key=name.normalize('NFC').toLocaleLowerCase('nl-NL');
  if(!name||name.length>100||names.has(key)||key==='standaardhandtekening')fail('Geef elke handtekening een eigen naam (maximaal 100 tekens).',profile.id);names.add(key);
  if(typeof profile.signature!=='string'||profile.signature.length>2000||profile.signature.includes('\0'))fail('De teksthandtekening mag maximaal 2.000 tekens bevatten.',profile.id);
  let html;try{html=sanitizeSignature(profile.signatureHtml);htmlSignatureMessage('',{signature:profile.signature,signatureHtml:html});}catch(error){fail(name+': '+error.message,profile.id);}
  return {id:profile.id,name,signature:profile.signature,signatureHtml:html};
 });
 if(new TextEncoder().encode(JSON.stringify({signature:defaults.signature||'',signatureHtml:defaults.signatureHtml||'',signatureProfiles:result})).length>signatureCatalogLimit)fail('De handtekeningen zijn samen te groot (maximaal 800 kB opgeslagen inhoud). Gebruik kleinere afbeeldingen of minder varianten.');
 return result;
}
export function validateSignatureBindings(value,senders,profiles){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>8)fail('Controleer de handtekening per afzender.');
 const allowed=new Set(senders.map(sender=>sender.toLowerCase())),choices=new Set([defaultSignatureId,noSignatureId,...profiles.map(p=>p.id)]),out={};
 for(const [sender,id] of Object.entries(value)){
  const key=sender.toLowerCase();if(!allowed.has(key)||!choices.has(id)||Object.hasOwn(out,key))fail('Kies voor iedere afzender een bestaande handtekening.');out[key]=id;
 }
 return out;
}
export function signatureForSender(config,sender,choice=''){
 if(typeof choice!=='string')throw Object.assign(Error('Kies een geldige handtekening.'),{field:'signatureChoice'});
 const automatic=!choice||choice==='auto',id=automatic?(config.signatureBySender?.[String(sender||'').toLowerCase()]||defaultSignatureId):choice;
 if(id===noSignatureId)return {id,name:'Geen handtekening',signature:'',signatureHtml:'',automatic};
 const profile=signatureProfiles(config).find(profile=>profile.id===id);if(!profile)throw Object.assign(Error('Deze handtekening bestaat niet meer. Kies opnieuw.'),{field:'signatureChoice'});
 return {...profile,automatic};
}
export function renderSenderSignature(text,config,sender,choice=''){
 const selected=signatureForSender(config,sender,choice);
 // Older mail templates may contain a previous signature. Replace that exact
 // trailing text once, while keeping the rest of the user's draft intact.
 let body=String(text||'').trimEnd();
 const endings=[...new Set(signatureProfiles(config).flatMap(profile=>[profile.signature,signatureText(profile.signatureHtml||'')]).filter(value=>value?.trim()).map(value=>value.trim()))].sort((a,b)=>b.length-a.length);
 for(const ending of endings)if(body===ending||body.endsWith('\n'+ending)){body=body.slice(0,-ending.length).trimEnd();break;}
 return {...htmlSignatureMessage(body,selected),selected};
}
