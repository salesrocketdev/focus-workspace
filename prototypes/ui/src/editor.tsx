import type { Book } from './activity-model';
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode, type DragEvent, type PointerEvent as ReactPointerEvent, type CSSProperties } from 'react';
import { Grip, Ellipsis, X, ChevronUp, ChevronDown, Plus, BookOpen, Play, Pause, SkipBack, SkipForward, Heart, Settings, ChevronDown as Down, type LucideIcon } from 'lucide-react';
import { Ring, Cover, Progress } from './components';
import type { Size, WidgetType } from './model';

type IconProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & { label:string; icon:LucideIcon };
export function EditIconButton({label,icon:Icon,className='',...props}:IconProps){
 return <button {...props} type="button" className={'edit-icon-button '+className} aria-label={label} title={label}><Icon size={15} strokeWidth={1.8}/></button>;
}
export function EditTextButton({variant='secondary',className='',children,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'}){
 return <button {...props} type="button" className={'edit-text-button edit-'+variant+' '+className}>{children}</button>;
}
const sizes:Size[]=['small','medium','large'];
export function WidgetSizeOptions({value,onChange,visual=false}:{value:Size;onChange:(size:Size)=>void;visual?:boolean}){
 return <div className={visual?'mobile-size-options edit-size-options':'edit-size-options'} role="group" aria-label="Tamanho do widget">{sizes.map((size,i)=><button type="button" key={size} aria-pressed={value===size} onClick={()=>onChange(size)}>{visual&&<span className={'size-shape shape-'+size}/>}<span>{visual?['1 × 1','2 × 1','2 × 2'][i]:['P','M','G'][i]}</span></button>)}</div>;
}
interface ToolbarProps{title:string;open:boolean;size:Size;onOpen:()=>void;onClose:()=>void;onDragStart:(e:DragEvent<HTMLButtonElement>)=>void;onPointerMoveStart?:(e:ReactPointerEvent<HTMLButtonElement>)=>void;onNudge?:(dx:number,dy:number)=>void;onMove:(delta:number)=>void;onResize:(size:Size)=>void;onRemove:()=>void;canMoveUp:boolean;canMoveDown:boolean}
export function EditCardToolbar({title,open,size,onOpen,onClose,onDragStart,onPointerMoveStart,onNudge,onMove,onResize,onRemove,canMoveUp,canMoveDown}:ToolbarProps){
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;
  const close=(e:PointerEvent)=>{if(root.current&&!root.current.contains(e.target as Node))onClose()};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){onClose();trigger.current?.focus()}};
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)};
 },[open,onClose]);
 return <div ref={root} className="edit-card-toolbar" onClick={e=>e.stopPropagation()}>
  <EditIconButton label={'Arrastar '+title} icon={Grip} draggable={!onPointerMoveStart} onPointerDown={onPointerMoveStart} onDragStart={onDragStart} className="grid-drag-handle" onKeyDown={e=>{const offsets:Record<string,[number,number]>={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};const d=offsets[e.key];if(!d)return;e.preventDefault();if(onNudge)onNudge(...d);else if(d[1])onMove(d[1])}}/>
  <button ref={trigger} type="button" className="edit-icon-button" aria-label={'Opções de '+title} aria-expanded={open} title="Opções do widget" onClick={onOpen}><Ellipsis size={15}/></button>
  <EditIconButton label={'Remover '+title} icon={X} onClick={onRemove}/>
  {open&&<div className="edit-widget-menu" role="group" aria-label={'Opções de '+title}>
   <span className="edit-menu-caption">Posição</span>
   <button className="edit-menu-row" disabled={!canMoveUp} onClick={()=>onMove(-1)} aria-label={'Mover acima '+title}><ChevronUp size={15}/> Mover acima</button>
   <button className="edit-menu-row" disabled={!canMoveDown} onClick={()=>onMove(1)} aria-label={'Mover abaixo '+title}><ChevronDown size={15}/> Mover abaixo</button>
   <span className="edit-menu-caption">Tamanho</span><WidgetSizeOptions value={size} onChange={onResize}/>
  </div>}
 </div>;
}
export function AddWidgetTile({onClick,style}:{onClick:()=>void;style?:CSSProperties}){return <button type="button" className="add-slot edit-add-tile" style={style} onClick={onClick}><Plus size={23} strokeWidth={1.6}/><span>Adicionar widget</span><small>Escolha no catálogo</small></button>}
interface PreviewProps{type:WidgetType;seconds:number;duration:number;mode:string;page:number;book:Book;focusTitle:string;focusLabel:string;tasks:{id:number;title:string;done:boolean}[];track:string;running:boolean;music:boolean;children:ReactNode}
export function EditPreview({type,seconds,duration,mode,page,book,focusTitle,focusLabel,tasks,track,running,music,children}:PreviewProps){
 const pct=Math.round(page/book.pages*100);
 switch(type){
  case 'focus':return <div className="edit-focus-preview"><Ring seconds={seconds} total={duration} label={focusLabel}/><div className="edit-focus-details"><span className="edit-preview-field"><BookOpen size={12}/> <span>{focusTitle}</span></span><span className="edit-preview-field"><span>{mode}</span><Down size={12}/></span><small>Ciclos de foco</small><div className="edit-preview-actions"><span className="edit-preview-cta">{running?<Pause size={12}/>:<Play size={12} fill="currentColor"/>}<span>{running?'Pausar foco':'Iniciar foco'}</span></span><span className="edit-preview-icon"><Settings size={13}/></span></div></div></div>;
  case 'reading':return <div className="edit-reading-preview"><Cover title={book.title}/><div className="edit-reading-details"><b>{book.title}</b><small>{book.author}</small><Progress value={pct} label={'Progresso de leitura: '+book.title}/><small>Pág. {page} de {book.pages} · {pct}%</small></div></div>;
  case 'tasks':return <div className="edit-task-preview">{tasks.map(t=><div key={t.id} className={t.done?'done':''}><span className="edit-task-check">{t.done?'✓':''}</span><span>{t.title}</span></div>)}</div>;
  case 'music':return <div className="edit-music-preview"><Cover album/><div className="edit-track"><b>{track}</b><small>Lo-Fi Essentials · demo</small></div><div className="edit-preview-transport"><span><SkipBack size={14}/></span><span className="edit-preview-play">{music?<Pause size={14}/>:<Play size={14} fill="currentColor"/>}</span><span><SkipForward size={14}/></span><span><Heart size={14}/></span></div></div>;
  default:return <div className={'edit-passive-preview preview-'+type}>{children}</div>;
 }
}
