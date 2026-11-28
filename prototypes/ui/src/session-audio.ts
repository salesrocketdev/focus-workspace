// Original short synthesized signals. No remote audio or microphone access.
export type Tone='soft'|'bell'|'digital';
export type SoundEvent='start'|'focus'|'break';
export const tones=[{value:'soft',label:'Suave'},{value:'bell',label:'Sino'},{value:'digital',label:'Digital'}] as const;
export function validTone(value:unknown):Tone{return value==='bell'||value==='digital'?value:'soft'}
export function validTime(value:unknown,fallback:string){return typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value)?value:fallback}
export function quietAt(enabled:boolean,start:string,end:string,now=new Date()){
 if(!enabled)return false;
 const minutes=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3));
 const a=minutes(start),b=minutes(end),n=now.getHours()*60+now.getMinutes();
 // Equal bounds deliberately mean all day, not an empty interval.
 return a===b|| (a<b?n>=a&&n<b:n>=a||n<b);
}
let context:AudioContext|null=null;
let generation=0;
export async function unlockAudio(){
 try{
  const Audio=window.AudioContext||(window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Audio)return false;
  if(!context||context.state==='closed')context=new Audio();
  if(context.state!=='running')await context.resume();
  return context.state==='running';
 }catch{return false}
}
export async function playSessionTone(tone:Tone,event:SoundEvent,volume:number,gesture=false){
 const version=++generation;
 if(gesture){if(!await unlockAudio())return false}
 if(version!==generation||!context||context.state!=='running')return false;
 try{
  const audio=context;
  const patterns={soft:[523.25,659.25,783.99],bell:[659.25,987.77,1318.51],digital:[440,660,880]};
  const notes=patterns[tone],frequencies=event==='start'?[notes[0],notes[1]]:event==='break'?[notes[2],notes[1]]:notes;
  const interval=tone==='bell'?.23:.16,duration=tone==='bell'?.42:.24;
  const peak=Math.max(0,Math.min(1,volume/100))*.11;
  frequencies.forEach((hz,i)=>{
   const oscillator=audio.createOscillator(),gain=audio.createGain();
   const at=audio.currentTime+.015+i*interval;
   oscillator.type=tone==='digital'?'triangle':'sine';oscillator.frequency.setValueAtTime(hz,at);
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(peak,at+.025);gain.gain.linearRampToValueAtTime(0,at+duration);
   oscillator.connect(gain);gain.connect(audio.destination);
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
   oscillator.start(at);oscillator.stop(at+duration+.01);
  });
  return true;
 }catch{return false}
}
