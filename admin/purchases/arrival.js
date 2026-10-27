import {arrivalMail} from '../../shared/arrival-mail.js?v=ui-batch234-20261027';
export function arrivalButton(state,o,company,{esc}){
 if(company.id!=='spatlappen')return '';try{arrivalMail(state,o.id,company,{euro:String});return `<button type="button" data-arrival-mail="${esc(o.id)}">Aankomstmail voorbereiden</button>`;}catch{return '';}
}
export function installArrivalMail({getState,company,compose,euro,toast}){
 document.addEventListener('click',event=>{const button=event.target.closest('[data-arrival-mail]');if(!button)return;Promise.resolve().then(()=>{const mail=arrivalMail(getState(),button.dataset.arrivalMail,company,{euro});return compose(button.dataset.arrivalMail,'','','',{...mail,newMail:true,replySeed:true,documentId:'',paymentLinkId:''});}).catch(e=>toast(e.message));});
}
