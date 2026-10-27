let viewportInstalled=false,focusTimer;
function revealMobileField(){
 if(!window.matchMedia('(max-width:760px)').matches)return;
 const field=document.activeElement,dialog=field?.closest('dialog[open]');
 if(!dialog||!field.matches('input,textarea,select')||!field.isConnected)return;
 const viewport=window.visualViewport,top=(viewport?.offsetTop||0)+12,bottom=(viewport?.offsetTop||0)+(viewport?.height||window.innerHeight)-80;
 const rect=field.getBoundingClientRect();
 const delta=rect.top<top?rect.top-top:rect.bottom>bottom?Math.min(rect.bottom-bottom,rect.top-top):0;
 if(!delta)return;
 let scroller=field.parentElement;
 while(scroller&&scroller!==dialog){if(/auto|scroll/.test(getComputedStyle(scroller).overflowY)&&scroller.scrollHeight>scroller.clientHeight)break;scroller=scroller.parentElement;}
 (scroller||dialog).scrollBy({top:delta,behavior:'instant'});
}
const scheduleField=()=>{clearTimeout(focusTimer);focusTimer=setTimeout(revealMobileField,160);};
export function installViewport(){
 if(viewportInstalled)return;viewportInstalled=true;
 document.addEventListener('focusin',scheduleField);
 const update=()=>{const v=window.visualViewport;document.documentElement.style.setProperty('--crm-viewport-height',Math.round(v?.height||window.innerHeight)+'px');document.documentElement.style.setProperty('--crm-viewport-top',Math.round(v?.offsetTop||0)+'px');scheduleField();};
 window.visualViewport?.addEventListener('resize',update);window.visualViewport?.addEventListener('scroll',update);window.addEventListener('resize',update);update();
}
