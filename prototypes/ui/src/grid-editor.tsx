import { useEffect,useLayoutEffect,useRef,useState,type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import type { Placement,Widget } from './model';
import { COLS,MAX_ROWS,minimum,gridStyle,planPlacement,displaced } from './grid-model';

type GestureKind='move'|'resize'|'width'|'height'|'add';
export interface Preview { id:string; kind:GestureKind; placement:Placement; valid:boolean; displaced?:Widget[] }
export function useGridGesture(widgets:Widget[],enabled:boolean,push:boolean,onCommit:(next:Widget[])=>void,onReject:()=>void){
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
   const plan=planPlacement(widgets,item,p,push);
   return {id:item.id,kind,placement:p,valid:!!plan,displaced:plan?displaced(widgets,plan,item.id):[]};
  };
  const move=(ev:PointerEvent)=>{if(ev.pointerId===pointer)setPreview(compute(ev))};
  const finish=(ev:PointerEvent)=>{if(ev.pointerId!==pointer)return;const next=compute(ev);clear();setPreview(null);const plan=planPlacement(widgets,item,next.placement,push);if(plan)onCommit(plan);else onReject()};
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
 return <>{preview.displaced?.map(w=>w.placement&&<div key={w.id} className="grid-neighbor-ghost" aria-hidden="true" style={gridStyle(w.placement)}><span>Deslocamento</span></div>)}<div aria-hidden="true" className={'grid-ghost '+(preview.valid?'valid':'blocked')} style={gridStyle(p)}><span>{preview.valid?p.w+' × '+p.h+(preview.displaced?.length?' · '+preview.displaced.length+' vizinho(s)':''):'Espaço ocupado'}</span></div></>;
}

// FLIP on committed positions, not on pointer coordinates; honor reduced motion.
// Animation is on a nested visual wrapper so grid geometry remains measurable.
export function useGridMotion(gridRef:RefObject<HTMLDivElement>,enabled:boolean){
 const before=useRef<Map<string,DOMRect>>(new Map());
 const previousGrid=useRef<{element:HTMLDivElement|null;width:number}>({element:null,width:0});
 const animations=useRef<Map<string,Animation>>(new Map());
 useLayoutEffect(()=>{
  const nodes=Array.from(gridRef.current?.querySelectorAll<HTMLElement>(':scope > .widget[data-widget]')??[]);
  const next=new Map<string,DOMRect>();
  const element=gridRef.current,width=element?.clientWidth??0;
  const sameGrid=previousGrid.current.element===element&&previousGrid.current.width===width;
  previousGrid.current={element,width};
  const reduce=document.documentElement.dataset.motion==='reduced'||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){animations.current.forEach(a=>a.cancel());animations.current.clear()}
  for(const node of nodes){
   const id=node.dataset.widget!,rect=node.getBoundingClientRect(),old=before.current.get(id);
   next.set(id,rect);
   if(!enabled||reduce||!old||!sameGrid)continue;
   const dx=old.x-rect.x,dy=old.y-rect.y;
   if(Math.abs(dx)<1&&Math.abs(dy)<1)continue;
   const card=node.querySelector<HTMLElement>(':scope > .card');
   if(!card?.animate)continue;
   animations.current.get(id)?.cancel();
   const animation=card.animate([{transform:'translate('+dx+'px,'+dy+'px)',opacity:.75},{transform:'translate(0,0)',opacity:1}],{duration:170,easing:'cubic-bezier(.2,.75,.25,1)'});
   animations.current.set(id,animation);
   animation.onfinish=()=>{if(animations.current.get(id)===animation)animations.current.delete(id)};
  }
  before.current=next;
 });
 useEffect(()=>()=>{animations.current.forEach(a=>a.cancel());animations.current.clear()},[]);
}
export function pointerPlacement(grid:HTMLDivElement,clientX:number,clientY:number,dims:{w:number;h:number}):Placement{
 const rect=grid.getBoundingClientRect(),css=getComputedStyle(grid);
 const left=parseFloat(css.paddingLeft)||0,right=parseFloat(css.paddingRight)||0,top=parseFloat(css.paddingTop)||0;
 const stepX=(grid.clientWidth-left-right+(parseFloat(css.columnGap)||0))/COLS;
 const stepY=(parseFloat(css.gridAutoRows)||28)+(parseFloat(css.rowGap)||0);
 return {x:Math.max(0,Math.min(COLS-dims.w,Math.floor((clientX-rect.left-grid.clientLeft-left)/stepX))),
 y:Math.max(0,Math.min(MAX_ROWS-dims.h,Math.floor((clientY-rect.top-grid.clientTop-top)/stepY))),...dims};
}
