import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Dialog, Field } from './ui';
import { dateAtNoon, dayKey, shiftDay, weekdays } from './task-planning';

export interface Habit { id:number; title:string; days:number[]; checks:string[]; archived?:boolean }

function currentStreak(habit:Habit,today:string){
 if(!habit.checks.length)return 0;
 const checks=new Set(habit.checks);
 let date=checks.has(today)?today:shiftDay(today,-1);
 let count=0;
 while(true){
  if(habit.days.includes(dateAtNoon(date).getDay())){
   if(!checks.has(date))return count;
   count+=1;
  }
  date=shiftDay(date,-1);
 }
}

export function HabitsPage({habits,readOnly,onChange}:{habits:Habit[];readOnly:boolean;onChange:(next:Habit[])=>void}){
 const [edit,setEdit]=useState<Habit>();
 const today=dayKey();
 const dates=Array.from({length:7},(_,i)=>shiftDay(today,i-6));
 const todayIndex=dateAtNoon(today).getDay();
 function save(habit:Habit){
  onChange(habits.some(item=>item.id===habit.id)?habits.map(item=>item.id===habit.id?habit:item):[...habits,habit]);
 }
 return <section className="activity-surface planning-page">
  <header className="activity-section-head"><div><h2>Meus hábitos</h2><small>{habits.filter(habit=>!habit.archived&&habit.days.includes(todayIndex)&&habit.checks.includes(today)).length} feitos hoje</small></div>
   <Button disabled={readOnly} onClick={()=>setEdit({id:Math.max(0,...habits.map(habit=>habit.id))+1,title:'',days:[0,1,2,3,4,5,6],checks:[]})}><Plus size={16}/> Novo hábito</Button></header>
  {!habits.length&&<p className="planning-empty">Adicione um hábito para acompanhar sua rotina.</p>}
  <ul className="planning-list">{habits.map(habit=><li className="planning-habit" key={habit.id}>
   <div><strong>{habit.title}</strong><small>{habit.archived?'Arquivado':habit.days.map(day=>weekdays[day]).join(', ')}</small>{!habit.archived&&<small>Sequência: {currentStreak(habit,today)} marcações</small>}</div>
   <div className="planning-habit-days">{dates.map(date=>{
    const day=dateAtNoon(date);const checked=habit.checks.includes(date);
    return <label key={date} title={day.toLocaleDateString('pt-BR')}>
     <span>{weekdays[day.getDay()]}</span><input type="checkbox" checked={checked} disabled={readOnly||habit.archived||!checked&&!habit.days.includes(day.getDay())}
      aria-label={habit.title+' em '+day.toLocaleDateString('pt-BR')} onChange={e=>save({...habit,checks:e.target.checked?[...habit.checks,date]:habit.checks.filter(check=>check!==date)})}/>
    </label>;
   })}</div>
   <div className="planning-actions"><Button variant="secondary" size="sm" disabled={readOnly} onClick={()=>setEdit(habit)}>Editar</Button><Button variant="secondary" size="sm" disabled={readOnly} onClick={()=>save({...habit,archived:!habit.archived})}>{habit.archived?'Reativar':'Arquivar'}</Button></div>
  </li>)}</ul>
  {edit&&<Dialog title={habits.some(habit=>habit.id===edit.id)?'Editar hábito':'Novo hábito'} onDismiss={()=>setEdit(undefined)}>
   <form className="dialog-form" onSubmit={e=>{e.preventDefault();if(!edit.title.trim()||!edit.days.length)return;save({...edit,title:edit.title.trim()});setEdit(undefined);}}>
    <Field label="Nome do hábito" required maxLength={80} value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})}/>
    <fieldset className="planning-weekdays"><legend>Dias da semana</legend>{weekdays.map((day,i)=><label key={day}><input type="checkbox" checked={edit.days.includes(i)} onChange={e=>setEdit({...edit,days:e.target.checked?[...edit.days,i].sort():edit.days.filter(day=>day!==i)})}/>{day}</label>)}</fieldset>
    <footer className="dialog-actions"><Button variant="secondary" onClick={()=>setEdit(undefined)}>Cancelar</Button><Button type="submit" disabled={!edit.days.length||!edit.title.trim()}>Salvar hábito</Button></footer>
   </form>
  </Dialog>}
 </section>;
}
