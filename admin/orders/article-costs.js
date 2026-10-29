import {allocateCents} from '../../shared/money-allocation.js?v=feedback-five-20261029';
import {embeddedFreightShare,importVatCost} from '../../shared/purchase-import-costs.js?v=feedback29-batch1-followup';

// Display-only detail of canonical costs. A component's third value carries
// source completeness: an unknown zero is never presented as free.
export function articleCostRows(context,order,economics){
 const items=order.items,p=context.purchase(order.purchaseId),suppliers=items.filter(i=>i.productionSource!=='local');
 const quantity=rows=>rows.map(i=>({id:i.id,weight:i.quantity||0}));
 const weight=i=>p?.allocation==='cost'?context.itemCostTotal(i):p?.allocation==='area'?(i.quantity||0)*(i.width||0)*(i.height||0):i.quantity||0;
 const supplierWeights=suppliers.map(i=>({id:i.id,weight:weight(i)}));
 const basisKnown=!p||suppliers.every(i=>p.allocation==='cost'?i.cost!=null:p.allocation==='area'?i.width>0&&i.height>0&&i.quantity>0:i.quantity>0);
 const split=(amount,weights)=>allocateCents(amount??0,weights);
 const shared=amount=>split(p?context.allocatedAmount(p,order.id,amount??0):0,supplierWeights);
 const correction=split(p?embeddedFreightShare(context.state,p,order.id):0,suppliers.map(i=>({id:i.id,weight:context.itemCostTotal(i)})));
 const categories=[
  ['Transport leverancier → NL',shared(p?.freight),!p||p.freight!=null,true],
  ['Invoerrechten',p?shared(context.dutyAmount(p)):split(economics.duty,quantity(items)),p?context.dutyAmount(p)!=null:economics.duty!=null,Boolean(p)],
  ['Inklaring / overige inkoopkosten',shared(p?.extraCosts),!p||p.extraCosts!=null,true],
  ['Niet-terugvorderbare invoer-btw',shared(p?importVatCost(p):0),!p||!p.importVat||p.importVatRecoverable!=null,true],
  ['Benoemde batchkosten',shared(p?context.namedCostSummary(p).total:0),!p||context.namedCostSummary(p).known,true],
  ['Verzending / bezorging NL',split(order.shippingActual,quantity(items)),order.shippingActual!=null,false],
  ['Overige orderkosten',split(order.extraCosts,quantity(items)),order.extraCosts!=null,false],
  ['Benoemde orderkosten zonder artikel',split((order.namedCosts||[]).filter(row=>!row.itemId).reduce((n,row)=>n+(row.amount??0),0),quantity(items)),(order.namedCosts||[]).filter(row=>!row.itemId).every(row=>row.amount!=null),false]
 ];
 return items.map(item=>{
  const components=[['Inkoop / productie na transportcorrectie',context.itemCostTotal(item)-(correction.get(item.id)??0),item.cost!=null],
   ...categories.map(([label,amounts,known,supplierOnly])=>[label,amounts.get(item.id)??0,supplierOnly&&item.productionSource==='local'?true:known&&(!supplierOnly||basisKnown)]),
   ...(order.namedCosts||[]).filter(row=>row.itemId===item.id).map(row=>[row.label,row.amount??0,row.amount!=null])];
  return {item,components,total:components.reduce((n,[,value])=>n+value,0),known:components.every(([,,known])=>known)};
 });
}
export function articleCostsMarkup(context,order,economics){
 const rows=articleCostRows(context,order,economics),sum=rows.reduce((n,row)=>n+row.total,0),esc=context.esc,fmt=context.euro;
 return `<details class="form-details"><summary>Volledige kosten per artikel (${rows.length})</summary><p class="form-help">Dezelfde ingevulde kosten als de ordermarge, verdeeld tot op de cent. Batchkosten volgen eerst de bestaande orderverdeling en daarna ${context.purchase(order.purchaseId)?.allocation==='cost'?'de inkoopwaarde':context.purchase(order.purchaseId)?.allocation==='area'?'de oppervlakte':'het aantal fysieke stuks'} van leveranciersartikelen. Eigen verzending en ongerichte orderkosten volgen het aantal stuks van alle artikelen.</p>${sum!==economics.cost?'<p class="notice">Niet alle orderkosten zijn aan een bestaand artikel toe te wijzen. Controleer productkoppelingen; het ordertotaal blijft leidend.</p>':''}${rows.map(({item,components,total,known})=>`<article class="cost-product-summary"><h3>${esc(item.description)}</h3><p>${item.quantity} stuks · ${fmt(total)} ${known?'ingevulde kosten':'bekend · voorlopig'} · ${item.quantity>0?fmt(Math.round(total/item.quantity))+' per stuk (afgerond)':'aantal onbekend'}</p>${components.filter(([,amount,complete])=>amount>0||!complete).map(([label,amount,complete])=>`<div class="cost-composition-row"><div><span>${esc(label)}</span><strong>${complete||amount>0?fmt(amount):'Nog onbekend'}${!complete&&amount>0?' · voorlopig':''}</strong><small>${!complete?'Bron of verdeelbasis nog aanvullen':total>0?context.percent(amount/total*100)+' van ingevulde kosten':''}</small></div>${amount>0?`<meter class="cost-composition-meter" min="0" max="${Math.max(1,total)}" value="${amount}" aria-label="${esc(label)}: ${esc(fmt(amount))}"></meter>`:''}</div>`).join('')||'<p>De bekende kosten zijn expliciet €0.</p>'}</article>`).join('')||'<p>Nog geen artikelen om de kosten over te verdelen.</p>'}<p class="form-help">Onbekende posten zijn geen gratis kosten. Materiaal en arbeid zitten mogelijk samen in de leveranciersprijs; zonder bronbedragen splitsen we die niet. Terugvorderbare invoer-btw blijft buiten de marge. Per-stukbedragen zijn afgerond; artikel- en ordertotalen blijven in gehele centen.</p></details>`;
}
