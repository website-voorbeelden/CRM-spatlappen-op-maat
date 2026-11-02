import {importVatCost,importVatCostKnown,freightBasisKnown,purchasePaidOutflow} from './purchase-import-costs.js?v=finance-period-review-20261031';

// Read-only figures from the existing canonical purchase-cost projection.
// Supplier document totals/receipts never become a second cost source.
export function purchaseCostOverview(p,info,finance,named){
 const vatKnown=Number.isSafeInteger(p.importVat)&&p.importVat>=0;
 const vatCostKnown=importVatCostKnown(p);
 const cost=info.goods+info.shared;
 const budget=info.goods+(p.freight??0)+(info.duty??0)+(p.extraCosts??0)+named.total+(p.importVat??0);
 const baseKnown=info.goodsKnown&&p.freight!=null&&info.duty!=null&&p.extraCosts!=null&&named.known&&freightBasisKnown(p)&&!(p.freightIncludedInProductCosts&&info.rawGoods<(p.freight??0));
 return {
  cost:Number.isSafeInteger(cost)&&cost>=0?cost:null,
  costKnown:info.goodsKnown&&info.sharedKnown&&p.dutyMode!=='calculate'&&Number.isSafeInteger(cost)&&cost>=0,
  vatKnown,vatCostKnown,vatCost:vatCostKnown?importVatCost(p):null,
  recoverableVat:vatCostKnown?(p.importVatRecoverable===true?p.importVat:0):null,
  budget:Number.isSafeInteger(budget)&&budget>=0?budget:null,
  budgetKnown:baseKnown&&vatKnown&&p.dutyMode!=='calculate'&&Number.isSafeInteger(budget)&&budget>=0,
  paid:purchasePaidOutflow(p,finance.invoices.length?finance.paid:null)
 };
}
