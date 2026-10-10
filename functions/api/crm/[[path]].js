import {handleCrm} from '../../../cloudflare/api.js';
export const onRequest = context => handleCrm(context);
