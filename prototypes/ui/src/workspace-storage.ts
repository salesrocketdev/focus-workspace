import {readStorage,writeStorage,type Phase,type FocusPreferences} from './preferences-model';
import {initialTasks,initialCategories,initialBooks,initialContext,type Task,type Category,type Book,type FocusContext} from './activity-model';
import {initialRecords,type FocusRecord,type SessionMode} from './history-model';
import {validBlocks,contextExists,type FocusBlock} from './planning-model';
export const WORKSPACE_KEY='focus-workspace:v4:workspace';
export interface TimerSnapshot {mode:SessionMode;phase:Phase;cycle:number;duration:number;seconds:number;running:boolean;startedAt:number;context:FocusContext;readingId:string;plannedId?:string}
export interface WorkspaceSnapshot {version:1;timer:TimerSnapshot;tasks:Task[];categories:Category[];books:Book[];records:FocusRecord[];blocks?:FocusBlock[]}
const integer=(v:unknown,min=0,max=Number.MAX_SAFE_INTEGER):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const string=(v:unknown):v is string=>typeof v==='string'&&v.length>0;
function contextValid(v:FocusContext|undefined){return !!v&&string(v.id)&&string(v.title)&&string(v.label)&&(v.kind==='reading'?v.label==='Leitura':(v.kind==='activity'||v.kind==='task')&&string(v.categoryId))}
export function validWorkspace(value:unknown):value is WorkspaceSnapshot{
 if(!value||typeof value!=='object')return false;
 const v=value as Partial<WorkspaceSnapshot>,t=v.timer;
 return v.version===1&&!!t&&['Pomodoro','Livre'].includes(t.mode)&&['focus','short','long'].includes(t.phase)&&integer(t.cycle,0,12)&&integer(t.duration,1,7200)&&integer(t.seconds)&&typeof t.running==='boolean'&&integer(t.startedAt)&&(!t.running||t.startedAt>0)&&contextValid(t.context)&&typeof t.readingId==='string'&&
 Array.isArray(v.tasks)&&v.tasks.every(x=>x&&integer(x.id)&&string(x.title)&&typeof x.done==='boolean'&&string(x.categoryId)&&(x.priority===undefined||typeof x.priority==='boolean')&&(x.estimate===undefined||integer(x.estimate,1,20)))&&
 Array.isArray(v.categories)&&v.categories.every(x=>x&&string(x.id)&&string(x.name)&&['blue','lavender','green','orange'].includes(x.tone))&&
 Array.isArray(v.books)&&v.books.every(x=>x&&string(x.id)&&string(x.title)&&string(x.author)&&integer(x.pages,1,10000)&&integer(x.page,0,x.pages)&&(!x.chapters||Array.isArray(x.chapters)&&x.chapters.every(c=>c&&string(c.id)&&string(c.title)&&typeof c.done==='boolean')))&&
 Array.isArray(v.records)&&v.records.every(x=>x&&string(x.id)&&string(x.day)&&string(x.title)&&string(x.categoryId)&&string(x.category)&&string(x.time)&&integer(x.seconds)&&['Pomodoro','Livre'].includes(x.mode)&&['completed','interrupted'].includes(x.status)&&['fixture','session'].includes(x.origin)&&(x.taskId===undefined||integer(x.taskId,1))&&(x.plannedId===undefined||string(x.plannedId)))&&
 (t.context.kind!=='reading'||v.books.some(b=>b.id===t.context.id))&&(!t.readingId||v.books.some(b=>b.id===t.readingId))&&
 (v.blocks===undefined||validBlocks(v.blocks)&&v.blocks.every(b=>contextExists(b.context,v.tasks!,v.categories!,v.books!)))&&(t.plannedId===undefined||string(t.plannedId)&&v.blocks?.some(b=>b.id===t.plannedId)===true);
}
export function loadWorkspace(prefs:FocusPreferences):WorkspaceSnapshot{
 const saved=readStorage(WORKSPACE_KEY);
 if(validWorkspace(saved)){
  const t=saved.timer;
  if(t.running){const elapsed=Math.max(0,Math.floor((Date.now()-t.startedAt)/1000));return {...saved,timer:{...t,seconds:t.mode==='Livre'?elapsed:Math.max(0,t.duration-elapsed)}}}
  return saved;
 }
 return {version:1,timer:{mode:'Pomodoro',phase:'focus',cycle:0,duration:prefs.focus,seconds:prefs.focus,running:false,startedAt:0,context:initialContext,readingId:initialBooks[0].id},tasks:initialTasks,categories:initialCategories,books:initialBooks,records:initialRecords};
}
export function saveWorkspace(value:WorkspaceSnapshot){return writeStorage(WORKSPACE_KEY,value)}
