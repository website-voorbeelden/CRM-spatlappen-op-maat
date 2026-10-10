import {localBypass} from '../../cloudflare/auth.js';
import {handleTikkie} from '../../cloudflare/tikkie.js';
import {handleDocuments} from '../../cloudflare/documents.js';
export async function onRequest({request,env}) {
  if (!localBypass(request,env) || env.CRM_LOCAL_SERVICES !== 'http://127.0.0.1:3000') {
    if(new URL(request.url).pathname.startsWith('/__local/tikkie/'))return handleTikkie({request,env});
    return handleDocuments({request,env});
  }
  const source = new URL(request.url), target = new URL(source.pathname+source.search,env.CRM_LOCAL_SERVICES);
  const headers = new Headers(request.headers);
  headers.delete('Host');headers.set('Origin',env.CRM_LOCAL_SERVICES);
  try {return await fetch(target,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'manual'});}
  catch {return Response.json({error:'Start ook de lokale CRM-server op poort 3000 voor Word/PDF en Tikkie.'},{status:503});}
}
