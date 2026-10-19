export function createMailAttachments(context){
 async function save(ownerId,blob,name,source=null){
  if(!blob?.size||blob.size>4_000_000)throw Error('Kies een bestand van maximaal 4 MB.');
  let next,record;const safeName=String(name||'Bijlage').replace(/[\r\n\0\\/]/g,'_').slice(0,180);
  await new Promise((resolve,reject)=>{
   context.beginLocalStateChange();const tx=context.db.transaction(['state','files'],'readwrite'),ss=tx.objectStore('state'),r=ss.get('main');
   r.onsuccess=()=>{try{
    next=r.result;if(!next||![...next.orders,...next.customers].some(o=>o.id===ownerId))throw Error('Het dossier bestaat niet meer.');
    if(source)record=next.documents.find(d=>d.ownerId===ownerId&&JSON.stringify(d.emailAttachment)===JSON.stringify(source));
    if(!record){record={id:context.uid(),ownerId,name:safeName,category:'other',type:blob.type||'application/octet-stream',size:blob.size,date:context.today(),createdAt:new Date().toISOString(),...(source?{emailAttachment:source}:{})};next.documents.push(record);tx.objectStore('files').put({id:record.id,blob});ss.put(next,'main');}
   }catch(error){tx.abort();reject(error);}};
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Bijlage bewaren afgebroken.'));
  });context.state=next;context.notifyDataChanged();return record;
 }
 return {save};
}
export function attachmentBlob(result){const bytes=Uint8Array.from(atob(result.data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));return new Blob([bytes],{type:result.mimeType});}
export function openMailAttachment(blob,name){
 const url=URL.createObjectURL(blob),dialog=document.createElement('dialog');dialog.className='mail-attachment-dialog';
 const title=document.createElement('h2');title.textContent=name;const actions=document.createElement('div');actions.className='actions';
 const download=document.createElement('a');download.href=url;download.download=name;download.textContent='Downloaden';download.className='button';
 const close=document.createElement('button');close.type='button';close.textContent='Sluiten';close.onclick=()=>dialog.close();actions.append(download,close);dialog.append(title,actions);
 if(/^image\/(png|jpeg|gif|webp)$/.test(blob.type)){const img=document.createElement('img');img.src=url;img.alt=name;dialog.append(img);}
 else if(blob.type==='application/pdf'){const frame=document.createElement('iframe');frame.src=url;frame.title=name;frame.setAttribute('sandbox','');dialog.append(frame);}
 else{const p=document.createElement('p');p.textContent='Download dit bestand om het in de bijbehorende app te bekijken.';dialog.append(p);}
 document.body.append(dialog);dialog.addEventListener('close',()=>{URL.revokeObjectURL(url);dialog.remove();},{once:true});dialog.showModal();
}
