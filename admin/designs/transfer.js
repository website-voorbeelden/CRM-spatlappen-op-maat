import {DESIGN_FORMAT,SELECTION_FORMAT,TRANSFER_LIMIT,portableDesign,selectionTransfer,serializeTransfer,parseTransfer} from '../../shared/design-transfer.js?v=feedback-followup-20261028';
export function installDesignTransfer({exportDocument,applyDocument,exportSelection,pasteSelection,cutSelection,sanitizeSVG,getName,busy,activity,notify}){
 const byId=id=>document.getElementById(id),dialog=byId('designTransferDialog'),field=byId('designTransferText'),status=byId('designTransferStatus');let working=false;
 const say=message=>status.textContent=message;
 function current(){return portableDesign({...exportDocument(),name:getName()},sanitizeSVG);}
 function refresh(){field.value=serializeTransfer(current());say('Dit is een kopie van het huidige ontwerp, inclusief ingesloten logo’s. Er is niets opgeslagen.');}
 function open(value){try{if(value!==undefined)field.value=value;else if(!field.value)refresh();if(!dialog.open)dialog.showModal();}catch(error){say(error.message);if(!dialog.open)dialog.showModal();}}
 byId('openDesignTransfer').onclick=()=>open();byId('previewActivityBackup').onclick=()=>open();byId('designTransferRefresh').onclick=()=>{try{refresh();}catch(error){say(error.message);}};
 byId('designTransferClose').onclick=()=>dialog.close();
 byId('designTransferCopy').onclick=async()=>{if(!field.value.trim()){say('Haal eerst het huidige ontwerp op of plak ontwerptekst.');return;}try{await navigator.clipboard.writeText(field.value);say('Ontwerptekst gekopieerd. Plak die in de andere tab.');}catch{field.focus();field.select();say('Tekst geselecteerd. Druk op ⌘C / Ctrl+C om te kopiëren.');}};
 byId('designTransferDownload').onclick=()=>{try{const value=serializeTransfer(current()),blob=new Blob([value],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='spatlap-ontwerpkopie.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);say('Download van de huidige ontwerpkopie gestart. Deze knop gebruikt de tekst niet als invoer.');}catch(error){say(error.message);}};
 byId('designTransferFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>TRANSFER_LIMIT)throw Error('Ontwerpbestand is groter dan 24 MB.');field.value=await file.text();say('Bestand geladen als tekst. Klik op Open als nieuwe kopie om het te gebruiken.');}catch(error){say(error.message);}finally{e.target.value='';}};
 byId('designTransferApply').onclick=async()=>{
  if(working)return;if(busy()){say('Bewaren of laden loopt nog. Kopiëren/downloaden kan wel; open de kopie daarna in een losse tab.');return;}
  working=true;const operation=activity('Ontwerpkopie openen…',['designTransferApply']);
  try{const value=parseTransfer(field.value,sanitizeSVG);if(value.format===SELECTION_FORMAT){pasteSelection(value.items);say('Onderdelen toegevoegd; nog niet opgeslagen.');}else{applyDocument(value);say('Geopend als nieuwe, losse kopie. Nog niet opgeslagen of aan een klant gekoppeld.');}operation.success('Ontwerpkopie geopend; nog niet opgeslagen.');dialog.close();}
  catch(error){operation.error(error);say(error.message);}finally{working=false;}
 };
 function editing(target){return target?.closest?.('input,textarea,select,[contenteditable="true"]')||document.querySelector('dialog[open]')||busy();}
 function writeSelection(event,cut){
  if(editing(event.target)||window.getSelection()?.toString())return;
  const items=exportSelection();if(!items.length)return;
  try{const value=serializeTransfer(selectionTransfer(items,sanitizeSVG));if(!event.clipboardData)throw Error('Klembord niet beschikbaar.');event.clipboardData.setData('text/plain',value);try{event.clipboardData.setData('application/x-spatlap-selection+json',value);}catch{}event.preventDefault();if(cut)cutSelection();notify(cut?'Onderdelen geknipt; plakken kan ook in een andere tab.':'Onderdelen gekopieerd; plakken kan ook in een andere tab.');}
  catch(error){event.preventDefault();notify(error.message+' Gebruik Ontwerp overzetten.');}
 }
 document.addEventListener('copy',e=>writeSelection(e,false));document.addEventListener('cut',e=>writeSelection(e,true));
 return {open,handlePaste(event){if(editing(event.target))return false;const source=event.clipboardData?.getData('application/x-spatlap-selection+json')||event.clipboardData?.getData('text/plain')||'';if(!source.trim().startsWith('{')||!source.includes('spatlap-preview-'))return false;event.preventDefault();try{const value=parseTransfer(source,sanitizeSVG);if(value.format===SELECTION_FORMAT)pasteSelection(value.items);else open(serializeTransfer(value));}catch(error){notify(error.message);}return true;}};
}
