import {companyFromEnv} from '../shared/companies.js';
import {analyticsExclusionContext} from '../shared/analytics-exclusions.js';
import {sha256} from './integration-store.js';
export async function weeklyExclusionSignature(state){const e=analyticsExclusionContext(state);return sha256(JSON.stringify([e.config,[...e.leadIds].sort()]));}
// Weekly aggregates only. The exact same explicit test-lead exclusion policy as
// website-analytics; never persist visitor IDs, lead IDs, emails or form content.
export async function weeklyWebsiteReport(env,state,ranges){
 const site=companyFromEnv(env).website.toLowerCase(),db=env.SITE_ANALYTICS_DB;
 if(!db||env.WEBSITE_ANALYTICS_SITE!==site)return {status:'not-configured'};
 const excluded=analyticsExclusionContext(state),token='|'+[...excluded.leadIds].join('|')+'|';
 const cte=`WITH excluded AS (SELECT id,visit_id FROM site_leads WHERE site=? AND instr(?, '|'||id||'|')>0),
 visits AS (SELECT v.* FROM site_visits v WHERE v.site=? AND NOT EXISTS(SELECT 1 FROM excluded x WHERE x.visit_id=v.id)),
 leads AS (SELECT l.* FROM site_leads l WHERE l.site=? AND NOT EXISTS(SELECT 1 FROM excluded x WHERE x.id=l.id)) `;
 const prepare=sql=>({bind:(...values)=>db.prepare(cte+sql).bind(site,token,site,site,...values)});
 const bounds=ranges.map(r=>({start:Date.parse(r.start+'T00:00:00Z'),end:Date.parse(r.end+'T00:00:00Z')+86400000}));
 try{
  const results=await db.batch(bounds.flatMap(({start,end})=>[
   prepare(`SELECT COUNT(*) visits,COALESCE(SUM(active_seconds),0) activeSeconds,
    COALESCE(SUM(EXISTS(SELECT 1 FROM leads l WHERE l.visit_id=v.id AND l.received_at>=? AND l.received_at<?)),0) converted,
    (SELECT COUNT(*) FROM leads WHERE received_at>=? AND received_at<?) leadCount,
    COALESCE(SUM(form_started),0) started FROM visits v WHERE started_at>=? AND started_at<?`).bind(start,end,start,end,start,end),
   prepare(`SELECT date(started_at/1000,'unixepoch') date,COUNT(*) visits,COALESCE(SUM(active_seconds),0) activeSeconds,
    COALESCE(SUM(EXISTS(SELECT 1 FROM leads l WHERE l.visit_id=v.id AND l.received_at>=? AND l.received_at<?)),0) converted
    FROM visits v WHERE started_at>=? AND started_at<? GROUP BY date ORDER BY date`).bind(start,end,start,end),
   prepare(`SELECT date(received_at/1000,'unixepoch') date,COUNT(*) leads FROM leads WHERE received_at>=? AND received_at<? GROUP BY date ORDER BY date`).bind(start,end),
   prepare(`SELECT device,COUNT(*) visits FROM visits WHERE started_at>=? AND started_at<? GROUP BY device ORDER BY visits DESC`).bind(start,end)
  ]));
  const first=await prepare('SELECT MIN(started_at) first FROM visits').bind().first();
  const period=offset=>{const row=results[offset].results[0];return {visits:row.visits,activeSeconds:row.activeSeconds,converted:row.converted,leads:row.leadCount,started:row.started,daily:results[offset+1].results,leadDays:results[offset+2].results,devices:results[offset+3].results};};
  return {status:'ready',current:period(0),previous:period(4),comparisonComplete:first?.first!=null&&first.first<=bounds[1].start,currentComplete:first?.first!=null&&first.first<=bounds[0].start,firstMeasuredAt:first?.first??null,timeZone:'UTC'};
 }catch{return {status:'unavailable',error:'De aparte website-meetdatabase kon geen weekcijfers leveren.'};}
}
