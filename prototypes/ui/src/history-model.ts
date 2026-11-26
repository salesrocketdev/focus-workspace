import { DEMO_DAY,addDays } from './calendar-model';
import type { FocusContext } from './activity-model';

export type SessionStatus='completed'|'interrupted';
export type SessionMode='Pomodoro'|'Livre';
export interface FocusRecord{
 id:string;day:string;time:string;title:string;categoryId:string;category:string;seconds:number;mode:SessionMode;status:SessionStatus;origin:'fixture'|'session';
}
const fixtures:[number,string,string,string,string,number,SessionMode,SessionStatus][]=[
 [0,'09:00','Revisar documentação','work','Trabalho',25,'Pomodoro','completed'],
 [0,'10:00','Clean Architecture','reading','Leitura',30,'Pomodoro','completed'],
 [0,'11:45','Estudar arquitetura','study','Estudos',25,'Pomodoro','completed'],
 [0,'13:00','Preparar apresentação','work','Trabalho',30,'Pomodoro','completed'],
 [0,'15:00','Projeto pessoal','personal','Projetos pessoais',25,'Livre','completed'],
 [-1,'09:00','Desenvolvimento','work','Trabalho',50,'Pomodoro','completed'],
 [-1,'13:00','Leitura','reading','Leitura',27,'Livre','completed'],
 [-1,'15:00','Estudos','study','Estudos',25,'Pomodoro','completed'],
 [-2,'10:00','Projeto pessoal','personal','Projetos pessoais',75,'Livre','completed'],
 [-3,'10:00','Estudos','study','Estudos',120,'Livre','completed'],
 [-4,'10:00','Leitura','reading','Leitura',50,'Pomodoro','completed'],
 [-5,'10:00','Trabalho','work','Trabalho',85,'Livre','completed'],
 [-6,'10:00','Trabalho','work','Trabalho',65,'Livre','completed'],
 [-9,'11:00','Revisão','work','Trabalho',18,'Pomodoro','interrupted'],
 [-15,'14:00','Leitura','reading','Leitura',60,'Livre','completed'],
 [-22,'15:00','Projeto pessoal','personal','Projetos pessoais',45,'Livre','completed'],
];
export const initialRecords:FocusRecord[]=fixtures.map(([offset,time,title,categoryId,category,minutes,mode,status],i)=>({id:'fixture-'+i,day:addDays(DEMO_DAY,offset),time,title,categoryId,category,seconds:minutes*60,mode,status,origin:'fixture'}));
export function recordSession(context:FocusContext,seconds:number,mode:SessionMode,status:SessionStatus):FocusRecord{
 return {id:crypto.randomUUID(),day:DEMO_DAY,time:new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date()),title:context.title,categoryId:context.kind==='reading'?'reading':context.categoryId,category:context.label,seconds:Math.floor(seconds),mode,status,origin:'session'};
}
export const totalSeconds=(records:FocusRecord[])=>records.reduce((n,r)=>n+r.seconds,0);
export function durationLabel(seconds:number){
 const h=Math.floor(seconds/3600),m=Math.floor(seconds/60)%60;
 if(h)return h+'h'+(m?' '+m+'min':'');
 if(m)return m+' min';
 return Math.floor(seconds)+' s';
}
export function periodDays(days:number){return Array.from({length:days},(_,i)=>addDays(DEMO_DAY,i-days+1))}
export function filterPeriod(records:FocusRecord[],days:number){const from=addDays(DEMO_DAY,1-days);return records.filter(r=>r.day>=from&&r.day<=DEMO_DAY)}
export function dailyTotals(records:FocusRecord[],days:number){return periodDays(days).map(day=>({day,seconds:totalSeconds(records.filter(r=>r.day===day))}))}
export function categoryTotals(records:FocusRecord[]){
 const groups=new Map<string,{id:string;label:string;seconds:number}>();
 for(const r of records){const old=groups.get(r.categoryId);groups.set(r.categoryId,{id:r.categoryId,label:r.category,seconds:(old?.seconds??0)+r.seconds})}
 return [...groups.values()].sort((a,b)=>b.seconds-a.seconds||a.label.localeCompare(b.label));
}
export function streak(records:FocusRecord[]){const days=new Set(records.filter(r=>r.seconds>0).map(r=>r.day));let n=0;while(days.has(addDays(DEMO_DAY,-n)))n++;return n}
export function newest(records:FocusRecord[]){return [...records].sort((a,b)=>b.day.localeCompare(a.day)||(a.origin!==b.origin?(a.origin==='session'?-1:1):b.time.localeCompare(a.time)))}
