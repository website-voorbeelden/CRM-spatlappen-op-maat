import {paymentRequestDay,usableOrderPaymentLink} from './order-payment-link.js?v=feedback29-batch3-followup';
import {salesPhaseSignal,adoptedGmailPhase} from './sales-phase-signal.js?v=open-fixes-20261027';
import {productionReleaseInfo} from './production-release.js?v=feedback29-batch3-followup';
import {mailTemplates,fillMailTemplate,templateContext} from './mail-templates.js?v=feedback-followup-20261028';
import {companyFor} from './companies.js';
import {inquiryRequirements} from './inquiries.js?v=feedback-followup-20261028';
export const funnelPhases=[['new','Nieuwe aanvragen'],['specs','Specificaties opgevraagd'],['pricing','Prijs berekenen'],['indication','Prijsindicatie verstuurd'],['quote','Offerte verstuurd'],['confirmation','Orderbevestiging · wacht op betaling'],['paid','Betaald'],['released','Productie vrijgegeven'],['production','In productie'],['delivered','Geleverd / gearchiveerd']];
export const funnelPhasesFor=companyId=>companyFor(companyId).salesPhases||funnelPhases;
export function funnelDisplayPhase(phase,companyId){return companyId==='maatwerkkunststof'&&['confirmation','paid','released'].includes(phase)?'received':phase;}
export const funnelPhaseLabel=(phase,companyId)=>funnelPhasesFor(companyId).find(([id])=>id===funnelDisplayPhase(phase,companyId))?.[1]||funnelPhases.find(([id])=>id===phase)?.[1]||phase;
const phaseIds=new Set([...funnelPhases.map(([id])=>id),'invoice','welcome','received']),day=86400000;
const timestamp=value=>Number.isFinite(Date.parse(value))?Date.parse(value):0;
export function funnelPayment(state,o){
 const items=o.items||[],receipts=state.payments.filter(p=>p.orderId===o.id);
 const itemBasis=items.length>0&&items.every(i=>Number.isSafeInteger(i.quantity)&&i.quantity>0&&(o.packagePrice!=null||Number.isSafeInteger(i.price)&&i.price>=0));
 const products=o.packagePrice??items.reduce((s,i)=>s+i.quantity*(i.price??0),0),shipping=o.shippingCharge??0,vat=o.vat??21,net=products+shipping,total=net+Math.round(net*vat/100),paid=receipts.reduce((n,p)=>n+p.amount,0);
 const valid=receipts.every(p=>Number.isSafeInteger(p.amount))&&Number.isSafeInteger(paid)&&paid>=0;
 const known=itemBasis&&Number.isSafeInteger(products)&&products>=0&&o.shippingKnown===true&&Number.isSafeInteger(o.shippingCharge)&&o.shippingCharge>=0&&Number.isFinite(vat)&&vat>=0&&vat<=100&&Number.isSafeInteger(total)&&total>=0&&valid;
 return {known,total,paid,valid,fullyPaid:known&&total>0&&paid>=total};
}
function orderDocumentPrepared(state,orderId,kind){return state.documents.some(d=>d.ownerId===orderId&&(d.generated?.kind||d.category)===kind&&(/\.pdf$/i.test(d.name||'')||d.type==='application/pdf'));}
function mailPhase(state,draft){const doc=state.documents.find(x=>x.id===draft.documentId),kind=doc?.generated?.kind||doc?.category;return ({quote:'quote',confirmation:'confirmation',invoice:'invoice'})[kind]||draft.funnelPurpose||'';}
// Require a known acceptance, then use explicit document/mail purposes only.
export function automaticFunnelMailPhase(state,draft){if(draft.status!=='accepted'||!timestamp(draft.sentAt))return '';const phase=mailPhase(state,draft);return ['specs','indication','quote','confirmation'].includes(phase)?phase:'';}
export function funnelMailEvents(state,o){return (o.emailDrafts||[]).filter(d=>d.status==='accepted'&&timestamp(d.sentAt)).map(d=>({id:d.id,phase:mailPhase(state,d),at:d.sentAt,source:'mail',review:d.funnelReview})).filter(e=>phaseIds.has(e.phase)||e.phase==='followup');}
export function salesFunnel(state,o,companyId,{now=Date.now(),followupDays=o.salesFunnel?.followupDays||7}={}){
 const payment=funnelPayment(state,o),requirements=inquiryRequirements(o,companyId),events=[...(o.salesFunnel?.events||[]),...funnelMailEvents(state,o)].sort((a,b)=>timestamp(a.recordedAt||a.at)-timestamp(b.recordedAt||b.at));
 for(const [key,phase] of [['quoteSentDate','quote'],['confirmationSentDate','confirmation'],['invoiceSentDate','invoice']])if(timestamp(o[key])&&!events.some(e=>e.phase===phase))events.push({phase,at:o[key],source:'registration'});
 events.sort((a,b)=>timestamp(a.recordedAt||a.at)-timestamp(b.recordedAt||b.at));const meaningful=events.filter(e=>e.phase!=='followup'&&!['pending','dismissed'].includes(e.review)),last=meaningful.at(-1);
 let phase=last?.phase||((o.quoteDraft||o.stage==='Offerte verstuurd')?'quote':o.stage==='Wachten op betaling'?'confirmation':'new');
 if(!last&&!o.quoteSentDate&&o.stage!=='Offerte verstuurd'&&(o.quoteDraft||o.items.some(i=>i.costCalculation||i.costQuoteLink||i.price!=null)))phase='pricing';
 if(payment.fullyPaid)phase='paid';else if(['paid','invoice'].includes(phase))phase='confirmation';
 if(o.productionReleasedDate||o.stage==='Productie vrijgegeven')phase='released';
 if(['In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden'].includes(o.stage)||o.productionDate)phase='production';
 if(o.archived||o.deliveredDate||o.stage==='Afgerond')phase='delivered';
 const paymentDay=paymentRequestDay(now),release=productionReleaseInfo(state,o,companyId,{payment,today:paymentDay});
 const confirmationPrepared=orderDocumentPrepared(state,o.id,'confirmation');
 const paymentPrepared=companyId==='spatlappen'&&payment.known&&payment.total>payment.paid&&confirmationPrepared&&(o.paymentLinks||[]).some(link=>usableOrderPaymentLink(link,{today:paymentDay,total:payment.total})&&(!link.documentId||state.documents.some(d=>d.id===link.documentId&&d.ownerId===o.id&&(d.generated?.kind||d.category)==='confirmation'&&(/\.pdf$/i.test(d.name||'')||d.type==='application/pdf'))));
 const signal=salesPhaseSignal(state,o,funnelDisplayPhase(phase,companyId),events,{automatic:release.automatic,paymentPrepared});
 const selected=o.salesFunnel?.selection?.basis===signal.basis;
 if(selected){signal.phase=o.salesFunnel.selection.phase;phase=signal.phase;}
 const gmail=adoptedGmailPhase(state,o,signal);
 if(gmail)phase=gmail.phase;
 // A real manual/Gmail choice keeps priority; no historical basis migration.
 const automaticPricing=!selected&&!gmail&&['new','welcome','specs'].includes(phase)&&!requirements.missing.length;
 if(automaticPricing){phase='pricing';signal.phase=phase;}
 // Derived readiness: no dates, payment facts or physical stages are written on render.
 if(release.automatic){phase='released';signal.phase=phase;}
 else if(paymentPrepared&&!['released','production','delivered'].includes(phase)&&!o.archived){phase='confirmation';signal.phase=phase;}
 const sent=events.filter(e=>['specs','indication','quote','confirmation','invoice','followup'].includes(e.phase)).at(-1);
 const inbound=(state.incomingEmails||[]).filter(m=>m.orderId===o.id&&m.direction!=='outgoing').reduce((n,m)=>Math.max(n,timestamp(m.receivedAt)),0);
 const waiting=['specs','indication','quote','confirmation','invoice'].includes(phase)&&sent&&inbound<=timestamp(sent.at),days=sent?Math.max(0,Math.floor((now-timestamp(sent.at))/day)):null;
 const followup=Boolean(waiting&&days>=followupDays),invoiceSent=events.some(e=>e.phase==='invoice');
 const invoicePrepared=orderDocumentPrepared(state,o.id,'invoice');
 const actions={welcome:['specs','Specificaties controleren'],received:['confirmation','Orderbevestiging voorbereiden'],new:['specs','Specificaties opvragen'],specs:['specs','Specificaties controleren'],pricing:['calculate','Prijs berekenen'],indication:['quote','Offerte voorbereiden'],quote:['confirmation','Orderbevestiging voorbereiden'],confirmation:['payment','Betaling registreren'],invoice:['payment','Betaling registreren'],paid:!payment.fullyPaid?['payment','Betaling controleren']:invoiceSent||invoicePrepared?['production','Productiestart registreren']:['invoice',invoicePrepared?'Factuur mailen':'Factuur maken'],released:(o.items.some(i=>i.productionSource!=='local')?['purchase','Inkoopbestelling controleren']:['production','Productiestart registreren']),production:['delivery','Levering registreren'],delivered:['view','Dossier bekijken']};
 const next=['new','welcome','specs'].includes(phase)&&!requirements.missing.length?['calculate','Prijs berekenen']:actions[phase]||actions.new;
 const automaticMail=!selected&&!gmail&&last?.source==='mail'&&['specs','indication','quote','confirmation'].includes(last.phase)&&phase===last.phase?{id:last.id,phase:last.phase}:null;
 return {phase,signal,gmail,automaticMail,automaticPricing:automaticPricing&&phase==='pricing'&&!selected&&!gmail,automaticRelease:release.automatic,paymentPrepared,confirmationPrepared,displayPhase:funnelDisplayPhase(phase,companyId),label:funnelPhaseLabel(phase,companyId),payment,missing:requirements.missing,fields:requirements.fields,invoicePrepared,invoiceSent,sentAt:sent?.at||'',daysSinceContact:days,hasSavedReply:!!sent&&inbound>timestamp(sent.at),followup,next,events};
}
export function registerFunnel(state,id,{phase,at,note='',expected,followupDays=7},{uuid=()=>crypto.randomUUID(),companyId=''}={}){
 if(!Number.isInteger(followupDays)||followupDays<1||followupDays>365)throw Error('Kies een opvolgtermijn tussen 1 en 365 dagen.');
 if(!phaseIds.has(phase)||['welcome','received'].includes(phase)&&companyId!=='maatwerkkunststof'||!timestamp(at))throw Error('Kies een geldige fase en datum.');
 const o=state.orders.find(o=>o.id===id);if(!o)throw Error('Dit dossier bestaat niet meer.');
 if(expected!==JSON.stringify(o))throw Error('Dit dossier is intussen gewijzigd. Open de fase opnieuw.');
 const payment=funnelPayment(state,o);
 if(phase==='released'){const info=productionReleaseInfo(state,o,companyId,{payment});if(!info.eligible)throw Error(info.reasons.join(' '));o.productionDepositPercent=info.percentage;}
 const release=productionReleaseInfo(state,o,companyId,{payment}),released=companyId==='spatlappen'&&release.eligible&&(Boolean(o.productionReleasedDate)||release.automatic);
 if((phase==='paid'||phase==='production'&&!released)&&!payment.fullyPaid)throw Error('Registreer eerst de volledige betaling en controleer prijzen en verzendkosten.');
 if(phase==='production'&&!released&&!orderDocumentPrepared(state,o.id,'invoice')&&!o.invoiceSentDate&&!(o.salesFunnel?.events||[]).some(e=>e.phase==='invoice')&&!funnelMailEvents(state,o).some(e=>e.phase==='invoice'))throw Error('Bewaar eerst de factuur-PDF bij deze order.');
 const event={id:uuid(),phase,at,recordedAt:new Date().toISOString(),note:String(note).slice(0,2000)};o.salesFunnel??={events:[]};o.salesFunnel.events.push(event);o.salesFunnel.followupDays=followupDays;
 const key={quote:'quoteSentDate',confirmation:'confirmationSentDate',invoice:'invoiceSentDate',released:'productionReleasedDate',production:'productionDate',delivered:'deliveredDate'}[phase];if(key)o[key]=at.slice(0,10);
 if(phase==='released')o.stage='Productie vrijgegeven';if(phase==='production')o.stage='In productie';if(phase==='delivered'){o.stage='Afgerond';o.archived=true;}
 const signal=salesFunnel(state,o,companyId||'spatlappen').signal;o.salesFunnel.selection={phase:phase==='invoice'?signal.phase:funnelDisplayPhase(phase,companyId),basis:signal.basis};
 state.activities.unshift({id:uuid(),message:'Funnel: '+(phase==='invoice'?'Factuurversturing':funnelPhaseLabel(phase,companyId||'spatlappen'))+' geregistreerd',time:at});
 return event;
}
export function funnelMail(state,o,companyId,purpose){
 const customer=state.customers.find(c=>c.id===o.customerId),company=companyId==='spatlappen'?'Spatlappen op maat':'Maatwerkkunststof',greeting='Beste '+(customer?.contact||customer?.company||'klant')+',\n\n';
 const followup='We komen graag even terug op ons eerdere bericht over je aanvraag. Heb je dit kunnen bekijken? Laat gerust weten of je nog vragen hebt of iets wilt aanpassen.';
 const body=purpose==='indication'?'Op basis van de besproken gegevens sturen we je graag een eerste prijsindicatie.\n\n[Prijs en uitgangspunten invullen]\n\nDit is een indicatie. Na controle van de definitieve specificaties kunnen we een offerte opstellen.':followup;
 const thread=(state.mailThreads||[]).find(t=>t.orderId===o.id),last=(state.incomingEmails||[]).filter(m=>m.orderId===o.id&&(!thread||m.threadId===thread.gmailThreadId)).sort((a,b)=>timestamp(a.receivedAt)-timestamp(b.receivedAt)).at(-1);
 const templateId=purpose==='indication'?'sales-indication':'sales-followup',template=mailTemplates(state).find(t=>t.id===templateId),filled=template?fillMailTemplate(template,templateContext({customer,order:o,company:companyFor(companyId)})):null;
 return {templateId,...(thread?{gmailThreadId:thread.gmailThreadId,gmailMailbox:thread.mailbox,replyMessageId:last?.messageHeader||''}:{}),subject:filled?.subject||(purpose==='indication'?'Prijsindicatie':'Even terugkomen op je aanvraag')+' · #'+(o.sourceNumber||o.number),body:filled?.body||greeting+body+'\n\nMet vriendelijke groet,\n'+company};
}

