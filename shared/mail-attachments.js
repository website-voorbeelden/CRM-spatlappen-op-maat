const types={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',txt:'text/plain',csv:'text/csv',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',zip:'application/zip'};
function attachmentType(filename){
 if(typeof filename!=='string'||!filename.trim()||filename.length>180||/[\r\n\0\\/]/.test(filename))throw Error('Controleer de naam en grootte van de bijlage.');
 const ext=filename.split('.').at(-1).toLowerCase(),mimetype=Object.hasOwn(types,ext)?types[ext]:'';
 if(!mimetype)throw Error('Gebruik PDF, afbeeldingen, Word, Excel, tekst, CSV of ZIP als bijlage.');
 return mimetype;
}
export function validateMailAttachments(list=[]){
 if(!Array.isArray(list)||list.length>5)throw Error('Kies maximaal vijf extra bijlagen.');
 let total=0;
 return list.map(file=>{
  if(!file||typeof file.fileblob!=='string'||file.fileblob.length>5_340_000)throw Error('Controleer de naam en grootte van de bijlage.');
  const mimetype=attachmentType(file.filename);
  let bytes;try{bytes=atob(file.fileblob);}catch{throw Error('De bijlage bevat ongeldige bestandsgegevens.');}
  if(!bytes.length||bytes.length>4_000_000||btoa(bytes)!==file.fileblob)throw Error('Elke bijlage mag maximaal 4 MB zijn.');
  total+=bytes.length;if(total>8_000_000)throw Error('De extra bijlagen mogen samen maximaal 8 MB zijn.');
  return {filename:file.filename,mimetype,fileblob:file.fileblob};
 });
}
export async function mailAttachment(blob,filename){
 attachmentType(filename);
 // Bound the read before arrayBuffer/base64, including stored-file previews.
 if(!Number.isSafeInteger(blob?.size)||blob.size<=0||blob.size>4_000_000)throw Error('Elke bijlage mag maximaal 4 MB zijn.');
 const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let n=0;n<bytes.length;n+=16384)binary+=String.fromCharCode(...bytes.subarray(n,n+16384));
 return validateMailAttachments([{filename,fileblob:btoa(binary)}])[0];
}
