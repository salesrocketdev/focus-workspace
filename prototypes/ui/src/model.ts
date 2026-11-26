export type WidgetType = 'focus' | 'agenda' | 'tasks' | 'reading' | 'goal' | 'music' | 'summary' | 'notes' | 'next' | 'recent';
export type Size = 'small' | 'medium' | 'large';
export interface Widget { id: string; type: WidgetType; size: Size }
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
const initial = ['focus','agenda','tasks','reading','goal','music','summary'] as const;
export const defaultLayout = (mobile = false): Widget[] => (mobile ? ['focus','agenda','reading','tasks','goal','music','summary'] as const : initial).map(type=>({id:type,type,size:mobile ? (type==='focus'?'large':'medium') : catalogue.find(w=>w.type===type)!.size}));
export const defaults = (): Layouts => ({desktop:defaultLayout(),mobile:defaultLayout(true)});
export const STORAGE = 'focus-workspace:v4:layouts';
export function loadLayouts():Layouts {
 try {
  const data = JSON.parse(localStorage.getItem(STORAGE) || 'null');
  const valid = (items:unknown):items is Widget[] => Array.isArray(items) && items.every(i=>i && typeof i.id==='string' && catalogue.some(c=>c.type===i.type) && ['small','medium','large'].includes(i.size)) && new Set(items.map(i=>i.id)).size===items.length;
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