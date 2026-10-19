import {batchPackingReview,batchPackingBasis,batchPackingPayload} from '../../shared/batch-packing-review.js';
import {addressParts,nextDocumentNumber,renderConfirmation} from '../documents/generation.js';
import {mergePackingPdfs} from '../documents/merge-pdfs.js';
import {loading} from '../loading.js';
const methodLabel=method=>({pickup:'Afhalen',shipping:'Verzenden',delivery:'Bezorgen'}[method]||'Leverwijze onbekend');
const orderLabel=row=>'#'+(row.order.sourceNumber||row.order.number)+' · '+(row.customer?.company||'Klant onbekend');
const issues=(row,esc)=>[...row.blocked,...row.warnings].map(message=>`<li>${esc(message)}</li>`).join('');

export function batchPackingMarkup(state,p,{esc}){
 const review=batchPackingReview(state,p.id),active=review.applicable,warnings=active.filter(r=>r.warnings.length||r.blocked.length).length;
 return `<section class="order-surface"><div class="section-heading"><div><h2>Pakbonnen voor deze bestelling</h2><p>${active.length} klantorder${active.length===1?'':'s'} · ${warnings?warnings+' eerst controleren':'geen waarschuwingen'}</p></div><button type="button" class="primary" data-batch-packing-review="${esc(p.id)}" ${active.length?'':'disabled'}>Alle pakbonnen downloaden…</button></div><p class="form-help">Eerst controleren en kiezen, daarna één PDF voor afdrukken. Bestaande pakbonnen blijven behouden. Nieuwe pakbonnen worden bij de klantorders bewaard; downloaden registreert geen levering.</p>${review.rows.map(row=>`<article class="batch-packing-row"><div class="section-heading"><div><a href="#orders/${esc(row.order.id)}"><strong>${esc(orderLabel(row))}</strong></a><p>${esc(row.excluded||methodLabel(row.order.fulfilmentMethod))} · ${row.documents.length?row.documents.length+' bewaarde pakbon'+(row.documents.length===1?'':'nen'):'Nieuwe pakbon nodig'}</p></div><div class="actions"><a href="#orders/${esc(row.order.id)}/delivery">Levergegevens</a><a href="#orders/${esc(row.order.id)}/documents">Documenten</a>${!row.excluded?`<button type="button" data-batch-packing="${esc(row.order.id)}" data-purchase="${esc(p.id)}">Afzonderlijk controleren</button>`:''}</div></div>${!row.excluded&&issues(row,esc)?`<ul class="batch-packing-warnings">${issues(row,esc)}</ul>`:''}</article>`).join('')||'<p>Geen gekoppelde orders.</p>'}</section>`;
}

