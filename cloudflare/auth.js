const encoder = new TextEncoder();
const json = (value, status = 200, headers = {}) => Response.json(value, {status, headers: {'Cache-Control': 'no-store', ...headers}});
const hex = bytes => [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join('');
const unhex = value => Uint8Array.from(value.match(/../g), n => parseInt(n, 16));
const digest = async value => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const email = env => String(env.CRM_ALLOWED_EMAIL || '').trim().toLowerCase();
export const localHost = request => ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname);
export const localBypass = (request, env) => env.CRM_LOCAL_DEV === 'true' && localHost(request) && env.CRM_REQUIRE_LOGIN !== 'true';
const cookieName = request => localHost(request) ? 'crm_local_session' : '__Host-crm_session';
function cookie(request, value, duration) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${cookieName(request)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${duration}${secure}`;
}
function token(request) {
  const name = cookieName(request) + '=';
  return request.headers.get('Cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(name))?.slice(name.length) || '';
}
function passwordConfig(env) {
  const [algorithm, iterations, salt, hash] = String(env.CRM_PASSWORD_HASH || '').split('$');
  if (algorithm !== 'pbkdf2-sha256' || Number(iterations) !== 100000 || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{64}$/.test(hash || '') || !email(env) || !env.DB) return null;
  return {salt, hash, iterations: Number(iterations)};
}
export const authReady = env => Boolean(passwordConfig(env));
function equal(a, b) {if (a.length !== b.length) return false; let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0;}
export async function verifyPassword(password, env) {
  const config = passwordConfig(env); if (!config) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const computed = hex(await crypto.subtle.deriveBits({name: 'PBKDF2', salt: unhex(config.salt), iterations: config.iterations, hash: 'SHA-256'}, key, 256));
  return equal(computed, config.hash);
}
export async function authenticated(request, env) {
  if (localBypass(request, env)) return {email: email(env), local: true};
  if (!authReady(env) || new URL(request.url).protocol !== 'https:' && !(localHost(request) && env.CRM_LOCAL_DEV === 'true')) return null;
  const value = token(request); if (!/^[a-f0-9]{64}$/.test(value)) return null;
  const found = await env.DB.prepare('SELECT email,auth_version,expires_at FROM crm_sessions WHERE token_hash=?').bind(await digest(value)).first();
  return found && found.email === email(env) && found.auth_version === await digest(env.CRM_PASSWORD_HASH) && found.expires_at > Math.floor(Date.now() / 1000) ? {email: found.email} : null;
}
// Device notifications are tied to a real login session, never a local bypass.
export async function notificationIdentity(request,env){
 const user=await authenticated(request,env);
 if(!user||user.local)throw Object.assign(Error('Log in op de online CRM-versie om meldingen te gebruiken.'),{status:401});
 return {sessionHash:await digest(token(request)),authVersion:await digest(env.CRM_PASSWORD_HASH),email:user.email};
}
export async function sessionFingerprint(request,env){
 if(!await authenticated(request,env))throw Object.assign(Error('Log opnieuw in om de koppeling te gebruiken.'),{status:401});
 return digest(token(request)+'|'+env.CRM_PASSWORD_HASH+'|'+env.CRM_COMPANY_ID);
}
export async function handleAuth({request, env}) {
  const path = new URL(request.url).pathname;
  if (!authReady(env)) return json({error: 'De login is nog niet ingesteld.'}, 503);
  try {
    if (path === '/auth/logout' && request.method === 'POST') {
      const value = token(request);
      if (/^[a-f0-9]{64}$/.test(value)) await env.DB.prepare('DELETE FROM crm_sessions WHERE token_hash=?').bind(await digest(value)).run();
      return json({ok: true}, 200, {'Set-Cookie': cookie(request, '', 0)});
    }
    if (path !== '/auth/login' || request.method !== 'POST') return json({error: 'Onbekend loginverzoek.'}, 404);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error: 'Ongeldig loginverzoek.'}, 415);
    const input = await request.text(); if (encoder.encode(input).length > 4096) return json({error: 'Ongeldig loginverzoek.'}, 413);
    let data;try{data=JSON.parse(input);}catch{return json({error:'Ongeldig loginverzoek.'},400);}
    const now = Math.floor(Date.now() / 1000);
    if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'Ongeldig loginverzoek.'},400);
    if (typeof data.password !== 'string' || data.password.length > 256 || typeof data.email !== 'string' || data.email.length > 254) return json({error: 'Controleer je e-mailadres en wachtwoord.'}, 400);
    // Count before checking credentials, atomically. Both IP and account limits
    // prevent unlimited guesses; currently logged-in sessions stay available.
    const address = await digest(request.headers.get('CF-Connecting-IP') || 'local');
    const limits = await env.DB.batch([address, data.email.trim().toLowerCase()===email(env)?'account':'other:'+address].map(id => env.DB.prepare(`INSERT INTO crm_login_limits(id,window_start,attempts) VALUES(?,?,1)
      ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END,
      window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END RETURNING attempts`).bind(id, now, now - 900, now - 900)));
    if (limits[0].results[0].attempts > 10 || limits[1].results[0].attempts > 100) return json({error: 'Te veel loginpogingen. Probeer over 15 minuten opnieuw.'}, 429, {'Retry-After': '900'});
    const valid = await verifyPassword(data.password, env);
    if (!valid || data.email.trim().toLowerCase() !== email(env)) return json({error: 'E-mailadres of wachtwoord klopt niet.'}, 401);
    const value = hex(crypto.getRandomValues(new Uint8Array(32))), duration = data.remember === false ? 12 * 3600 : 30 * 24 * 3600;
    await env.DB.batch([
      env.DB.prepare('DELETE FROM crm_sessions WHERE expires_at<=?').bind(now),
      env.DB.prepare('DELETE FROM crm_login_limits WHERE window_start<=?').bind(now - 900),
      env.DB.prepare('INSERT INTO crm_sessions(token_hash,email,auth_version,expires_at) VALUES(?,?,?,?)').bind(await digest(value), email(env), await digest(env.CRM_PASSWORD_HASH), now + duration),
      env.DB.prepare('DELETE FROM crm_login_limits WHERE id=?').bind(address)
    ]);
    return json({ok: true, email: email(env)}, 200, {'Set-Cookie': cookie(request, value, duration)});
  } catch {return json({error: 'Inloggen lukt niet. Probeer opnieuw.'}, 503);}
}
