// Rebuild a small email HTML subset: never pass uploaded markup through unchanged.
export const signatureLimit=500000;
export const escapeMailHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags=new Set('a b strong i em u s span p div br hr table tbody thead tfoot tr td th img small font center'.split(' '));
const styles=new Set('color background-color font-family font-size font-weight font-style text-decoration text-align vertical-align line-height width height max-width min-width padding padding-top padding-right padding-bottom padding-left margin margin-top margin-right margin-bottom margin-left border border-top border-bottom border-left border-right border-collapse border-spacing border-radius display white-space'.split(' '));
export function sanitizeSignature(source){
 if(typeof source!=='string'||source.length>signatureLimit||source.includes('\0'))throw Error('Gebruik een HTML-handtekening van maximaal 500.000 tekens.');
 let html=source.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|head|iframe|object|embed|svg|math|form|textarea|button|select)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 html=html.replace(/<[^>]*>|[^<]+|</g,token=>{
  if(!token.startsWith('<'))return token.replace(/>/g,'&gt;');
  const match=/^<(\/?)\s*([a-z][a-z0-9]*)\b([^>]*)>$/i.exec(token);if(!match)return '&lt;';
  const tag=match[2].toLowerCase();if(!tags.has(tag))return '';
  if(match[1])return ['br','hr','img'].includes(tag)?'':`</${tag}>`;
  const attrs=new Map();for(const a of match[3].matchAll(/([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)){
   const key=a[1].toLowerCase(),value=a[2]??a[3]??a[4]??'';let safe='';
   if(key==='style')safe=value.split(';').flatMap(rule=>{const i=rule.indexOf(':'),name=rule.slice(0,i).trim().toLowerCase(),v=rule.slice(i+1).trim();return i>0&&styles.has(name)&&v.length<250&&/^[#(),.%\w\s-]+$/.test(v)&&!/(expression|url|behavior|binding)/i.test(v)?[name+':'+v]:[];}).join(';');
   else if(key==='href'&&tag==='a'&&/^(https?:\/\/|mailto:|tel:)/i.test(value)&&!/[\x00-\x20<>]/.test(value))safe=value;
   else if(key==='src'&&tag==='img'&&(/^https:\/\//i.test(value)&&!/[\x00-\x20<>]/.test(value)||/^data:image\/(png|jpeg|gif);base64,[a-z0-9+/=]+$/i.test(value)))safe=value;
   else if(key==='data-sp-signature-slot'&&tag==='img'&&value==='missing')safe=value;
   else if(['alt','title','face','color','align','valign'].includes(key)&&value.length<=250)safe=value;
   else if(['width','height','cellpadding','cellspacing','border','colspan','rowspan','size'].includes(key)&&/^\d{1,4}%?$/.test(value))safe=value;
   if(safe)attrs.set(key,safe);
  }
  // Preserve image placement for local/cid/missing template sources. Never load them.
  if(tag==='img'&&(!attrs.has('src')||/^https:\/\/(?:www\.)?jouw-domein\.nl(?:\/|$)/i.test(attrs.get('src')))){
   attrs.delete('src');attrs.set('data-sp-signature-slot','missing');
  }
  return '<'+tag+[...attrs].map(([k,v])=>' '+k+'="'+escapeMailHtml(v.replace(/&amp;/g,'&'))+'"').join('')+'>';
 });
 if(html.length>signatureLimit)throw Error('De verwerkte HTML-handtekening is te groot.');
 return html.trim();
}
export function signatureText(html){
 const value=sanitizeSignature(html).replace(/<img\b[^>]*alt="([^"]*)"[^>]*>/gi,'$1').replace(/<(br|hr)\b[^>]*>|<\/(p|div|tr|table)>/gi,'\n').replace(/<\/(td|th)>/gi,' ').replace(/<[^>]*>/g,'');
 return value.replace(/&#(x[\da-f]+|\d+);/gi,(_,v)=>{const n=v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):Number(v);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}).replace(/&(nbsp|amp|lt|gt|quot|apos);/gi,(_,v)=>({nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[v.toLowerCase()])).replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,2000);
}
export function htmlSignatureMessage(text,config){
 const signature=sanitizeSignature(config.signatureHtml||''),plain=(config.signature||signatureText(signature)||'').trim();
 if(/data-sp-signature-slot="missing"/.test(signature))throw Error('Je HTML-handtekening mist nog een afbeelding. Kies deze bij Afbeelding in HTML vervangen of verwijder het lege afbeeldingsvak.');
 let body=String(text||'').trimEnd();
 // Replace one trailing signature, including old template closings. Never append both formats.
 const endings=[plain,signatureText(signature)].filter(Boolean).sort((a,b)=>b.length-a.length);
 for(const ending of endings)if(body.endsWith(ending)){body=body.slice(0,-ending.length).trimEnd();break;}
 if(signature||plain)body=body.replace(/(?:^|\n)(?:Met vriendelijke groet(?:en)?|Vriendelijke groet(?:en)?|Kind regards|Best regards)[, \t]*\n[\s\S]{0,500}$/i,'').trimEnd();
 const alternative=[body,plain].filter(Boolean).join('\n\n');if(!signature)return {text:alternative};
 const inlines=[];
 const htmlSignature=signature.replace(/src="data:image\/(png|jpeg|gif);base64,([a-z0-9+/=]+)"/gi,(_,type,fileblob)=>{
  let bytes;try{bytes=atob(fileblob);}catch{throw Error('De handtekening bevat een ongeldige afbeelding.');}
  if(bytes.length>200000||!bytes.length||btoa(bytes)!==fileblob)throw Error('Gebruik een handtekeningafbeelding van maximaal 200 kB.');
  const filename='signature-'+(inlines.length+1)+'.'+(type.toLowerCase()==='jpeg'?'jpg':type.toLowerCase());inlines.push({filename,mimetype:'image/'+type.toLowerCase(),fileblob});return 'src="cid:'+filename+'"';
 });
 const prefix='<!doctype html><html><body>'+escapeMailHtml(body).replace(/\n/g,'<br>')+'<br><br>';return {text:alternative,html:prefix+htmlSignature+'</body></html>',previewHtml:prefix+signature+'</body></html>',inlines};
}

export function signatureFrame(html,title='HTML-handtekening'){
 const doc=`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"></head><body style="font-family:Arial,sans-serif;font-size:14px">${html}</body></html>`;
 return `<iframe title="${escapeMailHtml(title)}" sandbox="" referrerpolicy="no-referrer" srcdoc="${escapeMailHtml(doc)}" style="width:100%;height:260px;border:1px solid #dfe6f0;border-radius:8px;background:white"></iframe>`;
}
