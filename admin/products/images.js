import {designVariantsMarkup} from './design-variants.js?v=ui-batch234-20261027';
import {productDesignVariants,currentFinalVariant,designVariantSignature,selectFinalVariant,clearFinalVariant} from '../../shared/product-design-variants.js?v=batch1-variants-20261026';
import {productDesignExportUrl} from '../designs/download-links.js?v=four-parts-20261026';
// Feature implementation. context provides live dependencies from workspace composition.
// Keep state reads through context.state; never cache a separate dossier snapshot here.
export function createProductImages(context){
function isDocumentImage(d){return context.acceptedImageTypes.has(d.type);}

function productImages(o,i){const versions=new Set(productDesignVariants(i).flatMap(v=>[v,...(v.revisions||[])].map(v=>v.previewId)));return context.state.documents.filter(d=>d.ownerId===o.id&&d.itemId===i.id&&isDocumentImage(d)&&!versions.has(d.id));}

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

function variantUrl(o,i,variant,copy=false,revision=''){const url=new URL('/spatlap-preview.html',location.origin);url.searchParams.set('orderId',o.id);url.searchParams.set('itemId',i.id);url.searchParams.set('variant',copy?'new':variant);if(copy)url.searchParams.set('copyVariant',variant);if(revision)url.searchParams.set('revision',revision);if(context.runtime.mode==='cloud')url.searchParams.set('storage','cloud');return url.href;}
function variantCards(o,i){return designVariantsMarkup(context,o,i,{imageTag,variantUrl});}
document.addEventListener('click',event=>{const button=event.target.closest('[data-design-final],[data-design-unfinal]');if(!button)return;try{
 if(context.company.tool!=='design')throw Error('Ontwerpvarianten horen bij Spatlappen.');
 const order=context.state.orders.find(o=>o.id===button.dataset.order),item=order?.items.find(i=>i.id===button.dataset.item),variant=item&&productDesignVariants(item).find(v=>v.id===(button.dataset.designFinal||button.dataset.designUnfinal));if(!variant)throw Error('Het ontwerp bestaat niet meer.');
 const basis=designVariantSignature(order,item),clearing=button.hasAttribute('data-design-unfinal'),preview=context.state.documents.find(d=>d.id===variant.previewId);
 context.openForm(clearing?'Definitieve keuze opheffen':'Definitief ontwerp kiezen',`<p>${context.esc(variant.name)} bij ${context.esc(item.description)}.</p>${!clearing&&preview?`<div class="full-product-image">${imageTag(preview)}</div>`:''}<p>${clearing?'De ontwerpgoedkeuring vervalt. Varianten en bestanden blijven bewaard; fysieke productie wordt niet teruggedraaid.':'Dit wordt het goedgekeurde ontwerp en de hoofdafbeelding voor dit product. Andere varianten en eerdere bestanden blijven bewaard. Aanpassen van dit gekozen ontwerp vraagt opnieuw goedkeuring.'}</p><label class="check-row"><input type="checkbox" name="confirmDesign" required>${clearing?'Ik hef de definitieve ontwerpkeuze op.':'De klant heeft deze versie goedgekeurd; gebruik deze als definitief ontwerp.'}</label>`,async fd=>{
  if(!fd.has('confirmDesign'))throw Error('Bevestig de keuze.');
  const sourceBasis=clearing?undefined:await (await import('../product-designs.js?v=crm-code-review-20261027')).readProductDesignSourceBasis(order.id,item.id,variant);
  await context.mergeStoredState(next=>{if(clearing)clearFinalVariant(next,order.id,item.id,basis);else selectFinalVariant(next,order.id,item.id,variant.id,basis,{sourceBasis});});
  context.toast(clearing?'Definitieve keuze opgeheven.':'Definitief ontwerp gekozen.');
 },{afterSave:context.render});renderDocumentImages();
 }catch(error){context.toast(error.message);}});
function productImageCard(o,i){
 const images=productImages(o,i).reverse().sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date)),primary=images.find(d=>d.id===i.primaryImageId)||images.find(d=>d.id===i.designPreviewId)||images.find(d=>d.imageRole==='approved')||images[0];
 const designDownloads=i.designVariants?.length&&!currentFinalVariant(i)?'<p class="form-help">Leveranciersbestand: kies na klantakkoord een definitief ontwerp. Voorstelbestanden staan bij Meer van elke variant.</p>':context.company.tool==='design'&&i.designDocumentId?`<div class="product-design-downloads"><small>Opgeslagen ontwerp${i.designUpdatedAt?' · '+context.date(i.designUpdatedAt.slice(0,10)):''}</small>${context.state.documents.some(d=>d.id===i.designPreviewId&&d.ownerId===o.id&&d.itemId===i.id&&d.productDesignPreview&&d.type==='image/png')?context.button('download','Preview PNG',i.designPreviewId):`<a class="download-button" href="${context.esc(productDesignExportUrl(o.id,i.id,'png',context.runtime.mode))}" target="_blank" rel="noopener">Preview PNG</a>`}<a class="download-button" href="${context.esc(productDesignExportUrl(o.id,i.id,'pdf',context.runtime.mode))}" target="_blank" rel="noopener">Vector-PDF leverancier</a></div>`:'';
 if(!primary)return variantCards(o,i)+designDownloads; // Uploaden blijft beschikbaar in de productknoppen.
 const controls=d=>`<div class="image-controls">${context.button('view-product-image','Vergroten',d.id)}${d.id===i.primaryImageId?'<span>Hoofdafbeelding</span>':`<button type="button" data-primary-image="${context.esc(d.id)}" data-order="${context.esc(o.id)}" data-item="${context.esc(i.id)}">Als eerste tonen</button>`}${context.company.tool==='design'&&!i.designVariants?.length?(d.imageRole==='approved'?context.button('unapprove-product-image','Goedkeuring weghalen',d.id):context.button('approve-product-image','Als goedgekeurd aanwijzen',d.id)):''}</div>`;
 const display=d=>`<div class="product-image-card"><button type="button" class="image-open" data-action="view-product-image" data-id="${d.id}" aria-label="Vergroot ${context.esc(d.name)}">${imageTag(d)}</button><div class="product-image-info">${context.badge(context.company.tool!=='design'?'Productafbeelding':d.imageRole==='approved'?'Goedgekeurd ontwerp':d.productDesignPreview?'Ontwerpvoorbeeld':'Klantvoorbeeld',d.imageRole==='approved'?'green':'')}<small>${context.esc(d.name)}</small>${controls(d)}</div></div>`;
 return `${variantCards(o,i)}${designDownloads}<div class="product-artwork" data-drop-owner="${o.id}" data-drop-item="${i.id}" data-drop-category="other">${display(primary)}${images.length>1?`<details class="history-details"><summary>Andere afbeeldingen (${images.length-1})</summary><div class="other-product-images">${images.filter(d=>d.id!==primary.id).map(display).join('')}</div></details>`:''}</div>`;
}

