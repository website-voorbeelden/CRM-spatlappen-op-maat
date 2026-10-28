import {loading} from "../loading.js";
import {customerProductDetails,publicProductSpecifications} from '../../shared/product-specifications.js?v=product-thickness-20261021';
export const documentTypes={
 confirmation:{title:'Orderbevestiging',prefix:'OB',numberLabel:'OB-nummer',filename:'Orderbevestiging',category:'confirmation'},
 quote:{title:'Offerte',prefix:'OF',numberLabel:'Offertenummer',filename:'Offerte',category:'quote'},
 proforma:{title:'Proforma factuur',prefix:'PF',numberLabel:'Proformanummer',filename:'Proforma_factuur',category:'proforma'},
 invoice:{title:'Factuur',prefix:'F',numberLabel:'Factuurnummer',filename:'Factuur',category:'invoice'},
 packing:{title:'Pakbon',prefix:'PB',numberLabel:'Pakbonnummer',filename:'Pakbon',category:'packing'}
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
export {addressParts} from '../../shared/document-address.js';
export function generatedBlob(encoded,type){
 const binary=atob(encoded),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
 return new Blob([bytes],{type});
}
// Customer documents get only the reviewed public fields. Internal specs/notes,
// production, purchasing and supplier fields are never copied automatically.
export function customerDocumentItems(items,formData,companyId='spatlappen'){
 return items.map((item,n)=>({description:formData.get('description_'+n),
  details:customerProductDetails(item,[formData.get('detail1_'+n),...String(formData.get('details_'+n)||'').split(/\r?\n/)].map(value=>String(value||'').trim()).filter(Boolean),companyId,{requireThickness:true}),
  ...publicProductSpecifications(item,companyId),quantity:item.quantity,price:item.price}));
}
export function packingSlipItems(items,formData,companyId='spatlappen'){
 if(!Array.isArray(items)||!items.length||items.length>40)throw Error('Een pakbon heeft 1 tot 40 productregels nodig.');
 const result=items.map((item,n)=>{const raw=formData.get('delivered_'+item.id),delivered=Number(raw),description=String(formData.get('description_'+n)||'').trim();if(!description||description.length>200)throw Object.assign(Error('Vul een omschrijving van maximaal 200 tekens in.'),{field:'description_'+n});if(raw==null||String(raw).trim()===''||!Number.isInteger(delivered)||delivered<0||delivered>item.quantity)throw Object.assign(Error('Vul een geleverd aantal tussen 0 en '+item.quantity+' in.'),{field:'delivered_'+item.id});return {description,...publicProductSpecifications(item,companyId),details:customerProductDetails(item,[formData.get('detail1_'+n),...String(formData.get('details_'+n)||'').split(/\r?\n/)].map(v=>String(v||'').trim()).filter(Boolean),companyId,{requireThickness:delivered>0}),quantity:item.quantity,deliveredQuantity:delivered};});
 if(!result.some(i=>i.deliveredQuantity>0))throw Object.assign(Error('Vul bij minstens één product een geleverd aantal in.'),{field:'delivered_'+items[0].id});return result;
}
export async function renderConfirmation(payload){
 return loading.run(payload.preview?'PDF-voorbeeld maken…':payload.formats?.length===1?'PDF maken…':'PDF en Word maken…',async()=>{
 const response=await fetch('/__local/documents/render',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const result=await response.json().catch(()=>({error:'De documentomzetter is niet bereikbaar. Probeer opnieuw.'}));
 if(!response.ok||result.error)throw Error(result.error||'Het document kon niet worden gemaakt.');
 return {templateProtocol:result.templateProtocol,pdf:generatedBlob(result.pdf,'application/pdf'),docx:result.docx&&!(payload.formats?.length===1&&payload.formats[0]==='pdf')?generatedBlob(result.docx,'application/vnd.openxmlformats-officedocument.wordprocessingml.document'):null,pages:result.pages,previews:result.previews||[],downloads:result.downloads||{}};
 });
}
