import {invoiceTextProposal} from './supplier-invoice-intake.js?v=supplier-batches35-20261101';
const norm=v=>String(v||'').replace(/\u00a0/g,' ').trim();
const moneyPattern=/(?:€\s*|EUR\s*)?([-−]?(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}|[-−]?\d+\.\d{2})\s*(?:EUR|€)?\s*$/i;
function money(value){const m=norm(value).match(moneyPattern);if(!m)return null;const raw=m[1].replace('−','-'),n=raw.includes(',')?Number(raw.replace(/\./g,'').replace(',','.')):Number(raw);const prefix=norm(value).slice(0,m.index),negative=/[-−]\s*$/.test(prefix),cents=Math.round((negative?-Math.abs(n):n)*100);return Number.isSafeInteger(cents)&&Math.abs(cents)<=1e12?cents:null;}
export function invoiceCostKind(description){
 if(/^(?:opstart(?:kosten)?|instel(?:kosten)?|setup(?:\s*costs?)?)(?:\b|[\s:-])/i.test(norm(description)))return 'Opstart / instellen';
 if(/^(?:cnc(?:[\s-]*(?:kosten|frezen|freeskosten|bewerking(?:en)?|werk))?|programmakosten(?:\s+cnc)?|programmeerkosten|freeskosten|bewerkingskosten)(?:\b|[\s:-])/i.test(norm(description)))return 'CNC / bewerking';
 if(/^(?:verzend(?:kosten|ing)?|transport(?:kosten)?|bezorg(?:kosten|ing)?|shipping)(?:\b|[\s:-])/i.test(norm(description)))return 'Transport / verzending';
 if(/^(?:administratie(?:kosten)?|bankkosten|verpakkingskosten|handling)(?:\b|[\s:-])/i.test(norm(description)))return 'Overige bijkomende kosten';
 return '';
}
export function assertOrdinaryInvoiceText(text,{rows=[]}={}){
 if(typeof text!=='string'||text.length>200000||!Array.isArray(rows)||rows.length>2000)throw Error('Gebruik één begrensde factuurbron.');
 const headings=[...norm(text).split(/\r?\n/).map(norm).filter(Boolean).slice(0,25),...rows.slice(0,25).map(r=>norm(r.text))];
 if(headings.some(line=>/^(?:pakbon|packing slip|creditnota|credit note|pro\s*forma|offerte|quotation)\b/i.test(line)))throw Object.assign(Error('Deze documenttitel lijkt geen gewone factuur. Gebruik een leverancierspakbon als controledocument; credit/offerte hoort niet in deze kosteninvoer.'),{code:'invoice_document_kind'});
}
// Suggestions only. No state lookup, order binding, payment or VAT deduction.
// Supplier PDFs read on 1 November: header labels may share a row, SKU and
// Product have separate columns; CNC costs are distinct non-physical rows.
export function recognizeSupplierInvoice(text,{rows=[]}={}){
 const proposal=invoiceTextProposal(text),warnings=[...proposal.warnings],calculatedFields=[];
 if(!Array.isArray(rows)||rows.length>2000)throw Error('Te veel documentregels; gebruik één factuur.');
 const plain=norm(text).split(/\r?\n/).map(norm).filter(Boolean),all=[...plain,...rows.map(r=>norm(r.text))];
 if(rows.length){const header=invoiceTextProposal(rows.map(r=>r.text).join('\n'));for(const key of ['reference','date','netCents','vatCents','grossCents']){if((proposal[key]===null||proposal[key]==='')&&header[key]!==null&&header[key]!=='')proposal[key]=header[key];else if(proposal[key]!==null&&proposal[key]!==''&&header[key]!==null&&header[key]!==''&&proposal[key]!==header[key]){proposal[key]=['reference','date'].includes(key)?'':null;warnings.push('Tegenstrijdige kopwaarde '+key+'; zelf invullen.');}}proposal.supplierOrderReferences=[...new Set([...proposal.supplierOrderReferences,...header.supplierOrderReferences])];}
 const distinct=values=>[...new Set(values)],single=values=>{const list=distinct(values.filter(v=>v!==null&&v!==''));return list.length===1?list[0]:null;};
 const amountFor=pattern=>single(all.filter(line=>pattern.test(line)).map(money));
 const gross=amountFor(/^(?:totaal(?:\s*(?:incl\.?|inclusief)\s*btw)?|total(?:\s*(?:incl\.?|including)\s*vat)?)\s*[:€]/i),vat=amountFor(/^(?:(?:btw|vat)(?:\s*\d+(?:[.,]\d+)?\s*%)?|\d+(?:[.,]\d+)?\s*%\s*(?:btw|vat))\s*[:€]/i);
 if(proposal.grossCents===null&&gross!==null&&gross>=0)proposal.grossCents=gross;
 if(proposal.vatCents===null&&vat!==null&&vat>=0)proposal.vatCents=vat;
 if(proposal.netCents===null&&proposal.grossCents!==null&&proposal.vatCents!==null&&proposal.grossCents>=proposal.vatCents){proposal.netCents=proposal.grossCents-proposal.vatCents;calculatedFields.push('netCents');warnings.push('Netto berekend uit expliciet bruto minus expliciete btw; controleer het origineel.');}
 assertOrdinaryInvoiceText(text,{rows});
 const lines=[],used=new Set(),costColumns=new Map();let header=null,page=0;
 const finish=/^(?:subtotaal|totaal|total|netto|btw|vat|te betalen|factuurnummer|factuurdatum|bankrekening|iban)\b/i;
 for(const [index,row] of rows.entries()){
  if(!row||!Array.isArray(row.parts)||typeof row.text!=='string')continue;
  if(row.page!==page){header=null;page=row.page;}
  const parts=row.parts.filter(p=>Number.isFinite(p.x)&&typeof p.text==='string'),qty=parts.find(p=>/^(?:aantal|aant\.?|qty|quantity)$/i.test(norm(p.text))),amounts=parts.filter(p=>/^(?:totaal|bedrag|total|amount|regelbedrag)$/i.test(norm(p.text))),unit=parts.find(p=>/^(?:prijs|stukprijs|unit price)$/i.test(norm(p.text))),name=parts.find(p=>/^(?:product|omschrijving|description)$/i.test(norm(p.text)));
  if(qty&&amounts.length===1){header={qtyX:qty.x,totalX:amounts[0].x,unitX:unit?.x,nameX:name?.x};costColumns.set(page,qty.x);continue;}
  if(!header)continue;
  if(finish.test(norm(row.text))){header=null;continue;}
  if(/^(?:lengte|breedte|dikte|meeteenheid)\s*:/i.test(norm(row.text))){const last=lines.at(-1);if(last&&last.kind!=='extra'&&last.description.length+row.text.length+3<=2000)last.description+=' · '+norm(row.text);continue;}
  const desc=parts.filter(p=>p.x<header.qtyX-4&&(header.nameX===undefined||p.x>=header.nameX-4)).map(p=>p.text).join(' ').trim();if(!desc)continue;
  const totalParts=parts.filter(p=>p.x>(header.totalX+(header.unitX??header.qtyX))/2).map(p=>p.text).join(' '),net=money(totalParts),kind=invoiceCostKind(desc),qtyParts=parts.filter(p=>p.x>=header.qtyX-4&&p.x<(header.qtyX+(header.unitX??header.totalX))/2).map(p=>p.text).join(' ').trim();
  if(net===null)continue;
  if(net<0){warnings.push('Negatieve regel/korting niet als positieve kosten overgenomen: verdeel de korting gecontroleerd over de bijbehorende nettoregels.');used.add(index);continue;}
  const quantity=/^\d+(?:\s*(?:stuks?|pcs|st\.))?$/i.test(qtyParts)?Number(qtyParts.match(/^\d+/)[0]):null;
  lines.push({id:'suggested-'+(lines.length+1),description:desc,quantity:kind?1:quantity,netCents:net,kind:kind?'extra':'',orderId:'',itemId:''});used.add(index);
 }
 // Explicit standalone extra-cost lines can occur below the product table.
 // Require one money token; unit price/line total ambiguity stays manual.
 for(const [index,row] of rows.entries()){
  if(used.has(index))continue;let costText=norm(row.text);if(!invoiceCostKind(costText)){const start=row.parts?.findIndex(p=>p.x>=(costColumns.get(row.page)??Infinity)-10&&invoiceCostKind(p.text))??-1;if(start<0)continue;costText=row.parts.slice(start).map(p=>p.text).join(' ');}if(!invoiceCostKind(costText))continue;
  const m=norm(costText).match(moneyPattern);if(!m)continue;
  const description=norm(costText).slice(0,m.index).replace(/[\s:€]+$/,'').trim();if(!description||/\d+[.,]\d{2}/.test(description))continue;
  const net=money(costText);if(net===null||net<0){warnings.push('Negatieve bijkomende kosten niet automatisch verwerkt.');continue;}
  lines.push({id:'suggested-'+(lines.length+1),description,quantity:1,netCents:net,kind:'extra',orderId:'',itemId:''});
 }
 if(!rows.length)for(const line of plain){if(!invoiceCostKind(line))continue;const m=line.match(moneyPattern);if(!m)continue;const description=line.slice(0,m.index).replace(/[\s:€]+$/,'').trim();if(!description||/\d+[.,]\d{2}/.test(description))continue;const net=money(line);if(net!==null&&net>=0)lines.push({id:'suggested-'+(lines.length+1),description,quantity:1,netCents:net,kind:'extra',orderId:'',itemId:''});}
 if(lines.length>100)throw Error('Meer dan 100 voorstelregels; gebruik één afzonderlijke factuur of voer zelf de regels in.');
 if(!lines.length)warnings.push('Geen eenduidige producttabel gelezen; vul regels zelf in of gebruik de bestaande AI-prompt.');
 if(lines.some(l=>l.kind===''))warnings.push('Productregels zelf aan een product koppelen en fysieke aantallen controleren.');
 if(lines.some(l=>l.kind==='extra'))warnings.push('CNC/opstart/verzending zijn aparte kostenvoorstellen, geen extra fysieke productstuks. Controleer of bedragen netto en al in andere regels inbegrepen zijn.');
 if(proposal.netCents!==null&&lines.reduce((n,l)=>n+l.netCents,0)!==proposal.netCents)warnings.push('De voorgestelde regels sluiten nog niet aan op netto; niets opslaan voordat de som klopt.');
 return {...proposal,deductibleVatCents:null,lines,calculatedFields,warnings:distinct(warnings)};
}
