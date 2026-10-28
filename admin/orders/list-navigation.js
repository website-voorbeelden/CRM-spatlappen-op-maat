// Extend the existing dossier link to ordinary cells; native controls and links
// keep their own behavior. Use the actual link so normal navigation guards run.
export function installOrderListNavigation(root){
 root.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const target=event.target;if(!(target instanceof Element))return;
  const cell=target.closest('.order-list tbody td');if(!cell||!root.contains(cell))return;
  if(target.closest('a,button,input,select,textarea,label,summary,details,[data-action],[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="checkbox"],[role="switch"],[role="menuitem"]'))return;
  if(cell.closest('[inert],[aria-busy="true"]')||window.getSelection()?.isCollapsed===false)return;
  const link=cell.parentElement.querySelector('a.order-list-link');
  if(link?.getAttribute('href')?.startsWith('#orders/'))link.click();
 });
}
