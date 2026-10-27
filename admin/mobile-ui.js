import {installViewport} from './workspace/viewport.js?v=batch1-mobile-20261023';
let cleanup=()=>{};
export function installMobileUI(root){
 cleanup();const menu=root.querySelector('[data-mobile-menu]'),aside=root.querySelector('#crm-navigation'),main=root.querySelector('main'),backdrop=root.querySelector('[data-mobile-backdrop]');if(!menu||!aside||!main||!backdrop)return;
 const media=window.matchMedia?.('(max-width:760px)');let open=false;
 function set(value){open=!!value&&!!media?.matches;(root.querySelector('.shell')||root).classList.toggle('mobile-menu-open',open);menu.setAttribute('aria-expanded',String(open));aside.inert=!!media?.matches&&!open;aside.setAttribute('aria-hidden',String(!!media?.matches&&!open));main.inert=open;if(open){aside.setAttribute('role','dialog');aside.setAttribute('aria-modal','true');aside.querySelector('nav a')?.focus();}else{aside.removeAttribute('role');aside.removeAttribute('aria-modal');}}
 function key(event){if(!open)return;if(event.key==='Escape'){event.preventDefault();set(false);menu.focus();}if(event.key==='Tab'){const nodes=[...aside.querySelectorAll('a,button,select,input')].filter(n=>!n.disabled&&!n.hidden&&n.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
 menu.onclick=()=>set(!open);backdrop.onclick=()=>{set(false);menu.focus();};const close=aside.querySelector('[data-mobile-close]');if(close)close.onclick=()=>{set(false);menu.focus();};const navigate=event=>{if(event.target.closest('nav a'))set(false);};aside.addEventListener('click',navigate);window.addEventListener('keydown',key);const change=()=>set(false);media?.addEventListener?.('change',change);set(false);
 cleanup=()=>{aside.removeEventListener('click',navigate);window.removeEventListener('keydown',key);media?.removeEventListener?.('change',change);main.inert=false;};
 installViewport();
}
