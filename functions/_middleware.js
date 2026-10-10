import {authenticated,authReady,localBypass,localHost} from '../cloudflare/auth.js';
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const publicLogin=['/login.html','/login.css','/login.js','/auth/login'].includes(url.pathname);
  const api=url.pathname.startsWith('/api/')||url.pathname.startsWith('/__local/')||url.pathname.startsWith('/auth/');
  if (!['GET','HEAD'].includes(context.request.method)) {
    const origin = context.request.headers.get('Origin');
    if (origin !== url.origin) return Response.json({error:'Ongeldige herkomst van het verzoek.'}, {status:403});
  }
  if(!localBypass(context.request,context.env)){
    if(!authReady(context.env))return Response.json({error:'Online toegang is nog niet geconfigureerd.'},{status:503,headers:{'Cache-Control':'no-store'}});
    if(url.protocol!=='https:'&&!(localHost(context.request)&&context.env.CRM_LOCAL_DEV==='true'))return Response.json({error:'Gebruik de beveiligde CRM-URL.'},{status:403});
    try{
      if(!publicLogin&&!await authenticated(context.request,context.env)){
        if(api)return Response.json({error:'Log opnieuw in om het CRM te gebruiken.'},{status:401,headers:{'Cache-Control':'no-store'}});
        return new Response(null,{status:302,headers:{Location:'/login.html?next='+encodeURIComponent(url.pathname+url.search),'Cache-Control':'no-store'}});
      }
    }catch{return Response.json({error:'De loginopslag is nog niet beschikbaar.'},{status:503,headers:{'Cache-Control':'no-store'}});}
  }
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control','no-store');
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','same-origin');
  headers.set('X-Frame-Options','DENY');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
