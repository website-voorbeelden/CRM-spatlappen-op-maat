import {productDesignVariants,currentFinalVariant,variantMatchesProduct} from '../../shared/product-design-variants.js?v=batch1-variants-20261026';
import {productDesignExportUrl} from '../designs/download-links.js?v=four-parts-20261026';

// Presentation only: never choose a variant, alter artwork or infer approval.
export function designVariantsMarkup(context,order,item,{imageTag,variantUrl}){
 if(context.company.tool!=='design')return '';
 const variants=productDesignVariants(item),final=currentFinalVariant(item),esc=context.esc;
 if(!variants.length)return '';
 function card(variant){
  const preview=context.state.documents.find(d=>d.id===variant.previewId&&d.ownerId===order.id&&d.itemId===item.id);
  const artwork=context.state.documents.some(d=>d.id===variant.documentId&&d.ownerId===order.id&&d.itemId===item.id&&d.internalDesign);
  const mismatch=variant.sourceBasis&&!variantMatchesProduct(item,variant),selected=item.designFinalVariantId===variant.id,isFinal=final?.id===variant.id;
  const label=isFinal?'Definitief':mismatch?'Maat / aantal gewijzigd':selected?'Keuze opnieuw bevestigen':'Voorstel';
  const status=context.badge(label,isFinal?'green':mismatch||selected?'orange':'');
  const date=variant.updatedAt&&Number.isFinite(Date.parse(variant.updatedAt))?context.date(variant.updatedAt.slice(0,10)):'Datum onbekend';
  const revisions=Array.isArray(variant.revisions)?variant.revisions:[];
  const versions=[...revisions].reverse().map((revision,index)=>{
   const hasPreview=context.state.documents.some(d=>d.id===revision.previewId&&d.ownerId===order.id&&d.itemId===item.id);
   return `<div class="design-variant-revision"><small>Versie ${revisions.length-index}${revision.updatedAt?' · '+context.date(revision.updatedAt.slice(0,10)):''}</small>${hasPreview?context.button('download','Preview PNG',revision.previewId):''}<a href="${esc(variantUrl(order,item,variant.id,true,revision.documentId))}" target="_blank" rel="noopener">Als nieuwe variant openen</a></div>`;
  }).join('');
  const warning=mismatch?'Open deze variant, controleer de maat en het aantal en bewaar een nieuwe versie.':!preview||!artwork?'Ontwerp of voorbeeld ontbreekt. Open en bewaar deze variant opnieuw.':selected&&!isFinal?'Het product of ontwerp is gewijzigd. Controleer opnieuw vóór je de keuze bevestigt.':'';
  return `<article class="design-variant ${isFinal?'is-final':''}">
   <div class="design-variant-heading"><h4>${esc(variant.name)}</h4>${status}<small>${esc(date)} · ${revisions.length+1} bewaarde versie${revisions.length?'s':''}</small></div>
   ${preview?`<button type="button" class="design-variant-preview" data-action="view-product-image" data-id="${esc(preview.id)}" aria-label="Voorbeeld van ${esc(variant.name)} vergroten">${imageTag(preview)}</button>`:'<p class="form-help">Geen voorbeeld beschikbaar.</p>'}
   ${warning?`<p class="design-variant-warning">${warning}</p>`:''}
   <div class="actions"><a href="${esc(variantUrl(order,item,variant.id))}" target="_blank" rel="noopener">Openen / bewerken ↗</a>${!isFinal&&!mismatch&&preview&&artwork?`<button type="button" data-design-final="${esc(variant.id)}" data-order="${esc(order.id)}" data-item="${esc(item.id)}">Definitief kiezen</button>`:''}
    <details class="quiet-menu"><summary>Meer</summary><div>${selected?`<button type="button" data-design-unfinal="${esc(variant.id)}" data-order="${esc(order.id)}" data-item="${esc(item.id)}">Definitieve keuze opheffen</button>`:''}<a href="${esc(variantUrl(order,item,variant.id,true))}" target="_blank" rel="noopener">Kopie als nieuwe variant</a><a href="${esc(productDesignExportUrl(order.id,item.id,'pdf',context.runtime.mode,variant.id))}" target="_blank" rel="noopener">Vector-PDF van deze variant</a>${preview?context.button('download','Preview PNG',preview.id):''}${versions?`<details class="design-variant-history"><summary>Eerdere versies (${revisions.length})</summary>${versions}</details>`:''}</div></details>
   </div>
  </article>`;
 }
 const alternatives=final?variants.filter(variant=>variant.id!==final.id):variants;
 const current=final?card(final):'';
 const choices=alternatives.length?`<div class="design-variant-grid">${alternatives.map(card).join('')}</div>`:'';
 const invalidChoice=!final&&Boolean(item.designFinalVariantId);
 return `<section class="product-design-variants">
  <div class="section-heading"><div><h3>Ontwerpen</h3><p>${variants.length} variant${variants.length===1?'':'en'} · ${final?'definitieve keuze bewaard':'nog geen geldige definitieve keuze'}</p></div><a class="download-button" href="${esc(variantUrl(order,item,'new'))}" target="_blank" rel="noopener">Nieuw ontwerp</a></div>
  ${!final?`<p class="${invalidChoice?'design-variant-warning':'form-help'}">${invalidChoice?'De eerdere definitieve keuze is niet meer geldig. ':''}Kies na klantakkoord één definitief ontwerp. Varianten delen dezelfde productmaat, aantallen en prijs.</p>`:''}
  ${current}${final&&alternatives.length?`<details class="design-alternatives"><summary>Andere ontwerpen (${alternatives.length})</summary>${choices}</details>`:choices}
 </section>`;
}
