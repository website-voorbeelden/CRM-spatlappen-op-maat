import {packsLogEvent} from '../../shared/packs-diagnostics.js?v=packs-worker-v3-20261102';
const sessions=new Map();
export function recordPacksSession(input){
 try{const row=packsLogEvent({...input,traceId:input.traceId||crypto.randomUUID()});const events=sessions.get(row.orderId)||[];sessions.delete(row.orderId);sessions.set(row.orderId,[...events.slice(-99),row]);while(sessions.size>20)sessions.delete(sessions.keys().next().value);}catch{}
}
export const packsSessionEvents=orderId=>structuredClone(sessions.get(orderId)||[]);
