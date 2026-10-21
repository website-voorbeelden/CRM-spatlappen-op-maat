// Reusable copy-only help: never sends account settings or calls an AI service.
export function openAiHelp({title='Uitleg voor een andere AI',getText,toast,includeLabel='Huidige inhoud meenemen'}){
 const dialog=document.createElement('dialog');dialog.className='ai-help-dialog';dialog.setAttribute('aria-label',title);
 const heading=document.createElement('h2'),intro=document.createElement('p'),area=document.createElement('textarea'),include=document.createElement('input'),label=document.createElement('label'),actions=document.createElement('div'),copy=document.createElement('button'),close=document.createElement('button'),status=document.createElement('p');
 heading.textContent=title;intro.textContent='Kopieer de uitleg naar de AI die je zelf gebruikt. Dit opent geen AI-verbinding en deelt geen API-sleutels of andere verbindingsgegevens.';
 area.readOnly=true;area.rows=15;area.setAttribute('aria-label','Kopieerbare AI-uitleg');include.type='checkbox';label.className='check-row';label.append(include,document.createTextNode(includeLabel));actions.className='actions';copy.type=close.type='button';copy.className='primary';copy.textContent='Uitleg kopiëren';close.textContent='Sluiten';status.setAttribute('role','status');
 function refresh(){area.value=getText({includeCurrent:include.checked});}include.onchange=refresh;
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(area.value);status.textContent='Gekopieerd. Plak dit in je andere AI.';toast?.('AI-uitleg gekopieerd');}catch{area.focus();area.select();status.textContent='Kopieer de geselecteerde uitleg met ⌘C of Ctrl+C.';}};
 close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});actions.append(copy,close);dialog.append(heading,intro,label,area,actions,status);document.body.append(dialog);refresh();dialog.showModal();copy.focus();return dialog;
}
