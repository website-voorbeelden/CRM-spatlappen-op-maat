import {companyFromEnv} from '../shared/companies.js';
import {sha256} from './integration-store.js';
const stamp=()=>Math.floor(Date.now()/1000);
// Shared payment/report delivery guards. A subscription alone is insufficient:
// each offer still requires the current company, login, key tuple and expiry.
export async function activePushDevices(env){
 const version=await sha256(env.CRM_PASSWORD_HASH||''),company=companyFromEnv(env).id;
 return (await env.DB.prepare('SELECT d.* FROM crm_push_devices d JOIN crm_sessions s ON s.token_hash=d.session_hash WHERE d.company_id=? AND s.auth_version=? AND s.email=? AND s.expires_at>? ORDER BY d.created_at LIMIT 20').bind(company,version,String(env.CRM_ALLOWED_EMAIL||'').trim().toLowerCase(),stamp()).all()).results;
}
export async function pushDeviceIsCurrent(env,device){
 return !!await env.DB.prepare('SELECT d.id FROM crm_push_devices d JOIN crm_sessions s ON s.token_hash=d.session_hash WHERE d.id=? AND d.company_id=? AND d.session_hash=? AND d.p256dh=? AND d.auth=? AND d.created_at=? AND d.updated_at=? AND s.auth_version=? AND s.email=? AND s.expires_at>?').bind(device.id,companyFromEnv(env).id,device.session_hash,device.p256dh,device.auth,device.created_at,device.updated_at,await sha256(env.CRM_PASSWORD_HASH||''),String(env.CRM_ALLOWED_EMAIL||'').trim().toLowerCase(),stamp()).first();
}
export const pushDeviceFingerprint=device=>sha256(JSON.stringify([device.session_hash,device.p256dh,device.auth,device.created_at,device.updated_at]));
export async function removePushDeviceIfCurrent(env,device){
 // A late 410 for an older offer must not delete a meanwhile renewed device.
 return env.DB.prepare('DELETE FROM crm_push_devices WHERE id=? AND company_id=? AND session_hash=? AND p256dh=? AND auth=? AND created_at=? AND updated_at=?').bind(device.id,companyFromEnv(env).id,device.session_hash,device.p256dh,device.auth,device.created_at,device.updated_at).run();
}
