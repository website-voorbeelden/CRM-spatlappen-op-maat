const selector='details.quiet-menu,details.order-more';

// Native disclosures stay native. Only action menus share this behaviour;
// filters, histories, form fields and ordinary details keep their own state.
export function installActionMenus(root){
 const openMenus=()=>[...root.querySelectorAll(selector)].filter(menu=>menu.open);
 function clicked(event){
  if(event.defaultPrevented)return;
  const action=event.target.closest?.('button,a');
  for(const menu of openMenus()){
   if(!menu.contains(event.target)||action&&menu.contains(action))menu.open=false;
  }
 }
 function toggled(event){
  const menu=event.target;
  if(!menu.matches?.(selector)||!menu.open)return;
  for(const other of openMenus())if(other!==menu&&!other.contains(menu)&&!menu.contains(other))other.open=false;
 }
 function key(event){
  if(event.key!=='Escape'||event.defaultPrevented||document.querySelector('dialog[open]'))return;
  const menus=openMenus();
  const current=event.target.closest?.(selector),menu=current?.open?current:menus.at(-1);
  if(!menu)return;
  event.preventDefault();event.stopPropagation();
  for(const nested of menu.querySelectorAll(selector))nested.open=false;
  menu.open=false;menu.querySelector(':scope>summary')?.focus();
 }
 document.addEventListener('click',clicked);
 document.addEventListener('keydown',key);
 root.addEventListener('toggle',toggled,true);
 return ()=>{
  document.removeEventListener('click',clicked);
  document.removeEventListener('keydown',key);
  root.removeEventListener('toggle',toggled,true);
 };
}
