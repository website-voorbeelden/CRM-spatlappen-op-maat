import {handleCrm} from '../../../cloudflare/api.js?v=feedback-followup-20261028';
export const onRequest = context => handleCrm(context);
