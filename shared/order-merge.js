import {vatProtectedOrder} from './vat-ledger.js?v=feedback-five-20261029';
import {correctPayment} from './payment-corrections.js?v=feedback29-batch3-followup';
import {validateBusinessState} from './state-validation.js?v=feedback29-batch1-followup';
const clone=v=>structuredClone(v),same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
const present=v=>v!==undefined&&v!==null&&v!==''&&!(Array.isArray(v)&&!v.length)&&!(v&&typeof v==='object'&&!Object.keys(v).length);
const stored=new Set(['id','number','items','provenance']);
const retained=new Set(['paymentLinks','documentDrafts','confirmationDraft','quoteDraft','emailDrafts','salesFunnel','gmailSalesPhase','statusHistory']);
const objects=new Set(['delivery','billing','vatReason','inquirySpecs','inquiryCustomer']);
const complexItem=new Set(['costSource','purchaseCostQuantity','designId','designDocumentId','designPreviewId','designVariants','designFinalVariantId','designFinalBasis','primaryImageId','costQuoteLink','costCalculation','purchaseCostTotal','calculatedCostTotal']);
const refs=['incomingEmails','emailDrafts','mailThreads','inquirySources','inquiryActivity','mailThreadLabels','mailReplyGuidance'];
const label={expectedDate:'Geplande levering',quoteAcceptedDate:'Offerte akkoord',designSentDate:'Ontwerp verstuurd',approvedDate:'Ontwerp goedgekeurd',quoteSentDate:'Offerte verstuurd',paymentRequestedDate:'Betaling gevraagd',productionReleasedDate:'Productie vrijgegeven',supplierOrderedDate:'Besteld bij leverancier',productionDate:'Productie gestart',transitDate:'Onderweg',arrivedDate:'Binnengekomen',shippedDate:'Verzonden',deliveredDate:'Geleverd',date:'Aanvraagdatum',sourceNumber:'Bestaand ordernummer',stage:'Uitvoering',quoteOutcome:'Offerte-uitkomst',vat:'Btw (%)',vatReason:'Btw-toelichting',supplier:'Leverancier',batch:'Zendingnotitie',notes:'Notities',shippingActual:'Werkelijke verzending',shippingExpected:'Verwachte verzending',extraCosts:'Overige kosten',delivery:'Afleveradres',billing:'Factuuradres',description:'Omschrijving',quantity:'Aantal',width:'Breedte (mm)',height:'Hoogte (mm)',thickness:'Dikte (mm)',material:'Materiaal',price:'Stukprijs excl. btw',cost:'Inkoopprijs',specs:'Specificaties',printColors:'Drukkleuren',packagePrice:'Producttotaal excl. btw',archived:'Gearchiveerd',shipping:'Verzendprijs klant',leadTime:'Levertijdafspraak',inquirySpecs:'Aanvraaggegevens'};
const groups={shipping:['shippingKnown','shippingCharge'],leadTime:['leadTimeMinWeeks','leadTimeMaxWeeks','leadTimeBasis','leadTimeStartDate','leadTimeDepositPercent','expectedDateFrom','expectedDateTo']};
function hasReference(value,ids){
 if(typeof value==='string')return ids.has(value);
 if(Array.isArray(value))return value.some(v=>hasReference(v,ids));
 return value&&typeof value==='object'&&Object.entries(value).some(([key,v])=>key!=='generated'&&hasReference(v,ids));
}
function records(state,source,target){return {source:state.orders.find(o=>o.id===source),target:state.orders.find(o=>o.id===target)};}
export function orderMergeIssues(state,sourceId,targetId){
 const {source,target}=records(state,sourceId,targetId),issues=[];
 if(!source||!target||source===target)return ['Kies twee verschillende bestaande orders.'];
 if(source.customerId!==target.customerId)issues.push('Samenvoegen kan alleen binnen hetzelfde klantdossier. Controleer eerst de klantkoppeling.');
 if(vatProtectedOrder(state,source.id)||vatProtectedOrder(state,target.id))issues.push('Een order heeft een btw-boeking of bewaarde btw-voorbereiding. Corrigeer die eerst via het btw-register.');
 if(source.websiteLeadId)issues.push('De bronorder is aan een websiteaanvraag gekoppeld. Kies die order als blijvend dossier; twee websiteaanvragen samenvoegen vraagt afzonderlijke controle.');
 if(source.purchaseId||target.purchaseId)issues.push('Een order is aan een gezamenlijke inkoop gekoppeld. Maak die koppeling eerst gecontroleerd los.');
 if(state.payments.some(p=>p.orderId===source.id&&(p.source==='tikkie'||String(p.externalId||'').startsWith('tikkie:'))))issues.push('Deze bronorder heeft een Tikkie-ontvangst. Kies dit dossier als de order die blijft, zodat de providerkoppeling behouden blijft.');
 for(const key of retained)if(present(source[key])&&!(typeof source[key]==='object'&&Object.values(source[key]).every(v=>!present(v))))issues.push(`De bronorder bevat ${key}. Rond die koppeling/concepten eerst af of kies dit dossier als de order die blijft.`);
 for(const key of Object.keys(source))if(source[key]&&typeof source[key]==='object'&&!stored.has(key)&&!retained.has(key)&&!objects.has(key)&&Object.keys(source[key]).length)issues.push(`De bronorder heeft een aanvullende koppeling (${key}); die kan nog niet veilig worden samengevoegd.`);
 for(const item of [...source.items,...target.items])if([...complexItem].some(k=>present(item[k])))issues.push('Een product heeft een ontwerp, afbeelding of berekende kostprijskoppeling. Die productkoppeling vraagt eerst afzonderlijke controle; samenvoegen is nu geblokkeerd.');
 for(const item of [...source.items,...target.items])if(Object.entries(item).some(([k,v])=>k!=='provenance'&&v&&typeof v==='object'&&present(v)))issues.push('Een product heeft aanvullende gestructureerde gegevens. Controleer die productkoppeling eerst.');
 const bothIds=new Set([source.id,target.id,...source.items.map(i=>i.id),...target.items.map(i=>i.id)]);
 if(hasReference(state.inventory,bothIds)||hasReference(state.purchases,bothIds))issues.push('Een van de orders/producten heeft voorraad- of inkoopverwijzingen. Controleer die administratie eerst afzonderlijk.');
 if(state.documents.some(d=>[source.id,target.id].includes(d.ownerId)&&d.supplierDocument))issues.push('Een van de dossiers bevat een gekoppelde leveranciersfactuur; controleer die financiële bron eerst.');
 const ids=new Set([source.id,...source.items.map(i=>i.id)]),skip=new Set(['orders','documents','payments','activities','orderMerges',...refs]);
 for(const doc of state.documents.filter(d=>d.ownerId!==source.id))if(hasReference(doc,ids))issues.push('Een bestand buiten de bronorder verwijst naar een bronproduct.');
 for(const other of state.orders.filter(o=>o.id!==source.id&&o.id!==target.id))if(hasReference(other,ids))issues.push('Een andere order verwijst naar de bronorder of een bronproduct.');
 for(const [key,value] of Object.entries(state)){
  if(skip.has(key))continue;
  if(key==='customers'){
   if(value.some(c=>hasReference(Object.fromEntries(Object.entries(c).filter(([k])=>k!=='shippingAddressOrderId')),ids)))issues.push('Er is een aanvullende klantkoppeling naar de bronorder.');
  }else if(hasReference(value,ids))issues.push(`Er staat nog een verwijzing in ${key}. Die moet eerst gecontroleerd worden, bijvoorbeeld voorraad, inkoop of een eerdere betaalcorrectie.`);
 }
 // Supported direct references may move; nested references are never guessed.
 for(const key of refs)for(const row of state[key]||[])if(hasReference(Object.fromEntries(Object.entries(row).filter(([k])=>!['ownerId','orderId'].includes(k))),ids))issues.push(`Er is een aanvullende verwijzing in ${key}. Die kan nog niet veilig worden verplaatst.`);
 for(const doc of state.documents.filter(d=>d.ownerId===source.id))if(doc.internalDesign||doc.designId||doc.revisionOf||doc.supplierDocument)issues.push('Een bronbestand is onderdeel van een ontwerp, revisie of leveranciersfactuur. Controleer die koppeling eerst.');
 return [...new Set(issues)];
}
export function orderMergePlan(state,sourceId,targetId,mapping){
 const issues=orderMergeIssues(state,sourceId,targetId);if(issues.length)throw Error(issues.join('\n'));
 const {source,target}=records(state,sourceId,targetId),mapped=new Set(),rows=[];
 for(const item of source.items){const to=mapping[item.id];if(to!=='new'&&!target.items.some(i=>i.id===to)||to!=='new'&&mapped.has(to))throw Error('Koppel iedere bronregel aan een andere bestaande regel, of kies Extra product.');if(to!=='new')mapped.add(to);}
 function add(key,a,b,title,fields){if(same(a,b))return;rows.push({key,title,source:a,target:b,conflict:present(a)&&present(b),suggested:present(b)?'target':'source',fields});}
 const grouped=new Set(Object.values(groups).flat());
 for(const [key,fields] of Object.entries(groups))add(key,Object.fromEntries(fields.map(k=>[k,source[k]??null])),Object.fromEntries(fields.map(k=>[k,target[k]??null])),label[key],fields);
 for(const key of new Set([...Object.keys(source),...Object.keys(target)]))if(!stored.has(key)&&!retained.has(key)&&!grouped.has(key)&&key!=='customerId')add(key,source[key],target[key],label[key]||key,[key]);
 for(const [index,item] of source.items.entries()){
  const to=mapping[item.id];if(to==='new')continue;const other=target.items.find(i=>i.id===to);
  add(`item:${index}:dimensions`,{width:item.width??null,height:item.height??null},{width:other.width??null,height:other.height??null},`Product ${index+1} · Breedte × hoogte (mm)`,['width','height']);
  for(const key of new Set([...Object.keys(item),...Object.keys(other)]))if(!['id','provenance','width','height'].includes(key))add(`item:${index}:${key}`,item[key],other[key],`Product ${index+1} · ${label[key]||key}`,[key]);
 }
 return {basis:JSON.stringify(state),sourceId,targetId,mapping:clone(mapping),rows};
}
export function applyOrderMerge(state,plan,{choices,receipts,reason,id,correctionIds,now=new Date().toISOString()}){
 if(JSON.stringify(state)!==plan.basis)throw Error('De gegevens zijn intussen gewijzigd. Er is niets samengevoegd. Open de vergelijking opnieuw met de actuele gegevens.');
 const current=orderMergePlan(state,plan.sourceId,plan.targetId,plan.mapping),{source,target}=records(state,plan.sourceId,plan.targetId),beforeSource=clone(source),beforeTarget=clone(target);
 if(!reason?.trim()||reason.trim().length<8)throw Error('Beschrijf kort waarom deze orders dezelfde bestelling zijn (minimaal 8 tekens).');
 if(!id||state.orderMerges?.some(m=>m.id===id))throw Error('Deze samenvoegregistratie bestaat al. Open de order opnieuw.');
 const beforePayments=clone(state.payments.filter(p=>[source.id,target.id].includes(p.orderId))),beforeDocuments=clone(state.documents.filter(d=>[source.id,target.id].includes(d.ownerId)));
 const next=clone(state),active=next.orders.find(o=>o.id===target.id),provenance=active.provenance??{};
 const itemMap=new Map();for(const item of source.items){const to=plan.mapping[item.id];itemMap.set(item.id,to==='new'?item.id:to);if(to==='new')active.items.push(clone(item));}
 for(const row of current.rows){
  const side=choices[row.key]||(!row.conflict?row.suggested:'');if(!['source','target'].includes(side))throw Error('Kies bij ieder verschil welke waarde klopt.');
  const match=/^item:(\d+):(.+)$/.exec(row.key),from=match?(side==='source'?source.items[Number(match[1])]:target.items.find(i=>i.id===plan.mapping[source.items[Number(match[1])].id])):(side==='source'?source:target);
  const dest=match?active.items.find(i=>i.id===plan.mapping[source.items[Number(match[1])].id]):active;
  for(const key of row.fields){if(from[key]===undefined)delete dest[key];else dest[key]=clone(from[key]);
   const p=match?(dest.provenance??={}):provenance;if(from.provenance?.[key])p[key]=clone(from.provenance[key]);else delete p[key];
  }
 }
 if(Object.keys(provenance).length)active.provenance=provenance;else delete active.provenance;
 // Keep the original provider-linked order and all file bytes/IDs. Generated
 // document payloads and sent mail contents stay immutable historical evidence.
 for(const payment of next.payments.filter(p=>[source.id,target.id].includes(p.orderId))){
  if(!['keep','duplicate'].includes(receipts[payment.id]))throw Error('Kies voor iedere ontvangst: meetellen of dubbele registratie.');
  if(payment.orderId===source.id)payment.orderId=target.id;
  if(receipts[payment.id]==='duplicate'){
   if(payment.source==='tikkie'||payment.externalId)throw Error('Een providerontvangst blijft meetellen. Corrigeer een echte providerontvangst afzonderlijk in Betalingen.');
   correctPayment(next,payment.id,JSON.stringify(payment),{kind:'remove',reason:'Dubbele order samengevoegd: '+reason.trim(),correctionId:correctionIds[payment.id]},{now});
  }
 }
 for(const doc of next.documents.filter(d=>d.ownerId===source.id)){doc.ownerId=target.id;if(doc.itemId){if(!itemMap.has(doc.itemId))throw Error('Een bestand verwijst naar een onbekende bronregel.');doc.itemId=itemMap.get(doc.itemId);}}
 for(const key of refs)for(const row of next[key]||[])for(const field of ['ownerId','orderId'])if(row[field]===source.id)row[field]=target.id;
 for(const customer of next.customers)if(customer.shippingAddressOrderId===source.id)customer.shippingAddressOrderId=target.id;
 next.orders=next.orders.filter(o=>o.id!==source.id);
 next.orderMerges??=[];next.orderMerges.push({id,sourceOrderId:source.id,targetOrderId:target.id,at:now,reason:reason.trim(),beforeSource,beforeTarget,beforePayments,beforeDocuments,mapping:clone(plan.mapping),choices:clone(choices),receipts:clone(receipts)});
 next.activities.unshift({id:id+'-activity',message:`Orders #${source.sourceNumber||source.number} en #${target.sourceNumber||target.number} samengevoegd; #${target.sourceNumber||target.number} blijft.`,time:now});
 validateBusinessState(next);Object.assign(state,next);return target.id;
}
