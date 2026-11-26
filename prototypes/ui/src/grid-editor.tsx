import { useEffect,useRef,useState,type PointerEvent as ReactPointerEvent } from 'react';
import type { Placement,Widget } from './model';
import { available,COLS,MAX_ROWS,minimum,gridStyle } from './grid-model';

type GestureKind='move'|'resize'|'width'|'height';
interface Preview { id:string; kind:GestureKind; placement:Placement; valid:boolean }
export function useGridGesture(widgets:Widget[],enabled:boolean,onCommit:(id:string,p:Placement)=>void,onReject:()=>void){
 const gridRef=useRef<HTMLDivElement>(null);
 const [preview,setPreview]=useState<Preview|null>(null);
 const cleanup=useRef<(()=>void)|null>(null);
 useEffect(()=>()=>cleanup.current?.(),[]);
 useEffect(()=>{if(!enabled){cleanup.current?.();setPreview(null)}},[enabled]);
 function begin(e:ReactPointerEvent<HTMLButtonElement>,item:Widget,kind:GestureKind){
  if(!enabled||!item.placement||!gridRef.current||e.button!==0)return;
  e.preventDefault();e.stopPropagation();cleanup.current?.();
  const grid=gridRef.current,button=e.currentTarget,start=item.placement,initial=grid.getBoundingClientRect();
  const css=getComputedStyle(grid);
  const colGap=parseFloat(css.columnGap)||0,rowGap=parseFloat(css.rowGap)||0;
  const inner=grid.clientWidth-(parseFloat(css.paddingLeft)||0)-(parseFloat(css.paddingRight)||0);
  const stepX=(inner+colGap)/COLS,stepY=(parseFloat(css.gridAutoRows)||28)+rowGap;
  const x=e.clientX,y=e.clientY,m=minimum(item.type);
  const pointer=e.pointerId;
  const compute=(ev:PointerEvent):Preview=>{
   const now=grid.getBoundingClientRect();
   const dx=Math.round((ev.clientX-x+initial.left-now.left)/stepX);
   const dy=Math.round((ev.clientY-y+initial.top-now.top)/stepY);
   const p={...start};
   if(kind==='move'){p.x=Math.max(0,Math.min(COLS-start.w,start.x+dx));p.y=Math.max(0,Math.min(MAX_ROWS-start.h,start.y+dy))}
   else{
    if(kind!=='height')p.w=Math.max(m.w,Math.min(COLS-start.x,start.w+dx));
    if(kind!=='width')p.h=Math.max(m.h,Math.min(MAX_ROWS-start.y,start.h+dy));
   }
   return {id:item.id,kind,placement:p,valid:available(p,item.type,widgets,item.id)};
  };
  const move=(ev:PointerEvent)=>{if(ev.pointerId===pointer)setPreview(compute(ev))};
  const finish=(ev:PointerEvent)=>{if(ev.pointerId!==pointer)return;const next=compute(ev);clear();setPreview(null);if(next.valid)onCommit(item.id,next.placement);else onReject()};
  const cancel=()=>{clear();setPreview(null)};
  const key=(ev:KeyboardEvent)=>{if(ev.key==='Escape'){ev.preventDefault();cancel()}};
  function clear(){
   button.removeEventListener('pointermove',move);button.removeEventListener('pointerup',finish);
   button.removeEventListener('pointercancel',cancel);button.removeEventListener('lostpointercapture',cancel);
   document.removeEventListener('keydown',key);
   if(button.hasPointerCapture(pointer))button.releasePointerCapture(pointer);
   cleanup.current=null;
  }
  cleanup.current=clear;
  button.setPointerCapture(pointer);
  button.addEventListener('pointermove',move);button.addEventListener('pointerup',finish);
  button.addEventListener('pointercancel',cancel);button.addEventListener('lostpointercapture',cancel);
  document.addEventListener('keydown',key);
  setPreview({id:item.id,kind,placement:start,valid:true});
 }
 return {gridRef,preview,begin};
}
export function GridGhost({preview}:{preview:Preview}){
 const p=preview.placement;
 return <div aria-hidden="true" className={'grid-ghost '+(preview.valid?'valid':'blocked')} style={gridStyle(p)}><span>{preview.valid?p.w+' × '+p.h:'Espaço ocupado'}</span></div>;
}
