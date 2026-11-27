import { useEffect,useRef,useState } from 'react';
import { Bell,BellRing,CheckCheck,Clock,Timer,Coffee,Monitor,Info,Trash2,Volume2,VolumeX,Moon,Play } from 'lucide-react';
import { Button,Dialog,ToggleCard,SelectField,Field } from './ui';
import {DistractionSettings,type ShieldPreferences} from './distraction-shield';
import { readStorage,writeStorage } from './preferences-model';
import {tones,validTone,validTime,quietAt,unlockAudio,playSessionTone,type Tone,type SoundEvent} from './session-audio';
type Kind='focus'|'break'|'test';
type Permission=NotificationPermission|'unsupported';
interface Preferences {focus:boolean;breaks:boolean;native:boolean;sound:boolean;startSound:boolean;tone:Tone;volume:number;quiet:boolean;quietStart:string;quietEnd:string}
interface Entry{id:string;title:string;body:string;kind:Kind;at:number;read:boolean}
const KEY='focus-workspace:v4:notifications';
const INBOX='focus-workspace:v4:inbox';
const isAppleMobile=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const installed=()=>window.matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
const needsInstall=()=>isAppleMobile()&&!installed();
const supported=()=>!needsInstall()&&typeof Notification!=='undefined'&&window.isSecureContext&&'serviceWorker' in navigator&&typeof ServiceWorkerRegistration!=='undefined'&&'showNotification' in ServiceWorkerRegistration.prototype;
const permission=():Permission=>supported()?Notification.permission:'unsupported';
function loadPrefs():Preferences{const p=readStorage(KEY) as Partial<Preferences>|null;return {focus:p?.focus!==false,breaks:p?.breaks!==false,native:p?.native===true,sound:p?.sound===true,startSound:p?.startSound===true,tone:validTone(p?.tone),volume:typeof p?.volume==='number'&&Number.isFinite(p.volume)?Math.max(0,Math.min(100,p.volume)):50,quiet:p?.quiet===true,quietStart:validTime(p?.quietStart,'22:00'),quietEnd:validTime(p?.quietEnd,'07:00')}}
function loadInbox():Entry[]{const data=readStorage(INBOX);return Array.isArray(data)?data.filter(e=>e&&typeof e.id==='string'&&typeof e.title==='string'&&typeof e.body==='string'&&typeof e.at==='number'&&typeof e.read==='boolean'&&['focus','break','test'].includes(e.kind)).slice(0,50):[]}
export async function registerNotificationWorker(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return null;
 try{return await navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{scope:import.meta.env.BASE_URL})}catch{return null}
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
 const [installRequired,setInstallRequired]=useState(needsInstall);
 const [prefs,setPrefs]=useState(loadPrefs),[entries,setEntries]=useState(loadInbox),[access,setAccess]=useState(permission),[feedback,setFeedback]=useState('');
 const prefsRef=useRef(prefs);
 const [audioFeedback,setAudioFeedback]=useState('');
 const [quietActive,setQuietActive]=useState(()=>quietAt(prefs.quiet,prefs.quietStart,prefs.quietEnd));
 function savePrefs(next:Preferences){prefsRef.current=next;setPrefs(next);if(!writeStorage(KEY,next))setFeedback('Preferências não puderam ser salvas.')}
 function saveInbox(next:Entry[]){setEntries(next);writeStorage(INBOX,next)}
 useEffect(()=>{
  const sync=(e:StorageEvent)=>{if(e.key===KEY||e.key===null){const next=loadPrefs();prefsRef.current=next;setPrefs(next)}if(e.key===INBOX||e.key===null){const next=loadInbox();setEntries(next)}};
  window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
 },[]);
 useEffect(()=>{const refresh=()=>setQuietActive(quietAt(prefs.quiet,prefs.quietStart,prefs.quietEnd));refresh();const id=window.setInterval(refresh,15000);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(id);document.removeEventListener('visibilitychange',refresh)}},[prefs.quiet,prefs.quietStart,prefs.quietEnd]);
 useEffect(()=>{const refresh=()=>{setInstallRequired(needsInstall());setAccess(permission())};window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);return()=>{window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh)}},[]);
 const unread=entries.filter(e=>!e.read).length;
 useEffect(()=>{const badge=navigator as Navigator&{setAppBadge?:(n:number)=>Promise<void>;clearAppBadge?:()=>Promise<void>};if(access!=='granted'||!installed())return;const action=unread?badge.setAppBadge?.(unread):badge.clearAppBadge?.();void action?.catch(()=>{})},[unread,access]);
 function update(next:Preferences){savePrefs(next);if(next.sound||next.startSound)void unlockAudio()}
 async function enable(){
  if(!supported()){setFeedback(needsInstall()?'Adicione o Focora à Tela de Início e abra pelo ícone.':'Notificações do sistema não disponíveis neste navegador.');return}
  try{const result=await Notification.requestPermission();setAccess(result);if(result==='granted'){savePrefs({...prefsRef.current,native:true});setFeedback('Notificações do sistema autorizadas.')}else setFeedback(result==='denied'?'Permissão bloqueada. Altere nas configurações do navegador.':'Permissão não concedida.')}catch{setFeedback('Não foi possível solicitar permissão.')}
 }
 function sessionStart(fresh:boolean){
  const p=prefsRef.current;
  if(!p.sound&&!p.startSound)return;
  if(fresh&&p.startSound&&!quietAt(p.quiet,p.quietStart,p.quietEnd))void playSessionTone(p.tone,'start',p.volume,true);
  else void unlockAudio();
 }
 async function preview(event:SoundEvent){
  const p=prefsRef.current;
  if(quietAt(p.quiet,p.quietStart,p.quietEnd)){setAudioFeedback('Horário silencioso ativo. Desative-o para ouvir a prévia.');return}
  if(p.volume===0){setAudioFeedback('Volume ajustado para 0%.');return}
  const ok=await playSessionTone(p.tone,event,p.volume,true);
  setAudioFeedback(ok?'Prévia reproduzida.':'Áudio indisponível. Verifique as permissões e o volume do dispositivo.');
 }
 function publish(kind:Kind,title:string,body:string){
  const p=prefsRef.current;
  if((kind==='focus'&&!p.focus)||(kind==='break'&&!p.breaks))return;
  const entry:Entry={id:crypto.randomUUID(),title,body,kind,at:Date.now(),read:false};
  // Reread before appending so a newly active writer does not overwrite the inbox.
  saveInbox([entry,...loadInbox()].slice(0,50));
  if(quietAt(p.quiet,p.quietStart,p.quietEnd)){
   if(kind==='test')setFeedback('Horário silencioso ativo: aviso salvo apenas na central interna.');
   return;
  }
  if(kind!=='test'&&p.sound&&p.volume>0)void playSessionTone(p.tone,kind,p.volume);
  if(p.native&&permission()==='granted')void nativeNotice(entry).then(ok=>{if(kind==='test')setFeedback(ok?'Notificação enviada ao sistema.':'Não foi possível entregar ao sistema; veja a central interna.')});
  else if(kind==='test')setFeedback('Notificação adicionada à central interna.');
 }
 return {prefs,update,entries,access,feedback,enable,publish,unread,installRequired,quietActive,audioFeedback,preview,sessionStart,markAll:()=>saveInbox(loadInbox().map(e=>({...e,read:true}))),clear:()=>saveInbox([])};
}
export type Notifications=ReturnType<typeof useNotifications>;
export function NotificationBell({unread,onClick}:{unread:number;onClick:()=>void}){
 return <button type="button" className="ui-icon-button notification-bell" aria-label="Abrir notificações" onClick={onClick}><Bell size={19}/>{unread>0&&<span className="notification-count" aria-label={unread+' não lidas'}>{unread>9?'9+':unread}</span>}</button>;
}
export function NotificationSettings({notifications:n,shield,onShield}:{notifications:Notifications;shield?:ShieldPreferences;onShield?:()=>void}){
 return <section className="settings-surface"><header className="settings-section-header"><BellRing size={20}/><div><h2>Notificações</h2><p>Escolha os avisos que deseja receber durante suas sessões.</p></div></header>
 {shield&&onShield&&<DistractionSettings shield={shield} onOpen={onShield}/>}
 <div className="settings-subgroup"><h3>Avisos de atividade</h3><ToggleCard title="Fim do período de foco" description="Receba um aviso quando o temporizador de foco terminar." icon={<Timer size={19}/>} checked={n.prefs.focus} onChange={v=>n.update({...n.prefs,focus:v})}/><ToggleCard title="Fim da pausa" description="Saiba quando estiver na hora de retomar a concentração." icon={<Coffee size={19}/>} checked={n.prefs.breaks} onChange={v=>n.update({...n.prefs,breaks:v})}/></div>
 <div className="settings-subgroup audio-settings"><h3>Sons de sessão</h3><ToggleCard title="Som ao concluir foco ou pausa" description="Sinal curto quando um período termina." icon={<Volume2 size={19}/>} checked={n.prefs.sound} onChange={v=>n.update({...n.prefs,sound:v})}/><ToggleCard title="Som ao iniciar foco" description="Som suave ao iniciar manualmente uma nova sessão." icon={<Play size={19}/>} checked={n.prefs.startSound} onChange={v=>n.update({...n.prefs,startSound:v})}/><div className="audio-controls"><SelectField label="Som do alerta" value={n.prefs.tone} onValueChange={v=>n.update({...n.prefs,tone:validTone(v)})} options={tones.map(t=>({...t}))}/><label className="audio-volume"><span>Volume <b>{n.prefs.volume}%</b></span><input type="range" min="0" max="100" step="5" aria-label="Volume do alerta" value={n.prefs.volume} onChange={e=>n.update({...n.prefs,volume:Number(e.target.value)})}/></label></div><div className="audio-previews"><Button variant="secondary" size="sm" onClick={()=>void n.preview('start')}><Play size={15}/> Ouvir início</Button><Button variant="secondary" size="sm" onClick={()=>void n.preview('focus')}><Bell size={15}/> Ouvir conclusão</Button></div>{n.audioFeedback&&<small role="status">{n.audioFeedback}</small>}<small>Os sons são gerados no dispositivo. O áudio da página depende de uma interação prévia e pode não obedecer ao Não Perturbe nativo; ajuste também o volume do aparelho.</small></div>
 <div className="settings-subgroup quiet-settings"><h3>Horários silenciosos</h3><ToggleCard title="Ativar horário silencioso" description="Silencia sons e notificações do Focora, mantendo os registros na central." icon={<Moon size={19}/>} checked={n.prefs.quiet} onChange={v=>n.update({...n.prefs,quiet:v})}/>{n.prefs.quiet&&<><div className="quiet-time-fields"><Field label="Início do silêncio" type="time" value={n.prefs.quietStart} onChange={e=>n.update({...n.prefs,quietStart:validTime(e.target.value,n.prefs.quietStart)})}/><Field label="Fim do silêncio" type="time" value={n.prefs.quietEnd} onChange={e=>n.update({...n.prefs,quietEnd:validTime(e.target.value,n.prefs.quietEnd)})}/></div><div className="quiet-status"><VolumeX size={16}/><span>{n.quietActive?'Silêncio ativo agora':'Silêncio programado'} · {n.prefs.quietStart}–{n.prefs.quietEnd}{n.prefs.quietStart===n.prefs.quietEnd?' (dia inteiro)':''}</span></div><small>Horário local do dispositivo, todos os dias. O temporizador continua normalmente. Horários iguais silenciam o dia inteiro.</small></>}</div>
 <div className="settings-subgroup"><h3>Notificações do sistema</h3>{n.installRequired&&<div className="ios-install-guide"><Info size={20}/><div><b>Ative as notificações no iPhone ou iPad</b><p>É necessário iOS/iPadOS 16.4 ou posterior e abrir o Focora como aplicativo instalado.</p><ol><li>Abra este site no Safari e toque em Compartilhar.</li><li>Escolha Adicionar à Tela de Início (e Abrir como App da Web, se disponível).</li><li>Abra o Focora pelo ícone, volte a esta tela e autorize as notificações.</li><li>Envie uma notificação de teste.</li></ol></div></div>}<ToggleCard title="Exibir notificações no dispositivo" description="Além dos avisos na central do aplicativo." icon={<Monitor size={19}/>} checked={n.prefs.native&&n.access==='granted'} disabled={n.access!=='granted'} onChange={v=>n.update({...n.prefs,native:v})}/><div className="notification-permission"><div><b>{n.access==='granted'?'Permissão concedida':n.access==='denied'?'Permissão bloqueada':n.access==='unsupported'?(n.installRequired?'Instalação necessária':'Indisponível neste ambiente'):'Permissão ainda não solicitada'}</b><small>{n.access==='denied'?'Altere a permissão nas configurações do navegador.':n.access==='unsupported'?(n.installRequired?'Abra o aplicativo instalado para solicitar autorização.':'Use um navegador compatível em HTTPS. No iOS, instale na tela inicial.'):'O navegador controla a autorização.'}</small></div>{n.access==='default'&&<Button variant="secondary" onClick={()=>void n.enable()}>Autorizar notificações</Button>}</div></div>
 <div className="notification-test"><Button variant="secondary" onClick={()=>n.publish('test','Notificação de teste','Tudo pronto para receber seus avisos de foco.')}><Bell size={16}/> Enviar notificação de teste</Button>{n.feedback&&<small role="status">{n.feedback}</small>}</div>
 <div className="settings-info"><Info size={17}/><span>Os avisos de sessão dependem da execução do temporizador. O iOS pode suspender o aplicativo em segundo plano ou com a tela bloqueada. Notificações garantidas com o app fechado exigem Web Push e um serviço de agendamento, ainda não disponíveis.</span></div></section>;
}
export function NotificationCenter({notifications:n,onDismiss,onSettings}:{notifications:Notifications;onDismiss:()=>void;onSettings:()=>void}){
 return <Dialog title="Notificações" description={n.unread+' não lida(s) · neste navegador'} onDismiss={onDismiss}><div className="notification-center-actions"><Button variant="secondary" size="sm" onClick={n.markAll} disabled={!n.unread}><CheckCheck size={15}/> Marcar todas como lidas</Button><button className="ui-icon-button" aria-label="Limpar notificações" disabled={!n.entries.length} onClick={n.clear}><Trash2 size={16}/></button></div><div className="notification-inbox">{n.entries.length?n.entries.map(e=><article key={e.id} className={'notification-entry'+(!e.read?' unread':'')}><span className="notification-icon">{e.kind==='focus'?<Timer size={19}/>:e.kind==='break'?<Coffee size={19}/>:<Bell size={19}/>}</span><div><b>{e.title}</b><p>{e.body}</p><small><Clock size={12}/> {new Date(e.at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div>{!e.read&&<i aria-label="Não lida"/>}</article>):<div className="notification-empty"><Bell size={30}/><b>Nenhum aviso por aqui</b><small>As próximas notificações aparecerão nesta central.</small></div>}</div><footer className="dialog-actions"><Button variant="secondary" onClick={onSettings}>Preferências</Button><Button onClick={onDismiss}>Fechar</Button></footer></Dialog>;
}
