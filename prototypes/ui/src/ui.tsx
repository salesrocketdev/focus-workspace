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
  const mobile=window.matchMedia('(max-width:759px)');
  // On touch screens opening a sheet must not automatically summon the keyboard.
  const initial=mobile.matches?el.querySelector<HTMLElement>('.dialog-header button'):el.querySelector<HTMLElement>('input:not([disabled]), [role=combobox]:not([disabled]), textarea:not([disabled])');
  if(initial)initial.setAttribute('autofocus','');
  el.showModal();initial?.focus({preventScroll:true});
  const vv=window.visualViewport;
  let frame=0;
  const sync=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    if(!el.open)return;
    const active=document.activeElement;
    const editing=active instanceof HTMLElement&&el.contains(active)&&active.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]),textarea,[contenteditable=true]');
    const layoutHeight=Math.max(window.innerHeight,document.documentElement.clientHeight);
    const visibleHeight=vv?.height??window.innerHeight;
    const offset=vv?.offsetTop??0;
    const keyboard=mobile.matches&&editing&&(!vv||vv.scale===1)&&layoutHeight-visibleHeight>100;
    el.dataset.keyboard=keyboard?'open':'closed';
    el.style.setProperty('--sheet-bottom',keyboard?Math.max(0,layoutHeight-visibleHeight-offset)+'px':'0px');
    el.style.setProperty('--sheet-height',Math.max(0,visibleHeight)+'px');
    if(keyboard&&active instanceof HTMLElement){
     const rect=active.getBoundingClientRect(),sheet=el.getBoundingClientRect();
     if(rect.bottom>Math.min(sheet.bottom,offset+visibleHeight)-16||rect.top<Math.max(sheet.top,offset)+12)active.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    }
   });
  };
  sync();vv?.addEventListener('resize',sync);vv?.addEventListener('scroll',sync);window.addEventListener('resize',sync);el.addEventListener('focusin',sync);el.addEventListener('focusout',sync);
  return()=>{cancelAnimationFrame(frame);vv?.removeEventListener('resize',sync);vv?.removeEventListener('scroll',sync);window.removeEventListener('resize',sync);el.removeEventListener('focusin',sync);el.removeEventListener('focusout',sync);initial?.removeAttribute('autofocus');if(el.open)el.close();if(previous?.isConnected)previous.focus({preventScroll:true})};
 },[]);
 return <dialog ref={ref} className="ui-dialog" aria-labelledby={titleId} aria-describedby={description?descId:undefined}
 onCancel={e=>{e.preventDefault();onDismiss()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onDismiss()}}}>
 <header className="dialog-header"><div><h2 id={titleId}>{title}</h2>{description&&<p id={descId}>{description}</p>}</div><button type="button" className="ui-icon-button" aria-label="Fechar diálogo" onClick={onDismiss}><X size={18}/></button></header>
 {children}</dialog>;
}
export function Notice({message,onDismiss}:{message:string;onDismiss:()=>void}){
 return <div className="ui-notice" role="status"><Info size={17} aria-hidden="true"/><span>{message}</span><button type="button" className="ui-icon-button" aria-label="Dispensar aviso" onClick={onDismiss}><X size={16}/></button></div>;
}
