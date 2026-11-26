import { useEffect,useState } from 'react';
import { Bell,BellRing,CheckCheck,Clock,Timer,Coffee,Monitor,Info,Trash2 } from 'lucide-react';
import { Button,Dialog,ToggleCard } from './ui';
import { readStorage,writeStorage } from './preferences-model';
type Kind='focus'|'break'|'test';
type Permission=NotificationPermission|'unsupported';
interface Preferences {focus:boolean;breaks:boolean;native:boolean}
interface Entry{id:string;title:string;body:string;kind:Kind;at:number;read:boolean}
const KEY='focus-workspace:v4:notifications';
const INBOX='focus-workspace:v4:inbox';
const supported=()=>typeof Notification!=='undefined'&&window.isSecureContext&&'serviceWorker' in navigator;
const permission=():Permission=>supported()?Notification.permission:'unsupported';
function loadPrefs():Preferences{const p=readStorage(KEY) as Partial<Preferences>|null;return {focus:p?.focus!==false,breaks:p?.breaks!==false,native:p?.native===true}}
function loadInbox():Entry[]{const data=readStorage(INBOX);return Array.isArray(data)?data.filter(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&typeof e.body==='string'&&typeof e.at==='number'&&typeof e.read==='boolean'&&['focus','break','test'].includes(e.kind)).slice(0,50):[]}
export async function registerNotificationWorker(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return null;
 try{return await navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js')}catch{return null}
}
async function nativeNotice(entry:Entry){
 if(permission()!=='granted')return false;
 try{
  const reg=await registerNotificationWorker();if(!reg)return false;
  const active=reg.active?reg:await Promise.race([navigator.serviceWorker.ready,new Promise<null>(resolve=>window.setTimeout(()=>resolve(null),5000))]);
  if(!active)return false;
  await active.showNotification(entry.title,{body:entry.body,tag:entry.id,icon:import.meta.env.BASE_URL+'icons/icon-192.png',data:{url:new URL(import.meta.env.BASE_URL,location.origin).href}});
  return true;
 }catch{return false}
}
export function useNotifications(){
 const [prefs,setPrefs]=useState(loadPrefs),[entries,setEntries]=useState(loadInbox),[access,setAccess]=useState(permission),[feedback,setFeedback]=useState('');
 useEffect(()=>{writeStorage(KEY,prefs)},[prefs]);
 useEffect(()=>{writeStorage(INBOX,entries)},[entries]);
 useEffect(()=>{const refresh=()=>setAccess(permission());window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);return()=>{window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh)}},[]);
 function update(next:Preferences){setPrefs(next)}
 async function enable(){
  if(!supported()){setFeedback('Notificações do sistema não disponíveis neste navegador.');return}
  try{const result=await Notification.requestPermission();setAccess(result);if(result==='granted'){setPrefs(p=>({...p,native:true}));setFeedback('Notificações do sistema autorizadas.')}else setFeedback(result==='denied'?'Permissão bloqueada. Altere nas configurações do navegador.':'Permissão não concedida.')}catch{setFeedback('Não foi possível solicitar permissão.')}
 }
 function publish(kind:Kind,title:string,body:string){
  if((kind==='focus'&&!prefs.focus)||(kind==='break'&&!prefs.breaks))return;
  const entry:Entry={id:crypto.randomUUID(),title,body,kind,at:Date.now(),read:false};
  setEntries(old=>[entry,...old].slice(0,50));
  if(prefs.native&&permission()==='granted')void nativeNotice(entry).then(ok=>{if(kind==='test')setFeedback(ok?'Notificação enviada ao sistema.':'Não foi possível entregar ao sistema; veja a central interna.')});
  else if(kind==='test')setFeedback('Notificação adicionada à central interna.');
 }
 return {prefs,update,entries,access,feedback,enable,publish,unread:entries.filter(e=>!e.read).length,markAll:()=>setEntries(old=>old.map(e=>({...e,read:true}))),clear:()=>setEntries([])};
}
export type Notifications=ReturnType<typeof useNotifications>;
export function NotificationBell({unread,onClick}:{unread:number;onClick:()=>void}){
 return <button type="button" className="ui-icon-button notification-bell" aria-label="Abrir notificações" onClick={onClick}><Bell size={19}/>{unread>0&&<span className="notification-count" aria-label={unread+' não lidas'}>{unread>9?'9+':unread}</span>}</button>;
}
export function NotificationSettings({notifications:n}:{notifications:Notifications}){
 return <section className="settings-surface"><header className="settings-section-header"><BellRing size={20}/><div><h2>Notificações</h2><p>Escolha os avisos que deseja receber durante suas sessões.</p></div></header>
 <div className="settings-subgroup"><h3>Avisos de atividade</h3><ToggleCard title="Fim do período de foco" description="Receba um aviso quando o temporizador de foco terminar." icon={<Timer size={19}/>} checked={n.prefs.focus} onChange={v=>n.update({...n.prefs,focus:v})}/><ToggleCard title="Fim da pausa" description="Saiba quando estiver na hora de retomar a concentração." icon={<Coffee size={19}/>} checked={n.prefs.breaks} onChange={v=>n.update({...n.prefs,breaks:v})}/></div>
 <div className="settings-subgroup"><h3>Notificações do sistema</h3><ToggleCard title="Exibir notificações no dispositivo" description="Além dos avisos na central do aplicativo." icon={<Monitor size={19}/>} checked={n.prefs.native&&n.access==='granted'} disabled={n.access!=='granted'} onChange={v=>n.update({...n.prefs,native:v})}/><div className="notification-permission"><div><b>{n.access==='granted'?'Permissão concedida':n.access==='denied'?'Permissão bloqueada':n.access==='unsupported'?'Indisponível neste ambiente':'Permissão ainda não solicitada'}</b><small>{n.access==='denied'?'Altere a permissão nas configurações do navegador.':n.access==='unsupported'?'Use um navegador compatível em HTTPS. No iOS, instale na tela inicial.':'O navegador controla a autorização.'}</small></div>{n.access==='default'&&<Button variant="secondary" onClick={()=>void n.enable()}>Autorizar notificações</Button>}</div></div>
 <div className="notification-test"><Button variant="secondary" onClick={()=>n.publish('test','Notificação de teste','Tudo pronto para receber seus avisos de foco.')}><Bell size={16}/> Enviar notificação de teste</Button>{n.feedback&&<small role="status">{n.feedback}</small>}</div>
 <div className="settings-info"><Info size={17}/><span>Os avisos de sessão dependem da execução do temporizador. Notificações com o app fechado e lembretes de agenda reais exigem agendamento adicional; ainda não disponíveis.</span></div></section>;
}
export function NotificationCenter({notifications:n,onDismiss,onSettings}:{notifications:Notifications;onDismiss:()=>void;onSettings:()=>void}){
 return <Dialog title="Notificações" description={n.unread+' não lida(s) · neste navegador'} onDismiss={onDismiss}><div className="notification-center-actions"><Button variant="secondary" size="sm" onClick={n.markAll} disabled={!n.unread}><CheckCheck size={15}/> Marcar todas como lidas</Button><button className="ui-icon-button" aria-label="Limpar notificações" disabled={!n.entries.length} onClick={n.clear}><Trash2 size={16}/></button></div><div className="notification-inbox">{n.entries.length?n.entries.map(e=><article key={e.id} className={'notification-entry'+(!e.read?' unread':'')}><span className="notification-icon">{e.kind==='focus'?<Timer size={19}/>:e.kind==='break'?<Coffee size={19}/>:<Bell size={19}/>}</span><div><b>{e.title}</b><p>{e.body}</p><small><Clock size={12}/> {new Date(e.at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div>{!e.read&&<i aria-label="Não lida"/>}</article>):<div className="notification-empty"><Bell size={30}/><b>Nenhum aviso por aqui</b><small>As próximas notificações aparecerão nesta central.</small></div>}</div><footer className="dialog-actions"><Button variant="secondary" onClick={onSettings}>Preferências</Button><Button onClick={onDismiss}>Fechar</Button></footer></Dialog>;
}
