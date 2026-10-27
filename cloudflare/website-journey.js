import {companyFromEnv} from '../shared/companies.js';
import {analyticsExclusionContext} from '../shared/analytics-exclusions.js';
import {websiteUuid} from '../shared/website-dossier.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
// Authenticated CRM route, bounded by an existing order in this company's state.
// Never accept arbitrary visit IDs, customer emails or telephone numbers as a lookup key.
export async function websiteJourney({request,env,state},now=Date.now()){
 const orderId=new URL(request.url).searchParams.get('orderId'),order=state.orders?.find(o=>o.id===orderId);
 if(!order)return json({error:'Dit dossier staat niet in de gekoppelde online CRM-opslag. Er is geen websiteprofiel opgezocht.'},404);
 const site=companyFromEnv(env).website.toLowerCase(),db=env.SITE_ANALYTICS_DB;
 if(!db||env.WEBSITE_ANALYTICS_SITE!==site)return json({status:'not-configured',site});
 if(!websiteUuid(order.websiteLeadId))return json({status:'no-link',site});
 if(analyticsExclusionContext(state).orderIds.has(order.id))return json({status:'excluded',site});
 try{
  const lead=await db.prepare('SELECT id,received_at,visit_id,source FROM site_leads WHERE site=? AND id=? AND received_at>=? AND received_at<=?').bind(site,order.websiteLeadId.toLowerCase(),now-90*86400000,now).first();
  if(!lead)return json({status:'not-found',site});
  let visit=lead.visit_id?await db.prepare('SELECT started_at,updated_at,page,source,device,active_seconds,scroll_depth,form_seen,form_started,submitted,quote_clicked,email_clicked,phone_clicked,whatsapp_clicked,fields,errors FROM site_visits WHERE site=? AND id=? AND started_at>=? AND started_at<=?').bind(site,lead.visit_id,now-90*86400000,lead.received_at).first():null;
  let steps=null;
  if(visit&&env.WEBSITE_ANALYTICS_STEPS==='true')try{steps=await db.prepare('SELECT form_seen_ms,form_started_ms,submitted_ms,email_clicked_ms,phone_clicked_ms,whatsapp_clicked_ms,active_at_submit FROM site_visit_steps WHERE site=? AND visit_id=?').bind(site,lead.visit_id).first();}catch{/* Existing v1 measurements remain readable before the optional migration. */}
  // Individual viewing is a newly explained purpose. Legacy counters are aggregate-only.
  const visitAvailability=visit?(steps?'available':'purpose-not-recorded'):'no-linked-visit';
  if(!steps)visit=null;
  return json({status:'ready',site,lead:{receivedAt:lead.received_at,source:lead.source},visit,steps,visitAvailability,
   pageToInquiryMs:visit?lead.received_at-visit.started_at:null,
   coverage:'one-page',retentionDays:90});
 }catch{return json({error:'Websitegegevens zijn nu niet bereikbaar. De dossiergegevens zijn niet gewijzigd.'},503);}
}
