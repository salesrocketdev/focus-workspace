import { useEffect,useRef,useState,type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight,Maximize2,Minimize2,PictureInPicture2,Play,Pause,Square,Timer,RotateCcw,X,Search,Command,ChevronRight } from 'lucide-react';
import { Dialog,SearchField } from './ui';
import { formatTime } from './components';

type PipApi={requestWindow:(options:{width:number;height:number})=>Promise<Window>};
const pipApi=()=> (window as Window&{documentPictureInPicture?:PipApi}).documentPictureInPicture;
type MiniProps={title:string;label:string;seconds:number;duration:number;running:boolean;free:boolean;onToggle:()=>void;onReset:()=>void;onStop:()=>void;onExpand:()=>void;onClose:()=>void;onError:(message:string)=>void};
export function CompactFocus(p:MiniProps){
 const [pip,setPip]=useState<Window|null>(null);
 const [pending,setPending]=useState(false);
 const current=useRef<Window|null>(null);
 const alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;current.current?.close();current.current=null}},[]);
 useEffect(()=>{
  if(!pip)return;
  const sync=()=>{const target=pip.document.documentElement;target.dataset.theme=document.documentElement.dataset.theme??'light';target.dataset.motion=document.documentElement.dataset.motion??'system'};
  sync();const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-motion']});return()=>observer.disconnect();
 },[pip]);
 async function detach(){
  const api=pipApi();if(!api||pending||current.current)return;
  setPending(true);
  try{
   const win=await api.requestWindow({width:340,height:210});
   if(!alive.current){win.close();return}
   current.current=win;
   win.document.title='Focora · Foco compacto';
   win.document.documentElement.lang='pt-BR';
   win.document.documentElement.dataset.theme=document.documentElement.dataset.theme??'light';
   win.document.documentElement.dataset.motion=document.documentElement.dataset.motion??'system';
   const base=win.document.createElement('base');base.href=document.baseURI;win.document.head.append(base);
   document.querySelectorAll('style,link[rel="stylesheet"]').forEach(node=>win.document.head.append(node.cloneNode(true)));
   win.document.body.className='compact-pip-document';
   win.addEventListener('pagehide',()=>{if(current.current===win){current.current=null;if(alive.current)setPip(null)}},{once:true});
   setPip(win);
  }catch{p.onError('Janela flutuante indisponível. O modo compacto continua dentro do aplicativo.')}
  finally{if(alive.current)setPending(false)}
 }
 function returnToApp(){const win=current.current;current.current=null;setPip(null);win?.close()}
 const pct=p.free?100:Math.max(0,Math.min(100,(p.duration-p.seconds)/Math.max(1,p.duration)*100));
 const panel=<section className={'compact-focus '+(pip?'compact-detached':'compact-dock')} aria-label="Foco compacto">
  <header><span><Timer size={16}/> Foco compacto</span><div>{pip?<button className="ui-icon-button" aria-label="Voltar à janela principal" title="Voltar à janela principal" onClick={returnToApp}><Minimize2 size={15}/></button>:pipApi()&&<button className="ui-icon-button" aria-label="Abrir janela flutuante" title="Abrir janela flutuante" disabled={pending} onClick={()=>void detach()}><PictureInPicture2 size={16}/></button>}<button className="ui-icon-button" aria-label="Expandir foco compacto" title="Expandir foco" onClick={()=>{returnToApp();p.onExpand()}}><Maximize2 size={15}/></button><button className="ui-icon-button" aria-label="Fechar foco compacto" title="Fechar (mantém sessão)" onClick={()=>{returnToApp();p.onClose()}}><X size={17}/></button></div></header>
  <div className="compact-main"><div className="compact-time"><strong role="img" aria-label={'Tempo compacto: '+formatTime(p.seconds)}>{formatTime(p.seconds)}</strong><small>{p.label} · {p.running?'Em andamento':'Pausado ou pronto'}</small></div><div className="compact-transport"><button className="ui-icon-button" aria-label="Reiniciar foco compacto" title="Reiniciar" onClick={p.onReset}><RotateCcw size={17}/></button><button className="compact-play" aria-label={p.running?'Pausar foco compacto':'Iniciar foco compacto'} onClick={p.onToggle}>{p.running?<Pause size={19} fill="currentColor"/>:<Play size={19} fill="currentColor"/>}</button><button className="ui-icon-button" aria-label="Encerrar foco compacto" title="Encerrar" onClick={p.onStop}><Square size={15}/></button></div></div>
  <div className="compact-context" title={p.title}>{p.title}</div><div className="compact-progress" role="progressbar" aria-label="Progresso do foco compacto" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}><i style={{width:pct+'%'}}/></div>
 </section>;
 return pip?createPortal(panel,pip.document.body):panel;
}
export type QuickAction={id:string;title:string;description:string;icon:ReactNode;keywords?:string;disabled?:boolean;run:()=>void};
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
export function CommandPalette({actions,onDismiss}:{actions:QuickAction[];onDismiss:()=>void}){
 const [query,setQuery]=useState(''),[active,setActive]=useState(0);
 const items=actions.filter(a=>!a.disabled&&normalize(a.title+' '+a.description+' '+(a.keywords??'')).includes(normalize(query.trim())));
 const index=Math.min(active,Math.max(0,items.length-1));
 const list=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=list.current?.querySelector<HTMLElement>('[data-active=true]');el?.scrollIntoView({block:'nearest'})},[index,query]);
 function run(action:QuickAction){onDismiss();action.run()}
 return <Dialog title="Ações rápidas" description="Encontre uma página ou ação sem sair do seu fluxo." onDismiss={onDismiss}>
 <div className="command-palette" onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(0,Math.min(items.length-1,i+(e.key==='ArrowDown'?1:-1))))}else if(e.key==='Enter'&&items[index]&&(e.target as HTMLElement).tagName==='INPUT'){e.preventDefault();run(items[index])}}}>
 <SearchField label="Buscar ações" placeholder="O que você quer fazer?" value={query} onValueChange={v=>{setQuery(v);setActive(0)}}/>
 <div className="command-list" ref={list} aria-label="Ações disponíveis">{items.length?items.map((a,i)=><button key={a.id} type="button" className="command-item" data-active={i===index} onPointerMove={()=>setActive(i)} onClick={()=>run(a)}><span className="command-icon">{a.icon}</span><span><b>{a.title}</b><small>{a.description}</small></span><ChevronRight size={15}/></button>):<div className="command-empty"><Search size={25}/><b>Nenhuma ação encontrada</b><small>Tente pesquisar por foco, agenda ou configurações.</small></div>}</div>
 <footer className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navegar</span><span><kbd>Enter</kbd> Abrir</span><span><kbd>Esc</kbd> Fechar</span></footer></div></Dialog>;
}
export function QuickActionButton({onClick}:{onClick:()=>void}){return <button type="button" className="ui-icon-button quick-action-button" aria-label="Abrir ações rápidas" title="Ações rápidas (Ctrl/Cmd + K)" onClick={onClick}><Search size={19}/><kbd>Ctrl K</kbd></button>}
