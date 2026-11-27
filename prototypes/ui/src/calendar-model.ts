import { events } from './model';

export type CalendarProvider='google-calendar'|'outlook';
export type CalendarView='day'|'week'|'month';
export interface CalendarEvent {
 id:string; day:string; title:string; start:number; end:number;
 provider:CalendarProvider|'local-focus'; color:'lavender'|'blue'|'orange';
}
export const DEMO_DAY='2025-01-29';
const dayMs=86_400_000;
const date=(iso:string)=>new Date(iso+'T12:00:00Z');
const iso=(value:Date)=>value.toISOString().slice(0,10);
export const addDays=(day:string,n:number)=>iso(new Date(date(day).getTime()+n*dayMs));
export const weekStart=(day:string)=>addDays(day,-((date(day).getUTCDay()+6)%7));
export const weekDays=(day:string)=>Array.from({length:7},(_,i)=>addDays(weekStart(day),i));
export const monthStart=(day:string)=>day.slice(0,7)+'-01';
export function shiftMonth(day:string,n:number){
 const d=date(monthStart(day));d.setUTCMonth(d.getUTCMonth()+n);
 const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
 d.setUTCDate(Math.min(date(day).getUTCDate(),last));return iso(d);
}
export function monthDays(day:string){
 const start=weekStart(monthStart(day));return Array.from({length:42},(_,i)=>addDays(start,i));
}
export const dayNumber=(day:string)=>date(day).getUTCDate();
export const dateLabel=(day:string,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('pt-BR',{...options,timeZone:'UTC'}).format(date(day));
export const fullDay=(day:string)=>dateLabel(day,{weekday:'long',day:'numeric',month:'long'});
export function timeLabel(minutes:number){return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')}
const startOf=(time:string)=>{const [h,m]=time.split(':').map(Number);return h*60+m};
export const calendarEvents:CalendarEvent[]=[
 ...events.map((e,i)=>({id:'today-'+i,day:DEMO_DAY,title:e.title,start:startOf(e.time),end:startOf(e.time)+[30,45,60][i],provider:(e.provider==='Outlook'?'outlook':'google-calendar') as CalendarProvider,color:e.color})),
 {id:'mon-1',day:'2025-01-27',title:'Planejamento da semana',start:540,end:600,provider:'outlook',color:'blue'},
 {id:'tue-1',day:'2025-01-28',title:'Revisão de prioridades',start:630,end:660,provider:'google-calendar',color:'lavender'},
 {id:'thu-1',day:'2025-01-30',title:'Workshop de produto',start:600,end:690,provider:'outlook',color:'blue'},
 {id:'thu-2',day:'2025-01-30',title:'Revisão de entregas',start:840,end:870,provider:'google-calendar',color:'orange'},
 {id:'fri-1',day:'2025-01-31',title:'Retrospectiva',start:900,end:960,provider:'outlook',color:'blue'},
 {id:'feb-1',day:'2025-02-03',title:'Planejamento mensal',start:540,end:600,provider:'google-calendar',color:'lavender'},
];
export function eventsOn(day:string,items:CalendarEvent[]){return items.filter(e=>e.day===day).sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id))}
export function freeWindows(day:string,items:CalendarEvent[],start=540,end=1080){
 const intervals:{start:number;end:number}[]=[];let cursor=start;
 for(const e of eventsOn(day,items)){
  if(e.end<=start||e.start>=end)continue;
  const left=Math.max(start,e.start),right=Math.min(end,e.end);
  if(left-cursor>=15)intervals.push({start:cursor,end:left});
  cursor=Math.max(cursor,right);
 }
 if(end-cursor>=15)intervals.push({start:cursor,end});
 return intervals;
}
