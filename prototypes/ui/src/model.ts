export type WidgetType = 'focus' | 'agenda' | 'tasks' | 'reading' | 'goal' | 'music' | 'summary' | 'notes' | 'next' | 'recent';
export type Size = 'small' | 'medium' | 'large';
export interface Placement { x:number; y:number; w:number; h:number }
export interface WidgetOptions {rows?:1|2|3;onlyPriorities?:boolean;days?:5|7}
export interface Widget { id: string; type: WidgetType; size: Size; placement?:Placement; options?:WidgetOptions }
export type Layouts = Record<'desktop' | 'mobile', Widget[]>;
export const catalogue: {type:WidgetType; title:string; description:string; size:Size}[] = [
 {type:'focus',title:'Temporizador',description:'Pomodoro, cronômetro e foco livre',size:'large'},
 {type:'agenda',title:'Agenda',description:'Compromissos dos seus calendários',size:'large'},
 {type:'tasks',title:'Tarefas',description:'Lista de tarefas e checklists',size:'medium'},
 {type:'reading',title:'Leitura',description:'Acompanhe suas leituras',size:'medium'},
 {type:'goal',title:'Metas',description:'Defina suas metas diárias',size:'medium'},
 {type:'music',title:'Música',description:'Player e sons ambientes',size:'large'},
 {type:'notes',title:'Notas',description:'Anotações rápidas',size:'medium'},
 {type:'summary',title:'Estatísticas',description:'Tempo, sessões e evolução',size:'medium'},
 {type:'next',title:'Próximo compromisso',description:'Veja o que vem a seguir',size:'medium'},
 {type:'recent',title:'Sessões recentes',description:'Histórico de concentração',size:'medium'},
];
// V5 curated starting layout. Existing saved layouts are loaded unchanged.
const homeLayout: Widget[]=[
 {id:'focus',type:'focus',size:'large',placement:{x:0,y:0,w:12,h:6}},
 {id:'goal',type:'goal',size:'medium',placement:{x:0,y:6,w:12,h:5}},
 {id:'tasks',type:'tasks',size:'large',placement:{x:0,y:11,w:6,h:5}},
 {id:'agenda',type:'agenda',size:'large',placement:{x:6,y:11,w:6,h:6}},
 {id:'reading',type:'reading',size:'medium',placement:{x:0,y:16,w:6,h:5}},
];
export const defaultLayout = (mobile = false): Widget[] => homeLayout.map(w=>({...w,size:mobile?(w.type==='focus'?'large':'medium'):w.size,placement:mobile?undefined:{...w.placement!}}));
export const defaults = (): Layouts => ({desktop:defaultLayout(),mobile:defaultLayout(true)});
export const STORAGE = 'focus-workspace:v4:layouts';
export function loadLayouts():Layouts {
 try {
  const data = JSON.parse(localStorage.getItem(STORAGE) || 'null');
  const valid = (items:unknown):items is Widget[] => Array.isArray(items) && items.every(i=>i && typeof i.id==='string' && catalogue.some(c=>c.type===i.type) && ['small','medium','large'].includes(i.size) && validWidgetOptions(i.options)) && new Set(items.map(i=>i.id)).size===items.length;
  if (data && valid(data.desktop) && valid(data.mobile)) return data;
 } catch { /* invalid or inaccessible browser storage */ }
 return defaults();
}
export function move(items:Widget[], from:string, to:string):Widget[] {
 const a=items.findIndex(w=>w.id===from), b=items.findIndex(w=>w.id===to);
 if(a<0||b<0||a===b)return items;
 const result=[...items]; const [item]=result.splice(a,1); result.splice(b,0,item);return result;
}
export const tasksInitial = [
 {id:1,title:'Finalizar revisão do PR',done:false},
 {id:2,title:'Preparar apresentação',done:false},
 {id:3,title:'Ler 20 páginas',done:false},
 {id:4,title:'Responder e-mails',done:true},
 {id:5,title:'Planejar próxima semana',done:true},
];
export const events = [
 {time:'09:00',title:'Daily do projeto',provider:'Google Agenda',duration:'30 min',color:'lavender'},
 {time:'11:00',title:'Alinhamento de sprint',provider:'Outlook',duration:'45 min',color:'blue'},
 {time:'14:00',title:'Revisão de arquitetura',provider:'Google Agenda',duration:'1h',color:'orange'},
] as const;
export function validWidgetOptions(v:unknown):boolean{
 if(v===undefined)return true;
 if(!v||typeof v!=='object'||Array.isArray(v))return false;
 const o=v as WidgetOptions;
 return Object.keys(o).every(k=>['rows','onlyPriorities','days'].includes(k))&&(o.rows===undefined||[1,2,3].includes(o.rows))&&(o.days===undefined||[5,7].includes(o.days))&&(o.onlyPriorities===undefined||typeof o.onlyPriorities==='boolean');
}
export const dashboardPresets=[
 {id:'essential',title:'Essencial',description:'Só o que importa para começar.',types:['focus','tasks','goal']},
 {id:'work',title:'Trabalho',description:'Tarefas, agenda e foco.',types:['focus','agenda','tasks','goal','notes','next']},
 {id:'study',title:'Estudos',description:'Leitura, concentração e revisão.',types:['focus','reading','tasks','goal','notes','recent']},
 {id:'complete',title:'Completo',description:'Visão ampla do seu dia.',types:['focus','agenda','tasks','reading','goal','music','summary']}
] as const;
export type DashboardPreset=typeof dashboardPresets[number]['id'];
export function presetLayout(id:DashboardPreset,mobile:boolean):Widget[]{
 const p=dashboardPresets.find(p=>p.id===id)!;
 return p.types.map(type=>({id:type,type,size:mobile?(type==='focus'?'large':'medium'):catalogue.find(c=>c.type===type)!.size}));
}
