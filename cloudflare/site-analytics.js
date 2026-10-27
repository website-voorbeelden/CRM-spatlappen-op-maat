import {analyticsExclusionContext} from '../shared/analytics-exclusions.js';
import {companyFromEnv} from '../shared/companies.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
// Read-only route behind the existing CRM authentication middleware. A separate D1 binding.
export async function websiteAnalytics({request,env,state={}},now=Date.now()){
 const company=companyFromEnv(env),site=company.website.toLowerCase(),db=env.SITE_ANALYTICS_DB;
 if(!db||env.WEBSITE_ANALYTICS_SITE!==site)return json({status:'not-configured',site});
 const params=new URL(request.url).searchParams,days=Number(params.get('days')||30),page=params.get('page')||'';
 if(page&&!/^(?:[a-zA-Z0-9][a-zA-Z0-9._/-]{0,149}|\/[a-zA-Z0-9._/-]{0,149})$/.test(page))return json({error:'Kies een geldige gemeten pagina.'},400);
 if(![7,30,90].includes(days))return json({error:'Kies 7, 30 of 90 dagen.'},400);
 const issueMetrics=[...['fields','invalid_fields'].flatMap(key=>[1,2,4,8,16].map(mask=>`COALESCE(SUM((${key}&${mask})!=0),0) ${key}_${mask}`)),...[1,2,4,8,16,32,64].map(mask=>`COALESCE(SUM((errors&${mask})!=0),0) errors_${mask}`)].join(',');
 const since=now-days*86400000,where='v.site=? AND v.started_at>=? AND v.started_at<=? ';
 const success='EXISTS (SELECT 1 FROM leads l WHERE l.site=v.site AND l.visit_id=v.id)';
 try{
  const excluded=analyticsExclusionContext(state),token='|'+[...excluded.leadIds].join('|')+'|';
  // Exact lead IDs only; linked visits are filtered from every metric and period.
  // Binding the delimited UUID set avoids SQL interpolation and D1 parameter limits.
  const cte=`WITH excluded_leads AS (SELECT id,visit_id FROM site_leads WHERE site=? AND instr(?, '|'||id||'|')>0),
   all_visits AS (SELECT v.* FROM site_visits v WHERE NOT EXISTS(SELECT 1 FROM excluded_leads x WHERE x.visit_id=v.id)),
   visits AS (SELECT v.* FROM all_visits v WHERE (?='' OR v.page=?)),
   leads AS (SELECT l.* FROM site_leads l WHERE NOT EXISTS(SELECT 1 FROM excluded_leads x WHERE x.id=l.id) AND (?='' OR EXISTS(SELECT 1 FROM visits v WHERE v.site=l.site AND v.id=l.visit_id))) `;
  const prepare=sql=>({bind:(...values)=>db.prepare(cte+sql).bind(site,token,page,page,page,...values)});
  const result=await db.batch([
   prepare(`SELECT COUNT(*) visits,COALESCE(SUM(active_seconds),0) active_seconds,
    COALESCE(SUM(form_seen),0) form_seen,COALESCE(SUM(form_started),0) form_started,
    COALESCE(SUM(submitted),0) submitted,COALESCE(SUM(${success}),0) converted_visits,
    COALESCE(SUM(form_started=1 AND NOT ${success} AND updated_at<?),0) unfinished,
    COALESCE(SUM(form_started=1 AND NOT ${success} AND updated_at>=?),0) pending,
    COALESCE(SUM(quote_clicked),0) quote_clicked,COALESCE(SUM(phone_clicked),0) phone_clicked,
    COALESCE(SUM(email_clicked),0) email_clicked,COALESCE(SUM(whatsapp_clicked),0) whatsapp_clicked,
    COALESCE(SUM(upload_selected),0) upload_selected,
    COALESCE(SUM(scroll_depth>=75),0) scroll_75,MAX(updated_at) latest
    FROM visits v WHERE ${where}`).bind(now-1800000,now-1800000,site,since,now),
   prepare(`SELECT source,COUNT(*) visits,COALESCE(SUM(${success}),0) converted FROM visits v WHERE ${where} GROUP BY source ORDER BY visits DESC`).bind(site,since,now),
   prepare(`SELECT device,COUNT(*) visits,COALESCE(SUM(${success}),0) converted FROM visits v WHERE ${where} GROUP BY device ORDER BY visits DESC`).bind(site,since,now),
   prepare(`SELECT ${issueMetrics} FROM visits v WHERE ${where}`).bind(site,since,now),
   prepare('SELECT reason,COUNT(*) count FROM site_feedback WHERE site=? AND received_at>=? AND received_at<=? GROUP BY reason ORDER BY count DESC').bind(site,since,now),
   prepare('SELECT COUNT(*) count,MAX(received_at) latest FROM leads WHERE site=? AND received_at>=? AND received_at<=?').bind(site,since,now),
   prepare('SELECT id FROM leads WHERE site=? AND received_at>=? AND received_at<=? ORDER BY received_at DESC LIMIT 10001').bind(site,since,now),
   prepare(`SELECT date(started_at/1000,'unixepoch') date,COUNT(*) visits,SUM(form_started) started,SUM(${success}) converted FROM visits v WHERE ${where} GROUP BY date ORDER BY date`).bind(site,since,now),
   prepare("SELECT date(received_at/1000,'unixepoch') date,COUNT(*) leads FROM leads WHERE site=? AND received_at>=? AND received_at<=? GROUP BY date ORDER BY date").bind(site,since,now),
   prepare(`SELECT COUNT(*) visits,COALESCE(SUM(active_seconds),0) active_seconds,COALESCE(SUM(form_started=1 AND NOT ${success} AND updated_at<?),0) unfinished,COALESCE(SUM(${success}),0) converted_visits FROM visits v WHERE ${where}`).bind(now-1800000,site,since-days*86400000,since-1),
   prepare('SELECT COUNT(*) count FROM leads WHERE site=? AND received_at>=? AND received_at<?').bind(site,since-days*86400000,since),
   prepare('SELECT MIN(started_at) first FROM visits WHERE site=?').bind(site),
   prepare('SELECT source,COUNT(*) count FROM leads WHERE site=? AND received_at>=? AND received_at<=? GROUP BY source ORDER BY count DESC').bind(site,since,now),
   prepare('SELECT page,COUNT(*) visits,COALESCE(SUM(active_seconds),0) active_seconds FROM all_visits WHERE site=? AND started_at>=? AND started_at<=? GROUP BY page ORDER BY visits DESC').bind(site,since,now),
   prepare(`SELECT COUNT(*) samples,AVG(delay_ms) average_ms,MIN(delay_ms) minimum_ms,MAX(delay_ms) maximum_ms FROM (SELECT v.id,MIN(l.received_at)-v.started_at delay_ms FROM visits v JOIN leads l ON l.site=v.site AND l.visit_id=v.id WHERE v.site=? AND l.received_at>=? AND l.received_at<=? AND v.started_at>=? AND v.started_at<=l.received_at GROUP BY v.id)`).bind(site,since,now,now-90*86400000)
  ]);
  return json({status:'ready',site,scope:{page:page||null,unlinkedLeadsExcluded:!!page},exclusions:{signature:JSON.stringify(excluded.config),emails:excluded.config.emails.length,explicitLeads:excluded.config.leadIds.length,knownLeads:excluded.leadIds.size,orders:excluded.orderIds.size},days,since,until:now,summary:result[0].results[0],sources:result[1].results,devices:result[2].results,issues:result[3].results[0],feedback:page?[]:result[4].results,leads:result[5].results[0],leadIds:result[6].results.slice(0,10000).map(r=>r.id),leadIdsComplete:result[6].results.length<=10000,daily:{visits:result[7].results,leads:result[8].results},comparison:days===90?null:{summary:result[9].results[0],leads:result[10].results[0],since:since-days*86400000,until:since,complete:result[11].results[0]?.first!=null&&result[11].results[0].first<=since-days*86400000},firstMeasuredAt:result[11].results[0]?.first??null,leadSources:result[12].results,pages:result[13].results,timeToInquiry:result[14].results[0]});
 }catch{return json({status:'unavailable',site,error:'Website-metingen zijn nu niet bereikbaar. Controleer de aparte meetdatabase en de tabellen.'},503);}
}
