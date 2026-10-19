import {validateCostQuote,productBasis,editCostQuote,privateCostInputs} from './cost-quote-domain.js';
export function calculationChoice(value,pieceId){
 const q=validateCostQuote(value),n=q.inputs.pieces.findIndex(p=>p.id===pieceId),piece=q.inputs.pieces[n],line=q.lines[n],supplier=q.inputs.scenarios.find(s=>s.id===q.selectedScenarioId);
 if(!piece||!q.result||q.result.scenarioId!==supplier.id||q.result.basis!==productBasis(q.inputs)||line.directCostInCents===null||line.supplierCostInCents===null)throw Error('Bereken deze offerte eerst opnieuw in de rekentool.');
 const width=piece.shape==='circle'?piece.outerDiameter:piece.width,height=piece.shape==='circle'?piece.outerDiameter:piece.height;
 if(!Number.isSafeInteger(width)||width<1||!Number.isSafeInteger(height)||height<1)throw Error('Deze maten kunnen niet als CRM-product worden overgenomen. Gebruik gehele millimeters.');
 const data={quoteId:q.id,pieceId:piece.id,scenarioId:supplier.id,title:q.title,supplier:supplier.name,description:piece.name||'Kunststof op maat',quantity:piece.quantity,width,height,material:piece.material,thickness:piece.thickness,unitSaleInCents:line.unitSaleInCents,directCostInCents:line.directCostInCents,supplierCostInCents:line.supplierCostInCents,updatedAt:q.updatedAt};
 return {...data,sourceSignature:JSON.stringify(data)};
}
export function costingLink(choice){return {source:'costCalculator',quoteId:choice.quoteId,pieceId:choice.pieceId,scenarioId:choice.scenarioId,sourceVersion:choice.updatedAt,sourceSignature:choice.sourceSignature,supplier:choice.supplier,title:choice.title,syncedAt:new Date().toISOString()};}
export function salesFieldsFromCalculation(choice){return {description:choice.description,quantity:choice.quantity,width:choice.width,height:choice.height,price:choice.unitSaleInCents,cost:Math.round(choice.directCostInCents/choice.quantity)};}
export function purchaseFieldsFromCalculation(choice){return {description:choice.description,quantity:choice.quantity,unit:'piece',price:Math.round(choice.supplierCostInCents/choice.quantity)};}
const cents=n=>{if(n!==null&&(!Number.isSafeInteger(n)||n<0))throw Error('Controleer de ingevulde prijs.');return n;};
// Only product/price fields enter the calculator, never customer IDs or contact data.
export function syncProductToCalculation(value,link,fields,{direction='sale'}={}){
 const q=validateCostQuote(value),choice=calculationChoice(q,link.pieceId);
 if(link.quoteId!==q.id||link.sourceSignature!==choice.sourceSignature)throw Error('De berekening is intussen gewijzigd. Bekijk eerst de nieuwe rekentoolgegevens; er is niets overschreven.');
 if(!Number.isSafeInteger(fields.quantity)||fields.quantity<1)throw Error('Controleer het aantal.');
 const inputs=privateCostInputs(q.inputs),piece=inputs.pieces.find(p=>p.id===link.pieceId),supplier=inputs.scenarios.find(s=>s.id===link.scenarioId);
 if(!supplier)throw Error('De gekozen leverancier bestaat niet meer.');
 piece.quantity=fields.quantity;
 if(direction==='sale'){
  for(const k of ['width','height'])if(!Number.isSafeInteger(fields[k])||fields[k]<1)throw Error('Vul de productmaten in.');
  if(piece.shape==='circle'){if(fields.width!==fields.height)throw Error('Een ronde berekening vereist gelijke breedte en hoogte. Pas de vorm aan in de rekentool.');piece.outerDiameter=fields.width;}else{piece.width=fields.width;piece.height=fields.height;}
 }else if(direction!=='purchase')throw Error('Onbekende prijsrichting.');
 const lines=q.lines.map(l=>({...l})),line=lines.find(l=>l.pieceId===link.pieceId);
 if(direction==='sale')line.unitSaleInCents=cents(fields.price);
 else{
  // Supplier quotes provide goods cost only, excluding own workshop/transport.
  // Switching from a total/tariff to per-piece quotation is deliberate, reviewed UI.
  supplier.costSource='quote_per_piece';const factor=supplier.currency==='EUR'?1:supplier.exchangeRate;if(!Number.isFinite(factor)||factor<=0)throw Error('Controleer de wisselkoers.');
  for(const other of q.lines)supplier.quotedUnitPrices[other.pieceId]=Math.round(other.supplierCostInCents/q.inputs.pieces.find(p=>p.id===other.pieceId).quantity)/100*factor;
  supplier.quotedUnitPrices[piece.id]=cents(fields.price)/100*factor;supplier.quoteProcess='included';supplier.quoteHoles='included';for(const override of Object.values(supplier.pieceCosts||{})){override.quoteProcessOverride='included';override.quoteHolesOverride='included';}
 }
 const result=editCostQuote(q,{title:q.title,inputs,selectedScenarioId:link.scenarioId,lines,offers:q.offers.map(o=>({...o,confirmedBasis:''}))});result.result=null;result.lines.forEach(l=>{l.directCostInCents=null;l.supplierCostInCents=null;});return result;
}
