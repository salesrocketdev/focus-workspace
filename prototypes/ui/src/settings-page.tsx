import { useLayoutEffect,useRef,type ReactNode } from 'react';
import { Timer,Bell,Palette,Link2,UserRound,ChevronRight,ChevronLeft } from 'lucide-react';
export type SettingsSection='focus'|'notifications'|'appearance'|'integrations'|'profile';
const groups=[{label:'Preferências',items:[{id:'focus',label:'Sessões de foco',Icon:Timer},{id:'notifications',label:'Notificações',Icon:Bell},{id:'appearance',label:'Aparência',Icon:Palette}]},{label:'Conta e serviços',items:[{id:'integrations',label:'Integrações',Icon:Link2},{id:'profile',label:'Perfil e painel',Icon:UserRound}]}] as const;
type Props={section:SettingsSection;onSection:(s:SettingsSection)=>void;children:ReactNode;mobile?:boolean;detail?:boolean;onBack?:()=>void;summaries?:Record<SettingsSection,string>};
export function SettingsPage({section,onSection,children,mobile=false,detail=false,onBack,summaries}:Props){
 const label=groups.flatMap(g=>[...g.items]).find(i=>i.id===section)?.label;
 const back=useRef<HTMLButtonElement>(null),nav=useRef<HTMLElement>(null),last=useRef(false);
 useLayoutEffect(()=>{
  if(!mobile){last.current=false;return}
  window.scrollTo({top:0,behavior:'instant'});
  if(detail)back.current?.focus({preventScroll:true});
  else if(last.current)nav.current?.querySelector<HTMLButtonElement>('[data-section="'+section+'"]')?.focus({preventScroll:true});
  last.current=detail;
 },[mobile,detail,section]);
 if(mobile)return <div className={'settings-page settings-shell settings-mobile '+(detail?'settings-detail':'settings-index')}>
  {detail?<div className="settings-mobile-detail" key={section}><button ref={back} type="button" className="settings-back" onClick={onBack} aria-label="Voltar às configurações"><ChevronLeft size={21}/><span>Todos os ajustes</span></button><div className="settings-section-content"><div className="settings-section-body">{children}</div></div><p className="settings-local-note">As preferências são salvas neste dispositivo.</p></div>:<nav ref={nav} className="settings-navigation" aria-label="Seções de configurações">{groups.map(g=><section className="settings-nav-group" key={g.label}><h3>{g.label}</h3><div className="settings-row-group">{g.items.map(({id,label,Icon})=><button key={id} data-section={id} type="button" aria-label={label} aria-describedby={'setting-summary-'+id} onClick={()=>onSection(id)}><span className={'settings-row-icon settings-tone-'+id}><Icon size={21} strokeWidth={1.8}/></span><span className="settings-row-copy"><b>{label}</b><small id={'setting-summary-'+id}>{summaries?.[id]}</small></span><ChevronRight className="settings-row-chevron" size={19}/></button>)}</div></section>)}<p className="settings-local-note">Focora · Protótipo<br/>Preferências locais neste navegador.</p></nav>}
 </div>;
 return <div className="settings-page settings-shell"><nav className="settings-navigation" aria-label="Seções de configurações">{groups.map(g=><div className="settings-nav-group" key={g.label}><h3>{g.label}</h3>{g.items.map(({id,label,Icon})=><button key={id} type="button" aria-current={section===id?'page':undefined} onClick={()=>onSection(id)}><Icon size={17} strokeWidth={1.8}/><span>{label}</span>{section===id&&<ChevronRight size={14}/>}</button>)}</div>)}</nav><div className="settings-section-content"><div className="settings-breadcrumb"><span>Configurações</span><ChevronRight size={13}/><b>{label}</b></div><div className="settings-section-body" key={section}>{children}</div></div></div>;
}
