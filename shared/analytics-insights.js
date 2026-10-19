import {analyticsExclusionContext} from './analytics-exclusions.js';
// Read-only analytics rules: amounts stay in the CRM; sources are never added together.
const day=86400000;
export function changeMetric(current,previous,{minimum=10,relative=.3,absolute=5}={}){
 if(!Number.isFinite(current)||!Number.isFinite(previous)||previous<minimum)return null;
 const delta=current-previous;if(Math.abs(delta)<absolute||Math.abs(delta)/previous<relative)return null;
 return {current,previous,delta,percent:delta/previous*100,direction:delta>0?'up':'down'};
}
export function websiteSignals(report){
 if(!report.comparison?.complete)return [];
 const p=report.comparison,rows=[];
 for(const [key,label,current,previous,opts]of [
  ['visits','Gemeten websitebezoek',report.summary.visits,p.summary.visits,{minimum:50,absolute:20}],
  ['leads','Ontvangen aanvragen',report.leads.count,p.leads.count,{minimum:10,absolute:5}],
  ['unfinished','Niet afgeronde formulieren',report.summary.unfinished,p.summary.unfinished,{minimum:10,absolute:5}]
 ]){const change=changeMetric(current,previous,opts);if(change)rows.push({key,label,...change});}
 return rows;
}
export function querySignals(current,previous,{limit=10}={}){
 const map=new Map(previous.map(r=>[r.key,r])),signals=[];
 for(const row of current){const old=map.get(row.key);if(!old)continue;
  const change=changeMetric(row.clicks,old.clicks,{minimum:10,relative:.35,absolute:8});
  if(change)signals.push({key:row.key,metric:'clicks',label:'Klikken',...change});
  if(row.impressions>=100&&old.impressions>=100&&Number.isFinite(row.position)&&Number.isFinite(old.position)&&Math.abs(row.position-old.position)>=3)signals.push({key:row.key,metric:'position',label:'Gemiddelde positie',current:row.position,previous:old.position,delta:row.position-old.position,direction:row.position<old.position?'up':'down'});
 }
 return signals.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,limit);
}
export function inquirySummary(state,{since,until=Date.now(),totals}){
 const excluded=analyticsExclusionContext(state).orderIds;
 const orders=(state.orders||[]).filter(o=>{const d=Date.parse(o.date||'');return !excluded.has(o.id)&&Number.isFinite(d)&&d>=since&&d<=until;});
 const linked=new Set(),quoted=new Set(),paid=new Set();
 for(const o of orders){if(o.websiteLeadId)linked.add(o.websiteLeadId);if(o.quoteSentDate||(state.documents||[]).some(d=>(d.orderId===o.id||d.ownerId===o.id)&&d.category==='quote'))quoted.add(o.id);const t=totals(o);if(t.priceKnown&&o.shippingKnown&&Number.isFinite(t.total)&&Number.isFinite(t.paid)&&t.total>0&&t.paid>=t.total)paid.add(o.id);}
 const statuses=new Map();for(const o of orders){const stage=o.stage||'Nog geen fase';statuses.set(stage,(statuses.get(stage)||0)+1);}
 const customers=new Set(orders.map(o=>o.customerId));return {count:orders.length,customers:customers.size,quoted:quoted.size,paid:paid.size,websiteLinked:linked.size,statuses:[...statuses].map(([label,count])=>({label,count})),orders:orders.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''))};
}
export function dailyRows(report){
 const rows=new Map((report.daily?.visits||[]).map(r=>[r.date,{...r}]));for(const r of report.daily?.leads||[]){const row=rows.get(r.date)||{date:r.date,visits:0,started:0,converted:0};row.leads=r.leads;rows.set(r.date,row);}
 const first=new Date(report.since);first.setUTCHours(0,0,0,0);const out=[];
 for(let at=+first;at<=report.until;at+=day){const date=new Date(at).toISOString().slice(0,10);out.push({date,visits:0,started:0,converted:0,leads:0,...rows.get(date)});}
 return out;
}
