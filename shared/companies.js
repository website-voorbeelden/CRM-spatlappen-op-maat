// Public branding only. Credentials and storage bindings remain on the server.
export const companyIds = ['spatlappen', 'maatwerkkunststof'];
const profiles = {
 spatlappen: {id:'spatlappen', name:'Spatlappen op maat', brand:'spatlappen', website:'Spatlappenopmaat.nl', tool:'design', toolLabel:'Ontwerptool', productLabel:'Producten & ontwerp', defaultProduct:'Spatlap op maat', toolPath:'/spatlap-preview.html', browserDb:'spatlappen-crm', feedbackDb:'spatlappen-crm-feedback', designsDb:'spatlap-preview-designs', localPrefix:'spatlap-preview-design-'},
 maatwerkkunststof: {id:'maatwerkkunststof', name:'Maatwerkkunststof', brand:'maatwerkkunststof', website:'Maatwerkkunststof.nl', tool:'costing', salesPhases:[['new','00 Nieuw'],['welcome','01 Welkom'],['specs','02 Specificaties opvragen'],['pricing','03 Prijs kiezen'],['indication','04 Prijsindicatie verstuurd'],['quote','05 Offerte verstuurd'],['received','06 Order ontvangen'],['production','07 In uitvoering'],['delivered','08 Afgerond']], toolLabel:'Kostprijscalculator', productLabel:'Producten & kostprijs', defaultProduct:'Kunststof op maat', toolPath:'/tools/costing/index.html', browserDb:'maatwerkkunststof-crm', feedbackDb:'maatwerkkunststof-crm-feedback', designsDb:'maatwerkkunststof-crm-calculations', localPrefix:'maatwerkkunststof-calculation-'}
};
export function companyFor(id='spatlappen') {if(!Object.hasOwn(profiles,id))throw Error('Onbekende bedrijfsversie.');return Object.freeze({...profiles[id]});}
export function companyFromEnv(env) {return companyFor(env.CRM_COMPANY_ID || 'spatlappen');}
export function toolUrl(company, order, item, mode='local') {
 const q=new URLSearchParams({orderId:order.id,itemId:item.id});
 if(company.tool==='costing'&&item.costQuoteLink?.quoteId)q.set('quoteId',item.costQuoteLink.quoteId);
 if(mode==='cloud')q.set('storage','cloud');
 if(company.tool==='design') {q.set('unit','cm');if(item.width)q.set('w',String(item.width/10));if(item.height)q.set('h',String(item.height/10));q.set('qty',String(item.quantity));}
 return (company.tool==='costing'&&(mode==='local'||item.costCalculation?.version===2)?'/tools/costing-v2/index.html':company.toolPath)+'?'+q;
}

export function costingV2Url(order,item){return '/tools/costing-v2/index.html?'+new URLSearchParams({orderId:order.id,itemId:item.id});}

// Public workflow choices; historic stored statuses are retained as source data.
const printStages=['Ontwerp maken','Wachten op goedkeuring','Ontwerp goedgekeurd','Offerte verstuurd','Wachten op betaling','Productie vrijgegeven','Besteld bij leverancier','In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden','Afgerond'];
const plasticStages=['Nieuwe aanvraag','Offerte verstuurd','Wachten op betaling','Besteld bij leverancier','In productie','Onderweg naar Nederland','Binnen in Nederland','Verzonden','Afgerond'];
export function orderStagesFor(companyId){return [...(companyFor(companyId).tool==='design'?printStages:plasticStages)];}
export function displayOrderStage(stage,companyId){return companyFor(companyId).tool!=='design'&&printStages.slice(0,3).includes(stage)?'Nieuwe aanvraag':companyFor(companyId).tool!=='design'&&stage==='Productie vrijgegeven'?'Order ontvangen':stage;}
