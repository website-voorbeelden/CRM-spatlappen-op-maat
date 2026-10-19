// Temporary capture statistics only: no audio, transcript, hardware IDs or names.
export function createSpeechDiagnostics({now=Date.now}={}){
 const sessions=new Map();
 const prune=()=>{for(const [key,value] of sessions)if(now()-value.updatedAt>300000)sessions.delete(key);};
 return {
  report(company,input){
   prune();if(!input||typeof input.session!=='string'||!/^[-a-zA-Z0-9_:]{1,100}$/.test(input.session))throw Error('Ongeldige microfoondiagnose.');
   const event={at:now()};
   const enums={kind:['start','waiting','signal','silent','muted','paused','error','cancel','stop'],phase:['idle','starting','recording','stopping','processing'],capture:['','worklet','legacy'],contextState:['none','running','suspended','interrupted','closed'],trackState:['none','live','ended']};
   for(const [key,values] of Object.entries(enums)){if(!values.includes(input[key]))throw Error('Ongeldige microfoondiagnose.');event[key]=input[key];}
   for(const [key,max] of Object.entries({frames:12000000,peak:10,sampleRate:192000})){if(!Number.isFinite(input[key])||input[key]<0||input[key]>max)throw Error('Ongeldige microfoondiagnose.');event[key]=input[key];}
   for(const key of ['muted','enabled','explicitDevice']){if(typeof input[key]!=='boolean')throw Error('Ongeldige microfoondiagnose.');event[key]=input[key];}
   const key=company+'/'+input.session;let value=sessions.get(key);
   if(!value){if(sessions.size>=10)sessions.delete(sessions.keys().next().value);value={company,session:input.session,events:[]};sessions.set(key,value);}
   value.updatedAt=now();value.events.push(event);value.events=value.events.slice(-20);return {received:true};
  },
  read(company){prune();return {sessions:[...sessions.values()].filter(value=>value.company===company).map(value=>structuredClone(value))};}
 };
}
