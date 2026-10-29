import {documentVersion,documentSeriesKey} from './document-revisions.js?v=feedback29-batch3-followup';
// Preparation ledger: actual source amounts, explicit classification, no filing API.
import {supplierInvoices} from './supplier-invoices.js';
export const vatBoxes=[['1a','Binnenland · hoog'],['1b','Binnenland · laag'],['1c','Bijzonder forfait / overige tarieven · geen buitenlandse btw'],['1d','Privégebruik'],['1e','Binnenland · 0% / niet bij jou belast'],['2a','Binnenlandse inkoop · btw naar jou verlegd'],['3a','Uitvoer buiten EU'],['3b','Leveringen/diensten binnen EU'],['3c','Installatie / afstandsverkopen binnen EU'],['4a','Inkoop buiten EU / invoer met artikel 23'],['4b','Inkoop binnen EU'],['5b','Nederlandse voorbelasting / betaalde invoer-btw'],['outside','Buiten deze Nederlandse aangifte']];
const output=new Set(['1a','1b','1c','1d','2a','4a','4b']),input=new Set(['2a','4a','4b','5b']),zero=new Set(['1e','3a','3b','3c']);
const err=message=>{throw Object.assign(Error(message),{status:400});},clone=v=>structuredClone(v),money=v=>Number.isSafeInteger(v)&&v>=0&&v<=1e12;
export const vatFingerprint=value=>JSON.stringify(value??null);
export const vatDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function vatQuarter(date){return vatDate(date)?date.slice(0,4)+'-Q'+Math.ceil(Number(date.slice(5,7))/3):'';}
export function vatSettings(state){return {regime:'unknown',administration:'separate',taxpayer:'',taxNumber:'',article23:'unknown',...(state.vatLedger?.settings||{})};}
function invoiceSeed(payload){
 if(!payload||!Array.isArray(payload.items)||!payload.items.length||!Number.isFinite(payload.vat)||payload.vat<0||payload.vat>100)return null;
 if(payload.packagePrice==null&&payload.items.some(i=>!Number.isSafeInteger(i.price)||i.price<0||!Number.isSafeInteger(i.quantity)||i.quantity<1))return null;
 const base=payload.packagePrice??payload.items.reduce((n,i)=>n+i.price*i.quantity,0),net=base+(payload.shippingCharge??0),tax=Math.round(net*payload.vat/100);
 if(!money(net)||!money(tax))return null;
 const box=payload.vat===21?'1a':payload.vat===9?'1b':'';
 return {rate:payload.vat,grossCents:net+tax,lines:[{box,baseCents:net,vatCents:tax,deductCents:0}]};
}
export function vatSources(state){
 const sources=[],groups=new Map();
 const supplierFiles=new Map();
 for(const p of state.purchases||[])for(const invoice of supplierInvoices(p)){
  const files=state.documents.filter(d=>d.ownerId===p.id&&d.invoiceId===invoice.id&&!d.vatEvidence&&!d.generated);
  for(const file of files)supplierFiles.set(file.id,{p,invoice});
 }
 for(const doc of state.documents){
  if(doc.vatEvidence)continue;
  // The uploaded original and its supplier record are one source. Preserve old
  // file-key bookings as aliases until the user explicitly corrects them.
  if(supplierFiles.has(doc.id)&&!(state.vatLedger?.entries||[]).some(e=>e.status!=='void'&&e.sourceKey==='file:'+doc.id))continue;
  if(doc.generated?.kind==='invoice'){
   const g=doc.generated,key='invoice:'+doc.ownerId+':'+g.number,row=groups.get(key)||[];row.push(doc);groups.set(key,row);
  }else if(doc.supplierDocument?.kind==='invoice'){const source=doc.supplierDocument;sources.push({key:'file:'+doc.id,kind:'uploaded',label:'Leveranciersfactuur · '+doc.name,documentNumber:source.reference||'',counterparty:source.supplier||'',date:vatDate(source.date)?source.date:'',orderId:doc.ownerId,documentIds:[doc.id],signature:vatFingerprint([doc.id,doc.ownerId,doc.name,doc.size,source]),seed:null});
  }else if(doc.category==='invoice'&&!doc.generated){sources.push({key:'file:'+doc.id,kind:'uploaded',label:doc.name,documentNumber:'',date:vatDate(doc.date)?doc.date:'',documentIds:[doc.id],signature:vatFingerprint([doc.id,doc.ownerId,doc.name,doc.size,doc.date]),seed:null});}
 }
 for(const [key,allDocs] of groups){
  let docs=allDocs;
  const latest=new Map();for(const file of docs){const key=documentSeriesKey(file);latest.set(key,Math.max(latest.get(key)||0,documentVersion(file)));}docs=docs.filter(file=>documentVersion(file)===latest.get(documentSeriesKey(file)));
  docs.sort((a,b)=>a.id.localeCompare(b.id));const doc=docs[0],g=doc.generated,p=g.payload,order=state.orders.find(o=>o.id===doc.ownerId),customer=state.customers.find(c=>c.id===order?.customerId),seed=invoiceSeed(p);
  const conflict=new Set(docs.map(d=>vatFingerprint([d.generated.generationId,d.generated.payload,d.generated.vatReason??null,d.date]))).size!==1;
  sources.push({key,kind:'invoice',label:g.number,documentNumber:g.number,date:vatDate(doc.date)?doc.date:'',orderId:order?.id||'',counterparty:p?.fields?.billing_company||customer?.company||'',counterpartyVat:customer?.vatNumber||'',documentIds:docs.map(d=>d.id),signature:vatFingerprint(docs.map(d=>[d.id,d.generated,d.date,d.size])),seed,hardIssue:conflict,issue:conflict?'Twee verschillende factuurbronnen met hetzelfde nummer.':!seed?'Factuurbedragen ontbreken in de bewaarde bron.':''});
 }
 for(const p of state.purchases||[])for(const invoice of supplierInvoices(p))if(invoice.kind==='invoice'){
  const files=state.documents.filter(d=>supplierFiles.get(d.id)?.p.id===p.id&&supplierFiles.get(d.id)?.invoice.id===invoice.id),aliases=files.filter(d=>(state.vatLedger?.entries||[]).some(e=>e.status!=='void'&&e.sourceKey==='file:'+d.id));
  sources.push({key:'supplier:'+p.id+':'+invoice.id,kind:'supplier',label:(p.supplier||p.name)+' · '+invoice.reference,documentNumber:invoice.reference||'',counterparty:p.supplier||p.name,date:vatDate(invoice.date)?invoice.date:'',purchaseId:p.id,documentIds:files.map(d=>d.id),signature:vatFingerprint([p.id,p.supplier,invoice.id,invoice.reference,invoice.date,invoice.total,invoice.kind,invoice.currency||'']),seed:null,aliases:aliases.map(d=>'file:'+d.id),issue:aliases.length?'Dit document heeft al een boeking via het bronbestand. Gebruik die bestaande boeking; voeg geen tweede toe.':''});
 }
 for(const receipt of state.payments)sources.push({key:'receipt:'+receipt.id,kind:'receipt',label:'Ontvangst '+(receipt.reference||receipt.id),date:receipt.date,orderId:receipt.orderId,documentNumber:receipt.reference||receipt.id,documentIds:[],grossCents:receipt.amount,signature:vatFingerprint(receipt),seed:null});
 for(const source of sources)if(source.kind==='uploaded'){
  const linked=supplierFiles.get(source.key.slice(5));if(!linked)continue;
  source.purchaseId=linked.p.id;
  if(linked.invoice.kind==='offer'){source.hardIssue=true;source.issue='Dit bestand hoort bij een leveranciersofferte / pro forma, geen definitieve factuur. Controleer de bestaande boeking.';}
 }
 return sources;
}
export function validateVatLedger(ledger){
 if(ledger===undefined)return;
 if(!ledger||ledger.version!==1||!Array.isArray(ledger.entries)||!Array.isArray(ledger.preparations)||ledger.entries.length>20000||ledger.preparations.length>1000)err('Ongeldig btw-register.');
 const s=vatSettings({vatLedger:ledger});if(!['unknown','invoice','cash'].includes(s.regime)||!['unknown','separate','shared'].includes(s.administration)||!['unknown','yes','no'].includes(s.article23)||typeof s.taxpayer!=='string'||s.taxpayer.length>160||typeof s.taxNumber!=='string'||s.taxNumber.length>40)err('Ongeldige btw-instellingen.');
 const ids=new Set(),keys=new Set(),identities=new Set();let absoluteCents=0;
 for(const e of ledger.entries){
  if(!e||typeof e.id!=='string'||!/^[a-zA-Z0-9._-]{1,160}$/.test(e.id)||ids.has(e.id))err('Ongeldige/dubbele btw-boeking.');ids.add(e.id);
  if(!['draft','reviewed','void'].includes(e.status)||!Number.isSafeInteger(e.revision)||e.revision<1||!['sale','cash_sale','purchase','import','adjustment'].includes(e.kind)||typeof e.credit!=='boolean'||typeof e.sourceKey!=='string'||!e.sourceKey||e.sourceKey.length>400)err('Ongeldige btw-boeking.');
  if(e.status!=='void'){if(keys.has(e.sourceKey))err('Een bron is al in het btw-register opgenomen.');keys.add(e.sourceKey);if(e.documentNumber?.trim()&&e.counterparty?.trim()&&e.kind!=='cash_sale'&&!e.duplicateOf){const identity=JSON.stringify([e.documentNumber.trim().toLowerCase(),e.counterparty.trim().toLowerCase(),e.invoiceDate?.slice(0,4),e.credit]);if(identities.has(identity))err('Dit documentnummer is voor deze tegenpartij en dit jaar al geboekt. Gebruik één boeking met meerdere btw-regels.');identities.add(identity);}}
  for(const key of ['documentNumber','counterparty','counterpartyVat','country','invoiceDate','receivedDate','taxDate','periodReason','creditOf','note','evidenceNote'])if(typeof e[key]!=='string'||e[key].length>(['note','evidenceNote','periodReason'].includes(key)?2000:200))err('Ongeldige btw-tekst.');
  if(e.currency!=='EUR'||!Array.isArray(e.documentIds)||e.documentIds.length>20||e.documentIds.some(id=>typeof id!=='string'||!/^[a-zA-Z0-9._-]{1,160}$/.test(id))||!Array.isArray(e.lines)||e.lines.length>20||typeof e.checks!=='object'||!e.checks||Array.isArray(e.checks))err('Controleer bewijs en btw-regels.');
  if(e.duplicateOf!==undefined&&(typeof e.duplicateOf!=='string'||e.duplicateOf.length>160))err('Ongeldige verwijzing naar dubbele bron.');
  if(e.purchaseId!==undefined&&(typeof e.purchaseId!=='string'||e.purchaseId!==''&&!/^[a-zA-Z0-9._-]{1,160}$/.test(e.purchaseId)))err('Ongeldige zending bij btw-boeking.');
  if(e.paidVat!==undefined){const p=e.paidVat;if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!['amountCents','date','reference'].includes(k))||!money(p.amountCents)||typeof p.date!=='string'||p.date!==''&&!vatDate(p.date)||typeof p.reference!=='string'||p.reference.length>200)err('Controleer de werkelijk betaalde btw en het betaalbewijs.');}
  if(Object.values(e.checks).some(value=>typeof value!=='boolean')||typeof e.sourceSignature!=='string'||e.sourceSignature.length>2000000)err('Ongeldige broncontrole.');
  for(const l of e.lines)if(!l||!vatBoxes.some(([box])=>box===l.box)&&l.box!==''||!money(l.baseCents)||!money(l.vatCents)||!money(l.deductCents)||l.deductCents>l.vatCents)err('Controleer de btw-bedragen in centen.');
  for(const line of e.lines){absoluteCents+=line.baseCents+line.vatCents+line.deductCents;if(!Number.isSafeInteger(absoluteCents))err('Het btw-register overschrijdt de veilige rekengrens.');}
  if(!Array.isArray(e.history)||e.history.length>100)err('Ongeldige btw-historie.');
 }
 const preparations=new Set();for(const p of ledger.preparations){
  if(!p||typeof p.id!=='string'||!/^[a-zA-Z0-9._-]{1,160}$/.test(p.id)||preparations.has(p.id)||!/^\d{4}-Q[1-4]$/.test(p.period)||typeof p.basis!=='string'||!Array.isArray(p.entries)||!Number.isFinite(Date.parse(p.createdAt))||!p.summary)err('Ongeldige bewaarde btw-voorbereiding.');preparations.add(p.id);
  if(!p.settings||!['invoice','cash'].includes(p.settings.regime)||!['shared','separate'].includes(p.settings.administration)||!p.settings.taxpayer?.trim()||!p.settings.taxNumber?.trim())err('Bewaarde voorbereiding mist de bevestigde administratie-inrichting.');
  validateVatLedger({version:1,settings:p.settings,entries:p.entries,preparations:[]});
  if(p.entries.some(e=>e.status!=='reviewed'||vatQuarter(e.taxDate)!==p.period))err('Ongeldige boeking in bewaarde voorbereiding.');
  const expected=vatSummary(p.entries),actual=p.summary;if(actual.dueCents!==expected.dueCents||actual.deductCents!==expected.deductCents||actual.balanceCents!==expected.balanceCents||actual.includedCount!==expected.includedCount||vatBoxes.some(([box])=>['baseCents','vatCents','deductCents'].some(key=>actual.boxes?.[box]?.[key]!==expected.boxes[box][key])))err('Bewaarde btw-totalen sluiten niet aan op de bronboekingen.');
 }

}
export function vatEntryIssues(entry,state,sources=vatSources(state)){
 const issues=[],s=vatSettings(state),source=sources.find(row=>row.key===entry.sourceKey);
 if(entry.purchaseId&&!state.purchases?.some(p=>p.id===entry.purchaseId))issues.push('De gekoppelde zending ontbreekt.');
 if(entry.purchaseId&&source?.purchaseId&&entry.purchaseId!==source.purchaseId)issues.push('De btw-bron hoort bij een andere zending.');
 if(entry.paidVat){
  if(!['purchase','import'].includes(entry.kind))issues.push('Betaalde inkoop-btw hoort bij een inkoopfactuur of invoerbewijs.');
  if(entry.paidVat.amountCents>0){
   if(!vatDate(entry.paidVat.date))issues.push('Betaaldatum van de btw ontbreekt.');
   if(!entry.paidVat.reference.trim())issues.push('Vul een referentie naar het btw-betaalbewijs in.');
   if(entry.duplicateOf||entry.credit)issues.push('Een kopie of credit is geen extra btw-betaling.');
   if(entry.paidVat.amountCents>entry.lines.reduce((n,l)=>n+l.vatCents,0))issues.push('De betaalde btw is hoger dan de btw volgens de bronregels.');
  }
 }
 if(!entry.documentNumber.trim())issues.push('Documentnummer / bronreferentie ontbreekt.');
 if(!entry.counterparty.trim())issues.push('Tegenpartij ontbreekt.');
 if(!vatDate(entry.invoiceDate)||!vatDate(entry.taxDate))issues.push('Bron- of btw-datum ontbreekt/is ongeldig.');
 if(entry.taxDate!==entry.invoiceDate&&!entry.periodReason.trim())issues.push('Leg uit waarom de btw-datum afwijkt van de brondatum.');
 if(['purchase','import'].includes(entry.kind)&&!vatDate(entry.receivedDate))issues.push('Datum waarop het bewijs is ontvangen ontbreekt.');
 if(['purchase','import'].includes(entry.kind)&&vatDate(entry.receivedDate)&&vatQuarter(entry.taxDate)<vatQuarter(entry.receivedDate))issues.push('Controleer aftrekperiode: bewijs is pas later ontvangen.');
 if(entry.credit&&!entry.creditOf.trim())issues.push('Verwijzing naar de oorspronkelijke factuur ontbreekt.');
 if(!entry.documentIds.some(id=>state.documents.some(d=>d.id===id))&&!entry.evidenceNote.trim())issues.push('Koppel een bronbestand of vul een controleerbare externe bewijsverwijzing in.');
 if(entry.documentIds.some(id=>!state.documents.some(d=>d.id===id)))issues.push('Een gekoppeld bronbestand ontbreekt.');
 if(!entry.checks.source)issues.push('Bron, bedragen en documentstatus nog niet bevestigd.');
 if(!entry.checks.period)issues.push('Btw-moment/tijdvak nog niet bevestigd.');
 if(!entry.lines.length||entry.lines.some(l=>!l.box))issues.push('Kies een rubriek voor elke btw-regel.');
 if(source?.hardIssue)issues.push(source.issue);
 if(source&&source.signature!==entry.sourceSignature)issues.push('De bron is gewijzigd sinds deze boeking. Open en controleer opnieuw.');
 if(!source&&!entry.sourceKey.startsWith('manual:'))issues.push('De oorspronkelijke CRM-bron ontbreekt.');
 if(s.regime==='unknown')issues.push('Btw-stelsel is nog niet ingesteld.');
 if(s.regime==='cash'&&entry.kind==='sale')issues.push('Bij kasstelsel: boek de daadwerkelijke ontvangst, niet daarnaast de verkoopfactuur.');
 if(s.regime==='invoice'&&entry.kind==='cash_sale'&&!entry.periodReason.trim())issues.push('Leg uit waarom deze ontvangst afzonderlijk btw verschuldigd maakt (bijvoorbeeld vrijwillige vooruitbetaling) en voorkom dubbeltelling met de factuur.');
 if(entry.duplicateOf){const original=state.vatLedger?.entries.find(e=>e.id===entry.duplicateOf);if(!original||original.id===entry.id||original.status!=='reviewed'||original.duplicateOf||vatEntryIssues(original,state,sources).length)issues.push('Kopie moet verwijzen naar een geldige, gecontroleerde oorspronkelijke boeking.');if(original&&(original.documentNumber.trim().toLowerCase()!==entry.documentNumber.trim().toLowerCase()||original.counterparty.trim().toLowerCase()!==entry.counterparty.trim().toLowerCase()))issues.push('Een kopie moet hetzelfde documentnummer en dezelfde tegenpartij hebben als de oorspronkelijke boeking.');if(entry.lines.some(l=>l.box!=='outside'||l.baseCents||l.vatCents||l.deductCents)||!entry.note.trim())issues.push('Een kopieboeking moet nul bedragen buiten aangifte bevatten en een toelichting hebben.');}
 const has=box=>entry.lines.some(l=>l.box===box);
 for(const l of entry.lines){
  if(zero.has(l.box)&&(l.vatCents||l.deductCents))issues.push('Rubriek '+l.box+' hoort zonder btw-bedrag.');
  if(!input.has(l.box)&&l.deductCents)issues.push('Aftrek is alleen mogelijk bij inkoop-/invoerregels.');
  if(['sale','cash_sale'].includes(entry.kind)&&input.has(l.box))issues.push('Een verkoopboeking mag geen voorbelasting bevatten.');
  if(['purchase','import'].includes(entry.kind)&&['1a','1b','1c','1e','3a','3b','3c'].includes(l.box))issues.push('Een inkoopboeking bevat een verkooprubriek.');
  if(l.deductCents&&!entry.checks.deduction)issues.push('Aftrekbaarheid/zakelijk gebruik is nog niet bevestigd.');
  if(l.box==='outside'&&l.deductCents)issues.push('Buitenlandse btw is geen Nederlandse voorbelasting.');
 }
 if(has('3b')&&(!entry.counterpartyVat.trim()||!entry.checks.euVat||!entry.checks.euEvidence||!entry.checks.icp))issues.push('EU-levering: btw-ID, geldigheid, leverings-/dienstbewijs en ICP-controle ontbreken.');
 if(has('3a')&&!entry.checks.export)issues.push('Uitvoerbewijs nog niet bevestigd.');
 if(has('3c')&&!entry.checks.foreign)issues.push('Controle van buitenlandse/OSS-aangifte ontbreekt.');
 if(entry.kind==='import'&&!entry.checks.importer)issues.push('Controleer of het invoerbewijs op naam van deze ondernemer staat.');
 if(entry.kind==='import'&&has('4a')&&(s.article23!=='yes'||!entry.checks.article23))issues.push('Invoer via artikel 23 vraagt een bevestigde vergunning en passend invoerbewijs.');
 if(source?.kind==='receipt'){
  if(entry.kind!=='cash_sale')issues.push('Koppel een ontvangst alleen als ontvangst-/vooruitbetalingsboeking.');
  const gross=entry.lines.reduce((n,l)=>n+l.baseCents+l.vatCents,0);if(entry.credit||gross!==source.grossCents)issues.push('De splitsing sluit niet aan op de werkelijk geregistreerde ontvangst.');
 }
 if(source?.kind==='invoice'&&source.seed){if([21,9].includes(source.seed.rate)&&entry.lines.some(l=>l.box==='1a'&&source.seed.rate!==21||l.box==='1b'&&source.seed.rate!==9))issues.push('De gekozen tariefrubriek past niet bij het percentage op de bewaarde factuur.');const base=entry.lines.reduce((n,l)=>n+l.baseCents,0),tax=entry.lines.reduce((n,l)=>n+l.vatCents,0),original=source.seed.lines[0];if(entry.credit||base!==original.baseCents||tax!==original.vatCents)issues.push('Grondslag en btw sluiten niet afzonderlijk aan op de bewaarde factuur.');}
 if(entry.kind==='adjustment'&&!entry.note.trim())issues.push('Een correctie/privégebruik vraagt een onderbouwde toelichting.');
 if(entry.lines.every(l=>l.box==='outside')&&!entry.note.trim())issues.push('Licht toe waarom deze bron buiten de Nederlandse aangifte valt.');
 return [...new Set(issues)];
}
export function saveVatEntry(state,entry,expected,{review=false,changeReason='',now=new Date().toISOString()}={}){
 const ledger=state.vatLedger||{version:1,settings:vatSettings(state),entries:[],preparations:[]};
 const old=ledger.entries.find(e=>e.id===entry.id);if(vatFingerprint(old)!==expected)err('Deze btw-boeking is intussen gewijzigd. Open haar opnieuw.');
 const source=vatSources(state).find(s=>s.key===entry.sourceKey);
 if(entry.purchaseId&&!state.purchases?.some(p=>p.id===entry.purchaseId))err('Deze zending bestaat niet meer. Je invoer blijft staan.');
 if(source?.purchaseId&&entry.purchaseId&&source.purchaseId!==entry.purchaseId)err('De bron hoort bij een andere zending.');
 if(!old&&source?.aliases?.length)err('Dit leveranciersdocument heeft al een boeking via een bestand. Open die bestaande boeking.');
 if(old?.history.length>=100)err('Het maximum van 100 revisies is bereikt. Bewaar een afzonderlijke correctie met bronverwijzing.');
 const next={...clone(entry),revision:(old?.revision||0)+1,status:review?'reviewed':'draft',updatedAt:now,reviewedAt:review?now:'',history:[...(old?.history||[]),...(old?[{at:now,previous:{...clone(old),history:undefined},reason:changeReason||entry.note}]:[])]};
 if(old?.status==='reviewed'&&!String(changeReason).trim())err('Geef bij wijziging van een gecontroleerde boeking een toelichting.');
 if(String(changeReason).length>2000)err('Gebruik maximaal 2000 tekens voor de wijzigingsreden.');
 const proposed={...state,vatLedger:{...ledger,entries:ledger.entries.filter(e=>e.id!==next.id).concat(next)}};validateVatLedger(proposed.vatLedger);
 if(review){const issues=vatEntryIssues(next,proposed);if(issues.length)err(issues.join('\n'));}
 state.vatLedger=proposed.vatLedger;return next;
}
function vatSummary(entries){
 const boxes=Object.fromEntries(vatBoxes.map(([box])=>[box,{baseCents:0,vatCents:0,deductCents:0}]));
 for(const entry of entries)for(const line of entry.lines){const row=boxes[line.box],sign=entry.credit?-1:1;if(!row)err('Kies een geldige btw-rubriek.');for(const key of ['baseCents','vatCents','deductCents']){row[key]+=sign*line[key];if(!Number.isSafeInteger(row[key]))err('Onveilig groot btw-totaal.');}}
 const due=[...output].reduce((n,box)=>n+boxes[box].vatCents,0),deduct=[...input].reduce((n,box)=>n+boxes[box].deductCents,0);if(!Number.isSafeInteger(due)||!Number.isSafeInteger(deduct)||!Number.isSafeInteger(due-deduct))err('Onveilig groot btw-totaal.');
 return {boxes,dueCents:due,deductCents:deduct,balanceCents:due-deduct,includedCount:entries.length};
}
export function vatPeriodReport(state,period){
 if(!/^\d{4}-Q[1-4]$/.test(period))err('Kies een geldig kwartaal.');
 const sources=vatSources(state),settings=vatSettings(state),entries=(state.vatLedger?.entries||[]).filter(e=>e.status!=='void'&&vatQuarter(e.taxDate)===period),issues=[];
 if(settings.regime==='unknown')issues.push('Btw-stelsel ontbreekt.');if(settings.administration==='unknown')issues.push('Aangiftegrens met andere bedrijfsprofielen nog niet vastgesteld.');if(!settings.taxpayer.trim()||!settings.taxNumber.trim())issues.push('Naam ondernemer en btw-nummer ontbreken.');
 const included=[];for(const entry of entries){const problems=vatEntryIssues(entry,state,sources);if(entry.status!=='reviewed')problems.push('Nog niet gecontroleerd.');if(problems.length){issues.push(...problems.map(message=>entry.documentNumber+': '+message));continue;}included.push(entry);}
 const represented=new Set((state.vatLedger?.entries||[]).filter(e=>e.status==='reviewed'&&!vatEntryIssues(e,state,sources).length).map(e=>e.sourceKey));
 const covered=s=>represented.has(s.key)||(s.aliases||[]).some(key=>represented.has(key));
 const unbooked=sources.filter(s=>vatQuarter(s.date)===period&&!covered(s)&&(settings.regime==='cash'?s.kind!=='invoice':s.kind!=='receipt'));
 const unknown=sources.filter(s=>!vatDate(s.date)&&!covered(s)&&(settings.regime==='cash'?s.kind!=='invoice':s.kind!=='receipt'));if(unknown.length)issues.push(unknown.length+' bron(nen) zonder geldige datum nog te verwerken.');
 const undated=(state.vatLedger?.entries||[]).filter(e=>e.status!=='void'&&!vatQuarter(e.taxDate));if(undated.length)issues.push(undated.length+' boeking(en) hebben nog geen geldige btw-datum; hun kwartaal is nog onbekend.');
 if(unbooked.length)issues.push(unbooked.length+' bron(nen) uit dit kwartaal nog niet verwerkt of bewust uitgesloten.');
 const summary=vatSummary(included);
 const basis=vatFingerprint({settings,entries:state.vatLedger?.entries||[],sources:sources.map(s=>[s.key,s.signature])});
 return {period,settings,entries,included,unbooked,issues:[...new Set(issues)],summary,basis};
}
export function prepareVatPeriod(state,period,expected,{id,complete=false,checked=false,now=new Date().toISOString()}={}){
 const report=vatPeriodReport(state,period);if(report.basis!==expected)err('Bronnen of boekingen zijn gewijzigd. Bekijk het kwartaal opnieuw.');
 if(report.issues.length)err('Los eerst de openstaande controles in dit kwartaal op.');if(!complete||!checked)err('Bevestig volledigheid van de btw-administratie en aansluiting met je boekhouding.');
 const preparation={id,period,createdAt:now,basis:expected,settings:clone(report.settings),summary:clone(report.summary),entries:clone(report.included),note:'Btw-voorbereiding; niet ingediend bij de Belastingdienst.'};
 const ledger={...state.vatLedger,preparations:[...state.vatLedger.preparations,preparation]};validateVatLedger(ledger);state.vatLedger=ledger;return preparation;
}

export function vatProtectedOrder(state,id){
 const docs=new Set(state.documents.filter(d=>d.ownerId===id).map(d=>d.id)),receipts=new Set([...state.payments.filter(p=>p.orderId===id).map(p=>p.id),...(state.paymentCorrections||[]).filter(c=>c.before?.orderId===id).map(c=>c.before.id)]);
 const entries=[...(state.vatLedger?.entries||[]).filter(e=>e.status!=='void'),...(state.vatLedger?.preparations||[]).flatMap(p=>p.entries||[])];
 return entries.some(e=>e.sourceKey.startsWith('invoice:'+id+':')||e.sourceKey.startsWith('receipt:')&&receipts.has(e.sourceKey.slice(8))||e.documentIds.some(docId=>docs.has(docId)));
}
