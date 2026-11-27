import { useId, useState } from 'react';
import { CalendarPlus, Play, Plus, Repeat2, SkipForward, Star } from 'lucide-react';
import { priorityCount, MAX_PRIORITIES, type Category, type Task } from './activity-model';
import type { FocusRecord } from './history-model';
import { taskPomodoros } from './planning-model';
import { ProviderIcon } from './provider-icons';
import { Button, Dialog, Field, SearchField, SelectField, TextareaField } from './ui';
import { dayKey, dateAtNoon, shiftDay, httpsLink, validDay, repeats, weekdays, type Repeat, type TaskSource } from './task-planning';

const sources: Record<TaskSource,string> = { gmail:'Gmail', outlook:'Outlook', 'google-meet':'Google Meet', teams:'Microsoft Teams' };
const meeting = (source?:TaskSource) => source === 'google-meet' || source === 'teams';
const dateLabel = (date:string) => dateAtNoon(date).toLocaleDateString('pt-BR', { day:'numeric', month:'short' });
export function TaskEditor({task,categories,canPriority,onSave,onDismiss}:{
 task?:Task;categories:Category[];canPriority:boolean;onSave:(draft:Omit<Task,'id'|'done'>)=>boolean;onDismiss:()=>void;
}){
 const priorityHint=useId();
 const [draft,setDraft]=useState<Omit<Task,'id'|'done'>>(task??{title:'',categoryId:categories[0]?.id??''});
 const [section,setSection]=useState<'basic'|'planning'|'content'|'source'>(task?.recurrenceDate?'planning':'basic');
 const [scope,setScope]=useState(task?.recurrenceDate?'occurrence':'series');
 const [error,setError]=useState('');
 const [steps,setSteps]=useState(task?.checklist?.map(step=>step.title).join('\n')??'');
 function change(patch:Partial<Task>){setDraft(value=>({...value,...patch}));setError('');}
 function go(next:typeof section){setSection(next);setError('');}
 return <Dialog className="compact-dialog structured-dialog task-editor-dialog" title={task?'Detalhes da tarefa':'Nova tarefa'} onDismiss={onDismiss}>
  <form className="dialog-form planning-form" onSubmit={event=>{
   event.preventDefault();
   const title=draft.title.trim();
   const sourceUrl=draft.sourceUrl?.trim();
   if(!title){setSection('basic');setError('Informe o título.');return;}
   if((draft.repeat||scope==='occurrence')&&!draft.plannedDate){setSection('planning');setError('Escolha a data planejada para iniciar a repetição.');return;}
   if((draft.plannedDate&&!validDay(draft.plannedDate))||(draft.dueDate&&!validDay(draft.dueDate))){setSection('planning');setError('Informe uma data válida.');return;}
   if(sourceUrl&&!httpsLink(sourceUrl)){setSection('source');setError('Use um link HTTPS válido.');return;}
   if(draft.estimate!==undefined&&(!Number.isInteger(draft.estimate)||draft.estimate<1||draft.estimate>20)){setSection('planning');setError('Informe uma estimativa de 1 a 20 Pomodoros.');return;}
   if(draft.repeat==='monthly'&&draft.repeatInterval!==undefined&&(!Number.isInteger(draft.repeatInterval)||draft.repeatInterval<1||draft.repeatInterval>12)){setSection('planning');setError('Informe um intervalo de 1 a 12 meses.');return;}
   const checklist=steps.split('\n').map(title=>title.trim()).filter(Boolean)
    .map(title=>({title,done:draft.checklist?.find(step=>step.title===title)?.done??false}));
   const monthDay=draft.repeat==='monthly'&&draft.plannedDate
    ? draft.plannedDate===task?.plannedDate ? task.monthDay??dateAtNoon(draft.plannedDate).getDate() : dateAtNoon(draft.plannedDate).getDate()
    : undefined;
   const occurrence=scope==='occurrence'&&task?.repeat&&task.plannedDate;
   const recurrence=occurrence&&task?{
    repeat:task.repeat, repeatDays:task.repeatDays, repeatInterval:task.repeatInterval, monthDay:task.monthDay,
    recurrenceDate:task.recurrenceDate??task.plannedDate,
    recurrenceDueDate:task.recurrenceDate?task.recurrenceDueDate:task.dueDate,
   }:{monthDay,recurrenceDate:undefined,recurrenceDueDate:undefined};
   const updated = occurrence&&task
    ? {...task,plannedDate:draft.plannedDate,dueDate:draft.dueDate,...recurrence}
    : {...draft,...recurrence,title,sourceUrl:sourceUrl||undefined,checklist};
   if(onSave(updated))onDismiss();
   else setError('Não foi possível salvar a tarefa. Confira a categoria e as prioridades.');
  }}>
   <nav className="dialog-section-nav" aria-label="Seções da tarefa">
    {([{id:'basic',label:'Geral'},{id:'planning',label:'Planejamento'},{id:'content',label:'Conteúdo'},{id:'source',label:'Origem'}] as const).map(item=><button type="button" key={item.id} aria-pressed={section===item.id} onClick={()=>go(item.id)}>{item.label}</button>)}
   </nav>
   <div className="dialog-scroll-body" key={section}>
   {section==='basic'&&<>
   <Field label="Título da tarefa" disabled={scope==='occurrence'} required maxLength={120} value={draft.title} onChange={e=>change({title:e.target.value})}/>
   <SelectField label="Categoria" disabled={scope==='occurrence'} value={draft.categoryId} options={categories.map(c=>({value:c.id,label:c.name}))} onValueChange={categoryId=>change({categoryId})}/>
   <label className="task-priority-control"><input type="checkbox" aria-label="Destacar no painel" aria-describedby={priorityHint} checked={Boolean(draft.priority)} disabled={scope==='occurrence'||!canPriority&&!draft.priority||task?.done} onChange={e=>change({priority:e.target.checked})}/><span><b>Destacar no painel</b><small id={priorityHint}>{!canPriority&&!draft.priority?"Limite de prioridades atingido.":"Mostrar entre as tarefas prioritárias."}</small></span><Star size={17} aria-hidden="true"/></label>
   <p className="dialog-section-hint">Planejamento, conteúdo e origem são opcionais. Você pode salvar agora.</p>
   </>}
   {section==='planning'&&<>
    <div className="planning-fields">
     <Field label="Planejada para" type="date" value={draft.plannedDate??''} onChange={e=>change({plannedDate:e.target.value||undefined})}/>
     <Field label="Prazo" type="date" value={draft.dueDate??''} onChange={e=>change({dueDate:e.target.value||undefined})}/>
     {task?.repeat&&!task.done&&<SelectField label="Aplicar alterações" value={scope} options={[{value:'series',label:'Esta e as próximas'},{value:'occurrence',label:'Reagendar só esta ocorrência'}]} onValueChange={setScope}/>}
    <SelectField label="Repetição" disabled={scope==='occurrence'} value={draft.repeat??'none'} options={[{value:'none',label:'Sem repetição'},...repeats]} onValueChange={value=>change({repeat:value==='none'?undefined:value as Repeat})}/>
     <Field disabled={scope==='occurrence'} label="Pomodoros estimados" type="number" min={1} max={20} value={draft.estimate??''} onChange={e=>change({estimate:e.target.value?Number(e.target.value):undefined})}/>
     <Field label="Lembrete (com app aberto)" disabled={scope==='occurrence'} type="datetime-local" value={draft.reminderAt??''} onChange={e=>change({reminderAt:e.target.value||undefined,reminderDelivered:undefined})}/>
    </div>
    {draft.repeat==='monthly'&&<Field label="Intervalo em meses" type="number" min={1} max={12} disabled={scope==='occurrence'} value={draft.repeatInterval??1} onChange={e=>change({repeatInterval:e.target.value?Number(e.target.value):undefined})}/>}
    {draft.repeat==='weekly'&&<fieldset disabled={scope==='occurrence'} className="planning-weekdays"><legend>Dias da semana</legend>{weekdays.map((day,i)=><label key={day}><input type="checkbox" checked={draft.repeatDays?.includes(i)??false} onChange={e=>change({repeatDays:e.target.checked?[...(draft.repeatDays??[]),i]:draft.repeatDays?.filter(n=>n!==i)})}/>{day}</label>)}</fieldset>}
   </>}
   {section==='content'&&<>
    <TextareaField disabled={scope==='occurrence'} label="Descrição" value={draft.description??''} onChange={e=>change({description:e.target.value})}/>
    {draft.checklist?.length? <div className="planning-checklist">{draft.checklist.map((step,i)=><label className="planning-check" key={i}><input type="checkbox" disabled={scope==='occurrence'} checked={step.done} onChange={e=>change({checklist:draft.checklist?.map((item,n)=>i===n?{...item,done:e.target.checked}:item)})}/>{step.title}</label>)}</div>:null}
    <TextareaField disabled={scope==='occurrence'} label="Passos do checklist (um por linha)" value={steps} onChange={e=>setSteps(e.target.value)}/>
   </>}
   {section==='source'&&<>
    <SelectField disabled={scope==='occurrence'} label="Origem" value={draft.source??'manual'} options={[{value:'manual',label:'Manual'},...Object.entries(sources).map(([value,label])=>({value,label}))]} onValueChange={value=>change({source:value==='manual'?undefined:value as TaskSource})}/>
    <Field disabled={scope==='occurrence'} label={meeting(draft.source)?'Link da reunião':'Link de origem'} type="url" value={draft.sourceUrl??''} onChange={e=>change({sourceUrl:e.target.value})}/>
   </>}
   </div>
   {error&&<p role="alert" className="ui-field-error dialog-section-error">{error}</p>}
   <footer className="dialog-actions"><Button variant="secondary" onClick={onDismiss}>Cancelar</Button><Button type="submit">{task?'Salvar':'Adicionar tarefa'}</Button></footer>
  </form>
 </Dialog>;
}

