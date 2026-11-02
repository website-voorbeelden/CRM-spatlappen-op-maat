import {handleCrm} from '../../../cloudflare/api.js?v=packs-live-link-20261102';
export const onRequest = context => handleCrm(context);
