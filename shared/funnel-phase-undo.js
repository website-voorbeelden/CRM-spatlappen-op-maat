import {salesFunnel,funnelPhases,funnelPhasesFor,funnelDisplayPhase,funnelPhaseLabel} from './sales-funnel.js?v=ui-batch234-20261027';

const validPhase=(phase,companyId)=>[...funnelPhases,...funnelPhasesFor(companyId)].some(([id])=>id===phase);

// A narrow session token for one accepted mail's phase; never a state snapshot.
export function captureMailPhaseUndo(state,order,{beforePhase,draftId,companyId}){
 const current=salesFunnel(state,order,companyId);
 if(!validPhase(beforePhase,companyId)||current.phase===beforePhase||current.automaticMail?.id!==draftId)return null;
 return {companyId,orderId:order.id,customerId:order.customerId,draftId,beforePhase,afterPhase:current.phase,basis:current.signal.basis};
}

export function undoMailPhase(state,token,{companyId,uuid=()=>crypto.randomUUID(),now=new Date().toISOString()}={}){
 if(!token||token.companyId!==companyId||!validPhase(token.beforePhase,companyId))throw Error('Deze fasemelding hoort niet bij dit bedrijf.');
 const order=state.orders.find(o=>o.id===token.orderId);
 if(!order)throw Error('Dit dossier bestaat niet meer. Er is niets teruggedraaid.');
 if(order.customerId!==token.customerId)throw Error('De klantkoppeling is inmiddels gewijzigd. Er is niets teruggedraaid.');
 const current=salesFunnel(state,order,companyId);
 if(current.signal.basis!==token.basis||current.phase!==token.afterPhase||current.automaticMail?.id!==token.draftId)throw Error('De fase of de bijbehorende gegevens zijn inmiddels gewijzigd. Er is niets teruggedraaid.');
 // Keep the accepted mail, its review, all financial/physical facts and events.
 // Only the existing explicit phase selection is adjusted on its current basis.
 const selection={phase:funnelDisplayPhase(token.beforePhase,companyId),basis:current.signal.basis};
 const proposed={...order,salesFunnel:{...(order.salesFunnel||{events:[]}),selection}};
 if(funnelDisplayPhase(salesFunnel(state,proposed,companyId).phase,companyId)!==selection.phase)throw Error('De huidige gegevens vereisen inmiddels een andere fase. Er is niets teruggedraaid.');
 order.salesFunnel=proposed.salesFunnel;
 state.activities.unshift({id:uuid(),message:'Automatische fase teruggedraaid: '+funnelPhaseLabel(token.afterPhase,companyId)+' → '+funnelPhaseLabel(token.beforePhase,companyId),time:now});
 return selection.phase;
}
