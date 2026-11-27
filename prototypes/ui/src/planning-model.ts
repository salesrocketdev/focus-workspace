import {calendarEvents,eventsOn,fullDay,timeLabel,type CalendarEvent} from './calendar-model';
import type {FocusContext,Task,Category,Book} from './activity-model';
import type {FocusRecord} from './history-model';
export type FocusBlock={id:string;day:string;start:number;end:number;context:FocusContext};
export const isDay=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
export function validBlock(v:unknown):v is FocusBlock{
 if(!v||typeof v!=='object')return false;
 const b=v as FocusBlock,c=b.context;
 return typeof b.id==='string'&&b.id.length>0&&b.id.length<=100&&isDay(b.day)&&Number.isInteger(b.start)&&Number.isInteger(b.end)&&b.start>=540&&b.end<=1080&&b.end-b.start>=5&&b.end-b.start<=120&&!!c&&typeof c.id==='string'&&!!c.id&&typeof c.title==='string'&&!!c.title&&typeof c.label==='string'&&!!c.label&&(c.kind==='reading'?c.label==='Leitura':(c.kind==='task'||c.kind==='activity')&&typeof c.categoryId==='string'&&!!c.categoryId);
}
export function plannedEvent(b:FocusBlock):CalendarEvent{return {id:b.id,day:b.day,title:b.context.title,start:b.start,end:b.end,provider:'local-focus',color:'orange'}}
export function conflict(block:FocusBlock,blocks:FocusBlock[]){return eventsOn(block.day,[...calendarEvents,...blocks.filter(b=>b.id!==block.id).map(plannedEvent)]).some(e=>e.start<block.end&&e.end>block.start)}
export function validBlocks(v:unknown):v is FocusBlock[]{return Array.isArray(v)&&v.length<=2000&&v.every(validBlock)&&new Set(v.map(b=>b.id)).size===v.length&&v.every(b=>!conflict(b,v))}
export function blockDone(b:FocusBlock,records:FocusRecord[]){return records.some(r=>r.origin==='session'&&r.plannedId===b.id&&r.status==='completed')}
export function taskPomodoros(t:Task,records:FocusRecord[]){return records.filter(r=>r.origin==='session'&&r.taskId===t.id&&r.mode==='Pomodoro'&&r.status==='completed').length}
export function contextExists(c:FocusContext,tasks:Task[],categories:Category[],books:Book[]){return c.kind==='reading'?books.some(b=>b.id===c.id):categories.some(x=>x.id===c.categoryId)&&(c.kind==='activity'||tasks.some(t=>String(t.id)===c.id))}
export function blockLabel(b:FocusBlock){return fullDay(b.day)+' · '+timeLabel(b.start)+' – '+timeLabel(b.end)}
