import {integrationStore} from './integration-store.js';
import {createGoogleRoutes} from './google-routes-provider.js';
export async function handleGoogleRoutes({request,env}){
 const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
 try{
  const store=integrationStore(env),service=createGoogleRoutes({read:()=>store.read('google-routes'),write:(value,expected)=>store.write('google-routes',value,expected),exclusive:fn=>store.exclusive('google-routes',fn)}),action=new URL(request.url).pathname.split('/').at(-1).replace(/^route-/,'');
  if(action==='status'&&request.method==='GET')return json(await service.status());
  if(['configure','compute'].includes(action)&&request.method==='POST'){
   if(Number(request.headers.get('Content-Length')||0)>20000)return json({error:'Te veel routegegevens.'},413);
   const text=await request.text();if(text.length>20000)return json({error:'Te veel routegegevens.'},413);
   let input;try{input=JSON.parse(text);}catch{return json({error:'Ongeldige routegegevens.'},400);}
   return json(await service[action](input));
  }
  return json({error:'Onbekende routeroute.'},404);
 }catch(error){return json({error:error.message||'Route berekenen lukt niet.'},error.status||400);}
}
