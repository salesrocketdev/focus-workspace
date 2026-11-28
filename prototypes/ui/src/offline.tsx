import {useEffect,useState} from 'react';
import {CloudOff,Download,RefreshCw,CheckCircle2} from 'lucide-react';
import {registerNotificationWorker} from './notifications';
import {Button} from './ui';
type State='checking'|'ready'|'unavailable';
export function useOffline(){
 const [online,setOnline]=useState(()=>navigator.onLine);
 const [state,setState]=useState<State>('checking');
 const [updateWaiting,setUpdateWaiting]=useState(false);
 const [version,setVersion]=useState<string|null>(null);
 useEffect(()=>{
  let disposed=false,registration:ServiceWorkerRegistration|null=null;
  let channel:MessageChannel|null=null,timeout=0;
  const workers=new Set<ServiceWorker>();
  const closeProbe=()=>{window.clearTimeout(timeout);channel?.port1.close();channel=null};
  function probe(){
   if(disposed)return;
   closeProbe();
   const controller=navigator.serviceWorker?.controller;
   setUpdateWaiting(!!registration?.waiting);
   if(!controller){setState(registration?'checking':'unavailable');return}
   const current=new MessageChannel();channel=current;
   timeout=window.setTimeout(()=>{if(channel===current){closeProbe();if(!disposed)setState('unavailable')}},3000);
   current.port1.onmessage=e=>{if(channel!==current||disposed)return;closeProbe();const ready=e.data?.ready===true;setState(ready?'ready':'unavailable');setVersion(ready&&typeof e.data.version==='string'?e.data.version:null)};
   controller.postMessage({type:'FOCORA_OFFLINE_STATUS'},[current.port2]);
  }
  function watch(){
   const installing=registration?.installing;
   if(installing&&!workers.has(installing)){workers.add(installing);installing.addEventListener('statechange',probe)}
   probe();
  }
  function network(){setOnline(navigator.onLine);if(navigator.onLine){void registration?.update().catch(()=>{});probe()}}
  window.addEventListener('online',network);window.addEventListener('offline',network);
  if(import.meta.env.PROD&&'serviceWorker' in navigator&&window.isSecureContext){
   navigator.serviceWorker.addEventListener('controllerchange',probe);
   void registerNotificationWorker().then(reg=>{
    if(disposed)return;
    registration=reg;
    if(!reg){setState('unavailable');return}
    reg.addEventListener('updatefound',watch);watch();
   });
  }else setState('unavailable');
  return()=>{disposed=true;closeProbe();window.removeEventListener('online',network);window.removeEventListener('offline',network);navigator.serviceWorker?.removeEventListener('controllerchange',probe);registration?.removeEventListener('updatefound',watch);workers.forEach(w=>w.removeEventListener('statechange',probe))};
 },[]);
 return {online,state,updateWaiting,version};
}
export type OfflineState=ReturnType<typeof useOffline>;
export function OfflineIndicator({offline}:{offline:OfflineState}){
 if(offline.online)return null;
 return <div className="offline-indicator" role="status"><CloudOff size={15}/><span>Sem conexão · dados locais</span></div>;
}
export function OfflineSettings({offline}:{offline:OfflineState}){
 return <section className="settings-subgroup offline-settings"><h3>Disponibilidade offline</h3><div className="offline-status-row">{offline.state==='ready'?<CheckCircle2 size={20}/>:<Download size={20}/>}<div><b>{offline.state==='ready'?'Pronto para uso offline':offline.state==='checking'?'Preparando arquivos offline':'Cache offline indisponível'}</b><small>{offline.state==='ready'?'O aplicativo pode reabrir sem internet enquanto os arquivos locais forem mantidos.':offline.state==='checking'?'Mantenha o aplicativo aberto e conectado durante a primeira preparação.':'Abra a versão publicada em um navegador compatível, com conexão à internet.'}</small></div></div>
 {offline.updateWaiting&&<div className="offline-update"><RefreshCw size={17}/><span>Atualização pronta. Feche todas as abas e janelas do Focora e abra novamente para usar a nova versão.</span></div>}
 <small>Temporizador, tarefas, biblioteca de demonstração e histórico usam dados locais. Serviços externos reais precisarão de internet. Limpar os dados do site pode remover o cache e as sessões.</small>
 {offline.state==='unavailable'&&offline.online&&<Button variant="secondary" onClick={()=>location.reload()}>Tentar novamente</Button>}
 </section>
}
