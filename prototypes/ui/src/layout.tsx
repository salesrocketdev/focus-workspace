import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Brand } from './components';

export function MobileMasthead(){
 return <div className="mobile-brand app-masthead"><Brand/><Bell size={20} aria-hidden="true"/></div>;
}

export function PageHeader({title,subtitle,actions,editing=false}:{title:string;subtitle:string;actions?:ReactNode;editing?:boolean}){
 return <header className={'page-head workspace-page-header'+(editing?' edit-page-head':'')}>
  <div className="page-heading"><h1>{title}</h1><p>{subtitle}</p></div>
  {actions&&<div className="page-header-actions">{actions}</div>}
 </header>;
}
