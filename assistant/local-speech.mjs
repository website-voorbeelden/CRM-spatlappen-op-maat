import {readFile,writeFile,mkdtemp,rm,access} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const invalid=()=>{throw Error('Ongeldige microfoonopname. Neem maximaal één minuut opnieuw op.');};
export function validateSpeechWav(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<44||bytes.length>1_920_044||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE'||bytes.readUInt32LE(4)!==bytes.length-8||bytes.toString('ascii',12,16)!=='fmt '||bytes.readUInt32LE(16)!==16||bytes.readUInt16LE(20)!==1||bytes.readUInt16LE(22)!==1||bytes.readUInt32LE(24)!==16000||bytes.readUInt32LE(28)!==32000||bytes.readUInt16LE(32)!==2||bytes.readUInt16LE(34)!==16||bytes.toString('ascii',36,40)!=='data'||bytes.readUInt32LE(40)!==bytes.length-44||(bytes.length-44)%2)invalid();
 if(bytes.length<16044)throw Error('De opname is te kort. Spreek een volledige zin in.');
 let peak=0;for(let i=44;i<bytes.length;i+=2)peak=Math.max(peak,Math.abs(bytes.readInt16LE(i)));if(peak<150)throw Error('Er is geen hoorbaar geluid opgenomen. Controleer je microfoon.');return bytes;
}
export async function createLocalSpeech(directory){
 const root=path.resolve(directory);let config=null,busy=false;
 try{const saved=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));if(saved.version==='whisper.cpp-v1.9.5'){const binary=path.resolve(root,saved.binary),model=path.resolve(root,saved.model);if(binary.startsWith(root+path.sep)&&model.startsWith(root+path.sep)){await access(binary);await access(model);config={binary,model};}}}catch{}
 return {status:()=>({ready:!!config,engine:config?'Whisper lokaal op deze Mac':null,maxSeconds:60}),async transcribe(encoded,{signal}={}){
  if(!config)throw Error('Lokale spraakherkenning is nog niet beschikbaar. Start beide CRM’s opnieuw na installatie.');
  if(busy)throw Error('Er wordt al een opname herkend. Probeer zo opnieuw.');
  if(typeof encoded!=='string'||encoded.length>2_600_100||encoded.length%4!==0||/[^A-Za-z0-9+/=]/.test(encoded))invalid();
  const decoded=Buffer.from(encoded,'base64');if(decoded.toString('base64')!==encoded)invalid();const bytes=validateSpeechWav(decoded);signal?.throwIfAborted();busy=true;let folder;
  try{folder=await mkdtemp(path.join(root,'recording-'));const wav=path.join(folder,'input.wav'),output=path.join(folder,'result');await writeFile(wav,bytes,{mode:0o600});
   await new Promise((resolve,reject)=>{const child=spawn(config.binary,['-m',config.model,'-f',wav,'-l','nl','-t','4','-ng','-np','-nt','-oj','-of',output],{stdio:'ignore',cwd:root,signal});const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Spraak herkennen duurt te lang. Probeer een kortere opname.'));},90000);child.on('error',e=>{clearTimeout(timer);reject(e.name==='AbortError'?e:Error('Lokale spraakherkenner starten lukt niet.'));});child.on('exit',code=>{clearTimeout(timer);if(code===0)resolve();else reject(Error('De opname kon niet worden herkend. Probeer opnieuw.'));});});
   signal?.throwIfAborted();const result=JSON.parse(await readFile(output+'.json','utf8'));const text=(result.transcription||[]).map(s=>s.text).join(' ').trim().slice(0,12000);if(!text)throw Error('Er is geen spraak herkend. Controleer je microfoon en probeer opnieuw.');return {text,engine:'local',saved:false};
  }finally{try{if(folder)await rm(folder,{recursive:true,force:true});}finally{busy=false;}}
 }};
}
