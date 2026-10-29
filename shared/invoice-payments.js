export function invoicePaymentSelection(state,orderId,ids){
 if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.length>100)throw Error('Kies geldige, unieke ontvangsten.');
 return ids.map(id=>{const p=state.payments.find(p=>p.id===id&&p.orderId===orderId);if(!p||!Number.isSafeInteger(p.amount)||p.amount<=0)throw Error('Een gekozen ontvangst is gewijzigd of hoort bij een andere order.');return {id:p.id,date:p.date,amount:p.amount,reference:p.reference||''};});
}
export function invoicePaymentNote(receipts,{euro,date}){return receipts.length?'Vermelde ontvangsten:\n'+receipts.map(p=>`${date(p.date)} · ${euro(p.amount)}${p.reference?' · '+p.reference:''}`).join('\n'):'';}

// Keep the user's note separate from the generated receipt block in new files.
export function invoicePaymentFields(note,receipts,formatters){
 const invoiceNoteText=String(note||'').trim(),invoice_note=[invoiceNoteText,invoicePaymentNote(receipts,formatters)].filter(Boolean).join('\n\n');
 if(invoice_note.length>500)throw Object.assign(Error('De factuurtoelichting met ontvangsten is langer dan 500 tekens. Kort je toelichting in of vermeld minder ontvangsten.'),{field:'invoice_note'});
 return {invoiceNoteText,invoice_note};
}
export function invoiceNoteParts(payload,formatters){
 const full=String(payload.fields?.invoice_note||''),selected=payload.selectedPayments;
 if(!Array.isArray(selected)||selected.some(p=>!p||typeof p.id!=='string'||typeof p.date!=='string'||!Number.isSafeInteger(p.amount)||p.amount<=0||p.reference!=null&&typeof p.reference!=='string'))return {text:full,separable:false};
 let block;try{block=invoicePaymentNote(selected,formatters);}catch{return {text:full,separable:false};}
 if(typeof payload.invoiceNoteText==='string'&&[payload.invoiceNoteText.trim(),block].filter(Boolean).join('\n\n')===full)return {text:payload.invoiceNoteText,separable:true};
 if(!block)return {text:full,separable:true};
 if(full===block)return {text:'',separable:true};
 if(full.endsWith('\n\n'+block))return {text:full.slice(0,-block.length-2),separable:true};
 // Legacy free text is never stripped by guessing at words or dates.
 return {text:full,separable:false};
}
