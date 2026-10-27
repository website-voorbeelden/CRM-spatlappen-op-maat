const actions=['duplicateOtherSideSelected','quickCenterSelection','quickBalanceSelection','quickBalanceVertical','quickBottomSide','mirrorArtwork','rotateArtwork','matchVectorHeight','trimSelectedVector','selectionOutline'];
const keyOf=event=>[event.metaKey?'Meta':'',event.ctrlKey?'Control':'',event.altKey?'Alt':'',event.shiftKey?'Shift':'',event.code].filter(Boolean).join('+');
const forbidden=new Set(['KeyA','KeyB','KeyC','KeyD','KeyE','KeyF','KeyH','KeyL','KeyN','KeyO','KeyP','KeyQ','KeyR','KeyS','KeyT','KeyV','KeyW','KeyX','KeyY','KeyZ','BracketLeft','BracketRight','Equal','Minus','Digit0']);
function combinationError(key){
 if(!/^(Meta\+)?(Control\+)?(Alt\+)?(Shift\+)?(?:Key[A-Z]|Digit[0-9]|BracketLeft|BracketRight|Comma|Period|Slash|Backslash|Semicolon|Quote|Backquote|Minus|Equal)$/.test(key)||!/(?:Meta|Control|Alt)\+/.test(key))return 'Gebruik Cmd, Ctrl of Alt samen met een letter, cijfer of leesteken.';
 if((key.includes('Meta+')||key.includes('Control+'))&&forbidden.has(key.split('+').at(-1)))return 'Deze combinatie is gereserveerd voor de bestaande editor- of browserbediening.';
 return '';
}
function readableKey(key,aria=false){return key.split('+').map(part=>({Meta:aria?'Meta':'Cmd',Control:aria?'Control':'Ctrl',BracketLeft:'[',BracketRight:']',Comma:',',Period:'.',Slash:'/',Backslash:'\\',Semicolon:';',Quote:"'",Backquote:'`',Minus:'-',Equal:'='}[part]||part.replace(/^(Key|Digit)/,''))).join('+');}
export function installCustomDesignShortcuts(){
 let bindings={};try{const value=JSON.parse(localStorage.getItem('spatlap-custom-shortcuts-v1')||'{}');for(const [id,key]of Object.entries(value||{}))if(actions.includes(id)&&typeof key==='string'&&!combinationError(key)&&!Object.values(bindings).includes(key))bindings[id]=key;}catch{}
 const dialog=document.createElement('dialog');dialog.className='design-shortcut-dialog';
 dialog.innerHTML='<h2>Sneltoets instellen</h2><p data-shortcut-name></p><p data-shortcut-current></p><label>Druk op je nieuwe combinatie<input readonly aria-label="Nieuwe sneltoets" placeholder="Bijvoorbeeld Alt+B"></label><p data-shortcut-error role="status"></p><div class="mini-actions"><button type="button" data-shortcut-save>Bewaren</button><button type="button" data-shortcut-remove>Verwijderen</button><button type="button" data-shortcut-close>Sluiten</button></div>';
 document.body.append(dialog);let active='',pending='';
 const label=()=>dialog.querySelector('[data-shortcut-current]'),error=()=>dialog.querySelector('[data-shortcut-error]'),input=dialog.querySelector('input');
 function paint(){for(const id of actions){const button=document.getElementById(id);if(!button)continue;button.dataset.shortcutTitle??=button.title||button.getAttribute('aria-label')||button.textContent;button.title=button.dataset.shortcutTitle+(bindings[id]?' · '+readableKey(bindings[id]):'')+' · Cmd/Ctrl+Shift+klik: sneltoets instellen';if(bindings[id])button.setAttribute('aria-keyshortcuts',readableKey(bindings[id],true));else button.removeAttribute('aria-keyshortcuts');}}
 function persist(next){try{localStorage.setItem('spatlap-custom-shortcuts-v1',JSON.stringify(next));bindings=next;paint();dialog.close();}catch{error().textContent='Bewaren in deze browser lukt niet. Je vorige sneltoets blijft gelden; het venster en je keuze blijven open.';}}
 dialog.querySelector('[data-shortcut-save]').onclick=()=>{const issue=combinationError(pending);if(issue){error().textContent=issue;return;}if(Object.entries(bindings).some(([id,key])=>id!==active&&key===pending)){error().textContent='Deze combinatie is al aan een andere actie gekoppeld.';return;}persist({...bindings,[active]:pending});};
 dialog.querySelector('[data-shortcut-remove]').onclick=()=>{const next={...bindings};delete next[active];persist(next);};dialog.querySelector('[data-shortcut-close]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>document.getElementById(active)?.focus({preventScroll:true}));
 document.addEventListener('click',event=>{const button=event.target.closest('button[id]');if(!button||!actions.includes(button.id)||!event.shiftKey||!(event.metaKey||event.ctrlKey)||dialog.open||document.querySelector('.app')?.inert)return;event.preventDefault();event.stopImmediatePropagation();active=button.id;pending=bindings[active]||'';dialog.querySelector('[data-shortcut-name]').textContent=button.dataset.shortcutTitle;label().textContent='Huidige sneltoets: '+(pending?readableKey(pending):'geen');input.value=pending?readableKey(pending):'';error().textContent='';dialog.showModal();input.focus();},true);
 // Installed before the fixed save/export shortcuts, so recording cannot run an
 // editor command or be intercepted by that command's capture listener.
 window.addEventListener('keydown',event=>{
  if(dialog.open&&event.target===input){if(['Escape','Tab'].includes(event.key)||event.isComposing)return;event.preventDefault();event.stopImmediatePropagation();if(['Meta','Control','Alt','Shift'].includes(event.key))return;pending=keyOf(event);input.value=readableKey(pending);error().textContent=combinationError(pending);return;}
  if(event.defaultPrevented||event.repeat||event.isComposing||event.target.closest?.('input,textarea,select,[contenteditable="true"]')||window.getSelection()?.toString()||document.querySelector('dialog[open],.modal-backdrop.open')||document.querySelector('.app')?.inert||document.body.classList.contains('selection-pipette-active')||document.body.classList.contains('feedback-picking'))return;
  const id=Object.keys(bindings).find(id=>bindings[id]===keyOf(event)),button=id&&document.getElementById(id);if(!button||button.disabled||!button.getClientRects().length)return;event.preventDefault();event.stopImmediatePropagation();button.click();
 },true);paint();
}
