import { useEffect,useId,useLayoutEffect,useRef,useState,type ReactNode,type KeyboardEvent,type InputHTMLAttributes,type TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { Check,ChevronDown,Search,X } from 'lucide-react';

type Option={value:string;label:string;disabled?:boolean};
interface SelectProps {label:string;visibleLabel?:string;value?:string|number;defaultValue?:string|number;options:Option[];onValueChange?:(value:string)=>void;hint?:string;disabled?:boolean;hideLabel?:boolean;compact?:boolean;placeholder?:string}
export function SelectField({label,visibleLabel,value,defaultValue,options,onValueChange,hint,disabled=false,hideLabel=false,compact=false,placeholder='Selecionar…'}:SelectProps){
 const id=useId(),trigger=useRef<HTMLButtonElement>(null),popup=useRef<HTMLDivElement>(null);
 const [local,setLocal]=useState(String(defaultValue??options.find(o=>!o.disabled)?.value??''));
 const current=String(value??local),chosen=options.find(o=>o.value===current);
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1);
 const search=useRef({text:'',at:0});
 const enabled=options.map((o,i)=>o.disabled?-1:i).filter(i=>i>=0);
 const close=()=>setOpen(false);
 function show(last=false){if(disabled||!enabled.length)return;const index=options.findIndex(o=>o.value===current&&!o.disabled);setActive(index>=0?index:last?enabled[enabled.length-1]:enabled[0]);setOpen(true)}
 function choose(i:number){const option=options[i];if(!option||option.disabled)return;if(value===undefined)setLocal(option.value);onValueChange?.(option.value);close();trigger.current?.focus({preventScroll:true})}
 function move(delta:number){setActive(i=>{const at=enabled.indexOf(i);return enabled[Math.max(0,Math.min(enabled.length-1,at+delta))]??-1})}
 function onKeyDown(e:KeyboardEvent<HTMLButtonElement>){
  if(disabled)return;
  if(e.key==='Tab'){close();return}
  if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();close();return}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(open)move(e.key==='ArrowDown'?1:-1);else show(e.key==='ArrowUp');return}
  if(e.key==='Home'||e.key==='End'){e.preventDefault();if(!open)setOpen(true);setActive(e.key==='Home'?enabled[0]:enabled[enabled.length-1]);return}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();if(open)choose(active);else show();return}
  if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();const now=Date.now();const q=(now-search.current.at>600?'':search.current.text)+e.key.toLocaleLowerCase('pt-BR');search.current={text:q,at:now};const index=options.findIndex(o=>!o.disabled&&o.label.toLocaleLowerCase('pt-BR').startsWith(q));if(index>=0){setActive(index);setOpen(true)}}
 }
 useEffect(()=>{if(disabled)close()},[disabled]);
 useLayoutEffect(()=>{
  if(!open||!popup.current||!trigger.current)return;
  const menu=popup.current,button=trigger.current;
  // A top-layer popover stays above native dialogs and is not clipped by their scrolling content.
  menu.setAttribute('popover','manual');
  if(typeof menu.showPopover==='function')menu.showPopover();else menu.removeAttribute('popover');
  function position(){
   const rect=button.getBoundingClientRect(),viewport=window.visualViewport;
   const top=viewport?.offsetTop??0,left=viewport?.offsetLeft??0,vh=viewport?.height??window.innerHeight,vw=viewport?.width??window.innerWidth;
   const bottom=top+vh,right=left+vw;
   const width=Math.min(Math.max(rect.width,180),vw-16);
   const below=bottom-rect.bottom-8,above=rect.top-top-8;
   const up=below<Math.min(menu.scrollHeight,240)&&above>below;
   const height=Math.max(40,Math.min(280,up?above:below));
   menu.style.width=width+'px';menu.style.maxHeight=height+'px';
   menu.style.left=Math.max(left+8,Math.min(rect.left,right-width-8))+'px';
   menu.style.top=(up?Math.max(top+8,rect.top-Math.min(menu.scrollHeight,height)-6):rect.bottom+6)+'px';
   if(rect.bottom<top||rect.top>bottom)close();
  }
  position();
  const outside=(event:PointerEvent)=>{const node=event.target as Node;if(!button.contains(node)&&!menu.contains(node))close()};
  const scroll=(event:Event)=>{if(!(event.target instanceof Node)||!menu.contains(event.target))position()};
  document.addEventListener('pointerdown',outside,true);window.addEventListener('resize',position);document.addEventListener('scroll',scroll,true);window.visualViewport?.addEventListener('resize',position);window.visualViewport?.addEventListener('scroll',position);
  return()=>{document.removeEventListener('pointerdown',outside,true);window.removeEventListener('resize',position);document.removeEventListener('scroll',scroll,true);window.visualViewport?.removeEventListener('resize',position);window.visualViewport?.removeEventListener('scroll',position);if(typeof menu.hidePopover==='function'&&menu.matches(':popover-open'))menu.hidePopover()};
 },[open]);
 useEffect(()=>{if(open&&active>=0){const menu=popup.current,item=menu?.querySelector<HTMLElement>('[data-option-index="'+active+'"]');if(menu&&item){if(item.offsetTop<menu.scrollTop)menu.scrollTop=item.offsetTop;else if(item.offsetTop+item.offsetHeight>menu.scrollTop+menu.clientHeight)menu.scrollTop=item.offsetTop+item.offsetHeight-menu.clientHeight}}},[open,active]);
 const portalTarget=trigger.current?.closest('dialog')??(typeof document!=='undefined'?document.body:null);
 return <div className={'ui-field ui-select-field'+(compact?' field-compact':'')}>
  <label id={id+'-label'} htmlFor={id} className={hideLabel?'ui-sr-only':undefined}>{visibleLabel??label}</label>
  <button ref={trigger} id={id} type="button" role="combobox" aria-label={visibleLabel?label:undefined} aria-labelledby={visibleLabel?undefined:id+'-label'} aria-describedby={hint?id+'-hint':undefined} aria-expanded={open} aria-haspopup="listbox" aria-controls={open?id+'-list':undefined} aria-activedescendant={open&&active>=0?id+'-opt-'+active:undefined} className="ui-select-trigger" disabled={disabled} onClick={()=>open?close():show()} onKeyDown={onKeyDown} onBlur={close}><span className={chosen?'':'ui-placeholder'}>{chosen?.label??placeholder}</span><ChevronDown size={17} aria-hidden="true"/></button>
  {hint&&<small id={id+'-hint'}>{hint}</small>}
  {open&&portalTarget&&createPortal(<div ref={popup} id={id+'-list'} role="listbox" aria-labelledby={id+'-label'} className="ui-select-popup">{options.map((o,i)=><div key={o.value} id={id+'-opt-'+i} data-option-index={i} role="option" aria-selected={o.value===current} aria-disabled={o.disabled||undefined} className={'ui-select-option'+(active===i?' option-active':'')} onPointerMove={()=>{if(!o.disabled)setActive(i)}} onPointerDown={e=>e.preventDefault()} onClick={()=>choose(i)}><span>{o.label}</span>{o.value===current&&<Check size={16} aria-hidden="true"/>}</div>)}</div>,portalTarget)}
 </div>;
}
type FieldProps=InputHTMLAttributes<HTMLInputElement>&{label:string;hint?:string;error?:string;leading?:ReactNode;suffix?:ReactNode};
export function Field({label,hint,error,leading,suffix,id,className='',...props}:FieldProps){
 const uid=useId(),fieldId=id??uid;
 return <div className="ui-field"><label htmlFor={fieldId}>{label}{props.required&&<span className="ui-required" aria-hidden="true"/>}</label><div className="ui-input-shell">{leading&&<span className="ui-input-leading" aria-hidden="true">{leading}</span>}<input {...props} id={fieldId} className={'ui-input '+className} aria-invalid={error?true:undefined} aria-describedby={[hint?fieldId+'-hint':'',error?fieldId+'-error':''].filter(Boolean).join(' ')||undefined}/>{suffix&&<span className="ui-input-suffix" aria-hidden="true">{suffix}</span>}</div>{hint&&<small id={fieldId+'-hint'}>{hint}</small>}{error&&<small className="ui-field-error" id={fieldId+'-error'} role="alert">{error}</small>}</div>;
}
export function SearchField({label,value,onValueChange,placeholder,className='',inputClassName='',type='search'}:{label:string;value:string;onValueChange:(v:string)=>void;placeholder?:string;className?:string;inputClassName?:string;type?:'search'|'text'}){
 const ref=useRef<HTMLInputElement>(null);
 return <div className={'ui-input-shell ui-search-field '+className}><Search size={17} aria-hidden="true"/><input ref={ref} type={type} className={'ui-input '+inputClassName} aria-label={label} placeholder={placeholder} value={value} onChange={e=>onValueChange(e.target.value)}/>{value&&<button type="button" className="ui-search-clear" aria-label={'Limpar '+label.toLocaleLowerCase('pt-BR')} onClick={()=>{onValueChange('');ref.current?.focus()}}><X size={15}/></button>}</div>;
}
export function TextareaField({label,hint,id,...props}:TextareaHTMLAttributes<HTMLTextAreaElement>&{label:string;hint?:string}){
 const uid=useId(),fieldId=id??uid;
 return <div className="ui-field"><label htmlFor={fieldId}>{label}</label><textarea {...props} id={fieldId} className="ui-textarea" aria-describedby={hint?fieldId+'-hint':undefined}/>{hint&&<small id={fieldId+'-hint'}>{hint}</small>}</div>;
}
export function ToggleCard({title,description,checked,onChange,disabled=false,compact=false,icon}:{title:string;description?:string;checked:boolean;onChange:(checked:boolean)=>void;disabled?:boolean;compact?:boolean;icon?:ReactNode}){
 const id=useId();
 return <button type="button" role="switch" aria-checked={checked} aria-labelledby={id+'-title'} aria-describedby={description?id+'-desc':undefined} disabled={disabled} className={'ui-toggle-card'+(compact?' toggle-compact':'')} onClick={()=>onChange(!checked)}>{icon&&<span className="ui-toggle-icon" aria-hidden="true">{icon}</span>}<span className="ui-toggle-copy"><b id={id+'-title'}>{title}</b>{description&&<small id={id+'-desc'}>{description}</small>}</span><span className="ui-switch-track" aria-hidden="true"><i/></span></button>;
}
