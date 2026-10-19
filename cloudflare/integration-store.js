const enc=new TextEncoder(),dec=new TextDecoder();
export const hex=bytes=>[...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');
export const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const sha256=async text=>hex(await crypto.subtle.digest('SHA-256',enc.encode(text)));
export const integrationError=(message,status=400,field)=>Object.assign(Error(message),{status,field});
export function integrationStore(env){
 const company=env.CRM_COMPANY_ID;
 if(!['spatlappen','maatwerkkunststof'].includes(company)||!env.DB||!/^[a-f0-9]{64}$/.test(env.CRM_INTEGRATIONS_KEY||''))throw integrationError('De beveiligde online koppelingen moeten nog worden ingericht.',503);
 const key=crypto.subtle.importKey('raw',Uint8Array.from(env.CRM_INTEGRATIONS_KEY.match(/../g),n=>parseInt(n,16)),'AES-GCM',false,['encrypt','decrypt']);
 const aad=name=>enc.encode(company+'|'+name+'|v1');
 async function seal(name,value){const iv=crypto.getRandomValues(new Uint8Array(12));const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(name)},await key,enc.encode(JSON.stringify(value)));return hex(iv)+':'+hex(bytes);}
 async function open(name,text){try{const [iv,data]=text.split(':');if(!/^[a-f0-9]{24}$/.test(iv)||!/^[a-f0-9]+$/.test(data)||data.length%2)throw Error();return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:Uint8Array.from(iv.match(/../g),n=>parseInt(n,16)),additionalData:aad(name)},await key,Uint8Array.from(data.match(/../g),n=>parseInt(n,16)))));}catch{throw integrationError('De beveiligde koppeling kan niet worden geopend. Controleer de serverinstellingen.',503);}}
 async function read(name){const row=await env.DB.prepare('SELECT version,ciphertext FROM crm_integrations WHERE company_id=? AND name=?').bind(company,name).first();return row?{version:row.version,value:await open(name,row.ciphertext)}:{version:'',value:null};}
 async function write(name,value,expected=''){
  const version=random(),ciphertext=await seal(name,value),now=new Date().toISOString();
  const stmt=expected?env.DB.prepare('UPDATE crm_integrations SET version=?,ciphertext=?,updated_at=? WHERE company_id=? AND name=? AND version=?').bind(version,ciphertext,now,company,name,expected):env.DB.prepare('INSERT INTO crm_integrations(company_id,name,version,ciphertext,updated_at) VALUES(?,?,?,?,?) ON CONFLICT DO NOTHING').bind(company,name,version,ciphertext,now);
  const result=await stmt.run();if(result.meta.changes!==1)throw integrationError('De koppeling is intussen gewijzigd. Vernieuw en probeer opnieuw.',409);return {version,value};
 }
 async function exclusive(name,fn){
  const owner=random(),now=Date.now();const lease=await env.DB.prepare('INSERT INTO crm_service_leases(company_id,name,owner,expires_at) VALUES(?,?,?,?) ON CONFLICT(company_id,name) DO UPDATE SET owner=excluded.owner,expires_at=excluded.expires_at WHERE expires_at<=? RETURNING owner').bind(company,name,owner,now+300000,now).first();
  if(lease?.owner!==owner)throw integrationError('Deze dienst verwerkt al een aanvraag. Probeer zo opnieuw.',409);
  try{return await fn();}finally{await env.DB.prepare('DELETE FROM crm_service_leases WHERE company_id=? AND name=? AND owner=?').bind(company,name,owner).run();}
 }
 return {company,read,write,seal,open,exclusive,db:env.DB};
}
