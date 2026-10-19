import {productValues} from './order-inputs.js';
// Persist inputs + historical result. Reopening never recalculates old CRM prices.
export const calculationSignature=item=>JSON.stringify(item);
const cents=value=>{const n=Math.round(value*100);if(!Number.isSafeInteger(n)||n<0)throw Error('Het berekende bedrag is ongeldig.');return n;};
export function calculationRecord(snapshot,{version,coreVersion,now=new Date().toISOString()}) {
 const {calculation:c,selectedScenarioId}=snapshot;
 if(!c?.state||!Array.isArray(c.scenarios)||!Array.isArray(c.state.pieces))throw Error('De berekening is onvolledig.');
 if(c.state.pieces.length!==1)throw Error('Bij een CRM-product hoort één stukregel. Maak voor extra producten een eigen CRM-orderregel.');
 const selected=c.scenarios.find(s=>s.id===selectedScenarioId);
 if(!selected||c.errors?.length||selected.errors?.length||!selected.priceComplete)throw Error('Vul eerst alle benodigde tarieven en geldige maten in voor de gekozen leverancier.');
 if(!Number.isSafeInteger(c.quantity)||c.quantity<1)throw Error('Het aantal moet een positief geheel getal zijn.');
 return {format:'crm-cost-calculation',version:1,companyId:'maatwerkkunststof',appVersion:version,coreVersion,savedAt:now,selectedScenarioId,
  inputs:structuredClone(c.state),result:{quantity:c.quantity,supplier:selected.name,
  directCostInCents:cents(selected.materialCost+selected.processCost+selected.holeCost+selected.quoteCost),
  landedCostInCents:cents(selected.landedCost),salePriceInCents:cents(selected.salePrice),
  transportInCents:cents(selected.transport),dutyInCents:cents(selected.duty),otherInCents:cents(selected.other)},
  selectedResult:structuredClone(selected)};
}
export function applyCalculation(next,binding,record,{copyCost=false,copySale=false,copyProduct=false}={}) {
 const order=next.orders.find(o=>o.id===binding.orderId),item=order?.items.find(i=>i.id===binding.itemId);
 if(!item)throw Error('Dit product bestaat niet meer. Er is niets opgeslagen.');
 if(calculationSignature(item)!==binding.signature)throw Error('Dit product is intussen gewijzigd. Heropen de calculator vanuit het CRM.');
 if(record.companyId!=='maatwerkkunststof'||record.version!==1)throw Error('Deze berekening hoort bij een andere bedrijfsversie.');
 const {width,height,quantity}=productValues(record);
 if(!copyProduct&&((item.width!=null&&width!==item.width)||(item.height!=null&&height!==item.height)))throw Error('De berekende afmetingen wijken af van het CRM. Pas de maten eerst in de order aan en open de calculator opnieuw.');
 if(!copyProduct&&record.result.quantity!==item.quantity)throw Error('Het berekende aantal wijkt af van het CRM. Pas het aantal eerst in de order aan en open de calculator opnieuw.');
 if(copyCost&&item.costSource==='supplierInvoice')throw Error('De kostprijs komt uit een leveranciersfactuur. Bewaar de berekening zonder de kostprijs te vervangen.');
 if(copySale&&order.packagePrice!=null)throw Error('Deze order heeft één totaalprijs. Pas die in het CRM aan; losse verkoopprijzen worden niet vervangen.');
 if(copyProduct&&item.costSource==='supplierInvoice'&&quantity!==item.quantity)throw Error('Het aantal hoort bij een leveranciersfactuur. Wijzig dit eerst bij de inkoop.');
 if(copyProduct){const p=record.inputs.pieces[0];Object.assign(item,{width,height,quantity,shape:p.shape,thickness:p.thickness,material:p.material,diameter:p.shape==='circle'?p.outerDiameter:null,holeDiameter:p.innerDiameter||0});}
 item.costCalculation=structuredClone(record);
 if(item.costQuoteLink)item.costQuoteLink.localModified=true;
 if(copyCost){item.cost=Math.round(record.result.directCostInCents/item.quantity);item.costSource='calculator';item.calculatedCostTotal=record.result.directCostInCents;}
 if(copySale)item.price=Math.round(record.result.salePriceInCents/item.quantity);
 next.activities.unshift({id:crypto.randomUUID(),message:'Kostprijsberekening bewaard bij '+item.description,time:record.savedAt});
 return item;
}
