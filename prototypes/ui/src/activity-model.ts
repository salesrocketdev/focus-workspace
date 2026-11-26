import { tasksInitial } from './model';

export interface Category { id:string; name:string; tone:'blue'|'lavender'|'green'|'orange' }
export interface Task { id:number; title:string; done:boolean; categoryId:string }
export interface Book { id:string; title:string; author:string; pages:number; page:number }
export type FocusContext =
 | {kind:'reading';id:string;title:string;label:'Leitura'}
 | {kind:'task'|'activity';id:string;title:string;label:string;categoryId:string};
export const initialCategories:Category[]=[
 {id:'work',name:'Trabalho',tone:'blue'},
 {id:'study',name:'Estudos',tone:'lavender'},
 {id:'reading',name:'Leitura',tone:'green'},
 {id:'personal',name:'Projetos pessoais',tone:'orange'},
];
export const initialTasks:Task[]=tasksInitial.map((t,i)=>({...t,categoryId:i===2?'reading':i===4?'personal':'work'}));
export const initialBooks:Book[]=[
 {id:'architecture',title:'Clean Architecture',author:'Robert C. Martin',pages:432,page:72},
 {id:'atomic',title:'Hábitos Atômicos',author:'James Clear',pages:320,page:0},
];
export const readingContext=(book:Book):FocusContext=>({kind:'reading',id:book.id,title:book.title,label:'Leitura'});
export const initialContext=readingContext(initialBooks[0]);
export const progressOf=(book:Book)=>Math.round(book.page/book.pages*100);
export const sameContext=(a:FocusContext,b:FocusContext)=>a.kind===b.kind&&a.id===b.id;
export function nextTaskId(tasks:Task[]){return Math.max(0,...tasks.map(t=>t.id))+1}
