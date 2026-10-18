import {normalizeAssistantKeys,shortcutMatches,defaultAssistantKeys} from '../shared/keyboard-shortcuts.js';
// Browser speech services are optional. Microphone access starts only on a click.
export function createDictation({Recognition,onText,onState,onError,maxLength=12000,setTimer=setTimeout,clearTimer=clearTimeout}){
 let current=null,timer=null,lastText='',finalText='',base='';
 const clear=()=>{if(timer!==null)clearTimer(timer);timer=null;};
 function stop(abort=false){const r=current;if(!r)return;clear();if(abort){current=null;try{r.abort();}catch{}onState(false);return;}try{r.stop();}catch{current=null;onState(false);}}
 function start(draft=''){
  if(!Recognition){onError('Deze browser ondersteunt geen microfoondicteren. Gebruik dicteren op je computer, of open dit CRM in een browser met spraakherkenning.');return false;}
  if(current)return false;
  let r;try{r=new Recognition();}catch{onError('Spraakherkenning is hier niet beschikbaar. Je kunt blijven typen of systeemdicteren gebruiken.');return false;}
  current=r;base=draft.trimEnd();lastText=base;finalText=base;r.lang='nl-NL';r.continuous=false;r.interimResults=true;r.maxAlternatives=1;
  r.onstart=()=>{if(current===r)onState(true);};
  r.onresult=event=>{if(current!==r)return;const final=[],interim=[];for(const result of Array.from(event.results)){const text=result[0]?.transcript||'';(result.isFinal?final:interim).push(text);}
   const join=parts=>[base,...parts].filter(Boolean).join(' ');finalText=join(final);lastText=join([...final,...interim]);
   if(lastText.length>maxLength){lastText=lastText.slice(0,maxLength);finalText=finalText.slice(0,maxLength);onError('De tekst is maximaal '+new Intl.NumberFormat('nl-NL').format(maxLength)+' tekens. De opname is gestopt.');stop();}
   onText(lastText);
  };
  r.onerror=event=>{if(current!==r)return;clear();current=null;onState(false);onText(finalText);const messages={'not-allowed':'Microfoon of spraakherkenning is geblokkeerd. Geef toestemming in je browser en systeeminstellingen.','service-not-allowed':'De spraakdienst is niet beschikbaar in deze browser. Gebruik systeemdicteren of een andere browser.','audio-capture':'Geen werkende microfoon gevonden. Controleer je gekozen microfoon.','network':'De spraakdienst is niet bereikbaar. Controleer je verbinding of typ je vraag.','no-speech':'Geen spraak gehoord. Klik op de microfoon en probeer opnieuw.','language-not-supported':'Nederlandse spraakherkenning is niet beschikbaar. Gebruik systeemdicteren.'};if(event.error!=='aborted')onError(messages[event.error]||'Dicteren is gestopt. Je kunt de tekst controleren en blijven typen.');};
  r.onend=()=>{if(current!==r)return;clear();current=null;onState(false);onText(finalText);};
  try{r.start();onState(true);timer=setTimer(()=>stop(),60000);return true;}catch{current=null;onState(false);onError('Microfoon starten lukt niet. Controleer browsertoestemming of gebruik systeemdicteren.');return false;}
 }
 return {supported:!!Recognition,start,stop,get listening(){return !!current;}};
}
export function assistantShortcutAction(event,preferences){
 const keys=normalizeAssistantKeys(preferences);if(shortcutMatches(event,keys.open))return 'open';if(shortcutMatches(event,keys.talk))return 'talk';
 // Keep the established alternative only while using the default bindings.
 if(keys.open===defaultAssistantKeys.open&&keys.talk===defaultAssistantKeys.talk&&shortcutMatches(event,'mod+shift+k'))return 'open';return null;
}

export function isAssistantShortcut(event){return assistantShortcutAction(event)==='open';}
