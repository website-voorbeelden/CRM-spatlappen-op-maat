export function designShortcut(event){
 if(!(event.metaKey||event.ctrlKey)||!event.shiftKey||event.altKey)return null;
 return ({s:'save',e:'png',t:'pdf'})[String(event.key||'').toLowerCase()]||null;
}
