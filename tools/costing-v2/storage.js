(function(g){
 'use strict';
 const supplierView=new URLSearchParams(location.search).get('presentatie')==='leverancier';
 const api=g.CrmCostCalculator,key='maatwerkkunststof:costing-v2:calculation-v1'+(supplierView?':leveranciersoverleg':''),status=document.querySelector('#v2-status');
 let baseline='',dirty=false;
 const savedState=document.getElementById('v2-save-state');
 const saveLabel=text=>{if(savedState)savedState.textContent=text;};
 saveLabel('Nieuwe berekening · nog niet bewaard');
 const tell=text=>{status.textContent=text;};
 g.GasketV2Download=function(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,140);document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function check(raw){
   let v=raw&&raw.format==='gasket-costing-v2'?raw.inputs:raw;
   if(raw&&raw.format==='gasket-costing-v2'&&raw.version!==1)throw Error('Deze bestandsversie wordt nog niet ondersteund.');
   if(!v||!Array.isArray(v.pieces)||!v.pieces.length||v.pieces.length>50||!Array.isArray(v.scenarios)||!v.scenarios.length||v.scenarios.length>20)throw Error('Gebruik 1–50 stukken en 1–20 leveranciers.');
   function bounded(value,depth){if(depth>12)throw Error('Het bestand heeft te veel geneste gegevens.');if(typeof value==='number'&&!Number.isFinite(value))throw Error('Ongeldig getal.');if(typeof value==='string'&&value.length>250000)throw Error('Een tekstveld is te lang.');if(value&&typeof value==='object'){if(Object.keys(value).length>250)throw Error('Te veel gegevens in een veld.');for(const k of Object.keys(value)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Ongeldige veldnaam.');bounded(value[k],depth+1);}}}
   bounded(v,0);
   let total=0;v.pieces.forEach(p=>{if(!p||typeof p!=='object'||Array.isArray(p)||!Number.isInteger(p.quantity)||p.quantity<1||p.quantity>2000)throw Error('Gebruik per stukregel een geheel aantal van 1–2000.');total+=p.quantity;
     for(const k of ['width','height','outerDiameter','innerDiameter','innerWidth','innerHeight','thickness','cornerRadius','innerRadius','notchWidth','notchHeight','holeDiameter'])if(p[k]!=null&&(!Number.isFinite(p[k])||p[k]<0||p[k]>100000))throw Error('Ongeldige maat: '+k+'.');
     if(p.holeCoordinates!=null&&typeof p.holeCoordinates!=='string')throw Error('Coördinaten moeten tekst zijn.');
   });if(total>3000)throw Error('Maximaal 3000 stuks in deze lokale proefversie.');
   const result=g.QuoteCalculatorCore.normalizeState(v); // Validate structure before replacing the current calculation.
   g.QuoteCalculatorCore.calculate(result,g.GasketConfiguratorNesting);
   return result;
 }
 function serial(){return JSON.stringify(api.exportState());}
 function mark(){try{dirty=serial()!==baseline;}catch{dirty=true;}if(dirty)saveLabel('Wijzigingen nog niet bewaard');}
 function envelope(){return {format:'gasket-costing-v2',version:1,inputs:api.exportState()};}
 if(supplierView){document.getElementById('v2-original').hidden=true;document.getElementById('v2-supplier-view').hidden=true;document.querySelector('.v2-bar strong span').textContent='Leveranciersoverleg';}
 document.getElementById('v2-new').addEventListener('click',()=>{if(!confirm('Een nieuwe berekening beginnen? Bewaar of download de huidige berekening eerst als je die wilt houden.'))return;g.dispatchEvent(new Event('crm-v2-reset'));api.importState(g.QuoteCalculatorCore.defaultState());baseline=serial();dirty=false;saveLabel('Nieuwe berekening · nog niet bewaard');tell('Nieuwe berekening. Vul de materiaalprijzen en bewerkingstarieven in.');});
 baseline=serial();
 try{const saved=localStorage.getItem(key);if(saved){if(saved.length>1000000)throw Error('De bewaarde berekening is te groot.');api.importState(check(JSON.parse(saved)));baseline=serial();saveLabel('Bewaard in deze browser');tell('Je bewaarde berekening is geopend.');}}
 catch(e){tell('De bewaarde berekening kon niet worden geopend: '+e.message+' De opgeslagen versie blijft behouden.');}
 g.addEventListener('crm-costing-change',mark);
 g.addEventListener('crm-v2-source-loaded',event=>{if(event.detail?.snapshot===serial()){baseline=serial();dirty=false;saveLabel(event.detail.label);}});
 g.addEventListener('crm-v2-saved',event=>{if(event.detail?.snapshot===serial()){baseline=serial();dirty=false;saveLabel('Bewaard bij '+event.detail.customer);}});
 g.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 document.querySelector('#v2-save').addEventListener('click',()=>{try{const payload=envelope();check(payload);const text=JSON.stringify(payload);if(text.length>1000000)throw Error('De berekening is te groot.');localStorage.setItem(key,text);baseline=serial();dirty=false;saveLabel('Bewaard in deze browser');tell('Berekening bewaard in deze browser.');}catch(e){tell('Bewaren is niet gelukt: '+e.message+' Gebruik Berekening downloaden.');}});
 document.querySelector('#v2-export').addEventListener('click',()=>{g.GasketV2Download(JSON.stringify(envelope(),null,2),'onderdelen-berekening.json','application/json');tell('V2-berekening gedownload. Met Berekening openen lees je hem later opnieuw in.');});
 document.querySelector('#v2-import').addEventListener('change',async e=>{const input=e.target,file=input.files[0];if(!file)return;const original=serial();try{if(file.size>1000000)throw Error('Maximaal 1 MB toegestaan.');const text=await file.text(),next=check(JSON.parse(text));if(serial()!==original)throw Error('De berekening is intussen gewijzigd. Kies het bestand opnieuw.');if(!confirm('Dit vervangt alleen de huidige V2-invoer. Download of bewaar die eerst als je hem wilt houden. Openen?'))return;g.dispatchEvent(new Event('crm-v2-reset'));api.importState(next);dirty=true;saveLabel('Geopend bestand · nog niet bewaard');tell('Berekening geopend als V2-invoer. Bewaren blijft een aparte actie.');}catch(err){tell('Openen is niet gelukt: '+err.message+' Je huidige invoer is behouden.');}finally{input.value='';}});
 g.GasketV2CornerDialog=function(piece,onApply){
   const {w,h}=g.GasketV2Geometry.dimensions(piece),dialog=document.createElement('dialog');
   dialog.innerHTML='<form><h2>Vier hoekgaten</h2><p>Symmetrisch vanaf de buitenranden. Je kunt de coördinaten daarna afzonderlijk aanpassen.</p><label>Afstand gatcentrum tot linker/rechter rand mm <input name="x" type="number" min="0.01" step="any" required value="'+Math.min(15,w/4)+'"></label><label>Afstand gatcentrum tot boven/onderrand mm <input name="y" type="number" min="0.01" step="any" required value="'+Math.min(15,h/4)+'"></label><label>Gatdiameter mm <input name="diameter" type="number" min="0.01" step="any" required value="6"></label><p role="alert"></p><button type="submit">Coördinaten invullen</button> <button type="button">Annuleren</button></form>';
   const form=dialog.querySelector('form'),close=()=>{dialog.close();dialog.remove();};
   form.querySelector('button[type=button]').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
   form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=Number(form.elements.diameter.value),x=w/2-Number(form.elements.x.value),y=h/2-Number(form.elements.y.value);
     if(!(x>0&&y>0)){form.querySelector('[role=alert]').textContent='De randafstanden moeten kleiner zijn dan de halve buitenmaat.';return;}
     const text=[[-x,-y],[x,-y],[x,y],[-x,y]].map(pt=>pt.map(n=>Number(n.toFixed(6))).join('; ')+'; '+d).join('\n');
     const trial=g.QuoteCalculatorCore.normalizeState({pieces:[Object.assign({},piece,{holeMode:'coordinates',holeCoordinates:text})],scenarios:[g.QuoteCalculatorCore.newScenario('Controle','mill')]}).pieces[0],errors=g.GasketV2Geometry.validate(trial);
     if(errors.length){form.querySelector('[role=alert]').textContent=errors.join(' ');return;}
     if(piece.holeCoordinates&&piece.holeCoordinates.trim()&&!confirm('De bestaande gatcoördinaten vervangen door deze vier gaten?'))return;
     close();onApply(text);
   });document.body.append(dialog);dialog.showModal();
 };
 g.GasketV2Storage={check};
})(window);
