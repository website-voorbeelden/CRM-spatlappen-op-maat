export function encodeMonoWav(chunks,sampleRate){
 if(!Array.isArray(chunks)||!Number.isFinite(sampleRate)||sampleRate<16000)throw Error('Ongeldig microfoonformaat.');
 const total=chunks.reduce((n,c)=>n+c.length,0),source=new Float32Array(total);let offset=0;for(const chunk of chunks){source.set(chunk,offset);offset+=chunk.length;}
 const count=Math.min(960000,Math.floor(total*16000/sampleRate)),bytes=new Uint8Array(44+count*2),view=new DataView(bytes.buffer);const text=(at,value)=>{for(let i=0;i<value.length;i++)bytes[at+i]=value.charCodeAt(i);};
 text(0,'RIFF');view.setUint32(4,bytes.length-8,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,count*2,true);
 let inputPeak=0;for(const value of source)inputPeak=Math.max(inputPeak,Math.abs(value));const boost=inputPeak?Math.max(1,Math.min(40,0.5/inputPeak)):1;
 const ratio=sampleRate/16000;for(let i=0;i<count;i++){const start=i*ratio,end=(i+1)*ratio;let sum=0;for(let j=Math.floor(start);j<Math.ceil(end);j++)sum+=(source[j]||0)*Math.max(0,Math.min(end,j+1)-Math.max(start,j));const sample=Math.max(-1,Math.min(1,sum/ratio*boost));view.setInt16(44+i*2,Math.round(sample*(sample<0?32768:32767)),true);}return bytes;
}
export function wavBase64(bytes){let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary);}
export function speechInputLevel(samples){
 let peak=0,square=0;for(const sample of samples){peak=Math.max(peak,Math.abs(sample));square+=sample*sample;}
 const rms=Math.sqrt(square/Math.max(1,samples.length));return {peak,level:rms?Math.max(0,Math.min(1,(20*Math.log10(rms)+75)/60)):0};
}
export function createLocalDictation({getUserMedia,AudioContext,AudioWorkletNode,upload,onText,onState,onError,onLevel=()=>{},onInput=()=>{},onDiagnostic=()=>{},onDebug=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}){
 let phase='idle',epoch=0,stream=null,context=null,processor=null,source=null,chunks=[],timer=null,startTimer=null,monitorTimer=null,flushTimer=null,flushDone=null,controller=null,base='',peak=0,frames=0,lastFrames=0,emptyChecks=0,quietChecks=0,intervalPeak=0,deviceLabel='',captureKind='';
 let run=0,explicitDevice=false;
 function report(kind){const track=stream?.getAudioTracks?.()[0]||stream?.getTracks?.()[0];try{onDebug({run,kind,phase,capture:captureKind,frames,peak,sampleRate:context?.sampleRate||0,contextState:context?.state||'none',trackState:track?.readyState||'none',muted:track?.muted===true,enabled:track?.enabled!==false,explicitDevice});}catch{}}
 const notify=()=>onState(['starting','recording','stopping'].includes(phase));
 function diagnostic(kind){report(kind);onDiagnostic({kind,deviceLabel,frames});}
 function release(){for(const id of [timer,startTimer,monitorTimer,flushTimer])if(id!==null)clearTimer(id);timer=startTimer=monitorTimer=flushTimer=null;if(flushDone){flushDone();flushDone=null;}
  if(processor){processor.onaudioprocess=null;processor.onprocessorerror=null;if(processor.port){processor.port.onmessage=null;try{processor.port.close();}catch{}}try{processor.disconnect();}catch{}}try{source?.disconnect();}catch{}
  for(const track of stream?.getTracks()||[]){track.onended=track.onmute=track.onunmute=null;track.stop();}stream=null;processor=source=null;if(context){context.onstatechange=null;context.close().catch(()=>{});}context=null;onLevel(0);
 }
 function fail(message){report('error');stop(true);onError(message);}
 function capture(samples,current){if(current!==epoch||!['recording','stopping'].includes(phase)||!(samples instanceof Float32Array)||!samples.length)return;const values=new Float32Array(samples);chunks.push(values);frames+=values.length;const measured=speechInputLevel(values);peak=Math.max(peak,measured.peak);intervalPeak=Math.max(intervalPeak,measured.peak);onLevel(measured.level);if(frames>=context.sampleRate*60&&phase==='recording')stop();}
 function monitor(current){if(current!==epoch||phase!=='recording')return;emptyChecks=frames===lastFrames?emptyChecks+1:0;quietChecks=intervalPeak<0.0005?quietChecks+1:0;lastFrames=frames;
  if(emptyChecks>=3){fail('De browser levert geen microfoongeluid aan. Kies een andere microfoon of controleer de microfoontoegang van Codex in de systeeminstellingen.');return;}
  if(context.state!=='running')diagnostic('paused');else if(stream.getAudioTracks?.()[0]?.muted)diagnostic('muted');else diagnostic(intervalPeak>=0.0005?'signal':quietChecks>=4?'silent':'waiting');intervalPeak=0;monitorTimer=setTimer(()=>monitor(current),1000);
 }
 async function start(draft='',{deviceId=''}={}){
  if(phase!=='idle')return false;if(!getUserMedia||!AudioContext){onError('Deze browser kan geen microfoonopname maken. Gebruik systeemdicteren.');return false;}
  const current=++epoch;run++;explicitDevice=!!deviceId;captureKind='';base=draft.trimEnd();peak=frames=lastFrames=emptyChecks=quietChecks=intervalPeak=0;chunks=[];phase='starting';report('start');notify();
  try{context=new AudioContext();context.resume().catch(()=>{});startTimer=setTimer(()=>{if(current===epoch)fail('Microfoon starten blijft wachten. Controleer toestemming en de gekozen microfoon.');},20000);
   const audio={channelCount:{ideal:1},echoCancellation:false,noiseSuppression:false,autoGainControl:false};if(deviceId)audio.deviceId={exact:deviceId};
   const acquired=await getUserMedia({audio,video:false});if(current!==epoch){acquired.getTracks().forEach(track=>track.stop());return false;}stream=acquired;const track=stream.getAudioTracks?.()[0]||stream.getTracks()[0];
   if(!track||track.readyState==='ended')throw Error('De gekozen microfoon is niet beschikbaar. Kies een andere invoer.');deviceLabel=track.label||'Standaardmicrofoon';onInput({label:deviceLabel,deviceId:track.getSettings?.().deviceId||deviceId});
   track.onended=()=>{if(current===epoch&&phase==='recording')fail('De microfoon is losgekoppeld of gestopt. Kies een beschikbare microfoon.');};track.onmute=()=>{if(current===epoch)diagnostic('muted');};track.onunmute=()=>{if(current===epoch)diagnostic('waiting');};
   await context.resume();if(current!==epoch)return false;if(context.state!=='running')throw Error('De browser blokkeert audio. Controleer toestemming en probeer opnieuw.');source=context.createMediaStreamSource(stream);
   if(context.audioWorklet?.addModule&&AudioWorkletNode){try{await context.audioWorklet.addModule(new URL('./assistant-audio-worklet.js',import.meta.url).href);if(current!==epoch)return false;processor=new AudioWorkletNode(context,'crm-recorder',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});captureKind='worklet';processor.port.onmessage=event=>{if(current!==epoch)return;if(event.data?.type==='samples')capture(event.data.samples,current);else if(event.data?.type==='flushed')flushDone?.();};processor.onprocessorerror=()=>{if(current===epoch)fail('De microfoonopname is onderbroken. Start dicteren opnieuw.');};}catch(error){if(current!==epoch)return false;processor=null;}}
   if(!processor){processor=context.createScriptProcessor(4096,1,1);captureKind='legacy';processor.onaudioprocess=event=>{for(let i=0;i<event.outputBuffer?.numberOfChannels;i++)event.outputBuffer.getChannelData(i).fill(0);capture(event.inputBuffer.getChannelData(0),current);};}
   source.connect(processor);processor.connect(context.destination);phase='recording';clearTimer(startTimer);startTimer=null;notify();diagnostic('waiting');timer=setTimer(()=>stop(),60000);monitorTimer=setTimer(()=>monitor(current),1000);return true;
  }catch(error){if(current!==epoch)return false;report('error');release();phase='idle';notify();const permission=['NotAllowedError','SecurityError'].includes(error.name);onError(permission?'Microfoontoegang is geblokkeerd. Geef je browser/Codex microfoontoestemming in de systeeminstellingen.':['NotFoundError','OverconstrainedError'].includes(error.name)?'De gekozen microfoon is niet beschikbaar. Kies een andere invoer.':error.message||'Microfoon starten lukt niet.');return false;}
 }
 async function stop(abort=false){if(phase==='idle')return;if(abort){report('cancel');epoch++;controller?.abort();release();chunks=[];phase='idle';notify();return;}if(phase==='starting')return stop(true);if(phase!=='recording')return;
  const current=epoch,rate=context.sampleRate;phase='stopping';notify();
  if(captureKind==='worklet')await new Promise(resolve=>{let done=false;flushDone=()=>{if(done)return;done=true;if(flushTimer!==null)clearTimer(flushTimer);flushTimer=null;flushDone=null;resolve();};flushTimer=setTimer(()=>flushDone?.(),250);processor.port.postMessage({type:'flush'});});
  if(current!==epoch)return;report('stop');const recording=chunks;chunks=[];release();phase='processing';controller=new AbortController();notify();
  try{if(!frames)throw Error('Er zijn geen audiogegevens ontvangen. Controleer de gekozen microfoon.');if(peak<0.0005)throw Error('Geen hoorbaar geluid opgenomen. Kies een andere microfoon of controleer de invoer in je systeeminstellingen.');const wav=encodeMonoWav(recording,rate);const result=await upload(wavBase64(wav),controller.signal);if(current!==epoch)return;const text=[base,result.text].filter(Boolean).join(' ');onText(text.slice(0,12000));if(text.length>12000)onError('De vraag is verkort tot 12.000 tekens. Controleer de tekst.');
  }catch(error){if(current===epoch&&error.name!=='AbortError')onError(error.message||'Spraak herkennen lukt niet. Probeer een kortere opname.');}finally{if(current===epoch){phase='idle';controller=null;notify();}}
 }
 return {supported:!!getUserMedia&&!!AudioContext,start,stop,get listening(){return ['starting','recording','stopping'].includes(phase);},get processing(){return phase==='processing';},get phase(){return phase;}};
}
