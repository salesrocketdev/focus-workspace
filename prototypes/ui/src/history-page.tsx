import { useState } from 'react';
import { FocusTrend,CategoryChart,GoalChart } from './charts';
import {exportHistory} from './backup-model';
import { Timer,Target,CheckCircle2,Flame,ChartNoAxesColumn,History,ChevronRight,CalendarDays,Filter,Clock,Download } from 'lucide-react';
import { Button,Dialog,SelectField } from './ui';
import { dateLabel,DEMO_DAY } from './calendar-model';
import { categoryTotals,dailyTotals,durationLabel,filterPeriod,newest,streak,totalSeconds,type FocusRecord } from './history-model';
const colors:Record<string,string>={work:'#8ba9d1',study:'#b2a0d1',reading:'#79b384',personal:'#e7a16e'};
const color=(id:string)=>colors[id]??'#c0a591';
const ranges=[{value:1,label:'Hoje'},{value:7,label:'7 dias'},{value:30,label:'30 dias'}];
export function HistoryPage({records,goal,mobile=false}:{records:FocusRecord[];goal:number;mobile?:boolean}){
 const [range,setRange]=useState(7);
 const [category,setCategory]=useState('all');
 const [status,setStatus]=useState('all');
 const [mode,setMode]=useState('all');
 const [limit,setLimit]=useState(8);
 const [filterDraft,setFilterDraft]=useState<{category:string;mode:string;status:string}|null>(null);
 const activeFilters=[category,mode,status].filter(v=>v!=='all').length;
 const [selected,setSelected]=useState<FocusRecord|null>(null);
 const period=filterPeriod(records,range);
 const items=period.filter(r=>(category==='all'||r.categoryId===category)&&(status==='all'||r.status===status)&&(mode==='all'||r.mode===mode));
 const total=totalSeconds(items),days=dailyTotals(items,range),groups=categoryTotals(items);
 const today=totalSeconds(filterPeriod(records,1));
 const allCategories=categoryTotals(records);
 const ordered=newest(items);
 function resetLimit(){setLimit(8)}
 return <div className="history-page">
  <div className="history-toolbar"><div className="history-ranges" role="group" aria-label="Período do histórico">{ranges.map(r=><button key={r.value} aria-pressed={range===r.value} onClick={()=>{setRange(r.value);resetLimit()}}>{r.label}</button>)}</div>{mobile&&<Button className="history-filter-trigger" variant="secondary" aria-label="Abrir filtros do histórico" onClick={()=>setFilterDraft({category,mode,status})}><Filter size={16}/><span>Filtros</span>{activeFilters>0&&<span className="history-filter-count">{activeFilters}</span>}</Button>}<small><CalendarDays size={15}/> Até {dateLabel(DEMO_DAY,{day:'numeric',month:'long',year:'numeric'})} · demonstração</small></div>
  {!mobile&&<div className="history-filters"><span><Filter size={15}/> Filtros</span><SelectField label="Categoria do histórico" compact value={category} onValueChange={v=>{setCategory(v);resetLimit()}} options={[{value:'all',label:'Todas'},...allCategories.map(c=>({value:c.id,label:c.label}))]}/><SelectField label="Método do histórico" compact value={mode} onValueChange={v=>{setMode(v);resetLimit()}} options={[{value:'all',label:'Todos'},{value:'Pomodoro',label:'Pomodoro'},{value:'Livre',label:'Livre'}]}/><SelectField label="Status do histórico" compact value={status} onValueChange={v=>{setStatus(v);resetLimit()}} options={[{value:'all',label:'Todos'},{value:'completed',label:'Concluídas'},{value:'interrupted',label:'Interrompidas'}]}/></div>}
  {mobile&&activeFilters>0&&<div className="history-active-filters"><small>{activeFilters} filtro(s) aplicado(s)</small><button type="button" onClick={()=>{setCategory('all');setMode('all');setStatus('all');resetLimit()}}>Limpar filtros</button></div>}
  {mobile&&filterDraft&&<Dialog title="Filtros do histórico" description="Refine os registros de concentração." onDismiss={()=>setFilterDraft(null)}><div className="history-filter-sheet"><SelectField label="Categoria do histórico" value={filterDraft.category} onValueChange={v=>setFilterDraft({...filterDraft,category:v})} options={[{value:'all',label:'Todas'},...allCategories.map(c=>({value:c.id,label:c.label}))]}/><SelectField label="Método do histórico" value={filterDraft.mode} onValueChange={v=>setFilterDraft({...filterDraft,mode:v})} options={[{value:'all',label:'Todos'},{value:'Pomodoro',label:'Pomodoro'},{value:'Livre',label:'Livre'}]}/><SelectField label="Status do histórico" value={filterDraft.status} onValueChange={v=>setFilterDraft({...filterDraft,status:v})} options={[{value:'all',label:'Todos'},{value:'completed',label:'Concluídas'},{value:'interrupted',label:'Interrompidas'}]}/><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setFilterDraft({category:'all',mode:'all',status:'all'})}>Limpar</Button><Button onClick={()=>{setCategory(filterDraft.category);setMode(filterDraft.mode);setStatus(filterDraft.status);resetLimit();setFilterDraft(null)}}>Aplicar filtros</Button></footer></div></Dialog>}
  <div className="history-stats">
   {[{label:'Tempo de foco',value:durationLabel(total),Icon:Timer,tone:'orange'},{label:'Sessões registradas',value:String(items.length),Icon:CheckCircle2,tone:'green'},{label:'Média por dia',value:durationLabel(Math.floor(total/range)),Icon:ChartNoAxesColumn,tone:'lavender'},{label:'Sequência atual',value:streak(records)+' dias',Icon:Flame,tone:'orange'}].map(s=><article className="history-stat" key={s.label}><span className={'activity-stat-icon tone-'+s.tone}><s.Icon size={20}/></span><div><small>{s.label}</small><strong>{s.value}</strong></div></article>)}
  </div>
  <div className="history-charts"><section className="history-surface focus-trend-card"><header><h2><ChartNoAxesColumn size={18}/> Evolução do foco</h2><small>Tempo por dia · toque ou selecione uma data</small></header>
   <FocusTrend days={days}/>
  </section><section className="history-surface"><header><h2><Target size={18}/> Meta de hoje</h2><small>Todos os registros de hoje, independente dos filtros</small></header><GoalChart seconds={today} goal={goal*60}/></section></div>
  <section className="history-surface"><header><h2>Distribuição por categoria</h2><small>Tempo de foco no período e filtros selecionados</small></header>{groups.length?<CategoryChart groups={groups} total={total} color={color}/>:<p className="history-empty">Sem dados para os filtros selecionados.</p>}</section>
  <section className="history-surface"><header className="history-export-header"><div className="history-export-copy"><h2><History size={18}/> Sessões de foco</h2><small>{items.length} registro(s) · pausas não contabilizadas</small></div><Button variant="secondary" size="sm" className="history-export-action" title="Exportar sessões filtradas em CSV" disabled={!items.length} onClick={()=>exportHistory(ordered)}><Download size={15}/> CSV</Button></header><div className="history-list">{ordered.slice(0,limit).map(r=><button key={r.id} className="history-session" onClick={()=>setSelected(r)} aria-label={'Detalhes de '+r.title}><span className="history-session-mark" style={{background:color(r.categoryId)}}/><span className="history-session-copy"><b>{r.title}</b><small>{r.category} · {dateLabel(r.day,{day:'numeric',month:'numeric'})} às {r.time}{r.origin==='session'?' · Sessão local':''}</small></span><span className="history-session-meta"><b>{durationLabel(r.seconds)}</b><small>{r.mode}</small></span><span className={'history-status '+r.status}>{r.status==='completed'?'Concluída':'Interrompida'}</span><ChevronRight size={15}/></button>)}</div>{!items.length&&<div className="history-empty"><Clock size={28}/><b>Nenhuma sessão encontrada</b><small>Experimente outro período ou filtro.</small></div>}{ordered.length>limit&&<Button variant="secondary" onClick={()=>setLimit(n=>n+8)}>Mostrar mais sessões</Button>}</section>
  <small className="history-note">Histórico de demonstração e sessões locais salvas neste navegador. A data de referência continua fixa.</small>
  {selected&&<Dialog title={selected.title} description={selected.origin==='fixture'?'Registro de demonstração':'Sessão registrada nesta execução'} onDismiss={()=>setSelected(null)}><dl className="history-detail"><div><dt>Categoria</dt><dd>{selected.category}</dd></div><div><dt>Tempo de foco</dt><dd>{durationLabel(selected.seconds)}</dd></div><div><dt>Método</dt><dd>{selected.mode}</dd></div><div><dt>Status</dt><dd>{selected.status==='completed'?'Concluída':'Interrompida'}</dd></div><div><dt>Data de demonstração</dt><dd>{dateLabel(selected.day,{day:'numeric',month:'long'})} · {selected.time}</dd></div></dl><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setSelected(null)}>Fechar</Button></footer></Dialog>}
 </div>;
}
