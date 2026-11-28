import {useState} from 'react';
import {BookOpen,Check,ChevronRight,Layers,ListTodo,Search} from 'lucide-react';
import {Dialog,SearchField,Button} from './ui';
import {readingContext,sameContext,type Book,type Task,type Category,type FocusContext} from './activity-model';
type Props={categories:Category[];tasks:Task[];books:Book[];current:FocusContext;onChoose:(context:FocusContext)=>void;onDismiss:()=>void};
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
export function FocusPicker({categories,tasks,books,current,onChoose,onDismiss}:Props){
 const [search,setSearch]=useState('');
 const groups=[
  {title:'Tarefas pendentes',Icon:ListTodo,items:tasks.filter(t=>!t.done).flatMap(t=>{const c=categories.find(c=>c.id===t.categoryId);return c?[{context:{kind:'task',id:String(t.id),title:t.title,label:c.name,categoryId:c.id} as FocusContext,subtitle:c.name}]:[]})},
  {title:'Leituras',Icon:BookOpen,items:books.map(b=>({context:readingContext(b),subtitle:b.author+' · pág. '+b.page+' de '+b.pages}))},
  {title:'Categorias',Icon:Layers,items:categories.map(c=>({context:{kind:'activity',id:c.id,title:c.name,label:c.name,categoryId:c.id} as FocusContext,subtitle:'Foco sem tarefa específica'}))},
 ].map(g=>({...g,items:g.items.filter(i=>normalize(i.context.title+' '+i.subtitle).includes(normalize(search.trim())))}));
 return <Dialog title="Escolher atividade" description="O que você quer fazer na próxima sessão?" onDismiss={onDismiss}><div className="focus-picker"><SearchField label="Buscar atividade de foco" placeholder="Buscar tarefas, livros ou categorias..." value={search} onValueChange={setSearch}/>{groups.map(g=>g.items.length>0&&<section key={g.title}><h3>{g.title}</h3><div className="focus-picker-rows">{g.items.map(({context,subtitle})=><button type="button" key={context.kind+context.id} className="focus-picker-row" aria-pressed={sameContext(current,context)} aria-label={context.title} onClick={()=>onChoose(context)}><span className="focus-picker-icon"><g.Icon size={19}/></span><span className="focus-picker-copy"><b>{context.title}</b><small>{subtitle}</small></span>{sameContext(current,context)?<Check size={17}/>:<ChevronRight size={17}/>}</button>)}</div></section>)}{groups.every(g=>!g.items.length)&&<div className="focus-picker-empty"><Search size={26}/><b>Nenhuma atividade encontrada</b><small>Tente outro termo de busca.</small></div>}<footer className="dialog-actions"><Button variant="secondary" onClick={onDismiss}>Cancelar</Button></footer></div></Dialog>;
}
