import {hexColor,rgbColor,rgbValues,samplePoint} from '../../shared/design-colors.js';
// Browser EyeDropper when available; local artwork magnifier as fallback. No provider.
export function installSelectionColors({readSelection,readDesignColors,applyColor,applyWholeColor,sampleCanvas}){
 const byId=id=>document.getElementById(id),button=byId('selectionColor'),pipette=byId('selectionPipette'),paint=byId('selectionPaint'),status=byId('selectionColorStatus'),dialog=byId('selectionColorDialog');
 const form=dialog.querySelector('form'),hex=byId('selectionColorHex'),swatch=byId('selectionColorSwatch'),rgb=byId('selectionColorRGB'),hsl=byId('selectionColorHSL');
 let opened=null,active=null,generation=0,suppressClick=false,chosenColor='#FFFFFF',nativeController=null;
 const hint=document.createElement('div');hint.className='selection-pipette-hint';hint.hidden=true;document.body.append(hint);
 const zoom=document.createElement('canvas');zoom.width=zoom.height=143;zoom.style.cssText='display:block;width:143px;height:143px;image-rendering:pixelated;margin-bottom:6px';const sampleLabel=document.createElement('div');hint.append(zoom,sampleLabel);
 let recent=[];try{const saved=JSON.parse(localStorage.getItem('spatlap-recent-colors-v1')||'[]');if(Array.isArray(saved))recent=[...new Set(saved.map(hexColor).filter(Boolean))].slice(0,16);}catch{}
 function remember(color){recent=[color,...recent.filter(c=>c!==color)].slice(0,16);try{localStorage.setItem('spatlap-recent-colors-v1',JSON.stringify(recent));}catch{}}
 function palette(id,colors,names=[]){const host=byId(id);host.replaceChildren();for(const [i,color] of colors.entries()){const item=document.createElement('button');item.type='button';item.style.background=color;item.title=(names[i]?names[i]+' · ':'')+color;item.setAttribute('aria-label',item.title);item.onclick=()=>showColor(color);host.append(item);}if(!colors.length){const empty=document.createElement('span');empty.className='field-help';empty.textContent='Nog geen kleuren';host.append(empty);}}
 function palettes(){palette('selectionBaseColors',['#FFFFFF','#000000','#333333'],['1. Wit','2. Zwart','3. Donkergrijs']);palette('selectionRecentColors',recent);palette('selectionDesignColors',[...new Set((readDesignColors?.()||[]).map(hexColor).filter(Boolean))].slice(0,80));}
 function hslValues(color){const [r,g,b]=rgbValues(color).map(n=>n/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;}return `${Math.round(h)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%`;}
 function parseRGB(value){const text=value.trim().replace(/^rgba?\(/i,'').replace(/\)$/,'');if(!/^\d{1,3}[ ,]+\d{1,3}[ ,]+\d{1,3}$/.test(text))return null;return rgbColor(text.split(/[ ,]+/).map(Number));}
 function parseHSL(value){const text=value.trim().replace(/^hsl\(/i,'').replace(/\)$/,'');const m=text.match(/^(-?[\d.]+)[ ,]+([\d.]+)%?[ ,]+([\d.]+)%?$/);if(!m)return null;let [h,s,l]=m.slice(1).map(Number);if(![h,s,l].every(Number.isFinite)||s>100||l>100)return null;h=((h%360)+360)%360;s/=100;l/=100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),offset=l-c/2,parts=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return rgbColor(parts.map(n=>Math.round((n+offset)*255)));}
 const message=value=>{status.textContent=value;};
 function target(){return paint.value;}
 function refresh(){const info=readSelection(target());byId('selectionWholeLogo').hidden=!info.wholeLogo;button.disabled=pipette.disabled=!info.enabled;button.title=info.reason||'Kleur kiezen';pipette.title=info.reason||(typeof window.EyeDropper==='function'?'Pipet: kleur op het scherm kiezen. Shift+klik voor artworkloep.':'Artworkpipet. Voor kleuren buiten deze tab is een browser met schermpipet nodig.');paint.hidden=!info.piece;button.querySelector('span').style.background=chosenColor;button.setAttribute('aria-label',info.piece?'Kleur van geselecteerd vectoronderdeel':'Kleur van selectie');}
 function showColor(value){const color=hexColor(value);if(!color)return;chosenColor=color;hex.value=color;swatch.style.background=color;rgb.value=rgbValues(color).join(', ');hsl.value=hslValues(color);for(const input of [hex,rgb,hsl])input.setCustomValidity('');palettes();dialog.querySelector('[role="alert"]').textContent='';}
 button.onclick=()=>{opened=readSelection(target());if(!opened.enabled){message(opened.reason);return;}byId('selectionColorScope').textContent=opened.description;showColor(chosenColor);dialog.showModal();hex.focus();};
 for(const [input,parse] of [[rgb,parseRGB],[hsl,parseHSL]])input.oninput=()=>{const value=input.value,position=input.selectionStart,color=parse(value);input.setCustomValidity(color?'':'Vul een geldige kleurwaarde in.');if(color){showColor(color);input.value=value;input.setSelectionRange(position,position);}};
 hex.oninput=()=>{const color=hexColor(hex.value);hex.setCustomValidity(color?'':'Vul een geldige HEX-kleur in.');if(color){const position=hex.selectionStart,typed=hex.value;showColor(color);hex.value=typed;hex.setSelectionRange(position,position);}};
 dialog.querySelector('[data-color-cancel]').onclick=()=>dialog.close();
 form.onsubmit=e=>{e.preventDefault();const color=hexColor(hex.value),error=dialog.querySelector('[role="alert"]');if(!color){error.textContent='Vul een geldige HEX-kleur in, bijvoorbeeld #FF6600.';return;}try{applyColor(color,opened.signature,target());remember(color);dialog.close();message('Kleur '+color+' toegepast.');refresh();}catch(err){error.textContent=err.message;}};
 dialog.querySelectorAll('[data-selection-swatch]').forEach(b=>b.onclick=()=>showColor(b.dataset.selectionSwatch));
 byId('selectionApplyWholeLogo').onclick=()=>{if(!form.reportValidity())return;const color=hexColor(hex.value);if(!color){dialog.querySelector('[role="alert"]').textContent='Vul een geldige HEX-kleur in.';return;}try{applyWholeColor(color,opened.signature,target());remember(color);dialog.close();message('Kleur op het hele logo toegepast.');refresh();}catch(error){dialog.querySelector('[role="alert"]').textContent=error.message;}};
 paint.onchange=refresh;
 function stop(text=''){generation++;nativeController?.abort();nativeController=null;active?.overlay.remove();active=null;document.body.classList.remove('selection-pipette-active');hint.hidden=true;pipette.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 5 5 5M16 3l5 5-3 3-5-5zM14 8 4 18l-1 4 4-1L17 11M6 16l2 2"/></svg>';pipette.title='Pipet: kleur uit ontwerp kiezen';pipette.setAttribute('aria-label',pipette.title);pipette.disabled=false;message(text);refresh();}
 async function start(event){
  if(active||nativeController){stop('Pipet gestopt.');return;}
  const info=readSelection(target());if(!info.enabled){message(info.reason);return;}
  const run=++generation;pipette.disabled=true;message('Pipet voorbereiden…');
  try{
   if(typeof window.EyeDropper==='function'&&!event?.shiftKey){
    nativeController=new AbortController();document.body.classList.add('selection-pipette-active');message('Kies een kleur op je scherm; Esc annuleert.');
    const channel=target(),result=await new window.EyeDropper().open({signal:nativeController.signal});
    if(run!==generation)return;
    if(readSelection(channel).signature!==info.signature)throw Error('Je selectie of ontwerp is gewijzigd. Kies opnieuw een kleur.');
    const color=hexColor(result.sRGBHex);if(!color)throw Error('Geen geldige schermkleur ontvangen.');
    stop('Schermkleur gekozen; bevestig met Kleur toepassen.');paint.value=channel;opened=readSelection(channel);byId('selectionColorScope').textContent=opened.description;showColor(color);refresh();dialog.showModal();hex.focus();return;
   }
   const canvas=await sampleCanvas();if(run!==generation)return;
   if(readSelection(target()).signature!==info.signature)throw Error('Je selectie of ontwerp is intussen gewijzigd. Start het pipet opnieuw.');
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.getImageData(0,0,1,1);
   const overlay=document.createElement('div');overlay.className='selection-pipette-overlay';byId('flap').append(overlay);document.body.classList.add('selection-pipette-active');active={ctx,canvas,signature:info.signature,paint:target(),overlay};pipette.textContent='×';pipette.title='Pipet stoppen';pipette.setAttribute('aria-label',pipette.title);message('Klik op een kleur in je ontwerp. Esc = annuleren.');
  }catch(err){if(run===generation)stop(err.name==='AbortError'?'Pipet geannuleerd.':'Pipet niet beschikbaar: '+err.message+' Shift+klik op het pipet voor de artworkloep.');}finally{if(run===generation){nativeController=null;if(!active)document.body.classList.remove('selection-pipette-active');pipette.disabled=false;}}
 }
 pipette.onclick=start;
 function sampled(event){if(!active)return null;const p=samplePoint(event.clientX,event.clientY,byId('flap').getBoundingClientRect(),active.canvas.width,active.canvas.height);if(!p)return null;const pixel=active.ctx.getImageData(p.x,p.y,1,1).data;return rgbColor([...pixel].slice(0,3));}
 document.addEventListener('pointermove',e=>{if(!active)return;const color=sampled(e);if(!color){hint.hidden=true;return;}hint.hidden=false;sampleLabel.textContent=color;hint.style.setProperty('--picked-color',color);
 const p=samplePoint(e.clientX,e.clientY,byId('flap').getBoundingClientRect(),active.canvas.width,active.canvas.height),context=zoom.getContext('2d');context.clearRect(0,0,143,143);context.imageSmoothingEnabled=false;
 for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++){const px=p.x+x,py=p.y+y;if(px>=0&&py>=0&&px<active.canvas.width&&py<active.canvas.height)context.drawImage(active.canvas,px,py,1,1,(x+5)*13,(y+5)*13,13,13);}
 context.strokeStyle='#8888';context.lineWidth=1;for(let n=0;n<=11;n++){context.beginPath();context.moveTo(n*13+.5,0);context.lineTo(n*13+.5,143);context.moveTo(0,n*13+.5);context.lineTo(143,n*13+.5);context.stroke();}context.strokeStyle='#fff';context.lineWidth=3;context.strokeRect(65,65,13,13);context.strokeStyle='#111';context.lineWidth=1;context.strokeRect(65,65,13,13);
hint.style.left=Math.max(4,Math.min(innerWidth-175,e.clientX+16))+'px';hint.style.top=Math.max(4,Math.min(innerHeight-205,e.clientY+16))+'px';},true);
 document.addEventListener('pointerdown',e=>{
  if(!active)return;e.preventDefault();e.stopImmediatePropagation();
  suppressClick=true;setTimeout(()=>suppressClick=false,500);
  if(e.target.closest('#selectionPipette')){stop('Pipet gestopt.');return;}
  const color=sampled(e);if(!color){message('Klik binnen de preview om een kleur te kiezen, of druk Esc.');return;}
  const {signature,paint:channel}=active;
  try{if(readSelection(channel).signature!==signature)throw Error('Selectie gewijzigd. Kies opnieuw een kleur.');stop('Kleur gekozen; klik op Kleur toepassen om te bevestigen.');paint.value=channel;opened=readSelection(channel);byId('selectionColorScope').textContent=opened.description;showColor(color);refresh();dialog.showModal();hex.focus();}catch(err){stop(err.message);}
 },true);
 document.addEventListener('click',e=>{if(suppressClick){suppressClick=false;if(e.target.closest('#flap')){e.preventDefault();e.stopImmediatePropagation();}}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(active||nativeController||pipette.disabled)){e.preventDefault();e.stopImmediatePropagation();stop('Pipet geannuleerd.');}},true);
 window.addEventListener('blur',()=>{if(active)stop('Pipet gestopt.');});
 refresh();return {refresh,stop};
}
