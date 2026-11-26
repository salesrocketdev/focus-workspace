import type { ReactNode } from 'react';
import { Timer,Bell,Palette,Link2,UserRound,ChevronRight } from 'lucide-react';
export type SettingsSection='focus'|'notifications'|'appearance'|'integrations'|'profile';
const groups=[{label:'Preferências',items:[{id:'focus',label:'Sessões de foco',Icon:Timer},{id:'notifications',label:'Notificações',Icon:Bell},{id:'appearance',label:'Aparência',Icon:Palette}]},{label:'Conta e serviços',items:[{id:'integrations',label:'Integrações',Icon:Link2},{id:'profile',label:'Perfil e painel',Icon:UserRound}]}] as const;
export function SettingsPage({section,onSection,children}:{section:SettingsSection;onSection:(s:SettingsSection)=>void;children:ReactNode}){
 const label=groups.flatMap(g=>[...g.items]).find(i=>i.id===section)?.label;
 return <div className="settings-page settings-shell"><nav className="settings-navigation" aria-label="Seções de configurações">{groups.map(g=><div className="settings-nav-group" key={g.label}><h3>{g.label}</h3>{g.items.map(({id,label,Icon})=><button key={id} type="button" aria-current={section===id?'page':undefined} onClick={()=>onSection(id)}><Icon size={17} strokeWidth={1.8}/><span>{label}</span>{section===id&&<ChevronRight size={14}/>}</button>)}</div>)}</nav><div className="settings-section-content"><div className="settings-breadcrumb"><span>Configurações</span><ChevronRight size={13}/><b>{label}</b></div><div className="settings-section-body" key={section}>{children}</div></div></div>;
}
