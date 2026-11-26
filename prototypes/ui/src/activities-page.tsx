import { useState } from 'react';
import { BookOpen, BriefcaseBusiness, GraduationCap, Layers, CheckCircle2, ListTodo, Search, Plus, Play, Pencil, Folder, Clock } from 'lucide-react';
import { Cover,Progress } from './components';
import { BookImport,BookDetails } from './book-import';
import { Button,Dialog,Field,SelectField,SearchField } from './ui';
import { nextTaskId,progressOf,readingContext,type Book,type Category,type Task,type FocusContext } from './activity-model';

type Tab='overview'|'tasks'|'books';
type FormKind='category'|'task'|'book';
const tabs:{id:Tab;label:string}[]=[{id:'overview',label:'Visão geral'},{id:'tasks',label:'Tarefas'},{id:'books',label:'Leituras'}];
const categoryIcons={work:BriefcaseBusiness,study:GraduationCap,reading:BookOpen,personal:Layers};
export function CategoryMark({category}:{category:Category}){
 const Icon=categoryIcons[category.id as keyof typeof categoryIcons]??Folder;
 return <span className={'category-mark tone-'+category.tone}><Icon size={19} strokeWidth={1.75}/></span>;
}
export function ActivitiesPage({categories,tasks,books,onCategories,onTasks,onBooks,onFocus,onReading}:{categories:Category[];tasks:Task[];books:Book[];onCategories:(next:Category[])=>void;onTasks:(next:Task[])=>void;onBooks:(next:Book[])=>void;onFocus:(ctx:FocusContext)=>void;onReading:(book:Book)=>void}){
 const [tab,setTab]=useState<Tab>('overview');
 const [filter,setFilter]=useState('all');
 const [status,setStatus]=useState<'all'|'pending'|'done'>('all');
 const [search,setSearch]=useState('');
 const [form,setForm]=useState<FormKind|null>(null);
 const [showImport,setShowImport]=useState(false);
 const [detailsId,setDetailsId]=useState<string|null>(null);
 const detailsBook=books.find(b=>b.id===detailsId);
 const [editing,setEditing]=useState<number|null>(null);
 const [name,setName]=useState('');
 const [category,setCategory]=useState('work');
 const [author,setAuthor]=useState('');
 const [pages,setPages]=useState('200');
 const [error,setError]=useState('');
 const normalize=(value:string)=>value.trim().toLocaleLowerCase('pt-BR');
 const query=normalize(search);
 const visibleTasks=tasks.filter(t=>(filter==='all'||t.categoryId===filter)&&(status==='all'||t.done===(status==='done'))&&normalize(t.title).includes(query));
 const visibleBooks=books.filter(b=>normalize(b.title+' '+b.author).includes(query));
 const completed=tasks.filter(t=>t.done).length;
 const pending=tasks.length-completed;
 function open(kind:FormKind,task?:Task){setError('');setForm(kind);setEditing(task?.id??null);setName(task?.title??'');setCategory(task?.categoryId??(filter!=='all'?filter:categories[0].id));setAuthor('');setPages('200')}
 function save(){
  const title=name.trim();if(!title){setError('Informe um nome.');return}
  if(form==='category'){
   if(categories.some(c=>normalize(c.name)===normalize(title))){setError('Já existe uma categoria com esse nome.');return}
   const id='category-'+crypto.randomUUID();onCategories([...categories,{id,name:title,tone:'orange'}]);
  }else if(form==='task'){
   if(editing!==null)onTasks(tasks.map(t=>t.id===editing?{...t,title,categoryId:category}:t));
   else onTasks([...tasks,{id:nextTaskId(tasks),title,categoryId:category,done:false}]);
   setFilter('all');setStatus('all');
  }else if(form==='book'){
   const total=Number(pages);
   if(!author.trim()||!Number.isInteger(total)||total<1||total>10000){setError('Informe autor e um total válido de páginas.');return}
   onBooks([...books,{id:'book-'+crypto.randomUUID(),title,author:author.trim(),pages:total,page:0}]);
  }
  setSearch('');setForm(null);
 }
 function focusTask(t:Task){const c=categories.find(x=>x.id===t.categoryId)!;onFocus({kind:'task',id:String(t.id),title:t.title,label:c.name,categoryId:c.id})}
 function renderTasks(){return <section className="activity-surface activity-task-section"><header className="activity-section-head"><div><h2><ListTodo size={18}/> Tarefas</h2><small>{pending} pendentes · {completed} concluídas</small></div><Button variant="secondary" size="sm" onClick={()=>open('task')}><Plus size={15}/> Nova tarefa</Button></header>
  <div className="activity-task-filters"><div className="activity-tabs small-tabs" role="group" aria-label="Status das tarefas">{([{id:'all',label:'Todas'},{id:'pending',label:'Pendentes'},{id:'done',label:'Concluídas'}] as const).map(s=><button key={s.id} aria-pressed={status===s.id} onClick={()=>setStatus(s.id)}>{s.label}</button>)}</div><SelectField label="Filtrar por categoria" hideLabel compact value={filter} onValueChange={setFilter} options={[{value:'all',label:'Todas as categorias'},...categories.map(c=>({value:c.id,label:c.name}))]}/></div>
  <div className="activity-task-list">{visibleTasks.length?visibleTasks.map(t=>{const c=categories.find(x=>x.id===t.categoryId)!;return <div className={'activity-task-row '+(t.done?'task-completed':'')} key={t.id}><label><input type="checkbox" checked={t.done} onChange={()=>onTasks(tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span className="activity-task-title">{t.title}</span></label><span className={'category-pill tone-'+c.tone}>{c.name}</span><div className="activity-row-actions"><button className="ui-icon-button" aria-label={'Editar '+t.title} onClick={()=>open('task',t)}><Pencil size={15}/></button><button className="ui-icon-button task-play" aria-label={'Focar em '+t.title} disabled={t.done} onClick={()=>focusTask(t)}><Play size={15} fill="currentColor"/></button></div></div>}):<div className="activity-empty"><CheckCircle2 size={28} strokeWidth={1.5}/><b>Nenhuma tarefa encontrada</b><small>Altere os filtros ou crie uma nova tarefa.</small></div>}</div>
 </section>}
 function renderBooks(){return <section className="activity-surface"><header className="activity-section-head"><div><h2><BookOpen size={18}/> Biblioteca de leitura</h2><small>{books.length} livros na biblioteca</small></div><Button variant="secondary" size="sm" onClick={()=>setShowImport(true)}><Search size={15}/> Buscar livro</Button></header><div className="book-manual-action"><Button variant="secondary" size="sm" onClick={()=>open('book')}><Plus size={15}/> Adicionar livro</Button></div>
  <div className="activity-library">{visibleBooks.length?visibleBooks.map(b=><article className="activity-book" key={b.id}><Cover title={b.title} coverStyle={b.metadata?.coverStyle}/><div className="activity-book-copy"><b>{b.title}</b><small>{b.author}</small>{b.metadata&&<small>{b.metadata.language} · {b.metadata.year} · demo</small>}<Progress value={progressOf(b)}/><small>Pág. {b.page} de {b.pages} · {progressOf(b)}%</small><Button variant="soft" size="sm" onClick={()=>onReading(b)}><Play size={13}/> {b.page>0?'Continuar leitura':'Iniciar leitura'}</Button><Button variant="secondary" size="sm" aria-label={'Detalhes de '+b.title} onClick={()=>setDetailsId(b.id)}>Detalhes e capítulos</Button></div></article>):<div className="activity-empty"><BookOpen size={28}/><b>Nenhuma leitura encontrada</b></div>}</div>
 </section>}
 return <div className="activities-page">
  <div className="activity-topbar"><div className="activity-tabs" role="group" aria-label="Seções de atividades">{tabs.map(t=><button key={t.id} aria-pressed={tab===t.id} onClick={()=>{setTab(t.id);setSearch('')}}>{t.label}</button>)}</div><SearchField className="activity-search-control" label="Buscar atividades" placeholder="Buscar atividades..." value={search} onValueChange={setSearch}/></div>
  {tab==='overview'&&<><div className="activity-overview"><div className="activity-stat"><span className="activity-stat-icon tone-blue"><ListTodo size={20}/></span><div><small>Tarefas pendentes</small><strong>{pending}</strong></div></div><div className="activity-stat"><span className="activity-stat-icon tone-green"><CheckCircle2 size={20}/></span><div><small>Concluídas</small><strong>{completed}</strong></div></div><div className="activity-stat"><span className="activity-stat-icon tone-lavender"><BookOpen size={20}/></span><div><small>Livros na biblioteca</small><strong>{books.length}</strong></div></div></div>
  <section className="activity-surface"><header className="activity-section-head"><div><h2><Layers size={18}/> Categorias</h2><small>Escolha um contexto para sua próxima sessão.</small></div><Button variant="secondary" size="sm" onClick={()=>open('category')}><Plus size={15}/> Nova categoria</Button></header><div className="activity-categories">{categories.filter(c=>normalize(c.name).includes(query)).map(c=><article className="activity-category" key={c.id}><CategoryMark category={c}/><div><b>{c.name}</b><small>{tasks.filter(t=>t.categoryId===c.id&&!t.done).length} tarefas pendentes</small></div><button className="ui-icon-button task-play" aria-label={'Iniciar foco em '+c.name} onClick={()=>onFocus({kind:'activity',id:c.id,title:c.name,label:c.name,categoryId:c.id})}><Play size={15} fill="currentColor"/></button></article>)}</div></section></>}
  {(tab==='overview'||tab==='tasks')&&renderTasks()}
  {(tab==='overview'||tab==='books')&&renderBooks()}
  <small className="activity-demo"><Clock size={13}/> Dados de demonstração · alterações mantidas nesta sessão do aplicativo.</small>
  {showImport&&<BookImport books={books} onImport={book=>{onBooks([...books,book]);setSearch('');setShowImport(false)}} onManual={()=>{setShowImport(false);open('book')}} onDismiss={()=>setShowImport(false)}/>}
  {detailsBook&&<BookDetails book={detailsBook} onChange={book=>onBooks(books.map(b=>b.id===book.id?book:b))} onDismiss={()=>setDetailsId(null)}/>}
  {form&&<Dialog title={form==='category'?'Nova categoria':form==='book'?'Adicionar livro':editing!==null?'Editar tarefa':'Nova tarefa'} description="Organize o que você quer realizar." onDismiss={()=>setForm(null)}><form className="dialog-form" onSubmit={e=>{e.preventDefault();save()}}>
  <Field label={form==='book'?'Título do livro':form==='category'?'Nome da categoria':'Título da tarefa'} value={name} onChange={e=>setName(e.target.value)} required maxLength={80}/>
  {form==='task'&&<SelectField label="Categoria" value={category} onValueChange={setCategory} options={categories.map(c=>({value:c.id,label:c.name}))}/>}
  {form==='book'&&<><Field label="Autor" value={author} onChange={e=>setAuthor(e.target.value)} required maxLength={80}/><Field label="Total de páginas" type="number" min="1" max="10000" step="1" required value={pages} onChange={e=>setPages(e.target.value)}/></>}
  {error&&<p role="alert" className="activity-error">{error}</p>}
  <footer className="dialog-actions"><Button variant="secondary" onClick={()=>setForm(null)}>Cancelar</Button><Button type="submit">Salvar</Button></footer></form></Dialog>}
 </div>;
}
