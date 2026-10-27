// Decode once, as text only. Call after stripping tags for an HTML source.
export function decodeMailEntities(value){return String(value||'').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,entity)=>{const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};if(entity[0]!=='#')return named[entity.toLowerCase()]||'';const n=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';});}
// Passive HTML-to-text only. Never insert email HTML into the CRM DOM.
export function mailHtmlText(value){
 const html=String(value||'').slice(0,5_000_000).replace(/<(script|style|head)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 return decodeMailEntities(html.replace(/<(?:br|\/p|\/div|\/tr|\/li|\/h[1-6])\b[^>]*>/gi,'\n').replace(/<\/(?:td|th)>/gi,': ').replace(/<[^>]*>/g,'')).replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}

// RFC 2047 encoded words are common for subjects containing an en dash or a
// non-ASCII name. Decode as passive text; never evaluate HTML or header lines.
export function decodeMailHeader(value){
 const source=String(value||'').slice(0,10000).replace(/(\?=)[ \t\r\n]+(?==\?)/g,'$1');
 return source.replace(/=\?([^?\s]+)\?([bq])\?([^?]*)\?=/gi,(word,charset,encoding,content)=>{
  try{
   let bytes;
   if(encoding.toLowerCase()==='b'){
    if(!/^[A-Za-z0-9+/]*={0,2}$/.test(content))return word;
    bytes=Uint8Array.from(atob(content),c=>c.charCodeAt(0));
   }else{
    const text=content.replace(/_/g,' '),out=[];
    for(let i=0;i<text.length;i++){
     if(text[i]==='='){if(!/^[0-9a-f]{2}$/i.test(text.slice(i+1,i+3)))return word;out.push(parseInt(text.slice(i+1,i+3),16));i+=2;}
     else{const code=text.charCodeAt(i);if(code>127)return word;out.push(code);}
    }
    bytes=Uint8Array.from(out);
   }
   return new TextDecoder(charset,{fatal:true}).decode(bytes);
  }catch{return word;}
 }).replace(/[\r\n\0]/g,' ').slice(0,2000);
}
