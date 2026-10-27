// Server-only fixed Google Routes adapter. Never import this file in browser code.
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export function createGoogleRoutes({read,write,exclusive,fetcher=globalThis.fetch,now=()=>new Date().toISOString()}){
 const status=async()=>{const config=await read();return {configured:!!config.value?.key,version:config.version};};
 async function configure(input){return exclusive(async()=>{const config=await read();if(typeof input?.version!=='string'||input.version!==config.version)throw fail('De Google Maps-koppeling is gewijzigd. Haal de instellingen opnieuw op.',409);const key=String(input.key||'').trim();if(!/^[A-Za-z0-9_-]{20,256}$/.test(key))throw fail('Vul een geldige Google Maps API-sleutel in.');await write({key},config.version);return status();});}
 async function compute(input){return exclusive(async()=>{
  const config=await read();if(!config.value?.key)throw fail('Koppel Google Maps eerst met een eigen API-sleutel.',409);
  const address=value=>{if(typeof value!=='string'||!value.trim()||value.length>500||/[\0|]/.test(value))throw fail('Controleer de vertrek- en afleveradressen.');return value.replace(/[\r\n]+/g,', ').trim();};
  const start=address(input?.start),stops=input?.stops;
  if(!Array.isArray(stops)||stops.length<1||stops.length>25||new Set(stops.map(stop=>stop?.id)).size!==stops.length||stops.some(stop=>typeof stop?.id!=='string'||!stop.id||stop.id.length>100)||typeof input.roundTrip!=='boolean'||typeof input.optimize!=='boolean')throw fail('Kies 1 tot 25 verschillende orders en controleer de routeopties.');
  const points=stops.map(stop=>({id:stop.id,address:address(stop.address)})),intermediates=input.roundTrip?points:points.slice(0,-1),destination=input.roundTrip?start:points.at(-1).address;
  const body={origin:{address:start},destination:{address:destination},intermediates:intermediates.map(point=>({address:point.address})),travelMode:'DRIVE',routingPreference:'TRAFFIC_UNAWARE',languageCode:'nl-NL',units:'METRIC',optimizeWaypointOrder:input.optimize&&intermediates.length>1};
  let response;
  try{response=await fetcher('https://routes.googleapis.com/directions/v2:computeRoutes',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(25000),headers:{'Content-Type':'application/json','X-Goog-Api-Key':config.value.key,'X-Goog-FieldMask':'routes.distanceMeters,routes.duration,routes.optimizedIntermediateWaypointIndex'},body:JSON.stringify(body)});}catch{throw fail('Google Maps kon de route niet ophalen. Je selectie en invoer blijven behouden.',503);}
  if(!response.ok){await response.body?.cancel();throw fail(response.status===403||response.status===401?'Google Maps geeft geen toegang. Controleer de API-sleutel, Routes API en facturering in je Google-project.':response.status===429?'Google Maps heeft de gebruiksgrens bereikt. Probeer later opnieuw.':'Google Maps kon voor deze adressen geen route berekenen. Controleer de adressen.',response.status===429?429:502);}
  let data;try{data=await response.json();}catch{throw fail('Google Maps gaf geen leesbare route terug.',502);}
  const route=data?.routes?.[0],duration=typeof route?.duration==='string'?route.duration.match(/^(\d+(?:\.\d+)?)s$/):null;
  if(!Number.isSafeInteger(route?.distanceMeters)||route.distanceMeters<0||!duration||!Number.isFinite(Number(duration[1]))||Number(duration[1])>30*86400)throw fail('Google Maps gaf geen bruikbare afstand en rijtijd terug.',502);
  let order=intermediates.map((_,index)=>index);
  if(body.optimizeWaypointOrder){order=route.optimizedIntermediateWaypointIndex;if(!Array.isArray(order)||order.length!==intermediates.length||new Set(order).size!==order.length||order.some(i=>!Number.isInteger(i)||i<0||i>=intermediates.length))throw fail('Google Maps gaf geen geldige stopvolgorde terug.',502);}
  return {provider:'Google Maps',metres:route.distanceMeters,seconds:Number(duration[1]),order:[...order.map(i=>intermediates[i].id),...(!input.roundTrip?[points.at(-1).id]:[])],optimized:body.optimizeWaypointOrder,at:now()};
 });}
 return {status,configure,compute};
}
