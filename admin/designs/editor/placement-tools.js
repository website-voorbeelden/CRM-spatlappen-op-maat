// Explicit geometry preferences only: never store artwork, text, fonts or dossier IDs.
function distributeArtwork(axis){
 if(vectorEditingLogoId)return;
 const refs=allSelectedRefs(),low=axis==='x'?'left':'top',high=axis==='x'?'right':'bottom',extent=axis==='x'?state.flap.w:state.flap.h,entries=refs.map(ref=>({ref,box:layoutBox(ref)}));
 if(refs.length<3){toast('Selecteer minstens drie onderdelen om gelijk te verdelen.');return;}
 if(!Number.isFinite(extent)||extent<=0||entries.some(entry=>!entry.box||![entry.box[low],entry.box[high]].every(Number.isFinite))){toast('De selectiegrenzen zijn nog niet beschikbaar. Probeer opnieuw nadat het ontwerp geladen is.');return;}
 entries.sort((a,b)=>a.box[low]-b.box[low]);
 const start=Math.min(...entries.map(entry=>entry.box[low])),end=Math.max(...entries.map(entry=>entry.box[high])),space=end-start,size=entries.reduce((sum,entry)=>sum+entry.box[high]-entry.box[low],0),epsilon=Math.max(1,space)*1e-8;
 if(space-size < -epsilon){toast('Te weinig ruimte om zonder overlap te verdelen. Verplaats de buitenste onderdelen verder uit elkaar.');return;}
 const gap=Math.max(0,(space-size)/(entries.length-1));let cursor=start;
 const moves=entries.map(entry=>{const delta=cursor-entry.box[low];cursor+=entry.box[high]-entry.box[low]+gap;return {...entry,delta};});
 if(moves.every(entry=>Math.abs(entry.delta)<epsilon)){toast('De onderdelen zijn al gelijk verdeeld.');return;}
 pushHistory();for(const entry of moves)itemById(entry.ref.id,entry.ref.type)[axis]+=entry.delta/extent;
 syncSelectionControls();render();toast('Gelijk verdeeld met '+Number(gap.toFixed(2))+' cm vrije ruimte.');
}
function validPlacementPreset(preset){
 if(!preset||typeof preset!=='object'||preset.version!==undefined&&![1,2].includes(preset.version)||!Number.isFinite(preset.w)||!Number.isFinite(preset.h)||preset.w<=0||preset.h<=0||!Array.isArray(preset.geometry)||!preset.geometry.length||preset.geometry.length>400)return false;
 return preset.geometry.every(g=>g&&['logo','text'].includes(g.type)&&[g.x,g.y,g.type==='logo'?g.w:g.size,g.type==='logo'?g.h:g.size].every(Number.isFinite)&&Math.abs(g.x)<=100&&Math.abs(g.y)<=100&&(g.type==='logo'?g.w>=.1&&g.h>=.1&&g.w<=10000&&g.h<=10000:g.size>=.1&&g.size<=10000)&&[0,90,180,270].includes(g.rotation)&&typeof g.flipX==='boolean');
}
function installPlacementTools(){
 const body=$('placementSettings').querySelector('.subdetails-body')||$('placementSettings'),actions=document.createElement('div');actions.className='mini-actions';
 for(const [axis,name]of [['x','Horizontaal verdelen'],['y','Verticaal verdelen']]){const button=document.createElement('button');button.type='button';button.textContent=name;button.onclick=()=>distributeArtwork(axis);actions.append(button);}body.append(actions);
 const host=document.createElement('details');host.className='subdetails';host.innerHTML='<summary>Eigen plaatsingsvoorkeuren</summary><p class="field-help">Alleen na Bewaren. Geen logo’s, tekstinhoud of klantgegevens. Dezelfde spatlapmaat en aantallen logo’s/teksten zijn nodig. Nieuwe voorkeuren volgen de volgorde in je logo- en tekstlijst; oude voorkeuren houden hun links-rechtsvolgorde.</p><label>Naam<input data-layout-name maxlength="80" placeholder="Bijvoorbeeld twee zijlogo’s en middenlogo"></label><button type="button" data-layout-save>Indeling als voorkeur bewaren</button><label>Bewaarde indeling<select data-layout-preset></select></label><div class="mini-actions"><button type="button" data-layout-use>Toepassen</button><button type="button" data-layout-delete>Voorkeur verwijderen</button><button type="button" data-layout-refresh>Voorkeuren opnieuw ophalen</button></div><p data-layout-status role="status" class="field-help"></p>';body.append(host);
 const select=host.querySelector('select'),status=host.querySelector('[data-layout-status]'),key='spatlap-layout-presets-v1';let presets=[],basis=null,readIssue=false;
 function read(value){const parsed=JSON.parse(value||'[]');if(!Array.isArray(parsed))throw Error('Ongeldige voorkeurenlijst.');return parsed;}
 try{basis=localStorage.getItem(key);presets=read(basis);}catch{readIssue=true;status.textContent='Plaatsingsvoorkeuren konden niet worden geladen. Probeer Voorkeuren opnieuw ophalen; bestaande opslag wordt niet overschreven.';}
 const ordered=preset=>{const refs=layoutRefs();return preset?.version===2?refs:refs.sort((a,b)=>a.type.localeCompare(b.type)||itemById(a.id,a.type).x-itemById(b.id,b.type).x||itemById(a.id,a.type).y-itemById(b.id,b.type).y);};
 function paint(){const previous=select.value;select.replaceChildren(new Option('Kies een indeling',''));presets.forEach((preset,index)=>select.add(new Option(String(preset?.name||'Indeling').slice(0,80)+(validPlacementPreset(preset)?'':' · ongeldige voorkeur'),String(index))));if([...select.options].some(option=>option.value===previous))select.value=previous;}
 function store(next){try{if(readIssue){status.textContent='Haal eerst de bestaande voorkeuren opnieuw op; er wordt niets overschreven.';return false;}if(localStorage.getItem(key)!==basis){status.textContent='De voorkeuren zijn in een andere tab gewijzigd. Klik op Voorkeuren opnieuw ophalen; je huidige ontwerp en ingevoerde naam blijven behouden.';return false;}const value=JSON.stringify(next);localStorage.setItem(key,value);basis=value;presets=next;paint();return true;}catch{status.textContent='Bewaren in deze browser lukt niet. Je ontwerp en invoer blijven behouden.';return false;}}
 host.querySelector('[data-layout-save]').onclick=()=>{
  const name=host.querySelector('[data-layout-name]').value.trim(),refs=ordered({version:2});if(!name||name.length>80||!refs.length){status.textContent='Vul een naam in en voeg eerst onderdelen toe.';return;}
  if(presets.length>=20){status.textContent='Maximaal twintig indelingen. Verwijder eerst een oude voorkeur.';return;}
  if(presets.some(preset=>String(preset?.name||'').toLocaleLowerCase('nl')===name.toLocaleLowerCase('nl'))){status.textContent='Deze naam bestaat al. Kies een andere naam; de bestaande voorkeur blijft behouden.';return;}
  const geometry=refs.map(ref=>{const object=itemById(ref.id,ref.type);return {type:ref.type,x:object.x,y:object.y,...(ref.type==='logo'?{w:object.w,h:object.h}:{size:object.size}),rotation:artworkRotation(object),flipX:object.flipX===true};}),preset={version:2,name,w:state.flap.w,h:state.flap.h,geometry};
  if(!validPlacementPreset(preset)){status.textContent='De indeling bevat ongeldige maten of te veel onderdelen. Er is niets bewaard.';return;}
  if(store([...presets,preset])){select.value=String(presets.length-1);status.textContent='Plaatsingsvoorkeur bewaard in deze browser. Er is niets automatisch toegepast.';}
 };
 host.querySelector('[data-layout-delete]').onclick=()=>{if(select.value==='')return;const index=Number(select.value);if(store(presets.filter((_,i)=>i!==index))){select.value='';status.textContent='Voorkeur verwijderd; het ontwerp is niet gewijzigd.';}};
 host.querySelector('[data-layout-use]').onclick=()=>{
  const preset=select.value===''?null:presets[Number(select.value)],refs=ordered(preset);
  if(!validPlacementPreset(preset)||preset.w!==state.flap.w||preset.h!==state.flap.h||preset.geometry.length!==refs.length||preset.geometry.some((g,i)=>g.type!==refs[i].type)){status.textContent='Deze voorkeur past niet bij de maat of onderdelen van dit ontwerp.';return;}
  if(vectorEditingLogoId){status.textContent='Rond eerst de losse SVG-bewerking af.';return;}
  const signature=JSON.stringify([state.flap,refs.map(ref=>itemById(ref.id,ref.type))]);
  if(!window.confirm('De plaatsing en formaten vervangen door deze voorkeur? Teksten, kleuren, lettertypen en logo-inhoud blijven gelijk.'))return;
  if(JSON.stringify([state.flap,ordered(preset).map(ref=>itemById(ref.id,ref.type))])!==signature){status.textContent='Het ontwerp is intussen gewijzigd. Kies de voorkeur opnieuw.';return;}
  pushHistory();refs.forEach((ref,index)=>{const g=preset.geometry[index],object=itemById(ref.id,ref.type);Object.assign(object,{x:g.x,y:g.y,rotation:g.rotation,flipX:g.flipX,...(ref.type==='logo'?{w:g.w,h:g.h,ratio:g.w/g.h}:{size:g.size})});});syncSelectionControls();render();status.textContent='Indeling toegepast. Ongedaan maken blijft beschikbaar.';
 };host.querySelector('[data-layout-refresh]').onclick=()=>{try{const value=localStorage.getItem(key),next=read(value);basis=value;presets=next;readIssue=false;paint();select.value='';status.textContent='Voorkeuren opnieuw opgehaald. Je ontwerp en ingevoerde naam zijn behouden.';}catch{readIssue=true;status.textContent='Voorkeuren ophalen lukt niet. Bestaande opslag, ontwerp en invoer blijven behouden.';}};paint();installPlacementLearning(body);
}

