import {productDesignVariants} from '../../shared/product-design-variants.js?v=batch1-variants-20261026';
import {storedCalculationDiffers} from '../../shared/costing-product.js';

// Presentation only. Reuse existing editors, totals, source marks and design actions.
export function orderOverviewMarkup(context,o,{totals:t,economics:e,customer:c,itemDimensions,productionLabel,nextStep=''}){
 const id=o.id;
 function productMarkup(i){
  const esc=context.esc;
  const specifications=[esc(i.specs),...context.customerExecutionDetails(i,context.company.id).map(esc)].filter(Boolean).join(' · ');
  const values=[['Aantal',`${esc(i.quantity)} stuks`],['Afmetingen',itemDimensions(i)]];
  if(context.company.tool==='costing')values.push(['Materiaal',esc(i.material)||'Nog onbekend'],['Dikte',i.thickness>0?esc(i.thickness)+' mm':'Nog onbekend']);
  else values.push(['Bedrukking',i.printColors==null?'Drukkleuren onbekend':i.printColors===0?'Onbedrukt':`${esc(i.printColors)} drukkleuren`]);
  values.push(['Productie',context.badge(productionLabel(i,o),i.productionSource==='local'?'blue':'')]);
  const sales=o.packagePrice!=null?'<span>Verkoop <strong>Inbegrepen in totaalprijs</strong></span>':i.price==null?`<span>Verkoop <strong>Nog onbekend</strong></span>${context.company.id==='spatlappen'?`<button type="button" data-price-open="${esc(i.id)}">Verkoopprijs bepalen</button>`:''}`:`<span>Verkoop <strong>${context.euro(i.price)} / stuk</strong></span><span class="product-line-total">Regeltotaal <strong>${context.euro(i.price*i.quantity)}</strong></span>`;
  const purchase=i.cost==null?(i.purchaseCostTotal!=null?context.euro(context.itemCostTotal(i))+' bekend · voorlopig':'nog onbekend'):context.euro(context.itemCostTotal(i));
  return `<article class="simple-product">
   <div class="simple-product-head"><div class="simple-product-title"><h3>${esc(i.description)}</h3>${specifications?`<small>${specifications}</small>`:''}</div><div class="product-tools"><a class="editor-link" target="_blank" rel="noopener" href="${esc(context.toolUrl(context.company,o,i,context.runtime))}">${context.company.tool==='design'?(productDesignVariants(i).length?'Ontwerpen openen':'Ontwerp maken'):(i.costQuoteLink||i.costCalculation?'Berekening openen':'Kostprijs berekenen')} ↗</a><details class="quiet-menu"><summary>Meer</summary><div><button type="button" data-product-edit="${esc(i.id)}">Productgegevens aanpassen</button>${context.company.tool==='costing'?'<button type="button" data-action="order-costing" data-id="'+esc(o.id)+'" data-item="'+esc(i.id)+'">Berekening koppelen / synchroniseren</button>':''}${context.productImageActions(o,i)}<button type="button" data-action="compare-product" data-order="${esc(o.id)}" data-id="${esc(i.id)}">Eerdere prijzen vergelijken</button></div></details></div></div>
   <dl class="product-specs">${values.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>
   <div class="product-financials">${sales}<span class="product-cost-hint">Inkoop <strong>${purchase}</strong></span></div>
   ${context.company.tool==='costing'&&storedCalculationDiffers(i)?'<p class="notice">De bewaarde berekening wijkt af van de huidige productgegevens. Open de calculator en controleer de kostprijs opnieuw.</p>':''}
   ${i.costQuoteLink?'<p class="form-help">Bron: rekentool · '+esc(i.costQuoteLink.title)+' · '+(i.costQuoteLink.localModified?'lokaal aangepast · gebruik Berekening koppelen / synchroniseren':'koppeling bewaard · gebruik Berekening koppelen / synchroniseren')+'</p>':''}
   ${context.productImageCard(o,i)}
  </article>`;
 }

 const products=`<section class="order-surface order-products">${nextStep}<div class="section-heading"><div><h2>${context.esc(context.company.productLabel)}</h2><p>${o.items.length} product${o.items.length===1?'':'en'} · verkoopprijzen exclusief btw</p></div>${o.items.length?'':context.button('edit-order','Product toevoegen',id)}</div><div class="product-list">${o.items.map(productMarkup).join('')||'<p class="form-help">Nog geen producten vastgelegd.</p>'}</div>${o.vat!==21?`<p class="notice">Btw ${context.esc(o.vat??'onbekend')}% · ${context.esc(o.vatReason?.label||'Reden nog invullen')} <a href="#analytics/vat">Btw-controle →</a></p>`:''}<details class="order-sale-totals dossier-details"><summary><span>Prijsopbouw</span><small>Producten, verzending en btw</small></summary><div class="dossier-details-body">${o.packagePrice!=null?context.orderSummaryRows([['Totaalprijs alle producten',context.euro(o.packagePrice)]]):''}${context.orderSummaryRows([['Verzendprijs klant',o.shippingKnown?context.euro(o.shippingCharge):'Nog te berekenen'],['Totaal excl. btw',t.priceKnown?context.euro(t.net):'Nog te bepalen'],[`Btw ${o.vat}%`,t.priceKnown?context.euro(t.tax):'Nog te bepalen'],['Totaal incl. btw',t.priceKnown?context.euro(t.total):'Nog te bepalen']])}</div></details></section>`;
 const contact=o.contactId&&c?.contacts?.find(person=>person.id===o.contactId);
 const customerDetails=`<details class="order-surface dossier-details">
  <summary><span>Klant & notities</span><small>${context.esc(c?.contact||c?.company||'Klant onbekend')}${o.notes?' · notities aanwezig':''}</small></summary>
  <div class="dossier-details-body">
   <div class="actions"><button type="button" data-order-contact="${context.esc(o.id)}">Klantgegevens aanpassen</button><a href="#customers/${context.esc(o.customerId)}">Klantdossier →</a></div>
   <strong>${context.esc(c?.company)}</strong>${c?.contact?`<p class="muted">${context.esc(c.contact)}</p>`:''}
   ${contact?`<p><strong>Contact bij deze order:</strong> ${context.esc(contact.name)}</p>`:''}
   ${c?.email?`<p><a href="mailto:${context.esc(c.email)}">${context.esc(c.email)}</a></p>`:''}
   <div class="note-area"><h3>Interne ordernotities</h3><p class="notes">${context.esc(o.notes)||'Geen notities.'}</p>${context.button('order-notes','Notities aanpassen',id)}</div>
  </div>
 </details>`;
 return `${context.releaseMarkup(context.state,o,context.company,{esc:context.esc,euro:context.euro})}${context.company.id==='spatlappen'?context.sampleOrderSummary(o,e,context.euro):''}
  <div class="order-overview">${products}
   <aside class="order-overview-details" aria-label="Aanvullende dossiergegevens"><h2>Dossiergegevens</h2>${context.inquiryUI.checklistMarkup(id,{compact:true})}${context.orderPlanningBlock(o,{compact:true})}${customerDetails}</aside>
  </div>`;
}
