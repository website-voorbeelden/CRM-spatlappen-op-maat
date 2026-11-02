export const supplierWebsiteDescription=data=>[data.recipient,data.address,data.country,'Order #'+data.number].filter(Boolean).join('\n');
// Plain text only. No evaluation, persistence, provider calls or physical-order changes.
export const supplierTextVariables={onze_referentie:'Onze vaste orderreferentie',leveranciersreferentie:'Bestelnummer Kunststofbaas, indien bekend',producten:'Producten, aantallen en bekende specificaties',afleveradres:'Ontvanger, adres en land',afleverinstructies:'Bekende afleverinstructies'};
export const defaultSupplierOrderTemplate='{{leveranciersreferentie}}\n\nAflevering: zie onze pakbon en het PACKS-verzendlabel.\n{{afleveradres}}\n{{afleverinstructies}}\n\nTer controle:\n{{producten}}';
export const supplierPacksClipboardText=reference=>String(reference||'').trim();
export const supplierTextOwnReference=data=>'Maatwerkkunststof order #'+data.number;
const text=(value,max)=>typeof value==='string'&&!!value.trim()&&value.length<=max&&!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value);
export function validateSupplierOrderTemplate(value){
 if(!text(value,10000))throw Error('Gebruik een standaardtekst van maximaal 10.000 tekens.');
 const keys=[...value.matchAll(/{{([^{}]*)}}/g)].map(m=>m[1].trim());
 if(keys.some(k=>!Object.hasOwn(supplierTextVariables,k))||/{{|}}/.test(value.replace(/{{([^{}]*)}}/g,'')))throw Error('Gebruik alleen de vermelde invulvelden tussen dubbele accolades.');
 if(!keys.some(k=>['leveranciersreferentie','onze_referentie'].includes(k)))throw Error('Laat {{leveranciersreferentie}} of {{onze_referentie}} in de standaardtekst staan.');
 return value;
}
export function supplierTextWarnings(data){
 const result=[];if(!data.recipient)result.push('Ontvanger ontbreekt');if(!data.address)result.push('Afleveradres ontbreekt');if(!data.country)result.push('Land ontbreekt');if(!data.items.length)result.push('Productregels ontbreken');
 data.items.forEach((i,n)=>{const missing=[];if(!i.description)missing.push('omschrijving');if(!Number.isSafeInteger(i.quantity)||i.quantity<1)missing.push('aantal');if(!i.material)missing.push('materiaal');if(!Number.isFinite(i.thickness)||i.thickness<=0)missing.push('dikte');if(!i.width||!i.height)missing.push('buitenmaat');if(missing.length)result.push('Product '+(n+1)+': '+missing.join(', ')+' controleren');});return result;
}
export function renderSupplierOrderText(data,reference='',template=defaultSupplierOrderTemplate){
 validateSupplierOrderTemplate(template);
 const values={onze_referentie:supplierTextOwnReference(data),leveranciersreferentie:reference?'Kunststofbaas bestelling '+reference:supplierTextOwnReference(data),producten:data.items.map((i,n)=>[(n+1)+'. '+(Number.isSafeInteger(i.quantity)&&i.quantity>0?i.quantity+' × ':'')+(i.description||'Product '+(n+1)),i.material||'',i.thickness?i.thickness+' mm dik':'',i.width&&i.height?i.width+' × '+i.height+' mm':'',i.specs||'',i.costCalculation||i.costQuoteLink?'Bewerkingen: zie bijbehorende berekening of tekening':''].filter(Boolean).join(' · ')).join('\n'),afleveradres:[data.recipient,data.address,data.country].filter(Boolean).join('\n'),afleverinstructies:data.instructions?'Afleverinstructies: '+data.instructions:''};
 const result=template.replace(/{{([^{}]*)}}/g,(_,key)=>values[key.trim()]).replace(/\n{3,}/g,'\n\n').trim();if(result.length>24000)throw Error('De samengestelde beschrijving is langer dan 24.000 tekens. Maak de standaardtekst korter.');return result;
}
export const supplierOrderTextBasis=(data,reference='')=>{const {fulfilmentMethod,...source}=data;return JSON.stringify([source,reference]);};
export function supplierOrderTextInfo(state,order,data){
 const reference=order.supplierOrderReference||'',basis=supplierOrderTextBasis(data,reference),saved=order.supplierOrderText,template=state.supplierOrderTextTemplate?.text||defaultSupplierOrderTemplate;
 let value=saved?.text,error='';if(value===undefined)try{value=renderSupplierOrderText(data,reference,template);}catch(problem){value='';error=problem.message;}
 const warnings=supplierTextWarnings(data),keys=[...template.matchAll(/{{([^{}]*)}}/g)].map(m=>m[1].trim()),reviewRequired=warnings.some(w=>w.startsWith('Product')?keys.includes('producten'):keys.includes('afleveradres'));
 return {text:value,basis,custom:!!saved,current:!error&&(!saved||saved.basis===basis),warnings:[...warnings,...(error?[error]:[])],reviewRequired,template,error};
}
export const supplierOrderTextEditBasis=(state,order,data)=>JSON.stringify([supplierOrderTextBasis(data,order.supplierOrderReference||''),order.supplierOrderText??null,state.supplierOrderTextTemplate??null]);
export function validateSupplierOrderText(value,data,reference=''){
 if(!text(value,24000))throw Error('Vul een beschrijving in van maximaal 24.000 tekens.');
 if(reference&&value.includes(reference))return value;const number=String(data.number).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(!new RegExp('#'+number+'(?![0-9])').test(value))throw Error('Vermeld het Kunststofbaas-bestelnummer'+(reference?' '+reference:'')+' of onze aanvullende orderreferentie #'+data.number+' in de beschrijving.');return value;
}
export function validateSupplierOrderTexts(state){
 const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
 const t=state.supplierOrderTextTemplate;
 if(t!==undefined){if(!t||typeof t!=='object'||Array.isArray(t)||Object.keys(t).some(k=>!['text','updatedAt'].includes(k))||!date(t.updatedAt))throw Error('Ongeldige standaardtekst voor Kunststofbaas.');validateSupplierOrderTemplate(t.text);}
 for(const order of state.orders){const v=order.supplierOrderText;if(v===undefined)continue;if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!['text','basis','updatedAt'].includes(k))||!text(v.text,24000)||typeof v.basis!=='string'||!v.basis||v.basis.length>2000000||!date(v.updatedAt))throw Error('Ongeldige eigen bestelbeschrijving.');}
}
