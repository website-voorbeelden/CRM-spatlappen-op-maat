let viewportInstalled=false,focusTimer,revealFrame=0,composingField=null;
function editableDialogField(){
 const field=document.activeElement;
 return field?.isConnected&&field.closest('dialog[open]')&&!field.closest('[inert]')&&field.matches('input:not([type=checkbox]):not([type=radio]),textarea,select')&&!field.disabled&&!field.readOnly?field:null;
}
// The browser owns focus, selection and horizontal caret scrolling. This mirror
// only measures the active textarea's current line; it never stores its contents.
function textareaCaret(field,rect){
 if(field.tagName!=='TEXTAREA'||field.value.length>20000||typeof field.selectionStart!=='number')return null;
 const style=getComputedStyle(field),mirror=document.createElement('div'),marker=document.createElement('span');
 const properties=['fontFamily','fontSize','fontWeight','fontStyle','fontStretch','fontVariant','lineHeight','letterSpacing','wordSpacing','textTransform','textIndent','textAlign','direction','tabSize','paddingTop','paddingRight','paddingBottom','paddingLeft'];
 Object.assign(mirror.style,{position:'fixed',left:'-100000px',top:'0',visibility:'hidden',pointerEvents:'none',boxSizing:'border-box',whiteSpace:field.wrap==='off'?'pre':'pre-wrap',overflowWrap:'break-word',width:field.clientWidth+'px'});
 for(const name of properties)mirror.style[name]=style[name];
 const index=field.selectionDirection==='backward'?field.selectionStart:field.selectionEnd;
 mirror.textContent=field.value.slice(0,index);marker.textContent='\u200b';mirror.append(marker);mirror.setAttribute('aria-hidden','true');document.body.append(mirror);
 try{
  const lineHeight=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.2,baseline=marker.getBoundingClientRect(),base=mirror.getBoundingClientRect(),border=parseFloat(style.borderTopWidth)||0;
  const lineTop=baseline.top-base.top,before=field.scrollTop,visibleTop=parseFloat(style.paddingTop)||0,visibleBottom=field.clientHeight-(parseFloat(style.paddingBottom)||0);
  if(lineTop-before<visibleTop)field.scrollTop=Math.max(0,lineTop-visibleTop);
  else if(lineTop+lineHeight-before>visibleBottom)field.scrollTop=Math.max(0,lineTop+lineHeight-visibleBottom);
  const top=rect.top+border+lineTop-field.scrollTop;
  return {top,bottom:top+lineHeight};
 }finally{mirror.remove();}
}
function revealMobileField(){
 if(!window.matchMedia('(max-width:760px)').matches)return;
 const field=editableDialogField();if(!field||field===composingField)return;
 const dialog=field.closest('dialog[open]'),viewport=window.visualViewport,footer=dialog.querySelector('.dialog-footer'),footerRect=footer?.getBoundingClientRect();
 const top=(viewport?.offsetTop||0)+12,viewportBottom=(viewport?.offsetTop||0)+(viewport?.height||window.innerHeight)-12;
 const bottom=footerRect&&footerRect.top>top&&footerRect.top<viewportBottom?footerRect.top-12:viewportBottom;
 if(bottom<=top)return;
 const rect=field.getBoundingClientRect(),target=textareaCaret(field,rect)||rect;
 const delta=target.top<top?target.top-top:target.bottom>bottom?Math.min(target.bottom-bottom,target.top-top):0;
 if(Math.abs(delta)<1)return;
 let scroller=field.parentElement;
 while(scroller&&scroller!==dialog){if(/auto|scroll/.test(getComputedStyle(scroller).overflowY)&&scroller.scrollHeight>scroller.clientHeight)break;scroller=scroller.parentElement;}
 (scroller||dialog).scrollBy({top:delta,behavior:'instant'});
}
function scheduleField(){if(revealFrame)return;revealFrame=requestAnimationFrame(()=>{revealFrame=0;revealMobileField();});}
export function installViewport(){
 if(viewportInstalled)return;viewportInstalled=true;
 document.addEventListener('focusin',scheduleField);
 document.addEventListener('input',event=>{if(!event.isComposing&&event.target===document.activeElement)scheduleField();});
 document.addEventListener('selectionchange',()=>{if(editableDialogField()?.tagName==='TEXTAREA')scheduleField();});
 document.addEventListener('compositionstart',event=>{composingField=event.target;});
 document.addEventListener('compositionend',()=>{composingField=null;scheduleField();});
 const update=()=>{const v=window.visualViewport;document.documentElement.style.setProperty('--crm-viewport-height',Math.round(v?.height||window.innerHeight)+'px');document.documentElement.style.setProperty('--crm-viewport-top',Math.round(v?.offsetTop||0)+'px');};
 const resize=()=>{update();scheduleField();clearTimeout(focusTimer);focusTimer=setTimeout(scheduleField,160);};
 window.visualViewport?.addEventListener('resize',resize);
 // Scrolling must not pull a user back to the caret while reading another line.
 window.visualViewport?.addEventListener('scroll',update);window.addEventListener('resize',resize);resize();
}
