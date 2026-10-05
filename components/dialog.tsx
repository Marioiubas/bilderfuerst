"use client";
// Native <dialog> with focus return, Escape/backdrop close and a short shutter entrance.
import {useEffect,useRef} from 'react';
import {openSheet,type SheetKind} from '@/motion/commerce';
export function Dialog({open,onClose,children,label,kind='default',className=''}:{open:boolean;onClose:()=>void;children:React.ReactNode;label:string;kind?:SheetKind;className?:string}){
 const ref=useRef<HTMLDialogElement>(null);const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const d=ref.current;if(!d)return;const previous=document.activeElement as HTMLElement|null;let animation:ReturnType<typeof openSheet>;
  if(open){if(!d.open)d.showModal();document.documentElement.style.overflow='hidden';animation=openSheet(d,kind);}
  else if(d.open){d.close();}
  return()=>{animation?.revert();if(d.open)d.close();document.documentElement.style.overflow='';if(open)previous?.focus()};
 },[open,kind]);
 return <dialog ref={ref} className={`dialog dialog-${kind} ${className}`} aria-label={label} onCancel={e=>{e.preventDefault();close.current()}} onClick={e=>{if(e.target===ref.current)close.current()}}>{children}</dialog>
}
