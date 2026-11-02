import {linkedExpenseMarkup} from '../expenses/linked-costs.js?v=business-expenses-20261031';
import {purchaseCostOverview} from '../../shared/purchase-cost-overview.js?v=finance-period-review-20261031';

// Display only: the caller supplies the same projection used by order margins.
export function purchaseCostSummaryMarkup(context,p,info,finance,{action='',preview=false,cashOnly=false}={}){
 const named=context.namedCostSummary(p),x=purchaseCostOverview(p,info,finance,named),{esc,euro}=context;
 const money=(amount,known)=>amount==null?'Nog te bepalen':(known?'':'Voorlopig · ')+euro(amount);
 const vat=()=>!x.vatKnown?'Nog niet ingevuld':euro(p.importVat);
 const allocation=({equal:'Gelijk per klantorder',quantity:'Naar aantal stuks',area:'Naar oppervlakte',cost:'Naar inkoopwaarde'})[p.allocation||'equal'];
 const basis=p.freight===0?'Er is expliciet geen transportbedrag.':p.freightIncludedInProductCosts===true?'Het transport zit al in de productkostprijzen. Het wordt daar eerst uitgehaald en vervolgens één keer verdeeld.':p.freightIncludedInProductCosts===false?'De productkostprijzen zijn zonder dit transport. Transport wordt één keer toegevoegd.':'Nog controleren of transport al in de productkostprijzen zit. De kostprijs is voorlopig.';
 const costRows=[
  ['Productkosten vóór transportcorrectie',money(info.rawGoods,info.goodsKnown)],
  ...(p.freightIncludedInProductCosts===true?[['Reeds inbegrepen transport uit productkosten',p.freight==null?'Nog te bepalen':'− '+euro(Math.min(info.rawGoods,p.freight))]]:[]),
  ['Productkosten na transportcorrectie',money(info.goods,info.goodsKnown)],
  ['Transport leverancier → ontvangst',p.freight==null?'Nog onbekend':euro(p.freight)],
  ['Invoerrechten',info.duty==null?'Nog onbekend':euro(info.duty)+(p.dutyMode==='calculate'?' · schatting':'')],
  ['Inklaring / bank / overige gezamenlijke kosten',p.extraCosts==null?'Nog onbekend':euro(p.extraCosts)],
  ['Benoemde gezamenlijke kosten',money(named.total,named.known)],
  ['Invoer-btw die als kosten meetelt',x.vatCostKnown?euro(x.vatCost):'Nog vaststellen'],
  ['Kostprijs vóór kosten van afzonderlijke klantorders',money(x.cost,x.costKnown)]
 ];
 const cost=cashOnly?'':`<section class="order-surface"><div class="section-heading"><div><h2>${preview?'Controle met je huidige invoer':'Kosten van deze inkoopbestelling'}</h2><p>Producten, transport en overige kosten één keer. Terugvorderbare invoer-btw staat apart.</p></div>${action}</div>${context.orderSummaryRows(costRows)}<p class="form-help">Verdeling: ${esc(allocation)}. ${esc(basis)} De oorspronkelijke productprijzen, factuurregels en betalingen worden niet herschreven.</p>${info.missingShared.length||!info.goodsKnown?`<p class="notice" role="status">Nog controleren: ${esc([...(info.goodsKnown?[]:['volledige productkosten']),...info.missingShared].join(', '))}. Ontbrekende bedragen zijn geen gratis kosten.</p>`:''}<p class="form-help">Kosten van bezorging aan klanten en overige orderkosten staan bij de klantorders. Een leveranciersbetaling bepaalt hoeveel geld is overgemaakt; zij telt niet nogmaals als kostprijs.</p></section>`;
 const cash=`<section class="order-surface"><div class="section-heading"><h2>Invoer-btw & uitgaand geld</h2>${cashOnly?action:''}</div>${context.orderSummaryRows([
  ['Werkelijk betaalde invoer-btw',vat()],
  ['Datum invoer-btw volgens bron',context.esc(p.importVatDate||'Nog onbekend')],
  ['Werkelijke betaaldatum invoer-btw',context.esc(p.importVatPaidDate||'Nog onbekend')],
  ['Aftrekbaarheid',p.importVat===0?'Geen invoer-btw betaald':p.importVatRecoverable===true?'Terugvorderbaar · bewijs controleren':p.importVatRecoverable===false?'Niet terugvorderbaar':'Nog vaststellen'],
  ['Terugvorderbare invoer-btw buiten kostprijs',x.recoverableVat==null?'Nog vaststellen':euro(x.recoverableVat)],
  ['Geregistreerde betalingen aan leveranciers',finance.invoices.length?euro(finance.paid):'Nog niet geregistreerd'],
  ['Betalingen aan leveranciers + betaalde invoer-btw',x.paid.known?euro(x.paid.amount):'Nog afstemmen'],
  ['Uitgaand bedrag bij volledige betaling van bekende inkoop',money(x.budget,x.budgetKnown)]
 ])}<p class="form-help">${x.paid.known?'Leveranciersbetalingen en invoer-btw zijn volgens je gekozen betalingsbron één keer opgeteld.':esc(x.paid.reason)+'.'} Externe kostenbetalingen kunnen ontbreken; dit is geen volledig kasboek.</p><p class="form-help">Het bedrag bij volledige betaling is een kostenbasis plus invoer-btw, geen bewijs dat alles al betaald is. Bij onbekende aftrekbaarheid kan dit bedrag wel bekend zijn, terwijl de marge nog voorlopig is. Er wordt geen btw-teruggaaf verondersteld.</p>${p.importVat>0&&!p.importVatEvidence?.trim()?'<p class="notice">Bewaar de invoer-, btw- en betaalbewijzen en leg de referentie vast. Een aftrekkeuze in dit scherm is geen gecontroleerde fiscale boeking.</p>':''}${p.importVatEvidence?'<details class="form-details"><summary>Bewijsreferentie</summary><p class="notes">'+esc(p.importVatEvidence)+'</p></details>':''}${preview?'':'<a href="#analytics/vat/sources">Btw-bronnen & bewijs controleren →</a>'}<p class="form-help">Het bestaande btw-register wordt niet opnieuw als kosten of betaling opgeteld.</p></section>`;
 return cost+cash+(preview?'':linkedExpenseMarkup(context.state,'purchase',p.id,context));
}
