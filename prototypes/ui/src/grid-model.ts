import type { Placement, Size, Widget, WidgetType } from './model';

export const COLS=12;
export const MAX_ROWS=120;
export const GRID_BREAKPOINT=1151;
const limits:Record<WidgetType,{w:number;h:number;defaultW:number;defaultH:number}>={
 focus:{w:4,h:6,defaultW:6,defaultH:6},
 agenda:{w:4,h:6,defaultW:6,defaultH:6},
 tasks:{w:3,h:5,defaultW:4,defaultH:5},
 reading:{w:3,h:5,defaultW:5,defaultH:5},
 goal:{w:3,h:5,defaultW:3,defaultH:5},
 music:{w:4,h:3,defaultW:8,defaultH:3},
 summary:{w:3,h:3,defaultW:4,defaultH:3},
 notes:{w:2,h:3,defaultW:4,defaultH:4},
 next:{w:3,h:3,defaultW:4,defaultH:4},
 recent:{w:3,h:3,defaultW:4,defaultH:4},
};
export const minimum=(type:WidgetType)=>({w:limits[type].w,h:limits[type].h});
export function preset(type:WidgetType,size:Size){
 const l=limits[type];
 if(size==='small')return {w:l.w,h:l.h};
 if(size==='large')return {w:Math.max(6,l.defaultW),h:l.defaultH};
 return {w:Math.max(l.w,l.defaultW===8?5:l.defaultW===6?5:l.defaultW),h:l.defaultH};
}
export function overlap(a:Placement,b:Placement){
 return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
}
export function valid(p:Placement,type:WidgetType){
 const m=minimum(type);
 return [p.x,p.y,p.w,p.h].every(Number.isInteger)&&p.x>=0&&p.y>=0&&p.w>=m.w&&p.h>=m.h&&p.x+p.w<=COLS&&p.y+p.h<=MAX_ROWS;
}
export function available(p:Placement,type:WidgetType,widgets:Widget[],except?:string){
 return valid(p,type)&&!widgets.some(w=>w.id!==except&&w.placement&&overlap(w.placement,p));
}
export function firstFree(w:number,h:number,occupied:Placement[]):Placement|null{
 for(let y=0;y+h<=MAX_ROWS;y++)for(let x=0;x+w<=COLS;x++){
  const p={x,y,w,h};if(!occupied.some(o=>overlap(p,o)))return p;
 }
 return null;
}
// Preserve valid saved coordinates; migrate old order-only layouts and repair invalid coordinates.
export function resolveLayout(widgets:Widget[]):Widget[]{
 const fixed:Widget[]=[];const pending:Widget[]=[];
 for(const item of widgets){
  if(item.placement&&available(item.placement,item.type,fixed))fixed.push(item);
  else pending.push({...item,placement:undefined});
 }
 for(const item of pending){
  const size=preset(item.type,item.size);
  const p=firstFree(size.w,size.h,fixed.flatMap(w=>w.placement?[w.placement]:[]));
  if(p)fixed.push({...item,placement:p});
 }
 const map=new Map(fixed.map(w=>[w.id,w]));
 return widgets.flatMap(w=>{const item=map.get(w.id);return item?[item]:[]});
}
export function place(widgets:Widget[],id:string,p:Placement):Widget[]{
 const item=widgets.find(w=>w.id===id);
 return item&&available(p,item.type,widgets,id)?widgets.map(w=>w.id===id?{...w,placement:p}:w):widgets;
}
export function changePreset(widgets:Widget[],id:string,size:Size):Widget[]{
 const current=resolveLayout(widgets);
 const item=current.find(w=>w.id===id);if(!item?.placement)return widgets;
 const dims=preset(item.type,size);const p={...item.placement,...dims};
 const other=current.filter(w=>w.id!==id);
 const next=available(p,item.type,other)?p:firstFree(dims.w,dims.h,other.flatMap(w=>w.placement?[w.placement]:[]));
 return next?current.map(w=>w.id===id?{...w,size,placement:next}:w):widgets;
}
export function gridStyle(p:Placement){return {gridColumn:(p.x+1)+' / span '+p.w,gridRow:(p.y+1)+' / span '+p.h}}
export function endRow(widgets:Widget[]){return Math.max(0,...widgets.map(w=>w.placement?w.placement.y+w.placement.h:0))}

// Preview and commit share this planner. Push only colliding cards downward,
// preserving each neighbor's width, height and column. Never partially commit.
export function planPlacement(widgets:Widget[],item:Widget,p:Placement,push=false):Widget[]|null{
 if(!valid(p,item.type))return null;
 const others=widgets.filter(w=>w.id!==item.id);
 if(!push){
  if(!available(p,item.type,others))return null;
  const placed={...item,placement:p};
  return widgets.some(w=>w.id===item.id)?widgets.map(w=>w.id===item.id?placed:w):[...widgets,placed];
 }
 const placed:Widget[]=[{...item,placement:p}];
 const sorted=[...others].sort((a,b)=>(a.placement?.y??0)-(b.placement?.y??0)||(a.placement?.x??0)-(b.placement?.x??0)||a.id.localeCompare(b.id));
 for(const w of sorted){
  if(!w.placement)return null;
  const next={...w.placement};
  for(;;){
   const collisions=placed.flatMap(o=>o.placement&&overlap(o.placement,next)?[o.placement]:[]);
   if(!collisions.length)break;
   next.y=Math.max(...collisions.map(o=>o.y+o.h));
   if(!valid(next,w.type))return null;
  }
  placed.push({...w,placement:next});
 }
 const byId=new Map(placed.map(w=>[w.id,w]));
 return (widgets.some(w=>w.id===item.id)?widgets:[...widgets,item]).map(w=>byId.get(w.id)!);
}
export function compactVertical(widgets:Widget[]):Widget[]{
 const sorted=[...widgets].sort((a,b)=>(a.placement?.y??0)-(b.placement?.y??0)||(a.placement?.x??0)-(b.placement?.x??0)||a.id.localeCompare(b.id));
 const placed:Widget[]=[];
 for(const w of sorted){
  if(!w.placement)return widgets;
  const p={...w.placement};
  // Check both settled and unprocessed widgets: do not jump across a card.
  const others=[...placed,...sorted.slice(placed.length+1)];
  while(p.y>0&&available({...p,y:p.y-1},w.type,others))p.y--;
  placed.push({...w,placement:p});
 }
 const byId=new Map(placed.map(w=>[w.id,w]));
 return widgets.map(w=>byId.get(w.id)!);
}
export function displaced(before:Widget[],after:Widget[],except:string){
 return after.filter(w=>w.id!==except&&before.some(o=>o.id===w.id&&o.placement?.y!==w.placement?.y));
}
