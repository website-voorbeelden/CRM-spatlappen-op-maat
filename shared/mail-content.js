// Decode once, as text only. Call after stripping tags for an HTML source.
export function decodeMailEntities(value){return String(value||'').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,entity)=>{const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};if(entity[0]!=='#')return named[entity.toLowerCase()]||'';const n=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';});}
// Passive HTML-to-text only. Never insert email HTML into the CRM DOM.
export function mailHtmlText(value){
 const html=String(value||'').slice(0,5_000_000).replace(/<(script|style|head)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 return decodeMailEntities(html.replace(/<(?:br|\/p|\/div|\/tr|\/li|\/h[1-6])\b[^>]*>/gi,'\n').replace(/<\/(?:td|th)>/gi,': ').replace(/<[^>]*>/g,'')).replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
