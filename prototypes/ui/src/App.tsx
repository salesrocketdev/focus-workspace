import { useEffect, useRef, useState } from 'react';
import { Home, CalendarDays, Layers, History, Settings, Sun, LayoutGrid, ArrowLeft, Plus, X, Grip, ChevronUp, ChevronDown, RotateCcw, Play, Pause, SkipBack, SkipForward, Heart, Volume2, BookOpen, Flame, Timer, Music2, Bell, Check, Maximize2, Ellipsis, ChevronRight } from 'lucide-react';
import { Brand, Ring, Segment, Card, Cover, Progress, AgendaRows, Transport, icons } from './components';
import { EditIconButton, EditTextButton, EditCardToolbar, WidgetSizeOptions, EditPreview, AddWidgetTile } from './editor';
import { PageHeader, MobileMasthead } from './layout';
import { CalendarPage } from './calendar-page';
import { ActivitiesPage,CategoryMark } from './activities-page';
import { initialCategories,initialTasks,initialBooks,initialContext,readingContext,sameContext,progressOf,type Book,type FocusContext } from './activity-model';
import { ProviderIcon, ProviderLabel } from './provider-icons';
import { Button, Field, Dialog, SelectField, Notice } from './ui';
import { available, changePreset, compactVertical, displaced, endRow, firstFree, GRID_BREAKPOINT, gridStyle, planPlacement, preset, resolveLayout } from './grid-model';
import { GridGhost, pointerPlacement, useGridGesture, useGridMotion, type Preview } from './grid-editor';
import { catalogue, defaultLayout, loadLayouts, move, STORAGE, tasksInitial, type Widget, type Size, type WidgetType } from './model';

type View='today'|'edit'|'focus'|'calendar'|'activities'|'history'|'settings';
const navigation=[{id:'today',title:'Hoje',icon:Home},{id:'calendar',title:'Agenda',icon:CalendarDays},{id:'activities',title:'Atividades',icon:Layers},{id:'history',title:'Histórico',icon:History},{id:'settings',title:'Configurações',icon:Settings}] as const;
const sizes:Size[]=['small','medium','large'];
const titles:Record<WidgetType,string>={focus:'Foco (Pomodoro)',agenda:'Agenda de hoje',tasks:'Tarefas',reading:'Leitura em andamento',goal:'Meta diária de foco',music:'Música',summary:'Resumo de hoje',notes:'Notas',next:'Próximo compromisso',recent:'Sessões recentes'};
const fixtureDate='Quarta-feira, 29 de janeiro';

