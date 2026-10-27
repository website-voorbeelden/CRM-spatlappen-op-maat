// Pure reporting rules. These are practical attention thresholds, not p-values,
// causal findings or an assumption that repeated page loads are independent.
import {changeMetric,querySignals} from './analytics-insights.js';
const day=86400000;
const date=value=>new Date(value).toISOString().slice(0,10);
export function weeklySlot(now=Date.now()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const get=key=>parts.find(p=>p.type===key).value;
 const today=Date.UTC(+get('year'),+get('month')-1,+get('day')),weekday=new Date(today).getUTCDay();
 let back=(weekday+2)%7;if(back===0&&+get('hour')<9)back=7;
 const friday=today-back*day,end=friday-5*day,start=end-6*day;
 return {id:date(friday),ranges:[{start:date(start),end:date(end)},{start:date(start-7*day),end:date(start-day)}],timeZone:'Europe/Amsterdam',schedule:'Vrijdag 09.00 uur · Nederlandse tijd'};
}
export function isReportId(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&date(Date.parse(value))===value&&new Date(value+'T12:00:00Z').getUTCDay()===5;}
export function weeklyFindings(report){
 const findings=[],metrics=[],search=report.google.search,web=report.website,ga=report.google.ga;
 function count(key,label,current,previous,options,source,eligible=true){
  metrics.push({key,label,current,previous,unit:'count',source});
  const change=changeMetric(current,previous,options);
  if(change&&eligible)findings.push({key,label,...change,unit:'count',source,tone:change.direction==='up'?'positive':'negative',detail:'Groot verschil boven de volume- en veranderingsgrens; bekijk de bijbehorende bron.'});
 }
 if(search.status==='ready'){
  const comparable=search.dailyComplete===true;
  count('clicks','Google-zoekklikken',search.current.clicks,search.previous.clicks,{minimum:20,relative:.3,absolute:10},'search',comparable);
  count('impressions','Google-vertoningen',search.current.impressions,search.previous.impressions,{minimum:100,relative:.3,absolute:100},'search',comparable);
  if(!comparable)findings.push({key:'search-coverage',label:'Google: controleer beschikbare dagen',unit:'coverage',source:'search',tone:'neutral',detail:'Niet alle 14 dagen hebben een teruggegeven rij. Dit kan geen verkeer óf ontbrekende data betekenen. Bekijk de daggrafiek, ook bij een mogelijke sterke terugval; geen stevige groeiconclusie op deze basis.'});
  metrics.push({key:'ctr',label:'Google-klikratio',current:search.current.ctr,previous:search.previous.ctr,unit:'rate',source:'search'});
  if(comparable&&search.current.impressions>=100&&search.previous.impressions>=100&&Math.abs(search.current.ctr-search.previous.ctr)>=.02)findings.push({key:'ctr',label:'Google-klikratio',current:search.current.ctr,previous:search.previous.ctr,unit:'rate',source:'search',tone:search.current.ctr>search.previous.ctr?'positive':'negative',detail:'Minstens 2 procentpunt verschil bij minstens 100 vertoningen per week. Zoekopdrachtmix kan meespelen.'});
  for(const signal of comparable?querySignals(search.queries,search.previousQueries,{limit:5}):[])findings.push({...signal,key:'query:'+signal.key,label:'Zoekwoord: '+signal.key,unit:signal.metric==='position'?'position':'count',source:'search',tone:signal.direction==='up'?'positive':'negative',detail:signal.metric==='position'?'Gemiddelde positie; lager is beter. Geen vaste ranking of bewezen oorzaak.':'Alleen zoekwoorden die in beide toplijsten voorkomen; ontbrekend is niet nul.'});
 }
 if(web.status==='ready'){
  const c=web.current,p=web.previous,comparable=web.comparisonComplete;
  count('visits','Gemeten paginabezoeken',c.visits,comparable?p.visits:null,{minimum:50,relative:.3,absolute:20},'website');
  count('leads','Ontvangen websiteaanvragen',c.leads,comparable?p.leads:null,{minimum:10,relative:.3,absolute:5},'website');
  const current=c.visits?c.converted/c.visits:null,previous=comparable&&p.visits?p.converted/p.visits:null;
  metrics.push({key:'conversion',label:'Gemeten bezoek → aanvraag',current,previous,unit:'rate',source:'website'});
  if(c.visits>=100&&p.visits>=100&&comparable&&c.converted>=5&&p.converted>=5&&Math.abs(current-previous)>=.02)findings.push({key:'conversion',label:'Gemeten bezoek → aanvraag',current,previous,unit:'rate',source:'website',tone:current>previous?'positive':'negative',detail:'Minstens 2 procentpunt verschil, 100 paginabezoeken en 5 gekoppelde conversies per week. Dit betreft ontvangen aanvragen binnen dezelfde week, geen betaalde orders of unieke bezoekers.'});
  const avg=c.visits?c.activeSeconds/c.visits:null,old=comparable&&p.visits?p.activeSeconds/p.visits:null;
  metrics.push({key:'active',label:'Actieve tijd per paginabezoek',current:avg,previous:old,unit:'seconds',source:'website'});
  const time=c.visits>=100&&p.visits>=100?changeMetric(avg,old,{minimum:10,relative:.3,absolute:10}):null;
  if(time)findings.push({key:'active',label:'Actieve tijd per paginabezoek',...time,unit:'seconds',source:'website',tone:'neutral',detail:'Meer tijd kan betrokkenheid óf zoeken naar informatie betekenen. Zonder individuele spreiding geen uitspraak over statistische significantie.'});
 }
 if(ga.status==='ready'){
  const c=ga.current.total,p=ga.previous.total;
  if(!ga.thresholded)count('sessions','GA4-sessies',c.sessions,p.sessions,{minimum:50,relative:.3,absolute:20},'ga');
  else metrics.push({key:'sessions',label:'GA4-sessies (privacydrempel)',current:c.sessions,previous:p.sessions,unit:'count',source:'ga'});
  metrics.push({key:'gaActive',label:'GA4-actieve tijd per sessie',current:c.sessions?c.userEngagementDuration/c.sessions:null,previous:p.sessions?p.userEngagementDuration/p.sessions:null,unit:'seconds',source:'ga'});
 }
 return {metrics,findings:findings.sort((a,b)=>Number(a.key.startsWith('query:'))-Number(b.key.startsWith('query:'))).slice(0,12)};
}
