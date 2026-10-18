export const defaultAssistantKeys=Object.freeze({open:'mod+o',talk:'mod+p'});
const reserved=new Set(['a','c','v','x','z','s','w','q','r','t','n','l']);
export function validShortcut(value){if(value===null)return true;if(typeof value!=='string'||!/^mod\+(shift\+)?([a-z0-9]|f[2-9]|f1[0-2])$/.test(value))return false;const key=value.split('+').at(-1);return !reserved.has(key);}
export function normalizeAssistantKeys(input){if(!input||!['open','talk'].every(k=>validShortcut(input[k]))||input.open&&input.open===input.talk)return {...defaultAssistantKeys};return {open:input.open,talk:input.talk};}
export function captureShortcut(event){if(event.repeat||event.isComposing||event.altKey||!(event.metaKey||event.ctrlKey))return null;const value='mod+'+(event.shiftKey?'shift+':'')+String(event.key).toLowerCase();return validShortcut(value)?value:null;}
export function shortcutLabel(value,modifier='Ctrl'){return value?value.replace('mod',modifier).replace('shift','Shift').split('+').map(v=>v.length===1?v.toUpperCase():v).join(' + '):'Uitgeschakeld';}
export function shortcutMatches(event,value){return !!value&&captureShortcut(event)===value;}
export function updateAssistantKey(current,action,value){if(!['open','talk'].includes(action)||!validShortcut(value))throw Error('Gebruik Cmd/Ctrl met een letter, cijfer of F2–F12. Algemene browser- en bewerktoetsen blijven beschermd.');const next={...normalizeAssistantKeys(current),[action]:value};if(next.open&&next.open===next.talk)throw Error('Deze combinatie wordt al voor de andere actie gebruikt. Kies een andere sneltoets.');return next;}
