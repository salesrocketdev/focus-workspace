import { useState } from 'react';
import { FocusTrend,CategoryChart,GoalChart } from './charts';
import {exportHistory} from './backup-model';
import { Timer,Target,CheckCircle2,Flame,ChartNoAxesColumn,History,ChevronRight,CalendarDays,Filter,Clock,Download } from 'lucide-react';
import { Button,Dialog,SelectField } from './ui';
import { dateLabel,DEMO_DAY } from './calendar-model';
import { dayKey } from './task-planning';
import { categoryTotals,dailyTotals,durationLabel,filterPeriod,newest,streak,totalSeconds,type FocusRecord } from './history-model';
const colors:Record<string,string>={work:'#8ba9d1',study:'#b2a0d1',reading:'#79b384',personal:'#e7a16e'};
const color=(id:string)=>colors[id]??'#c0a591';
const ranges=[{value:1,label:'Hoje'},{value:7,label:'7 dias'},{value:30,label:'30 dias'}];
export function HistoryPage({records,goal,onPrepare}:{records:FocusRecord[];goal:number;mobile?:boolean;onPrepare?:()=>void}){
 const [range,setRange]=useState(7);
 const [sample,setSample]=useState(()=>records.some(r=>r.origin==='fixture')&&!records.some(r=>r.origin==='session'));
 const hasExamples=records.some(r=>r.origin==='fixture');
 const demo=sample&&hasExamples;
 const anchor=demo?DEMO_DAY:dayKey();
 const visibleRecords=records.filter(r=>r.origin===(demo?'fixture':'session'));
 const legacyCount=records.filter(r=>r.origin==='session'&&r.day===DEMO_DAY).length;
 const [category,setCategory]=useState('all');
 const [status,setStatus]=useState('all');
 const [mode,setMode]=useState('all');
 const [limit,setLimit]=useState(8);
 const [filterDraft,setFilterDraft]=useState<{category:string;mode:string;status:string}|null>(null);
 const activeFilters=[category,mode,status].filter(v=>v!=='all').length;
 const [selected,setSelected]=useState<FocusRecord|null>(null);
 const period=filterPeriod(visibleRecords,range,anchor);
 const items=period.filter(r=>(category==='all'||r.categoryId===category)&&(status==='all'||r.status===status)&&(mode==='all'||r.mode===mode));
 const total=totalSeconds(items),days=dailyTotals(items,range,anchor),groups=categoryTotals(items);
 const today=totalSeconds(filterPeriod(visibleRecords,1,anchor));
 const allCategories=categoryTotals(visibleRecords);
 const ordered=newest(items);
 function resetLimit(){setLimit(8)}
 return <div className="history-page">
  {hasExamples&&<div className="history-origin-switch" role="group" aria-label="Origem dos registros"><button type="button" aria-pressed={!demo} onClick={()=>{setSample(false);setCategory('all');setMode('all');setStatus('all');resetLimit()}}>Minhas sessões</button><button type="button" aria-pressed={demo} onClick={()=>{setSample(true);setCategory('all');setMode('all');setStatus('all');resetLimit()}}>Exemplos</button></div>}
  <div className="history-toolbar"><div className="history-ranges" role="group" aria-label="Período do histórico">{ranges.map(r=><button key={r.value} aria-pressed={range===r.value} onClick={()=>{setRange(r.value);resetLimit()}}>{r.label}</button>)}</div>{<Button className="history-filter-trigger" variant="secondary" aria-label="Abrir filtros do histórico" onClick={()=>setFilterDraft({category,mode,status})}><Filter size={16}/><span>Filtros</span>{activeFilters>0&&<span className="history-filter-count">{activeFilters}</span>}</Button>}<small><CalendarDays size={15}/> Até {dateLabel(anchor,{day:'numeric',month:'long',year:'numeric'})}{demo?' · exemplos':''}</small></div>
  {activeFilters>0&&<div className="history-active-filters"><small>{activeFilters} {activeFilters===1?'filtro aplicado':'filtros aplicados'}</small><button type="button" onClick={()=>{setCategory('all');setMode('all');setStatus('all');resetLimit()}}>Limpar filtros</button></div>}
  {filterDraft&&<Dialog title="Filtros do histórico" onDismiss={()=>setFilterDraft(null)}><div className="history-filter-sheet"><SelectField label="Categoria do histórico" value={filterDraft.category} onValueChange={v=>setFilterDraft({...filterDraft,category:v})} options={[{value:'all',label:'Todas'},...allCategories.map(c=>({value:c.id,label:c.label}))]}/><SelectField label="Método do histórico" value={filterDraft.mode} onValueChange={v=>setFilterDraft({...filterDraft,mode:v})} options={[{value:'all',label:'Todos'},{value:'Pomodoro',label:'Pomodoro'},{value:'Livre',label:'Livre'}]}/><SelectField label="Status do histórico" value={filterDraft.status} onValueChange={v=>setFilterDraft({...filterDraft,status:v})} options={[{value:'all',label:'Todos'},{value:'completed',label:'Concluídas'},{value:'interrupted',label:'Interrompidas'}]}/><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setFilterDraft({category:'all',mode:'all',status:'all'})}>Limpar</Button><Button onClick={()=>{setCategory(filterDraft.category);setMode(filterDraft.mode);setStatus(filterDraft.status);resetLimit();setFilterDraft(null)}}>Aplicar filtros</Button></footer></div></Dialog>}
  <div className="history-stats">
   {[{label:'Tempo de foco',value:durationLabel(total),Icon:Timer,tone:'orange'},{label:'Sessões registradas',value:String(items.length),Icon:CheckCircle2,tone:'green'},{label:'Média por dia',value:durationLabel(Math.floor(total/range)),Icon:ChartNoAxesColumn,tone:'lavender'},{label:'Sequência atual',value:streak(visibleRecords,anchor)+' '+(streak(visibleRecords,anchor)===1?'dia':'dias'),Icon:Flame,tone:'orange'}].map(s=><article className="history-stat" key={s.label}><span className={'activity-stat-icon tone-'+s.tone}><s.Icon size={20}/></span><div><small>{s.label}</small><strong>{s.value}</strong></div></article>)}
  </div>
  <div className="history-charts"><section className="history-surface focus-trend-card"><header><h2><ChartNoAxesColumn size={18}/> Evolução do foco</h2><small>Tempo por dia · toque ou selecione uma data</small></header>
   <FocusTrend days={days}/>
  </section><section className="history-surface"><header><h2><Target size={18}/> Meta de hoje</h2><small>{demo?'Meta ilustrativa · dados de exemplo':'Todos os registros de hoje, independentemente dos filtros'}</small></header><GoalChart seconds={today} goal={goal*60}/></section></div>
  <section className="history-surface"><header><h2>Distribuição por categoria</h2><small>Tempo de foco no período e filtros selecionados</small></header>{groups.length?<CategoryChart groups={groups} total={total} color={color}/>:<p className="history-empty">Sem dados para os filtros selecionados.</p>}</section>
  <section className="history-surface"><header className="history-export-header"><div className="history-export-copy"><h2><History size={18}/> Sessões de foco</h2><small>{items.length} {items.length===1?'registro':'registros'} · pausas não contabilizadas</small></div><Button variant="secondary" size="sm" className="history-export-action" title="Exportar sessões filtradas em CSV" disabled={!items.length} onClick={()=>exportHistory(ordered)}><Download size={15}/> CSV</Button></header><div className="history-list">{ordered.slice(0,limit).map(r=><button key={r.id} className="history-session" onClick={()=>setSelected(r)} aria-label={'Detalhes de '+r.title}><span className="history-session-mark" style={{background:color(r.categoryId)}}/><span className="history-session-copy"><b>{r.title}</b><small>{r.category} · {dateLabel(r.day,{day:'numeric',month:'numeric'})} às {r.time}{r.origin==='session'?' · Sessão local':''}</small></span><span className="history-session-meta"><b>{durationLabel(r.seconds)}</b><small>{r.mode}</small></span>{r.status==='interrupted'?<span className="history-status interrupted">Interrompida</span>:<span className="history-status-spacer"/>}<ChevronRight size={15}/></button>)}</div>{!items.length&&<div className="history-empty"><Clock size={28}/><b>Nenhuma sessão encontrada</b><small>{visibleRecords.length?'Experimente outro período ou filtro.':'Seu tempo de foco aparecerá aqui após a primeira sessão.'}</small>{!visibleRecords.length&&onPrepare&&<Button variant="secondary" size="sm" onClick={onPrepare}>Abrir primeira sessão</Button>}</div>}{ordered.length>limit&&<Button variant="secondary" onClick={()=>setLimit(n=>n+8)}>Mostrar mais sessões</Button>}</section>
  <small className="history-note">{demo?'Exemplos não entram na meta real nem nas suas estatísticas.':'Sessões locais usam a data do dispositivo.'}</small>
  {!demo&&legacyCount>0&&<small className="history-note">Registros antigos em 29/01/2025 foram preservados. A data original de versões anteriores pode não ser recuperável; consulte o CSV completo em Dados e backup.</small>}
  {selected&&<Dialog title={selected.title} description={selected.origin==='fixture'?'Registro de demonstração':'Sessão salva neste navegador'} onDismiss={()=>setSelected(null)}><dl className="history-detail"><div><dt>Categoria</dt><dd>{selected.category}</dd></div><div><dt>Tempo de foco</dt><dd>{durationLabel(selected.seconds)}</dd></div><div><dt>Método</dt><dd>{selected.mode}</dd></div><div><dt>Status</dt><dd>{selected.status==='completed'?'Concluída':'Interrompida'}</dd></div><div><dt>Data</dt><dd>{dateLabel(selected.day,{day:'numeric',month:'long'})} · {selected.time}</dd></div></dl><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setSelected(null)}>Fechar</Button></footer></Dialog>}
 </div>;
}
