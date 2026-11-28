import {useState} from 'react';
import {CalendarDays,Clock,Timer} from 'lucide-react';
import {Button,Dialog,SelectField} from './ui';
import {fullDay,timeLabel} from './calendar-model';
import {taskContext,readingContext,type Task,type Category,type Book,type FocusContext} from './activity-model';
import {type FocusBlock} from './planning-model';
export function PlanFocusDialog({day,slot,tasks,categories,books,initialTask,preferredMinutes,onSave,onDismiss}:{day:string;slot:{start:number;end:number};tasks:Task[];categories:Category[];books:Book[];initialTask?:number;preferredMinutes:number;onSave:(b:FocusBlock)=>string|null;onDismiss:()=>void}){
 const contexts:FocusContext[]=[...tasks.filter(t=>!t.done).flatMap(t=>{const c=taskContext(t,categories);return c?[c]:[]}),...categories.map(c=>({kind:'activity' as const,id:c.id,title:c.name,label:c.name,categoryId:c.id})),...books.map(readingContext)];
 const key=(c:FocusContext)=>c.kind+':'+c.id;
 const [selected,setSelected]=useState(contexts.find(c=>c.kind==='task'&&c.id===String(initialTask))? 'task:'+initialTask:contexts[0]?key(contexts[0]):'');
 const lengths=[...new Set([15,25,50,Math.max(5,Math.min(120,Math.round(preferredMinutes)))])].filter(n=>n<=slot.end-slot.start).sort((a,b)=>a-b);
 const [minutes,setMinutes]=useState(lengths.includes(preferredMinutes)?String(preferredMinutes):String(lengths[0]??15));
 const [start,setStart]=useState(String(slot.start));
 const [error,setError]=useState('');
 const duration=Number(minutes),starts=Array.from({length:Math.max(0,Math.floor((slot.end-slot.start-duration)/5)+1)},(_,i)=>slot.start+i*5);
 const actualStart=starts.includes(Number(start))?Number(start):starts[0]??slot.start;
 return <Dialog className="compact-dialog" title="Planejar bloco de foco" description="Reserve um intervalo local na agenda de demonstração." onDismiss={onDismiss}><form className="dialog-form" onSubmit={e=>{e.preventDefault();const context=contexts.find(c=>key(c)===selected);if(!context||!starts.length){setError('Escolha uma atividade e um horário válido.');return}const result=onSave({id:crypto.randomUUID(),day,start:actualStart,end:actualStart+duration,context});if(result)setError(result);else onDismiss()}}>
 <div className="plan-window"><CalendarDays size={17}/><span><b>{fullDay(day)}</b><small>{timeLabel(slot.start)} – {timeLabel(slot.end)} disponível</small></span></div>
 <SelectField label="Atividade planejada" value={selected} options={contexts.map(c=>({value:key(c),label:(c.kind==='task'?'Tarefa':c.kind==='reading'?'Leitura':'Categoria')+' · '+c.title}))} onValueChange={setSelected}/>
 <div className="compact-field-pair"><SelectField label="Duração do bloco" value={minutes} options={lengths.map(n=>({value:String(n),label:n+' min'}))} onValueChange={setMinutes}/>
 <SelectField label="Horário de início" value={String(actualStart)} options={starts.map(n=>({value:String(n),label:timeLabel(n)}))} onValueChange={setStart}/></div>
 <div className="plan-preview"><Clock size={16}/> {timeLabel(actualStart)} – {timeLabel(actualStart+duration)} <Timer size={15}/> {duration} min</div>
 {error&&<p role="alert" className="activity-error">{error}</p>}
 <footer className="dialog-actions"><Button variant="secondary" onClick={onDismiss}>Cancelar</Button><Button type="submit" disabled={!selected||!starts.length}>Reservar bloco</Button></footer></form></Dialog>
}
