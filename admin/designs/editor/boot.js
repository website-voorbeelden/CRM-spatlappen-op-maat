(()=>{
 const overlay=document.getElementById('previewBoot'),message=document.getElementById('previewBootMessage'),button=document.getElementById('previewBootContinue');let done=false;
 const timer=setTimeout(()=>{if(done)return;message.textContent='Laden duurt langer dan verwacht. Je kunt het werkgebied alvast tonen; lopende opslag wordt daarmee niet afgebroken.';button.hidden=false;},15000);
 const finish=()=>{done=true;clearTimeout(timer);document.documentElement.classList.remove('preview-booting');overlay.hidden=true;};
 button.onclick=finish;
 window.finishPreviewBoot=finish;
 window.addEventListener('error',event=>{if(done||(!event.error&&event.target?.tagName!=='SCRIPT'))return;message.textContent='De werkplek kon niet volledig laden. Toon het werkgebied om de beschikbare herstelopties te gebruiken.';button.hidden=false;},true);
 window.addEventListener('unhandledrejection',()=>{if(!done){message.textContent='Een onderdeel kon niet laden. Je kunt het werkgebied tonen.';button.hidden=false;}});
})();
