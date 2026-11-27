import { useState } from 'react';
import { CalendarDays,ChevronLeft,ChevronRight,Clock,Timer,CalendarRange,Info,Eye,EyeOff,Plus,Play,Trash2 } from 'lucide-react';
import { Button,Dialog } from './ui';
import { ProviderIcon,ProviderLabel } from './provider-icons';
import { DEMO_DAY,addDays,calendarEvents,dateLabel,dayNumber,eventsOn,freeWindows,fullDay,monthDays,shiftMonth,timeLabel,weekDays,type CalendarEvent,type CalendarProvider,type CalendarView } from './calendar-model';

import {PlanFocusDialog} from './planning-dialog';
import {plannedEvent,blockDone,blockLabel,type FocusBlock} from './planning-model';
import type {Task,Category,Book} from './activity-model';
import type {FocusRecord} from './history-model';
const sources:CalendarProvider[]=['google-calendar','outlook'];
const views:{id:CalendarView;label:string}[]=[{id:'day',label:'Dia'},{id:'week',label:'Semana'},{id:'month',label:'Mês'}];
const weekdays=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
function EventButton({event,onSelect,compact=false}:{event:CalendarEvent;onSelect:()=>void;compact?:boolean}){
 return <button type="button" className={'calendar-event '+event.color+(compact?' compact-event':'')} onClick={onSelect} aria-label={event.title+', '+timeLabel(event.start)+' a '+timeLabel(event.end)}>
 <time>{timeLabel(event.start)}{!compact&&<small>{timeLabel(event.end)}</small>}</time>
 <span className="calendar-event-copy"><b>{event.title}</b>{!compact&&<small>{event.provider==='local-focus'?'Foco planejado':event.provider==='outlook'?'Outlook':'Google Agenda'} · {event.end-event.start} min</small>}</span>
 {event.provider==='local-focus'?<Timer size={compact?14:20}/>:<ProviderIcon provider={event.provider} size={compact?14:20}/>}
 </button>;
}
function DayEvents({day,items,onSelect}:{day:string;items:CalendarEvent[];onSelect:(event:CalendarEvent)=>void}){
 const list=eventsOn(day,items);
 return <section className="calendar-day-list"><header><h2>{fullDay(day)}</h2><span>{list.length} compromisso{list.length===1?'':'s'}</span></header>
 <div className="agenda-list calendar-event-list">{list.length?list.map(e=><EventButton key={e.id} event={e} onSelect={()=>onSelect(e)}/>):<div className="calendar-empty"><CalendarDays size={30} strokeWidth={1.5}/><b>Nenhum compromisso visível</b><small>Escolha outra data ou altere os filtros.</small></div>}</div></section>;
}
export function CalendarPage({blocks=[],tasks=[],categories=[],books=[],records=[],preferredMinutes=25,initialTask,readOnly=false,activePlanId,onSave,onRemove,onPrepare}:{blocks?:FocusBlock[];tasks?:Task[];categories?:Category[];books?:Book[];records?:FocusRecord[];preferredMinutes?:number;initialTask?:number;readOnly?:boolean;activePlanId?:string;onSave?:(b:FocusBlock)=>string|null;onRemove?:(id:string)=>void;onPrepare?:(b:FocusBlock)=>void}={}){
 const [day,setDay]=useState(DEMO_DAY);
 const [view,setView]=useState<CalendarView>('day');
 const [active,setActive]=useState<CalendarProvider[]>(sources);
 const [selected,setSelected]=useState<CalendarEvent|null>(null);
 const [planSlot,setPlanSlot]=useState<{start:number;end:number}|null>(null);
 const [removeId,setRemoveId]=useState<string|null>(null);
 const [showPlanTask,setShowPlanTask]=useState(initialTask);
 const planned=blocks.map(plannedEvent),all=[...calendarEvents,...planned];
 const items=[...calendarEvents.filter(e=>e.provider!=='local-focus'&&active.includes(e.provider)),...planned];
 const selectedBlock=selected?.provider==='local-focus'?blocks.find(b=>b.id===selected.id):undefined;
 const week=weekDays(day),month=monthDays(day);
 const label=view==='day'?dateLabel(day,{day:'numeric',month:'long',year:'numeric'}):view==='month'?dateLabel(day,{month:'long',year:'numeric'}):dateLabel(week[0],{day:'numeric',month:'short'})+' – '+dateLabel(week[6],{day:'numeric',month:'short',year:'numeric'});
 const slots=freeWindows(day,all);
 function step(n:number){setDay(d=>view==='month'?shiftMonth(d,n):addDays(d,n*(view==='week'?7:1)))}
 function toggle(source:CalendarProvider){setActive(old=>old.includes(source)?old.filter(s=>s!==source):[...old,source])}
 return <div className="calendar-page">
  <section className="calendar-surface">
   <div className="calendar-toolbar">
    <div className="calendar-date-controls"><Button className="calendar-today" variant="secondary" size="sm" aria-label="Hoje (demo)" onClick={()=>setDay(DEMO_DAY)}>Hoje</Button><div className="calendar-arrows"><button className="ui-icon-button" aria-label="Período anterior" onClick={()=>step(-1)}><ChevronLeft size={18}/></button><button className="ui-icon-button" aria-label="Próximo período" onClick={()=>step(1)}><ChevronRight size={18}/></button></div><h2 className="calendar-period" aria-live="polite">{label}</h2></div>
    <div className="calendar-view-switch" role="group" aria-label="Visualização da agenda">{views.map(v=><button key={v.id} aria-pressed={view===v.id} onClick={()=>setView(v.id)}>{v.label}</button>)}</div>
   </div>
   <div className="calendar-filters calendar-source-panel"><div className="calendar-source-heading"><span><CalendarRange size={16}/> <b>Calendários</b></span><small>{active.length} de {sources.length} visíveis</small></div><div className="calendar-source-options" role="group" aria-label="Calendários visíveis">{sources.map(source=>{const visible=active.includes(source),name=source==='outlook'?'Microsoft Outlook':'Google Agenda';return <button type="button" key={source} className="calendar-source-button" aria-label={name} aria-pressed={visible} onClick={()=>toggle(source)}><span className="calendar-source-mark"><ProviderIcon provider={source} size={23}/></span><span className="calendar-source-copy"><b>{name}</b><small>{visible?'Visível':'Oculto'}</small></span><span className="calendar-source-eye" aria-hidden="true">{visible?<Eye size={17}/>:<EyeOff size={17}/>}</span></button>})}</div><small className="calendar-demo"><Info size={13}/> Dados de demonstração · altere apenas a visibilidade.</small></div>
   {view==='day'&&<DayEvents day={day} items={items} onSelect={setSelected}/>}
   {view==='week'&&<><div className="calendar-week" aria-label="Calendário semanal">{week.map(d=><div key={d} className={'calendar-week-column '+(d===day?'selected-day':'')}><button className="calendar-week-day" aria-label={fullDay(d)+', '+eventsOn(d,items).length+' compromisso(s)'} aria-pressed={d===day} onClick={()=>setDay(d)}><small>{dateLabel(d,{weekday:'short'})}</small><b>{dayNumber(d)}</b>{d===DEMO_DAY&&<span className="today-dot"/>}<span className="week-mobile-count" aria-hidden="true">{eventsOn(d,items).length?eventsOn(d,items).length+' evt.':'—'}</span></button><div className="calendar-week-events">{eventsOn(d,items).map(e=><EventButton key={e.id} event={e} compact onSelect={()=>setSelected(e)}/>)}</div></div>)}</div><DayEvents day={day} items={items} onSelect={setSelected}/></>}
   {view==='month'&&<><div className="calendar-month" aria-label="Calendário mensal">{weekdays.map(d=><div className="calendar-weekday" key={d}>{d}</div>)}{month.map(d=>{const list=eventsOn(d,items);return <button key={d} className={'calendar-month-day '+(d.slice(0,7)!==day.slice(0,7)?'outside-month ':'')+(d===day?'selected-day':'')} aria-label={fullDay(d)+', '+list.length+' compromisso(s)'} aria-pressed={d===day} onClick={()=>setDay(d)}><span className="month-day-number">{dayNumber(d)}{d===DEMO_DAY&&<i/>}</span><span className="month-events">{list.slice(0,2).map(e=><span className={'month-event '+e.color} key={e.id}><i/><span>{timeLabel(e.start)} {e.title}</span></span>)}{list.length>2&&<small>+{list.length-2}</small>}</span></button>})}</div><DayEvents day={day} items={items} onSelect={setSelected}/></>}
  </section>
  <aside className="calendar-focus-panel"><header><span className="calendar-focus-icon"><Timer size={21} strokeWidth={1.7}/></span><div><h2>Espaços para foco</h2><p>Intervalos livres de pelo menos 15 min.</p></div></header><small>Entre 09:00 e 18:00 · todos os calendários, inclusive os ocultos, e blocos locais.</small><div className="calendar-slots">{slots.length?slots.map(s=><button type="button" className="calendar-slot plan-slot-button" key={s.start} disabled={readOnly||!onSave} aria-label={'Planejar foco das '+timeLabel(s.start)+' às '+timeLabel(s.end)} onClick={()=>setPlanSlot(s)}><Clock size={16}/><span><b>{timeLabel(s.start)} – {timeLabel(s.end)}</b><small>{s.end-s.start} min disponíveis</small></span><Plus size={16} className="plan-slot-add"/></button>):<p className="muted">Nenhum intervalo livre neste período.</p>}</div>{showPlanTask!==undefined&&<small className="plan-task-hint">Escolha um intervalo para a tarefa selecionada.</small>}<small>Blocos locais não são enviados ao Google ou Outlook. Nenhuma sessão inicia automaticamente.</small></aside>
  {selected&&<Dialog title={selected.title} description={fullDay(selected.day)} onDismiss={()=>setSelected(null)}><div className="calendar-detail"><div><Clock size={18}/><span>{timeLabel(selected.start)} – {timeLabel(selected.end)} · {selected.end-selected.start} min</span></div>{selectedBlock?<><span className="plan-detail-tag"><Timer size={18}/> {blockDone(selectedBlock,records)?'Bloco concluído':'Foco planejado · local'}</span><p>{blockLabel(selectedBlock)}. Preparar agora usa a duração do bloco, sem alterar o ritmo padrão. O timer só inicia com sua confirmação.</p></>:selected.provider!=='local-focus'?<><ProviderLabel provider={selected.provider} size={20}/><p>Compromisso simulado. Não há link real de reunião ou conexão ativa com o provedor.</p></>:null}</div><footer className="dialog-actions">{selectedBlock&&<><Button variant="secondary" disabled={readOnly||activePlanId===selectedBlock.id} onClick={()=>{setRemoveId(selectedBlock.id);setSelected(null)}}><Trash2 size={15}/> Remover bloco</Button><Button disabled={readOnly||!onPrepare||blockDone(selectedBlock,records)} onClick={()=>{onPrepare?.(selectedBlock);setSelected(null)}}><Play size={15}/> Preparar agora</Button></>}<Button variant="secondary" onClick={()=>setSelected(null)}>Fechar</Button></footer></Dialog>}
  {planSlot&&onSave&&<PlanFocusDialog day={day} slot={planSlot} tasks={tasks} categories={categories} books={books} initialTask={showPlanTask} preferredMinutes={preferredMinutes} onSave={onSave} onDismiss={()=>{setPlanSlot(null);setShowPlanTask(undefined)}}/>}
  {removeId&&<Dialog title="Remover bloco de foco?" description="Remove apenas a reserva local. Sessões já registradas serão mantidas." onDismiss={()=>setRemoveId(null)}><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setRemoveId(null)}>Cancelar</Button><Button disabled={readOnly||activePlanId===removeId} onClick={()=>{onRemove?.(removeId);setRemoveId(null)}}>Remover bloco</Button></footer></Dialog>}
 </div>;
}
