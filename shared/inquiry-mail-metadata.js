// Transport metadata is not secret and never grants CRM permissions.
// Only the existing authenticated, company-specific form path may consume it.
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);
const sources=new Set(['unknown','direct','google-organic','bing-organic','google-ads','microsoft-ads','meta','chatgpt','other']);
const campaignKeys={utmSource:100,utmMedium:100,utmCampaign:150};
export function normalizeInquiryMetadata(value){
 if(!value||value.invalid||value.version!==1||!uuid(value.leadId)||!sources.has(value.source)||typeof value.internal!=='boolean')throw Error('Ongeldige formuliermetadata.');
 const result={version:1,leadId:value.leadId.toLowerCase(),source:value.source,internal:value.internal};
 for(const [key,max] of Object.entries(campaignKeys)){const text=value[key]??'';if(typeof text!=='string'||text.length>max||/[\x00-\x1f\x7f]/.test(text))throw Error('Ongeldige campagnegegevens.');result[key]=text;}
 return result;
}
export function inquiryMetadataHeaders(headers=[]){
 const names=['x-crm-form-version','x-crm-lead-id','x-crm-source','x-crm-internal','x-crm-utm-source','x-crm-utm-medium','x-crm-utm-campaign'];
 const selected=new Map();
 for(const header of headers){const key=String(header?.name||'').toLowerCase();if(!names.includes(key))continue;if(selected.has(key)||typeof header.value!=='string'||header.value.length>900)return {invalid:true};selected.set(key,header.value.replace(/\r?\n[ \t]+/g,'').trim());}
 if(!selected.size)return null;
 try{
  if(selected.get(names[0])!=='1'||!['yes','no'].includes(selected.get(names[3])))throw Error('Version');
  const decode=key=>{const raw=(selected.get(key)||'').replace(/[ \t]+/g,'');if(!raw)return '';if(!/^[a-zA-Z0-9_-]+$/.test(raw)||raw.length%4===1)throw Error('Encoding');const base=raw.replace(/-/g,'+').replace(/_/g,'/');return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(base.padEnd(Math.ceil(base.length/4)*4,'=')),c=>c.charCodeAt(0)));};
  return normalizeInquiryMetadata({version:1,leadId:selected.get(names[1]),source:selected.get(names[2]),internal:selected.get(names[3])==='yes',utmSource:decode(names[4]),utmMedium:decode(names[5]),utmCampaign:decode(names[6])});
 }catch{return {invalid:true};}
}
export function inquiryAttribution(metadata){const value=normalizeInquiryMetadata(metadata);return {source:value.source,utmSource:value.utmSource,utmMedium:value.utmMedium,utmCampaign:value.utmCampaign};}
export function validateInquiryAttribution(value){
 if(value===undefined)return;
 if(!value||Array.isArray(value)||Object.keys(value).some(k=>!['source',...Object.keys(campaignKeys)].includes(k)))throw Error('Ongeldige herkomstgegevens van de aanvraag.');
 normalizeInquiryMetadata({...value,version:1,leadId:'00000000-0000-0000-0000-000000000000',internal:false});
}
