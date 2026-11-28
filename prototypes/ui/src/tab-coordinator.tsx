import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Monitor,Info} from 'lucide-react';
import {WORKSPACE_KEY} from './workspace-storage';
import {PREFS_KEY} from './preferences-model';
import {NOTES_KEY} from './backup-model';
type Role='pending'|'owner'|'mirror'|'unsupported'|'unavailable';
const LOCK='focus-workspace:v4:workspace-writer';
const supported=()=>typeof navigator.locks?.request==='function';

// Only the owner writes the workspace. The browser releases its exclusive lock
// when the document is destroyed; queued tabs restore the authoritative state
// before becoming writers. No timeout-based lease or forced lock stealing.
export function useTabCoordinator(restore:()=>void){
 const [role,setRole]=useState<Role>(()=>supported()?'pending':'unsupported');
 const writable=useRef(!supported());
 const restoreRef=useRef(restore);
 useLayoutEffect(()=>{restoreRef.current=restore});
 useEffect(()=>{
  if(!supported())return;
  let disposed=false,release:(()=>void)|null=null;
  const abort=new AbortController();
  writable.current=false;
  const sync=()=>{if(!disposed&&!writable.current)restoreRef.current()};
  const storage=(e:StorageEvent)=>{if(e.key===WORKSPACE_KEY||e.key===PREFS_KEY||e.key===NOTES_KEY||e.key===null)sync()};
  const visible=()=>{if(document.visibilityState==='visible')sync()};
  window.addEventListener('storage',storage);window.addEventListener('pageshow',sync);document.addEventListener('visibilitychange',visible);
  setRole('mirror');sync();
  void navigator.locks.request(LOCK,{mode:'exclusive',signal:abort.signal},async()=>{
   if(disposed)return;
   restoreRef.current();
   writable.current=true;setRole('owner');
   await new Promise<void>(resolve=>{release=resolve});
   writable.current=false;
  }).catch(()=>{if(!disposed){writable.current=false;setRole('unavailable')}});
  return()=>{
   disposed=true;writable.current=false;abort.abort();release?.();
   window.removeEventListener('storage',storage);window.removeEventListener('pageshow',sync);document.removeEventListener('visibilitychange',visible);
  };
 },[]);
 return {role,canWrite:role==='owner'||role==='unsupported',isWriter:()=>writable.current};
}
export type TabCoordinator=ReturnType<typeof useTabCoordinator>;
export function TabIndicator({tabs}:{tabs:TabCoordinator}){
 if(tabs.role==='owner'||tabs.role==='pending')return null;
 return <div className="tab-indicator" role="status">{tabs.role==='mirror'?<Monitor size={15}/>:<Info size={15}/>}<span>{tabs.role==='mirror'?'Sessão compartilhada · outra aba controla. Feche a aba responsável para assumir.':tabs.role==='unsupported'?'Controle entre abas indisponível. Use apenas uma aba do Focora.':'Não foi possível obter o controle. Reabra o Focora para tentar novamente.'}</span></div>;
}
