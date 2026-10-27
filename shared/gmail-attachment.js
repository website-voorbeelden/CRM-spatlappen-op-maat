import {gmailBody} from './gmail-body.js?v=footer-inline-20261027';
// Called only with the currently authenticated mailbox. All provider operations are reads.
export async function gmailAttachment(auth,input,api){
 if(input.mailbox!==auth.mailbox||!/^[a-f0-9]{1,100}$/i.test(input.messageId||'')||!/^(?:root|\d+(?:\.\d+)*)$/.test(input.partId||''))throw Error('Deze bijlage hoort niet bij de huidige mailbox. Werk het gesprek bij.');
 const message=await api(auth,'messages/'+input.messageId+'?format=full');
 if(message.id!==input.messageId||message.labelIds?.some(label=>['SPAM','TRASH'].includes(label)))throw Error('Dit bericht is niet beschikbaar.');
 const part=gmailBody(message.payload).attachments.find(node=>(node.partId||'root')===input.partId);
 if(!part)throw Error('Dit onderdeel is geen losse bijlage of is niet meer beschikbaar. Werk het gesprek bij; handtekeningafbeeldingen worden niet als dossierbestand bewaard.');
 if(!part?.filename||part.body?.size>4_000_000)throw Error('Deze bijlage ontbreekt of is groter dan 4 MB. Open hem in Gmail.');
 const body=part.body?.attachmentId?await api(auth,'messages/'+input.messageId+'/attachments/'+encodeURIComponent(part.body.attachmentId)):part.body;
 if(typeof body?.data!=='string'||body.data.length>5_340_000||!/^[a-zA-Z0-9_=\-]*$/.test(body.data))throw Error('Google gaf geen bruikbare bijlage terug.');
 let bytes;try{bytes=atob(body.data.replace(/-/g,'+').replace(/_/g,'/'));}catch{throw Error('De bijlage kon niet worden gelezen.');}
 if(bytes.length>4_000_000||part.body?.size!=null&&bytes.length!==Number(part.body.size))throw Error('De bijlage is onvolledig of te groot.');
 return {filename:String(part.filename).replace(/[\r\n\0\\/]/g,'_').slice(0,180),mimeType:part.mimeType||'application/octet-stream',size:bytes.length,data:body.data};
}
