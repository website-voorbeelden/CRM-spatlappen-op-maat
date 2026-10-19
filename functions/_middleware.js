import {companyFromEnv} from '../shared/companies.js';
import {authenticated,authReady,localBypass,localHost} from '../cloudflare/auth.js';
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const company=companyFromEnv(context.env);
  const publicInfo=company.id==='spatlappen'&&['/','/index.html','/privacy','/privacy.html','/terms','/terms.html','/robots.txt'].includes(url.pathname);
  if(publicInfo&&['GET','HEAD'].includes(context.request.method)){
    const response=await context.next(),headers=new Headers(response.headers);
    headers.set('X-Robots-Tag','noindex, follow');headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');headers.set('X-Frame-Options','DENY');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
  if(context.env.CRM_RELEASE_ENV==='preview'&&url.pathname==='/__local/tikkie/create')return Response.json({error:'Echte betaalverzoeken staan uit in de testomgeving.'},{status:403});
  if(context.env.CRM_COMPANY_ID&&!localBypass(context.request,context.env)){
    try {const identity=await context.env.DB.prepare('SELECT company_id FROM crm_company_identity WHERE id=1').first();if(identity?.company_id!==company.id)return Response.json({error:'Bedrijfsopslag is niet correct geregistreerd. Publicatie controleren.'},{status:503});}
    catch{return Response.json({error:'Bedrijfsregistratie ontbreekt. Rond de veilige publicatieprocedure af.'},{status:503});}
  }
  if(company.tool!=='design'&&url.pathname.startsWith('/spatlap-preview')||company.tool!=='costing'&&url.pathname.startsWith('/tools/costing/'))return new Response('Deze tool hoort bij een andere bedrijfsversie.',{status:404});
  // Pages redirects .html URLs to their extensionless equivalents.
  const offlineCode=url.pathname==='/crm-offline-sw.js'||url.pathname.startsWith('/admin/offline/')||['/shared/offline-state.js','/shared/companies.js'].includes(url.pathname);
  const favicon=['/admin/icons/spatlappen.svg','/admin/icons/maatwerkkunststof.svg'].includes(url.pathname);
  const publicLogin=['/login','/login.html','/login.css','/login.js','/auth/login'].includes(url.pathname);
  const api=url.pathname.startsWith('/api/')||url.pathname.startsWith('/__local/')||url.pathname.startsWith('/auth/');
  if (!['GET','HEAD'].includes(context.request.method)) {
    const origin = context.request.headers.get('Origin');
    if (origin !== url.origin) return Response.json({error:'Ongeldige herkomst van het verzoek.'}, {status:403});
  }
  if(!localBypass(context.request,context.env)){
    if(!authReady(context.env))return Response.json({error:'Online toegang is nog niet geconfigureerd.'},{status:503,headers:{'Cache-Control':'no-store'}});
    if(url.protocol!=='https:'&&!(localHost(context.request)&&context.env.CRM_LOCAL_DEV==='true'))return Response.json({error:'Gebruik de beveiligde CRM-URL.'},{status:403});
    try{
      if(!publicLogin&&!offlineCode&&!favicon&&!await authenticated(context.request,context.env)){
        if(api)return Response.json({error:'Log opnieuw in om het CRM te gebruiken.'},{status:401,headers:{'Cache-Control':'no-store'}});
        return new Response(null,{status:302,headers:{Location:'/login.html?next='+encodeURIComponent(url.pathname+url.search),'Cache-Control':'no-store'}});
      }
    }catch{return Response.json({error:'De loginopslag is nog niet beschikbaar.'},{status:503,headers:{'Cache-Control':'no-store'}});}
  }
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control','no-store');
  headers.set('X-Content-Type-Options','nosniff');
  if(!headers.has('Referrer-Policy'))headers.set('Referrer-Policy','same-origin');
  headers.set('X-Frame-Options','DENY');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
