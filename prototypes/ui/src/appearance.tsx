import { ToggleCard } from './ui';
import { useEffect,useState } from 'react';
import { Sun,Moon,Monitor,SlidersHorizontal } from 'lucide-react';
import { readStorage,writeStorage } from './preferences-model';
const KEY='focus-workspace:v4:appearance';
type Theme='light'|'dark'|'system';
type Motion='system'|'reduced';
export interface Appearance{theme:Theme;motion:Motion}
function load():Appearance{
 const v=readStorage(KEY) as Partial<Appearance>|null;
 return {theme:v?.theme==='dark'||v?.theme==='system'?v.theme:'light',motion:v?.motion==='reduced'?'reduced':'system'};
}
export function useAppearance(){
 const [appearance,setAppearance]=useState(load);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const apply=()=>{document.documentElement.dataset.theme=appearance.theme==='system'?(media.matches?'dark':'light'):appearance.theme;document.documentElement.dataset.motion=appearance.motion};
  apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);
 },[appearance]);
 function update(next:Appearance){setAppearance(next);writeStorage(KEY,next)}
 return {appearance,update};
}
export function AppearancePanel({appearance,onChange}:{appearance:Appearance;onChange:(v:Appearance)=>void}){
 const choices=[{id:'light',label:'Claro',Icon:Sun},{id:'dark',label:'Escuro',Icon:Moon},{id:'system',label:'Sistema',Icon:Monitor}] as const;
 return <section className="settings-surface appearance-panel"><header className="settings-section-header"><SlidersHorizontal size={20}/><div><h2>Aparência</h2><p>Escolha o tema e a intensidade das animações.</p></div></header><div className="appearance-choices" role="group" aria-label="Tema do aplicativo">{choices.map(c=><button key={c.id} aria-pressed={appearance.theme===c.id} onClick={()=>onChange({...appearance,theme:c.id})}><span className={'theme-sample theme-'+c.id}><i/><i/><i/></span><span><c.Icon size={15}/>{c.label}</span></button>)}</div><ToggleCard title="Reduzir animações" description="A preferência de acessibilidade do sistema é sempre respeitada. No iPhone, confira Ajustes → Acessibilidade → Movimento." checked={appearance.motion==='reduced'} onChange={v=>onChange({...appearance,motion:v?'reduced':'system'})}/><small>Preferências locais deste navegador.</small></section>;
}
