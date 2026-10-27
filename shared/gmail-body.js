import {decodeMailEntities} from './mail-content.js?v=form-intake-20261026';

const decode=value=>new TextDecoder().decode(Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
const header=(part,name)=>String(part.headers?.find(h=>h.name?.toLowerCase()===name)?.value||'').trim();

function imageReferences(html){
 const ids=new Set();
 // Read passive markup only. Never load or insert email HTML or image bytes.
 for(const tag of html.matchAll(/<(?:img|table|td|th|body)\b[^>]{0,12000}>/gi)){
  for(const attr of tag[0].matchAll(/\s(?:src|background)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)){
   const value=decodeMailEntities(attr[1]??attr[2]??attr[3]).trim();
   if(!/^cid:/i.test(value))continue;
   try{ids.add(decodeURIComponent(value.slice(4)));}catch{/* Keep uncertain parts as attachments. */}
  }
 }
 return ids;
}

// Both listing and downloading use the same MIME distinction. A name, size or
// Content-ID alone never proves that a file belongs to a footer.
export function gmailBody(payload){
 const named=[];let text='',html='';
 function walk(part,depth=0){
  if(!part||depth>20)return;
  if(part.filename){named.push(part);return;}
  if(part.mimeType==='text/plain'&&part.body?.data)text+=(text?'\n':'')+decode(part.body.data);
  if(part.mimeType==='text/html'&&part.body?.data)html+=(html?'\n':'')+decode(part.body.data);
  for(const child of part.parts||[])walk(child,depth+1);
 }
 walk(payload);
 const references=imageReferences(html);
 const attachments=named.filter(part=>{
  if(!/^image\//i.test(part.mimeType||''))return true;
  const disposition=header(part,'content-disposition').split(';')[0].trim().toLowerCase();
  if(disposition==='attachment')return true;
  if(disposition==='inline')return false;
  if(disposition)return true;
  const contentId=header(part,'content-id').replace(/^<([^<>]+)>$/,'$1');
  return !contentId||!references.has(contentId);
 });
 return {text,html,attachments};
}