// Legacy pending proposals retain their review route. New known acceptances may
// already be confirmed by the user-selected automatic mail-phase policy.
export function pendingFunnelMail(state,o,companyId){
 const latest=funnelMailEvents(state,o).filter(e=>['specs','indication','quote','confirmation'].includes(e.phase)).sort((a,b)=>timestamp(a.at)-timestamp(b.at)).at(-1);
 if(!latest||latest.review!=='pending')return null;
 const f=salesFunnel(state,o,companyId);
 if(['paid','released','production','delivered'].includes(f.phase)||f.phase===latest.phase)return null;
 // A later manual registration takes precedence over an older mail suggestion.
 if((o.salesFunnel?.events||[]).some(e=>timestamp(e.recordedAt||e.at)>timestamp(latest.at)))return null;
 return latest;
}
export function reviewFunnelMail(state,id,draftId,accept,{expected,companyId,uuid}={}){
 const o=state.orders.find(o=>o.id===id);
 if(!o||JSON.stringify(o)!==expected)throw Error('Dit dossier is intussen gewijzigd. Open het fasevoorstel opnieuw.');
 const event=pendingFunnelMail(state,o,companyId);
 if(!event||event.id!==draftId)throw Error('Dit fasevoorstel is niet meer actueel.');
 if(accept)registerFunnel(state,id,{phase:event.phase,at:event.at,expected,followupDays:o.salesFunnel?.followupDays||7,note:'Na verstuurde mail expliciet bevestigd'},{uuid,companyId});
 o.emailDrafts.find(d=>d.id===draftId).funnelReview=accept?'confirmed':'dismissed';
}