export function App(){
 const [view,setView]=useState<View>('today');
 const [layouts,setLayouts]=useState(loadLayouts);
 const [mobile,setMobile]=useState(()=>window.innerWidth<760);
 const [wide,setWide]=useState(()=>window.innerWidth>=GRID_BREAKPOINT);
 const [draft,setDraft]=useState<Widget[]|null>(null);
 const [editKey,setEditKey]=useState<'desktop'|'mobile'>('desktop');
 const [selected,setSelected]=useState('focus');
 const [openMenu,setOpenMenu]=useState<string|null>(null);
 const [pushNeighbors,setPushNeighbors]=useState(false);
 const [cataloguePreview,setCataloguePreview]=useState<Preview|null>(null);
 const catalogueDrag=useRef<Widget|null>(null);
 const [query,setQuery]=useState('');
 const [showCatalogue,setShowCatalogue]=useState(false);
 const [message,setMessage]=useState('');
 const [mode,setMode]=useState<'Pomodoro'|'Livre'>('Pomodoro');
 const [duration,setDuration]=useState(1500);
 const [seconds,setSeconds]=useState(1500);
 const [running,setRunning]=useState(false);
 const clock=useRef<number>(0);
 const [tasks,setTasks]=useState(initialTasks);
 const [categories,setCategories]=useState(initialCategories);
 const [books,setBooks]=useState(initialBooks);
 const [readingId,setReadingId]=useState(initialBooks[0].id);
 const [focusContext,setFocusContext]=useState<FocusContext>(initialContext);
 const readingBook=books.find(b=>b.id===readingId)??books[0];
 const page=readingBook.page;
 const setPage=(n:number)=>setBooks(old=>old.map(b=>b.id===readingBook.id?{...b,page:n}:b));
 const [music,setMusic]=useState(false);
 const [favorite,setFavorite]=useState(false);
 const [volume,setVolume]=useState(65);
 const [track,setTrack]=useState(0);
 const [notes,setNotes]=useState('');
 const [showProgress,setShowProgress]=useState(false);
 const [pageInput,setPageInput]=useState('72');
 const [completed,setCompleted]=useState(0);
 const key=mobile?'mobile':'desktop';
 const editing=view==='edit';
 const rawWidgets=editing && draft ? draft : layouts[key];
 const freeGrid=wide&&(!editing||editKey==='desktop');
 const widgets=freeGrid?resolveLayout(rawWidgets):rawWidgets;
 const gesture=useGridGesture(widgets,editing&&freeGrid,pushNeighbors,setDraft,()=>setMessage('Espaço ocupado. O widget permaneceu na posição anterior.'));
 useGridMotion(gesture.gridRef,editing&&freeGrid&&!gesture.preview&&!cataloguePreview);
 const activePreview=gesture.preview??cataloguePreview;
 const addPlacement=freeGrid&&editing?firstFree(3,3,widgets.flatMap(w=>w.placement?[w.placement]:[])):null;
 useEffect(()=>{const fn=()=>{setMobile(window.innerWidth<760);setWide(window.innerWidth>=GRID_BREAKPOINT)};window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[]);
 useEffect(()=>{if(!running)return;const tick=()=>{const elapsed=Math.floor((Date.now()-clock.current)/1000);const value=mode==='Livre'?elapsed:Math.max(0,duration-elapsed);setSeconds(value);if(mode!=='Livre'&&value===0){setRunning(false);setCompleted(c=>c+1);setMessage('Sessão concluída.')}};const id=window.setInterval(tick,250);tick();return()=>window.clearInterval(id)},[running,mode,duration]);
 function setMethod(value:'Pomodoro'|'Livre'){if(running)return;setMode(value);setSeconds(value==='Livre'?0:duration)}
 function toggle(){if(running){setRunning(false);return}if(mode==='Pomodoro'&&seconds===0){setSeconds(duration);clock.current=Date.now();setRunning(true);return}clock.current=Date.now()-(mode==='Livre'?seconds:duration-seconds)*1000;setRunning(true)}
 function reset(){setRunning(false);setSeconds(mode==='Livre'?0:duration)}
 function stop(){setRunning(false);if((mode==='Livre'&&seconds>0)||(mode!=='Livre'&&seconds<duration))setCompleted(c=>c+1);reset();setMessage('Sessão encerrada (demo).')}
 function navigate(next:View){if(editing&&next!=='edit'){setMessage('Salve ou cancele a edição antes de sair.');return}setView(next)}
 function startEdit(){setOpenMenu(null);setPushNeighbors(false);setCataloguePreview(null);catalogueDrag.current=null;setQuery('');setEditKey(key);setDraft((key==='desktop'?resolveLayout(layouts[key]):layouts[key]).map(w=>({...w,placement:w.placement?{...w.placement}:undefined})));setSelected(layouts[key][0]?.id??'');setShowCatalogue(false);setView('edit')}
 function closeEdit(save:boolean){setOpenMenu(null);setCataloguePreview(null);catalogueDrag.current=null;if(save&&draft){const next={...layouts,[editKey]:editKey==='desktop'?resolveLayout(draft):draft};try{localStorage.setItem(STORAGE,JSON.stringify(next))}catch{setMessage('Não foi possível salvar no navegador.');return}setLayouts(next);setMessage('Painel salvo.')}setDraft(null);setView('today')}
 function resize(id:string,size:Size){setDraft(old=>old?(editKey==='desktop'?changePreset(old,id,size):old.map(w=>w.id===id?{...w,size}:w)):null)}
 function nudge(id:string,dx:number,dy:number,resize=false){const current=widgets.find(w=>w.id===id);if(!current?.placement)return;const p=current.placement;const next=resize?{...p,w:p.w+dx,h:p.h+dy}:{...p,x:p.x+dx,y:p.y+dy};const plan=planPlacement(widgets,current,next,pushNeighbors);if(!plan){setMessage('Limite da grade ou espaço ocupado.');return}setDraft(plan)}
 function shift(id:string,delta:number){if(freeGrid){nudge(id,0,delta);return}setDraft(old=>{if(!old)return old;const i=old.findIndex(w=>w.id===id);return old[i+delta]?move(old,id,old[i+delta].id).map(w=>({...w,placement:undefined})):old})}
 function add(type:WidgetType){if(draft?.some(w=>w.type===type)){setMessage('Este widget já está no painel.');return}const w={id:type,type,size:catalogue.find(c=>c.type===type)!.size};setDraft(old=>editKey==='desktop'?resolveLayout([...(old??[]),w]):[...(old??[]),w]);setSelected(w.id);setOpenMenu(null)}

 function startCatalogueDrag(e:React.DragEvent<HTMLButtonElement>,type:WidgetType){
  if(!freeGrid||draft?.some(w=>w.type===type)){e.preventDefault();return}
  catalogueDrag.current={id:type,type,size:catalogue.find(c=>c.type===type)!.size};
  e.dataTransfer.setData('application/x-focus-widget',type);
  e.dataTransfer.effectAllowed='copy';setOpenMenu(null);
 }
 function cataloguePlan(e:React.DragEvent<HTMLDivElement>){
  const item=catalogueDrag.current;if(!item||!gesture.gridRef.current||!freeGrid||!editing)return null;
  const p=pointerPlacement(gesture.gridRef.current,e.clientX,e.clientY,preset(item.type,item.size));
  const plan=planPlacement(widgets,item,p,pushNeighbors);
  return {item,p,plan};
 }
 function previewCatalogue(e:React.DragEvent<HTMLDivElement>){
  const result=cataloguePlan(e);if(!result)return;
  e.preventDefault();e.dataTransfer.dropEffect=result.plan?'copy':'none';
  setCataloguePreview({id:result.item.id,kind:'add',placement:result.p,valid:!!result.plan,displaced:result.plan?displaced(widgets,result.plan,result.item.id):[]});
 }
 function dropCatalogue(e:React.DragEvent<HTMLDivElement>){
  const result=cataloguePlan(e);if(!result)return;
  e.preventDefault();setCataloguePreview(null);catalogueDrag.current=null;
  if(result.plan){setDraft(result.plan);setSelected(result.item.id);setOpenMenu(null)}
  else setMessage('Espaço ocupado. Nenhum widget foi adicionado.');
 }
 function compactGrid(){
  if(!freeGrid)return;setOpenMenu(null);setDraft(compactVertical(widgets));setMessage('Espaços verticais compactados.');
 }
 function remove(id:string){setOpenMenu(null);setDraft(old=>old?.filter(w=>w.id!==id)??null);if(selected===id)setSelected('')}
 function beginResize(e:React.PointerEvent<HTMLButtonElement>,id:string,size:Size){e.stopPropagation();e.preventDefault();const start=e.clientX;const el=e.currentTarget as HTMLButtonElement;el.setPointerCapture(e.pointerId);const finish=(ev:PointerEvent)=>{const delta=ev.clientX-start;if(Math.abs(delta)>24){const index=Math.max(0,Math.min(2,sizes.indexOf(size)+(delta>0?1:-1)));resize(id,sizes[index])}el.removeEventListener('pointerup',finish);el.removeEventListener('pointercancel',cancel)};const cancel=()=>{el.removeEventListener('pointerup',finish);el.removeEventListener('pointercancel',cancel)};el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',cancel)}
 const pct=progressOf(readingBook);
 const hasSession=running||(mode==='Livre'?seconds>0:seconds>0&&seconds<duration);
 function openContext(ctx:FocusContext){
  if(hasSession&&!sameContext(focusContext,ctx)){setMessage('Encerre ou reinicie a sessão atual antes de trocar de atividade.');return}
  if(!sameContext(focusContext,ctx)){setFocusContext(ctx);setSeconds(mode==='Livre'?0:duration)}
  navigate('focus');
 }
 function openReading(book:Book){
  const ctx=readingContext(book);
  if(hasSession&&!sameContext(focusContext,ctx)){setMessage('Encerre ou reinicie a sessão atual antes de trocar de atividade.');return}
  setReadingId(book.id);setFocusContext(ctx);
  if(!hasSession){setDuration(1800);setSeconds(mode==='Livre'?0:1800)}
  navigate('focus');
 }
 const contextCategory=focusContext.kind==='reading'?categories.find(c=>c.id==='reading')!:categories.find(c=>c.id===focusContext.categoryId)??categories[0];
 function reading(){return <div className="reading-body"><Cover title={readingBook.title}/><div className="book-info"><b>{readingBook.title}</b><small>{readingBook.author}</small><Progress value={pct}/><small><strong>Pág. {page}</strong> de {readingBook.pages} · {pct}%</small><Button variant="soft" size="sm" onClick={()=>openReading(readingBook)}><Play size={13}/> Continuar leitura</Button></div></div>}
 function player(){return <div className="music-body"><Cover album/><div className="music-info"><div className="track-details"><b>{['Deep Focus','Quiet Morning','Evening Flow'][track]}</b><small>Lo-Fi Essentials · Spotify (demo)</small></div><div className="player-controls"><button aria-label="Anterior" onClick={()=>setTrack(t=>(t+2)%3)}><SkipBack size={17} fill="currentColor"/></button><button className="circle-button primary" aria-label={music?'Pausar música':'Reproduzir música'} onClick={()=>setMusic(m=>!m)}>{music?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}</button><button aria-label="Próxima música" onClick={()=>setTrack(t=>(t+1)%3)}><SkipForward size={17} fill="currentColor"/></button><button aria-label="Favoritar" aria-pressed={favorite} onClick={()=>setFavorite(f=>!f)}><Heart size={17} fill={favorite?'currentColor':'none'}/></button></div><Progress value={music?42:35}/></div></div>}
 function widgetContent(type:WidgetType){
  switch(type){
   case 'focus':return <div className="focus-widget"><Ring seconds={seconds} total={duration} label={focusContext.label}/><div className="focus-controls"><button className="activity-tag" onClick={()=>navigate('focus')}>{focusContext.kind==='reading'?<BookOpen size={14}/>:<Layers size={14}/>} {focusContext.title}</button><Segment value={mode} onChange={setMethod}/><small>Ciclos: {completed} / 4</small><div className="focus-start"><button className="primary timer-start" aria-label={running?'Pausar foco':'Iniciar foco'} onClick={toggle}>{running?<Pause size={16} fill="currentColor"/>:<Play size={16} fill="currentColor"/>}<span>{running?'Pausar foco':'Iniciar foco'}</span></button><button className="outline icon-btn" title="Abrir modo de foco" aria-label="Abrir foco" onClick={()=>navigate('focus')}><Settings size={15}/></button></div></div></div>;
   case 'agenda':return <AgendaRows/>;
   case 'tasks':return <div className="task-list">{tasks.map(t=><label key={t.id} className={t.done?'done':''}><input type="checkbox" checked={t.done} onChange={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span>{t.title}</span></label>)}</div>;
   case 'reading':return reading();
   case 'goal':return <div className="goal-body"><div className="gauge"><svg viewBox="0 0 140 80"><path d="M12 70 A58 58 0 0 1 128 70" fill="none" stroke="#e5ded8" strokeWidth="8" strokeLinecap="round"/><path d="M12 70 A58 58 0 0 1 128 70" fill="none" stroke="#79b384" strokeWidth="8" pathLength="100" strokeDasharray="56 100" strokeLinecap="round"/></svg><div><strong>2h 15min</strong><small>de 4 horas</small></div></div><footer><span><Timer size={13}/> {5+completed} sessões</span><span><Flame size={13} color="#df702c"/> 7 dias seguidos</span></footer></div>;
   case 'music':return player();
   case 'summary':return <div className="summary-body"><div><strong>2h 15min <em>+32%</em></strong><small>de foco · vs. ontem</small></div><div className="bars" aria-label="Gráfico ilustrativo">{[30,55,39,76,61].map((h,i)=><i key={i} style={{height:h+'%'}}/>)}</div></div>;
   case 'notes':return <textarea aria-label="Notas rápidas" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Escreva uma nota…"/>;
   case 'next':return <AgendaRows single/>;
   case 'recent':return <div className="muted">Leitura · 30 min<br/>Estudo · 25 min<br/>Trabalho · 50 min</div>;
  }
 }
 function renderWidget(w:Widget){const Icon=icons[w.type];return <div key={w.id} data-widget={w.type} data-size={w.size} data-placement={freeGrid&&w.placement?JSON.stringify(w.placement):undefined} style={freeGrid&&w.placement?gridStyle(w.placement):undefined} className={'widget '+w.size+' '+(editing&&selected===w.id?'is-selected':'')+(gesture.preview?.id===w.id?' grid-active':'')} onClick={()=>{if(editing&&selected!==w.id){setSelected(w.id);setOpenMenu(null)}}} onDragOver={e=>editing&&!freeGrid&&e.preventDefault()} onDrop={e=>{if(!editing||freeGrid)return;e.preventDefault();setOpenMenu(null);const from=e.dataTransfer.getData('text/plain');setDraft(old=>old?move(old,from,w.id).map(w=>({...w,placement:undefined})):old)}}>
 <Card title={w.type==='tasks'?'Tarefas ('+tasks.length+')':editing&&w.type==='goal'?'Meta diária':titles[w.type]} icon={Icon} provider={w.type==='music'?'spotify':undefined} actions={editing?<EditCardToolbar title={titles[w.type]} open={openMenu===w.id} size={w.size} onOpen={()=>{setSelected(w.id);setOpenMenu(v=>v===w.id?null:w.id)}} onClose={()=>setOpenMenu(null)} onDragStart={e=>{setSelected(w.id);setOpenMenu(null);e.dataTransfer.setData('text/plain',w.id);e.dataTransfer.effectAllowed='move'}} onPointerMoveStart={freeGrid?e=>{setSelected(w.id);setOpenMenu(null);gesture.begin(e,w,'move')}:undefined} onNudge={freeGrid?(dx,dy)=>nudge(w.id,dx,dy):undefined} onMove={delta=>shift(w.id,delta)} onResize={size=>resize(w.id,size)} onRemove={()=>remove(w.id)} canMoveUp={freeGrid?!!w.placement&&w.placement.y>0:widgets[0]?.id!==w.id} canMoveDown={freeGrid?true:widgets[widgets.length-1]?.id!==w.id}/>:w.type==='focus'?<button className="card-icon-action" aria-label="Abrir sessão de foco" onClick={()=>navigate('focus')}><Maximize2 size={15}/></button>:w.type==='agenda'?<button className="card-icon-action" aria-label="Abrir agenda" onClick={()=>navigate('calendar')}><ChevronRight size={17}/></button>:w.type==='reading'?<button className="card-icon-action" aria-label="Abrir atividades de leitura" onClick={()=>navigate('activities')}><ChevronRight size={17}/></button>:undefined}>
 <div ref={el=>{if(el)el.inert=editing}} aria-hidden={editing?true:undefined} className={editing?'preview-content':''}>{editing?<EditPreview type={w.type} seconds={seconds} duration={duration} mode={mode} page={page} book={readingBook} focusTitle={focusContext.title} focusLabel={focusContext.label} tasks={tasks} track={['Deep Focus','Quiet Morning','Evening Flow'][track]} running={running} music={music}>{widgetContent(w.type)}</EditPreview>:widgetContent(w.type)}</div>
 </Card>{editing&&selected===w.id&&<><button className="resize-handle" aria-label={'Redimensionar '+titles[w.type]} onPointerDown={e=>freeGrid?gesture.begin(e,w,'resize'):beginResize(e,w.id,w.size)} onKeyDown={e=>{const offsets:Record<string,[number,number]>={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};const d=offsets[e.key];if(!d)return;e.preventDefault();if(freeGrid)nudge(w.id,...d,true);else if(d[0])resize(w.id,sizes[Math.max(0,Math.min(2,sizes.indexOf(w.size)+d[0]))])}}/><span className="selection-handle handle-tl"/><span className="selection-handle handle-tm"/><span className="selection-handle handle-tr"/><span className="selection-handle handle-ml"/>{freeGrid?<button className="selection-handle handle-mr axis-handle" aria-label={'Alterar largura de '+titles[w.type]} onPointerDown={e=>gesture.begin(e,w,'width')} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();nudge(w.id,e.key==='ArrowRight'?1:-1,0,true)}}}/>:<span className="selection-handle handle-mr"/>}<span className="selection-handle handle-bl"/>{freeGrid?<button className="selection-handle handle-bm axis-handle" aria-label={'Alterar altura de '+titles[w.type]} onPointerDown={e=>gesture.begin(e,w,'height')} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();nudge(w.id,0,e.key==='ArrowDown'?1:-1,true)}}}/>:<span className="selection-handle handle-bm"/>}</>}</div>}
 function mobileEditor(){const current=widgets.find(w=>w.id===selected);return <section className="mobile-layout"><h3>Seus widgets ({widgets.length})</h3>{widgets.map(w=>{const Icon=icons[w.type];return <div className={'mobile-widget-row '+(selected===w.id?'chosen':'')} key={w.id} data-widget={w.type}><Grip size={15}/><button className="mobile-widget-name" onClick={()=>setSelected(w.id)}>{w.type==='music'?<ProviderIcon provider="spotify" size={16}/>:<Icon size={16} strokeWidth={1.8}/>}<span className="mobile-widget-title">{titles[w.type]}</span><small>{w.size==='small'?'1 × 1':w.size==='medium'?'2 × 1':'2 × 2'}</small></button><EditIconButton label={'Mover acima '+titles[w.type]} icon={ChevronUp} disabled={widgets[0]?.id===w.id} onClick={()=>shift(w.id,-1)}/><EditIconButton label={'Mover abaixo '+titles[w.type]} icon={ChevronDown} disabled={widgets[widgets.length-1]?.id===w.id} onClick={()=>shift(w.id,1)}/><EditIconButton label={'Remover '+titles[w.type]} icon={X} onClick={()=>remove(w.id)}/></div>})}{current&&<><h3>Tamanho do widget</h3><WidgetSizeOptions value={current.size} onChange={size=>resize(current.id,size)} visual/></>}<EditTextButton className="mobile-save" variant="primary" onClick={()=>closeEdit(true)}>Salvar layout</EditTextButton></section>}
 function cataloguePanel(){return <aside className="catalogue"><header><h3>Adicionar widgets</h3><EditIconButton label="Fechar catálogo" icon={X} className="mobile-only" onClick={()=>setShowCatalogue(false)}/></header><input className="search" aria-label="Buscar widgets" placeholder="Buscar widgets..." value={query} onChange={e=>setQuery(e.target.value)}/>{catalogue.filter(c=>c.title.toLowerCase().includes(query.toLowerCase())).map(c=>{const Icon=icons[c.type];const exists=draft?.some(w=>w.type===c.type);return <button className="catalogue-item" key={c.type} disabled={exists} draggable={freeGrid&&!exists} onDragStart={e=>startCatalogueDrag(e,c.type)} onDragEnd={()=>{catalogueDrag.current=null;setCataloguePreview(null)}} onClick={()=>add(c.type)}>{c.type==='music'?<ProviderIcon provider="spotify" size={20}/>:<Icon size={18} strokeWidth={1.8}/>}<span><b>{c.title}</b><small>{c.description}</small></span>{exists?<Check size={15}/>:<Plus size={17}/>}</button>})}</aside>}
 return <div className={'app '+(view==='focus'?'immersive':'')}>
 {view!=='focus'&&<aside className="sidebar"><Brand/><nav>{navigation.map(n=><button key={n.id} className={view===n.id||editing&&n.id==='today'?'active':''} onClick={()=>navigate(n.id)}><n.icon size={18} strokeWidth={1.8}/>{n.title}</button>)}</nav><div className="connection"><span><i/> Dados de demonstração</span><ProviderLabel provider="google-calendar" size={16}/><ProviderLabel provider="outlook" size={16}/></div></aside>}
 <main className={"main "+(view==='focus'?'focus-main':'workspace-main')}>
 {view==='focus'?<><header className="focus-top"><button onClick={()=>setView('today')} aria-label="Voltar"><ArrowLeft size={19}/></button><Brand/><h1 className="focus-breadcrumb">{focusContext.kind==='reading'?<BookOpen size={16}/>:<Layers size={16}/>}<span>{focusContext.label}<span className="desktop-focus-title"> · {focusContext.title}</span></span></h1><button onClick={()=>setView('today')} aria-label="Fechar foco"><X size={21}/></button></header><div className="immersive-grid">{focusContext.kind==='reading'?<div className="book-panel"><Cover title={readingBook.title}/><h2>{readingBook.title}</h2><p>{readingBook.author}</p><Progress value={pct}/><small>Pág. {page} de {readingBook.pages} · {pct}%</small><Button variant="secondary" onClick={()=>{setPageInput(String(page));setShowProgress(true)}}>Atualizar progresso</Button></div>:<div className="focus-activity-panel"><CategoryMark category={contextCategory}/><small>{focusContext.kind==='task'?'Tarefa':'Atividade'} · {contextCategory.name}</small><h2>{focusContext.title}</h2><p>Concentre-se em uma atividade por vez.</p>{focusContext.kind==='task'&&<label className="focus-task-check"><input type="checkbox" checked={tasks.some(t=>String(t.id)===focusContext.id&&t.done)} onChange={e=>setTasks(old=>old.map(t=>String(t.id)===focusContext.id?{...t,done:e.target.checked}:t))}/> Marcar tarefa como concluída</label>}<Button variant="secondary" onClick={()=>navigate('activities')}>Ver atividades</Button></div>}<div className="focus-center"><Segment value={mode} onChange={setMethod}/><Ring seconds={seconds} total={duration} large label={focusContext.label}/><Transport running={running} onToggle={toggle} onReset={reset} onStop={stop}/></div><aside className="focus-side"><Card title="Próximo compromisso" icon={CalendarDays}><AgendaRows single/></Card><Card title="Música · Spotify (demo)" icon={Music2} provider="spotify">{player()}<label className="volume"><Volume2 size={16}/><input type="range" min="0" max="100" value={volume} onChange={e=>setVolume(Number(e.target.value))} aria-label="Volume simulado"/></label></Card></aside></div><div className="landscape" aria-hidden="true"><svg viewBox="0 0 1200 180" preserveAspectRatio="none"><path d="M0 60Q130 95 240 70T470 85T720 68T950 94T1200 52V180H0Z" fill="#f6c9aa"/><path d="M0 108Q130 64 300 116T600 112T900 106T1200 100V180H0Z" fill="#d0bec6"/><path d="M0 131L130 95 230 135 395 113 590 155 820 108 1010 143 1200 116V180H0Z" fill="#a4aebc"/><path d="M0 160L180 145 360 161 560 145 780 169 990 143 1200 153V180H0Z" fill="#879495"/>{[12,25,44,58,76,91,1085,1105,1120,1144,1165,1187].map((x,i)=><g key={x} transform={`translate(${x} ${122+i%3*9}) scale(${i%3===0?1.25:.8})`} fill="#66747b"><path d="M0 0l-8 14h4l-9 12h6l-10 12h34l-10-12h6l-9-12h4z"/><rect x="-1.5" y="37" width="3" height="12"/></g>)}</svg></div></>:<>
 <MobileMasthead/>
 <PageHeader title={editing?'Editar painel':view==='today'?'Meu dia':navigation.find(n=>n.id===view)?.title??''}
 subtitle={editing?'Personalize seu painel com widgets, tamanhos e posição.':view==='today'?fixtureDate:view==='calendar'?'Organize seus compromissos.':view==='activities'?'Acompanhe suas atividades e leituras.':view==='history'?'Acompanhe seu tempo de concentração.':'Personalize sua experiência.'}
 editing={editing}
 actions={view==='today'?<div className="head-actions"><Sun size={18} aria-hidden="true"/><button className="outline page-action" onClick={startEdit}><LayoutGrid size={16}/> Editar painel</button></div>:editing?<div className="head-actions edit-header"><EditTextButton onClick={()=>{setDraft(editKey==='desktop'?resolveLayout(defaultLayout()):defaultLayout(true));setSelected('focus');setOpenMenu(null)}}><RotateCcw size={15}/> Restaurar layout</EditTextButton><EditTextButton onClick={()=>closeEdit(false)}>Cancelar</EditTextButton><EditTextButton variant="primary" onClick={()=>closeEdit(true)}>Salvar painel</EditTextButton></div>:undefined}/>
 {editing&&<div className="mobile-edit-tabs segment"><button aria-pressed={!showCatalogue} className={!showCatalogue?"selected":""} onClick={()=>setShowCatalogue(false)}>Seus widgets</button><button aria-pressed={showCatalogue} className={showCatalogue?"selected":""} onClick={()=>setShowCatalogue(true)}><Plus size={15}/> Adicionar</button></div>}
 {editing&&freeGrid&&<div className="grid-tools"><span className="grid-tools-hint"><LayoutGrid size={15}/> Grade de 12 colunas</span><label className="grid-push"><input type="checkbox" checked={pushNeighbors} onChange={e=>setPushNeighbors(e.target.checked)}/> Deslocar vizinhos</label><EditTextButton className="compact-grid-button" onClick={compactGrid}><Layers size={15}/> Compactar espaços</EditTextButton></div>}
 {(view==='today'||editing)&&<div className={'workspace '+(editing?'editing':'')}>{editing&&mobile?(!showCatalogue&&mobileEditor()):<div ref={gesture.gridRef} className={'widget-grid '+(freeGrid?'coordinate-grid ':'')+(activePreview?'grid-gesturing':'')} onDragOver={previewCatalogue} onDrop={dropCatalogue} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setCataloguePreview(null)}}>{widgets.map(renderWidget)}{activePreview&&freeGrid&&<GridGhost preview={activePreview}/>}{editing&&<AddWidgetTile style={addPlacement?gridStyle(addPlacement):freeGrid?{gridColumn:'1 / -1',gridRow:(endRow(widgets)+1)+' / span 3'}:undefined} onClick={()=>{setShowCatalogue(true);document.querySelector<HTMLInputElement>('.search')?.focus()}}/>}{!widgets.length&&!editing&&<div className="empty">Seu painel está vazio. <button className="primary" onClick={startEdit}>Adicionar widgets</button></div>}</div>}{editing&&<div className={'catalogue-wrap '+(showCatalogue?'visible':'')}>{cataloguePanel()}</div>}</div>}
 <div className="route-content" hidden={view==='today'||editing}>
 {view==='calendar'&&<CalendarPage/>}
 {view==='activities'&&<ActivitiesPage categories={categories} tasks={tasks} books={books} onCategories={setCategories} onTasks={setTasks} onBooks={setBooks} onFocus={openContext} onReading={openReading}/>}
 {view==='history'&&<Card title="Histórico de demonstração" icon={History}>{widgetContent('recent')}<p>Sessões concluídas nesta prévia: {completed}</p></Card>}
 {view==='settings'&&<Card title="Preferências do protótipo" icon={Settings}><p>Somente dados de demonstração. Integrações e tema escuro não implementados.</p><SelectField label="Duração do Pomodoro" hint="Duração da próxima sessão. Disponível quando o temporizador estiver parado." value={duration} disabled={running} onChange={e=>{const n=Number(e.target.value);setDuration(n);setSeconds(mode==='Livre'?0:n)}}><option value={1500}>25 minutos</option><option value={1800}>30 minutos</option><option value={3000}>50 minutos</option></SelectField><div className="settings-action"><Button variant="secondary" onClick={()=>{const next={desktop:defaultLayout(),mobile:defaultLayout(true)};try{localStorage.setItem(STORAGE,JSON.stringify(next));setLayouts(next);setMessage('Layouts restaurados.')}catch{setMessage('Não foi possível persistir.')}}}><RotateCcw size={15}/> Restaurar painéis</Button></div></Card>}
 {view==='settings'&&<Card title="Integrações · prévia visual" icon={Settings}><div className="integration-preview-list">{([{id:"google-calendar",status:"Agenda planejada"},{id:"outlook",status:"Agenda planejada"},{id:"spotify",status:"Música planejada"},{id:"gmail",status:"Referência visual · fora do escopo atual"},{id:"google-meet",status:"Links de reunião planejados"},{id:"teams",status:"Links de reunião planejados"}] as const).map(item=><div className="integration-preview-row" key={item.id}><ProviderLabel provider={item.id} size={24}/><small>{item.status}</small></div>)}</div><small>Nenhum provedor conectado nesta prévia.</small></Card>}
 </div>
 </>}
 </main>
 {(view!=='focus'||mobile)&&<nav className="bottom-nav">{navigation.map(n=><button key={n.id} className={view===n.id||(editing||view==='focus')&&n.id==='today'?'active':''} onClick={()=>navigate(n.id)}><n.icon size={20} strokeWidth={1.8}/><span>{n.id==='settings'?'Ajustes':n.title}</span></button>)}</nav>}
 {showProgress&&<Dialog title="Atualizar progresso" description="Registre onde você parou na leitura." onDismiss={()=>setShowProgress(false)}>
 <form className="dialog-form" onSubmit={e=>{e.preventDefault();const n=Number(pageInput);if(Number.isInteger(n)&&n>=0&&n<=readingBook.pages){setPage(n);setShowProgress(false);setMessage('Progresso atualizado.')}}}>
  <div className="dialog-book"><Cover title={readingBook.title}/><div><b>{readingBook.title}</b><small>{readingBook.author}</small><small>Pág. {page} de {readingBook.pages} · {pct}%</small></div></div>
  <Field label="Página atual" hint={`De 0 a ${readingBook.pages} páginas.`} required type="number" min="0" max={readingBook.pages} step="1" value={pageInput} onChange={e=>setPageInput(e.target.value)}/>
  <div className="dialog-progress"><Progress value={Math.max(0,Math.min(100,Math.round((Number(pageInput)||0)/readingBook.pages*100)))}/><small>{Math.max(0,Math.min(100,Math.round((Number(pageInput)||0)/readingBook.pages*100)))}% do livro</small></div>
  <footer className="dialog-actions"><Button variant="secondary" onClick={()=>setShowProgress(false)}>Cancelar</Button><Button type="submit">Salvar</Button></footer>
 </form>
 </Dialog>}
 {message&&<Notice message={message} onDismiss={()=>setMessage('')}/>}

 </div>
}
