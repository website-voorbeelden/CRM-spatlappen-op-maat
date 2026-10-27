import {orderDesignApproved} from './product-design-variants.js?v=batch1-variants-20261026';
import {productionReleaseInfo} from './production-release.js?v=ui-batch234-20261027';
import {inboundReadiness} from './inbound-readiness.js?v=ui-batch234-20261027';
import {salesFunnel} from './sales-funnel.js?v=ui-batch234-20261027';
const date=value=>Boolean(value)&&Number.isFinite(Date.parse(value));
// Read-only follow-up facts. Payment is never evidence of an approved design,
// a sent document, an order at a supplier or actual production.
export function orderReadiness(state,o,companyId,{funnel}={}){
 const f=funnel||salesFunnel(state,o,companyId),documents=(state.documents||[]).filter(d=>d.ownerId===o.id),hasPdf=kind=>documents.some(d=>(d.generated?.kind||d.category)===kind&&(/\.pdf$/i.test(d.name||'')||d.type==='application/pdf'));
 const checks=[];const add=(key,label,complete,action,cta,reason)=>checks.push({key,label,complete,action,cta,reason});
 add('specs','Productspecificaties',!f.missing.length,'specs','Gegevens aanvullen',f.fields.filter(v=>!v.complete).map(v=>v.label).join(', '));
 add('prices','Prijsafspraak',f.payment.known,'calculate','Prijs berekenen','Productprijs of verzendprijs is nog onbekend.');
 if(companyId==='spatlappen'){
  const approved=orderDesignApproved(state,o);
  const prepared=documents.some(d=>d.productDesignPreview||d.itemId&&d.type?.startsWith('image/'))||(o.items||[]).some(i=>i.designDocumentId||i.designPreviewId||i.designId);
  add('design','Ontwerp / akkoord',approved,'view','Ontwerp controleren',prepared?'Er staat een ontwerp, maar geen ontwerpgoedkeuring geregistreerd.':'Er is nog geen ontwerp of ontwerpgoedkeuring vastgelegd.');
 }
 const confirmationSent=date(o.confirmationSentDate)||f.events.some(e=>e.phase==='confirmation'&&!['pending','dismissed'].includes(e.review));
 add('confirmation','Orderbevestiging',confirmationSent&&hasPdf('confirmation'),confirmationSent&&!hasPdf('confirmation')?'documents':'confirmation',confirmationSent&&!hasPdf('confirmation')?'Bestaande bevestiging toevoegen':hasPdf('confirmation')?'Orderbevestiging mailen':'Orderbevestiging maken',confirmationSent&&!hasPdf('confirmation')?'Verzending is geregistreerd, maar de documentkopie ontbreekt. Voeg de bestaande bevestiging toe.':hasPdf('confirmation')?'De orderbevestiging staat klaar, maar verzending is nog niet geregistreerd.':'Geen verstuurde orderbevestiging geregistreerd.');
 add('invoice','Factuur',companyId==='spatlappen'?f.invoicePrepared:f.invoiceSent&&f.invoicePrepared,f.invoiceSent&&!f.invoicePrepared?'documents':'invoice',f.invoiceSent&&!f.invoicePrepared?'Bestaande factuur toevoegen':f.invoicePrepared?'Factuur mailen':'Factuur maken',f.invoiceSent&&!f.invoicePrepared?'Verzending is geregistreerd, maar de factuurkopie ontbreekt. Voeg de bestaande factuur toe; maak geen dubbele.':f.invoicePrepared?'De factuur-PDF staat klaar, maar verzending is nog niet geregistreerd.':'Er staat nog geen factuur klaar.');
 const supplier=(o.items||[]).some(i=>i.productionSource!=='local'),purchase=(state.purchases||[]).find(p=>p.id===o.purchaseId);
 if(supplier){const ordered=Boolean(date(o.supplierOrderedDate)||purchase&&(date(purchase.orderedDate)||['Besteld','In productie','Onderweg','Binnen in Nederland'].includes(purchase.status)));
  add('purchase','Inkoop bij leverancier',ordered,'purchase',purchase||ordered?'Bestelling controleren':'Inkoop vastleggen',purchase?'De inkoop is gekoppeld, maar bestellen is nog niet geregistreerd.':ordered?'Bestellen voor deze losse order is geregistreerd.':'Registreer de losse bestelling of koppel een gezamenlijke inkoopbestelling.');
 }
 const inbound=inboundReadiness(state,o,companyId);
 const gaps=checks.filter(c=>!c.complete),paid=f.payment.paid>0;
 // Financial documents first after full payment; then resolve missing work in
 // order. Local-only production never gets a supplier task.
 let next=null;if(f.payment.fullyPaid){next=gaps.find(c=>c.key==='invoice')||gaps.find(c=>['specs','prices','design','confirmation','purchase'].includes(c.key))||null;}
 else if(paid)next=gaps.find(c=>['specs','prices','design','confirmation'].includes(c.key))||null;
 const release=productionReleaseInfo(state,o,companyId,{payment:f.payment});if(!inbound.active&&!o.productionReleasedDate&&!release.automatic&&!f.payment.fullyPaid&&release.eligible)next={key:'release',label:'Productievrijgave',action:'production-release',cta:'Vrijgave controleren',reason:`De ${release.percentage}%-aanbetaling en ontwerpvoorwaarden zijn aanwezig. Bevestig de productievrijgave apart.`};
 if(!inbound.active&&(o.productionReleasedDate||release.automatic)&&release.active){if(release.eligible)next=(f.payment.fullyPaid?gaps.find(c=>c.key==='invoice'):null)||gaps.find(c=>c.key==='purchase')||{key:'production-start',label:'Productiestart',action:'production',cta:'Productiestart registreren',reason:release.automatic?'Aanbetaling en actuele ontwerpvoorwaarden zijn aanwezig. Registreer de productiestart pas zodra die werkelijk bevestigd is.':'Vrijgave is vastgelegd. Registreer de productiestart pas zodra die werkelijk bevestigd is.'};else next=gaps.find(c=>['specs','prices','design'].includes(c.key))||{key:'deposit',label:'Aanbetaling',action:'payment',cta:'Aanbetaling controleren',reason:release.reasons.join(' ')};}
 return {checks,gaps:inbound.active?inbound.gaps:gaps,next:inbound.active?inbound.next:next,inbound:inbound.active,paid,fullyPaid:f.payment.fullyPaid,receivedPercent:f.payment.known&&f.payment.total>0?Math.round(f.payment.paid/f.payment.total*1000)/10:null};
}