function uploadProductImage(orderId,itemId){
 const input=document.createElement('input');input.type='file';input.multiple=true;input.accept=[...context.acceptedImageTypes].join(',');
 input.onchange=()=>context.addDocuments(orderId,'other',input.files,{itemId,imageRole:'reference'}).catch(error=>context.toast('Upload mislukt: '+error.message));input.click();
}

function viewProductImage(id){
 const d=context.state.documents.find(d=>d.id===id);if(!d)return;
 const item=context.state.orders.find(o=>o.id===d.ownerId)?.items.find(i=>i.id===d.itemId),managed=context.company.tool==='design'&&item?.designVariants?.length;
 let label=context.company.tool!=='design'?'Productafbeelding':d.imageRole==='approved'?'Goedgekeurd ontwerp':d.productDesignPreview?'Ontwerpvoorbeeld':'Klantvoorbeeld',approved=d.imageRole==='approved';
 if(managed){
  const variants=productDesignVariants(item),final=currentFinalVariant(item),current=variants.some(v=>v.previewId===d.id),historical=variants.some(v=>(v.revisions||[]).some(r=>r.previewId===d.id));
  approved=final?.previewId===d.id;label=approved?'Definitief ontwerp':current?'Ontwerpvoorstel':historical?'Eerdere ontwerpversie':'Referentieafbeelding';
 }
 context.openForm(context.company.tool==='design'?'Ontwerpvoorbeeld':'Productafbeelding',`<div class="full-product-image">${imageTag(d)}</div><p>${context.badge(label,approved?'green':'')} ${context.esc(d.name)}</p>${context.button('download','Origineel downloaden',d.id)}${context.documentDeleteButton(d)}`,async()=>{});context.$('#dialog [type=submit]').textContent='Sluiten';context.$('#cancel').hidden=true;renderDocumentImages();
}

async function markProductImage(id,approved){
 if(context.company.tool!=='design')throw Error('Ontwerpgoedkeuring hoort bij Spatlappen. Gebruik hier de productbestanden.');
 const original=context.state.documents.find(d=>d.id===id);if(!original?.itemId)return;
 const expected=JSON.stringify(original),message=approved?'Goedgekeurd ontwerp aangewezen':'Afbeelding weer als klantvoorbeeld opgeslagen';
 await context.mergeStoredState(next=>{
  const d=next.documents.find(d=>d.id===id),item=next.orders.find(o=>o.id===d?.ownerId)?.items.find(i=>i.id===d.itemId);
  if(!d||JSON.stringify(d)!==expected)throw Error('Deze afbeelding is intussen gewijzigd. Open het product opnieuw.');
  if(item?.designVariants?.length)throw Error('Kies of hef het definitieve ontwerp op bij Ontwerpvarianten.');
  if(approved)for(const other of next.documents)if(other.ownerId===d.ownerId&&other.itemId===d.itemId&&other.imageRole==='approved')other.imageRole='reference';
  d.imageRole=approved?'approved':'reference';d.markedApprovedAt=approved?new Date().toISOString():'';
  next.activities.unshift({id:context.uid(),message,time:new Date().toISOString()});
 });context.render();context.toast(message);
}
return {isDocumentImage,productImages,imageTag,renderDocumentImages,productImageActions,productImageCard,uploadProductImage,viewProductImage,markProductImage};
}
