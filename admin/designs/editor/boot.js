(()=>{
 if(['png','pdf'].includes(new URLSearchParams(location.search).get('designExport'))){
  document.documentElement.classList.add('design-export-only');
  document.querySelector('#previewBoot strong').textContent='Download voorbereiden…';
  document.getElementById('previewBootMessage').textContent='Het gekozen opgeslagen ontwerp wordt ingelezen. Je ontwerp wordt niet gewijzigd.';
  window.finishPreviewBoot=()=>{};
  window.addEventListener('error',event=>{if(!event.error&&event.target?.tagName!=='SCRIPT')return;document.getElementById('previewBootSpinner').hidden=true;document.getElementById('previewBootMessage').textContent='De downloadcode kon niet volledig laden. Herlaad dit tabblad om opnieuw te proberen.';},true);
  return;
 }
 const overlay=document.getElementById('previewBoot'),message=document.getElementById('previewBootMessage'),button=document.getElementById('previewBootContinue');let done=false;
 const timer=setTimeout(()=>{if(done)return;message.textContent='Laden duurt langer dan verwacht. Je kunt het werkgebied alvast tonen; lopende opslag wordt daarmee niet afgebroken.';button.hidden=false;},15000);
 const finish=()=>{done=true;clearTimeout(timer);document.documentElement.classList.remove('preview-booting');overlay.hidden=true;};
 button.onclick=finish;
 window.finishPreviewBoot=finish;
 window.addEventListener('error',event=>{if(done||(!event.error&&event.target?.tagName!=='SCRIPT'))return;message.textContent='De werkplek kon niet volledig laden. Toon het werkgebied om de beschikbare herstelopties te gebruiken.';button.hidden=false;},true);
 window.addEventListener('unhandledrejection',()=>{if(!done){message.textContent='Een onderdeel kon niet laden. Je kunt het werkgebied tonen.';button.hidden=false;}});
})();
