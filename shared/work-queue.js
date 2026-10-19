import {batchPackingRows} from './batch-packing.js';
import {productionReleaseInfo} from './production-release.js';
import {orderReadiness} from './order-readiness.js';
import {salesFunnel,pendingFunnelMail} from './sales-funnel.js?v=workspace-search-20261017';
import {orderMailThreads} from './mail-inbox.js?v=workspace-search-20261017';
import {mailAttention,compareMailAttention} from './mail-attention.js?v=mail-priority-20261016-2';
const day=86400000,time=v=>Number.isFinite(Date.parse(v))?Date.parse(v):0;
// Pure projection of saved records. Rendering never sends mail or changes a dossier.
export function workQueue(state,companyId,{now=Date.now()}={}){
 const tasks=[],waiting=[],packing=new Map();if(companyId==='spatlappen')for(const p of state.purchases||[])if(!p.archived&&(p.orderedDate||['Besteld','In productie','Onderweg','Binnen in Nederland'].includes(p.status)))for(const r of batchPackingRows(state,p.id))packing.set(r.order.id,r);
 for(const o of state.orders){
  if(o.isSample&&!o.archived&&!o.sampleFollowupDone){const due=o.sampleFollowupDate,dayText=new Date(now).toISOString().slice(0,10);if(!due||due<=dayText){tasks.push({kind:'sample',orderId:o.id,number:o.sourceNumber||o.number,customer:state.customers.find(c=>c.id===o.customerId)?.company||'Klant onbekend',phase:'Teststuk',title:due?'Teststuk opvolgen':'Opvolging teststuk plannen',reason:due?'Vraag hoe het teststuk bevalt en bespreek een eventuele serie.':'Kies een opvolgdatum bij Order bewerken.',action:'view',label:'Teststuk openen',rank:16,priority:due&&due<dayText?'hoog':'normaal',priorityReason:due&&due<dayText?'Opvolgdatum verstreken':'',age:0,waitLabel:due?'Opvolgdatum '+due.split('-').reverse().join('-'):'Nog geen opvolgdatum',gaps:[]});continue;}}
  const f=salesFunnel(state,o,companyId,{now});if(f.phase==='delivered')continue;
  const origin=(state.inquirySources||[]).find(s=>s.orderId===o.id)?.createdAt||o.date;
  const age=time(origin)?Math.max(0,Math.floor((now-time(origin))/day)):null;
  const ageText=age===null?'Ontvangstdatum onbekend':age===0?'Vandaag aangevraagd':age+' '+(age===1?'dag':'dagen')+' sinds aanvraag';
  const review=pendingFunnelMail(state,o,companyId);
  const conversations=orderMailThreads(state,o.id).map(t=>({...t,attention:mailAttention(t.entries,{now,followupDays:o.salesFunnel?.followupDays||7})})).sort(compareMailAttention);
  const attention=conversations[0]?.attention;
  const hasConversationIncoming=conversations.some(t=>t.entries.some(m=>m.direction!=='outgoing'&&(m.gmailId||m.direction==='incoming')));
  const readiness=orderReadiness(state,o,companyId,{funnel:f});
  const task={gaps:readiness.inbound||readiness.paid?readiness.gaps:[],orderId:o.id,number:o.sourceNumber||o.number,customer:state.customers.find(c=>c.id===o.customerId)?.company||'Klant onbekend',phase:f.label,age:age||0,ageLabel:ageText,waitLabel:attention&&attention.waitingFor!=='none'?attention.label:ageText,waitDays:attention?.days??age,priority:'normaal',rank:40};
  const add=(kind,title,reason,action,label,rank,priority='normaal',priorityReason='')=>tasks.push({...task,kind,title,reason,action,label,rank,priority,priorityReason});
  const due=time(o.expectedDateTo||o.expectedDateFrom||o.expectedDate);
  // Dates are calendar days: do not mark today's delivery overdue.
  const late=due&&new Date(now).toISOString().slice(0,10)>new Date(due).toISOString().slice(0,10);
  if(review){add('review','Fase na verzending bevestigen','Je mail is aangeboden. Het dossier is nog niet naar de voorgestelde fase verplaatst.','review','Fasevoorstel bekijken',5,'hoog','Verzending nog controleren');continue;}
  if(late){add('delivery','Leverplanning controleren','De ingevulde leverdatum is verstreken. Controleer de afspraak en informeer de klant.','view','Dossier openen',0,'hoog','Leverdatum verstreken');continue;}
  if(attention?.waitingFor==='check'){add('mail-check','Verzending controleren',attention.reason,'mail','Gesprek openen',6,'hoog','Verzendresultaat controleren');continue;}
  if(readiness.inbound){const next=readiness.next;if(next)add('inbound-check','Levering voorbereiden · '+next.label.toLowerCase(),next.reason,next.action,next.cta,9,'hoog','Leverafspraak nog onvolledig');else waiting.push({...task,reason:'Belangrijke levergegevens zijn aanwezig. Registreer levering pas wanneer die werkelijk heeft plaatsgevonden.',action:'view',label:'Dossier openen'});continue;}
  const release=productionReleaseInfo(state,o,companyId,{payment:f.payment});
  if(!f.payment.fullyPaid&&!o.productionReleasedDate&&release.eligible){add('production-release',release.sampleZero?'Teststuk · vrijgave controleren':`${release.percentage}% ontvangen · vrijgave controleren`,'Controleer de afgesproken aanbetaling en ontwerpgoedkeuring. Vrijgave en fysieke productiestart zijn aparte stappen.','production-release','Vrijgave controleren',10,'hoog','Aanbetalingsvoorwaarden aanwezig');continue;}
  if(f.phase==='released'){const next=readiness.next;add('released',release.eligible?'Productie vrijgegeven · volgende stap':'Vrijgavevoorwaarden opnieuw controleren',next?.reason||release.reasons.join(' '),next?.action||f.next[0],next?.cta||f.next[1],12,release.eligible?'normaal':'hoog',release.eligible?'':'Vrijgavevoorwaarden gewijzigd');continue;}
  if(f.phase==='paid'){
   const next=readiness.next;
   const title=next?.action==='documents'?'Betaald · documentkopie ontbreekt':next?.key==='invoice'?(f.invoicePrepared?'Betaald · factuur staat klaar':'Betaald · factuur maken'):next?'Betaald · '+next.label.toLowerCase()+' controleren':'Betaald · productie voorbereiden';
   add('paid',title,next?next.reason:'De voorbereidende stappen zijn aanwezig. Registreer de productiestart zodra die werkelijk plaatsvindt.',next?.action||f.next[0],next?.cta||f.next[1],10,'hoog','Betaling ontvangen');continue;
  }
  if(readiness.paid&&readiness.next){const next=readiness.next;add('paid-check','Betaling ontvangen · '+next.label.toLowerCase()+' controleren',next.reason,next.action,next.cta,11,'hoog','Betaling ontvangen; dossier onvolledig');continue;}
  const pack=packing.get(o.id);if(f.phase==='production'&&pack&&!pack.existing&&pack.missing.length){const productGap=pack.missing.some(reason=>reason.includes('Producten'));add('packing-check','Pakbon voorbereiden · gegevens aanvullen',pack.missing.join(' · '),productGap?'order-edit':'delivery-details',productGap?'Producten controleren':'Levergegevens aanvullen',17);continue;}
  if(f.phase==='production'&&readiness.gaps.length){const next=readiness.gaps.find(c=>c.key==='invoice')||readiness.gaps[0];add('production-check','Uitvoering · dossier controleren',next.reason,next.action,next.cta,14,'hoog','Ontbrekende stap tijdens uitvoering');continue;}

  if(f.phase==='pricing'||f.phase==='new'){
   const pricing=f.phase==='pricing'||!f.missing.length;
   const delayed=age>=3||attention?.needsReply&&attention.priority==='hoog';
   add(pricing?'pricing':'new',pricing?'Klant wacht op een prijs':'Nieuwe aanvraag beoordelen',f.missing.length?'Nog nodig: '+f.fields.filter(v=>!v.complete).map(v=>v.label).join(', '):'Benodigde aanvraaggegevens aanwezig',f.missing.length?'specs':f.next[0],f.missing.length?'Specificaties opvragen':f.next[1],pricing&&delayed?12:20,delayed?'hoog':'normaal',delayed?(attention?.needsReply&&attention.priority==='hoog'?'Klant wacht minimaal 3 dagen':'Aanvraag minimaal 3 dagen oud'):'');continue;
  }
  if(attention?.needsReply||!hasConversationIncoming&&f.hasSavedReply&&['specs','indication','quote','confirmation'].includes(f.phase)){add('reply','Reactie van klant controleren',attention?.needsReply?'Dit gesprek heeft nog geen geregistreerd antwoord.':'Er is een opgeslagen inkomend bericht na je laatste geregistreerde mail.','mail','Gesprek openen',15,attention?.needsReply?attention.priority:'hoog',attention?.priority==='hoog'?'Klant wacht minimaal 3 dagen':'Nieuw antwoord beoordelen');continue;}
  if(f.phase==='specs'&&!f.missing.length){add('pricing','Specificaties compleet · prijs berekenen','De benodigde aanvraaggegevens zijn ingevuld.','calculate','Prijs berekenen',18,age>=3?'hoog':'normaal',age>=3?'Aanvraag minimaal 3 dagen oud':'');continue;}
  if(f.followup&&(!attention||attention.waitingFor==='none'||attention.waitingFor==='customer'&&attention.needsAttention)){add('followup','Klant opvolgen',f.daysSinceContact+' dagen sinds laatste geregistreerde mail, zonder nieuwer opgeslagen antwoord. Controleer eerst het gesprek.','followup','Opvolgmail voorbereiden',30);continue;}
  waiting.push({...task,reason:f.daysSinceContact==null?'Volgende stap: '+f.next[1]:f.daysSinceContact+' dagen sinds laatste geregistreerde mail',action:f.next[0],label:f.next[1]});
 }
 tasks.sort((a,b)=>Number(b.priority==='hoog')-Number(a.priority==='hoog')||a.rank-b.rank||(b.waitDays||0)-(a.waitDays||0)||b.age-a.age||String(a.orderId).localeCompare(String(b.orderId)));
 return {tasks,waiting,high:tasks.filter(t=>t.priority==='hoog').length,pricing:tasks.filter(t=>t.kind==='pricing').length,new:tasks.filter(t=>t.kind==='new').length,followup:tasks.filter(t=>t.kind==='followup').length};
}
