import {WORKSPACE_KEY,loadWorkspace,validWorkspace,type WorkspaceSnapshot} from './workspace-storage';
import {PREFS_KEY,CONNECTIONS_KEY,ONBOARDING_KEY,providerKeys,loadPreferences,readStorage,type FocusPreferences} from './preferences-model';
import {STORAGE,catalogue,type Layouts,type Widget} from './model';
import {valid as validPlacement} from './grid-model';
import type {FocusRecord} from './history-model';

const prefix='focus-workspace:v4:';
export const NOTES_KEY=prefix+'notes';
const keys={workspace:WORKSPACE_KEY,preferences:PREFS_KEY,layouts:STORAGE,appearance:prefix+'appearance',notifications:prefix+'notifications',inbox:prefix+'inbox',shield:prefix+'distraction-shield',connections:CONNECTIONS_KEY,profile:ONBOARDING_KEY,notes:NOTES_KEY} as const;
type Key=keyof typeof keys;
type Data=Record<Key,unknown>&{workspace:WorkspaceSnapshot;preferences:FocusPreferences};
export interface Backup {format:'focora-backup';version:1;exportedAt:string;data:Data}
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const str=(x:unknown,max=4000):x is string=>typeof x==='string'&&x.length<=max;
const bool=(x:unknown)=>typeof x==='boolean';
const int=(x:unknown,min:number,max:number)=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=min&&x<=max;
const one=(x:unknown,values:readonly unknown[])=>values.includes(x);
const optional=(x:unknown,test:(v:unknown)=>boolean)=>x===undefined||test(x);
const time=(x:unknown)=>typeof x==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
function preferences(x:unknown):x is FocusPreferences {
 return object(x)&&int(x.focus,60,7200)&&int(x.short,60,1800)&&int(x.long,60,3600)&&int(x.cycles,1,12)&&int(x.goal,15,720)&&bool(x.autoBreak)&&bool(x.autoFocus)&&optional(x.keepAwake,bool);
}
function layouts(x:unknown):x is Layouts{
 if(!object(x))return false;
 const items=(v:unknown):v is Widget[]=>Array.isArray(v)&&v.length<=catalogue.length&&v.every(w=>object(w)&&str(w.id,80)&&catalogue.some(c=>c.type===w.type)&&one(w.size,['small','medium','large'])&&(w.placement===undefined||object(w.placement)&&validPlacement(w.placement as unknown as NonNullable<Widget['placement']>,w.type as Widget['type'])))&&new Set(v.map(w=>w.id)).size===v.length&&new Set(v.map(w=>w.type)).size===v.length;
 return items(x.desktop)&&items(x.mobile);
}
function workspace(x:unknown):x is WorkspaceSnapshot{
 if(!validWorkspace(x))return false;
 const unique=(v:unknown[])=>new Set(v).size===v.length;
 return x.categories.length>0&&x.categories.length<=10000&&x.tasks.length<=10000&&x.books.length<=10000&&x.records.length<=100000&&
 unique(x.categories.map(c=>c.id))&&unique(x.tasks.map(t=>t.id))&&unique(x.books.map(b=>b.id))&&unique(x.records.map(r=>r.id))&&
 x.tasks.every(t=>x.categories.some(c=>c.id===t.categoryId))&&x.books.some(b=>b.id===x.timer.readingId)&&
 (x.timer.context.kind==='reading'?x.books.some(b=>b.id===x.timer.context.id):x.categories.some(c=>c.id===('categoryId' in x.timer.context?x.timer.context.categoryId:'')))&&
 x.books.every(b=>!b.metadata||(object(b.metadata)&&b.metadata.source==='mock'&&str(b.metadata.editionId)&&str(b.metadata.isbn)&&str(b.metadata.publisher)&&int(b.metadata.year,0,9999)&&str(b.metadata.language)&&optional(b.metadata.coverStyle,v=>one(v,['indigo','forest','sand']))));
}
function validate(key:Key,x:unknown){
 if(key==='workspace')return workspace(x);
 if(key==='preferences')return preferences(x);
 if(x===null)return true;
 switch(key){
 case 'layouts':return layouts(x);
 case 'appearance':return object(x)&&one(x.theme,['light','dark','system'])&&one(x.motion,['system','reduced'])&&typeof x.accent==='string'&&/^#[a-f0-9]{6}$/i.test(x.accent)&&one(x.ring,['classic','dial','segmented','minimal']);
 case 'notifications':return object(x)&&bool(x.focus)&&bool(x.breaks)&&bool(x.native)&&optional(x.sound,bool)&&optional(x.startSound,bool)&&optional(x.tone,v=>one(v,['soft','bell','digital']))&&optional(x.volume,v=>int(v,0,100))&&optional(x.quiet,bool)&&optional(x.quietStart,time)&&optional(x.quietEnd,time);
 case 'inbox':return Array.isArray(x)&&x.length<=50&&x.every(e=>object(e)&&str(e.id)&&str(e.title)&&str(e.body)&&int(e.at,0,Number.MAX_SAFE_INTEGER)&&bool(e.read)&&one(e.kind,['focus','break','test']));
 case 'shield':return bool(x)||object(x)&&bool(x.remind)&&bool(x.autoShortcut);
 case 'connections':return Array.isArray(x)&&x.every(v=>providerKeys.includes(v));
 case 'profile':return one(x,['guest','google-demo']);
 case 'notes':return str(x);
 }
}
export function parseBackup(raw:string):Backup{
 if(raw.length>10_000_000)throw new Error('Arquivo muito grande (máximo de 10 MB).');
 let v:unknown;try{v=JSON.parse(raw)}catch{throw new Error('Arquivo JSON inválido.')}
 if(!object(v)||v.format!=='focora-backup'||v.version!==1||typeof v.exportedAt!=='string'||!Number.isFinite(Date.parse(v.exportedAt))||!object(v.data))throw new Error('Formato ou versão de backup incompatível.');
 const data=v.data;
 for(const key of Object.keys(keys) as Key[])if(!Object.prototype.hasOwnProperty.call(data,key)||!validate(key,data[key]))throw new Error('Dados inválidos no backup: '+key+'.');
 return {format:'focora-backup',version:1,exportedAt:v.exportedAt,data:Object.fromEntries((Object.keys(keys) as Key[]).map(k=>[k,data[k]])) as Data};
}
export function loadNotes(){const value=readStorage(NOTES_KEY);return typeof value==='string'?value.slice(0,4000):''}
export function makeBackup():Backup{
 const prefs=loadPreferences(),current=loadWorkspace(prefs);
 // Export committed data, not an unfinished session that could replay on import.
 const w={...current,timer:{...current.timer,phase:'focus' as const,cycle:0,running:false,startedAt:0,duration:prefs.focus,seconds:current.timer.mode==='Livre'?0:prefs.focus}};
 const data=Object.fromEntries((Object.keys(keys) as Key[]).map(k=>[k,readStorage(keys[k])])) as Data;
 data.workspace=w;data.preferences=prefs;
 return parseBackup(JSON.stringify({format:'focora-backup',version:1,exportedAt:new Date().toISOString(),data}));
}
export function restoreBackup(input:Backup){
 const backup=parseBackup(JSON.stringify(input));
 const values={...backup.data};
 const w=values.workspace,p=values.preferences;
 values.workspace={...w,timer:{...w.timer,phase:'focus',cycle:0,duration:p.focus,seconds:w.timer.mode==='Livre'?0:p.focus,running:false,startedAt:0}};
 // Permissions are tied to this device, not a portable file.
 if(object(values.notifications))values.notifications={...values.notifications,native:false};
 if(object(values.shield))values.shield={...values.shield,autoShortcut:false};
 const previous=new Map<string,string|null>();
 const entries=Object.entries(keys) as [Key,string][];
 // Snapshot all old values before writing anything; rollback on quota/access errors.
 for(const [,key] of entries)previous.set(key,localStorage.getItem(key));
 const changed:string[]=[];
 try{
  for(const [name,key] of entries){const value=values[name];if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(value));changed.push(key)}
 }catch{
  let failed=false;
  for(const key of changed.reverse()){try{const value=previous.get(key);if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch{failed=true}}
  throw new Error(failed?'Não foi possível restaurar completamente os dados anteriores. Não feche esta tela; guarde seu backup.':'Não foi possível restaurar. Os dados anteriores foram preservados.');
 }
}
function csvCell(v:unknown){let s=String(v??'');if(/^[\s\u0000-\u001f]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
export function historyCsv(records:FocusRecord[]){
 const header=['Data (referência demo)','Hora','Atividade','Categoria','Duração (segundos)','Método','Status','Origem'];
 return '\uFEFF'+[header,...records.map(r=>[r.day,r.time,r.title,r.category,r.seconds,r.mode,r.status==='completed'?'Concluída':'Interrompida',r.origin==='fixture'?'Demonstração':'Sessão local'])].map(row=>row.map(csvCell).join(';')).join('\r\n');
}
export function downloadText(name:string,content:string,mime:string){
 const url=URL.createObjectURL(new Blob([content],{type:mime}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);
 try{anchor.click()}finally{anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30000)}
}
export function exportHistory(records:FocusRecord[]){downloadText('focora-historico-'+new Date().toISOString().slice(0,10)+'.csv',historyCsv(records),'text/csv;charset=utf-8')}
