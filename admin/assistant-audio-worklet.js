// Capture PCM on the audio thread; output remains silent to prevent feedback.
class CRMRecorder extends AudioWorkletProcessor {
 constructor(){super();this.buffer=new Float32Array(2048);this.used=0;this.recording=true;this.port.onmessage=event=>{if(event.data?.type==='flush'){this.recording=false;this.flush();this.port.postMessage({type:'flushed'});}};}
 flush(){if(!this.used)return;const samples=this.buffer.slice(0,this.used);this.port.postMessage({type:'samples',samples},[samples.buffer]);this.used=0;}
 process(inputs,outputs){for(const channels of outputs)for(const channel of channels)channel.fill(0);if(!this.recording)return true;const channels=inputs[0];if(!channels?.length)return true;
  const length=channels[0].length;for(let i=0;i<length;i++){let sample=0;for(const channel of channels)sample+=channel[i]||0;this.buffer[this.used++]=sample/channels.length;if(this.used===this.buffer.length)this.flush();}return true;
 }
}
registerProcessor('crm-recorder',CRMRecorder);
