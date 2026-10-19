import {formProblem} from '../admin/form-guidance.js';
export function shippingPriceSignature(order){return JSON.stringify([order.shippingKnown,order.shippingCharge]);}
export function applyShippingPrice(state,orderId,value,expected){
 const order=state.orders.find(record=>record.id===orderId);if(!order)throw Error('Deze order bestaat niet meer.');
 const entered=String(value??'').trim();if(!/^\d+(?:[.,]\d{1,2})?$/.test(entered))throw formProblem('Vul een verzendprijs in met maximaal twee decimalen. Gebruik 0 voor afhalen of gratis verzending.',{field:'shippingCharge'});
 const cents=Math.round(Number(entered.replace(',','.'))*100);if(!Number.isSafeInteger(cents)||cents<0)throw formProblem('Vul een geldige verzendprijs in.',{field:'shippingCharge'});
 if(expected!==undefined&&shippingPriceSignature(order)!==expected)throw formProblem('De verzendprijs is ondertussen gewijzigd. Open dit invulscherm opnieuw om de actuele prijs te controleren.',{field:'shippingCharge'});
 order.shippingKnown=true;order.shippingCharge=cents;return order;
}
