import {primaryImageInfo,choosePrimaryImage} from '../../shared/product-primary-image.js';
export function installPrimaryImage({company,getState,mergeStoredState,render,toast}){
 document.addEventListener('click',event=>{const button=event.target.closest('[data-primary-image]');if(!button)return;Promise.resolve().then(async()=>{const {order,item,primaryImage:id}=button.dataset,info=primaryImageInfo(getState(),order,item);await mergeStoredState(state=>choosePrimaryImage(state,order,item,id,info.signature));render();toast(company?.tool==='costing'?'Hoofdafbeelding gekozen.':'Hoofdafbeelding gekozen. Ontwerpgoedkeuring blijft apart.');}).catch(e=>toast(e.message));});
}
