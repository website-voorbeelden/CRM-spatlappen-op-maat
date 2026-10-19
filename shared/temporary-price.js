import {decimalNumber} from './decimal-input.js';
// Ephemeral arithmetic only; never attach the inputs/result to an order record.
export function temporaryPrice({estimate,markup,quantity}){
 const estimated=decimalNumber(estimate),percentage=decimalNumber(markup),count=Number(quantity);
 if(!Number.isFinite(estimated)||estimated<0)throw Error('Vul een indicatie in euro per stuk in; onbekend is geen nul.');
 if(!Number.isFinite(percentage)||percentage<0||percentage>1000)throw Error('Vul een opslagpercentage tussen 0 en 1000 in.');
 if(!Number.isSafeInteger(count)||count<1)throw Error('Vul eerst een geldig aantal bij het product in.');
 const unit=Math.round(estimated*100*(1+percentage/100)),total=unit*count;
 if(!Number.isSafeInteger(unit)||!Number.isSafeInteger(total))throw Error('Deze bedragen zijn te groot.');
 return {unit,total};
}
