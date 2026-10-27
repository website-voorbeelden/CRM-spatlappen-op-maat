// Exact company-specific browser origins, shared by the popup client and server.
const origins=Object.freeze({
 spatlappen:Object.freeze(['https://crm.spatlappenopmaat.nl','https://spatlappen-crm.pages.dev','http://localhost:3010','http://127.0.0.1:3010']),
 maatwerkkunststof:Object.freeze(['https://crm.maatwerkkunststof.nl','https://maatwerkkunststof-crm.pages.dev','http://localhost:3011','http://127.0.0.1:3011'])
});
export function laptopOriginAllowed(companyId,origin){return typeof origin==='string'&&Object.hasOwn(origins,companyId)&&origins[companyId].includes(origin);}
