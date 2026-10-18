import {designShortcut} from '../../shared/design-shortcuts.js';
export function installDesignShortcuts(){
 const buttons={save:'headerSave',png:'download',pdf:'downloadArtworkPdf'};
 window.addEventListener('keydown',event=>{
  const action=designShortcut(event);if(!action)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.repeat||document.body.inert||document.querySelector('.app')?.inert||document.querySelector('dialog[open],.modal-backdrop.open')||document.body.classList.contains('selection-pipette-active')||document.getElementById('pdfViewer')?.classList.contains('open'))return;
  const button=document.getElementById(buttons[action]);if(!button||button.disabled)return;
  // Commit the currently edited field through the same change handlers as a click.
  document.activeElement?.blur();button.click();
 },true);
}
