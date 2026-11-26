import { useId, type ReactNode } from 'react';
import { Play, Pause, RotateCcw, Square, BookOpen, Music2, CalendarDays, Ellipsis, Timer, ListTodo, Target, BarChart3, StickyNote, History, CalendarClock, type LucideIcon } from 'lucide-react';
import { events, type WidgetType } from './model';
import { ProviderIcon, type ProviderId } from './provider-icons';

export const icons:Record<WidgetType,LucideIcon>={focus:Timer,agenda:CalendarDays,tasks:ListTodo,reading:BookOpen,goal:Target,music:Music2,summary:BarChart3,notes:StickyNote,next:CalendarClock,recent:History};
export function Brand(){return <div className="brand"><span className="brand-symbol" aria-hidden="true"><i/><i/></span><b>Focora</b></div>}
export function formatTime(seconds:number){return [Math.floor(seconds/60),seconds%60].map(v=>String(v).padStart(2,'0')).join(':')}
export function Ring({seconds=1500,total=1500,label='Leitura',large=false,cycleLabel='Ciclo 1 de 4'}:{seconds?:number;total?:number;label?:string;large?:boolean;cycleLabel?:string}){
 const gradient=useId();
 const ratio=Math.min(1,Math.max(0,seconds/Math.max(1,total)));
 return <div className={'timer-ring'+(large?' ring-large':'')} role="img" aria-label={formatTime(seconds)+' · '+label}>
 <svg viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id={gradient} x1="0%" x2="0%" y1="0%" y2="100%"><stop stopColor="#f8d4ba"/><stop offset=".44" stopColor="#f8d4ba"/><stop offset=".58" stopColor="#f6a772"/><stop offset=".68" stopColor="#e8752b"/><stop offset="1" stopColor="#d8601b"/></linearGradient></defs><circle cx="80" cy="80" r="72" fill="none" stroke="var(--ring-track)" strokeWidth="8"/><circle cx="80" cy="80" r="72" fill="none" stroke={'url(#'+gradient+')'} strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray={Math.min(99,ratio*100)+' 100'} transform="rotate(-90 80 80)"/></svg>
 <div className="ring-copy"><strong>{formatTime(seconds)}</strong><span>{label}</span>{large&&<small>{cycleLabel}</small>}</div></div>
}
export function Segment({value,onChange}:{value:'Pomodoro'|'Livre';onChange:(v:'Pomodoro'|'Livre')=>void}){return <div className="segment" aria-label="Método de foco">{(['Pomodoro','Livre'] as const).map(v=><button key={v} aria-pressed={value===v} className={value===v?'selected':''} onClick={()=>onChange(v)}>{v}</button>)}</div>}
export function Card({title,icon:Icon,children,actions,provider}:{title:string;icon:LucideIcon;children:ReactNode;actions?:ReactNode;provider?:ProviderId}){return <section className="card"><header className="card-head"><span>{provider?<ProviderIcon provider={provider} size={16}/>:<Icon size={16} strokeWidth={1.8}/>}<span className="card-title" title={title}>{title}</span></span>{actions??<Ellipsis size={16} aria-hidden="true"/>}</header><div className="card-body">{children}</div></section>}
export function Cover({album=false,title='Clean Architecture'}:{album?:boolean;title?:string}){
 const id=useId();
 return <div className={'cover '+(album?'album':'book')} aria-hidden="true">
 {!album&&<b className={title==='Clean Architecture'?'':'alternate-cover-title'}>{title==='Clean Architecture'?<>Clean<br/>Architecture</>:title}</b>}
 <svg viewBox={album?'0 0 100 100':'0 0 100 145'} preserveAspectRatio="xMidYMid slice">
 <defs>
  <linearGradient id={id+'sky'} x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor={album?'#756784':'#a5c0ae'}/><stop offset=".55" stopColor={album?'#dcb0a1':'#e3d6aa'}/><stop offset="1" stopColor="#f9d3a1"/></linearGradient>
  <linearGradient id={id+'warm'} x1="0%" y1="0%" x2="0%" y2="100%"><stop stopColor="#f7c783"/><stop offset="1" stopColor="#cb9d77"/></linearGradient>
 </defs>
 <rect width="100" height="145" fill={'url(#'+id+'sky)'}/>
 {album?<><circle cx="57" cy="40" r="20" fill="#ffce9a" opacity=".24"/><circle cx="57" cy="40" r="13" fill="#ffdaa5"/></>:null}
 <path d={album?'M0 56L13 48 25 54 39 44 55 58 67 51 82 60 100 48V145H0Z':'M0 83L17 73 29 78 47 69 59 77 75 66 91 76 100 72V145H0Z'} fill={'url(#'+id+'warm)'}/>
 <path d={album?'M0 70L17 58 34 65 49 57 63 65 81 53 100 67V145H0Z':'M0 96L12 84 27 91 44 80 58 91 73 81 89 91 100 85V145H0Z'} fill="#e4ad72"/>
 <path d={album?'M0 80L18 69 31 77 52 64 68 77 83 70 100 76V145H0Z':'M0 105L15 96 28 103 43 91 57 102 70 95 84 105 100 91V145H0Z'} fill="#b5aaa4"/>
 <path d={album?'M0 89L15 78 34 84 49 75 70 86 86 75 100 83V145H0Z':'M0 118L18 103 31 113 48 99 65 111 81 105 100 116V145H0Z'} fill="#778c98"/>
 <path d={album?'M0 93L20 86 42 94 63 85 85 92 100 86V145H0Z':'M0 132L14 116 32 125 47 114 65 126 83 116 100 123V145H0Z'} fill="#536b78"/>
 <path d={album?'M0 98L22 91 42 97 68 91 100 97V145H0Z':'M0 140L21 130 42 139 58 126 80 139 100 130V145H0Z'} fill="#3d515c"/>
 {[4,12,22,34,66,78,91,97].map((x,i)=><g key={x} transform={`translate(${x} ${(album?76:119)+(i%3)*4}) scale(${i%2?.8:1.1})`} fill="#344955"><path d="M0 0l-3.6 7h2l-4 5h2l-4 5h14l-4-5h2l-4-5h2Z"/><rect x="-.7" y="16" width="1.4" height="5"/></g>)}
 </svg></div>
}
export function Progress({value}:{value:number}){return <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div style={{width:Math.min(100,Math.max(0,value))+'%'}}/></div>}
export function AgendaRows({single=false}:{single?:boolean}){return <div className="agenda-list">{(single?events.slice(1,2):events).map(e=><div className={'event '+e.color} key={e.title}><time>{e.time}</time><ProviderIcon provider={e.provider==='Outlook'?'outlook':'google-calendar'} size={19}/><div><b>{e.title}</b><small>{e.provider}</small></div><small className="event-duration">{e.duration}</small></div>)}</div>}
export function Transport({running,onToggle,onReset,onStop}:{running:boolean;onToggle:()=>void;onReset:()=>void;onStop:()=>void}){return <div className="transport"><button className="circle-button" aria-label="Reiniciar" onClick={onReset}><RotateCcw size={22}/></button><button className="circle-button primary big" aria-label={running?'Pausar':'Iniciar'} onClick={onToggle}>{running?<Pause size={28} fill="currentColor"/>:<Play size={28} fill="currentColor"/>}</button><button className="circle-button" aria-label="Encerrar" onClick={onStop}><Square size={20} fill="currentColor"/></button></div>}
