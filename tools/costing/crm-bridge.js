import {installQuoteBridge} from './quote-bridge.js?v=crm-code-review-20261027';
import {openCrmDatabase,storageRuntime} from '../../admin/cloud-storage.js?v=crm-code-review-20261027';
import {calculationSignature,calculationRecord,applyCalculation} from './crm-storage.js';
import {orderInputs,productValues} from './order-inputs.js';
import {readCostQuote} from './quote-store.js?v=crm-code-review-20261027';
const q=new URLSearchParams(location.search),status=document.querySelector('#crm-status'),button=document.querySelector('#crm-save');
const el=id=>document.getElementById(id);
function read(db){return new Promise((resolve,reject)=>{const tx=db.transaction('state'),r=tx.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);});}
try{
 const runtime=await storageRuntime(),api=window.CrmCostCalculator;
 if(runtime.companyId!=='maatwerkkunststof'||!api)throw Error('Open deze calculator via Maatwerkkunststof.');
 if(!await installQuoteBridge({query:q,runtime,api,status})){
 const db=await openCrmDatabase(),binding={orderId:q.get('orderId'),itemId:q.get('itemId')};let item,record,baseline='',busy=false;
 async function load(){const state=await read(db),order=state?.orders.find(o=>o.id===binding.orderId);item=order?.items.find(i=>i.id===binding.itemId);
 if(!item)throw Error('Dit product ontbreekt. Open de calculator vanuit een bestaande order.');
 let inputs=item.costCalculation?{...structuredClone(item.costCalculation.inputs),selectedScenarioId:item.costCalculation.selectedScenarioId}:null;
 if(item.costCalculation&&(item.costCalculation.version!==1||item.costCalculation.companyId!==runtime.companyId))throw Error('Deze berekening heeft een niet ondersteunde versie.');
 if(!inputs&&item.costQuoteLink?.quoteId){const quote=await readCostQuote(item.costQuoteLink.quoteId);if(!quote)throw Error('De gekoppelde bronberekening ontbreekt. Kies een andere berekening in de order.');inputs=structuredClone(quote.inputs);const piece=inputs.pieces.find(p=>p.id===item.costQuoteLink.pieceId);if(!piece)throw Error('Het gekoppelde product ontbreekt in de bronberekening.');if(inputs.pieces.length>1)for(const scenario of inputs.scenarios)if(scenario.costSource==='quote_total')scenario.quotedTotal=0;inputs.pieces=[piece];inputs.selectedScenarioId=item.costQuoteLink.scenarioId||quote.selectedScenarioId;}
 api.importState(orderInputs(inputs||window.QuoteCalculatorCore.defaultState(),item,order.items.length===1?order.inquirySpecs:{}));
 binding.signature=calculationSignature(item);baseline=JSON.stringify(api.exportState());el('crm-return').href='/admin/#orders/'+encodeURIComponent(order.id)+'/costs';
 status.textContent='Order #'+(order.sourceNumber||order.number)+' · '+item.quantity+' stuks · '+(item.width??'?')+' × '+(item.height??'?')+' mm geladen. Controleer materiaal, dikte en leverancier. Wijzigingen worden pas na jouw bevestiging opgeslagen.';
 }
 await load();el('crm-order-actions').hidden=false;button.hidden=false;button.disabled=false;
 const dirty=()=>baseline!==JSON.stringify(api.exportState());
 el('crm-reload').onclick=async()=>{if(busy||dirty()&&!confirm('Niet opgeslagen rekenwijzigingen vervangen door de actuele ordergegevens?'))return;try{await load();}catch(e){status.textContent=e.message;}};
 el('crm-return').onclick=e=>{if(busy||dirty()&&!confirm('Deze berekening is nog niet in de order opgeslagen. Toch teruggaan?'))e.preventDefault();};
 window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue='';}});
 button.onclick=()=>{try{
 record=calculationRecord(api.calculate(),{version:runtime.release||'2.0.0',coreVersion:'Rekentool-20260928'});
 const v=productValues(record),money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n/100);
 el('crm-review-values').textContent='Aantal: '+item.quantity+' → '+v.quantity+'\nMaten (mm): '+(item.width??'?')+' × '+(item.height??'?')+' → '+v.width+' × '+v.height+'\nMateriaal: '+(item.material||'onbekend')+' → '+(record.inputs.pieces[0].material||'onbekend')+'\nDikte (mm): '+(item.thickness??'onbekend')+' → '+record.inputs.pieces[0].thickness+'\nVorm: '+record.inputs.pieces[0].shape+' · gatdiameter (mm): '+(record.inputs.pieces[0].innerDiameter||0)+'\nLeverancier: '+record.result.supplier+'\nDirecte kostprijs per stuk: '+(item.cost==null?'onbekend':money(item.cost))+' → '+money(Math.round(record.result.directCostInCents/v.quantity))+'\nDirecte kostprijs totaal: '+money(record.result.directCostInCents)+'\nBerekende verkoop totaal: '+money(record.result.salePriceInCents);
 el('crm-review-error').textContent='';el('crm-confirm-supplier').checked=false;el('crm-supplier-option').hidden=record.inputs.scenarios.find(s=>s.id===record.selectedScenarioId)?.costSource==='calculated';el('crm-review').showModal();
 }catch(e){status.textContent=e.message;}};
 el('crm-cancel').onclick=()=>el('crm-review').close();
 el('crm-confirm').onclick=async()=>{if(busy)return;busy=true;el('crm-confirm').disabled=true;
 try{if(!el('crm-supplier-option').hidden&&!el('crm-confirm-supplier').checked)throw Error('Bevestig eerst dat de leveranciersprijs geldt voor deze maten en aantallen.');await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite'),ss=tx.objectStore('state'),r=ss.get('main');r.onsuccess=()=>{try{const next=r.result;applyCalculation(next,binding,record,{copyProduct:el('crm-copy-product').checked,copyCost:el('crm-copy-cost').checked,copySale:el('crm-copy-sale').checked});ss.put(next,'main');}catch(e){tx.abort();reject(e);}};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Bewaren afgebroken.'));});
 baseline=JSON.stringify(api.exportState());const c=typeof BroadcastChannel==='function'?new BroadcastChannel('maatwerkkunststof-crm-changes'):null;c?.postMessage('changed');c?.close();location.assign(el('crm-return').href);
 }catch(e){el('crm-review-error').textContent=e.message;}finally{busy=false;el('crm-confirm').disabled=false;}};
 }
}catch(e){status.textContent=e.message;button.disabled=true;}
