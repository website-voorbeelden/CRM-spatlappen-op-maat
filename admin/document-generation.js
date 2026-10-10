export const documentTypes={
 confirmation:{title:'Orderbevestiging',prefix:'OB',numberLabel:'OB-nummer',filename:'Orderbevestiging',category:'confirmation'},
 quote:{title:'Offerte',prefix:'OF',numberLabel:'Offertenummer',filename:'Offerte',category:'quote'},
 proforma:{title:'Proforma factuur',prefix:'PF',numberLabel:'Proformanummer',filename:'Proforma_factuur',category:'proforma'},
 invoice:{title:'Factuur',prefix:'F',numberLabel:'Factuurnummer',filename:'Factuur',category:'invoice'}
};
// Each yearly series is allocated only when both generated files are saved.
export function nextDocumentNumber(state, day, kind='confirmation'){
 const type=documentTypes[kind];if(!type)throw Error('Onbekend documenttype.');
 const year=day.slice(0,4),key=`${type.prefix}-${year}`;
 const used=state.documents.map(d=>d.generated?.number||'').filter(n=>n.startsWith(key+'-')).map(n=>Number(n.slice(key.length+1))||0);
 const sequence=Math.max(3451,state.documentSequences?.[key]||0,...used)+1;
 return {key,sequence,number:`${key}-${String(sequence).padStart(4,'0')}`};
}
export const nextConfirmationNumber=(state,day)=>nextDocumentNumber(state,day,'confirmation');
export function addressParts(address,country=''){
 const lines=String(address||'').split(/\n|,\s*/).map(s=>s.trim()).filter(Boolean);
 if(lines.length>1&&country&&lines.at(-1).toLowerCase()===country.trim().toLowerCase())lines.pop();
 if(lines.length===1){const match=lines[0].match(/^(.*?)\s+(\d{4}\s?[A-Za-z]{2}\s+.+)$/);if(match)return {street:match[1],postal:match[2]};}
 return {street:lines[0]||'',postal:lines.slice(1).join(', ')};
}
export function generatedBlob(encoded,type){
 const binary=atob(encoded),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
 return new Blob([bytes],{type});
}
// Customer documents get only the reviewed public fields. Internal specs/notes,
// production, purchasing and supplier fields are never copied automatically.
export function customerDocumentItems(items,formData){
 return items.map((item,n)=>({description:formData.get('description_'+n),
  details:[formData.get('detail1_'+n),...String(formData.get('details_'+n)||'').split(/\r?\n/)].map(value=>String(value||'').trim()).filter(Boolean),
  quantity:item.quantity,price:item.price}));
}
export async function renderConfirmation(payload){
 const response=await fetch('/__local/documents/render',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const result=await response.json().catch(()=>({error:'De documentomzetter is niet bereikbaar. Probeer opnieuw.'}));
 if(!response.ok||result.error)throw Error(result.error||'Het document kon niet worden gemaakt.');
 return {pdf:generatedBlob(result.pdf,'application/pdf'),docx:generatedBlob(result.docx,'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),pages:result.pages,previews:result.previews||[],downloads:result.downloads||{}};
}
