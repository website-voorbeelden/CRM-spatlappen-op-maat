import {supplierLogisticsMail} from '../../shared/supplier-logistics-mail.js?v=packs-worker-v3-20261102';
import {packsPlanningLines} from '../../shared/packs-preparation.js?v=packs-worker-v3-20261102';
import {supplierFulfilmentInfo,supplierMailTag,assertSupplierMail,supplierOwnOrderReference} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {supplierTrialRecipient} from '../../shared/supplier-trial-mail.js?v=supplier-batches35-20261101';

// Same order and original files, but a different, server-pinned mail purpose.
// Does not book, create labels, touch costs, or mark a supplier instruction sent.
export function createSupplierTrial(context){
 const esc=value=>context.esc(value??'');
 function current(id){
  const info=supplierFulfilmentInfo(context.state,context.order(id),context.company.id);
  if(!info.current||!info.label||!info.packing)throw Error('Leg eerst de actuele bestelling vast en voeg het echte PACKS-label en de pakbon toe. De proefmail maakt zelf geen zending of label.');
  return info;
 }
 const signature=info=>JSON.stringify([info.signature,info.label,info.packing]);
 async function open(id,{newTrial=false}={}){
  const info=current(id),expected=signature(info);
  if(!newTrial&&info.trialMail){if(['accepted','pending','uncertain'].includes(info.trialMail.status)){context.$('#dialog').close();location.hash='orders/'+id+'/mail';return;}await context.emailDraftForm(id,'','',info.trialMail.id);return;}
  const config=await context.emailRequest('status');
  if(!config.supplierTrialMail)throw Error('Deze mailservice moet eerst worden bijgewerkt voor de beveiligde proefmail. Er wordt niet teruggevallen op gewone leveranciersmail.');
  if(context.runtime.mode==='cloud'&&!context.runtime.localServices&&!config.supplierTrialStateGuard)throw Error('De online mailservice moet eerst worden bijgewerkt voor controle van de actuele order en originele bijlagen. Er wordt niets verstuurd.');
  if(!config.configured)throw Error('Stel eerst een geverifieerde afzender in bij Instellingen → Afzenders & handtekening.');
  if(signature(current(id))!==expected)throw Error('De bestelling of bijlagen zijn gewijzigd. Open de proefmail opnieuw.');
  const preparation=info.workflow.packsPreparation,packingFacts=preparation?'<details class="form-details"><summary>Pakketwaarden uit de voorbereiding controleren</summary>'+preparation.packages.map((parcel,index)=>'<p>Pakket '+(index+1)+': '+['lengthCm','widthCm','heightCm'].map(key=>parcel[key]===null?'onbekend':esc(parcel[key])).join(' × ')+' cm · '+(parcel.weightKg===null?'gewicht onbekend':esc(parcel.weightKg)+' kg incl. verpakking')+'</p>').join('')+'<p class="notes">'+esc(packsPlanningLines(preparation,info.label?.packsLabelBundle?.planning).join('\n'))+'</p><p class="form-help">Dit zijn voorbereidingswaarden. Vergelijk ze met het werkelijk geboekte label en de gegevens in het PACKS-portaal; dit scherm leest die gegevens niet terug uit de PDF.</p></details>':'<p class="form-help">Er zijn geen pakketmaten of gewicht in de CRM-voorbereiding bewaard. Controleer de werkelijk geboekte waarden in het PACKS-portaal.</p>';
  context.openForm('Proefmail met label en pakbon',`<p class="notice">Deze proefmail boekt geen zending. Hij bevat het bestaande echte label en de pakbon. Een al geboekte zending blijft echt; mailen naar jezelf annuleert die niet.</p><dl class="detail"><dt>Onze order</dt><dd>${esc(supplierOwnOrderReference(info.data))}</dd><dt>Kunststofbaas-bestelnummer</dt><dd>${esc(info.reference)}</dd><dt>Pakbon</dt><dd>${esc(info.packing.name)}</dd><dt>Label</dt><dd>${esc(info.label.name)}</dd><dt>Aflevering op de bestelling</dt><dd class="notes">${esc(info.data.recipient)}\n${esc(info.data.address)}\n${esc(info.data.country)}</dd></dl>${packingFacts}<p class="form-help">${config.supplierTrialStateGuard?'Bij verzending vergelijkt de mailserver deze combinatie opnieuw met de opgeslagen order en de twee originele PDF-bestanden.':'Deze lokale proef vergelijkt de order en bijlagen in jouw browser. De extra vergelijking met de online opslag is beschikbaar in de aparte online proef.'}</p>${context.field('testTo','Jouw controleadres voor deze proefmail',config.testTo||'info@bouwmarktxl.nl','email','required maxlength="254"')}<p class="form-help">Je kiest dit adres zelf. Het wordt ook het vaste adres voor CRM-testmails; afzender en gewone leveranciersontvanger veranderen niet. Controleer beide bijlagen in het volgende voorbeeld.</p>`,async fd=>{
   const testTo=supplierTrialRecipient(String(fd.get('testTo')||'').trim());
   if(testTo.toLowerCase()===info.workflow.recipientEmail.toLowerCase())throw context.formProblem('Kies voor deze proef je eigen controleadres, niet de leveranciersontvanger.',{field:'testTo'});
   if(signature(current(id))!==expected)throw Error('De bestelling of bijlagen zijn gewijzigd. Je adres blijft staan; open de actuele proefmail opnieuw.');
   await context.emailRequest('trial-recipient',{testTo,expectedTestTo:config.testTo,confirmed:true});
   if(signature(current(id))!==expected)throw Error('Het proefadres is bewaard, maar de bestelling of bijlagen zijn gewijzigd. Open de actuele proefmail opnieuw.');
   const seed={newMail:true,funnelPurpose:'',templateId:'',to:testTo,...supplierLogisticsMail(info,{trial:true}),documentId:info.packing.id,paymentLinkId:'',attachmentIds:[info.label.id],supplierFulfilmentMail:supplierMailTag(info,{trialRecipient:testTo})};
   assertSupplierMail(context.state,id,seed,context.company.id);
   await context.emailDraftForm(id,'','','',seed);return false;
  });
  context.$('#dialog [type=submit]').textContent='Proefbericht voorbereiden';
 }
 return {open};
}
