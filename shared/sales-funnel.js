import {productionReleaseInfo} from './production-release.js';
import {mailTemplates,fillMailTemplate,templateContext} from './mail-templates.js?v=sales-funnel-20261015';
import {companyFor} from './companies.js';
import {inquiryRequirements} from './inquiries.js?v=workspace-search-20261017';
export const funnelPhases=[['new','Nieuwe aanvragen'],['specs','Specificaties opgevraagd'],['pricing','Prijs berekenen'],['indication','Prijsindicatie verstuurd'],['quote','Offerte verstuurd'],['confirmation','Orderbevestiging · wacht op betaling'],['paid','Betaald'],['released','Productie vrijgegeven'],['production','In productie'],['delivered','Geleverd / gearchiveerd']];
const phaseIds=new Set([...funnelPhases.map(([id])=>id),'invoice']),day=86400000;
const timestamp=value=>Number.isFinite(Date.parse(value))?Date.parse(value):0;
export function funnelPayment(state,o){const known=o.items.length>0&&(o.packagePrice!=null||o.items.every(i=>Number.isSafeInteger(i.price)))&&o.shippingKnown!==false;const net=(o.packagePrice??o.items.reduce((s,i)=>s+i.quantity*(i.price||0),0))+(o.shippingCharge||0),total=net+Math.round(net*(o.vat??21)/100),paid=state.payments.filter(p=>p.orderId===o.id).reduce((n,p)=>n+p.amount,0);return {known,total,paid,fullyPaid:known&&total>0&&paid>=total};}
export function funnelMailEvents(state,o){return (o.emailDrafts||[]).filter(d=>d.status==='accepted'&&timestamp(d.sentAt)).map(d=>{const doc=state.documents.find(x=>x.id===d.documentId),kind=doc?.generated?.kind||doc?.category;return {id:d.id,phase:({quote:'quote',confirmation:'confirmation',invoice:'invoice'})[kind]||d.funnelPurpose||'',at:d.sentAt,source:'mail',review:d.funnelReview};}).filter(e=>phaseIds.has(e.phase)||e.phase==='followup');}
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
 const sent=events.filter(e=>['specs','indication','quote','confirmation','invoice','followup'].includes(e.phase)).at(-1);
 const inbound=(state.incomingEmails||[]).filter(m=>m.orderId===o.id&&m.direction!=='outgoing').reduce((n,m)=>Math.max(n,timestamp(m.receivedAt)),0);
 const waiting=['specs','indication','quote','confirmation','invoice'].includes(phase)&&sent&&inbound<=timestamp(sent.at),days=sent?Math.max(0,Math.floor((now-timestamp(sent.at))/day)):null;
 const followup=Boolean(waiting&&days>=followupDays),invoiceSent=events.some(e=>e.phase==='invoice');
 const invoicePrepared=state.documents.some(d=>d.ownerId===o.id&&(d.generated?.kind||d.category)==='invoice'&&/\.pdf$/i.test(d.name||''));
 const actions={new:['specs','Specificaties opvragen'],specs:['specs','Specificaties controleren'],pricing:['calculate','Prijs berekenen'],indication:['quote','Offerte voorbereiden'],quote:['confirmation','Orderbevestiging voorbereiden'],confirmation:['payment','Betaling registreren'],invoice:['payment','Betaling registreren'],paid:invoiceSent?['production','Productiestart registreren']:['invoice',invoicePrepared?'Factuur mailen':'Factuur maken'],released:(o.items.some(i=>i.productionSource!=='local')?['purchase','Inkoopbestelling controleren']:['production','Productiestart registreren']),production:['delivery','Levering registreren'],delivered:['view','Dossier bekijken']};
 const next=['new','specs'].includes(phase)&&!requirements.missing.length?['calculate','Prijs berekenen']:actions[phase]||actions.new;
 return {phase,label:funnelPhases.find(([id])=>id===phase)?.[1]||'Nieuwe aanvraag',payment,missing:requirements.missing,fields:requirements.fields,invoicePrepared,invoiceSent,sentAt:sent?.at||'',daysSinceContact:days,hasSavedReply:!!sent&&inbound>timestamp(sent.at),followup,next,events};
}
export function registerFunnel(state,id,{phase,at,note='',expected,followupDays=7},{uuid=()=>crypto.randomUUID(),companyId=''}={}){
 if(!Number.isInteger(followupDays)||followupDays<1||followupDays>365)throw Error('Kies een opvolgtermijn tussen 1 en 365 dagen.');
 if(!phaseIds.has(phase)||!timestamp(at))throw Error('Kies een geldige fase en datum.');
 const o=state.orders.find(o=>o.id===id);if(!o)throw Error('Dit dossier bestaat niet meer.');
 if(expected!==JSON.stringify(o))throw Error('Dit dossier is intussen gewijzigd. Open de fase opnieuw.');
 const payment=funnelPayment(state,o);
 if(phase==='released'){const info=productionReleaseInfo(state,o,companyId,{payment});if(!info.eligible)throw Error(info.reasons.join(' '));o.productionDepositPercent=info.percentage;}
 const released=companyId==='spatlappen'&&Boolean(o.productionReleasedDate)&&productionReleaseInfo(state,o,companyId,{payment}).eligible;
 if((phase==='paid'||phase==='production'&&!released)&&!payment.fullyPaid)throw Error('Registreer eerst de volledige betaling en controleer prijzen en verzendkosten.');
 if(phase==='production'&&!released&&!o.invoiceSentDate&&!(o.salesFunnel?.events||[]).some(e=>e.phase==='invoice')&&!funnelMailEvents(state,o).some(e=>e.phase==='invoice'))throw Error('Registreer eerst dat de factuur is verstuurd.');
 const event={id:uuid(),phase,at,recordedAt:new Date().toISOString(),note:String(note).slice(0,2000)};o.salesFunnel??={events:[]};o.salesFunnel.events.push(event);o.salesFunnel.followupDays=followupDays;
 const key={quote:'quoteSentDate',confirmation:'confirmationSentDate',invoice:'invoiceSentDate',released:'productionReleasedDate',production:'productionDate',delivered:'deliveredDate'}[phase];if(key)o[key]=at.slice(0,10);
 if(phase==='released')o.stage='Productie vrijgegeven';if(phase==='production')o.stage='In productie';if(phase==='delivered'){o.stage='Afgerond';o.archived=true;}
 state.activities.unshift({id:uuid(),message:'Funnel: '+(phase==='invoice'?'Factuurversturing':funnelPhases.find(([p])=>p===phase)[1])+' geregistreerd',time:at});
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

// New sent messages remain facts, but only explicit approval changes the sales phase.
export function pendingFunnelMail(state,o,companyId){
 const latest=funnelMailEvents(state,o).filter(e=>['specs','indication','quote','confirmation'].includes(e.phase)).sort((a,b)=>timestamp(a.at)-timestamp(b.at)).at(-1);
 if(!latest||latest.review!=='pending')return null;
 const f=salesFunnel(state,o,companyId);
 if(['paid','production','delivered'].includes(f.phase)||f.phase===latest.phase)return null;
 // A later manual registration takes precedence over an older mail suggestion.
 if((o.salesFunnel?.events||[]).some(e=>timestamp(e.recordedAt||e.at)>timestamp(latest.at)))return null;
 return latest;
}
export function reviewFunnelMail(state,id,draftId,accept,{expected,companyId,uuid}={}){
 const o=state.orders.find(o=>o.id===id);
 if(!o||JSON.stringify(o)!==expected)throw Error('Dit dossier is intussen gewijzigd. Open het fasevoorstel opnieuw.');
 const event=pendingFunnelMail(state,o,companyId);
 if(!event||event.id!==draftId)throw Error('Dit fasevoorstel is niet meer actueel.');
 if(accept)registerFunnel(state,id,{phase:event.phase,at:event.at,expected,followupDays:o.salesFunnel?.followupDays||7,note:'Na verstuurde mail expliciet bevestigd'},{uuid});
 o.emailDrafts.find(d=>d.id===draftId).funnelReview=accept?'confirmed':'dismissed';
}
