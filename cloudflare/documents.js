function service(env){
  if(env.CRM_COMPANY_ID==='maatwerkkunststof'&&env.CRM_DOCUMENT_COMPANY_ID!=='maatwerkkunststof')return null;
  try{const url=new URL(env.CRM_DOCUMENT_SERVICE_URL);return url.protocol==='https:'&&url.hostname.endsWith('.onrender.com')&&!url.username&&!url.password&&String(env.CRM_DOCUMENT_SERVICE_TOKEN||'').length>=32?url.origin:null;}catch{return null;}
}
export const documentsReady=env=>Boolean(service(env));
export async function handleDocuments({request,env}){
  const origin=service(env),path=new URL(request.url).pathname;
  if(!origin)return Response.json({error:'De online Word/PDF-omzetter is nog niet aangesloten.'},{status:503});
  const render=path==='/__local/documents/render'&&request.method==='POST';
  const preview=path==='/__local/documents/preview'&&request.method==='POST';
  const download=path.match(/^\/__local\/downloads\/([a-zA-Z0-9_-]{32})$/)&&request.method==='GET';
  if(!render&&!preview&&!download)return Response.json({error:'Onbekend documentverzoek.'},{status:404});
  try{
    let body;
    if(render||preview){
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return Response.json({error:'JSON verwacht.'},{status:415});
      body=await request.text();if(new TextEncoder().encode(body).length>(preview?16_000_000:1_000_000))return Response.json({error:'Documentverzoek is te groot.'},{status:413});
    }
    // Workers supports manual/follow only. Never forward the private token on a redirect.
    const response=await fetch(origin+(render?'/render':preview?'/preview':path.replace('/__local','')),{method:request.method,headers:{Authorization:'Bearer '+env.CRM_DOCUMENT_SERVICE_TOKEN,'Content-Type':'application/json'},body,signal:AbortSignal.timeout(180000),redirect:'manual'});
    if(response.status>=300&&response.status<400)throw Error('Documentservice gaf een redirect.');
    const headers=new Headers();for(const key of ['Content-Type','Content-Disposition','Content-Length'])if(response.headers.has(key))headers.set(key,response.headers.get(key));
    headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');
    return new Response(response.body,{status:response.status,headers});
  }catch(error){
    // Log only the connection error, never headers, tokens or document contents.
    console.error('Document service connection:',error.name);
    return Response.json({error:'De Word/PDF-omzetter reageert nog niet. De gratis dienst moet mogelijk opstarten. Probeer over een minuut opnieuw; er is nog geen document opgeslagen.'},{status:503});
  }
}
