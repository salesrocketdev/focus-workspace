import { useEffect, useId, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { X, Info } from 'lucide-react';

type ButtonProps=ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'soft';size?:'sm'|'md'};
export function Button({variant='primary',size='md',className='',type='button',...props}:ButtonProps){
 return <button {...props} type={type} className={['ui-button','ui-'+variant,'ui-'+size,className].join(' ')}/>;
}
export { Field, SelectField, SearchField, TextareaField, ToggleCard } from './form-controls';
export function Dialog({title,description,onDismiss,children}:{title:string;description?:string;onDismiss:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);const titleId=useId();const descId=useId();
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  el.showModal();
  const initial=el.querySelector<HTMLElement>('input:not([disabled]), [role=combobox]:not([disabled]), textarea:not([disabled])');initial?.focus({preventScroll:true});
  return()=>{if(el.open)el.close();if(previous?.isConnected)previous.focus({preventScroll:true})};
 },[]);
 return <dialog ref={ref} className="ui-dialog" aria-labelledby={titleId} aria-describedby={description?descId:undefined}
 onCancel={e=>{e.preventDefault();onDismiss()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onDismiss()}}}>
 <header className="dialog-header"><div><h2 id={titleId}>{title}</h2>{description&&<p id={descId}>{description}</p>}</div><button type="button" className="ui-icon-button" aria-label="Fechar diálogo" onClick={onDismiss}><X size={18}/></button></header>
 {children}</dialog>;
}
export function Notice({message,onDismiss}:{message:string;onDismiss:()=>void}){
 return <div className="ui-notice" role="status"><Info size={17} aria-hidden="true"/><span>{message}</span><button type="button" className="ui-icon-button" aria-label="Dispensar aviso" onClick={onDismiss}><X size={16}/></button></div>;
}
