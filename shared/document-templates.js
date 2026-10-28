// Company-scoped metadata and Word bytes travel with the existing CRM backup.
export const templateKinds={packing:{label:'Pakbon',file:'packing-slip.docx'},invoice:{label:'Factuur',file:'invoice.docx'},confirmation:{label:'Offerte, orderbevestiging & proforma',file:'order-confirmation.docx'}};
export const templateKey=kind=>['quote','proforma'].includes(kind)?'confirmation':kind;
export function activeDocumentTemplate(state,kind){const key=templateKey(kind),id=state.documentTemplates?.active?.[key];return state.documentTemplates?.versions?.find(v=>v.id===id&&v.kind===key)||null;}
export const documentTemplateRevision=(state,kind)=>activeDocumentTemplate(state,kind)?.id||'standard';
export function validateDocumentTemplates(config){
 if(config===undefined)return;
 const fail=()=>{throw Error('Controleer de documenttemplates.');};
 if(!config||typeof config!=='object'||Array.isArray(config)||!Array.isArray(config.versions)||config.versions.length>10||!config.active||typeof config.active!=='object'||Array.isArray(config.active)||Object.keys(config).some(k=>!['versions','active'].includes(k)))fail();
 const ids=new Set();
 for(const v of config.versions){if(!v||!Object.hasOwn(templateKinds,v.kind)||typeof v.id!=='string'||!/^[a-zA-Z0-9._-]{1,160}$/.test(v.id)||ids.has(v.id)||typeof v.name!=='string'||!v.name||v.name.length>150||typeof v.companyId!=='string'||!['spatlappen','maatwerkkunststof'].includes(v.companyId)||typeof v.createdAt!=='string'||!Number.isFinite(Date.parse(v.createdAt))||typeof v.data!=='string'||!v.data.length||v.data.length>533336||!/^[A-Za-z0-9+/]+={0,2}$/.test(v.data)||v.data.length%4||Object.keys(v).some(k=>!['id','kind','name','companyId','createdAt','data'].includes(k)))fail();ids.add(v.id);}
 for(const [kind,id] of Object.entries(config.active))if(!Object.hasOwn(templateKinds,kind)||id!==null&&!config.versions.some(v=>v.id===id&&v.kind===kind))fail();
}
