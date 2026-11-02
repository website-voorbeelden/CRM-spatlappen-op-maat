import {packsOnline,packsRequest} from './packs-request.js?v=packs-worker-v3-20261102';
import {packsTrackingObservation,recordPacksTracking} from '../../shared/packs-tracking.js?v=packs-worker-v3-20261102';
import {validateBusinessState} from '../../shared/state-validation.js?v=packs-workflow-20261102';
import {recordPacksSession} from './packs-session-log.js?v=packs-worker-v3-20261102';
// Lazy controller: opening the dialog does not contact PACKS or start polling.
export function createPacksTracking(context){
 const esc=v=>context.esc(v??'');
 function open(id){
  if(context.company.id!=='maatwerkkunststof')throw Error('PACKS-tracking hoort bij Maatwerkkunststof.');
  const order=context.order(id),label=context.state.documents.find(d=>d.id===order?.supplierFulfilment?.labelDocumentId&&d.ownerId===id),bundle=label?.packsLabelBundle;
  if(!bundle)throw Error('Deze order heeft nog geen via het CRM geboekte PACKS-labelbundel. Een handmatig toegevoegd PDF-label geeft geen bewezen API-zendingsnummer.');
  let cached=order.packsTracking?.attemptId===bundle.attemptId?order.packsTracking:null,checkedAt=order.packsTracking?.checkedAt||'',busy=false;
  context.openForm('PACKS · Track & Trace',`<p><strong>Kunststofbaas ${esc(order.supplierOrderReference)}</strong> · onze order #${esc(order.number)}</p><p role="status" data-tracking-status>Alleen deze bewaarde boeking; ophalen maakt geen zending.</p><div data-tracking-result></div><p class="form-help">Boekingsstatus en fysieke bezorging zijn verschillend. Done betekent hier geen bewezen aflevering. Deze opvraag registreert geen levering, betaling of mail. Wijzigingen worden voor maximaal de laatste 30 dagen opgehaald; dit is geen volledige historie.</p>`,()=>false,{trackChanges:false,afterCancel:()=>context.render()});
  const form=context.$('#dialog form'),button=form.querySelector('[type=submit]'),status=form.querySelector('[data-tracking-status]'),result=form.querySelector('[data-tracking-result]'),current=()=>form.isConnected&&context.$('#dialog').open;
  function paint(){
   button.textContent='Tracking ophalen';button.disabled=busy||!packsOnline(context);
   if(!cached){result.innerHTML='<p>Nog geen tracking opgehaald. Zending '+esc(bundle.shipmentId)+'.</p>';return;}
   result.innerHTML='<dl class="detail"><dt>Opgehaald</dt><dd>'+esc(cached.checkedAt)+'</dd><dt>PACKS-zending</dt><dd>'+esc(cached.shipmentId)+'</dd><dt>Boekingsstatus</dt><dd>'+esc(cached.bookingStatus||'Niet teruggegeven')+'</dd><dt>Logistieke status</dt><dd>'+esc(cached.logisticsStatus||'Niet teruggegeven')+'</dd><dt>Geplande afhaling</dt><dd>'+esc(cached.planning.loadDate||'Niet teruggegeven')+'</dd><dt>Geplande bezorging</dt><dd>'+esc(cached.planning.deliveryDate||'Niet teruggegeven')+'</dd></dl>'+(cached.url?'<p><a class="button" href="'+esc(cached.url)+'" target="_blank" rel="noopener noreferrer">Track & Trace openen ↗</a></p>':'<p>PACKS heeft geen trackinglink teruggegeven.</p>')+'<p>Barcodes: '+cached.items.map(i=>esc(i.barcode)).join(' · ')+'</p><details class="form-details"><summary>Statuswijzigingen ('+cached.updates.length+')</summary>'+cached.updates.map(u=>'<article><p>'+esc(u.statusAt)+' · '+esc(u.statusText||'Geen statustekst')+(u.extraInfo?' · '+esc(u.extraInfo):'')+(u.deliveredDate?'<br>Afleverdatum volgens tracking: '+esc(u.deliveredDate):'')+'</p>'+u.details.map(d=>'<p>'+esc(d.at)+' · '+esc(d.text)+'</p>').join('')+'</article>').join('')+'</details>';
  }
  form.onsubmit=async event=>{
   event.preventDefault();if(busy||!current()||!packsOnline(context))return;busy=true;form.inert=true;form.setAttribute('aria-busy','true');status.textContent='Tracking voor dezelfde zending ophalen…';recordPacksSession({code:'tracking_start',orderId:id,attemptId:bundle.attemptId});paint();
   try{
    const state=await packsRequest(context,'status',id);if(!current())return;
    if(!state.capabilities?.tracking)throw Error('Deze centrale PACKS-dienst ondersteunt de trackingopvraag nog niet.');
    const attempt=state.registry?.attempts?.[0];if(attempt?.status!=='booked'||attempt.attemptId!==bundle.attemptId||attempt.shipmentId!==bundle.shipmentId||state.environment!==bundle.environment)throw Error('De serverboeking past niet bij deze labelbundel. Onderzoek de bestaande poging; boek niet opnieuw.');
    const stamp=Date.parse(attempt.createdAt);if(!Number.isFinite(stamp))throw Error('De bekende poging mist een geldige datum.');
    const since=new Date(Math.max(stamp-86400000,Date.now()-30*86400000)).toISOString(),shipment=await packsRequest(context,'shipment',id),changes=await packsRequest(context,'tracking',id,{query:{since}});if(!current())return;
    const observation=packsTrackingObservation(shipment,changes,{attempt,environment:state.environment});
    await context.mergeStoredState(next=>{recordPacksTracking(next,id,observation,{expectedLabelId:label.id,expectedCheckedAt:checkedAt,companyId:context.company.id});validateBusinessState(next);});cached=observation;checkedAt=observation.checkedAt;
    status.textContent='Tracking bij dezelfde order bewaard. Er is niets geboekt of als geleverd gemarkeerd.';
    recordPacksSession({code:'tracking_ok',orderId:id,attemptId:bundle.attemptId,traceId:changes.traceId});
   }catch(error){recordPacksSession({code:'tracking_failed',orderId:id,attemptId:bundle.attemptId,traceId:error.traceId,httpStatus:error.httpStatus});if(current())status.textContent=error.message+(error.traceId?' · Logreferentie '+error.traceId:'');}
   finally{busy=false;form.inert=false;form.removeAttribute('aria-busy');if(current())paint();}
  };
  if(!packsOnline(context))status.textContent='Lokaal kun je de eerder bewaarde tracking bekijken. Ophalen vraagt de ingerichte centrale PACKS-proefomgeving.';paint();
 }
 return {open};
}
