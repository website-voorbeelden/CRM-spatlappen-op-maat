import {handleAuth} from '../../cloudflare/auth.js';
export const onRequest=context=>handleAuth(context);
