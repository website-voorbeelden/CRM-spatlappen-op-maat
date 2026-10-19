// Feature implementation. context provides live dependencies from workspace composition.
// Keep state reads through context.state; never cache a separate dossier snapshot here.
export function createDocumentWorkspace(context){
function orderedDocumentCategories(){return context.categoryPreferences.order.map(key=>context.documentCategories.find(c=>c[0]===key));}

function documentsForOwner(ownerId){
 const o=context.order(ownerId),c=context.customer(ownerId);
 const owners=c?new Set([c.id,...context.customerOrders(c.id).map(o=>o.id)]):new Set(o?[o.id,o.customerId]:[ownerId]);
 return [...new Map(context.state.documents.filter(d=>owners.has(d.ownerId)&&!d.internalDesign).map(d=>[d.id,d])).values()];
}

function documentSource(d){
 const o=context.order(d.ownerId);if(o)return `<a class="document-source" href="#orders/${o.id}/documents">Order #${context.esc(o.sourceNumber||o.number)}${o.archived?' · gearchiveerd':''} →</a>`;
 const p=context.purchase(d.ownerId);if(p){const invoice=context.supplierInvoices(p).find(i=>i.id===d.invoiceId);return `<a class="document-source" href="#purchases/${p.id}/invoices">${context.esc(invoice?.reference||p.name)} →</a>`;}
 return context.customer(d.ownerId)?'<span class="document-source">Algemeen klantdocument · gedeeld met de orders</span>':'';
}

function documentPreviewButton(d){const target=context.previewDocument(context.state.documents,d.id);return target?`<button type="button" data-action="preview-document" data-id="${context.esc(target.id)}">Preview</button>`:'';}

function documentFile(d,categorized=false){const menu=!!context.documentPaymentActions(d)||categorized;return `<div class="document-file" data-document-id="${context.esc(d.id)}">${context.isDocumentImage(d)?`<button class="document-image-open" type="button" data-action="view-product-image" data-id="${d.id}" aria-label="Bekijk ${context.esc(d.name)}">${context.imageTag(d)}</button>`:''}<div class="document-file-info"><strong>${context.esc(d.name)}</strong>${d.emailAttachment?context.badge('E-mailbijlage','blue'):''}${d.imageRole==='approved'?context.badge('Goedgekeurd ontwerp','green'):''}<small>${context.date(d.date)} · ${Math.ceil(d.size/1024)} KB</small>${categorized?documentSource(d):''}</div><div class="document-file-actions">${documentPreviewButton(d)}${context.button('download','Download',d.id)}${menu?'<details class="document-file-more"><summary>Meer</summary>':''}${context.documentPaymentActions(d)}${documentDeleteButton(d)}${categorized?`<label>Verplaatsen naar<select data-document-category="${context.esc(d.id)}" aria-label="Categorie van ${context.esc(d.name)}">${context.documentCategories.map(([key,title])=>`<option value="${key}" ${context.documentCategory(d)===key?'selected':''}>${title}</option>`).join('')}</select></label>`:''}${menu?'</details>':''}</div></div>`;}

function documentDeleteButton(d,label='Verwijderen'){return d.internalDesign?'':`<button type="button" class="document-delete-button" data-action="delete-document" data-id="${context.esc(d.id)}" aria-label="Verwijder ${context.esc(d.name)}">${context.esc(label)}</button>`;}

function deleteDocumentForm(id){
 const info=context.documentRemovalInfo(context.state,id),d=info.document,o=context.order(d.ownerId),c=context.customer(d.ownerId),p=context.purchase(d.ownerId),ownerLabel=o?'Order #'+(o.sourceNumber||o.number):c?'Algemeen klantdossier · '+c.company:p?'Inkoop · '+p.name:'Dit dossier';
 const sharedCount=c?context.customerOrders(c.id).length:0;
 context.openForm('Document verwijderen',`<p>Je verwijdert dit bestand uit het CRM:</p><div class="document-delete-summary"><strong>${context.esc(d.name)}</strong><small>${context.esc(ownerLabel)} · ${Math.ceil((d.size||0)/1024)} KB</small></div>${sharedCount?`<p class="notice">Dit is een algemeen klantdocument. Het verdwijnt ook uit het documentenoverzicht van ${sharedCount} gekoppelde order${sharedCount===1?'':'s'}.</p>`:''}<p>Je verwijdert alleen dit bestand. De order, betalingen, overige bestanden en nummerreeksen blijven behouden.</p>${d.generated?.number?`<p class="form-help">Documentnummer ${context.esc(d.generated.number)} blijft gereserveerd. Andere bestanden van hetzelfde document blijven staan.</p>`:''}${info.emails.length||info.links.length?`<p class="notice">Dit bestand wordt gebruikt bij ${info.emails.length} mailbericht${info.emails.length===1?'':'en'} en ${info.links.length} betaallink${info.links.length===1?'':'s'}. Verzonden mails en betaalverzoeken blijven bestaan. Bij het opnieuw openen van een mail moet je de ontbrekende bijlage controleren.</p>`:''}${d.imageRole==='approved'?'<p class="notice">Deze afbeelding is als goedgekeurd ontwerp aangewezen. Na verwijderen staat deze afbeelding niet meer bij het product.</p>':''}<p class="form-help">Stap terug kan dit binnen dit tabblad herstellen zolang de wijziging binnen de bewaargrens valt (20 stappen / 16 MB). Na herladen of bij grotere wijzigingen gebruik je een back-up.</p><label class="check-row"><input type="checkbox" name="confirmDeleteDocument" required>Ik wil dit bestand verwijderen</label>`,async fd=>{
  if(!fd.has('confirmDeleteDocument'))throw context.formProblem('Bevestig dat je dit bestand wilt verwijderen.',{field:'confirmDeleteDocument'});
  context.beginLocalStateChange();let next;
  await new Promise((resolve,reject)=>{const tx=context.db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),request=ss.get('main');request.onsuccess=()=>{try{next=request.result;if(!next)throw Error('CRM-gegevens ontbreken.');const removed=context.removeDocument(next,id,info.signature,{confirmed:true});next.activities.unshift({id:context.uid(),message:'Document verwijderd: '+removed.name,time:new Date().toISOString()});ss.put(next,'main');tx.objectStore('files').delete(id);}catch(error){tx.abort();reject(error);}};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Verwijderen afgebroken.'));});
  context.state=next;context.documentImageUrls.get(id)?.then(url=>URL.revokeObjectURL(url)).catch(()=>{});context.documentImageUrls.delete(id);context.notifyDataChanged();context.render();context.toast('Document verwijderd');
 });const submit=context.$('#dialog [type=submit]');submit.textContent='Bestand verwijderen';submit.className='destructive';
}

function documentBundleCard(files,historical=false){
 const d=files[0],type=context.documentTypes[d.generated?.kind];
 if(!type||!context.documentFormat(d)||!d.generated?.number)return files.map(f=>documentFile(f,true)).join('');
 const pdf=files.find(f=>context.documentFormat(f)==='PDF');
 return `<article class="document-bundle" data-document-id="${context.esc(d.id)}"><div class="document-file-info"><strong>${context.esc(type.title)} <span>${context.esc(d.generated.number)}</span></strong><small>${context.date(d.date)} · ${files.map(context.documentFormat).join(' + ')}${context.documentVersion(d)>1?' · versie '+context.documentVersion(d):''}${historical?' · eerdere versie':''}</small>${documentSource(d)}${d.batchDocumentKind?'<small>'+context.esc(context.batchDocumentKinds.find(([k])=>k===d.batchDocumentKind)?.[1]||'Batchdocument')+'</small>':''}</div><div class="document-bundle-actions">${!historical&&context.canReviseDocument(context.state,d.id,context.company.id)?context.button('edit-document','Aanpassen',d.id):''}${documentPreviewButton(pdf||d)}${pdf?context.button('download','PDF downloaden',pdf.id):files.map(f=>context.button('download',context.documentFormat(f)+' downloaden',f.id)).join('')}${pdf&&context.order(d.ownerId)?`<button type="button" data-action="email-draft" data-id="${context.esc(d.ownerId)}" data-document="${context.esc(pdf.id)}">Mail voorbereiden</button>`:''}</div><details class="document-bundle-manage"><summary>Meer · bestanden beheren</summary>${files.filter(f=>context.documentFormat(f)!=='PDF'&&pdf).map(f=>context.button('download',context.documentFormat(f)+' downloaden',f.id)).join('')}${pdf?context.documentPaymentActions(pdf,{includeEmail:false}):''}${files.map(f=>`<div class="document-format-row"><div><strong>${context.documentFormat(f)}</strong><small>${context.esc(f.name)} · ${Math.ceil(f.size/1024)} KB</small></div><label>Verplaatsen naar<select data-document-category="${context.esc(f.id)}" aria-label="Categorie van ${context.esc(f.name)}">${context.documentCategories.map(([key,title])=>`<option value="${key}" ${context.documentCategory(f)===key?'selected':''}>${title}</option>`).join('')}</select></label>${documentDeleteButton(f,context.documentFormat(f)+' verwijderen')}</div>`).join('')}</details></article>`;
}

function documentCreateButton(ownerId,kind='',label='Document maken'){
 return `<button type="button" class="document-create-button" data-action="create-document" data-id="${context.esc(ownerId)}" ${kind?`data-kind="${context.esc(kind)}"`:''}>${context.esc(label)}</button>`;
}

function documentCreationForm(ownerId,kind=''){
 const o=context.order(ownerId),c=context.customer(ownerId),orders=o?[o]:c?context.customerOrders(c.id):[],allowed=Object.keys(context.documentTypes).filter(k=>context.company.id!=='maatwerkkunststof'||k==='packing');
 if(!o&&!c)throw Error('Maak klantdocumenten vanuit een klant of order.');
 if(!orders.length)throw Error('Maak eerst een klantorder; het document gebruikt de producten en gegevens van die order.');
 if(kind&&!allowed.includes(kind))throw Error('Dit documenttype is nog niet ingericht voor dit bedrijf.');
 const preferred=o?.id||(orders.length===1?orders[0].id:context.documentTargets.get(c.id)),selected=orders.some(x=>x.id===preferred)?preferred:'';
 if(kind&&selected){if(kind==='packing')context.packingSlipForm(selected);else context.confirmationForm(selected,kind);return;}
 let next;
 context.openForm('Document maken',`${o?`<p class="form-help">Voor order #${context.esc(o.sourceNumber||o.number)}</p><input type="hidden" name="orderId" value="${context.esc(o.id)}">`:`<label>Voor welke order?<select name="orderId" required><option value="">Kies een order</option>${orders.map(x=>`<option value="${context.esc(x.id)}" ${x.id===selected?'selected':''}>Order #${context.esc(x.sourceNumber||x.number)}${x.archived?' · gearchiveerd':''}</option>`).join('')}</select></label>`}${kind?`<input type="hidden" name="kind" value="${kind}"><p>${context.esc(context.documentTypes[kind].title)} maken</p>`:`<fieldset class="document-type-picker"><legend>Wat wil je maken?</legend>${allowed.map(k=>`<label><input type="radio" name="kind" value="${k}" required><span><strong>${context.esc(context.documentTypes[k].title)}</strong><small>${context.esc(context.documentCategories.find(([key])=>key===k)?.[2]||'')}</small></span></label>`).join('')}</fieldset>`}<p class="form-help">Hierna controleer je de inhoud en bekijk je het voorbeeld. Er wordt nu nog niets opgeslagen.</p>`,fd=>{
  const current=context.order(fd.get('orderId')),chosen=fd.get('kind');
  if(!current||(o?current.id!==o.id:current.customerId!==c.id))throw context.formProblem('Kies een bestaande order van deze klant.',{field:'orderId'});
  if(!allowed.includes(chosen))throw context.formProblem('Kies een documenttype.',{field:'kind'});
  next={id:current.id,kind:chosen};
 },{afterSave:()=>{try{if(next.kind==='packing')context.packingSlipForm(next.id);else context.confirmationForm(next.id,next.kind);}catch(error){context.toast(error.message);}}});
 context.$('#dialog [type=submit]').textContent='Verder →';context.$('#dialog form').dataset.busyLabel='Document openen…';
}

function documents(ownerId){
 const files=documentsForOwner(ownerId),c=context.customer(ownerId),o=context.order(ownerId),list=c?context.customerOrders(c.id):[];
 if(!o&&!c&&!context.purchase(ownerId))return `<h2>Documenten & bestanden</h2><p class="muted">Oude offertes, facturen, logo’s en overige bijlagen.</p>${context.button('upload','Bestand uploaden',ownerId)}${files.map(d=>documentFile(d)).join('')}`;
 let target=c?(context.documentTargets.get(c.id)||(list.length===1?list[0].id:c.id)):ownerId;
 if(c&&target!==c.id&&!list.some(o=>o.id===target))target=c.id;
 const uploadChoice=c?`<div class="document-upload-target"><label>Nieuwe bestanden toevoegen aan<select data-document-target="${context.esc(c.id)}"><option value="${context.esc(c.id)}" ${target===c.id?'selected':''}>Algemeen klantdossier · gedeeld met de orders</option>${list.map(o=>`<option value="${context.esc(o.id)}" ${target===o.id?'selected':''}>Order #${context.esc(o.sourceNumber||o.number)}${o.archived?' · gearchiveerd':''}</option>`).join('')}</select></label><p class="form-help">${list.length===1?'Deze klant heeft één order. Uploads worden standaard aan die order gekoppeld en zijn ook hier zichtbaar.':'Kies een order voor orderdocumenten, of het klantdossier voor algemene bestanden.'}</p></div>`:'';
 const canCreate=!!o||!!c&&list.length>0,kindAllowed=key=>context.documentTypes[key]&&(context.company.id!=='maatwerkkunststof'||key==='packing');
 const total=context.documentVersionGroups(files).length,visibleCategories=context.categoryPreferences.order.filter(key=>!context.categoryPreferences.view.hideEmpty||files.some(d=>context.documentCategory(d)===key));
 return `<div class="section-heading document-library-heading"><div><h2>${c?'Alle documenten van deze klant':'Documenten & bestanden'}</h2><p>${total} document${total===1?'':'en'} · nieuwste eerst. ${c?'Uit het klantdossier en de gekoppelde orders.':context.purchase(ownerId)?'Leveranciersbestanden voor deze zending.':'Van deze order en het klantdossier.'}</p></div><div class="actions">${canCreate?documentCreateButton(o?.id||c.id):c?context.button('new-order','Eerst een klantorder maken',c.id,true):''}${context.button('upload','Bestand uploaden',target)}</div></div>${canCreate?'<p class="document-library-help">PDF en Word van hetzelfde aangemaakte document staan samen. Kies een documenttype om te maken, of sleep bestaande bestanden naar het juiste vak.</p>':''}${uploadChoice}<div class="document-library-wrapper">${context.documentLayoutToolbar(context.categoryPreferences,{hasHidden:context.categoryPreferences.view.hideEmpty&&context.documentCategories.some(([key])=>!files.some(d=>context.documentCategory(d)===key))})}<div class="document-groups document-library" ${context.documentLayoutAttributes(context.categoryPreferences)}>${orderedDocumentCategories().map(([key,title,description])=>{const bundles=context.documentVersionGroups(files.filter(d=>context.documentCategory(d)===key));return `<section class="document-group" data-document-layout-key="${key}" data-document-empty="${bundles.length===0}" ${context.categoryPreferences.view.hideEmpty&&!bundles.length?'hidden':''} data-drop-owner="${context.esc(target)}" data-drop-category="${key}" aria-labelledby="document-heading-${key}"><div class="document-group-heading"><div><h3 id="document-heading-${key}"><span class="document-layout-control"><button type="button" class="document-layout-handle" draggable="true" aria-haspopup="true" data-document-layout-handle="${key}" aria-label="Volgorde ${context.esc(title)} aanpassen" title="Sleep dit vak, klik voor verplaatsen of gebruik de pijltjestoetsen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14"/></svg></button><span class="document-layout-menu" hidden><button type="button" data-document-layout-step="previous" data-document-layout-source="${key}" ${visibleCategories.indexOf(key)===0?'disabled':''}>Naar voren</button><button type="button" data-document-layout-step="next" data-document-layout-source="${key}" ${visibleCategories.indexOf(key)===visibleCategories.length-1?'disabled':''}>Naar achteren</button></span></span>${title} <span class="document-count" aria-label="${bundles.length} documenten">${bundles.length}</span></h3><p class="document-group-description">${description}</p></div><div class="actions">${canCreate&&kindAllowed(key)?documentCreateButton(target===c?.id?c.id:target,key,context.documentTypes[key].title+' maken'):''}<button type="button" data-action="upload" data-id="${context.esc(target)}" data-category="${key}">Uploaden</button></div></div><div class="document-file-list">${bundles.map(group=>documentBundleCard(group.current)+(group.previous.length?'<details class="document-previous"><summary>Eerdere versies ('+group.previous.length+')</summary>'+group.previous.map(files=>documentBundleCard(files,true)).join('')+'</details>':'')).join('')||'<p class="document-empty">Nog geen documenten.</p>'}</div><div class="document-dropzone"><span>Sleep ${key==='other'?'bestanden':'bestaande '+title.toLowerCase()} hierheen om toe te voegen</span></div></section>`;}).join('')}</div></div>`;
}

function addDocuments(ownerId,category,files,metadata={}){
 // Queue batches and commit the file blobs together with their metadata.
 const batch=Array.from(files);
 if(!batch.length)return Promise.resolve();
 const pending=context.documentUploadQueue.then(async()=>{
  if(metadata.itemId){if(!context.order(ownerId)?.items.some(i=>i.id===metadata.itemId))throw Error('Dit product bestaat niet meer.');if(batch.some(file=>!context.acceptedImageTypes.has(file.type)))throw Error('Kies een PNG, JPG, WebP, GIF, AVIF of SVG-afbeelding.');}
  const validCategory=context.documentCategories.some(([key])=>key===category)?category:'other';
  const added=batch.map(file=>({id:context.uid(),ownerId,...metadata,category:validCategory,name:file.name,type:file.type,size:file.size,date:context.today(),createdAt:new Date().toISOString()}));
  const message=`${batch.length===1?'Bestand toegevoegd':`${batch.length} bestanden toegevoegd`}${context.order(ownerId)?' aan '+context.documentCategories.find(([key])=>key===validCategory)[1].toLowerCase():''}`;
  const activity={id:context.uid(),message,time:new Date().toISOString()};
  context.state.documents.push(...added);context.state.activities.unshift(activity);
  try{
   await new Promise((resolve,reject)=>{
    context.beginLocalStateChange();const tx=context.db.transaction(['state','files'],'readwrite');
    const fs=tx.objectStore('files');
    batch.forEach((file,n)=>fs.put({id:added[n].id,blob:file}));
    tx.objectStore('state').put(context.state,'main');
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Opslaan afgebroken.'));
   });
  }catch(error){
   const ids=new Set(added.map(d=>d.id));context.state.documents=context.state.documents.filter(d=>!ids.has(d.id));context.state.activities=context.state.activities.filter(a=>a.id!==activity.id);
   throw error;
  }
  context.notifyDataChanged();context.render();context.toast(message);
 });
 context.documentUploadQueue=pending.catch(()=>{});
 return context.loading.run('Bestanden opslaan…',()=>pending);
}

function upload(ownerId,category='other'){
 const input=document.createElement('input');input.type='file';input.multiple=true;
 input.onchange=()=>addDocuments(ownerId,category,input.files).catch(error=>context.toast('Upload mislukt: '+error.message));input.click();
}

function clearDropHighlights(){document.querySelectorAll('[data-drop-owner].drag-over').forEach(zone=>zone.classList.remove('drag-over'));}

async function downloadBlob(blob,name,preparedUrl){
 const finishLoading=context.loading.begin('Download voorbereiden…');let failed=false;
 try{
  let url,temporary=false;
  if(preparedUrl?.startsWith('/__local/downloads/')||preparedUrl?.startsWith('/api/crm/files/'))url=preparedUrl;
  else
  if(context.runtime.localServices&&['localhost','127.0.0.1'].includes(location.hostname)&&blob.size<=32_000_000){
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(Error('Bestand lezen lukt niet.'));reader.readAsDataURL(blob);});
   const response=await fetch('/__local/downloads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,data})});
   const result=await response.json().catch(()=>({error:'Herlaad het CRM en probeer opnieuw.'}));
   if(!response.ok||!result.url?.startsWith('/__local/downloads/'))throw Error(result.error||'Download voorbereiden lukt niet.');
   url=result.url;
  }else{url=URL.createObjectURL(blob);temporary=true;}
  const a=document.createElement('a');a.href=url;a.download=name;
  // The open modal makes the rest of the page inert. Keep the link inside it.
  (document.querySelector('dialog[open]')||document.body).append(a);a.click();setTimeout(()=>{a.remove();if(temporary)URL.revokeObjectURL(url);},10000);
  context.toast('Download gestart: '+name+' · kijk in je map Downloads');return true;
 }catch(error){failed=true;context.toast('Download mislukt: '+error.message);return false;}
 finally{finishLoading({error:failed});}
}
return {orderedDocumentCategories,documentsForOwner,documentSource,documentPreviewButton,documentFile,documentDeleteButton,deleteDocumentForm,documentBundleCard,documentCreateButton,documentCreationForm,documents,addDocuments,upload,clearDropHighlights,downloadBlob};
}
