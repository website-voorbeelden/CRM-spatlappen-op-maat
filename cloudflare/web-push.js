// RFC 8291 aes128gcm + RFC 8292 VAPID, using Worker-native WebCrypto.
const utf8=new TextEncoder();
const concat=(...parts)=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;};
export const base64url=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export function unbase64url(value,length){
 if(typeof value!=='string'||! /^[A-Za-z0-9_-]+$/.test(value)||value.length>4096)throw Error('Ongeldige pushsleutel.');
 const bytes=Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4)),c=>c.charCodeAt(0));
 if(length&&bytes.length!==length)throw Error('Ongeldige pushsleutellengte.');return bytes;
}
export function pushEndpoint(value){
 if(typeof value!=='string'||value.length>2048)throw Error('Ongeldig meldingenadres.');
 const url=new URL(value),host=url.hostname;
 const allowed=host==='fcm.googleapis.com'||host==='web.push.apple.com'||/^(?:[a-z0-9-]+\.)?push\.services\.mozilla\.com$/.test(host)||/^[a-z0-9-]+\.notify\.windows\.com$/.test(host);
 if(!allowed||url.protocol!=='https:'||url.port||url.username||url.password||url.hash||url.pathname==='/')throw Error('Niet ondersteunde pushdienst.');return url.href;
}
export async function validatePushSubscription(input){
 const endpoint=pushEndpoint(input?.endpoint),p256dh=input?.keys?.p256dh,auth=input?.keys?.auth;
 const publicKey=unbase64url(p256dh,65);if(publicKey[0]!==4)throw Error('Ongeldige pushsleutel.');
 unbase64url(auth,16);await crypto.subtle.importKey('raw',publicKey,{name:'ECDH',namedCurve:'P-256'},false,[]);
 return {endpoint,p256dh,auth};
}
export function vapidConfig(env){
 try{
  const jwk=JSON.parse(env.CRM_PUSH_PRIVATE_JWK||'null');
  if(jwk?.kty!=='EC'||jwk.crv!=='P-256')return null;
  const x=unbase64url(jwk.x,32),y=unbase64url(jwk.y,32);unbase64url(jwk.d,32);
  const subject=String(env.CRM_PUSH_SUBJECT||'');
  if(!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subject))return null;
  return {jwk,subject,publicKey:base64url(concat(Uint8Array.of(4),x,y))};
 }catch{return null;}
}
async function hkdf(ikm,salt,info,length){
 const key=await crypto.subtle.importKey('raw',ikm,'HKDF',false,['deriveBits']);
 return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt,info},key,length*8));
}
export async function sendWebPush(env,subscription,payload,topic,{ttl=86400}={}){
 if(!Number.isSafeInteger(ttl)||ttl<1||ttl>86400)throw Error('Ongeldige bewaartijd voor melding.');
 const config=vapidConfig(env);if(!config)throw Error('Pushconfiguratie ontbreekt.');
 const endpoint=pushEndpoint(subscription.endpoint),receiver=unbase64url(subscription.p256dh,65),auth=unbase64url(subscription.auth,16);
 const peer=await crypto.subtle.importKey('raw',receiver,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const ephemeral=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const sender=new Uint8Array(await crypto.subtle.exportKey('raw',ephemeral.publicKey));
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:peer},ephemeral.privateKey,256));
 const ikm=await hkdf(shared,auth,concat(utf8.encode('WebPush: info\0'),receiver,sender),32),salt=crypto.getRandomValues(new Uint8Array(16));
 const cek=await hkdf(ikm,salt,utf8.encode('Content-Encoding: aes128gcm\0'),16),nonce=await hkdf(ikm,salt,utf8.encode('Content-Encoding: nonce\0'),12);
 const plain=utf8.encode(JSON.stringify(payload));if(plain.length>3000)throw Error('Melding is te groot.');
 const aes=await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['encrypt']);
 const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,tagLength:128},aes,concat(plain,Uint8Array.of(2))));
 const header=new Uint8Array(21);header.set(salt);new DataView(header.buffer).setUint32(16,4096);header[20]=65;
 const jwtHeader=base64url(utf8.encode(JSON.stringify({typ:'JWT',alg:'ES256'}))),claims=base64url(utf8.encode(JSON.stringify({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+3600,sub:config.subject})));
 const signingKey=await crypto.subtle.importKey('jwk',config.jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},signingKey,utf8.encode(jwtHeader+'.'+claims));
 const response=await fetch(endpoint,{method:'POST',redirect:'manual',signal:AbortSignal.timeout(8000),headers:{Authorization:`vapid t=${jwtHeader}.${claims}.${base64url(signature)}, k=${config.publicKey}`,'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',TTL:String(ttl),Urgency:'normal',Topic:topic.slice(0,32)},body:concat(header,sender,encrypted)});
 await response.body?.cancel();return response.status;
}
