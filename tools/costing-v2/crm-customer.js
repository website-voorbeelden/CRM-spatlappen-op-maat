import {openCrmDatabase,storageRuntime} from '../../admin/cloud-storage.js?v=crm-code-review-20261027';
import {saveCustomerCalculation,customerCalculationFiles,readCustomerCalculation} from './crm-customer-domain.js';
const g=window,esc=g.GasketV2Geometry.esc,money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n);
const read=db=>new Promise((resolve,reject)=>{const tx=db.transaction('state'),r=tx.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);});
function summary(inputs,snapshot){
 const result=snapshot?.calculation?.scenarios.find(s=>s.id===snapshot.selectedScenarioId),complete=result?.priceComplete&&!result.errors.length&&!snapshot.calculation.errors.length;
 return '<div class="v2-crm-preview"><dl><dt>Onderdelen</dt><dd>'+inputs.pieces.length+' regel(s) · '+inputs.pieces.reduce((n,p)=>n+p.quantity,0)+' stuks</dd><dt>Kostprijs totaal</dt><dd>'+(complete?money(result.landedCost):'Nog niet compleet')+'</dd><dt>Verkoopprijs excl. btw</dt><dd>'+(complete?money(result.salePrice):'Nog niet compleet')+'</dd><dt>Marge totaal</dt><dd>'+(complete?money(result.marginEuro)+' · '+result.marginPct.toLocaleString('nl-NL',{maximumFractionDigits:2})+'%':'Nog niet compleet')+'</dd></dl></div>';
}
async function openCustomer(mode='save'){
 if(document.querySelector('[data-customer-dialog]'))return;
 const d=document.createElement('dialog');d.className='v2-help-dialog';d.dataset.customerDialog='';d.setAttribute('aria-label',mode==='save'?'Berekening opslaan bij klant':'Berekening van klant openen');
 d.innerHTML='<header><h2>'+(mode==='save'?'Opslaan bij klant':'Bij klant openen')+'</h2><button type="button" data-close>Sluiten ×</button></header><p role="status">Klanten laden…</p>';document.body.append(d);d.showModal();
 let busy=false,db,closed=false;
 function close(){if(busy)return;closed=true;d.close();d.remove();db?.close();}
 d.querySelector('[data-close]').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close();});
 try{
 const runtime=await storageRuntime();if(runtime.companyId!=='maatwerkkunststof'||runtime.offlineReview||runtime.mode==='cloud'&&runtime.features?.costingV2!==true)throw Error('Deze koppeling vereist Maatwerkkunststof en een expliciet meegeleverde V2-versie; offline alleen lezen is hier niet ondersteund.');
 if(closed)return;db=await openCrmDatabase();const state=await read(db);if(closed){db.close();return;}
 const customers=(state?.customers||[]).filter(c=>mode==='open'||!c.archived).sort((a,b)=>String(a.company).localeCompare(String(b.company),'nl'));
 if(!customers.length)throw Error('Er zijn nog geen klanten. Maak eerst een klant aan in het CRM.');
 const snapshot=g.CrmCostCalculator.exportState(),snapshotText=JSON.stringify(snapshot);g.GasketV2Storage.check(snapshot);
 const body=document.createElement('div');d.querySelector('[role=status]').remove();body.innerHTML='<p>'+(mode==='save'?'Kies een klant en bewaar deze berekening. Bestaande orders en prijzen blijven behouden.':'Kies een klant om een bewaarde berekening te openen.')+'</p><label>Klant zoeken<input name="search" type="search" placeholder="Typ een bedrijfsnaam…"></label><label>Kies de klant<select name="customer" required size="5"><option value="">Selecteer een klant</option>'+customers.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.company||c.contact||'Klant')+(c.archived?' (gearchiveerd)':'')+'</option>').join('')+'</select></label><div data-customer-content></div>';d.append(body);
 const select=body.querySelector('[name=customer]'),content=body.querySelector('[data-customer-content]');
 if(mode==='save'){
 content.innerHTML='<form>'+summary(snapshot,g.CrmCostCalculator.calculate())+'<label>Naam van deze berekening<input name="title" required maxlength="80" value="'+esc(snapshot.pieces[0].name||'Kostprijsberekening')+'"></label><label class="v2-save-confirm"><input name="confirmed" type="checkbox" required>Bewaren bij de hierboven gekozen klant.</label><p class="v2-note">Je bewaart een nieuwe kopie. Eerdere berekeningen blijven beschikbaar via Bij klant openen. Ook een onvolledige berekening kun je bewaren.</p><p role="alert"></p><button type="submit">Bij deze klant bewaren</button></form>';
 const form=content.querySelector('form'),submit=form.querySelector('[type=submit]');submit.disabled=true;
 select.onchange=()=>{form.elements.confirmed.checked=false;submit.disabled=!select.value;};
 form.onsubmit=async e=>{
 e.preventDefault();if(busy||!select.value||!form.reportValidity())return;const customer=customers.find(c=>c.id===select.value);if(!customer)return;
 const error=form.querySelector('[role=alert]');error.textContent='';busy=true;submit.disabled=true;submit.textContent='Berekening bewaren…';select.disabled=true;body.querySelector('[name=search]').disabled=true;
 try{
 if(snapshotText!==JSON.stringify(g.CrmCostCalculator.exportState()))throw Error('Je berekening is intussen gewijzigd. Sluit dit venster en open Opslaan bij klant opnieuw.');
 await saveCustomerCalculation(db,{customer,inputs:snapshot,title:form.elements.title.value,confirmed:form.elements.confirmed.checked});
 const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('maatwerkkunststof-crm-changes'):null;channel?.postMessage('changed');channel?.close();
 g.dispatchEvent(new CustomEvent('crm-v2-saved',{detail:{snapshot:snapshotText,customer:customer.company||'de klant'}}));
 form.innerHTML='<h3>✓ Bewaard bij '+esc(customer.company||'de klant')+'</h3><p>Je kunt de berekening hier later openen via Berekening beheren → Bij klant openen.</p><div class="v2-modal-actions"><button type="button" data-done>Verder rekenen</button><a href="/admin/#customers/'+encodeURIComponent(customer.id)+'/documents">Naar klantdossier →</a></div>';form.querySelector('[data-done]').onclick=close;form.querySelector('[data-done]').focus();document.getElementById('v2-status').textContent='Berekening bewaard bij '+(customer.company||'de klant')+'.';
 }catch(e){error.textContent=e.message;submit.disabled=false;submit.textContent='Opnieuw proberen';select.disabled=false;body.querySelector('[name=search]').disabled=false;}finally{busy=false;}
 };
 }else{
 select.onchange=()=>{
 const files=customerCalculationFiles(state,select.value);content.innerHTML=select.value?'<div class="v2-crm-files">'+(files.length?files.map(file=>'<article class="v2-crm-file"><div><strong>'+esc(file.name.replace(/\.json$/i,''))+'</strong><span>'+esc((file.createdAt||file.date||'').slice(0,10))+'</span></div><button type="button" data-file="'+esc(file.id)+'">Bekijken</button></article>').join(''):'<p>Bij deze klant zijn nog geen berekeningsbestanden bewaard.</p>')+'</div><p role="alert" data-file-status></p><div data-file-preview></div>':'';
 for(const button of content.querySelectorAll('[data-file]'))button.onclick=()=>preview(button.dataset.file);
 };
 async function preview(documentId){
 if(busy)return;busy=true;const error=content.querySelector('[data-file-status]'),box=content.querySelector('[data-file-preview]'),customerId=select.value;error.textContent='';box.innerHTML='Berekening laden…';select.disabled=true;body.querySelector('[name=search]').disabled=true;
 try{
 const saved=await readCustomerCalculation(db,{customerId,documentId,check:g.GasketV2Storage.check});if(closed)return;
 const baseline=JSON.stringify(g.CrmCostCalculator.exportState());box.innerHTML='<h3>'+esc(saved.document.name.replace(/\.json$/i,''))+'</h3><ul>'+saved.inputs.pieces.map(p=>'<li>'+esc(p.name||'Onderdeel')+' · '+esc(p.material)+' '+esc(p.thickness)+' mm · '+esc(p.quantity)+' stuks</li>').join('')+'</ul><p>Openen vervangt de huidige invoer. Bewaar die eerst als je haar wilt houden. Het opgeslagen bestand blijft behouden.</p><label class="v2-save-confirm"><input type="checkbox" data-open-confirm>Ik wil verder met deze berekening.</label><button type="button" data-use disabled>Openen in calculator</button>';
 box.querySelector('[data-open-confirm]').onchange=e=>{box.querySelector('[data-use]').disabled=!e.target.checked;};
 box.querySelector('[data-use]').onclick=async()=>{
 if(busy||!box.querySelector('[data-open-confirm]').checked)return;busy=true;box.querySelector('[data-use]').disabled=true;
 try{
 if(JSON.stringify(g.CrmCostCalculator.exportState())!==baseline)throw Error('De huidige berekening is intussen gewijzigd. Bekijk het bestand opnieuw.');
 const current=await readCustomerCalculation(db,{customerId,documentId,check:g.GasketV2Storage.check});
 if(current.signature!==saved.signature)throw Error('Het bestand is intussen gewijzigd. Bekijk het bestand opnieuw.');
 if(JSON.stringify(g.CrmCostCalculator.exportState())!==baseline)throw Error('De huidige berekening is intussen gewijzigd. Bekijk het bestand opnieuw.');
 g.dispatchEvent(new Event('crm-v2-reset'));g.CrmCostCalculator.importState(current.inputs);g.dispatchEvent(new CustomEvent('crm-v2-saved',{detail:{snapshot:JSON.stringify(g.CrmCostCalculator.exportState()),customer:current.customer.company||'de klant'}}));
 document.getElementById('v2-status').textContent='Berekening geopend van '+(current.customer.company||'de klant')+'. Wijzigingen bewaar je als nieuwe kopie.';busy=false;close();document.getElementById('resultaten').scrollIntoView({behavior:'smooth'});
 }catch(e){error.textContent=e.message;busy=false;box.querySelector('[data-use]').disabled=false;}
 };
 }catch(e){box.innerHTML='';error.textContent=e.message;}finally{busy=false;select.disabled=false;body.querySelector('[name=search]').disabled=false;}
 }
 }
 body.querySelector('[name=search]').oninput=e=>{const term=e.target.value.toLocaleLowerCase('nl');for(const option of select.options)option.hidden=!!option.value&&!option.textContent.toLocaleLowerCase('nl').includes(term);select.value='';select.onchange?.();};
 }catch(e){const message=d.querySelector('[role=status]');if(message)message.textContent=e.message;db?.close();}
}
document.addEventListener('click',event=>{const button=event.target.closest('#v2-customer-save,[data-customer-save],#v2-customer-open');if(!button)return;event.preventDefault();openCustomer(button.id==='v2-customer-open'?'open':'save');});
