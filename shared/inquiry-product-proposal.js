import {cleanInquirySpecs,specLabels} from './inquiries.js?v=feedback-followup-20261028';
import {companyFor} from './companies.js';
import {markProvenance,provenanceFor} from './provenance.js?v=provenance-colors-20261027';

// A form draft only: never create IDs, add records, infer prices or replace an
// existing product. The caller saves explicitly through the existing order CAS.
export function inquiryProductProposal(order,companyId,{specs=order.inquirySpecs||{},notRequired=order.inquiryNotRequired||[],specSources}={}){
 const company=companyFor(companyId);
 if((order.items||[]).length)return null;
 const values=cleanInquirySpecs(specs),ignored=new Set(notRequired);
 const known=key=>ignored.has(key)?null:values[key]??null;
 const item={description:String(order.inquiryProduct||company.defaultProduct).trim(),quantity:known('quantity'),width:known('width'),height:known('height'),price:null,cost:null,printColors:company.tool==='design'&&/^\d{1,2}$/.test(known('printing')??'')?Number(known('printing')):null,productionSource:'supplier'};
 const direct=[['quantity','quantity'],['width','width'],['height','height'],['printColors','printing']];
 if(company.tool==='costing'){
  Object.assign(item,{material:known('material')||'',thickness:known('thickness'),shape:known('shape')||'',diameter:known('diameter'),holeDiameter:known('holeDiameter')});
  direct.push(...['material','thickness','shape','diameter','holeDiameter'].map(key=>[key,key]));
 }
 const extra=company.tool==='design'?['material','color','shape','diameter','holeDiameter','thickness','printing','design']:['color','shape','diameter','holeDiameter','design'];
 item.specs=extra.filter(key=>known(key)!=null&&known(key)!=='').map(key=>specLabels[key]+': '+known(key)).join(' · ');
 for(const [field,key] of direct){
  const source=specSources?provenanceFor({...values,provenance:specSources},key,known(key)):provenanceFor(order,'inquirySpecs.'+key,known(key));
  // Provenance is retained only if the proposed value is still the saved value.
  if(item[field]!=null&&item[field]!=='')markProvenance(item,[field],source?.source||'default',{...(source?{mode:source.mode,at:source.at}:{})});
 }
 if(order.inquiryProduct){const source=provenanceFor(order,'inquiryProduct');markProvenance(item,['description'],source?.source||'default',source?{mode:source.mode,at:source.at}:{});}
 return item;
}
