import {supplierInvoices} from './supplier-invoices.js';
// One expense is authoritative; linked fixed/named costs are its checked cost
// projection, never a second expense. Payments do not determine cost or VAT.
export const expenseCategories=[['delivery','Bezorging / koerier'],['shipping','Verzendkosten'],['bank','Bankkosten'],['materials','Materiaal / hulpmiddelen'],['services','Diensten'],['other','Overige bedrijfskosten']];
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9._-]{1,160}$/.test(value);
const money=value=>Number.isSafeInteger(value)&&value>=0&&value<=1e12;
const day=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
const fail=(message,field)=>{throw Object.assign(Error(message),field?{field}:{});};
const fixed={order:['shippingActual','extraCosts'],purchase:['freight','extraCosts','dutyAmount']};
export const expenseCost=e=>e.netCents==null||e.vatCents==null||(e.vatCents>0&&e.deductibleVatCents==null)?null:e.netCents+e.vatCents-(e.deductibleVatCents??0);
export const expensePaid=e=>e.payments.reduce((sum,p)=>sum+p.amount,0);
const content=e=>JSON.stringify(Object.fromEntries(Object.entries(e).filter(([key])=>!['createdAt','updatedAt','history'].includes(key))));
export function expenseOwner(state,target){return (target.kind==='order'?state.orders:target.kind==='purchase'?state.purchases||[]:[]).find(owner=>owner.id===target.ownerId);}
export function expenseSourceValue(state,target){const owner=expenseOwner(state,target);return target.slot==='named'?owner?.namedCosts?.find(row=>row.id===target.costId)?.amount:owner?.[target.slot];}
export function expenseSourceKey(target){return [target.kind,target.ownerId||'',target.slot||'',target.costId||''].join('/');}
function validateTarget(state,t){
 if(!t||Object.keys(t).some(key=>!['kind','ownerId','slot','costId'].includes(key))||!['general','order','purchase'].includes(t.kind))fail('Kies waar deze kosten horen.','source');
 if(t.kind==='general'){if(t.ownerId||t.slot||t.costId)fail('Algemene bedrijfskosten hebben geen orderbron.','source');return;}
 const owner=expenseOwner(state,t);if(!id(t.ownerId)||!owner)fail('Het gekozen kostendossier bestaat niet meer.','source');
 if(t.slot==='named'){if(!id(t.costId))fail('Ongeldige kostenregel.','source');}
 else if(!fixed[t.kind].includes(t.slot)||t.costId)fail('Deze vaste kostenbron wordt niet ondersteund.','source');
 if(t.slot==='dutyAmount'&&owner.dutyMode==='calculate')fail('Invoerrechten zijn een schatting. Leg eerst het werkelijke bedrag vast bij de zending.','source');
}
export function validateExpense(state,e){
 if(!e||typeof e!=='object'||Array.isArray(e)||Object.keys(e).some(key=>!['id','label','category','counterparty','reference','date','netCents','vatCents','deductibleVatCents','grossCents','payments','paidVatCents','paidVatDate','documentIds','evidenceNote','note','target','createdAt','updatedAt','history'].includes(key))||!id(e.id))fail('Ongeldige kostenregistratie.');
 for(const [key,max,required] of [['label',200,true],['counterparty',200,false],['reference',200,false],['evidenceNote',2000,false],['note',2000,false]])if(typeof e[key]!=='string'||e[key].length>max||required&&!e[key].trim())fail('Controleer '+key+'.',key);
 if(!expenseCategories.some(([key])=>key===e.category))fail('Kies een kostensoort.','category');
 if(e.date!==''&&!day(e.date))fail('Kies een geldige brondatum of laat onbekend leeg.','date');
 for(const key of ['netCents','vatCents','deductibleVatCents','grossCents'])if(e[key]!==null&&!money(e[key]))fail('Gebruik een positief bedrag of nul in gehele eurocenten.',key);
 if(e.vatCents==null&&e.deductibleVatCents!=null||e.deductibleVatCents!=null&&e.deductibleVatCents>e.vatCents)fail('Het aftrekbare deel moet binnen de expliciet vastgelegde btw vallen.','deductibleVatCents');
 if(e.netCents!=null&&e.vatCents!=null&&(e.netCents+e.vatCents>1e12||e.grossCents!=null&&e.netCents+e.vatCents!==e.grossCents))fail('Netto plus btw moet exact aansluiten op bruto.','grossCents');
 if(!Array.isArray(e.payments)||e.payments.length>100||new Set(e.payments.map(p=>p?.id)).size!==e.payments.length||e.payments.some(p=>!p||Object.keys(p).some(key=>!['id','amount','date','reference'].includes(key))||!id(p.id)||!money(p.amount)||p.amount<=0||!day(p.date)||typeof p.reference!=='string'||p.reference.length>200))fail('Controleer de geregistreerde betalingen.','payments');
 if(!money(expensePaid(e)))fail('De som van betalingen is te groot.','payments');
 if(e.paidVatCents!==null&&(!money(e.paidVatCents)||e.vatCents==null||e.paidVatCents>e.vatCents||e.paidVatCents>expensePaid(e)))fail('Betaalde btw vraagt een bekend btw-bedrag en voldoende geregistreerde betalingen.','paidVatCents');
 if(e.paidVatDate!==''&&!day(e.paidVatDate)||e.paidVatCents>0&&!day(e.paidVatDate))fail('Vul bij betaalde btw de werkelijke betaaldatum in.','paidVatDate');
 if(e.paidVatCents==null&&e.paidVatDate)fail('Vul ook het werkelijk betaalde btw-bedrag in of maak de btw-betaaldatum leeg.','paidVatCents');
 if(!Array.isArray(e.documentIds)||e.documentIds.length>20||new Set(e.documentIds).size!==e.documentIds.length||e.documentIds.some(value=>!id(value)||!state.documents.some(doc=>doc.id===value)))fail('Een gekozen bewijsbestand ontbreekt.','documentIds');
 if(!Number.isFinite(Date.parse(e.createdAt))||!Number.isFinite(Date.parse(e.updatedAt)))fail('Ongeldig registratiemoment.');
 validateTarget(state,e.target);
 if(e.target.kind!=='general'&&e.target.slot==='named'&&e.label.length>100)fail('Gebruik voor gekoppelde extra kosten maximaal 100 tekens.','label');
 if(e.history!==undefined){if(!Array.isArray(e.history)||e.history.length>100)fail('Ongeldige kostenhistorie.');for(const h of e.history){if(!h||Object.keys(h).some(key=>!['at','reason','before'].includes(key))||!Number.isFinite(Date.parse(h.at))||typeof h.reason!=='string'||!h.reason.trim()||h.reason.length>2000||!h.before||Object.hasOwn(h.before,'history'))fail('Ongeldige kostenhistorie.');validateExpense(state,h.before);}}
}
export function validateBusinessExpenses(state){
 const rows=state.businessExpenses===undefined?[]:state.businessExpenses;if(!Array.isArray(rows)||rows.length>1000||new Set(rows.map(row=>row?.id)).size!==rows.length)fail('Ongeldige lijst met bedrijfskosten.');
 const used=new Set(),proofs=new Set();
 for(const e of rows){
  validateExpense(state,e);
  for(const docId of e.documentIds){if((state.supplierInvoiceImports||[]).some(r=>r.documentId===docId||r.history.some(h=>h.before.documentId===docId)))fail('Dit bewijs hoort bij een ingelezen leveranciersfactuur. Behoud die ene financiële bron.');if(proofs.has(docId))fail('Hetzelfde bronbestand is al bij een andere uitgave geregistreerd.');proofs.add(docId);const doc=state.documents.find(d=>d.id===docId);if(doc.businessExpenseId&&doc.businessExpenseId!==e.id)fail('Dit bewijsbestand hoort bij een andere kostenregistratie.');}
  if(e.target.kind==='general')continue;
  const key=expenseSourceKey(e.target);if(used.has(key))fail('Deze kostenbron is al aan een uitgave gekoppeld.');used.add(key);
  const owner=expenseOwner(state,e.target),cost=expenseCost(e);
  if(e.target.slot==='named'){
   const row=owner.namedCosts?.find(row=>row.id===e.target.costId);
   if(!row||row.businessExpenseId!==e.id||row.label!==e.label||row.amount!==cost)fail('Deze kostenregel hoort bij Bedrijfskosten. Pas haar daar aan; bedragen worden niet dubbel opgenomen.');
  }else if(owner[e.target.slot]!==cost)fail('Deze vaste kosten zijn gekoppeld aan Bedrijfskosten. Pas bedrag en btw daar samen aan.');
 }
 for(const owner of [...state.orders,...(state.purchases||[])])for(const row of owner.namedCosts||[])if(row.businessExpenseId&&!rows.some(e=>e.id===row.businessExpenseId&&expenseOwner(state,e.target)===owner&&e.target.slot==='named'&&e.target.costId===row.id))fail('De kostenregistratie achter een gekoppelde kostenregel ontbreekt.');
}
export function expenseEditBasis(state,expenseId,target){
 const expense=(state.businessExpenses||[]).find(e=>e.id===expenseId),owner=expenseOwner(state,target);
 return JSON.stringify([expense||null,owner||null]);
}
export function possibleExpenseDuplicates(state,e){
 const norm=value=>String(value||'').trim().toLocaleLowerCase('nl-NL');
 return (state.businessExpenses||[]).filter(row=>row.id!==e.id&&(e.reference&&e.counterparty&&norm(row.reference)===norm(e.reference)&&norm(row.counterparty)===norm(e.counterparty)||!e.reference&&row.date===e.date&&row.grossCents===e.grossCents&&e.grossCents!=null&&norm(row.counterparty)===norm(e.counterparty)&&norm(row.label)===norm(e.label)));
}
export function expenseIssues(e){
 const issues=[];if(!e.date)issues.push('brondatum');if(!e.counterparty.trim())issues.push('tegenpartij');if(!e.reference.trim())issues.push('bronreferentie');
 if(e.netCents==null)issues.push('bedrag exclusief btw');if(e.vatCents==null)issues.push('btw volgens bron');if(e.vatCents>0&&e.deductibleVatCents==null)issues.push('aftrekbaar deel');if(e.grossCents==null)issues.push('brutobedrag');
 if(!e.documentIds.length&&!e.evidenceNote.trim())issues.push('bewijs');return issues;
}
export function saveBusinessExpense(state,e,expected,{adopting=false,confirmed=false,allowCostChange=false,allowSimilar=false,changeReason='',today}={}){
 const rows=state.businessExpenses||[],old=rows.find(row=>row.id===e.id);
 if(old&&content(old)===content(e)){validateBusinessExpenses(state);return {alreadySaved:true};}
 if(expenseEditBasis(state,e.id,e.target)!==expected)fail('De uitgave, order of inkoopbestelling is intussen gewijzigd. Je invoer blijft staan; open de actuele gegevens opnieuw.');
 if(old&&!same(old.target,e.target))fail('Verplaatsen van een bestaande uitgave vraagt een afzonderlijke gecontroleerde correctie.','source');
 validateExpense(state,e);
 if(today&&(e.payments.some(p=>p.date>today)||e.paidVatDate>today))fail('Registreer alleen werkelijk betaalde bedragen, uiterlijk vandaag.','payments');
 if(e.grossCents!=null&&expensePaid(e)>e.grossCents&&!confirmed)fail('Bevestig dat de betalingen kloppen; er is meer betaald dan het brutobedrag.','confirmExpense');
 const duplicates=possibleExpenseDuplicates(state,e);if(duplicates.length&&!allowSimilar)fail('Er bestaat mogelijk al dezelfde uitgave. Controleer die eerst en bevestig alleen een werkelijk afzonderlijke uitgave.','confirmSimilar');
 const supplierPaymentDuplicate=e.payments.some(payment=>payment.reference.trim()&&(state.purchases||[]).some(p=>e.counterparty.trim()&&p.supplier?.trim().toLowerCase()===e.counterparty.trim().toLowerCase()&&supplierInvoices(p).some(invoice=>(invoice.payments||[]).some(other=>other.amount===payment.amount&&other.date===payment.date&&other.reference?.trim().toLowerCase()===payment.reference.trim().toLowerCase()))));
 if(supplierPaymentDuplicate)fail('Dit betaalbedrag, deze datum en referentie staan al bij een leveranciersbetaling. Registreer hetzelfde bankbedrag niet opnieuw.','payments');
 if((state.supplierInvoiceImports||[]).some(r=>/^kunststofbaas(?:\.nl)?(?:\s+b\.?v\.?)?$/i.test(e.counterparty.trim())&&r.data.reference.trim().toLowerCase()===e.reference.trim().toLowerCase()))fail('Dit document staat al bij ingelezen Kunststofbaas-facturen. Werk die bron bij; voeg geen tweede uitgave toe.','reference');
 if(e.reference.trim()&&e.counterparty.trim()&&(state.purchases||[]).some(p=>p.supplier?.trim().toLowerCase()===e.counterparty.trim().toLowerCase()&&supplierInvoices(p).some(inv=>inv.reference?.trim().toLowerCase()===e.reference.trim().toLowerCase())))fail('Dit document staat al bij Inkoop. Werk het daar bij; voeg geen tweede kostenpost toe.','reference');
 if(e.target.kind!=='general'){
  const owner=expenseOwner(state,e.target),cost=expenseCost(e);
  const claimed=rows.some(row=>row.id!==e.id&&expenseSourceKey(row.target)===expenseSourceKey(e.target));if(claimed)fail('Deze kostenbron is al gekoppeld. Open die uitgave.','source');
  const existing=e.target.slot==='named'?owner.namedCosts?.find(row=>row.id===e.target.costId):null;
  const current=expenseSourceValue(state,e.target);
  if(!old&&(adopting||e.target.slot!=='named')){
   if(!confirmed)fail('Bevestig de koppeling aan de bestaande kosten.','confirmExpense');
   if(current!=null&&cost==null)fail('Deze kosten zijn al bekend. Vul netto/btw/aftrek aan voordat je de bestaande kostprijs koppelt.','netCents');
  }else if(!old&&existing)fail('Deze kostenregel bestaat al. Kies de bestaande bron.','source');
  if(current!=null&&current!==cost&&!allowCostChange)fail('Dit vervangt de bestaande kostprijs bij het dossier. Controleer en bevestig die wijziging apart.','confirmCostChange');
  if(e.target.slot==='named'){
   owner.namedCosts??=[];const value={...(existing||{}),id:e.target.costId,label:e.label,amount:cost,businessExpenseId:e.id};
   if(existing)Object.assign(existing,value);else owner.namedCosts.push(value);
  }else owner[e.target.slot]=cost;
 }
 if(old){
  if(!changeReason.trim()||changeReason.length>2000)fail('Leg de reden voor deze wijziging vast.','changeReason');
  if((old.history||[]).length>=100)fail('De bewaargrens van 100 wijzigingen is bereikt. Maak een afzonderlijke gecontroleerde correctie.');
  const before=structuredClone(old);delete before.history;
  e={...e,history:[...(old.history||[]),{at:e.updatedAt,reason:changeReason.trim(),before}]};
  rows[rows.indexOf(old)]=structuredClone(e);
 }else {if(rows.length>=1000)fail('Maximaal 1000 kostenregistraties.');rows.push({...structuredClone(e),history:[]});}
 state.businessExpenses=rows;validateBusinessExpenses(state);return {alreadySaved:false};
}
export function expenseSourceChoices(state,expenseId){
 const choices=[{target:{kind:'general',ownerId:'',slot:'',costId:''},label:'Algemene bedrijfskosten · geen klantorder',adopting:false}];
 const used=new Set((state.businessExpenses||[]).filter(e=>e.id!==expenseId).map(e=>expenseSourceKey(e.target)));
 for(const kind of ['order','purchase'])for(const owner of kind==='order'?state.orders:state.purchases||[]){
  const client=kind==='order'?state.customers.find(c=>c.id===owner.customerId):null;
  const title=kind==='order'?(client?.company||'Klant onbekend')+' · #'+(owner.sourceNumber||owner.number):owner.name+' · '+(owner.supplier||'Leverancier onbekend');
  choices.push({target:{kind,ownerId:owner.id,slot:'named',costId:expenseId},label:title+' · nieuwe extra kosten',adopting:false});
  for(const slot of fixed[kind]){
   if(slot==='dutyAmount'&&owner.dutyMode==='calculate')continue;
   choices.push({target:{kind,ownerId:owner.id,slot,costId:''},label:title+' · '+({shippingActual:'eigen verzend-/bezorgkosten',extraCosts:'overige vaste kosten',freight:'transport leverancier',dutyAmount:'werkelijke invoerrechten'})[slot],adopting:owner[slot]!=null});
  }
  for(const row of (owner.namedCosts||[]).filter(c=>!c.supplierInvoiceImportId))choices.push({target:{kind,ownerId:owner.id,slot:'named',costId:row.id},label:title+' · bestaande kosten: '+row.label,adopting:true});
 }
 return choices.filter((row,index)=>!used.has(expenseSourceKey(row.target))&&!choices.slice(0,index).some(other=>expenseSourceKey(other.target)===expenseSourceKey(row.target)));
}
export function expenseReferencesDocument(state,id){return (state.businessExpenses||[]).some(e=>e.documentIds.includes(id)||(e.history||[]).some(h=>h.before.documentIds.includes(id)));}
