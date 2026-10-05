"use client";
import {useEffect,useRef} from 'react';
import {openSheet} from '@/motion/commerce';
export function Dialog({open,onClose,children,label,className=''}:{open:boolean;onClose:()=>void;children:React.ReactNode;label:string;className?:string}){
 const ref=useRef<HTMLDialogElement>(null);const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const d=ref.current;if(!d)return;const previous=document.activeElement as HTMLElement|null;let animation:ReturnType<typeof openSheet>;
  if(open){d.showModal();document.documentElement.style.overflow='hidden';animation=openSheet(d,className.includes('drawer'));}
  else if(d.open){d.close();}
  return()=>{animation?.revert();if(d.open)d.close();document.documentElement.style.overflow='';previous?.focus()};
 },[open,className]);
 return <dialog ref={ref} className={`dialog ${className}`} aria-label={label} onCancel={e=>{e.preventDefault();close.current()}} onClick={e=>{if(e.target===ref.current)close.current()}}>{children}</dialog>
}