export function installBatchPacking(context){
 let opening=false;
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-batch-packing-review],[data-batch-packing]');if(!button||context.company.id!=='spatlappen')return;
  if(opening)return;opening=true;
  try{
   if(context.runtime.offlineReview)throw Error('Open de gewone CRM-omgeving om pakbonnen te bewaren en te downloaden.');
   const state=await loading.run('Pakbongegevens ophalen…',()=>context.store('state','readonly',s=>s.get('main')),{button});
   if(button.dataset.batchPackingReview)openReview(state,button.dataset.batchPackingReview);
   else{
    const row=batchPackingReview(state,button.dataset.purchase).rows.find(r=>r.order.id===button.dataset.batchPacking);
    if(!row||row.excluded)throw Error('Deze order hoort niet meer bij de te leveren orders. Open de bestelling opnieuw.');
    // The individual form also needs the freshly read source, not stale UI state.
    context.state=state;
    if(row.documents.length)location.hash='orders/'+row.order.id+'/documents';else context.packingSlipForm(row.order.id);
   }
  }catch(error){context.toast(error.message);}finally{opening=false;}
 });

 function openReview(snapshot,purchaseId){
  const review=batchPackingReview(snapshot,purchaseId),basis=batchPackingBasis(snapshot,purchaseId),esc=context.esc;
  let result;
  const rows=review.applicable;
  context.openForm('Pakbonnen controleren',`<p><strong>${esc(review.purchase.name)}</strong> · Kies welke orders en bestaande pakbonnen je wilt meenemen.</p><p class="notice">Nieuwe pakbonnen bevatten alle leveranciersproducten van de gekozen order, met het volledige bestelde aantal. Voor een deellevering maak je eerst afzonderlijk een pakbon. Bestaande PDF’s worden exact hergebruikt, ook als het dossier later is gewijzigd.</p><div data-packing-selection>${rows.map(row=>`<section class="batch-packing-row"><label class="check-row"><input type="checkbox" name="orders" value="${esc(row.order.id)}" ${row.blocked.length?'disabled':'checked'}><strong>${esc(orderLabel(row))}</strong></label><p class="form-help">${esc(methodLabel(row.order.fulfilmentMethod))} · ${esc(row.address.recipient||'Ontvanger onbekend')}${row.address.address?' · '+esc(row.address.address):''}</p><ul>${row.items.map(i=>`<li>${esc(i.quantity)} × ${esc(i.description)}${i.width&&i.height?' · '+esc(context.itemDimensions(i)):''}</li>`).join('')}</ul>${issues(row,esc)?`<ul class="batch-packing-warnings">${issues(row,esc)}</ul>`:'<p class="form-help">Geen ontbrekende gegevens gevonden.</p>'}${row.documents.map(d=>`<label class="check-row"><input type="checkbox" name="documents" data-order="${esc(row.order.id)}" value="${esc(d.id)}" checked> ${esc(d.name)}</label>`).join('')}${!row.documents.length&&!row.blocked.length?'<p class="form-help">Nieuwe PDF + Word opslaan bij deze order.</p>':''}<div class="actions"><a href="#orders/${esc(row.order.id)}/delivery" data-packing-leave>Levergegevens aanvullen</a><a href="#orders/${esc(row.order.id)}/documents" data-packing-leave>Pakbon bekijken / aanpassen</a></div></section>`).join('')}</div><p data-packing-count role="status"></p><label class="check-row" data-packing-full><input type="checkbox" name="fullDelivery"> De leveranciersproducten op de nieuwe pakbonnen worden volledig meegeleverd.</label><label class="check-row notice" data-packing-override><input type="checkbox" name="reviewedWarnings"> Ik heb de waarschuwingen van de geselecteerde orders gecontroleerd en wil deze pakbonnen toch downloaden. Ontbrekende adresvelden op nieuwe pakbonnen blijven herkenbaar als NIET INGEVULD.</label><p class="form-help">Controleer adres, artikelen en aantallen vóór verzending. Prijzen staan niet op de pakbonnen. Er wordt niets verstuurd en de orderstatus blijft gelijk.</p><p data-packing-progress role="status" aria-live="polite"></p>`,async fd=>{
   const selected=selection(fd),warnings=selected.some(r=>r.warnings.length),newCount=selected.filter(r=>!r.documents.length).length;
   if(warnings&&!fd.has('reviewedWarnings'))throw Error('Controleer de waarschuwingen en bevestig bewust dat je toch wilt doorgaan.');
   if(newCount&&!fd.has('fullDelivery'))throw Error('Bevestig de volledige levering of maak voor een deellevering eerst een afzonderlijke pakbon.');
   form.inert=true;try{
   const progress=form.querySelector('[data-packing-progress]'),report=message=>{progress.textContent=message;};
   const latest=await context.store('state','readonly',s=>s.get('main'));assertCurrent(latest);
   const draft=structuredClone(latest),day=context.today(),prepared=[],files=[];
   for(const row of selected){
    if(row.documents.length){
     for(const d of row.documents){report('Bewaarde pakbon ophalen · '+d.name);const file=await context.store('files','readonly',s=>s.get(d.id));if(!(file?.blob instanceof Blob))throw Error('Bewaarde pakbon ontbreekt: '+d.name);files.push({name:d.name,blob:file.blob});}
    }else{
     const allocation=nextDocumentNumber(draft,day,'packing'),payload=batchPackingPayload(row,allocation.number,day,{splitAddress:addressParts,dimensions:context.itemDimensions});
     draft.documentSequences??={};draft.documentSequences[allocation.key]=allocation.sequence;
     report('Pakbon maken · '+orderLabel(row));const generated=await renderConfirmation(payload);
     const generationId=context.uid(),documents=['pdf','docx'].map(format=>{const blob=generated[format];return {id:context.uid(),ownerId:row.order.id,name:'Pakbon_'+allocation.number+'.'+format,category:'packing',size:blob.size,type:blob.type,date:day,createdAt:new Date().toISOString(),generated:{kind:'packing',number:allocation.number,generationId,payload:structuredClone(payload)},blob};});
     prepared.push({allocation,documents,orderId:row.order.id});files.push({name:documents[0].name,blob:generated.pdf});
    }
   }
   const pdf=await mergePackingPdfs(files,report);
   report(prepared.length?'Pakbonnen samen bewaren…':'Laatste controle…');
   if(prepared.length)await savePrepared(prepared,purchaseId,basis);else assertCurrent(await context.store('state','readonly',s=>s.get('main')));
   result={pdf,name:'Pakbonnen_'+String(review.purchase.name||'bestelling').replace(/[^\p{L}\p{N}_-]+/gu,'_').slice(0,80)+'_'+day+'.pdf',count:files.length,created:prepared.length};
   }finally{form.inert=false;}
  },{trackChanges:false,afterSave:()=>{context.render();showDownload(result);}});
  const form=document.querySelector('#dialog form'),submit=form.querySelector('[type=submit]');form.dataset.busyLabel='Pakbonnen voorbereiden…';submit.textContent='Pakbonnen downloaden';
  function assertCurrent(state){if(!state||batchPackingBasis(state,purchaseId)!==basis)throw Error('De bestelling, klantgegevens of pakbonnen zijn ondertussen gewijzigd. Sluit dit venster en controleer de actuele lijst opnieuw.');}
  function selection(fd){
   const ids=new Set(fd.getAll('orders')),docIds=new Set(fd.getAll('documents'));
   const selected=rows.filter(r=>ids.has(r.order.id)).map(r=>({...r,documents:r.documents.filter(d=>docIds.has(d.id))}));
   if(!selected.length)throw Error('Kies minstens één order.');
   if(selected.length>50)throw Error('Kies maximaal 50 orders per download.');
   if(selected.reduce((n,r)=>n+Math.max(1,r.documents.length),0)>100)throw Error('Kies maximaal 100 pakbonbestanden per download.');
   for(const row of selected){if(row.blocked.length)throw Error('Vul eerst de productgegevens van '+orderLabel(row)+' in.');if(rows.find(r=>r.order.id===row.order.id).documents.length&&!row.documents.length)throw Error('Kies minstens één bestaande pakbon voor '+orderLabel(row)+', of vink de order uit.');}
   return selected;
  }
  function update(){
   const fd=new FormData(form),ids=new Set(fd.getAll('orders'));
   for(const input of form.querySelectorAll('[name=documents]'))input.disabled=!ids.has(input.dataset.order);
   let selected=[];try{selected=selection(new FormData(form));submit.disabled=false;}catch(error){submit.disabled=true;form.querySelector('[data-packing-count]').textContent=error.message;}
   if(selected.length)form.querySelector('[data-packing-count]').textContent=selected.length+' orders · '+selected.filter(r=>r.warnings.length).length+' met waarschuwingen · '+selected.filter(r=>!r.documents.length).length+' nieuwe pakbonnen';
   const warn=selected.some(r=>r.warnings.length),create=selected.some(r=>!r.documents.length);
   form.querySelector('[data-packing-override]').hidden=!warn;form.elements.reviewedWarnings.required=warn;
   form.querySelector('[data-packing-full]').hidden=!create;form.elements.fullDelivery.required=create;
  }
  form.querySelector('[data-packing-selection]').addEventListener('change',()=>{form.elements.reviewedWarnings.checked=false;form.elements.fullDelivery.checked=false;update();});
  for(const link of form.querySelectorAll('[data-packing-leave]'))link.onclick=()=>document.querySelector('#dialog').close();
  update();
 }
 async function savePrepared(prepared,purchaseId,basis){
  context.beginLocalStateChange();let next;
  await new Promise((resolve,reject)=>{
   const tx=context.db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),request=ss.get('main');
   request.onsuccess=()=>{try{
    next=request.result;if(!next||batchPackingBasis(next,purchaseId)!==basis)throw Error('Gegevens of pakbonnummers zijn ondertussen gewijzigd. Controleer opnieuw; er is niets opgeslagen.');
    next.documentSequences??={};
    for(const entry of prepared){
     next.documentSequences[entry.allocation.key]=entry.allocation.sequence;
     for(const {blob,...metadata} of entry.documents){next.documents.push(metadata);tx.objectStore('files').put({id:metadata.id,blob});}
     const order=next.orders.find(o=>o.id===entry.orderId);next.activities.unshift({id:context.uid(),message:'Pakbon '+entry.allocation.number+' opgeslagen via bestelling voor order #'+(order.sourceNumber||order.number),time:new Date().toISOString()});
    }
    ss.put(next,'main');
   }catch(error){tx.abort();reject(error);}};
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Pakbonnen bewaren afgebroken.'));
  });
  context.state=next;context.notifyDataChanged();
 }
 function showDownload(result){
  const url=URL.createObjectURL(result.pdf),dispose=()=>URL.revokeObjectURL(url);
  context.openForm('Pakbonnen klaar',`<p>${result.count} pakbonbestanden staan samen in één PDF. ${result.created?result.created+' nieuwe pakbonnen zijn als PDF + Word bij hun orders bewaard.':'De bestaande documenten zijn behouden.'}</p><p>Open de PDF en kies Afdrukken om alles samen te printen.</p><a class="download-button primary" data-packing-download>PDF downloaden</a><p data-packing-download-status role="status">Download wordt gestart…</p>`,async()=>{}, {trackChanges:false,afterSave:dispose,afterCancel:dispose});
  const form=document.querySelector('#dialog form'),link=form.querySelector('[data-packing-download]');link.href=url;link.download=result.name;link.onclick=()=>{form.querySelector('[data-packing-download-status]').textContent='Download gestart · kijk in Downloads. Je kunt de PDF hier opnieuw downloaden.';};
  form.querySelector('[type=submit]').textContent='Sluiten';form.querySelector('#cancel').hidden=true;link.click();
 }
}
