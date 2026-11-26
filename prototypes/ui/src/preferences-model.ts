import type { ProviderId } from './provider-icons';
import { defaultLayout, type Layouts } from './model';
export const PREFS_KEY='focus-workspace:v4:preferences';
export const CONNECTIONS_KEY='focus-workspace:v4:demo-connections';
export const ONBOARDING_KEY='focus-workspace:v4:onboarding';
export type Profile='guest'|'google-demo';
export type Phase='focus'|'short'|'long';
export type Preset='balanced'|'work'|'study';
export interface FocusPreferences { focus:number;short:number;long:number;cycles:number;autoBreak:boolean;autoFocus:boolean;goal:number;keepAwake?:boolean }
export const defaultPreferences:FocusPreferences={focus:1500,short:300,long:900,cycles:4,autoBreak:false,autoFocus:false,goal:240,keepAwake:false};
export const readStorage=(key:string):unknown=>{try{return JSON.parse(localStorage.getItem(key)??'null')}catch{return null}};
export function writeStorage(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
const integer=(v:unknown,min:number,max:number):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=min&&v<=max;
export function loadPreferences():FocusPreferences{
 const p=readStorage(PREFS_KEY) as Partial<FocusPreferences>|null;
 if(!p||!integer(p.focus,60,7200)||!integer(p.short,60,1800)||!integer(p.long,60,3600)||!integer(p.cycles,1,12)||!integer(p.goal,15,720)||typeof p.autoBreak!=='boolean'||typeof p.autoFocus!=='boolean')return {...defaultPreferences};
 return {...defaultPreferences,...p,keepAwake:p.keepAwake===true};
}
export const providerKeys:ProviderId[]=['google-calendar','outlook','spotify','gmail','google-meet','teams'];
export function loadConnections():ProviderId[]{const v=readStorage(CONNECTIONS_KEY);return Array.isArray(v)?providerKeys.filter(p=>v.includes(p)):[]}
export function loadProfile():Profile|null{const v=readStorage(ONBOARDING_KEY);return v==='guest'||v==='google-demo'?v:null}
export const phaseName=(p:Phase)=>p==='short'?'Pausa curta':p==='long'?'Pausa longa':'Foco';
export const phaseDuration=(p:Phase,prefs:FocusPreferences)=>p==='focus'?prefs.focus:p==='short'?prefs.short:prefs.long;
export function nextPhase(phase:Phase,cyclesDone:number,prefs:FocusPreferences):{phase:Phase;cyclesDone:number;auto:boolean}{
 if(phase==='focus'){const done=cyclesDone+1;return {phase:done>=prefs.cycles?'long':'short',cyclesDone:done,auto:prefs.autoBreak}}
 return {phase:'focus',cyclesDone:phase==='long'?0:cyclesDone,auto:prefs.autoFocus};
}
export function suggestedLayout(preset:Preset):Layouts{
 const filter=(mobile:boolean)=>defaultLayout(mobile).filter(w=>preset==='balanced'||(preset==='work'?w.type!=='reading':w.type!=='summary'));
 return {desktop:filter(false),mobile:filter(true)};
}

export const focusPresets=[
 {id:'classic',label:'Clássico',description:'Equilíbrio entre foco e descanso.',focus:1500,short:300,long:900,cycles:4},
 {id:'deep',label:'Foco profundo',description:'Blocos maiores para tarefas complexas.',focus:3000,short:600,long:1200,cycles:3},
 {id:'quick',label:'Foco rápido',description:'Para começar sem pressão.',focus:900,short:180,long:600,cycles:3},
] as const;
export function matchesFocusPreset(p:FocusPreferences,preset:typeof focusPresets[number]){return p.focus===preset.focus&&p.short===preset.short&&p.long===preset.long&&p.cycles===preset.cycles}
