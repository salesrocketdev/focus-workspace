import { useState } from 'react';
import { CalendarDays,ChevronLeft,ChevronRight,Clock,Timer,CalendarRange,Info } from 'lucide-react';
import { Button,Dialog } from './ui';
import { ProviderIcon,ProviderLabel } from './provider-icons';
import { DEMO_DAY,addDays,calendarEvents,dateLabel,dayNumber,eventsOn,freeWindows,fullDay,monthDays,shiftMonth,timeLabel,weekDays,type CalendarEvent,type CalendarProvider,type CalendarView } from './calendar-model';

const sources:CalendarProvider[]=['google-calendar','outlook'];
const views:{id:CalendarView;label:string}[]=[{id:'day',label:'Dia'},{id:'week',label:'Semana'},{id:'month',label:'Mês'}];
const weekdays=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
function EventButton({event,onSelect,compact=false}:{event:CalendarEvent;onSelect:()=>void;compact?:boolean}){
 return <button type="button" className={'calendar-event '+event.color+(compact?' compact-event':'')} onClick={onSelect} aria-label={event.title+', '+timeLabel(event.start)+' a '+timeLabel(event.end)}>
 <time>{timeLabel(event.start)}{!compact&&<small>{timeLabel(event.end)}</small>}</time>
 <span className="calendar-event-copy"><b>{event.title}</b>{!compact&&<small>{event.provider==='outlook'?'Outlook':'Google Agenda'} · {event.end-event.start} min</small>}</span>
 <ProviderIcon provider={event.provider} size={compact?14:20}/>
 </button>;
}
function DayEvents({day,items,onSelect}:{day:string;items:CalendarEvent[];onSelect:(event:CalendarEvent)=>void}){
 const list=eventsOn(day,items);
 return <section className="calendar-day-list"><header><h2>{fullDay(day)}</h2><span>{list.length} compromisso{list.length===1?'':'s'}</span></header>
 <div className="agenda-list calendar-event-list">{list.length?list.map(e=><EventButton key={e.id} event={e} onSelect={()=>onSelect(e)}/>):<div className="calendar-empty"><CalendarDays size={30} strokeWidth={1.5}/><b>Nenhum compromisso visível</b><small>Escolha outra data ou altere os filtros.</small></div>}</div></section>;
}
export function CalendarPage(){
 const [day,setDay]=useState(DEMO_DAY);
 const [view,setView]=useState<CalendarView>('day');
 const [active,setActive]=useState<CalendarProvider[]>(sources);
 const [selected,setSelected]=useState<CalendarEvent|null>(null);
 const items=calendarEvents.filter(e=>active.includes(e.provider));
 const week=weekDays(day),month=monthDays(day);
 const label=view==='day'?dateLabel(day,{day:'numeric',month:'long',year:'numeric'}):view==='month'?dateLabel(day,{month:'long',year:'numeric'}):dateLabel(week[0],{day:'numeric',month:'short'})+' – '+dateLabel(week[6],{day:'numeric',month:'short',year:'numeric'});
 const slots=freeWindows(day,calendarEvents);
 function step(n:number){setDay(d=>view==='month'?shiftMonth(d,n):addDays(d,n*(view==='week'?7:1)))}
 function toggle(source:CalendarProvider){setActive(old=>old.includes(source)?old.filter(s=>s!==source):[...old,source])}
 return <div className="calendar-page">
  <section className="calendar-surface">
   <div className="calendar-toolbar">
    <div className="calendar-date-controls"><Button variant="secondary" size="sm" onClick={()=>setDay(DEMO_DAY)}>Hoje (demo)</Button><div className="calendar-arrows"><button className="ui-icon-button" aria-label="Período anterior" onClick={()=>step(-1)}><ChevronLeft size={18}/></button><button className="ui-icon-button" aria-label="Próximo período" onClick={()=>step(1)}><ChevronRight size={18}/></button></div><h2 className="calendar-period" aria-live="polite">{label}</h2></div>
    <div className="calendar-view-switch" role="group" aria-label="Visualização da agenda">{views.map(v=><button key={v.id} aria-pressed={view===v.id} onClick={()=>setView(v.id)}>{v.label}</button>)}</div>
   </div>
   <div className="calendar-filters"><span><CalendarRange size={15}/> Calendários</span>{sources.map(source=><label key={source}><input type="checkbox" checked={active.includes(source)} onChange={()=>toggle(source)}/><ProviderLabel provider={source} size={16}/></label>)}<small className="calendar-demo"><Info size={13}/> Dados de demonstração</small></div>
   {view==='day'&&<DayEvents day={day} items={items} onSelect={setSelected}/>}
   {view==='week'&&<><div className="calendar-week" aria-label="Calendário semanal">{week.map(d=><div key={d} className={'calendar-week-column '+(d===day?'selected-day':'')}><button className="calendar-week-day" aria-label={fullDay(d)+', '+eventsOn(d,items).length+' compromisso(s)'} aria-pressed={d===day} onClick={()=>setDay(d)}><small>{dateLabel(d,{weekday:'short'})}</small><b>{dayNumber(d)}</b>{d===DEMO_DAY&&<span className="today-dot"/>}<span className="week-mobile-count" aria-hidden="true">{eventsOn(d,items).length?eventsOn(d,items).length+' evt.':'—'}</span></button><div className="calendar-week-events">{eventsOn(d,items).map(e=><EventButton key={e.id} event={e} compact onSelect={()=>setSelected(e)}/>)}</div></div>)}</div><DayEvents day={day} items={items} onSelect={setSelected}/></>}
   {view==='month'&&<><div className="calendar-month" aria-label="Calendário mensal">{weekdays.map(d=><div className="calendar-weekday" key={d}>{d}</div>)}{month.map(d=>{const list=eventsOn(d,items);return <button key={d} className={'calendar-month-day '+(d.slice(0,7)!==day.slice(0,7)?'outside-month ':'')+(d===day?'selected-day':'')} aria-label={fullDay(d)+', '+list.length+' compromisso(s)'} aria-pressed={d===day} onClick={()=>setDay(d)}><span className="month-day-number">{dayNumber(d)}{d===DEMO_DAY&&<i/>}</span><span className="month-events">{list.slice(0,2).map(e=><span className={'month-event '+e.color} key={e.id}><i/><span>{timeLabel(e.start)} {e.title}</span></span>)}{list.length>2&&<small>+{list.length-2}</small>}</span></button>})}</div><DayEvents day={day} items={items} onSelect={setSelected}/></>}
  </section>
  <aside className="calendar-focus-panel"><header><span className="calendar-focus-icon"><Timer size={21} strokeWidth={1.7}/></span><div><h2>Espaços para foco</h2><p>Intervalos livres de pelo menos 25 min.</p></div></header><small>Entre 09:00 e 18:00 · todos os calendários da demo, inclusive os ocultos.</small><div className="calendar-slots">{slots.length?slots.map(s=><div className="calendar-slot" key={s.start}><Clock size={16}/><span><b>{timeLabel(s.start)} – {timeLabel(s.end)}</b><small>{s.end-s.start} min disponíveis</small></span></div>):<p className="muted">Nenhum intervalo livre neste período.</p>}</div><small>Prévia de disponibilidade, sem criar eventos ou iniciar sessões.</small></aside>
  {selected&&<Dialog title={selected.title} description={fullDay(selected.day)} onDismiss={()=>setSelected(null)}><div className="calendar-detail"><div><Clock size={18}/><span>{timeLabel(selected.start)} – {timeLabel(selected.end)} · {selected.end-selected.start} min</span></div><ProviderLabel provider={selected.provider} size={20}/><p>Compromisso simulado. Não há link real de reunião ou conexão ativa com o provedor.</p></div><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setSelected(null)}>Fechar</Button></footer></Dialog>}
 </div>;
}
