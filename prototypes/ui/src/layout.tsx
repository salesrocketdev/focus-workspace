import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Brand } from './components';

export function MobileMasthead({notification}:{notification?:ReactNode}={}){
 return <div className="mobile-brand app-masthead"><Brand/>{notification??<Bell size={20} aria-hidden="true"/>}</div>;
}

export function PageHeader({title,subtitle,actions,notification,editing=false}:{title:string;subtitle:string;actions?:ReactNode;notification?:ReactNode;editing?:boolean}){
 return <header className={'page-head workspace-page-header'+(editing?' edit-page-head':'')}>
  <div className="page-heading"><h1>{title}</h1><p>{subtitle}</p></div>
  {(actions||notification)&&<div className="page-header-actions">{actions}{notification&&<div className="desktop-notification">{notification}</div>}</div>}
 </header>;
}
