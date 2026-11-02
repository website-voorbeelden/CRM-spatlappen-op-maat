// Access URLs stay transient. Never store this return value in CRM state,
// provenance, feedback, logging or an AI prompt.
export function supplierDocumentLink(value,{kind=''}={}){
 const fail=()=>{throw Object.assign(Error('Plak de oorspronkelijke Kunststofbaas-factuur- of pakbonlink. Alleen hun vaste HTTPS-documentadres wordt opgehaald.'),{code:'link_invalid',status:400});};
 if(typeof value!=='string'||value.length>4096||/[\x00-\x20\x7f]/.test(value.trim()))fail();let url;try{url=new URL(value.trim());}catch{fail();}
 if(url.protocol!=='https:'||!['kunststofbaas.nl','www.kunststofbaas.nl'].includes(url.hostname)||url.port&&url.port!=='443'||url.username||url.password||url.hash||url.pathname!=='/wp-admin/admin-ajax.php')fail();
 const keys=['action','document_type','order_ids','access_key','my-account'];for(const key of url.searchParams.keys())if(!keys.includes(key)||url.searchParams.getAll(key).length!==1)fail();
 const type=url.searchParams.get('document_type'),documentKind=type==='invoice'?'invoice':type==='packing-slip'?'packing':null,orderReference=url.searchParams.get('order_ids');
 if(url.searchParams.get('action')!=='generate_wpo_wcpdf'||!documentKind||!/^\d{1,12}$/.test(orderReference||'')||! /^[a-zA-Z0-9_-]{1,200}$/.test(url.searchParams.get('access_key')||'')||url.searchParams.has('my-account')&&!['true','false'].includes(url.searchParams.get('my-account')))fail();
 if(kind&&documentKind!==kind)throw Object.assign(Error('Deze link is geen '+(kind==='invoice'?'factuurlink. Gebruik een pakbon alleen bij Document controleren.':'pakbonlink.') ),{code:'document_kind',status:400});
 return {url:url.href,documentKind,orderReference,name:'Kunststofbaas_'+(documentKind==='invoice'?'factuur':'pakbon')+'_'+orderReference+'.pdf'};
}
