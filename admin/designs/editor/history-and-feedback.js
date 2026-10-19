// Classic editor helpers; loaded before runtime.js. See README.md for the shared state contract.
function cloneState(){
  return JSON.parse(JSON.stringify(state));
}

function updateHistoryButtons(){
  $('undo').disabled=history.length===0;
  $('redo').disabled=redoHistory.length===0;
}

function pushHistory(){
  if(suppressHistory)return;
  history.push(cloneState());
  if(history.length>50)history.shift();
  redoHistory=[];
  updateHistoryButtons();
}

function undo(){
  if(!history.length)return;
  suppressHistory=true;
  redoHistory.push(cloneState());
  state=history.pop();
  syncUIFromState();
  render();
  suppressHistory=false;
  updateHistoryButtons();
  toast('Wijziging ongedaan gemaakt');
}

function redo(){
  if(!redoHistory.length)return;
  suppressHistory=true;
  history.push(cloneState());
  state=redoHistory.pop();
  syncUIFromState();
  render();
  suppressHistory=false;
  updateHistoryButtons();
  toast('Wijziging opnieuw uitgevoerd');
}

function previewPaintTick(){return new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));}

function paintPreviewActivity(){
  const bar=$('previewActivity'),copy=$('previewActivityText'),close=$('previewActivityClose');
  const pending=[...previewActivities.values()],error=previewActivityResult?.kind==='error';
  const result=error?previewActivityResult:pending.length?{kind:'busy',text:pending.at(-1)+(pending.length>1?` (${pending.length} handelingen bezig)`:'')}:previewActivityResult;
  bar.hidden=!result;if(!result)return;bar.dataset.state=result.kind;bar.setAttribute('aria-busy',String(pending.length>0));copy.textContent=result.text;
  close.disabled=pending.length>0;close.hidden=pending.length>0;
}

function beginPreviewActivity(label,buttonIds=[]){
  const id=++previewActivityId;clearTimeout(previewActivityTimer);previewActivityResult=null;previewActivities.set(id,label);
  const buttons=buttonIds.map($).filter(Boolean);
  buttons.forEach(button=>{let tracked=previewButtonActivities.get(button);if(!tracked){tracked={count:0,label:button.textContent,disabled:button.disabled,busy:button.getAttribute('aria-busy')};previewButtonActivities.set(button,tracked);}tracked.count++;button.disabled=true;button.textContent=button.id==='headerSave'?(/bewar/i.test(label)?'Bewaren…':'Laden…'):label;button.setAttribute('aria-busy','true');});paintPreviewActivity();let finished=false;
  function finish(kind,text){
    if(finished)return;finished=true;previewActivities.delete(id);
    buttons.forEach(button=>{const tracked=previewButtonActivities.get(button);if(!tracked||--tracked.count>0)return;button.textContent=tracked.label;button.disabled=tracked.disabled;if(tracked.busy===null)button.removeAttribute('aria-busy');else button.setAttribute('aria-busy',tracked.busy);previewButtonActivities.delete(button);});
    if(previewActivityResult?.kind!=='error'||kind==='error')previewActivityResult={kind,text};paintPreviewActivity();
    if(!previewActivities.size&&previewActivityResult?.kind!=='error')previewActivityTimer=setTimeout(()=>{previewActivityResult=null;paintPreviewActivity();},6500);
  }
  return {success:message=>finish('success',message),cancel:message=>finish('info',message||'Geannuleerd.'),error:error=>finish('error','Niet gelukt: '+(error?.message||String(error||'Probeer opnieuw.')))};
}

function toast(message){
  const el=$('toast');
  if(!el)return;
  el.textContent=message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),1800);
}
