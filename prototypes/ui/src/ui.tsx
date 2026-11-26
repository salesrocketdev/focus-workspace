import { useEffect, useId, useRef, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { X, Info, ChevronDown } from 'lucide-react';

type ButtonProps=ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'soft';size?:'sm'|'md'};
export function Button({variant='primary',size='md',className='',type='button',...props}:ButtonProps){
 return <button {...props} type={type} className={['ui-button','ui-'+variant,'ui-'+size,className].join(' ')}/>;
}
type FieldProps=InputHTMLAttributes<HTMLInputElement>&{label:string;hint?:string};
export function Field({label,hint,id,...props}:FieldProps){
 const uid=useId();const fieldId=id??uid;
 return <div className="ui-field"><label htmlFor={fieldId}>{label}</label><input {...props} id={fieldId} className="ui-input" aria-describedby={hint?fieldId+'-hint':undefined}/>{hint&&<small id={fieldId+'-hint'}>{hint}</small>}</div>;
}
type SelectProps=SelectHTMLAttributes<HTMLSelectElement>&{label:string;hint?:string};
export function SelectField({label,hint,id,children,...props}:SelectProps){
 const uid=useId();const fieldId=id??uid;
 return <div className="ui-field"><label htmlFor={fieldId}>{label}</label><div className="ui-select"><select {...props} id={fieldId} aria-describedby={hint?fieldId+'-hint':undefined}>{children}</select><ChevronDown size={16} aria-hidden="true"/></div>{hint&&<small id={fieldId+'-hint'}>{hint}</small>}</div>;
}
export function Dialog({title,description,onDismiss,children}:{title:string;description?:string;onDismiss:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);const titleId=useId();const descId=useId();
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  el.showModal();
  const initial=el.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');initial?.focus();
  return()=>{if(el.open)el.close();if(previous?.isConnected)previous.focus()};
 },[]);
 return <dialog ref={ref} className="ui-dialog" aria-labelledby={titleId} aria-describedby={description?descId:undefined}
 onCancel={e=>{e.preventDefault();onDismiss()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onDismiss()}}}>
 <header className="dialog-header"><div><h2 id={titleId}>{title}</h2>{description&&<p id={descId}>{description}</p>}</div><button type="button" className="ui-icon-button" aria-label="Fechar diálogo" onClick={onDismiss}><X size={18}/></button></header>
 {children}</dialog>;
}
export function Notice({message,onDismiss}:{message:string;onDismiss:()=>void}){
 return <div className="ui-notice" role="status"><Info size={17} aria-hidden="true"/><span>{message}</span><button type="button" className="ui-icon-button" aria-label="Dispensar aviso" onClick={onDismiss}><X size={16}/></button></div>;
}
