// Feature implementation. context provides live dependencies from workspace composition.
// Keep state reads through context.state; never cache a separate dossier snapshot here.
export function createProductImages(context){
function isDocumentImage(d){return context.acceptedImageTypes.has(d.type);}

function productImages(o,i){return context.state.documents.filter(d=>d.ownerId===o.id&&d.itemId===i.id&&isDocumentImage(d));}

function imageTag(d,className=''){return `<img class="${className}" data-document-image="${context.esc(d.id)}" alt="${context.esc(d.name)}" loading="lazy">`;}

async function renderDocumentImages(){
 const current=new Set(context.state.documents.map(d=>d.id));
 for(const [id,promise] of context.documentImageUrls)if(!current.has(id)){promise.then(url=>URL.revokeObjectURL(url)).catch(()=>{});context.documentImageUrls.delete(id);}
 for(const img of document.querySelectorAll('img[data-document-image]')){
  const id=img.dataset.documentImage;
  try{let promise=context.documentImageUrls.get(id);if(!promise){promise=context.store('files','readonly',s=>s.get(id)).then(file=>{if(!file)throw Error('Afbeelding ontbreekt.');return URL.createObjectURL(file.blob);});context.documentImageUrls.set(id,promise);}const url=await promise;if(img.isConnected)img.src=url;}
  catch{context.documentImageUrls.delete(id);if(img.isConnected){img.alt='Afbeelding niet beschikbaar; download het bestand bij Documenten.';img.classList.add('image-unavailable');}}
 }
}

function productImageActions(o,i){return `<button type="button" data-action="upload-product-image" data-order="${o.id}" data-id="${i.id}">Afbeelding uploaden</button>`;}

function productImageCard(o,i){
 const images=productImages(o,i).reverse().sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date)),primary=images.find(d=>d.id===i.primaryImageId)||images.find(d=>d.id===i.designPreviewId)||images.find(d=>d.imageRole==='approved')||images[0];
 if(!primary)return ''; // Uploaden blijft beschikbaar in de productknoppen.
 const controls=d=>`<div class="image-controls">${context.button('view-product-image','Vergroten',d.id)}${d.id===i.primaryImageId?'<span>Hoofdafbeelding</span>':`<button type="button" data-primary-image="${context.esc(d.id)}" data-order="${context.esc(o.id)}" data-item="${context.esc(i.id)}">Als eerste tonen</button>`}${context.company.tool==='design'?(d.imageRole==='approved'?context.button('unapprove-product-image','Goedkeuring weghalen',d.id):context.button('approve-product-image','Als goedgekeurd aanwijzen',d.id)):''}</div>`;
 const display=d=>`<div class="product-image-card"><button type="button" class="image-open" data-action="view-product-image" data-id="${d.id}" aria-label="Vergroot ${context.esc(d.name)}">${imageTag(d)}</button><div class="product-image-info">${context.badge(context.company.tool!=='design'?'Productafbeelding':d.imageRole==='approved'?'Goedgekeurd ontwerp':d.productDesignPreview?'Ontwerpvoorbeeld':'Klantvoorbeeld',d.imageRole==='approved'?'green':'')}<small>${context.esc(d.name)}</small>${controls(d)}</div></div>`;
 return `<div class="product-artwork" data-drop-owner="${o.id}" data-drop-item="${i.id}" data-drop-category="other">${display(primary)}${images.length>1?`<details class="history-details"><summary>Andere afbeeldingen (${images.length-1})</summary><div class="other-product-images">${images.filter(d=>d.id!==primary.id).map(display).join('')}</div></details>`:''}</div>`;
}

function uploadProductImage(orderId,itemId){
 const input=document.createElement('input');input.type='file';input.multiple=true;input.accept=[...context.acceptedImageTypes].join(',');
 input.onchange=()=>context.addDocuments(orderId,'other',input.files,{itemId,imageRole:'reference'}).catch(error=>context.toast('Upload mislukt: '+error.message));input.click();
}

function viewProductImage(id){
 const d=context.state.documents.find(d=>d.id===id);if(!d)return;
 context.openForm(context.company.tool==='design'?'Besteld ontwerp':'Productafbeelding',`<div class="full-product-image">${imageTag(d)}</div><p>${context.badge(context.company.tool!=='design'?'Productafbeelding':d.imageRole==='approved'?'Goedgekeurd ontwerp':d.productDesignPreview?'Ontwerpvoorbeeld':'Klantvoorbeeld',d.imageRole==='approved'?'green':'')} ${context.esc(d.name)}</p>${context.button('download','Origineel downloaden',d.id)}${context.documentDeleteButton(d)}`,async()=>{});context.$('#dialog [type=submit]').textContent='Sluiten';context.$('#cancel').hidden=true;renderDocumentImages();
}

async function markProductImage(id,approved){
 if(context.company.tool!=='design')throw Error('Ontwerpgoedkeuring hoort bij Spatlappen. Gebruik hier de productbestanden.');
 const next=structuredClone(context.state),d=next.documents.find(d=>d.id===id);if(!d?.itemId)return;
 if(approved)for(const other of next.documents)if(other.ownerId===d.ownerId&&other.itemId===d.itemId&&other.imageRole==='approved')other.imageRole='reference';
 d.imageRole=approved?'approved':'reference';d.markedApprovedAt=approved?new Date().toISOString():'';
 const message=approved?'Goedgekeurd ontwerp aangewezen':'Afbeelding weer als klantvoorbeeld opgeslagen';next.activities.unshift({id:context.uid(),message,time:new Date().toISOString()});
 await context.store('state','readwrite',s=>s.put(next,'main'));context.state=next;context.render();context.toast(message);
}
return {isDocumentImage,productImages,imageTag,renderDocumentImages,productImageActions,productImageCard,uploadProductImage,viewProductImage,markProductImage};
}