const examples: {source:TaskSource; title:string; description:string; sender?:string; excerpt?:string}[] = [
 {source:'gmail',title:'Responder à proposta de orçamento',description:'Revise a proposta recebida e envie a resposta pelo Gmail.',sender:'Marina · Compras (demo)',excerpt:'Pode revisar os valores e confirmar o orçamento até sexta?'},
 {source:'outlook',title:'Revisar os documentos enviados pelo cliente',description:'Confira os anexos e retorne com os pontos que precisam de ajuste.',sender:'Rafael · Atendimento (demo)',excerpt:'Enviei a documentação atualizada. Você consegue revisar os pontos em aberto?'},
 {source:'google-meet',title:'Alinhamento semanal do produto',description:'Separe os tópicos da pauta antes de entrar na reunião.'},
 {source:'teams',title:'Revisão de entrega com a equipe',description:'Confira a lista de pendências e entre na chamada da equipe.'},
];
const tabs=[{id:'inbox',label:'Entrada'},{id:'today',label:'Hoje'},{id:'upcoming',label:'Próximas'},{id:'all',label:'Todas'},{id:'done',label:'Concluídas'}] as const;

export function TaskPage({tasks,categories,records,readOnly,onSave,onFinish,onFocus,onPlan}:{
 tasks:Task[];categories:Category[];records:FocusRecord[];readOnly:boolean;
 onSave:(draft:Omit<Task,'id'|'done'>,task?:Task)=>boolean;onFinish:(task:Task,done:boolean,skip?:boolean)=>void;
 onFocus:(task:Task)=>void;onPlan:(task:Task)=>void;
}){
 const [tab,setTab]=useState<typeof tabs[number]['id']>('all');
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('all');
 const [edit,setEdit]=useState<Task|'new'>();
 const [preview,setPreview]=useState<Task>();
 const today=dayKey();
 const previewExample=examples.find(example=>example.source===preview?.source&&example.title===preview.title);
 const overdue=(task:Task)=>Boolean(task.dueDate&&task.dueDate<today);
 const visible=tasks.filter(task=>{
  if((category!=='all'&&task.categoryId!==category)||!task.title.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR').trim()))return false;
  if(tab==='done')return task.done;
  if(task.done)return false;
  if(tab==='inbox')return !task.plannedDate&&!task.dueDate;
  if(tab==='today')return overdue(task)||Boolean(task.plannedDate&&task.plannedDate<=today)||task.dueDate===today||Boolean(task.priority);
  if(tab==='upcoming')return Boolean(task.plannedDate&&task.plannedDate>today||task.dueDate&&task.dueDate>today)&&!overdue(task);
  return true;
 }).sort((a,b)=>Number(overdue(b))-Number(overdue(a))||Number(Boolean(b.priority))-Number(Boolean(a.priority))||(a.plannedDate??a.dueDate??'9999').localeCompare(b.plannedDate??b.dueDate??'9999'));
 return <section className="activity-surface planning-page">
  <header className="activity-section-head"><div><h2>Minhas tarefas</h2><small>{tasks.filter(task=>!task.done&&overdue(task)).length} atrasadas · {priorityCount(tasks)} prioridades</small></div>
   <div className="planning-actions"><Button disabled={readOnly} onClick={()=>setEdit('new')}><Plus size={16}/> Nova tarefa</Button></div></header>
  <div className="planning-toolbar"><div className="activity-tabs small-tabs" role="group" aria-label="Visões de tarefas">{tabs.map(item=><button type="button" key={item.id} aria-pressed={tab===item.id} onClick={()=>setTab(item.id)}>{item.label}</button>)}</div>
   <div className="planning-actions"><SearchField label="Buscar tarefas" placeholder="Buscar tarefas" value={query} onValueChange={setQuery}/><SelectField label="Categoria" value={category} options={[{value:'all',label:'Todas as categorias'},...categories.map(c=>({value:c.id,label:c.name}))]} onValueChange={setCategory}/></div></div>
  {visible.length===0&&<p className="planning-empty">Nenhuma tarefa nesta visão.</p>}
  <ul className="planning-list">{visible.map(task=>{
   const sourceUrl=task.sourceUrl&&httpsLink(task.sourceUrl);
   const source=task.source;
   const focusedMinutes=Math.round(records.filter(record=>record.origin==='session'&&record.taskId===task.id).reduce((total,record)=>total+record.seconds,0)/60);
   return <li key={task.id} className="planning-row">
    <input type="checkbox" aria-label={(task.done?'Reabrir ':'Concluir ')+task.title} checked={task.done} disabled={readOnly||task.done&&tasks.some(item=>item.previousOccurrence===task.id)} onChange={e=>onFinish(task,e.target.checked)}/>
    <div className="planning-row-body"><button type="button" className="planning-title" disabled={readOnly} onClick={()=>setEdit(task)}>{source&&<ProviderIcon provider={source} size={16}/>} {task.title}</button>
     <div className="planning-meta"><span>{categories.find(c=>c.id===task.categoryId)?.name??"Sem categoria"}</span>{task.plannedDate&&<span>Planejada {dateLabel(task.plannedDate)}</span>}{task.dueDate&&<span className={overdue(task)&&!task.done?'planning-overdue':''}>Prazo {dateLabel(task.dueDate)}</span>}{task.repeat&&<span><Repeat2 size={14}/> {repeats.find(rule=>rule.value===task.repeat)?.label}</span>}{task.estimate&&<span>{taskPomodoros(task,records)}/{task.estimate} Pomodoros</span>}{focusedMinutes>0&&<span>{focusedMinutes} min de foco</span>}{task.reminderAt&&!task.done&&<span>Lembrete {new Date(task.reminderAt).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</span>}{task.skipped&&<span>Ocorrência pulada</span>}</div>
    </div>
    <div className="planning-actions">
     {source&&meeting(source)&&<Button variant="secondary" size="sm" onClick={()=>setPreview(task)}><ProviderIcon provider={source} size={16}/> Entrar no {sources[source]}</Button>}
     {source&&!meeting(source)&&<Button variant="secondary" size="sm" onClick={()=>setPreview(task)}><ProviderIcon provider={source} size={16}/> Ver e-mail</Button>}
     {!source&&sourceUrl&&<a href={sourceUrl} target="_blank" rel="noreferrer">Abrir origem</a>}
     {!task.done&&<><button type="button" className="ui-icon-button priority-action" aria-label={"Prioridade: "+task.title} aria-pressed={!!task.priority} title={task.priority?"Remover prioridade":"Marcar como prioridade"} disabled={readOnly||(!task.priority&&priorityCount(tasks)>=MAX_PRIORITIES)} onClick={()=>onSave({...task,priority:!task.priority},task)}><Star size={16} fill={task.priority?"currentColor":"none"}/></button><Button variant="secondary" size="sm" disabled={readOnly} onClick={()=>onPlan(task)}><CalendarPlus size={15}/> Agendar</Button><Button variant="soft" size="sm" disabled={readOnly} onClick={()=>onFocus(task)}><Play size={15}/> Abrir foco</Button></>}
     {!task.done&&tab==='today'&&<Button variant="secondary" size="sm" disabled={readOnly} onClick={()=>onSave({...task,plannedDate:shiftDay(today,1),recurrenceDate:task.repeat?(task.recurrenceDate??task.plannedDate):undefined,recurrenceDueDate:task.repeat?(task.recurrenceDate?task.recurrenceDueDate:task.dueDate):undefined},task)}>Planejar amanhã</Button>}
     {!task.done&&task.repeat&&<Button variant="secondary" size="sm" disabled={readOnly} onClick={()=>onFinish(task,true,true)}><SkipForward size={15}/> Pular ocorrência</Button>}
    </div>
   </li>;
  })}</ul>
  {edit&&<TaskEditor task={edit==='new'?undefined:edit} categories={categories} canPriority={priorityCount(tasks)<MAX_PRIORITIES} onSave={draft=>onSave(draft,edit==='new'?undefined:edit)} onDismiss={()=>setEdit(undefined)}/>}
  {preview&&preview.source&&<Dialog title={meeting(preview.source)?'Entrar no '+sources[preview.source]:'E-mail do '+sources[preview.source]} description={preview.title} onDismiss={()=>setPreview(undefined)}>
   {previewExample?.sender&&<div className="planning-email"><strong>{previewExample.sender}</strong><p>{previewExample.excerpt}</p></div>}
   <p>{preview.description}</p>{preview.sourceUrl&&httpsLink(preview.sourceUrl)?<a href={httpsLink(preview.sourceUrl)} target="_blank" rel="noreferrer">Abrir link informado</a>:<p>Demonstração com dados fictícios.</p>}
   <footer className="dialog-actions"><Button onClick={()=>setPreview(undefined)}>Fechar</Button></footer>
  </Dialog>}
 </section>;
}

export function TaskDeadlines({tasks,onOpenTasks}:{tasks:Task[];onOpenTasks:()=>void}){
 const deadlines=tasks.filter(task=>!task.done&&task.dueDate).sort((a,b)=>a.dueDate!.localeCompare(b.dueDate!));
 if(!deadlines.length)return null;
 return <section className="activity-surface planning-page task-deadlines">
  <header className="activity-section-head"><h2>Prazos de tarefas</h2><Button variant="secondary" size="sm" onClick={onOpenTasks}>Ver tarefas</Button></header>
  <ul className="planning-list">{deadlines.slice(0,7).map(task=><li className="planning-row" key={task.id}><strong>{task.title}</strong><time dateTime={task.dueDate}>{dateLabel(task.dueDate!)}</time></li>)}</ul>
 </section>;
}
