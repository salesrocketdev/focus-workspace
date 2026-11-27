import {useState,type KeyboardEvent} from 'react';
import {ChevronLeft,ChevronRight,ChartNoAxesColumn,ChartNoAxesCombined} from 'lucide-react';
import {dateLabel,DEMO_DAY} from './calendar-model';
import {durationLabel} from './history-model';
type Day={day:string;seconds:number;count:number};
type Group={id:string;label:string;seconds:number};
const shortDate=(day:string)=>dateLabel(day,{day:'numeric',month:'numeric'});
const longDate=(day:string)=>dateLabel(day,{day:'numeric',month:'long'});
const sessionLabel=(n:number)=>n+' '+(n===1?'sessão':'sessões');
function changeLabel(value:number,previous:number|undefined){
 if(previous===undefined||previous===0)return 'Sem base de comparação';
 const delta=Math.round((value-previous)/previous*100);
 return (delta>0?'+':'')+delta+'% vs. dia anterior';
}
function navigatePoint(e:KeyboardEvent<HTMLButtonElement>,index:number,count:number,onSelect:(index:number)=>void){
 let next=index;
 if(e.key==='ArrowRight'||e.key==='ArrowDown')next=Math.min(count-1,index+1);
 else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=Math.max(0,index-1);
 else if(e.key==='Home')next=0;
 else if(e.key==='End')next=count-1;
 else return;
 e.preventDefault();onSelect(next);
 const parent=e.currentTarget.parentElement;parent?.querySelectorAll<HTMLButtonElement>('button[data-chart-point]')[next]?.focus({preventScroll:true});
}
export function FocusTrend({days}:{days:Day[]}){
 const [selected,setSelected]=useState<string|null>(null),[hover,setHover]=useState<string|null>(null),[kind,setKind]=useState<'bar'|'line'>('bar');
 const last=Math.max(0,days.length-1);
 const selectedIndex=days.findIndex(d=>d.day===selected);
 const current=selectedIndex<0?last:selectedIndex;
 const hoverIndex=days.findIndex(d=>d.day===hover);
 const index=hoverIndex<0?current:hoverIndex;
 const day=days[index];
 const max=Math.max(3600,Math.ceil(Math.max(0,...days.map(d=>d.seconds))/1800)*1800);
 const pick=(i:number)=>{setSelected(days[i].day);setHover(null)};
 const points=days.map((d,i)=>[(i+.5)/days.length*600,140-d.seconds/max*140]);
 const line=points.map(p=>p.join(',')).join(' ');
 const area=points.length?points[0][0]+',140 '+line+' '+points[points.length-1][0]+',140':'';
 return <div className="focus-trend">
 <div className="chart-heading">
  <div className="chart-tooltip" role="status" aria-label="Detalhes do dia">{day&&<><small className="chart-date">{longDate(day.day)}{day.day===DEMO_DAY?' · Hoje':''}</small><strong>{durationLabel(day.seconds)}</strong><div className="chart-meta"><small>{sessionLabel(day.count)}</small><small className="chart-comparison">{changeLabel(day.seconds,days[index-1]?.seconds)}</small></div></>}</div>
  <div className="chart-type" role="group" aria-label="Tipo de gráfico"><button type="button" aria-label="Barras" title="Barras" aria-pressed={kind==='bar'} onClick={()=>setKind('bar')}><ChartNoAxesColumn size={17}/></button><button type="button" aria-label="Linha" title="Linha" aria-pressed={kind==='line'} onClick={()=>setKind('line')}><ChartNoAxesCombined size={17}/></button></div>
 </div>
 <div className={'history-bars '+(days.length>7?'dense-bars':'')}>
  <div className="history-axis" aria-hidden="true"><span>{Math.round(max/60)}m</span><span>{Math.round(max/120)}m</span><span>0</span></div>
  <div className={'history-plot interactive-plot plot-kind-'+kind} role="group" aria-label="Tempo de foco por dia" onPointerLeave={()=>setHover(null)}>
  {kind==='line'&&<svg className="chart-line" viewBox="0 0 600 140" preserveAspectRatio="none" aria-hidden="true"><polygon points={area} fill="var(--field-selected)"/><polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/></svg>}
  {days.map((d,i)=><button type="button" data-chart-point key={d.day} className="history-bar-column" aria-pressed={i===index} aria-label={longDate(d.day)+': '+durationLabel(d.seconds)+', '+sessionLabel(d.count)} tabIndex={i===index?0:-1} onPointerEnter={e=>{if(e.pointerType==='mouse'&&window.matchMedia('(hover: hover)').matches)setHover(d.day)}} onFocus={()=>pick(i)} onClick={()=>pick(i)} onKeyDown={e=>navigatePoint(e,i,days.length,pick)}><span className="history-bar-track"><i style={{height:d.seconds/max*100+'%'}} className={d.day===DEMO_DAY?'today-bar':''}/>{kind==='line'&&<span className="chart-dot" style={{bottom:d.seconds/max*100+'%'}}/>}</span><small aria-hidden="true">{days.length<=7||i%5===0||i===days.length-1?shortDate(d.day):''}</small></button>)}
  </div>
 </div>
 <div className="chart-point-controls"><small><span className="chart-key"/> Tempo de foco</small><div className="chart-day-navigation"><button type="button" aria-label="Dia anterior no gráfico" disabled={current===0} onClick={()=>pick(current-1)}><ChevronLeft size={17}/></button><small>{day?shortDate(day.day):'—'}</small><button type="button" aria-label="Próximo dia no gráfico" disabled={current>=last} onClick={()=>pick(current+1)}><ChevronRight size={17}/></button></div></div>
 </div>
}
export function CategoryChart({groups,total,color}:{groups:Group[];total:number;color:(id:string)=>string}){
 const [chosen,setChosen]=useState<string|null>(null),[hover,setHover]=useState<string|null>(null);
 const selected=groups.find(g=>g.id===(hover??chosen))??groups[0];
 if(!selected||total<=0)return null;
 let offset=0;
 const arcs=groups.map(g=>{const size=g.seconds/total*100;const start=offset;offset+=size;return {...g,size,start}});
 return <div className="category-chart"><div className="category-donut" onPointerLeave={()=>setHover(null)}><svg viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="54" fill="none" stroke="var(--ui-line)" strokeWidth="19"/>{arcs.map(g=><circle key={g.id} className="category-arc" cx="70" cy="70" r="54" fill="none" stroke={color(g.id)} strokeWidth={selected.id===g.id?23:17} opacity={selected.id===g.id?1:.65} pathLength="100" strokeDasharray={g.size+' '+(100-g.size)} strokeDashoffset={-g.start} transform="rotate(-90 70 70)" onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(g.id)}} onClick={()=>{setChosen(g.id);setHover(null)}}/>)}</svg><div className="category-center" role="status" aria-label="Detalhes da categoria"><small>{selected.label}</small><strong>{Math.round(selected.seconds/total*100)}%</strong><small>{durationLabel(selected.seconds)}</small></div></div>
 <div className="history-legend interactive-legend" role="group" aria-label="Categorias do gráfico" onPointerLeave={()=>setHover(null)}>{groups.map(g=><button type="button" key={g.id} aria-pressed={selected.id===g.id} onClick={()=>{setChosen(g.id);setHover(null)}} onFocus={()=>{setChosen(g.id);setHover(null)}} onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(g.id)}}><i style={{background:color(g.id)}}/><span>{g.label}</span><b>{durationLabel(g.seconds)}</b><small>{Math.round(g.seconds/total*100)}%</small></button>)}</div></div>
}
export function GoalChart({seconds,goal}:{seconds:number;goal:number}){
 const [expanded,setExpanded]=useState(false);
 const pct=Math.min(100,Math.round(seconds/Math.max(1,goal)*100));
 const remaining=Math.max(0,goal-seconds);
 return <div className="goal-chart"><button className="history-goal goal-chart-button" type="button" aria-label={pct+'% da meta diária. Ver detalhes'} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="48" fill="none" stroke="var(--ring-track)" strokeWidth="10"/><circle className="goal-chart-progress" cx="60" cy="60" r="48" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" pathLength="100" strokeDasharray="100 100" strokeDashoffset={100-pct} transform="rotate(-90 60 60)"/></svg><span className="goal-center"><strong>{pct}%</strong><small>{durationLabel(seconds)} de {durationLabel(goal)}</small></span></button><p className="history-goal-caption">{remaining===0?'Meta alcançada!':durationLabel(remaining)+' restantes para a meta'}</p>{expanded&&<div className="goal-tooltip" role="status"><small>Realizado: {durationLabel(seconds)}</small><small>Meta: {durationLabel(goal)}</small><small>Restante: {durationLabel(remaining)}</small></div>}</div>
}
export function MiniTrend({days,onSelect}:{days:Day[];onSelect:(day:Day|null)=>void}){
 const [active,setActive]=useState<string|null>(null);
 const max=Math.max(1,...days.map(d=>d.seconds));
 const pick=(i:number)=>{setActive(days[i].day);onSelect(days[i])};
 return <div className="bars mini-trend" role="group" aria-label="Resumo de foco dos últimos dias" onPointerLeave={()=>{setActive(null);onSelect(null)}}>{days.map((d,i)=><button type="button" data-chart-point key={d.day} aria-pressed={active===d.day} aria-label={shortDate(d.day)+': '+durationLabel(d.seconds)+', '+sessionLabel(d.count)} onPointerEnter={e=>{if(e.pointerType==='mouse')pick(i)}} onFocus={()=>pick(i)} onBlur={()=>{setActive(null);onSelect(null)}} onClick={()=>pick(i)} onKeyDown={e=>navigatePoint(e,i,days.length,pick)}><i style={{height:d.seconds/max*100+'%'}}/></button>)}</div>
}
