import {invoiceLineDimensions} from './supplier-invoice-proposal.js?v=packs-workflow-20261102';
import {invoiceCostKind} from './supplier-invoice-recognition.js';
const norm=value=>String(value||'').trim().toLowerCase().replace(/^#/,'');
const count=lines=>{
 const products=(lines||[]).filter(line=>line.kind!=='extra'&&!invoiceCostKind(line.description));
 return products.length&&products.every(line=>Number.isSafeInteger(line.quantity)&&line.quantity>0)?products.reduce((sum,line)=>sum+line.quantity,0):null;
};
// Compare the opened dossier with facts from the current original PDF. Editable
// suggestions never replace these source facts; invoice and order IDs differ.
export function compareSupplierInvoice(state,data,{orderId='',source=null,excludeId=''}={}){
 const rows=[],order=state.orders.find(order=>order.id===orderId),add=(level,text)=>rows.push({level,text});
 if(!source){add('unknown','De oorspronkelijke PDF is nog niet uitgelezen. Nummers en aantallen zijn nog niet vergeleken.');return rows;}
 if(source.reference){add(norm(data.reference)===norm(source.reference)?'match':'warning',norm(data.reference)===norm(source.reference)?'Factuurnummer '+source.reference+' komt overeen met de PDF.':'Factuurnummer wijkt af: PDF '+source.reference+', invoer '+(data.reference||'leeg')+'.');}
 else add('unknown','Factuurnummer niet eenduidig uit de PDF gelezen.');
 const duplicate=(state.supplierInvoiceImports||[]).find(record=>record.id!==excludeId&&source.reference&&norm(record.data.reference)===norm(source.reference));
 if(duplicate)add('warning','Factuurnummer '+source.reference+' is al geregistreerd. Open de bestaande factuurcontrole; registreer dezelfde factuur niet opnieuw.');
 if(!order)return rows;
 const expected=order.supplierOrderReference,refs=source.supplierOrderReferences||[],fits=!!expected&&refs.some(ref=>norm(ref)===norm(expected));
 if(!expected)add('unknown','Vul bovenaan eerst het Kunststofbaas-bestelnummer van deze order in.');
 else if(!refs.length)add('unknown','Geen eenduidig Kunststofbaas-bestelnummer uit de PDF gelezen; verwacht '+expected+'.');
 else add(fits?'match':'warning',fits?'Bestelnummer '+expected+' past bij deze order.':'Andere bestelling: PDF vermeldt '+refs.join(', ')+', deze order heeft '+expected+'.');
 if(!data.orderIds.includes(orderId))add('warning','De geopende klantorder is niet geselecteerd voor deze factuur. Er wordt niets automatisch naar een andere order verplaatst.');
 const quantities=count(source.lines),items=order.items.filter(item=>item.productionSource!=='local'),expectedQuantity=items.length&&items.every(item=>Number.isSafeInteger(item.quantity)&&item.quantity>0)?items.reduce((sum,item)=>sum+item.quantity,0):null;
 if(refs.length>1)add('unknown','Deze factuur noemt meerdere bestellingen. Vergelijk de aantallen per gekoppelde productregel; het totaal is geen aantal voor alleen deze order.');
 else if(quantities===null||expectedQuantity===null)add('unknown','Fysieke stuks nog niet volledig leesbaar; CNC-, opstart- en verzendregels tellen niet als producten.');
 else add(quantities===expectedQuantity?'match':'warning',quantities===expectedQuantity?quantities+' fysieke stuks op PDF en klantorder.':'Aantal wijkt af: PDF '+quantities+' fysieke stuks, klantorder '+expectedQuantity+'. Een deelfactuur kan; licht dat toe.');
 if(fits&&refs.length===1){
  const physical=(source.lines||[]).filter(line=>line.kind!=='extra'&&!invoiceCostKind(line.description));let missing=0;
  for(const line of physical){const shape=invoiceLineDimensions(line.description);if(!shape.pair){missing++;continue;}const [width,height]=shape.pair,matching=items.some(item=>((item.width===width&&item.height===height)||(item.width===height&&item.height===width))&&(shape.thickness===null||item.thickness===shape.thickness));
   add(matching?'match':'warning','PDF-maat '+width+' × '+height+' mm'+(shape.thickness===null?'':' · dikte '+shape.thickness+' mm')+(matching?' staat bij deze order.':' staat niet bij deze order.'));
  }
  if(missing)add('unknown','Niet alle productmaten zijn uit de PDF gelezen. Materiaal en bewerkingen blijven zelf te vergelijken.');
 }
 return rows;
}