let placementLearningController=null;
function rememberPlacementAfterSave(payload){placementLearningController?.observe(payload);}
function installPlacementLearning(body){
 const key='spatlap-placement-learning-v1',host=document.createElement('details');host.className='subdetails';
 host.innerHTML='<summary>Leren van bewaarde plaatsingen</summary><label class="check-row"><input type="checkbox" data-placement-learn>Mijn plaatsing onthouden na succesvol bewaren</label><p class="field-help">Alleen formaten en posities, geen logo’s, teksten of klantgegevens. Veelgebruikte indelingen worden voorgesteld bij dezelfde aantallen en een vergelijkbare spatlap. Toepassen blijft jouw keuze; toevallige sleepbewegingen worden niet geleerd.</p><div class="mini-actions"><button type="button" data-placement-suggest>Geleerde indeling toepassen</button><button type="button" data-placement-forget>Geleerde plaatsingen wissen</button></div><p class="field-help" role="status" data-placement-learn-status></p>';body.append(host);
 const enabled=host.querySelector('input'),status=host.querySelector('[data-placement-learn-status]');let suppressLearning=false;
 function read(){const raw=localStorage.getItem(key),data=raw?JSON.parse(raw):{version:1,enabled:false,patterns:[]};if(data?.version!==1||typeof data.enabled!=='boolean'||!Array.isArray(data.patterns)||data.patterns.length>20||data.patterns.some(pattern=>!validPlacementPreset(pattern)||!Number.isSafeInteger(pattern.hits)||pattern.hits<1||typeof pattern.shape!=='string'||!Number.isSafeInteger(pattern.at)||pattern.at<0))throw Error('Geleerde plaatsingen zijn niet leesbaar. Bestaande opslag blijft behouden.');return {raw,data};}
 function store(basis,data){if(localStorage.getItem(key)!==basis)throw Error('De leerinstellingen zijn elders gewijzigd. Kies de actie opnieuw.');localStorage.setItem(key,JSON.stringify(data));enabled.checked=data.enabled;}
 function geometry(payload){return [...(payload.l||[]).map(object=>({type:'logo',x:object.x,y:object.y,w:object.w,h:object.h,rotation:artworkRotation(object),flipX:object.flipX===true})),...(payload.t||[]).map(object=>({type:'text',x:object.x,y:object.y,size:object.size,rotation:artworkRotation(object),flipX:object.flipX===true}))];}
 const fingerprint=pattern=>JSON.stringify([pattern.w,pattern.h,pattern.shape,pattern.geometry.map(g=>Object.fromEntries(Object.entries(g).map(([k,v])=>[k,typeof v==='number'?Math.round(v*100000)/100000:v])))]);
 function observe(payload){try{
  if(suppressLearning)return;
  const {raw,data}=read();enabled.checked=data.enabled;if(!data.enabled)return;
  const pattern={version:2,w:payload.f.w,h:payload.f.h,shape:payload.f.shape,geometry:geometry(payload),hits:1,at:Date.now()};if(!validPlacementPreset(pattern))return;
  const same=data.patterns.find(item=>fingerprint(item)===fingerprint(pattern));if(same){same.hits=Math.min(1000000,same.hits+1);same.at=pattern.at;}else{data.patterns.push(pattern);data.patterns.sort((a,b)=>b.hits-a.hits||b.at-a.at);data.patterns=data.patterns.slice(0,20);}
  store(raw,data);status.textContent='Plaatsing geleerd na bewaren. De inhoud van je ontwerp is niet opgenomen.';
 }catch(error){status.textContent='Het ontwerp is bewaard; de plaatsingsvoorkeur kon niet worden geleerd. '+error.message;}}
 enabled.onchange=()=>{suppressLearning=!enabled.checked;try{const {raw,data}=read();data.enabled=enabled.checked;store(raw,data);status.textContent=data.enabled?'Leren staat aan voor volgende succesvolle bewaaracties.':'Leren staat uit; je kunt de bestaande plaatsingen nog bewust gebruiken of wissen.';}catch(error){suppressLearning=true;enabled.checked=false;status.textContent='Leren is in dit tabblad gestopt; de browserinstelling kon niet worden bewaard. '+error.message;}};
 host.querySelector('[data-placement-forget]').onclick=()=>{try{const {raw,data}=read();if(!window.confirm('Alleen de automatisch geleerde geometrie wissen? Je ontwerpen en benoemde voorkeuren blijven behouden.'))return;data.patterns=[];data.enabled=enabled.checked&&!suppressLearning;store(raw,data);status.textContent='Geleerde plaatsingen gewist.';}catch(error){
   try{const basis=localStorage.getItem(key);if(!window.confirm('De leergegevens zijn niet leesbaar. Alleen deze geleerde voorkeuren wissen en leren uitzetten? Ontwerpen en benoemde indelingen blijven behouden.'))return;if(localStorage.getItem(key)!==basis)throw Error('De gegevens zijn elders gewijzigd. Kies opnieuw.');localStorage.removeItem(key);suppressLearning=true;enabled.disabled=false;enabled.checked=false;status.textContent='Leerinstellingen hersteld en leren uitgezet.';}catch(problem){status.textContent=problem.message;}
  }};
 host.querySelector('[data-placement-suggest]').onclick=()=>{try{
  const {data}=read(),refs=layoutRefs();if(vectorEditingLogoId)throw Error('Rond eerst de losse SVG-bewerking af.');
  const candidates=data.patterns.filter(p=>p.shape===state.flap.shape&&Math.abs((p.w/p.h)/(state.flap.w/state.flap.h)-1)<=.05&&p.geometry.length===refs.length&&p.geometry.every((g,i)=>g.type===refs[i].type)).sort((a,b)=>b.hits-a.hits||Math.abs(a.w-state.flap.w)-Math.abs(b.w-state.flap.w)||b.at-a.at);
  const pattern=candidates[0];if(!pattern)throw Error('Nog geen passende geleerde plaatsing. Bewaar eerst een goed ingedeeld ontwerp met leren aan.');
  const basis=JSON.stringify([state.flap,refs.map(ref=>itemById(ref.id,ref.type))]),sx=state.flap.w/pattern.w,sy=state.flap.h/pattern.h;
  const changes=pattern.geometry.map((g,index)=>{const object=itemById(refs[index].id,refs[index].type),copy={...object,x:g.x,y:g.y,rotation:g.rotation,flipX:g.flipX};if(g.type==='logo'){copy.w=g.w*sx;copy.h=copy.w/(object.ratio||object.w/object.h);const quarter=[90,270].includes(copy.rotation),w=quarter?copy.h:copy.w,h=quarter?copy.w:copy.h;if(w>state.flap.w||h>state.flap.h||copy.x*state.flap.w<w/2||copy.x*state.flap.w>state.flap.w-w/2||copy.y*state.flap.h<h/2||copy.y*state.flap.h>state.flap.h-h/2)throw Error('Het huidige logo past niet op deze geleerde plek. Je ontwerp is behouden; gebruik de gewone plaatsingshulp.');}else copy.size=g.size*Math.min(sx,sy);return copy;});
  if(!validPlacementPreset({version:2,w:state.flap.w,h:state.flap.h,geometry:changes.map((g,i)=>({...g,type:refs[i].type}))}))throw Error('De geleerde formaten passen niet binnen de ondersteunde maten. Je ontwerp is behouden.');
  if(!window.confirm('De meestgebruikte passende indeling toepassen ('+pattern.hits+' keer bewaard)? Logo-inhoud, tekst, font en kleuren blijven behouden.'))return;
  if(JSON.stringify([state.flap,refs.map(ref=>itemById(ref.id,ref.type))])!==basis)throw Error('Het ontwerp is gewijzigd. Vraag de plaatsing opnieuw op.');
  pushHistory();refs.forEach((ref,i)=>{const g=changes[i],object=itemById(ref.id,ref.type);Object.assign(object,{x:g.x,y:g.y,rotation:g.rotation,flipX:g.flipX,...(ref.type==='logo'?{w:g.w,h:g.h}:{size:g.size})});});syncSelectionControls();render();status.textContent='Geleerde indeling toegepast. Controleer de zichtbare ruimte; je kunt dit ongedaan maken.';
 }catch(error){status.textContent=error.message;}};
 try{const {data}=read();enabled.checked=data.enabled;}catch(error){enabled.disabled=true;status.textContent=error.message;}
 placementLearningController={observe};
}
