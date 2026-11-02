import {supplierFulfilmentInfo,supplierOwnOrderReference} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {packsPreparationReview,packsPlanningLines} from '../../shared/packs-preparation.js?v=packs-worker-v3-20261102';
import {makePacksControlReport,comparePacksControlReports,validatePacksControlReport,packsControlMaxBytes} from '../../shared/packs-control-report.js?v=packs-worker-v3-20261102';
import {openMailAttachment} from '../mail/attachments.js';

// User-operated read-only review. No PACKS/mail endpoint or business write.
export function createPacksFinalReview(context,{back,prepare,trial}){
 const esc=value=>context.esc(value??'');
 const show=value=>value===null||value===''?'Niet ingevuld':value===true?'Ja':value===false?'Nee':String(value);
 const digest=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',value))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
 async function snapshot(id){
  const data=await new Promise((resolve,reject)=>{
   const tx=context.db.transaction(['state','files'],'readonly'),stateStore=tx.objectStore('state'),filesStore=tx.objectStore('files'),request=stateStore.get('main');let result;
   request.onsuccess=()=>{try{
    const state=request.result,order=state?.orders.find(order=>order.id===id),info={...supplierFulfilmentInfo(state,order,context.company.id),orderedOn:order.supplierOrderedDate||''};
    const label=state.documents.find(document=>document.id===info.workflow?.labelDocumentId&&document.ownerId===id),packing=info.packing;
    result={info,createdAt:new Date().toISOString(),files:[],blobs:{}};
    for(const [role,metadata,current] of [['label',label,!!info.label],['packing',packing,!!info.packing]]){
     const file={role,metadata,current};result.files.push(file);if(!metadata)continue;
     const request=typeof filesStore.peek==='function'?filesStore.peek(metadata.id,{maxBytes:role==='label'?4_000_000:2_000_000,budget:6_000_000}):filesStore.get(metadata.id);
     request.onsuccess=()=>{file.stored=request.result;};
    }
   }catch(error){tx.abort();reject(error);}};
   tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Controleoverzicht lezen afgebroken.'));
  });
  const files=[];
  for(const file of data.files){
   const {metadata,stored,role,current}=file,blob=stored?.blob,max=role==='label'?4_000_000:2_000_000;
   const output={role,documentId:metadata?.id||'',name:metadata?.name||'',size:metadata?.size??null,bytes:blob?.size??null,sha256:'',read:!metadata?'none':!blob?'unavailable':'invalid',current};
   if(metadata&&((metadata.size||0)>max||blob?.size>max))output.read='too-large';
   else if(blob){
    if(metadata.type==='application/pdf'&&(!blob.type||blob.type==='application/pdf')&&blob.size>=5&&blob.size===metadata.size&&new TextDecoder().decode(await blob.slice(0,5).arrayBuffer())==='%PDF-'){
     output.sha256=await digest(await blob.arrayBuffer());output.read='ok';data.blobs[role]=blob;
    }
   }
   files.push(output);
  }
  const runtime=context.runtime,environment={origin:location.origin,mode:['local','cloud'].includes(runtime.mode)?runtime.mode:'unknown',release:String(runtime.release||'Onbekend'),localServices:!!runtime.localServices,trialOnly:runtime.packsTrialOnly===true};
  const report=makePacksControlReport(data.info,{createdAt:data.createdAt,environment,files,basisHash:await digest(new TextEncoder().encode(data.info.basis))});
  const preparation=data.info.workflow?.packsPreparation,issues=preparation?packsPreparationReview(preparation,{basis:data.info.basis,reference:data.info.reference}).issues:[{field:'',message:'Er is nog geen pakketvoorbereiding bewaard.'}];
  return {report,info:data.info,issues,blobs:data.blobs};
 }
 const fileLabels={ok:'Bestand gelezen · inhoud niet visueel beoordeeld',none:'Ontbreekt of is niet actueel',unavailable:'Bestand kon niet worden gelezen',invalid:'Bestand of metadata klopt niet', 'too-large':'Bestand te groot voor deze mailbijlage'};
 const rows=(values)=>'<div class="table-wrap merge-table-wrap"><table><thead><tr><th>Gegeven</th><th>Dit overzicht</th><th>Ingelezen rapport</th></tr></thead><tbody>'+values.map(row=>'<tr><th scope="row">'+esc(row.label)+'</th><td class="notes">'+esc(show(row.left))+'</td><td class="notes">'+esc(show(row.right))+'</td></tr>').join('')+'</tbody></table></div>';
 async function open(id){
  const priorForm=context.$('#dialog form'),wasOpen=context.$('#dialog').open;
  const captured=await snapshot(id),{report,info,issues}=captured,preparation=info.workflow?.packsPreparation;
  if(context.$('#dialog form')!==priorForm||context.$('#dialog').open!==wasOpen)throw Error('Er is intussen een ander formulier geopend of gesloten. Rond dat eerst af; de eindcontrole heeft geen invoer vervangen.');
  const mailFilesReady=info.current&&report.files.every(file=>file.read==='ok'&&file.current);
  context.openForm('PACKS · jouw eindcontrole',`<p><strong>${esc(supplierOwnOrderReference(info.data))}</strong> · Kunststofbaas ${esc(info.reference)||'nog niet vastgelegd'}</p><p class="notice">Dit overzicht leest alleen jouw gegevens en bestanden. Werkelijk boeken doe je afzonderlijk via de PACKS-boekingscontrole. Het bevestigt geen uitgevoerde gebruikscontrole en verstuurt niets.</p><dl class="detail"><dt>Deze werkplek</dt><dd>${esc(report.environment.origin)} · ${report.environment.mode==='local'?'lokale opslag':report.environment.mode==='cloud'?'centrale opslag':'onbekende opslag'}${report.environment.trialOnly?' · aparte mailproefstand':''}</dd><dt>Versieaanduiding</dt><dd>${esc(report.environment.release)}</dd><dt>Momentopname</dt><dd>${esc(report.createdAt)}</dd></dl><section class="form-section"><h3>Jouw pakketwaarden</h3>${preparation?preparation.packages.map((parcel,index)=>'<p>Pakket '+(index+1)+': '+['lengthCm','widthCm','heightCm'].map(key=>esc(show(parcel[key]))).join(' × ')+' cm · '+esc(show(parcel.weightKg))+' kg inclusief verpakking.</p>').join(''):'<p>Nog geen voorbereiding bewaard.</p>'}<p class="notes">${esc(packsPlanningLines(preparation,info.label?.packsLabelBundle?.planning).join('\n'))}</p><p>Meegaan met de dagelijkse ronde; geen extra Pickup.</p><p class="form-help">Mijn advies: werkelijke verpakking meten en wegen, gereedheid bij Kunststofbaas controleren. Een morgenvoorstel is geen gereedmelding of bevestigde afhaling.</p>${issues.length?'<p>'+issues.length+' voorbereidingspunten vragen nog aanvulling of bevestiging.</p><details class="form-details"><summary>Ontbrekende punten bekijken</summary><ul>'+issues.map(issue=>'<li>'+esc(issue.message)+'</li>').join('')+'</ul></details>':'<p>De voorbereiding is ingevuld en aangevinkt. Jouw controle van de werkelijke verpakking, documenten en boeking blijft nodig.</p>'}</section><section class="form-section"><h3>De twee bijlagen</h3>${report.files.map(file=>'<p><strong>'+(file.role==='label'?'PACKS-label':'Pakbon')+'</strong> · '+esc(file.name||'nog niet beschikbaar')+'<br>'+esc(fileLabels[file.read])+(!file.current&&file.documentId?' · hoort bij eerdere bestelgegevens':'')+'</p>'+(captured.blobs[file.role]?'<button type="button" data-packs-view="'+file.role+'">'+(file.role==='label'?'Label':'Pakbon')+' bekijken</button>':'')).join('')}<p class="form-help">Bekijk ontvanger, adres, producten en Kunststofbaasnummer. Vergelijk het label ook met de echte PACKS-boeking. Bestandsherkenning en een gelijke vingerafdruk beoordelen geen barcode of PDF-pagina’s.</p></section><details class="form-details"><summary>Wat automatisch boeken nog blokkeert</summary><ul><li>Accountrechten, juiste dienst, tarieven, limieten, datums en herstelafspraken zijn nog niet volledig bevestigd.</li><li>De serverversie, accountomgeving en het boekingsregister moeten afzonderlijk zijn ingericht en vrijgegeven.</li><li>De nieuwe boekings-/labelherstelroute en volledige labelbundel zijn lokaal brongebouwd; je eigen praktijkcontrole staat open.</li><li>De aparte online proefomgeving is nog niet ingericht. Nieuwe bron is niet functioneel gecontroleerd; publicatie en eerste echte boeking zijn afzonderlijke stappen.</li></ul></details><details class="form-details"><summary>Meer · lokaal en online vergelijken</summary><p>Download bij dezelfde order in de andere omgeving een controlerapport en lees dat hier in. Deze bestanden bevatten klant-, adres- en pakketgegevens; bewaar ze privé. Het inlezen vergelijkt alleen en wijzigt niets in het CRM. Heeft het online CRM deze optie nog niet, dan moet die versie eerst apart worden bijgewerkt.</p><div class="actions"><button type="button" data-packs-report-download>Deze momentopname downloaden</button><button type="button" data-packs-report-refresh>Overzicht opnieuw laden</button><button type="button" data-packs-prepare>Pakketwaarden bekijken / aanpassen</button>${mailFilesReady?'<button type="button" data-packs-trial>Proefmail voorbereiden</button>':''}</div><label>Controlerapport uit de andere omgeving (JSON)<input type="file" name="compareReport" accept="application/json,.json"></label><div data-packs-report-comparison role="region" aria-label="Vergelijking van controlerapporten"></div><p class="form-help">Een vergelijking toont alleen de opgenomen waarden en de gelezen bestandsinhoud. De versieaanduiding is geen volledige codehash. Gelijke waarden bewijzen geen werkende koppelingen, gelijke instellingen of geslaagde controle. Opnieuw laden haalt een nieuwe momentopname op.</p></details><details class="form-details"><summary>Alle opgenomen waarden bekijken</summary><dl class="detail">${report.facts.map(fact=>'<dt>'+esc(fact.label)+'</dt><dd class="notes">'+esc(show(fact.value))+'</dd>').join('')}</dl></details>`,()=>false,{trackChanges:false});
  const form=context.$('#dialog form');form.querySelector('[type=submit]').textContent='Terug naar bestelling';
  let busy=false,selection=0;
  async function run(work){if(busy||form.inert)return;busy=true;form.inert=true;form.setAttribute('aria-busy','true');try{await work();}catch(error){form.inert=false;context.showFormProblem(form,error,{toast:context.toast});}finally{busy=false;form.inert=false;form.removeAttribute('aria-busy');}}
  async function navigate(work){
   let stale=true;try{stale=supplierFulfilmentInfo(context.state,context.order(id),context.company.id).signature!==info.signature;}catch{}
   if(!stale)return work();
   const dialog=context.$('#dialog');dialog.close();
   try{
    const refreshed=await context.refreshExternalState({throwOnError:true});
    if(!refreshed?.updated)throw Error(refreshed?.reason||'De actuele CRM-gegevens konden niet worden opgehaald.');
    if(dialog.open||context.$('#dialog form')!==form)throw Error('Rond eerst het inmiddels geopende formulier af.');
    return await work();
   }catch(error){if(!dialog.open&&context.$('#dialog form')===form)dialog.showModal();throw error;}
  }
  form.onsubmit=event=>{event.preventDefault();void run(()=>navigate(()=>back(id)));};
  form.querySelector('[data-packs-prepare]').onclick=()=>run(()=>navigate(()=>prepare(id)));
  form.querySelector('[data-packs-report-refresh]').onclick=()=>run(()=>open(id));
  form.querySelector('[data-packs-trial]')?.addEventListener('click',()=>run(()=>navigate(()=>trial(id))));
  for(const button of form.querySelectorAll('[data-packs-view]'))button.onclick=()=>{const role=button.dataset.packsView,file=report.files.find(file=>file.role===role);openMailAttachment(captured.blobs[role],file.name);};
  form.querySelector('[data-packs-report-download]').onclick=()=>run(async()=>{const json=JSON.stringify(report,null,2);if(new TextEncoder().encode(json).length>packsControlMaxBytes)throw Error('Het controlerapport is te groot. Er is niets gedownload.');const saved=await context.downloadBlob(new Blob([json],{type:'application/json'}),'PACKS-controle-'+report.orderId+'-'+report.environment.mode+'-'+report.createdAt.replace(/[^0-9]/g,'').slice(0,14)+'.json');if(saved!==true)throw Error('Het controlerapport kon niet worden klaargezet voor downloaden. Je overzicht en bestandskeuze blijven staan.');});
  form.elements.namedItem('compareReport').onchange=async event=>{
   const file=event.target.files?.[0],sequence=++selection,area=form.querySelector('[data-packs-report-comparison]');if(!file){area.replaceChildren();return;}
   form.querySelector('#form-error')?.replaceChildren();
   area.textContent='Controlerapport vergelijken…';
   try{
    if(file.size>packsControlMaxBytes)throw Error('Kies een controlerapport van maximaal 128 kB. Er wordt niets overgenomen.');
    const raw=await file.text();if(sequence!==selection||!form.isConnected)return;
    let other;try{other=JSON.parse(raw);}catch{throw Error('Het gekozen bestand bevat geen geldig JSON-controlerapport.');}
    validatePacksControlReport(other);const compared=comparePacksControlReports(report,other);
    area.innerHTML='<p><strong>'+compared.differences.length+' verschillen in de opgenomen waarden en bestanden.</strong></p><p>Ingelezen momentopname: '+esc(other.createdAt)+' · '+esc(other.environment.origin)+'. Dit is een aangeleverd rapport, geen live opvraag.</p>'+(!compared.filesComplete?'<p class="notice">Niet alle actuele PDF-bestanden konden in beide rapporten worden gelezen. Gelijke vermeldingen betekenen dan geen gelijke bijlagen.</p>':'')+(compared.differences.length?rows(compared.differences):'<p>Geen verschillen gevonden binnen deze rapportvelden. Dit is geen geslaagde gebruikscontrole of vrijgave.</p>')+'<details class="form-details"><summary>Omgeving en versie vergelijken ('+compared.metadata.length+')</summary>'+(compared.metadata.length?rows(compared.metadata):'<p>De opgenomen omgeving-/versieaanduidingen zijn gelijk; de volledige bron en configuratie zijn hiermee niet vergeleken.</p>')+'</details>';
   }catch(error){if(sequence!==selection||!form.isConnected)return;area.textContent=error.message;context.showFormProblem(form,context.formProblem(error.message,{field:'compareReport'}),{toast:context.toast});}
  };
 }
 return {open};
}
