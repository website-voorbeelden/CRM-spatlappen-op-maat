// Deliberate, company-bound deletion of proven unused design uploads only.
// No bucket listing, age-based sweeping, customer attachments or old orphan guesses.
export async function designRetirementReady(db){return Boolean(await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='crm_design_file_retirements'").first());}
const referenced=(value,id)=>typeof value==='string'?value===id:Array.isArray(value)?value.some(v=>referenced(v,id)):value&&typeof value==='object'&&Object.values(value).some(v=>referenced(v,id));
export function retiredDesignFiles(current,nextState,remaining,operations=[]){
 if(!nextState)return [];
 const groups=new Map(),result=[];
 for(const file of current.files){const group=groups.get(file.objectKey)||[];group.push(file);groups.set(file.objectKey,group);}
 for(const [key,files]of groups){
  if(!/^uploads\/[a-f0-9-]{36}$/.test(key)||[...remaining.values()].some(other=>other.objectKey===key))continue;
  // Every alias of the immutable object needs proven disposable ownership.
  // A second manifest must never let an approved document's bytes slip through.
  if(files.some(file=>{
   if(remaining.has(file.id))return true;
   const docs=current.records.state?.main?.documents?.filter(d=>d.id===file.id)||[],doc=docs[0];
   if(docs.length!==1||(!doc.internalDesign&&!doc.productDesignPreview)||doc.generated||doc.imageRole==='approved'||doc.markedApprovedAt||doc.approvalSupersededAt||doc.approvalRevokedAt||!doc.itemId||!doc.ownerId)return true;
   const order=current.records.state.main.orders.find(o=>o.id===doc.ownerId);
   if(!order?.items.some(item=>item.id===doc.itemId)||referenced(nextState,file.id)||referenced(nextState,key))return true;
   if(operations.some(op=>op.action==='put'&&!['state','files'].includes(op.store)&&(referenced(op.value,file.id)||referenced(op.value,key))))return true;
   return Object.entries(current.records).some(([store,records])=>store!=='state'&&(referenced(records,file.id)||referenced(records,key)));
  }))continue;
  result.push(...files);
 }
 return result;
}
// Guard new records as well as manifests. A complete backup may restore a file
// under a fresh immutable key; a dangling reference alone cannot resurrect it.
export function incomingRetiredReferences(operations,files){
 const ids=new Set();
 function collect(value){if(typeof value==='string'){if((/^[a-zA-Z0-9._-]{1,160}$/.test(value)||/^uploads\/[a-f0-9-]{36}$/.test(value))&&!files.has(value))ids.add(value);}else if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object')Object.values(value).forEach(collect);}
 for(const op of operations)if(op.action==='put'&&op.store!=='files')collect(op.value);
 return JSON.stringify([...ids]);
}
function storageCursor(raw){
 if(!raw)return null;
 try{const cursor=JSON.parse(raw);if(!cursor||Object.keys(cursor).sort().join(',')!=='at,key'||typeof cursor.at!=='string'||cursor.at.length>40||!Number.isFinite(Date.parse(cursor.at))||typeof cursor.key!=='string'||!/^uploads\/[a-f0-9-]{36}$/.test(cursor.key))throw Error();return cursor;}catch{throw Error('De opslagpagina is ongeldig. Open de opruimactie opnieuw.');}
}
async function designStoragePlan(db,cursor){
 const result=await db.batch([
  db.prepare('SELECT revision FROM crm_workspace WHERE id=1'),
  db.prepare("SELECT object_key,file_ids,size,retired_at FROM crm_design_file_retirements WHERE status IN ('pending','deleting') AND (? IS NULL OR retired_at>? OR (retired_at=? AND object_key>?)) ORDER BY retired_at,object_key LIMIT 21").bind(cursor?.at||null,cursor?.at||'',cursor?.at||'',cursor?.key||''),
  db.prepare('SELECT store,record_key,part,payload FROM crm_records ORDER BY store,record_key,part'),
  db.prepare('SELECT object_key FROM crm_files')
 ]);
 const records=new Map();for(const row of result[2].results){const key=JSON.stringify([row.store,row.record_key]),parts=records.get(key)||[];parts[row.part]=row.payload;records.set(key,parts);}
 const values=[...records.values()].map(parts=>JSON.parse(parts.join(''))),keys=new Set(result[3].results.map(row=>row.object_key));
 const candidates=result[1].results.slice(0,20),rows=[],blocked=[];
 for(const row of candidates){
  const ids=JSON.parse(row.file_ids);
  if(keys.has(row.object_key)||ids.some(id=>values.some(value=>referenced(value,id)))||values.some(value=>referenced(value,row.object_key)))blocked.push(row);
  else rows.push(row);
 }
 const revision=result[0].results[0].revision,last=candidates.at(-1),more=result[1].results.length>20;
 return {rows,blocked:blocked.length,more,next:more?JSON.stringify({at:last.retired_at,key:last.object_key}):'',bytes:rows.reduce((n,r)=>n+r.size,0),revision,basis:JSON.stringify({revision,cursor,rows})};
}

export function appendDesignRetirements(queries,db,files,guard,guardArgs,now){
 const groups=new Map();for(const file of files){const group=groups.get(file.objectKey)||{ids:[],size:file.size};group.ids.push(file.id);groups.set(file.objectKey,group);}
 const rows=[...groups].map(([key,group])=>({key,ids:JSON.stringify(group.ids),size:group.size}));
 for(let offset=0;offset<rows.length;offset+=100)queries.push(db.prepare(`INSERT OR IGNORE INTO crm_design_file_retirements(object_key,file_ids,size,retired_at,status) SELECT json_extract(value,'$.key'),json_extract(value,'$.ids'),json_extract(value,'$.size'),?,'pending' FROM json_each(?) AS retired WHERE ${guard} AND NOT EXISTS (SELECT 1 FROM crm_files WHERE object_key=json_extract(retired.value,'$.key'))`).bind(now,JSON.stringify(rows.slice(offset,offset+100)),...guardArgs));
}
export async function handleDesignStorage(request,env){
 const db=env.DB,bucket=env.CRM_FILES;
 if(!db||!bucket||!await designRetirementReady(db))return Response.json({error:'Cloudopruiming is nog niet ingericht. De bestaande bestanden blijven behouden; een expliciete publicatie met opslagmigratie is nodig.'},{status:409,headers:{'Cache-Control':'no-store'}});
 if(!['GET','POST'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(request.method==='POST'&&(request.headers.get('Origin')!==new URL(request.url).origin||!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')))return Response.json({error:'Gebruik de opruimactie vanuit dit CRM.'},{status:403});
 const cursor=storageCursor(new URL(request.url).searchParams.get('after'));
 const {rows,bytes,basis,more,next,blocked,revision}=await designStoragePlan(db,cursor);
 if(request.method==='GET')return Response.json({count:rows.length,bytes,more,next,blocked,basis},{headers:{'Cache-Control':'no-store'}});
 const raw=await request.text();if(raw.length>100000)throw Error('Ongeldige opruimaanvraag.');const input=JSON.parse(raw);
 if(input.confirm!==true||input.basis!==basis)return Response.json({error:'De opruimlijst is gewijzigd. Open de controle opnieuw; er is niets verwijderd.'},{status:409,headers:{'Cache-Control':'no-store'}});
 const keys=rows.map(r=>r.object_key);if(!keys.length)return Response.json({deleted:0,bytes:0,more,blocked});
 // Each tombstone already bars new manifests from using these immutable keys.
 // The SQL condition is checked again at claiming; failed R2 deletes remain retryable.
 const claim=await db.batch([
  db.prepare("UPDATE crm_design_file_retirements SET status='deleting' WHERE object_key IN (SELECT value FROM json_each(?)) AND status IN ('pending','deleting') AND NOT EXISTS (SELECT 1 FROM crm_files WHERE object_key=crm_design_file_retirements.object_key) AND EXISTS (SELECT 1 FROM crm_workspace WHERE id=1 AND revision=?)").bind(JSON.stringify(keys),revision),
  db.prepare("SELECT object_key FROM crm_design_file_retirements WHERE object_key IN (SELECT value FROM json_each(?)) AND status='deleting' AND NOT EXISTS (SELECT 1 FROM crm_files WHERE object_key=crm_design_file_retirements.object_key) AND EXISTS (SELECT 1 FROM crm_workspace WHERE id=1 AND revision=?)").bind(JSON.stringify(keys),revision)
 ]);
 if(claim[1].results.length!==keys.length)return Response.json({error:'De opslag of de CRM-verwijzingen zijn gewijzigd. Bekijk de opruimlijst opnieuw; er is niets verwijderd.'},{status:409,headers:{'Cache-Control':'no-store'}});
 await bucket.delete(keys);
 await db.prepare("UPDATE crm_design_file_retirements SET status='deleted',deleted_at=? WHERE object_key IN (SELECT value FROM json_each(?)) AND status='deleting'").bind(new Date().toISOString(),JSON.stringify(keys)).run();
 return Response.json({deleted:keys.length,bytes,more,blocked},{headers:{'Cache-Control':'no-store'}});
}
