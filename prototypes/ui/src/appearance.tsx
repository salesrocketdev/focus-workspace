import { Button,ToggleCard } from './ui';
import { useLayoutEffect,useState } from 'react';
import { Sun,Moon,Monitor,SlidersHorizontal,Check } from 'lucide-react';
import { readStorage,writeStorage } from './preferences-model';
import { Ring,type RingStyle } from './components';
import {scenes,normalizeScene,SceneArt,type FocusScene} from './focus-scene';
const KEY='focus-workspace:v4:appearance';
type Theme='light'|'dark'|'system';
type Motion='system'|'reduced';
const palette=[{label:'Laranja',value:'#e8752b'},{label:'Roxo',value:'#9064c4'},{label:'Azul',value:'#397dcc'},{label:'Verde',value:'#438c69'},{label:'Rosa',value:'#cc638f'},{label:'Cinza-azulado',value:'#627a91'}];
const rings=[{id:'classic',label:'Clássico',description:'Arco contínuo'},{id:'dial',label:'Marcadores',description:'Mostrador minimalista'},{id:'segmented',label:'Segmentado',description:'Blocos de progresso'},{id:'minimal',label:'Minimalista',description:'Traço fino'}] as const;
export interface Appearance{theme:Theme;motion:Motion;accent:string;ring:RingStyle;scene?:FocusScene}
const validColor=(v:unknown):v is string=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
function load():Appearance{
 const v=readStorage(KEY) as Partial<Appearance>|null;
 return {theme:v?.theme==='dark'||v?.theme==='system'?v.theme:'light',motion:v?.motion==='reduced'?'reduced':'system',accent:validColor(v?.accent)?v.accent.toLowerCase():palette[0].value,ring:rings.some(r=>r.id===v?.ring)?v!.ring!:'classic',scene:normalizeScene(v?.scene)};
}
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function mix(a:string,b:string,weight:number){const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round(v*(1-weight)+y[i]*weight).toString(16).padStart(2,'0')).join('')}
function luminance(hex:string){return rgb(hex).map(v=>{const n=v/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)}
function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function readable(color:string,background:string,toward:string){let result=color;for(let i=0;i<20&&contrast(result,background)<4.5;i++)result=mix(result,toward,.16);return result}
function applyPalette(root:HTMLElement,accent:string,dark:boolean){
 const paper=dark?'#312c29':'#fffcf9';
 const selected=mix(accent,paper,dark?.77:.90);
 const ink=readable(accent,selected,dark?'#ffffff':'#000000');
 const action=readable(accent,'#ffffff','#000000');
 const visible=readable(accent,paper,dark?'#ffffff':'#000000');
 const values:Record<string,string>={'--accent':accent,'--action':action,'--ui-action':action,'--soft':selected,'--ring-track':mix(accent,paper,dark?.72:.81),'--field-selected':selected,'--field-selected-ink':ink,'--field-selected-edge':mix(accent,paper,.48),'--field-focus':visible,'--field-halo':accent+'30','--switch-on':action,'--accent-ink':visible,'--accent-hover':mix(action,'#000000',.13)};
 Object.entries(values).forEach(([k,v])=>root.style.setProperty(k,v));
}
export function useAppearance(){
 const [appearance,setAppearance]=useState(load);
 useLayoutEffect(()=>{
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const apply=()=>{const root=document.documentElement;const dark=appearance.theme==='dark'||(appearance.theme==='system'&&media.matches);root.dataset.theme=dark?'dark':'light';root.dataset.motion=appearance.motion;root.dataset.ring=appearance.ring;root.dataset.accent=appearance.accent;applyPalette(root,appearance.accent,dark)};
  apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);
 },[appearance]);
 function update(next:Appearance){setAppearance(next);writeStorage(KEY,next)}
 return {appearance,update};
}
export function AppearancePanel({appearance,onChange}:{appearance:Appearance;onChange:(v:Appearance)=>void}){
 const choices=[{id:'light',label:'Claro',Icon:Sun},{id:'dark',label:'Escuro',Icon:Moon},{id:'system',label:'Sistema',Icon:Monitor}] as const;
 return <section className="settings-surface appearance-panel"><header className="settings-section-header"><SlidersHorizontal size={20}/><div><h2>Aparência</h2><p>Personalize as cores, o relógio, o cenário e as animações.</p></div></header>
 <section className="appearance-group"><h3>Tema</h3><div className="appearance-choices" role="group" aria-label="Tema do aplicativo">{choices.map(c=><button key={c.id} aria-pressed={appearance.theme===c.id} onClick={()=>onChange({...appearance,theme:c.id})}><span className={'theme-sample theme-'+c.id}><i/><i/><i/></span><span><c.Icon size={15}/>{c.label}</span></button>)}</div></section>
 <section className="appearance-group"><h3>Cor principal</h3><p>Escolha uma cor para os controles, destaques e temporizador.</p><div className="accent-options" role="group" aria-label="Cor principal">{palette.map(c=><button key={c.value} type="button" aria-pressed={appearance.accent===c.value} aria-label={c.label} onClick={()=>onChange({...appearance,accent:c.value})}><span className="accent-swatch" style={{background:c.value}}>{appearance.accent===c.value&&<Check size={18}/>}</span><small>{c.label}</small></button>)}</div><label className="accent-custom"><input type="color" aria-label="Cor personalizada" value={appearance.accent} onChange={e=>{if(validColor(e.target.value))onChange({...appearance,accent:e.target.value.toLowerCase()})}}/><span><b>Cor personalizada</b><small>{appearance.accent.toUpperCase()}</small></span></label></section>
 <section className="appearance-group"><h3>Círculo de foco</h3><p>Escolha o estilo do temporizador. A mudança vale para todo o aplicativo.</p><div className="ring-choices" role="group" aria-label="Estilo do círculo de foco">{rings.map(r=><button key={r.id} type="button" aria-label={r.label} aria-pressed={appearance.ring===r.id} onClick={()=>onChange({...appearance,ring:r.id})}><Ring seconds={1200} total={1800} label="" variant={r.id}/><b>{r.label}</b><small>{r.description}</small>{appearance.ring===r.id&&<Check className="ring-selected-check" size={15}/>}</button>)}</div></section>
 <section className="appearance-group"><h3>Cenário do modo foco</h3><p>Escolha a paisagem do modo expandido. As prévias usam o cenário real, sem imagens externas.</p><div className="scene-options" role="group" aria-label="Cenário do modo foco">{scenes.map(s=><button key={s.id} type="button" aria-label={s.label} aria-pressed={normalizeScene(appearance.scene)===s.id} onClick={()=>onChange({...appearance,scene:s.id})}><span className={'scene-sample scene-'+s.id}><span className="scene-sample-clock" aria-hidden="true">25:00</span><SceneArt scene={s.id}/></span><span className="scene-copy"><b>{s.label}</b><small>{s.description}</small></span>{normalizeScene(appearance.scene)===s.id&&<Check className="scene-check" size={15}/>}</button>)}</div></section>
 <section className="appearance-group"><h3>Movimento</h3><ToggleCard title="Reduzir animações" description="A preferência de acessibilidade do sistema é sempre respeitada. No iPhone, confira Ajustes → Acessibilidade → Movimento." checked={appearance.motion==='reduced'} onChange={v=>onChange({...appearance,motion:v?'reduced':'system'})}/></section>
 <Button variant="secondary" onClick={()=>onChange({...appearance,accent:palette[0].value,ring:'classic',scene:'forest'})}>Restaurar cores, círculo e cenário</Button><small>Preferências locais deste navegador.</small></section>;
}
