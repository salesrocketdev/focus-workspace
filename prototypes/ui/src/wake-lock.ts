import {useEffect,useState} from 'react';
type WakeStatus='off'|'active'|'unavailable'|'waiting';
export function useScreenWakeLock(enabled:boolean,running:boolean){
 const [status,setStatus]=useState<WakeStatus>('off');
 useEffect(()=>{
  if(!enabled||!running){setStatus('off');return}
  if(!('wakeLock' in navigator)){setStatus('unavailable');return}
  let disposed=false,requesting=false,lock:WakeLockSentinel|null=null;
  async function release(){const held=lock;lock=null;if(held&&!held.released)try{await held.release()}catch{}}
  async function sync(){
   if(disposed)return;
   if(document.visibilityState!=='visible'){setStatus('waiting');await release();return}
   if(requesting||lock&&!lock.released)return;
   requesting=true;
   try{
    const next=await navigator.wakeLock.request('screen');
    if(disposed||document.visibilityState!=='visible'){await next.release();return}
    lock=next;setStatus('active');
    next.addEventListener('release',()=>{if(lock===next){lock=null;if(!disposed)setStatus('waiting')}},{once:true});
   }catch{if(!disposed)setStatus('unavailable')}
   finally{requesting=false}
  }
  void sync();const changed=()=>void sync();document.addEventListener('visibilitychange',changed);window.addEventListener('pageshow',changed);
  return()=>{disposed=true;document.removeEventListener('visibilitychange',changed);window.removeEventListener('pageshow',changed);void release()};
 },[enabled,running]);
 return status;
}
