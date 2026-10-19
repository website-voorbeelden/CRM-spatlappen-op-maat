export const validMessageId=value=>typeof value==='string'&&value.length<=998&&/^<[^<>\s\r\n\0]+@[^<>\s\r\n\0]+>$/.test(value);
export function replyReferences(value,parent=''){
 const ids=Array.isArray(value)?value:String(value||'').match(/<[^<>\s]+>/g)||[];
 return [...new Set([...ids.filter(validMessageId),...(validMessageId(parent)?[parent]:[])])].slice(-20).join(' ');
}
export const replySubject=value=>/^re:/i.test(String(value||''))?String(value):'Re: '+String(value||'');
export const sameReplySubject=(a,b)=>String(a||'').replace(/^(?:(?:re|aw|sv):\s*)+/i,'').trim().toLowerCase()===String(b||'').replace(/^(?:(?:re|aw|sv):\s*)+/i,'').trim().toLowerCase();
