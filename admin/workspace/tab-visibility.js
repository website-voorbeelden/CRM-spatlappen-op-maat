// Reveal only the horizontal selection. Never scroll the page or move focus.
export function revealSelectedTab(root){
 for(const list of root?.querySelectorAll('.dossier-header [role=tablist],.section-tabs')||[]){
  const selected=list.querySelector('[aria-selected=true]');if(!selected)continue;
  const viewport=list.getBoundingClientRect(),item=selected.getBoundingClientRect();
  if(item.left<viewport.left)list.scrollLeft-=viewport.left-item.left+8;
  else if(item.right>viewport.right)list.scrollLeft+=item.right-viewport.right+8;
 }
}
