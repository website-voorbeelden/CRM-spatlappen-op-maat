import {supplierLinkMarkup,fetchSupplierPdf,openSupplierLink} from '../documents/supplier-link.js?v=invoice-link-review-20261101';
import {readInvoicePdf} from '../documents/pdf-text.js?v=supplier-batches35-20261101';
import {openMailAttachment} from '../mail/attachments.js';
import {supplierFulfilmentData,supplierFulfilmentSignature,supplierPackingReferenceEnabled} from '../../shared/supplier-fulfilment.js?v=packs-worker-v3-20261102';
import {supplierDocumentTextHints} from '../../shared/supplier-order-review.js?v=packs-worker-v3-20261102';
import {validateBusinessState} from '../../shared/state-validation.js?v=packs-workflow-20261102';

const kinds={packing:'Pakbon',invoice:'Factuur',confirmation:'Orderbevestiging'};
export function createSupplierProof(context){
 const esc=v=>context.esc(v);
 function open(id,documentId=''){
  const order=context.order(id);
  if(!order||!supplierPackingReferenceEnabled(context.state,order,context.company.id))throw Error('Deze documentcontrole is alleen voor een Kunststofbaas-order bij Maatwerkkunststof.');
  const doc=documentId?context.state.documents.find(d=>d.id===documentId&&d.ownerId===id&&!d.generated&&!d.shippingLabel):null;
  if(documentId&&!doc)throw Error('Dit leveranciersdocument is niet meer beschikbaar.');
  const expected=supplierFulfilmentSignature(context.state,order),documentBasis=doc?JSON.stringify(doc):'',data=supplierFulfilmentData(context.state,order),reference=order.supplierOrderReference||'',uploadIds=new WeakMap();let form,linkedProof=null,loadedLink='';
  context.openForm('Kunststofbaas-document naast je order',`
   <p>Vergelijk het origineel met je order. Deze controle boekt geen kosten of betaling, bevestigt geen bestelling en verandert geen bestelnummer.</p>
   <section class="form-section"><h3>1. Document van Kunststofbaas</h3>${doc?'<p><strong>'+esc(doc.name)+'</strong></p>':'<label>Soort document<select name="proofKind" required><option value="">Kies het documenttype</option><option value="packing">Pakbon</option><option value="invoice">Factuur · alleen als controledocument bewaren</option><option value="confirmation">Orderbevestiging</option></select></label>'+supplierLinkMarkup({prefix:'proof'})+'<label>Of kies de gedownloade PDF<input type="file" name="proofPdf" accept="application/pdf,.pdf"></label>'}
   <div class="actions"><button type="button" data-proof-view>Origineel bekijken</button><button type="button" data-proof-read>PDF-tekst lezen & vergelijken</button></div><p class="form-help">Maximaal 15 MB / 30 pagina’s. Tekstlezen gebeurt op jouw klik in de browser; de PDF-lezer wordt dan geladen. Geen automatische upload naar AI en geen OCR voor beeldscans.</p><p role="status" class="notice" data-proof-status>Controleer in elk geval hun bestelnummer, artikelen, aantallen, maten en afleveradres.</p></section>
   <div class="order-grid"><section class="form-section"><h3>Onze huidige order</h3><dl class="detail"><dt>Bestelnummer Kunststofbaas</dt><dd>${esc(reference||'Nog invullen bij de order')}</dd><dt>Ons ordernummer</dt><dd>${esc(data.number)}</dd><dt>Afleveradres</dt><dd class="notes">${esc([data.recipient,data.address,data.country].filter(Boolean).join('\n'))||'Nog invullen'}</dd></dl>${data.items.map(i=>'<p><strong>'+esc(i.quantity)+' × '+esc(i.description)+'</strong><br>'+esc(i.width&&i.height?i.width+' × '+i.height+' mm':'Maat ontbreekt')+' · '+esc(i.material||'Materiaal ontbreekt')+' · '+esc(i.thickness?i.thickness+' mm dik':'Dikte ontbreekt')+'</p>').join('')}</section>
   <section class="form-section"><h3>Tekst uit het leveranciersdocument</h3><label>PDF-tekst of zelf gekopieerde tekst<textarea name="proofText" rows="12" maxlength="200000"></textarea></label><button type="button" data-proof-compare>Tekst opnieuw vergelijken</button><div data-proof-hints></div></section></div>
   <p class="form-help">Tekstherkenning geeft aanwijzingen. Een genoemd nummer of gevonden maat bewijst niet dat de juiste productregel, het aantal, bewerkingen en adres kloppen. Controleer dat zelf in het origineel. Factuurkosten verwerken blijft een afzonderlijke actie bij Factuur inlezen & kosten koppelen.</p>
   ${doc?'':'<label class="check-row"><input type="checkbox" name="proofConfirmed" required>Dit is het originele leveranciersdocument voor deze klantorder. Ik bewaar het als controledocument; ik bevestig hiermee geen volledige overeenkomst of financiële verwerking.</label>'}`,async fd=>{
    if(doc)return;
    if(order.archived||order.mergedIntoOrderId)throw Error('Heropen deze order voordat je een nieuw document toevoegt.');
    if(!fd.has('proofConfirmed'))throw context.formProblem('Controleer of dit document bij deze order hoort.',{field:'proofConfirmed'});
    const file=await blob(),kind=String(fd.get('proofKind')||'');if(!kinds[kind])throw Error('Kies het soort leveranciersdocument.');
    const bytes=await file.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
    let fileId=uploadIds.get(file);if(!fileId){fileId=context.uid();uploadIds.set(file,fileId);}let next;
    context.beginLocalStateChange();
    await new Promise((resolve,reject)=>{
     const tx=context.db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),read=ss.get('main');
     read.onsuccess=()=>{try{
      next=read.result;const current=next?.orders.find(o=>o.id===id);
      if(!current||current.archived||current.mergedIntoOrderId||!supplierPackingReferenceEnabled(next,current,context.company.id)||supplierFulfilmentSignature(next,current)!==expected)throw Error('De order, het nummer of afleveradres is intussen gewijzigd. Je bestand blijft in het formulier staan; open de actuele controle opnieuw.');
      const duplicate=next.documents.find(d=>d.ownerId===id&&d.supplierControlDocument?.sha256===hash);
      if(duplicate&&duplicate.supplierControlDocument.kind!==kind)throw Error('Deze PDF is al als '+kinds[duplicate.supplierControlDocument.kind]+' bewaard. Open het bestaande controledocument; gebruik voor factuurkosten de afzonderlijke factuurinvoer.');
      if(!duplicate){next.documents.push({id:fileId,ownerId:id,category:'other',name:file.name,type:'application/pdf',size:file.size,date:context.today(),createdAt:new Date().toISOString(),supplierControlDocument:{supplierKey:'kunststofbaas',kind,reference,sha256:hash}});tx.objectStore('files').put({id:fileId,blob:new Blob([bytes],{type:'application/pdf'})});next.activities.unshift({id:context.uid(),message:'Kunststofbaas-controledocument bij order bewaard',time:new Date().toISOString()});}
      validateBusinessState(next);ss.put(next,'main');
     }catch(error){tx.abort();reject(error);}};
     tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Document bewaren afgebroken.'));
    });
    context.state=next;try{context.notifyDataChanged();}catch{context.toast('Document bewaard; andere schermen konden niet worden bijgewerkt.');}context.toast('Controledocument bewaard · geen kosten, betaling of verzending geregistreerd');
   },{afterSave:()=>{if(!doc)context.render();}});
  form=context.$('#dialog form');form.querySelector('[type=submit]').textContent=doc?'Sluiten':'Controledocument bewaren';
  const current=()=>form.isConnected&&context.$('#dialog').open;
  async function blob(){
   let file;
   if(doc){if(JSON.stringify(context.state.documents.find(d=>d.id===doc.id))!==documentBasis)throw Error('Het bronbestand is intussen gewijzigd. Open de actuele documentcontrole opnieuw.');file=(await context.store('files','readonly',s=>s.get(doc.id)))?.blob;}
   else {file=form.elements.proofPdf.files[0];if(!file&&linkedProof){if(form.elements.proofLink.value.trim()!==loadedLink)throw Error('De link is gewijzigd. Haal de nieuwe PDF op of kies het bestand zelf.');if(form.elements.proofKind.value!==linkedProof.documentKind)throw Error('De gekozen documentsoort wijkt af van de opgehaalde link. Controleer en kies de juiste soort.');file=linkedProof.file;}}
   if(!file?.size||file.size>15*1024*1024||!doc&&(!/\.pdf$/i.test(file.name)||file.name.length>240))throw Error('Kies één volledige PDF van maximaal 15 MB, met een bestandsnaam van maximaal 240 tekens.');
   if(doc&&file.size!==doc.size)throw Error('De opgeslagen bestandsgrootte wijkt af. Gebruik het juiste originele bestand.');
   if(doc?.supplierControlDocument){const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('');if(digest!==doc.supplierControlDocument.sha256)throw Error('De opgeslagen PDF komt niet overeen met de bewaarde bestandsvingerafdruk. Gebruik het juiste origineel.');}
   if(new TextDecoder().decode(await file.slice(0,5).arrayBuffer())!=='%PDF-')throw Error('Dit bestand heeft geen PDF-header.');return file;
  }
  function compare(){
   if(!context.order(id)||supplierFulfilmentSignature(context.state,context.order(id))!==expected)throw Error('De order is intussen gewijzigd. Vergelijk opnieuw vanuit de actuele order.');
   const text=form.elements.proofText.value,hints=supplierDocumentTextHints(text,data,reference),labels={missing:'Eerst het Kunststofbaas-bestelnummer bij de order invullen.',mentioned:'Het opgeslagen bestelnummer is genoemd. Controleer het origineel en de regelkoppeling.',multiple:'Het opgeslagen nummer én andere nummers zijn genoemd. Controleer welke bestelling dit document betreft.',different:'Ander(e) gelabeld(e) bestel-/ordernummer(s) gevonden; controleer het verschil.',unreadable:'Geen duidelijk gelabeld bestelnummer gelezen; handmatig controleren.'};
   form.querySelector('[data-proof-hints]').innerHTML='<p class="notice">'+esc(labels[hints.referenceStatus])+'</p><p>Gelezen nummer(s): '+esc(hints.references.join(', ')||'Geen')+'</p><p>Onze volledige orderreferentie '+(hints.ownNumberMentioned?'is als tekst genoemd; juiste betekenis controleren.':'is niet letterlijk gelezen; dit kan een ontbrekende vermelding of andere opmaak zijn.')+'</p>'+data.items.map((item,n)=>'<p>'+esc(item.description)+': '+(hints.dimensions[n].mentioned?'dezelfde mm-maat komt in de tekst voor; productkoppeling en aantal zelf vergelijken.':'maat niet als duidelijke mm-vermelding gelezen; zelf vergelijken.')+'</p>').join('');
  }
  form.addEventListener('input',event=>{if(event.target.name==='proofText')form.querySelector('[data-proof-hints]').textContent='Tekst gewijzigd · vergelijk opnieuw.';if(event.target.name!=='proofConfirmed'&&form.elements.proofConfirmed)form.elements.proofConfirmed.checked=false;});
  form.addEventListener('change',event=>{if(event.target.name==='proofPdf'){if(form.elements.proofPdf.files.length)linkedProof=null;form.elements.proofText.value='';form.querySelector('[data-proof-hints]').textContent='';}if(event.target.name!=='proofConfirmed'&&form.elements.proofConfirmed)form.elements.proofConfirmed.checked=false;});
  form.addEventListener('click',async event=>{
   const b=event.target.closest('[data-proof-read],[data-proof-view],[data-proof-compare],[data-supplier-link-fetch],[data-supplier-link-open]');if(!b||form.inert)return;
   form.inert=true;form.setAttribute('aria-busy','true');const status=form.querySelector('[data-proof-status]');status.textContent='Document openen…';
   try{if(b.hasAttribute('data-supplier-link-open')){openSupplierLink(form.elements.proofLink.value);status.textContent='Download het document bij Kunststofbaas en kies het PDF-bestand hier.';return;}if(b.hasAttribute('data-supplier-link-fetch')){if(form.elements.proofPdf.files.length)throw Error('Er is al een PDF-bestand gekozen. Kies bewust één bron; je huidige bestand is behouden.');linkedProof=await fetchSupplierPdf(form.elements.proofLink.value,{runtime:context.runtime,signal:AbortSignal.timeout(35000)});if(!current())return;form.elements.proofLink.value='';loadedLink='';if(!form.elements.proofKind.value)form.elements.proofKind.value=linkedProof.documentKind;if(form.elements.proofKind.value!==linkedProof.documentKind)throw Error('De link hoort bij een andere documentsoort. Controleer de soort; de ontvangen PDF is behouden.');if(form.elements.proofConfirmed)form.elements.proofConfirmed.checked=false;form.elements.proofText.value='';form.querySelector('[data-proof-hints]').replaceChildren();status.textContent='PDF ontvangen. Lees en vergelijk het origineel; er zijn geen kosten of bestelstatussen gewijzigd.';return;}if(b.hasAttribute('data-proof-compare'))compare();else{const file=await blob();if(b.hasAttribute('data-proof-view'))openMailAttachment(file,doc?.name||file.name);else{const text=await readInvoicePdf(file);if(!current())return;form.elements.proofText.value=text;form.elements.proofText.dispatchEvent(new Event('input',{bubbles:true}));compare();}}if(current())status.textContent='Vergelijking is een aanwijzing; controleer aantallen, bewerkingen en adres zelf in het origineel.';}
   catch(error){if(current())status.textContent=error.message;}
   finally{form.inert=false;form.removeAttribute('aria-busy');}
  });
 }
 function markup(order){
  const docs=context.state.documents.filter(d=>d.ownerId===order.id&&d.supplierControlDocument);
  return `<section class="order-surface"><div class="section-heading"><div><h2>Document van Kunststofbaas controleren</h2><p>Pakbon, bevestiging of factuur naast jouw order.</p></div><div class="actions"><button type="button" data-supplier-proof="${esc(order.id)}">Controledocument toevoegen</button></div></div>${docs.map(d=>'<div class="document-file"><div class="document-file-info"><strong>'+esc(kinds[d.supplierControlDocument.kind])+' · '+esc(d.name)+'</strong><small>Bij bewaren: Kunststofbaas '+esc(d.supplierControlDocument.reference||'nummer onbekend')+(d.supplierControlDocument.reference!==(order.supplierOrderReference||'')?' · ander bestelnummer dan nu':'')+' · controledocument, geen goedkeuring</small></div><button type="button" data-supplier-proof="'+esc(order.id)+'" data-supplier-proof-document="'+esc(d.id)+'">Bekijken / vergelijken</button></div>').join('')||'<p class="form-help">Nog geen afzonderlijk controledocument. Facturen die al als kostenbron zijn verwerkt staan bij Inkoop & marge.</p>'}</section>`;
 }
 document.addEventListener('click',event=>{const b=event.target.closest('[data-supplier-proof]');if(!b)return;try{if(document.querySelector('dialog[open]'))throw Error('Rond eerst je geopende formulier af.');open(b.dataset.supplierProof,b.dataset.supplierProofDocument||'');}catch(error){context.toast(error.message);}});
 return {open,markup};
}
