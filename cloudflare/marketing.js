import {companyFromEnv} from '../shared/companies.js';
import {integrationStore,integrationError as fail,sha256} from './integration-store.js';
import {querySignals,changeMetric} from '../shared/analytics-insights.js';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const enc=new TextEncoder(),day=86400000;
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const date=n=>new Date(n).toISOString().slice(0,10);
function siteAllowed(value,host){if(value==='sc-domain:'+host)return true;try{const u=new URL(value);return u.protocol==='https:'&&[host,'www.'+host].includes(u.hostname)&&u.pathname==='/'&&!u.search&&!u.hash&&!u.username&&!u.password&&u.port==='';}catch{return false;}}
export async function validateMarketingConfig(input,company,old){
 if(!input||typeof input!=='object'||Array.isArray(input))throw fail('Controleer de instellingen.');
 const host=company.website.toLowerCase(),site=String(input.site||'').trim(),property=String(input.property||'').trim();
 if(site&&!siteAllowed(site,host))throw fail('Kies de Search Console-property van '+host+'.');
 if(property&&!/^\d{1,18}$/.test(property))throw fail('Vul de numerieke GA4-property-ID in, niet de G-code.');
 if(!site&&!property)throw fail('Vul je Search Console-property in. GA4 is optioneel.');
 let account=old?.account;
 if(input.credentials){let parsed;try{parsed=JSON.parse(input.credentials);}catch{throw fail('Het Google-serviceaccountbestand is geen geldige JSON.');}
  if(parsed.type!=='service_account'||!/^[-a-z0-9.]+@[-a-z0-9.]+\.iam\.gserviceaccount\.com$/i.test(parsed.client_email||'')||typeof parsed.private_key!=='string'||parsed.private_key.length>20000)throw fail('Kies een Google-serviceaccount JSON-bestand. Geen OAuth-client of persoonlijk wachtwoord.');
  account={email:parsed.client_email,key:parsed.private_key};
 }
 if(!account)throw fail('Kies eerst het serviceaccount JSON-bestand.');
 try{await signingKey(account.key);}catch{throw fail('De privésleutel in dit serviceaccountbestand is niet geldig.');}
 return {site,property,account};
}
async function signingKey(pem){const text=pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');if(!/^[A-Za-z0-9+/]+=*$/.test(text))throw Error('Invalid key');return crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(text),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);}
async function provider(url,options,fetcher){
 let r;try{r=await fetcher(url,{...options,redirect:'manual',signal:AbortSignal.timeout(18000)});}catch{throw fail('Google is nu niet bereikbaar. Probeer later opnieuw.',503);}
 if(r.status>=300&&r.status<400){await r.body?.cancel();throw fail('Google gaf een onverwachte doorverwijzing. Er zijn geen sleutel- of rapportgegevens doorgestuurd.',502);}
 if(!r.ok)throw fail(r.status===403?'Geen leestoegang bij Google. Controleer API-activering en de rechten van het serviceaccount.':r.status===429?'Google vraagt om even te wachten. Probeer later opnieuw.':'Google kon dit rapport niet leveren. Controleer de property en de serviceaccountsleutel.',r.status===429?429:502);
 let data;try{data=await r.json();}catch{throw fail('Google gaf een onleesbaar rapport.',502);}return data;
}
async function access(config,{fetcher,now}){
 const scopes=[...(config.site?['https://www.googleapis.com/auth/webmasters.readonly']:[]),...(config.property?['https://www.googleapis.com/auth/analytics.readonly']:[])];
 const iat=Math.floor(now/1000),unsigned=b64(enc.encode(JSON.stringify({alg:'RS256',typ:'JWT'})))+'.'+b64(enc.encode(JSON.stringify({iss:config.account.email,scope:scopes.join(' '),aud:'https://oauth2.googleapis.com/token',iat,exp:iat+3600})));
 const assertion=unsigned+'.'+b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',await signingKey(config.account.key),enc.encode(unsigned)));
 const token=await provider('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()},fetcher);
 if(typeof token.access_token!=='string'||!token.access_token||token.access_token.length>10000)throw fail('Google gaf geen geldige leestoegang.',502);return token.access_token;
}
const number=v=>{const n=Number(v);if(!Number.isFinite(n)||n<0)throw fail('Google gaf ongeldige rapportcijfers.',502);return n;};
export function normalizeSearch(data,dimension){
 if(!data||typeof data!=='object'||data.rows!==undefined&&!Array.isArray(data.rows))throw fail('Google gaf een onleesbaar zoekrapport.',502);
 return (data.rows||[]).map(r=>{const impressions=number(r.impressions),clicks=number(r.clicks);if(clicks>impressions)throw fail('Google gaf ongeldige zoekcijfers.',502);const key=dimension?String(r.keys?.[0]||'').slice(0,1000):'total';return {key,clicks,impressions,ctr:impressions?clicks/impressions:0,position:number(r.position)};});
}
export async function searchReport(config,{token,days,now,fetcher,ranges:requestedRanges,includeDaily=false}){
 // Final data only; keep a three-day buffer and compare equal complete weeks/windows.
 const end=Date.UTC(new Date(now).getUTCFullYear(),new Date(now).getUTCMonth(),new Date(now).getUTCDate())-3*day,start=end-(days-1)*day,previousEnd=start-day,previousStart=start-days*day;
 const ranges=requestedRanges||[{start:date(start),end:date(end)},{start:date(previousStart),end:date(previousEnd)}],url='https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent(config.site)+'/searchAnalytics/query';
 const query=async(range,dimension)=>{const data=await provider(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({startDate:range.start,endDate:range.end,dataState:'final',type:'web',aggregationType:'auto',...(dimension?{dimensions:[dimension]}:{}),rowLimit:dimension?500:1,startRow:0})},fetcher);return normalizeSearch(data,dimension);};
 const reports=await Promise.all(ranges.flatMap(range=>[query(range),query(range,'query'),query(range,'page')]));
 const daily=includeDaily?await Promise.all(ranges.map(range=>query(range,'date'))):undefined;
 const dailyComplete=includeDaily&&ranges.every((range,index)=>Array.from({length:7},(_,i)=>date(Date.parse(range.start+'T00:00:00Z')+i*day)).every(key=>daily[index].some(row=>row.key===key)));
 const current=reports[0][0]||{clicks:0,impressions:0,ctr:0,position:null},previous=reports[3][0]||{clicks:0,impressions:0,ctr:0,position:null};
 const clicks=changeMetric(current.clicks,previous.clicks,{minimum:20,relative:.3,absolute:10});
 return {status:'ready',site:config.site,ranges,current,previous,queries:reports[1],previousQueries:reports[4],pages:reports[2],...(includeDaily?{daily,dailyComplete,previousPages:reports[5]}:{}),signals:[...(clicks?[{key:'Google totaal',label:'Klikken',metric:'clicks',...clicks}]:[]),...querySignals(reports[1],reports[4])],limited:reports[1].length===500||reports[4].length===500||reports[2].length===500||reports[5].length===500,completeDays:true};
}
export async function gaReport(config,{token,days,now,fetcher,company,range}){
 const end=range?.end||date(now-day),start=range?.start||date(now-days*day),url='https://analyticsdata.googleapis.com/v1beta/properties/'+config.property+':runReport';
 const metricNames=['activeUsers','sessions','screenPageViews','engagedSessions','userEngagementDuration'];
 const query=async dimension=>{const data=await provider(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({dateRanges:[{startDate:start,endDate:end}],metrics:metricNames.map(name=>({name})),...(dimension?{dimensions:[{name:dimension}]}:{}),dimensionFilter:{filter:{fieldName:'hostName',inListFilter:{values:[company.website.toLowerCase(),'www.'+company.website.toLowerCase()]}}},limit:20,returnPropertyQuota:true})},fetcher);if(!data||data.rows!==undefined&&!Array.isArray(data.rows))throw fail('Onleesbaar GA4-rapport.',502);return {rows:(data.rows||[]).map(r=>({key:String(r.dimensionValues?.[0]?.value||'total').slice(0,1000),...Object.fromEntries(metricNames.map((name,n)=>[name,number(r.metricValues?.[n]?.value)]))})),thresholded:!!data.metadata?.subjectToThresholding};};
 const [total,sources,pages]=await Promise.all([query(),query('sessionDefaultChannelGroup'),query('pagePath')]);
 return {status:'ready',property:config.property,start,end,total:total.rows[0]||Object.fromEntries(metricNames.map(k=>[k,0])),sources:sources.rows,pages:pages.rows,thresholded:total.thresholded||sources.thresholded||pages.thresholded};
}
// A weekly snapshot uses explicit completed calendar weeks, separate from the
// rolling on-open cache. Reuse the same credentials, readonly scopes and filters.
export async function weeklyGoogleReport(env,{ranges,now=Date.now(),fetcher=fetch}={}){
 const store=integrationStore(env),company=companyFromEnv(env);
 return store.exclusive('marketing',async()=>{
  const record=await store.read('marketing'),config=record.value;
  if(!config)return {configVersion:record.version,search:{status:'not-configured'},ga:{status:'not-configured'}};
  let token;try{token=await access(config,{fetcher,now});}catch(error){return {configVersion:record.version,search:{status:config.site?'unavailable':'not-configured',error:error.message},ga:{status:config.property?'unavailable':'not-configured',error:error.message}};}
  const result=async fn=>{try{return await fn();}catch(error){return {status:'unavailable',error:error.status?error.message:'Google kon het weekrapport niet leveren.'};}};
  const [search,ga]=await Promise.all([
   config.site?result(()=>searchReport(config,{token,days:7,now,fetcher,ranges,includeDaily:true})):Promise.resolve({status:'not-configured'}),
   config.property?result(async()=>{const [current,previous]=await Promise.all(ranges.map(range=>gaReport(config,{token,days:7,now,fetcher,company,range})));return {status:'ready',current,previous,thresholded:current.thresholded||previous.thresholded};}):Promise.resolve({status:'not-configured'})
  ]);
  return {configVersion:record.version,search,ga};
 });
}
function status(record,company){const c=record.value;return {status:c?'configured':'not-configured',version:record.version,site:c?.site||'',property:c?.property||'',account:c?.account.email||'',website:company.website.toLowerCase(),checkMode:'on-open',cacheMinutes:15};}
export async function handleMarketing({request,env},{fetcher=fetch,now=Date.now(),storeFactory=integrationStore}={}){
 try{
  const company=companyFromEnv(env),store=storeFactory(env),url=new URL(request.url),path=url.pathname.split('/marketing/')[1];
  if(request.method==='GET'&&path==='config')return json(status(await store.read('marketing'),company));
  if(request.method==='POST'&&path==='config'){
   if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw fail('JSON verwacht.',415);const raw=await request.text();if(enc.encode(raw).length>30000)throw fail('Instellingenbestand te groot.',413);const input=JSON.parse(raw);
   return await store.exclusive('marketing',async()=>{const old=await store.read('marketing');if(input.version!==old.version)throw fail('De koppeling is intussen gewijzigd. Vernieuw eerst.',409);const config=await validateMarketingConfig(input,company,old.value);return json(status(await store.write('marketing',config,old.version),company));});
  }
  if(request.method==='GET'&&path==='report'){
   const days=Number(url.searchParams.get('days')||28);if(![7,28,90].includes(days))throw fail('Kies 7, 28 of 90 dagen.');
   const record=await store.read('marketing');if(!record.value)return json({status:'not-configured',website:company.website.toLowerCase()});
   return await store.exclusive('marketing',async()=>{const latest=await store.read('marketing');if(latest.version!==record.version)throw fail('De koppeling is veranderd. Vernieuw eerst.',409);const config=latest.value,cache=await store.read('marketing-report-'+days);if(cache.value?.transportVersion===2&&cache.value.configVersion===record.version&&cache.value.checkedAt>now-15*60000)return json({...cache.value.report,cached:true});
    const token=await access(config,{fetcher,now});const [search,ga]=await Promise.allSettled([config.site?searchReport(config,{token,days,now,fetcher}):Promise.resolve({status:'not-configured'}),config.property?gaReport(config,{token,days,now,fetcher,company}):Promise.resolve({status:'not-configured'})]);
    const result=r=>r.status==='fulfilled'?r.value:{status:'unavailable',error:r.reason?.message||'Google niet bereikbaar.'};const report={status:'ready',checkedAt:now,days,website:company.website.toLowerCase(),search:result(search),ga:result(ga),checkMode:'on-open'};
    await store.write('marketing-report-'+days,{transportVersion:2,configVersion:record.version,checkedAt:now,report},cache.version);return json(report);
   });
  }
  return json({error:'Onbekend rapportverzoek.'},404);
 }catch(e){return json({error:e instanceof SyntaxError?'Ongeldige JSON.':e.status?e.message:'De Google-koppeling is nu niet beschikbaar.'},e.status||503);}
}
