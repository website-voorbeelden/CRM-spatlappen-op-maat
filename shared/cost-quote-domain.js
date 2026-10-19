const copy=v=>structuredClone(v),object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const pick=(v,keys)=>Object.fromEntries(keys.filter(k=>v?.[k]!==undefined).map(k=>{if(v[k]!==null&&!['string','number','boolean'].includes(typeof v[k]))throw Error('Een invoerveld moet een eenvoudige waarde zijn.');return [k,v[k]];}));
const ident=v=>typeof v==='string'&&/^[-a-zA-Z0-9_]{1,100}$/.test(v);
const costKeys=['mode','value','hourlyRate','performedBy'];
const priceKeys=['mode','value'];
const pieceKeys=['id','name','process','material','thickness','quantity','shape','width','height','cornerRadius','outerDiameter','innerDiameter','innerWidth','innerHeight','opening','innerRadius','holes','holeDiameter','colorIndex'];
const scenarioKeys=['id','name','colorIndex','currency','exchangeRate','sheetWidth','sheetHeight','costSource','quotedTotal','quoteProcess','quoteHoles','transport','dutyPct','other'];
function mapValues(v,fn){return Object.fromEntries(Object.entries(v||{}).map(([k,value])=>{if(!ident(k)&&!k.includes('|'))throw Error('Ongeldige tariefverwijzing.');return [k,fn(value)];}));}
function numericMap(v){return mapValues(v,n=>{if(typeof n!=='number'||!Number.isFinite(n)||n<0)throw Error('Ongeldig tarief.');return n;});}
// Explicit allowlists: customer/account fields and arbitrary imported metadata
// cannot be stored in this workspace or sent to the calculator.
export function privateCostInputs(value){
 if(!object(value)||!Array.isArray(value.pieces)||!value.pieces.length||value.pieces.length>50||!Array.isArray(value.scenarios)||!value.scenarios.length||value.scenarios.length>20)throw Error('De berekening moet 1–50 producten en 1–20 leveranciers bevatten.');
 const result=pick(value,['process','materialMode','sheetWidth','sheetHeight','edge','gap','marginPct','selectedScenarioId']);
 result.pieces=value.pieces.map(p=>pick(p,pieceKeys));
 result.scenarios=value.scenarios.map(s=>({...pick(s,scenarioKeys),exchangeRates:pick(s.exchangeRates,['TRY','CNY']),rates:mapValues(s.rates,c=>pick(c,['unit','price'])),quotedUnitPrices:numericMap(s.quotedUnitPrices),
  processCost:pick(s.processCost,costKeys),holeCost:pick(s.holeCost,costKeys),processCosts:mapValues(s.processCosts,c=>pick(c,costKeys)),pricing:pick(s.pricing,priceKeys),linePricing:mapValues(s.linePricing,c=>pick(c,priceKeys)),
  layoutChoices:mapValues(s.layoutChoices,c=>pick(c,['key','index'])),holeAlternatives:mapValues(s.holeAlternatives,c=>pick(c,costKeys)),
  pieceCosts:mapValues(s.pieceCosts,c=>({...pick(c,['mode','quoteProcessOverride','quoteHolesOverride']),processCost:pick(c.processCost,costKeys),holeCost:pick(c.holeCost,costKeys),holeAlternatives:mapValues(c.holeAlternatives,v=>pick(v,costKeys))}))}));
 for(const group of [result.pieces,result.scenarios])if(group.some(r=>!ident(r.id))||new Set(group.map(r=>r.id)).size!==group.length)throw Error('Dubbele of ontbrekende product-/leveranciersverwijzing.');
 function visit(v,depth=0){if(depth>12)throw Error('Te veel gegevens.');if(typeof v==='number'&&!Number.isFinite(v))throw Error('Ongeldig getal.');if(typeof v==='string'&&v.length>1000)throw Error('Een omschrijving is te lang.');if(Array.isArray(v))v.forEach(c=>visit(c,depth+1));else if(object(v))Object.entries(v).forEach(([k,c])=>{if(['__proto__','constructor','prototype'].includes(k))throw Error('Ongeldig veld.');visit(c,depth+1);});}visit(result);
 if(JSON.stringify(result).length>500000)throw Error('Deze berekening is te groot.');return result;
}
const money=n=>{if(typeof n!=='number'||!Number.isFinite(n)||n<0||!Number.isSafeInteger(Math.round(n*100)))throw Error('Ongeldig bedrag.');return Math.round(n*100);};
export const quoteSignature=q=>JSON.stringify(q);
export function productBasis(inputs){return JSON.stringify(inputs.pieces.map(p=>pick(p,pieceKeys.filter(k=>!['name','colorIndex'].includes(k)))));}
export function newCostQuote(inputs,{id=crypto.randomUUID(),now=new Date().toISOString()}={}){
 const safe=privateCostInputs(inputs);return {format:'crm-cost-quote',version:1,companyId:'maatwerkkunststof',id,title:'Nieuwe offerteberekening',updatedAt:now,inputs:safe,selectedScenarioId:safe.selectedScenarioId||safe.scenarios[0].id,offers:[],lines:safe.pieces.map(p=>({pieceId:p.id,unitSaleInCents:null})),result:null};
}
export function validateCostQuote(q){
 if(!object(q)||q.format!=='crm-cost-quote'||q.version!==1||q.companyId!=='maatwerkkunststof'||!ident(q.id)||typeof q.title!=='string'||!q.title.trim()||q.title.length>120||typeof q.updatedAt!=='string'||!Number.isFinite(Date.parse(q.updatedAt)))throw Error('Ongeldige Maatwerkkunststof-offerteberekening.');
 const inputs=privateCostInputs(q.inputs);if(inputs.pieces.some(p=>!Number.isSafeInteger(p.quantity)||p.quantity<1))throw Error('Controleer de aantallen.');if(!inputs.scenarios.some(s=>s.id===q.selectedScenarioId))throw Error('Kies een leverancier.');
 if(!Array.isArray(q.lines)||q.lines.length!==inputs.pieces.length||q.lines.some((l,n)=>l.pieceId!==inputs.pieces[n].id||l.unitSaleInCents!==null&&(!Number.isSafeInteger(l.unitSaleInCents)||l.unitSaleInCents<0)))throw Error('Controleer de offerteprijzen.');
 if(!Array.isArray(q.offers)||q.offers.length>20)throw Error('Te veel leveranciersoffertes.');
 const offers=q.offers.map(o=>{if(!inputs.scenarios.some(s=>s.id===o.scenarioId)||typeof o.reference!=='string'||o.reference.length>120||typeof o.confirmedBasis!=='string'||o.confirmedBasis.length>50000)throw Error('Ongeldige leveranciersofferte.');return pick(o,['scenarioId','reference','confirmedBasis']);});
 if(new Set(offers.map(o=>o.scenarioId)).size!==offers.length)throw Error('Dubbele leveranciersofferte.');
 for(const line of q.lines)for(const k of ['directCostInCents','supplierCostInCents'])if(line[k]!=null&&(!Number.isSafeInteger(line[k])||line[k]<0))throw Error('Ongeldige kostprijs.');
 // Historical result is reduced to monetary facts; no raw provider/group data.
 const result=q.result?pick(q.result,['calculatedAt','scenarioId','supplier','directCostInCents','landedCostInCents','saleInCents','transportInCents','dutyInCents','otherInCents','basis']):null;
 if(result&&(!inputs.scenarios.some(s=>s.id===result.scenarioId)||typeof result.supplier!=='string'||result.supplier.length>1000||typeof result.basis!=='string'||['directCostInCents','landedCostInCents','saleInCents','transportInCents','dutyInCents','otherInCents'].some(k=>!Number.isSafeInteger(result[k])||result[k]<0)))throw Error('Ongeldige opgeslagen uitkomst.');
 return {...pick(q,['format','version','companyId','id','title','updatedAt']),inputs,selectedScenarioId:q.selectedScenarioId,offers,lines:q.lines.map(l=>({...pick(l,['pieceId','unitSaleInCents']),directCostInCents:l.directCostInCents??null,supplierCostInCents:l.supplierCostInCents??null})),result};
}
export function editCostQuote(original,{title,inputs,selectedScenarioId,lines,offers},now=new Date().toISOString()){
 const safe=privateCostInputs(inputs),q=validateCostQuote({...original,title,inputs:safe,selectedScenarioId,lines,offers,updatedAt:now,result:null});
 // Explicit selling prices entered in the quote are reflected in the tool.
 const selected=q.inputs.scenarios.find(s=>s.id===selectedScenarioId);selected.linePricing??={};
 for(const line of q.lines){if(line.unitSaleInCents!==null)selected.linePricing[line.pieceId]={mode:'salePerPiece',value:line.unitSaleInCents/100};else delete selected.linePricing[line.pieceId];}
 const costBasis=v=>{const x=privateCostInputs(v);delete x.marginPct;delete x.selectedScenarioId;x.scenarios.forEach(s=>{delete s.pricing;delete s.linePricing;});return JSON.stringify(x);};
 const sameCosts=original.selectedScenarioId===selectedScenarioId&&costBasis(original.inputs)===costBasis(q.inputs);
 q.result=sameCosts?original.result:null;q.lines.forEach(l=>{const previous=original.lines.find(p=>p.pieceId===l.pieceId);l.directCostInCents=sameCosts?previous?.directCostInCents??null:null;l.supplierCostInCents=sameCosts?previous?.supplierCostInCents??null:null;});q.inputs.selectedScenarioId=selectedScenarioId;return validateCostQuote(q);
}
export function applyQuoteCalculation(original,snapshot,{copySale=false,confirmSupplierQuote=false,now=new Date().toISOString()}={}){
 const q=validateCostQuote(original),c=snapshot.calculation,inputs=privateCostInputs(c?.state),selected=c.scenarios?.find(s=>s.id===snapshot.selectedScenarioId);
 if(inputs.pieces.some(p=>!Number.isSafeInteger(p.quantity)||p.quantity<1))throw Error('Elk aantal moet een positief geheel getal zijn.');
 if(c.errors?.length||!selected||selected.errors?.length||!selected.priceComplete)throw Error('Vul eerst de benodigde maten en tarieven in voor deze leverancier.');
 const scenario=inputs.scenarios.find(s=>s.id===selected.id),basis=productBasis(inputs),offer=q.offers.find(o=>o.scenarioId===selected.id);
 if(scenario.costSource!=='calculated'&&offer?.confirmedBasis!==basis&&!confirmSupplierQuote)throw Error('Controleer of de leveranciersofferte geldt voor deze maten en aantallen en bevestig dat expliciet.');
 if(scenario.costSource!=='calculated'&&confirmSupplierQuote){if(offer)offer.confirmedBasis=basis;else q.offers.push({scenarioId:selected.id,reference:'',confirmedBasis:basis});}
 const old=new Map(q.lines.map(l=>[l.pieceId,l])),sameBasis=productBasis(q.inputs)===basis;
 q.inputs=inputs;q.selectedScenarioId=selected.id;q.inputs.selectedScenarioId=selected.id;
 q.offers=q.offers.filter(o=>inputs.scenarios.some(s=>s.id===o.scenarioId));
 q.lines=inputs.pieces.map((p,n)=>({pieceId:p.id,directCostInCents:money(selected.lines[n].directCost),supplierCostInCents:money(selected.lines[n].supplierCost),unitSaleInCents:copySale?money(selected.lines[n].salePerPiece):sameBasis?old.get(p.id)?.unitSaleInCents??null:null}));
 q.result={calculatedAt:now,scenarioId:selected.id,supplier:selected.name,directCostInCents:money(selected.materialCost+selected.processCost+selected.holeCost+selected.quoteCost),landedCostInCents:money(selected.landedCost),saleInCents:money(selected.salePrice),transportInCents:money(selected.transport),dutyInCents:money(selected.duty),otherInCents:money(selected.other),basis};q.updatedAt=now;
 return validateCostQuote(q);
}
export function quoteSaleTotal(q){return q.lines.every(l=>l.unitSaleInCents!==null)?q.lines.reduce((total,l,n)=>{const v=total+l.unitSaleInCents*q.inputs.pieces[n].quantity;if(!Number.isSafeInteger(v))throw Error('Het offertetal is te groot.');return v;},0):null;}
export function mergeSupplierQuote(target,source,scenarioId,{newId=crypto.randomUUID()}={}){
 const q=validateCostQuote(target),other=validateCostQuote(source),supplier=other.inputs.scenarios.find(s=>s.id===scenarioId);
 if(!supplier||supplier.costSource==='calculated')throw Error('Kies een opgeslagen leveranciersofferte met een totaal- of stukprijs.');
 const specs=v=>v.pieces.map(p=>pick(p,pieceKeys.filter(k=>!['id','name','colorIndex'].includes(k))));
 if(JSON.stringify(specs(q.inputs))!==JSON.stringify(specs(other.inputs)))throw Error('Deze leveranciersofferte hoort bij andere producten, maten of aantallen. Pas je aanvraag aan of voer een nieuwe prijs in; de oude offerte wordt niet stilzwijgend hergebruikt.');
 if(!ident(newId)||q.inputs.scenarios.some(s=>s.id===newId))throw Error('Ongeldige leveranciersverwijzing.');
 const mapping=new Map(other.inputs.pieces.map((p,n)=>[p.id,q.inputs.pieces[n].id])),clone=copy(supplier);clone.id=newId;delete clone.colorIndex;
 for(const key of ['quotedUnitPrices','pieceCosts','linePricing'])clone[key]=Object.fromEntries(Object.entries(clone[key]||{}).filter(([id])=>mapping.has(id)).map(([id,v])=>[mapping.get(id),v]));
 // A supplier offer supplies costs, not the former customer's selling prices.
 clone.linePricing={};delete clone.pricing;q.inputs.scenarios.push(clone);q.selectedScenarioId=newId;q.inputs.selectedScenarioId=newId;
 const offer=other.offers.find(o=>o.scenarioId===scenarioId);q.offers.push({scenarioId:newId,reference:offer?.reference||'',confirmedBasis:''});
 for(const line of q.lines)if(line.unitSaleInCents!==null)clone.linePricing[line.pieceId]={mode:'salePerPiece',value:line.unitSaleInCents/100};
 q.result=null;return validateCostQuote(q);
}
