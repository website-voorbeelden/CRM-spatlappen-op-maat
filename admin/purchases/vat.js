import {createVatEntryUI} from '../analytics/vat-entry.js?v=feedback28-batch2-20261028';
import {vatSources,vatEntryIssues} from '../../shared/vat-ledger.js?v=feedback28-batch2-20261028';

// A view onto the existing company VAT ledger, never a second purchase ledger.
export function createPurchaseVat(context){
 const entryUI=createVatEntryUI(context,{refresh:()=>context.render()});
 const related=(entry,p,sources)=>entry.purchaseId===p.id||sources.some(s=>s.purchaseId===p.id&&(s.key===entry.sourceKey||(s.aliases||[]).includes(entry.sourceKey)))||entry.documentIds.some(id=>context.state.documents.some(d=>d.id===id&&d.ownerId===p.id));
 function markup(p){
  const sources=vatSources(context.state),entries=(context.state.vatLedger?.entries||[]).filter(e=>e.status!=='void'&&related(e,p,sources)),{esc,euro}=context;
  return `<section class="order-surface"><div class="section-heading"><div><h2>Betaalde btw & invoerbewijs</h2><p>Dezelfde boekingen als bij Analytics → Btw. Betaling en aftrek blijven apart.</p></div><button type="button" data-purchase-vat-new>Btw / invoerbewijs vastleggen</button></div>${entries.length?`<div class="tablewrap"><table><thead><tr><th>Bron</th><th>Werkelijk betaalde btw</th><th>Betaald op</th><th>Controle</th><th>Actie</th></tr></thead><tbody>${entries.map(e=>{const issues=vatEntryIssues(e,context.state,sources);return `<tr><td>${esc(e.documentNumber)}<br><small>${esc(e.counterparty)}${e.duplicateOf?' · kopie':e.credit?' · credit':''}</small></td><td>${e.paidVat==null?'Nog onbekend':euro(e.paidVat.amountCents)}</td><td>${e.paidVat?.date?context.date(e.paidVat.date):'Nog onbekend'}</td><td>${e.status==='reviewed'&&!issues.length?'Gecontroleerd':'Nog controleren'}${issues.length?`<small>${issues.length} controlepunt${issues.length===1?'':'en'}</small>`:''}</td><td><button type="button" data-purchase-vat-entry="${esc(e.id)}">Bekijken / aanvullen</button>${e.documentIds.length?`<details class="quiet-menu"><summary>Bewijs</summary><div>${e.documentIds.map(id=>{const file=context.state.documents.find(d=>d.id===id);return file?`<button type="button" data-action="download" data-id="${esc(id)}">${esc(file.name)}</button>`:'';}).join('')}</div></details>`:''}</td></tr>`;}).join('')}</tbody></table></div>`:'<p class="form-help">Nog geen btw-registratie bij deze zending. Boek een leveranciersfactuur via Btw vastleggen bij het document, of voeg hier het afzonderlijke invoerbewijs toe.</p>'}<p class="form-help">Betaalde btw wordt hier niet bij de kostprijs of het leverancierssaldo opgeteld. Alleen de afzonderlijk gecontroleerde btw-regels kunnen in de kwartaalvoorbereiding meetellen. <a href="#analytics/vat/sources">Alle btw-bronnen & boekingen →</a></p></section>`;
 }
 function sourceButton(p,invoice){return invoice.kind==='invoice'?`<button type="button" data-purchase-vat-source="${context.esc('supplier:'+p.id+':'+invoice.id)}">Btw vastleggen / bekijken</button>`:'';}
 function install(root,purchaseId){
  root.addEventListener('click',event=>{
   const button=event.target.closest('[data-purchase-vat-new],[data-purchase-vat-entry],[data-purchase-vat-source]');if(!button||!root.contains(button))return;
   try{
    const p=context.state.purchases.find(p=>p.id===purchaseId);if(!p)throw Error('Deze zending bestaat niet meer.');
    const sources=vatSources(context.state),entries=(context.state.vatLedger?.entries||[]).filter(e=>e.status!=='void');
    if(button.hasAttribute('data-purchase-vat-new')){entryUI.open(null,null,{purchaseId,kind:'import'});return;}
    const source=sources.find(s=>s.key===button.dataset.purchaseVatSource&&s.purchaseId===purchaseId);
    const existing=button.dataset.purchaseVatEntry?entries.find(e=>e.id===button.dataset.purchaseVatEntry&&related(e,p,sources)):entries.find(e=>source&&(e.sourceKey===source.key||(source.aliases||[]).includes(e.sourceKey)));
    if(button.dataset.purchaseVatEntry&&!existing||button.dataset.purchaseVatSource&&!source)throw Error('De btw-bron of boeking is gewijzigd. Open de zending opnieuw.');
    entryUI.open(existing?sources.find(s=>s.key===existing.sourceKey)||null:source,existing||null,{purchaseId});
   }catch(error){context.toast(error.message);}
  });
 }
 return {markup,sourceButton,install};
}
