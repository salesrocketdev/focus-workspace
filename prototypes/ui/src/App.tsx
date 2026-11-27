import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Home, CalendarDays, Layers, History, Settings, Sun, Moon, LayoutGrid, ArrowLeft, Plus, X, Grip, ChevronUp, ChevronDown, RotateCcw, Play, Pause, SkipBack, SkipForward, Heart, Volume2, BookOpen, Flame, Timer, Music2, Bell, Check, Maximize2, Minimize2, Ellipsis, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Brand, Ring, Segment, Card, Cover, Progress, AgendaRows, Transport, icons } from './components';
import { EditIconButton, EditTextButton, EditCardToolbar, WidgetSizeOptions, EditPreview, AddWidgetTile } from './editor';
import { PageHeader, MobileMasthead } from './layout';
import { CompactFocus,CommandPalette,QuickActionButton,type QuickAction } from './quick-actions';
import { CalendarPage } from './calendar-page';
import {conflict,validBlock,contextExists,blockDone,type FocusBlock} from './planning-model';
import { HistoryPage } from './history-page';
import { MiniTrend } from './charts';
import {useDistractionShield,DistractionDialog,launchFocusShortcut} from './distraction-shield';
import {loadWorkspace,saveWorkspace} from './workspace-storage';
import {useScreenWakeLock} from './wake-lock';
import {useOffline,OfflineIndicator,OfflineSettings} from './offline';
import {useTabCoordinator,TabIndicator} from './tab-coordinator';
import {BackupPanel} from './backup-panel';
import {NOTES_KEY,loadNotes,restoreBackup} from './backup-model';
import { AppearancePanel,useAppearance } from './appearance';
import {FocusLandscape,normalizeScene} from './focus-scene';
import { SettingsPage,type SettingsSection } from './settings-page';
import { useNotifications,NotificationBell,NotificationCenter,NotificationSettings } from './notifications';
import { recordSession,totalSeconds,durationLabel,filterPeriod,dailyTotals,newest,streak,type SessionStatus } from './history-model';
import { FocusSettings,IntegrationPanel,Onboarding } from './preferences-page';
import { FocusPicker } from './focus-picker';
import { loadPreferences,loadConnections,loadProfile,writeStorage,PREFS_KEY,CONNECTIONS_KEY,ONBOARDING_KEY,nextPhase,phaseDuration,phaseName,suggestedLayout,type FocusPreferences,type Profile,type Preset,type Phase } from './preferences-model';
import type { ProviderId } from './provider-icons';
import { ActivitiesPage,CategoryMark,type ActivityTab } from './activities-page';
import {DashboardTasks,QuickTaskDialog} from './dashboard-actions';
import {useEditorHistory} from './editor-history';
import {EditorControls,LayoutPresets,WidgetPreferences,hasWidgetOptions} from './editor-preferences';
import {QuickPresets,FocusSummary,type SessionSummary} from './focus-experience';
import { initialTasks,initialBooks,readingContext,sameContext,progressOf,nextTaskId,priorityCount,toggleTaskPriority,completeTask,taskContext,dashboardTasks,MAX_PRIORITIES,type Book,type FocusContext } from './activity-model';
import { ProviderIcon, ProviderLabel } from './provider-icons';
import { Button, Field, Dialog, SelectField, Notice, SearchField, TextareaField, ToggleCard } from './ui';
import { available, changePreset, compactVertical, displaced, endRow, firstFree, GRID_BREAKPOINT, gridStyle, planPlacement, preset, resolveLayout } from './grid-model';
import { GridGhost, pointerPlacement, useGridGesture, useGridMotion, type Preview } from './grid-editor';
import { catalogue, defaultLayout, loadLayouts, move, STORAGE, tasksInitial, presetLayout, type DashboardPreset,type WidgetOptions,type Widget, type Size, type WidgetType } from './model';

type View='today'|'edit'|'focus'|'calendar'|'activities'|'history'|'settings';
const navigation=[{id:'today',title:'Hoje',icon:Home},{id:'calendar',title:'Agenda',icon:CalendarDays},{id:'activities',title:'Atividades',icon:Layers},{id:'history',title:'Histórico',icon:History},{id:'settings',title:'Configurações',icon:Settings}] as const;
const sizes:Size[]=['small','medium','large'];
const titles:Record<WidgetType,string>={focus:'Foco (Pomodoro)',agenda:'Agenda de hoje',tasks:'Tarefas',reading:'Leitura em andamento',goal:'Meta diária de foco',music:'Música',summary:'Resumo de hoje',notes:'Notas',next:'Próximo compromisso',recent:'Sessões recentes'};
const fixtureDate='Quarta-feira, 29 de janeiro';

export function App(){
 const offline=useOffline();
 const [view,setView]=useState<View>('today');
 const [activityTab,setActivityTab]=useState<ActivityTab>('overview');
 const [showQuickTask,setShowQuickTask]=useState(false);
 const [zen,setZen]=useState(false);
 const [showPresets,setShowPresets]=useState(false);
 const [confirmReset,setConfirmReset]=useState(false);
 const [sessionSummary,setSessionSummary]=useState<SessionSummary|null>(null);
 useLayoutEffect(()=>{if(window.innerWidth<760)window.scrollTo({top:0,behavior:'instant'})},[view]);
 const [settingsSection,setSettingsSection]=useState<SettingsSection>('focus');
 const [mobileSettingsDetail,setMobileSettingsDetail]=useState(false);
 const [showNotifications,setShowNotifications]=useState(false);
 const [showCommands,setShowCommands]=useState(false);
 const [compact,setCompact]=useState(false);
 const notifications=useNotifications();
 const shield=useDistractionShield();
 const [showShield,setShowShield]=useState(false);
 const {appearance,update:updateAppearance}=useAppearance();
 const [layouts,setLayouts]=useState(loadLayouts);
 const [mobile,setMobile]=useState(()=>window.innerWidth<760);
 const [wide,setWide]=useState(()=>window.innerWidth>=GRID_BREAKPOINT);
 const editHistory=useEditorHistory();
 const {draft,setDraft}=editHistory;
 const [showLayoutPresets,setShowLayoutPresets]=useState(false);
 const [widgetOptionsId,setWidgetOptionsId]=useState<string|null>(null);
 const [editKey,setEditKey]=useState<'desktop'|'mobile'>('desktop');
 const [selected,setSelected]=useState('focus');
 const [openMenu,setOpenMenu]=useState<string|null>(null);
 const [pushNeighbors,setPushNeighbors]=useState(false);
 const [cataloguePreview,setCataloguePreview]=useState<Preview|null>(null);
 const catalogueDrag=useRef<Widget|null>(null);
 const [query,setQuery]=useState('');
 const [showCatalogue,setShowCatalogue]=useState(false);
 const [message,setMessage]=useState('');
 const [prefs,setPrefs]=useState(loadPreferences);
 const [restored]=useState(()=>loadWorkspace(prefs));
 const [mode,setMode]=useState<'Pomodoro'|'Livre'>(restored.timer.mode);
 const [profile,setProfile]=useState(loadProfile);
 const [connections,setConnections]=useState(loadConnections);
 const [showOnboarding,setShowOnboarding]=useState(()=>loadProfile()===null);
 const [showFocusSettings,setShowFocusSettings]=useState(false);
 const [showFocusPicker,setShowFocusPicker]=useState(false);
 const [phase,setPhase]=useState<Phase>(restored.timer.phase);
 const [cycle,setCycle]=useState(restored.timer.cycle);
 const [duration,setDuration]=useState(restored.timer.duration);
 const [seconds,setSeconds]=useState(restored.timer.seconds);
 const [running,setRunning]=useState(restored.timer.running);
 const clock=useRef<number>(restored.timer.startedAt);
 const [tasks,setTasks]=useState(restored.tasks);
 const [categories,setCategories]=useState(restored.categories);
 const [books,setBooks]=useState(restored.books);
 const [readingId,setReadingId]=useState(restored.timer.readingId);
 const [focusContext,setFocusContext]=useState<FocusContext>(restored.timer.context);
 const readingBook=books.find(b=>b.id===readingId)??books[0];
 const page=readingBook?.page??0;
 const setPage=(n:number)=>{if(readingBook&&requireWriter())setBooks(old=>old.map(b=>b.id===readingBook.id?{...b,page:n}:b))};
 const [music,setMusic]=useState(false);
 const [favorite,setFavorite]=useState(false);
 const [volume,setVolume]=useState(65);
 const [track,setTrack]=useState(0);
 const [notes,setNotes]=useState(loadNotes);
 const [showNotes,setShowNotes]=useState(false);
 const [noteDraft,setNoteDraft]=useState('');
 const [showProgress,setShowProgress]=useState(false);
 const [pageInput,setPageInput]=useState('72');
 const [records,setRecords]=useState(restored.records);
 const [blocks,setBlocks]=useState<FocusBlock[]>(restored.blocks??[]);
 const [plannedId,setPlannedId]=useState<string|undefined>(restored.timer.plannedId);
 const [planTask,setPlanTask]=useState<number|undefined>();
 const todayRecords=filterPeriod(records,1),todaySeconds=totalSeconds(todayRecords);
 const lastWeek=dailyTotals(records,7),yesterdaySeconds=lastWeek[lastWeek.length-2].seconds;
 const changePercent=yesterdaySeconds?Math.round((todaySeconds-yesterdaySeconds)/yesterdaySeconds*100):null;
 const [summaryPoint,setSummaryPoint]=useState<{day:string;seconds:number;count:number}|null>(null);
 function saveFocusRecord(elapsed:number,status:SessionStatus,finishedCycle=0){if(elapsed<=0)return;const record=recordSession(focusContext,elapsed,mode,status,plannedId);setRecords(old=>[record,...old]);setSessionSummary({record,context:{...focusContext},cycle:finishedCycle,cycleGoal:prefs.cycles});}
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
 const recoverExpired=useRef(restored.timer.running&&restored.timer.mode==='Pomodoro'&&restored.timer.seconds===0);
 const tickRef=useRef<()=>void>(()=>{});
 const storageWarning=useRef(false);
 const tabs=useTabCoordinator(()=>{
  const nextPrefs=loadPreferences(),snapshot=loadWorkspace(nextPrefs),t=snapshot.timer;
  clock.current=t.startedAt;recoverExpired.current=t.running&&t.mode==='Pomodoro'&&t.seconds===0;
  setPrefs(nextPrefs);setMode(t.mode);setPhase(t.phase);setCycle(t.cycle);setDuration(t.duration);setSeconds(t.seconds);setRunning(t.running);
  setFocusContext(t.context);setReadingId(t.readingId);setTasks(snapshot.tasks);setCategories(snapshot.categories);setBooks(snapshot.books);setRecords(snapshot.records);setBlocks(snapshot.blocks??[]);setPlannedId(t.plannedId);setNotes(loadNotes());setConfirmReset(false);setSessionSummary(null);
 });
 function requireWriter(){if(tabs.isWriter())return true;setMessage('Outra aba controla o Focora. Feche-a para assumir o controle.');return false}
 const wakeStatus=useScreenWakeLock(prefs.keepAwake===true,tabs.canWrite&&running&&phase==='focus');
 useLayoutEffect(()=>{
  if(!tabs.canWrite||!tabs.isWriter())return;
  const saved=saveWorkspace({version:1,timer:{mode,phase,cycle,duration,seconds,running,startedAt:clock.current,context:focusContext,readingId,plannedId},tasks,categories,books,records,blocks});
  if(!saved&&!storageWarning.current){storageWarning.current=true;setMessage('Armazenamento local indisponível. A sessão poderá ser perdida ao fechar.')}
 },[tabs.canWrite,mode,phase,cycle,duration,seconds,running,focusContext,readingId,tasks,categories,books,records,blocks,plannedId]);
 useEffect(()=>{
  if(!running){tickRef.current=()=>{};return}
  let finished=false;
  const tick=()=>{
   if(finished)return;
   const elapsed=Math.max(0,Math.floor((Date.now()-clock.current)/1000));
   const value=mode==='Livre'?elapsed:Math.max(0,duration-elapsed);
   setSeconds(value);
   if(mode!=='Livre'&&value===0&&tabs.canWrite&&tabs.isWriter()){
    finished=true;
    const recovered=recoverExpired.current||elapsed-duration>5;
    recoverExpired.current=false;
    const next=nextPhase(phase,cycle,prefs);
    if(phase==='focus'){saveFocusRecord(duration,'completed',next.cyclesDone);setPlannedId(undefined)}
    setConfirmReset(false);
    if(next.phase==='focus'&&next.auto&&!recovered)setSessionSummary(null);
    setPhase(next.phase);setCycle(next.cyclesDone);
    const length=phaseDuration(next.phase,prefs);
    setDuration(length);setSeconds(length);clock.current=Date.now();setRunning(next.auto&&!recovered);
    setMessage(recovered?'Sessão recuperada. '+phaseName(next.phase)+' pronta para iniciar.':phase==='focus'?'Foco concluído. '+phaseName(next.phase)+' disponível.':'Pausa concluída. Próximo foco disponível.');
    notifications.publish(phase==='focus'?'focus':'break',phase==='focus'?'Sessão de foco concluída':'Pausa concluída',phase==='focus'?phaseName(next.phase)+' disponível.':'Pronto para retomar o foco.');
   }
  };
  tickRef.current=tick;
  const id=window.setInterval(tick,250);
  const resume=()=>{if(document.visibilityState==='visible')tick()};
  document.addEventListener('visibilitychange',resume);window.addEventListener('pageshow',resume);window.addEventListener('focus',resume);
  return()=>{finished=true;window.clearInterval(id);document.removeEventListener('visibilitychange',resume);window.removeEventListener('pageshow',resume);window.removeEventListener('focus',resume);tickRef.current=()=>{}};
 },[tabs.canWrite,running,mode,duration,phase,cycle,prefs,focusContext,plannedId,notifications.prefs]);
 function setMethod(value:'Pomodoro'|'Livre'){if(!requireWriter()||hasSession||value===mode)return;setPlannedId(undefined);setMode(value);setPhase('focus');setCycle(0);setDuration(prefs.focus);setSeconds(value==='Livre'?0:prefs.focus)}
 function toggle(){
  if(!requireWriter())return;
  if(running){
   const elapsed=Math.max(0,Math.floor((Date.now()-clock.current)/1000));
   if(mode==='Pomodoro'&&elapsed>=duration){tickRef.current();return}
   setSeconds(mode==='Livre'?elapsed:Math.max(0,duration-elapsed));setRunning(false);return
  }
  const initial=mode==='Pomodoro'&&seconds===0?duration:seconds;
  const fresh=phase==='focus'&&(mode==='Livre'?initial===0:initial===duration);
  if(fresh)setSessionSummary(null);
  clock.current=Date.now()-(mode==='Livre'?initial:duration-initial)*1000;
  setSeconds(initial);setRunning(true);
  notifications.sessionStart(fresh);
  if(fresh&&shield.autoShortcut){
   // Persist synchronously before handing off to another application.
   const saved=saveWorkspace({version:1,timer:{mode,phase,cycle,duration,seconds:initial,running:true,startedAt:clock.current,context:focusContext,readingId,plannedId},tasks,categories,books,records,blocks});
   if(saved){try{launchFocusShortcut((mode==='Livre'?prefs.focus:initial)/60)}catch{setMessage('Não foi possível abrir o atalho. Ative Não Perturbe manualmente.');setShowShield(true)}}
   else{setMessage('Não foi possível salvar a sessão antes de abrir Atalhos. Ative Não Perturbe manualmente.');setShowShield(true)}
  }else if(fresh&&shield.remind)setShowShield(true);
 }
 function reset(){if(!requireWriter())return;setPlannedId(undefined);setConfirmReset(false);recoverExpired.current=false;setRunning(false);setPhase('focus');setCycle(0);setDuration(prefs.focus);setSeconds(mode==='Livre'?0:prefs.focus);setSessionSummary(null)}
 function requestReset(){
  if(!requireWriter())return;
  if(running&&mode==='Pomodoro'&&Date.now()-clock.current>=duration*1000){tickRef.current();return}
  if(hasSession){setCompact(false);setConfirmReset(true)}else reset();
 }
 function confirmDiscard(){
  if(!requireWriter()){setConfirmReset(false);return}
  if(running&&mode==='Pomodoro'&&Date.now()-clock.current>=duration*1000){setConfirmReset(false);tickRef.current();return}
  reset();
 }
 function stop(){if(!requireWriter())return;recoverExpired.current=false;setRunning(false);if(phase==='focus'){const elapsed=running?Math.max(0,Math.floor((Date.now()-clock.current)/1000)):mode==='Livre'?seconds:duration-seconds;saveFocusRecord(mode==='Livre'?elapsed:Math.min(duration,elapsed),mode==='Livre'||elapsed>=duration?'completed':'interrupted');}setPhase('focus');setCycle(0);setDuration(prefs.focus);setSeconds(mode==='Livre'?0:prefs.focus);setPlannedId(undefined);setConfirmReset(false);setMessage('Sessão encerrada.')}
 function navigate(next:View,tab:ActivityTab='overview'){if(editing&&next!=='edit'){setMessage('Salve ou cancele a edição antes de sair.');return}if(next==='activities')setActivityTab(tab);if(next==='calendar')setPlanTask(undefined);if(next==='settings'){if(view!=='settings')setSettingsSection('focus');if(mobile)setMobileSettingsDetail(false)}setView(next)}
 function startEdit(){setCompact(false);setOpenMenu(null);setPushNeighbors(false);setCataloguePreview(null);catalogueDrag.current=null;setQuery('');setEditKey(key);setShowLayoutPresets(false);setWidgetOptionsId(null);editHistory.begin((key==='desktop'?resolveLayout(layouts[key]):layouts[key]).map(w=>({...w,placement:w.placement?{...w.placement}:undefined})));setSelected(layouts[key][0]?.id??'');setShowCatalogue(false);setView('edit')}
 function closeEdit(save:boolean){setOpenMenu(null);setCataloguePreview(null);catalogueDrag.current=null;if(save&&draft){const next={...layouts,[editKey]:editKey==='desktop'?resolveLayout(draft):draft};try{localStorage.setItem(STORAGE,JSON.stringify(next))}catch{setMessage('Não foi possível salvar no navegador.');return}setLayouts(next);setMessage('Painel salvo.')}editHistory.begin(null);setShowLayoutPresets(false);setWidgetOptionsId(null);setView('today')}
 function applyLayoutPreset(id:DashboardPreset){const next=presetLayout(id,editKey==='mobile');setDraft(editKey==='desktop'?resolveLayout(next):next);setSelected(next[0]?.id??'');setOpenMenu(null);setShowLayoutPresets(false);setShowCatalogue(false)}
 function updateWidgetOptions(id:string,options:WidgetOptions){setDraft(old=>old?.map(w=>w.id===id?{...w,options}:w)??null)}
 function undoLayout(){if(activePreview)return;setOpenMenu(null);editHistory.undo()}
 function redoLayout(){if(activePreview)return;setOpenMenu(null);editHistory.redo()}
 useEffect(()=>{if(!editing)return;const keydown=(e:KeyboardEvent)=>{if(e.defaultPrevented||e.isComposing||!(e.ctrlKey||e.metaKey)||e.altKey||document.querySelector('dialog[open]')||(e.target instanceof HTMLElement&&(e.target.matches('input,textarea,select')||e.target.isContentEditable)))return;const k=e.key.toLowerCase();if(k==='z'||k==='y'){e.preventDefault();if(k==='y'||e.shiftKey)redoLayout();else undoLayout()}};window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown)},[editing,activePreview,editHistory.canUndo,editHistory.canRedo]);
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
 const pct=readingBook?progressOf(readingBook):0;
 const hasSession=running||phase!=='focus'||(mode==='Livre'?seconds>0:seconds>0&&seconds<duration);
 const timerLabel=phase==='focus'?focusContext.label:phaseName(phase);
 function changePreferences(next:FocusPreferences){if(!requireWriter()||hasSession)return;setPlannedId(undefined);setPrefs(next);setDuration(next.focus);setSeconds(mode==='Livre'?0:next.focus);if(!writeStorage(PREFS_KEY,next))setMessage('Preferências disponíveis apenas nesta sessão.');}
 function changeConnections(next:ProviderId[]){setConnections(next);if(!writeStorage(CONNECTIONS_KEY,next))setMessage('Conexões demo disponíveis apenas nesta sessão.');}
 const canStartEmpty=!profile&&!hasSession&&!records.some(r=>r.origin==='session')&&!blocks.length&&!notes.trim()&&tasks.every(t=>initialTasks.some(o=>o.id===t.id&&JSON.stringify(o)===JSON.stringify(t)))&&books.every(b=>initialBooks.some(o=>o.id===b.id&&JSON.stringify(o)===JSON.stringify(b)));
 function finishOnboarding(identity:Profile,next:FocusPreferences,preset:Preset|null,empty=false){if(!requireWriter())return;if(empty&&!canStartEmpty){setMessage('Não foi possível iniciar sem exemplos: existem alterações locais. Seus dados foram preservados.');return}if(empty&&canStartEmpty){const c=categories[0];setTasks([]);setBooks([]);setRecords([]);setReadingId('');setFocusContext({kind:'activity',id:c.id,title:c.name,label:c.name,categoryId:c.id});setSummaryPoint(null);setSessionSummary(null)}setProfile(identity);writeStorage(ONBOARDING_KEY,identity);changePreferences(next);if(preset){const nextLayouts=suggestedLayout(preset);setLayouts(nextLayouts);writeStorage(STORAGE,nextLayouts)}setShowOnboarding(false);setMessage('Seu espaço foi personalizado.');}
 function skipOnboarding(){if(!profile){setProfile('guest');writeStorage(ONBOARDING_KEY,'guest')}setShowOnboarding(false);}
 function chooseFocusContext(ctx:FocusContext){
  if(!requireWriter())return;
  if(hasSession){setMessage('Encerre ou reinicie a sessão antes de trocar de atividade.');return}
  if(ctx.kind==='reading')setReadingId(ctx.id);
  setPlannedId(undefined);setFocusContext(ctx);setSeconds(mode==='Livre'?0:prefs.focus);setDuration(prefs.focus);setShowFocusPicker(false);
 }
 function openContext(ctx:FocusContext){
  if(!requireWriter())return;
  if(hasSession&&!sameContext(focusContext,ctx)){setMessage('Encerre ou reinicie a sessão atual antes de trocar de atividade.');return}
  if(!sameContext(focusContext,ctx)){setPlannedId(undefined);setFocusContext(ctx);setDuration(prefs.focus);setSeconds(mode==='Livre'?0:prefs.focus)}
  navigate('focus');
 }
 function prepareBlock(b:FocusBlock){
  if(!requireWriter())return;
  if(hasSession){setMessage('Encerre a sessão atual antes de preparar outro bloco.');return}
  if(blockDone(b,records)){setMessage('Este bloco já foi concluído.');return}
  if(!blocks.some(x=>x.id===b.id)||!contextExists(b.context,tasks,categories,books)){setMessage('A atividade planejada não está mais disponível.');return}
  if(b.context.kind==='task'&&tasks.some(t=>String(t.id)===b.context.id&&t.done)){setMessage('Esta tarefa já está concluída.');return}
  const currentContext=b.context.kind==='task'?taskContext(tasks.find(t=>String(t.id)===b.context.id)!,categories):b.context.kind==='reading'?readingContext(books.find(x=>x.id===b.context.id)!):b.context;
  if(!currentContext){setMessage('A atividade planejada não está mais disponível.');return}
  setMode('Pomodoro');setPhase('focus');setCycle(0);setFocusContext(currentContext);if(currentContext.kind==='reading')setReadingId(currentContext.id);
  const length=(b.end-b.start)*60;setDuration(length);setSeconds(length);setPlannedId(b.id);setSessionSummary(null);navigate('focus');
 }
 function saveBlock(b:FocusBlock):string|null{
  if(!requireWriter())return 'Outra aba controla o Focora.';
  if(!validBlock(b)||!contextExists(b.context,tasks,categories,books)||blocks.length>=2000||conflict(b,blocks))return 'Este horário não está disponível. Escolha outro intervalo.';
  setBlocks(old=>[...old,b]);setMessage('Bloco reservado localmente.');return null;
 }
 function openReading(book:Book){
  if(!requireWriter())return;
  const ctx=readingContext(book);
  if(hasSession&&!sameContext(focusContext,ctx)){setMessage('Encerre ou reinicie a sessão atual antes de trocar de atividade.');return}
  setReadingId(book.id);setFocusContext(ctx);
  if(!hasSession){setPlannedId(undefined);setDuration(prefs.focus);setSeconds(mode==='Livre'?0:prefs.focus)}
  navigate('focus');
 }
 useLayoutEffect(()=>{
  const keydown=(event:KeyboardEvent)=>{
   if(event.defaultPrevented||event.repeat||event.isComposing)return;
   if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='k'){
    if(document.querySelector('dialog[open]')&&!showCommands)return;
    event.preventDefault();setShowCommands(v=>!v);
   }
  };
  window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
 },[showCommands]);
 function openCompact(){if(editing){setMessage('Salve ou cancele a edição antes de abrir o foco compacto.');return}setCompact(true);if(view==='focus')setView('today')}
 function openQuickTask(){if(!editing&&requireWriter())setShowQuickTask(true)}
 function openQuickNote(){if(!editing&&requireWriter()){setNoteDraft(notes);setShowNotes(true)}}
 const quickActions:QuickAction[]=[
  ...navigation.map(n=>({id:n.id,title:'Abrir '+n.title,description:'Navegar para '+n.title.toLocaleLowerCase('pt-BR'),icon:<n.icon size={18}/>,disabled:editing,run:()=>navigate(n.id)})),
  {id:'focus',title:'Abrir modo de foco',description:'Tela imersiva da atividade atual',icon:<Timer size={18}/>,disabled:editing,run:()=>navigate('focus')},
  {id:'compact',title:'Abrir foco compacto',description:'Mini temporizador compartilhado',keywords:'mini janela pomodoro',icon:<Maximize2 size={18}/>,disabled:editing,run:openCompact},
  {id:'timer',title:running?'Pausar sessão':'Iniciar sessão',description:focusContext.title,keywords:'pomodoro timer',icon:running?<Pause size={18}/>:<Play size={18}/>,disabled:editing,run:toggle},
  {id:'quick-task',title:'Nova tarefa',description:'Adicionar sem sair da tela atual',icon:<Plus size={18}/>,disabled:editing||!tabs.canWrite,run:openQuickTask},
  {id:'quick-note',title:'Nota rápida',description:'Capturar uma ideia',icon:<Layers size={18}/>,disabled:editing||!tabs.canWrite,run:openQuickNote},
  {id:'edit',title:'Editar painel',description:'Adicionar, mover ou redimensionar widgets',icon:<LayoutGrid size={18}/>,disabled:editing,run:()=>{setCompact(false);startEdit()}},
  {id:'distraction-shield',title:'Não Perturbe',description:'Silenciar distrações pelo dispositivo ou Atalho',icon:<Moon size={18}/>,disabled:editing,run:()=>setShowShield(true)},
  {id:'notifications',title:'Abrir notificações',description:'Veja os últimos avisos',icon:<Bell size={18}/>,run:()=>setShowNotifications(true)},
  {id:'focus-context',title:'Escolher atividade',description:'Selecionar tarefa, livro ou categoria para o foco',icon:<Layers size={18}/>,disabled:editing||hasSession,run:()=>setShowFocusPicker(true)},
  {id:'focus-rhythms',title:'Ritmos de foco',description:'Escolher um preset de concentração',icon:<Timer size={18}/>,disabled:editing||hasSession||!tabs.canWrite,run:()=>setShowPresets(true)},
  {id:'focus-prefs',title:'Configurar sessão de foco',description:'Durações, pausas e ciclos',icon:<Settings size={18}/>,disabled:editing,run:()=>setShowFocusSettings(true)},
  {id:'theme',title:'Alternar tema',description:'Mudar entre claro e escuro',icon:<Sun size={18}/>,run:()=>updateAppearance({...appearance,theme:document.documentElement.dataset.theme==='dark'?'light':'dark'})},
 ];
 const summaryTask=sessionSummary?.context.kind==='task'?tasks.find(t=>String(t.id)===sessionSummary.context.id):undefined;
 function summaryPanel(){if(!sessionSummary)return null;return <FocusSummary summary={sessionSummary} task={summaryTask} canWrite={tabs.canWrite} phase={phase} running={running} canStartBreak={phase!=='focus'&&!running} canUpdateReading={!!readingBook&&sessionSummary.context.kind==='reading'&&sessionSummary.context.id===readingId} onDismiss={()=>setSessionSummary(null)} onTask={()=>{if(requireWriter()&&summaryTask)setTasks(old=>old.map(t=>t.id===summaryTask.id?completeTask(t,true):t))}} onBreak={()=>{if(phase!=='focus'&&!running)toggle()}} onReading={()=>{if(requireWriter()){setPageInput(String(page));setShowProgress(true)}}}/>}
 const contextCategory=focusContext.kind==='reading'?(categories.find(c=>c.id==='reading')??categories[0]):categories.find(c=>c.id===focusContext.categoryId)??categories[0];
 function reading(){if(!readingBook)return <div className="widget-empty-state"><BookOpen size={24}/><b>Nenhum livro na biblioteca</b><Button variant="secondary" size="sm" onClick={()=>navigate('activities','books')}>Adicionar livro</Button></div>;return <div className="reading-body"><Cover title={readingBook.title} coverStyle={readingBook.metadata?.coverStyle}/><div className="book-info"><b>{readingBook.title}</b><small>{readingBook.author}</small><Progress value={pct} label={'Progresso de leitura: '+readingBook.title}/><small><strong>Pág. {page}</strong> de {readingBook.pages} · {pct}%</small><Button className="widget-quiet-action" variant="soft" size="sm" disabled={!tabs.canWrite} onClick={()=>openReading(readingBook)}><Play size={13}/> Continuar leitura</Button></div></div>}
 function player(){return <div className="music-body"><Cover album/><div className="music-info"><div className="track-details"><b>{['Deep Focus','Quiet Morning','Evening Flow'][track]}</b><small>Lo-Fi Essentials · Spotify (demo)</small></div><div className="player-controls"><button aria-label="Anterior" onClick={()=>setTrack(t=>(t+2)%3)}><SkipBack size={17} fill="currentColor"/></button><button className="circle-button primary" aria-label={music?'Pausar música':'Reproduzir música'} onClick={()=>setMusic(m=>!m)}>{music?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}</button><button aria-label="Próxima música" onClick={()=>setTrack(t=>(t+1)%3)}><SkipForward size={17} fill="currentColor"/></button><button aria-label="Favoritar" aria-pressed={favorite} onClick={()=>setFavorite(f=>!f)}><Heart size={17} fill={favorite?'currentColor':'none'}/></button></div><Progress value={music?42:35} label="Progresso da música simulada"/></div></div>}
 function widgetContent(type:WidgetType,options:WidgetOptions={}){
  switch(type){
   case 'focus':return <div className="focus-widget"><Ring seconds={seconds} total={duration} label={timerLabel}/><div className="focus-controls"><button className="activity-tag" title="Escolher atividade" aria-label="Escolher atividade" disabled={hasSession||!tabs.canWrite} onClick={()=>setShowFocusPicker(true)}>{focusContext.kind==='reading'?<BookOpen size={14}/>:<Layers size={14}/>} {focusContext.title}</button><Segment value={mode} onChange={setMethod} disabled={hasSession||!tabs.canWrite}/><small>{mode==='Livre'?'Foco livre':'Ciclos: '+cycle+' / '+prefs.cycles}</small><div className="focus-start"><button className="primary timer-start" disabled={!tabs.canWrite} aria-label={running?'Pausar foco':'Iniciar foco'} onClick={toggle}>{running?<Pause size={16} fill="currentColor"/>:<Play size={16} fill="currentColor"/>}<span>{running?'Pausar foco':'Iniciar foco'}</span></button><button className="outline icon-btn" title="Configurar sessão de foco" aria-label="Configurar sessão de foco" onClick={()=>setShowFocusSettings(true)}><Settings size={15}/></button></div></div></div>;
   case 'agenda':return <AgendaRows limit={options.rows??3}/>;
   case 'tasks':return <DashboardTasks tasks={tasks} rows={options.rows??3} onlyPriorities={options.onlyPriorities===true} readOnly={!tabs.canWrite} onComplete={(id,done)=>{if(requireWriter())setTasks(old=>old.map(t=>t.id===id?completeTask(t,done):t))}} onPriority={id=>{if(requireWriter())setTasks(old=>toggleTaskPriority(old,id))}} onFocus={task=>{const ctx=taskContext(task,categories);if(ctx)openContext(ctx)}} onAll={()=>navigate('activities','tasks')} onAdd={openQuickTask}/>;
   case 'reading':return reading();
   case 'goal':return <div className="goal-body"><div className="gauge"><svg viewBox="0 0 140 80"><path d="M12 70 A58 58 0 0 1 128 70" fill="none" stroke="#e5ded8" strokeWidth="8" strokeLinecap="round"/><path d="M12 70 A58 58 0 0 1 128 70" fill="none" className="goal-chart-progress" stroke="var(--accent)" strokeWidth="8" pathLength="100" strokeDasharray="100 100" strokeDashoffset={100-Math.min(100,todaySeconds/(prefs.goal*60)*100)} strokeLinecap="round"/></svg><div><strong>{durationLabel(todaySeconds)}</strong><small>de {prefs.goal%60===0?prefs.goal/60+' horas':prefs.goal+' min'}</small></div></div><footer><span><Timer size={13}/> {todayRecords.length} sessões</span><span><Flame size={13} color="#df702c"/> {streak(records)} dias seguidos</span></footer></div>;
   case 'music':return player();
   case 'summary':return <div className="summary-body"><div><strong>{durationLabel(todaySeconds)} {changePercent!==null&&<em>{changePercent>=0?'+':''}{changePercent}%</em>}</strong><small>{summaryPoint?summaryPoint.day.slice(8)+'/'+summaryPoint.day.slice(5,7)+' · '+durationLabel(summaryPoint.seconds)+' · '+summaryPoint.count+' sessão(ões)':'de foco · vs. ontem'}</small></div><MiniTrend days={lastWeek.slice(-(options.days??5))} onSelect={setSummaryPoint}/></div>;
   case 'notes':return <div className="notes-preview"><p>{notes||'Escreva uma nota rápida…'}</p><Button className="widget-quiet-action" variant="soft" size="sm" disabled={!tabs.canWrite} onClick={()=>{setNoteDraft(notes);setShowNotes(true)}}>Editar nota</Button></div>;
   case 'next':return <AgendaRows single/>;
   case 'recent':return !records.length?<div className="widget-empty-state"><Timer size={23}/><b>Nenhuma sessão ainda</b><Button variant="secondary" size="sm" onClick={()=>navigate('focus')}>Preparar foco</Button></div>:<div className="recent-preview">{newest(records).slice(0,options.rows??3).map(r=><div key={r.id}><span>{r.title}</span><small>{durationLabel(r.seconds)}</small></div>)}</div>;
  }
 }
 function renderWidget(w:Widget){const Icon=icons[w.type];return <div key={w.id} data-widget={w.type} data-size={w.size} data-placement={freeGrid&&w.placement?JSON.stringify(w.placement):undefined} style={freeGrid&&w.placement?gridStyle(w.placement):undefined} className={'widget '+w.size+' '+(editing&&selected===w.id?'is-selected':'')+(gesture.preview?.id===w.id?' grid-active':'')} onClick={()=>{if(editing&&selected!==w.id){setSelected(w.id);setOpenMenu(null)}}} onDragOver={e=>editing&&!freeGrid&&e.preventDefault()} onDrop={e=>{if(!editing||freeGrid)return;e.preventDefault();setOpenMenu(null);const from=e.dataTransfer.getData('text/plain');setDraft(old=>old?move(old,from,w.id).map(w=>({...w,placement:undefined})):old)}}>
 <Card title={w.type==='tasks'?'Tarefas ('+tasks.filter(t=>!t.done).length+')':editing&&w.type==='goal'?'Meta diária':titles[w.type]} icon={Icon} provider={w.type==='music'?'spotify':undefined} actions={editing?<EditCardToolbar title={titles[w.type]} open={openMenu===w.id} size={w.size} onOpen={()=>{setSelected(w.id);setOpenMenu(v=>v===w.id?null:w.id)}} onClose={()=>setOpenMenu(null)} onDragStart={e=>{setSelected(w.id);setOpenMenu(null);e.dataTransfer.setData('text/plain',w.id);e.dataTransfer.effectAllowed='move'}} onPointerMoveStart={freeGrid?e=>{setSelected(w.id);setOpenMenu(null);gesture.begin(e,w,'move')}:undefined} onNudge={freeGrid?(dx,dy)=>nudge(w.id,dx,dy):undefined} onMove={delta=>shift(w.id,delta)} onResize={size=>resize(w.id,size)} onRemove={()=>remove(w.id)} onConfigure={hasWidgetOptions(w)?()=>{setOpenMenu(null);setWidgetOptionsId(w.id)}:undefined} canMoveUp={freeGrid?!!w.placement&&w.placement.y>0:widgets[0]?.id!==w.id} canMoveDown={freeGrid?true:widgets[widgets.length-1]?.id!==w.id}/>:w.type==='focus'?<button className="card-icon-action" aria-label="Abrir sessão de foco" onClick={()=>navigate('focus')}><Maximize2 size={15}/></button>:w.type==='agenda'?<button className="card-icon-action" aria-label="Abrir agenda" onClick={()=>navigate('calendar')}><ChevronRight size={17}/></button>:w.type==='tasks'?<span className="dashboard-card-actions"><button className="card-icon-action" aria-label="Adicionar tarefa rápida" title="Adicionar tarefa" disabled={!tabs.canWrite} onClick={openQuickTask}><Plus size={17}/></button><button className="card-icon-action" aria-label="Abrir todas as tarefas" onClick={()=>navigate('activities','tasks')}><ChevronRight size={17}/></button></span>:(w.type==='goal'||w.type==='summary'||w.type==='recent')?<button className="card-icon-action" aria-label={'Abrir histórico · '+titles[w.type]} onClick={()=>navigate('history')}><ChevronRight size={17}/></button>:w.type==='reading'?<button className="card-icon-action" aria-label="Abrir atividades de leitura" onClick={()=>navigate('activities','books')}><ChevronRight size={17}/></button>:undefined}>
 <div ref={el=>{if(el)el.inert=editing}} aria-hidden={editing?true:undefined} className={editing?'preview-content':''}>{editing?<EditPreview type={w.type} seconds={seconds} duration={duration} mode={mode} page={page} book={readingBook} focusTitle={focusContext.title} focusLabel={timerLabel} tasks={dashboardTasks(tasks).filter(t=>!w.options?.onlyPriorities||t.priority).slice(0,w.options?.rows??3)} track={['Deep Focus','Quiet Morning','Evening Flow'][track]} running={running} music={music}>{widgetContent(w.type,w.options)}</EditPreview>:widgetContent(w.type,w.options)}</div>
 </Card>{editing&&selected===w.id&&<><button className="resize-handle" aria-label={'Redimensionar '+titles[w.type]} onPointerDown={e=>freeGrid?gesture.begin(e,w,'resize'):beginResize(e,w.id,w.size)} onKeyDown={e=>{const offsets:Record<string,[number,number]>={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};const d=offsets[e.key];if(!d)return;e.preventDefault();if(freeGrid)nudge(w.id,...d,true);else if(d[0])resize(w.id,sizes[Math.max(0,Math.min(2,sizes.indexOf(w.size)+d[0]))])}}/><span className="selection-handle handle-tl"/><span className="selection-handle handle-tm"/><span className="selection-handle handle-tr"/><span className="selection-handle handle-ml"/>{freeGrid?<button className="selection-handle handle-mr axis-handle" aria-label={'Alterar largura de '+titles[w.type]} onPointerDown={e=>gesture.begin(e,w,'width')} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();nudge(w.id,e.key==='ArrowRight'?1:-1,0,true)}}}/>:<span className="selection-handle handle-mr"/>}<span className="selection-handle handle-bl"/>{freeGrid?<button className="selection-handle handle-bm axis-handle" aria-label={'Alterar altura de '+titles[w.type]} onPointerDown={e=>gesture.begin(e,w,'height')} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();nudge(w.id,0,e.key==='ArrowDown'?1:-1,true)}}}/>:<span className="selection-handle handle-bm"/>}</>}</div>}
 function mobileEditor(){const current=widgets.find(w=>w.id===selected);return <section className="mobile-layout"><h3>Seus widgets ({widgets.length})</h3>{widgets.map(w=>{const Icon=icons[w.type];return <div className={'mobile-widget-row '+(selected===w.id?'chosen':'')} key={w.id} data-widget={w.type}><button className="mobile-widget-name" aria-pressed={selected===w.id} onClick={()=>setSelected(w.id)}>{w.type==='music'?<ProviderIcon provider="spotify" size={16}/>:<Icon size={16} strokeWidth={1.8}/>}<span className="mobile-widget-title">{titles[w.type]}</span><small>{w.size==='small'?'1 × 1':w.size==='medium'?'2 × 1':'2 × 2'}</small></button><EditIconButton label={'Mover acima '+titles[w.type]} icon={ChevronUp} disabled={widgets[0]?.id===w.id} onClick={()=>shift(w.id,-1)}/><EditIconButton label={'Mover abaixo '+titles[w.type]} icon={ChevronDown} disabled={widgets[widgets.length-1]?.id===w.id} onClick={()=>shift(w.id,1)}/><EditIconButton label={'Remover '+titles[w.type]} icon={X} onClick={()=>remove(w.id)}/></div>})}{current&&<><h3>Tamanho · {titles[current.type]}</h3><WidgetSizeOptions value={current.size} onChange={size=>resize(current.id,size)} visual/>{hasWidgetOptions(current)&&<Button variant="secondary" onClick={()=>setWidgetOptionsId(current.id)}>Configurar widget</Button>}</>}</section>}
 function cataloguePanel(){return <aside className="catalogue"><header><h3>Adicionar widgets</h3><EditIconButton label="Fechar catálogo" icon={X} className="mobile-only" onClick={()=>setShowCatalogue(false)}/></header><SearchField label="Buscar widgets" placeholder="Buscar widgets..." value={query} onValueChange={setQuery} inputClassName="search" type="text"/>{catalogue.filter(c=>c.title.toLowerCase().includes(query.toLowerCase())).map(c=>{const Icon=icons[c.type];const exists=draft?.some(w=>w.type===c.type);return <button className="catalogue-item" key={c.type} disabled={exists} draggable={freeGrid&&!exists} onDragStart={e=>startCatalogueDrag(e,c.type)} onDragEnd={()=>{catalogueDrag.current=null;setCataloguePreview(null)}} onClick={()=>add(c.type)}>{c.type==='music'?<ProviderIcon provider="spotify" size={20}/>:<Icon size={18} strokeWidth={1.8}/>}<span><b>{c.title}</b><small>{c.description}</small></span>{exists?<Check size={15}/>:<Plus size={17}/>}</button>})}</aside>}
 return <div className={'app '+(view==='focus'?'immersive':'')+(compact&&!editing?' with-compact-focus':'')}>
 <a className="skip-content" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus()}}>Ir para o conteúdo</a>
 {view!=='focus'&&<aside className="sidebar"><Brand/><nav aria-label="Navegação principal">{navigation.map(n=><button key={n.id} aria-current={view===n.id||editing&&n.id==='today'?'page':undefined} className={view===n.id||editing&&n.id==='today'?'active':''} onClick={()=>navigate(n.id)}><n.icon size={18} strokeWidth={1.8}/>{n.title}</button>)}</nav><div className="connection"><span><i/> {profile==='google-demo'?'Perfil Google (demo)':'Dados de demonstração'}</span><ProviderLabel provider="google-calendar" size={16}/><ProviderLabel provider="outlook" size={16}/></div></aside>}
 <main id="main-content" tabIndex={-1} className={"main "+(view==='focus'?'focus-main':'workspace-main')}>
 {view==='focus'?<><header className="focus-top"><div className="focus-header-leading"><button className="ui-icon-button" onClick={()=>setView('today')} aria-label="Voltar"><ArrowLeft size={19}/></button><Brand/></div><h1 className="focus-breadcrumb">{focusContext.kind==='reading'?<BookOpen size={16}/>:<Layers size={16}/>}<span>{focusContext.label}<span className="desktop-focus-title"> · {focusContext.title}</span></span></h1><div className="focus-header-trailing"><button type="button" className="ui-icon-button zen-toggle" aria-label="Modo Zen" title={zen?'Sair do modo Zen':'Modo Zen'} aria-pressed={zen} onClick={()=>setZen(v=>!v)}>{zen?<Eye size={18}/>:<EyeOff size={18}/>}</button><button className="ui-icon-button" aria-label="Abrir foco compacto" title="Foco compacto" onClick={openCompact}><Minimize2 size={18}/></button><button className="ui-icon-button" onClick={()=>setView('today')} aria-label="Fechar foco"><X size={21}/></button></div></header><TabIndicator tabs={tabs}/><div className={'immersive-grid route-enter'+(zen?' zen-mode':'')} data-route="focus">{focusContext.kind==='reading'&&readingBook?<div className="book-panel"><Cover title={readingBook.title} coverStyle={readingBook.metadata?.coverStyle}/><h2>{readingBook.title}</h2><p>{readingBook.author}</p><Progress value={pct} label={'Progresso de leitura: '+readingBook.title}/><small>Pág. {page} de {readingBook.pages} · {pct}%</small><Button variant="secondary" disabled={!tabs.canWrite} onClick={()=>{setPageInput(String(page));setShowProgress(true)}}>Atualizar progresso</Button></div>:<div className="focus-activity-panel"><CategoryMark category={contextCategory}/><small>{focusContext.kind==='task'?'Tarefa':'Atividade'} · {contextCategory.name}</small><h2>{focusContext.title}</h2><p>Concentre-se em uma atividade por vez.</p>{focusContext.kind==='task'&&<label className="focus-task-check"><input type="checkbox" checked={tasks.some(t=>String(t.id)===focusContext.id&&t.done)} disabled={!tabs.canWrite} onChange={e=>setTasks(old=>old.map(t=>String(t.id)===focusContext.id?completeTask(t,e.target.checked):t))}/> Marcar tarefa como concluída</label>}<Button variant="secondary" onClick={()=>navigate('activities')}>Ver atividades</Button></div>}<div className="focus-center">{plannedId&&<small className="planned-focus-label"><CalendarDays size={14}/> Bloco planejado · {duration/60} min</small>}<button className="focus-context-picker" disabled={hasSession||!tabs.canWrite} aria-label="Escolher atividade" onClick={()=>setShowFocusPicker(true)}><span>{focusContext.kind==='reading'?<BookOpen size={17}/>:<Layers size={17}/>}</span><span><small>Atividade atual</small><b>{focusContext.title}</b></span><ChevronDown size={17}/></button><Segment value={mode} onChange={setMethod} disabled={hasSession||!tabs.canWrite}/><Ring seconds={seconds} total={duration} large label={timerLabel} cycleLabel={mode==='Livre'?'Foco livre':phase==='focus'?'Ciclo '+Math.min(cycle+1,prefs.cycles)+' de '+prefs.cycles:phaseName(phase)}/><Transport disabled={!tabs.canWrite} running={running} onToggle={toggle} onReset={requestReset} onStop={stop}/><div className="immersive-actions"><Button variant="secondary" size="sm" disabled={hasSession||!tabs.canWrite} aria-label="Ritmos de foco" onClick={()=>setShowPresets(true)}><Timer size={16}/> Ritmos</Button><Button variant="secondary" size="sm" aria-label="Configurar sessão de foco" onClick={()=>setShowFocusSettings(true)}><Settings size={16}/><span className="focus-action-desktop">Configurar sessão de foco</span><span className="focus-action-mobile" aria-hidden="true">Ajustes</span></Button><Button variant="secondary" size="sm" onClick={()=>setShowShield(true)}><Moon size={16}/> Não Perturbe</Button></div></div><aside className="focus-side"><Card title="Próximo compromisso" icon={CalendarDays}><AgendaRows single/></Card><Card title="Música · Spotify (demo)" icon={Music2} provider="spotify">{player()}<label className="volume"><Volume2 size={16}/><input type="range" min="0" max="100" value={volume} onChange={e=>setVolume(Number(e.target.value))} aria-label="Volume simulado"/></label></Card></aside></div>{summaryPanel()}<FocusLandscape scene={normalizeScene(appearance.scene)}/></>:<>
 <OfflineIndicator offline={offline}/><TabIndicator tabs={tabs}/>
 <MobileMasthead notification={<div className="quick-header-actions"><QuickActionButton onClick={()=>setShowCommands(true)}/><NotificationBell unread={notifications.unread} onClick={()=>setShowNotifications(true)}/></div>}/>
 <PageHeader notification={!editing?<div className="quick-header-actions"><QuickActionButton onClick={()=>setShowCommands(true)}/><NotificationBell unread={notifications.unread} onClick={()=>setShowNotifications(true)}/></div>:undefined} title={editing?'Editar painel':view==='today'?'Meu dia':navigation.find(n=>n.id===view)?.title??''}
 subtitle={editing?'Personalize seu painel com widgets, tamanhos e posição.':view==='today'?fixtureDate+' · demonstração':view==='calendar'?'Organize seus compromissos.':view==='activities'?'Acompanhe suas atividades e leituras.':view==='history'?'Acompanhe seu tempo de concentração.':'Personalize sua experiência.'}
 editing={editing}
 actions={view==='today'?<div className="head-actions"><button className="ui-icon-button" aria-label="Alternar tema claro ou escuro" onClick={()=>updateAppearance({...appearance,theme:document.documentElement.dataset.theme==='dark'?'light':'dark'})}>{appearance.theme==='dark'?<Moon size={18}/>:<Sun size={18}/>}</button><button className="outline page-action" onClick={startEdit}><LayoutGrid size={16}/> Editar painel</button></div>:editing?<div className="head-actions edit-header"><EditTextButton onClick={()=>{setDraft(editKey==='desktop'?resolveLayout(defaultLayout()):defaultLayout(true));setSelected('focus');setOpenMenu(null)}}><RotateCcw size={15}/> Restaurar layout</EditTextButton><EditTextButton onClick={()=>closeEdit(false)}>Cancelar</EditTextButton><EditTextButton variant="primary" onClick={()=>closeEdit(true)}>Salvar painel</EditTextButton></div>:undefined}/>
 {editing&&<EditorControls target={editKey} canUndo={editHistory.canUndo&&!activePreview} canRedo={editHistory.canRedo&&!activePreview} onUndo={undoLayout} onRedo={redoLayout} onPresets={()=>setShowLayoutPresets(true)} onOptions={()=>setWidgetOptionsId(selected)} selected={draft?.find(w=>w.id===selected)}/>}
 {editing&&<div className="mobile-edit-tabs segment"><button aria-pressed={!showCatalogue} className={!showCatalogue?"selected":""} onClick={()=>setShowCatalogue(false)}>Seus widgets</button><button aria-pressed={showCatalogue} className={showCatalogue?"selected":""} onClick={()=>setShowCatalogue(true)}><Plus size={15}/> Adicionar</button></div>}
 {editing&&freeGrid&&<div className="grid-tools"><span className="grid-tools-hint"><LayoutGrid size={15}/> Grade de 12 colunas</span><ToggleCard title="Deslocar vizinhos" compact checked={pushNeighbors} onChange={setPushNeighbors}/><EditTextButton className="compact-grid-button" onClick={compactGrid}><Layers size={15}/> Compactar espaços</EditTextButton></div>}
 {view==='today'&&summaryPanel()}
 {(view==='today'||editing)&&<div key={'workspace-'+view} className={'workspace workspace-enter '+(editing?'editing':'')} data-route={view}>{editing&&mobile?(!showCatalogue&&mobileEditor()):<div ref={gesture.gridRef} className={'widget-grid '+(freeGrid?'coordinate-grid ':'')+(activePreview?'grid-gesturing':'')} onDragOver={previewCatalogue} onDrop={dropCatalogue} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setCataloguePreview(null)}}>{widgets.map(renderWidget)}{activePreview&&freeGrid&&<GridGhost preview={activePreview}/>}{editing&&<AddWidgetTile style={addPlacement?gridStyle(addPlacement):freeGrid?{gridColumn:'1 / -1',gridRow:(endRow(widgets)+1)+' / span 3'}:undefined} onClick={()=>{setShowCatalogue(true);document.querySelector<HTMLInputElement>('.search')?.focus()}}/>}{!widgets.length&&!editing&&<div className="empty">Seu painel está vazio. <button className="primary" onClick={startEdit}>Adicionar widgets</button></div>}</div>}{editing&&<div className={'catalogue-wrap '+(showCatalogue?'visible':'')}>{cataloguePanel()}</div>}</div>}
 <div key={'route-'+view} className="route-content route-enter" data-route={view==='today'||editing?undefined:view} hidden={view==='today'||editing}>
 {view==='calendar'&&<CalendarPage blocks={blocks} tasks={tasks} categories={categories} books={books} records={records} preferredMinutes={prefs.focus/60} initialTask={planTask} readOnly={!tabs.canWrite} activePlanId={plannedId} onSave={saveBlock} onRemove={id=>{if(requireWriter()&&id!==plannedId)setBlocks(old=>old.filter(b=>b.id!==id))}} onPrepare={prepareBlock}/>}
 {view==='activities'&&<ActivitiesPage key={activityTab} initialTab={activityTab} readOnly={!tabs.canWrite} categories={categories} tasks={tasks} books={books} onCategories={next=>{if(requireWriter())setCategories(next)}} onTasks={next=>{if(requireWriter())setTasks(next)}} onBooks={next=>{if(requireWriter()){setBooks(next);if(!readingId&&next[0])setReadingId(next[0].id)}}} records={records} onPlan={task=>{if(requireWriter()){navigate('calendar');setPlanTask(task.id)}}} onFocus={openContext} onReading={openReading}/>}
 {view==='history'&&<HistoryPage records={records} goal={prefs.goal} mobile={mobile} onPrepare={()=>navigate('focus')}/>}
 {view==='settings'&&<SettingsPage section={settingsSection} mobile={mobile} detail={mobileSettingsDetail} onSection={section=>{setSettingsSection(section);setMobileSettingsDetail(true)}} onBack={()=>setMobileSettingsDetail(false)} summaries={{focus:prefs.focus/60+' min de foco · '+prefs.short/60+' min de pausa',notifications:notifications.quietActive?'Horário silencioso ativo':(notifications.prefs.focus||notifications.prefs.breaks)?'Avisos de sessão ativos':'Avisos de sessão desativados',appearance:({light:'Tema claro',dark:'Tema escuro',system:'Tema do sistema'})[appearance.theme],integrations:connections.length?connections.length+' conexão(ões) de demonstração':'Nenhum serviço conectado',profile:profile==='google-demo'?'Perfil Google (demo)':'Modo visitante'}}>{settingsSection==='focus'&&<section className="settings-surface"><header className="settings-section-header"><Settings size={20}/><div><h2>Sessões de foco</h2><p>Personalize seu ritmo de concentração e descanso.</p></div></header><FocusSettings prefs={prefs} onChange={changePreferences} disabled={hasSession||!tabs.canWrite} wakeStatus={wakeStatus}/></section>}{settingsSection==='notifications'&&<NotificationSettings notifications={notifications} shield={shield} onShield={()=>setShowShield(true)}/>}{settingsSection==='integrations'&&<IntegrationPanel connections={connections} onChange={changeConnections}/>}{settingsSection==='appearance'&&<AppearancePanel appearance={appearance} onChange={updateAppearance}/>}{settingsSection==='profile'&&<section className="settings-surface"><header className="settings-section-header"><LayoutGrid size={20}/><div><h2>Perfil e personalização</h2><p>{profile==='google-demo'?'Perfil Google fictício':'Modo visitante'} · somente neste navegador.</p></div></header><div className="settings-action-group"><Button variant="secondary" disabled={hasSession||!tabs.canWrite} onClick={()=>setShowOnboarding(true)}>Refazer onboarding</Button><Button variant="secondary" onClick={()=>{const next={desktop:defaultLayout(),mobile:defaultLayout(true)};try{localStorage.setItem(STORAGE,JSON.stringify(next));setLayouts(next);setMessage('Layouts restaurados.')}catch{setMessage('Não foi possível persistir.')}}}><RotateCcw size={15}/> Restaurar painéis</Button></div><OfflineSettings offline={offline}/><BackupPanel canWrite={tabs.canWrite} canRestore={tabs.canWrite&&!hasSession} records={records} onRestore={backup=>{if(!tabs.isWriter()||hasSession)throw new Error('Encerre a sessão e use a aba responsável.');restoreBackup(backup);window.location.reload()}}/><small>Atividades, sessões e preferências são salvas neste navegador. Nenhuma autenticação real.</small></section>}</SettingsPage>}
 </div>
 </>}
 </main>
 {view!=='focus'&&<nav className="bottom-nav" aria-label="Navegação principal">{navigation.map(n=><button key={n.id} aria-current={view===n.id||editing&&n.id==='today'?'page':undefined} className={view===n.id||editing&&n.id==='today'?'active':''} onClick={()=>navigate(n.id)}><n.icon size={20} strokeWidth={1.8}/><span>{n.id==='settings'?'Ajustes':n.title}</span></button>)}</nav>}
 {compact&&!editing&&<CompactFocus disabled={!tabs.canWrite} title={focusContext.title} label={timerLabel} seconds={seconds} duration={duration} running={running} free={mode==='Livre'} onToggle={toggle} onReset={requestReset} onStop={stop} onExpand={()=>{setCompact(false);navigate('focus')}} onClose={()=>setCompact(false)} onError={setMessage}/>}
 {showCommands&&<CommandPalette actions={quickActions} onDismiss={()=>setShowCommands(false)}/>}
 {showNotifications&&<NotificationCenter notifications={notifications} onDismiss={()=>setShowNotifications(false)} onSettings={()=>{setShowNotifications(false);if(!editing){setView('settings');setSettingsSection('notifications');setMobileSettingsDetail(true)}}}/>}
 {showOnboarding&&<Onboarding profile={profile} prefs={prefs} canStartEmpty={canStartEmpty} onFinish={finishOnboarding} onDismiss={skipOnboarding}/>}
 {editing&&showLayoutPresets&&<LayoutPresets target={editKey} onApply={applyLayoutPreset} onDismiss={()=>setShowLayoutPresets(false)}/>}
 {editing&&widgetOptionsId&&draft?.some(w=>w.id===widgetOptionsId)&&<WidgetPreferences widget={draft.find(w=>w.id===widgetOptionsId)!} title={titles[draft.find(w=>w.id===widgetOptionsId)!.type]} onChange={options=>updateWidgetOptions(widgetOptionsId,options)} onDismiss={()=>setWidgetOptionsId(null)}/>}
 {showPresets&&<QuickPresets prefs={prefs} disabled={hasSession||!tabs.canWrite} onChange={changePreferences} onDismiss={()=>setShowPresets(false)}/>}
 {confirmReset&&<Dialog title="Descartar sessão atual?" description="Reiniciar volta ao início e descarta o tempo deste intervalo. Para manter o tempo de foco, use Encerrar." onDismiss={()=>setConfirmReset(false)}><div className="reset-confirm-copy"><p>A contagem continua até você confirmar. Os registros anteriores serão mantidos.</p></div><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setConfirmReset(false)}>Continuar sessão</Button><Button className="discard-session-button" onClick={confirmDiscard} disabled={!tabs.canWrite}>Descartar e reiniciar</Button></footer></Dialog>}
 {showQuickTask&&<QuickTaskDialog categories={categories} canPriority={priorityCount(tasks)<MAX_PRIORITIES} onDismiss={()=>setShowQuickTask(false)} onAdd={(title,category,priority)=>{if(!requireWriter()||!categories.some(c=>c.id===category)||priority&&priorityCount(tasks)>=MAX_PRIORITIES)return false;setTasks(old=>[...old,{id:nextTaskId(old),title,categoryId:category,done:false,priority}]);setMessage('Tarefa adicionada.');return true}}/>}
 {showFocusPicker&&<FocusPicker categories={categories} tasks={tasks} books={books} current={focusContext} onChoose={chooseFocusContext} onDismiss={()=>setShowFocusPicker(false)}/>}
 {showShield&&<DistractionDialog suggestedMinutes={mode==='Livre'?prefs.focus/60:(phase==='focus'?seconds:prefs.focus)/60} onDismiss={()=>setShowShield(false)}/>}
 {showFocusSettings&&<Dialog title="Configurar sessão de foco" description="Preferências para as próximas sessões." onDismiss={()=>setShowFocusSettings(false)}><FocusSettings prefs={prefs} onChange={changePreferences} disabled={hasSession||!tabs.canWrite} wakeStatus={wakeStatus}/><footer className="dialog-actions"><Button onClick={()=>setShowFocusSettings(false)}>Concluir</Button></footer></Dialog>}
 {showNotes&&<Dialog title="Notas rápidas" description="Edite sua anotação sem rolagem dentro do widget." onDismiss={()=>setShowNotes(false)}><form className="dialog-form" onSubmit={e=>{e.preventDefault();if(!requireWriter())return;if(!writeStorage(NOTES_KEY,noteDraft)){setMessage('Não foi possível salvar a nota.');return}setNotes(noteDraft);setShowNotes(false)}}><TextareaField label="Anotação" value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} rows={6} maxLength={4000}/><footer className="dialog-actions"><Button variant="secondary" onClick={()=>setShowNotes(false)}>Cancelar</Button><Button type="submit">Salvar</Button></footer></form></Dialog>}
 {showProgress&&readingBook&&<Dialog title="Atualizar progresso" description="Registre onde você parou na leitura." onDismiss={()=>setShowProgress(false)}>
 <form className="dialog-form" onSubmit={e=>{e.preventDefault();const n=Number(pageInput);if(requireWriter()&&Number.isInteger(n)&&n>=0&&n<=readingBook.pages){setPage(n);setShowProgress(false);setMessage('Progresso atualizado.')}}}>
  <div className="dialog-book"><Cover title={readingBook.title} coverStyle={readingBook.metadata?.coverStyle}/><div><b>{readingBook.title}</b><small>{readingBook.author}</small><small>Pág. {page} de {readingBook.pages} · {pct}%</small></div></div>
  <Field label="Página atual" hint={`De 0 a ${readingBook.pages} páginas.`} suffix="pág." required type="number" min="0" max={readingBook.pages} step="1" value={pageInput} onChange={e=>setPageInput(e.target.value)}/>
  <div className="dialog-progress"><Progress label="Novo progresso de leitura" value={Math.max(0,Math.min(100,Math.round((Number(pageInput)||0)/readingBook.pages*100)))}/><small>{Math.max(0,Math.min(100,Math.round((Number(pageInput)||0)/readingBook.pages*100)))}% do livro</small></div>
  <footer className="dialog-actions"><Button variant="secondary" onClick={()=>setShowProgress(false)}>Cancelar</Button><Button type="submit">Salvar</Button></footer>
 </form>
 </Dialog>}
 {message&&<Notice message={message} onDismiss={()=>setMessage('')}/>}

 </div>
}
